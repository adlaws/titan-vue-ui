<template>
    <cse-desktop-window
        title="Virtual Cameras"
        icon="camera"
        :x="600"
        :y="100"
        :width="275"
        :height="160"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <v-select
                    v-model="selectedCameraMode"
                    :items="cameraOptions"
                    item-text="text"
                    item-value="id"
                >
                    <template v-slot:selection="{ item }">
                        <cse-icon :icon="item.icon" />
                        <span class="ml-2">{{ item.text }}</span>
                    </template>
                    <template v-slot:item="{ item }">
                        <cse-icon :icon="item.icon" />
                        <span class="ml-2">{{ item.text }}</span>
                    </template>
                </v-select>
                <v-btn
                    :disabled="!selectedCameraMode"
                    @click="switchCameraMode"
                >
                    Create
                </v-btn>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import { $isInOuterra, $tWorldInterface, $tLogger } from '@/assets/js/titan/titan-utils.js';
import LatLongUtils from './latlong-utils.js';

const REFRESH_RATE = 1000.0 * (1.0 / 30.0); // try to update at 30 frames per second

// dummy values when working in a browser for testing, normally obtained from scneario camera
const DUMMY_POSITION = {x: 1, y: 2, z: 3};
const DUMMY_ORIENTATION = {w:4, x: 5, y: 6, z: 7};

export default {
    name: 'virtual-cameras',
    data()
    {
        return {
            cameraOptions:[
                { id: 'standard',     text: 'Standard Camera', icon: "mdi-camera",          disabled: false },
                { id: 'orbit',        text: 'Orbit Camera',    icon: "mdi-orbit",           disabled: false },
                { id: 'randomFlight', text: 'Random Flight',   icon: "mdi-vector-polyline", disabled: false },
            ],
            selectedCameraMode: 'standard',
            currentCameraMode: 'standard',
            cameraUpdaters:
            {
                orbit: null,
                randomFlight: null,
            },
            cameraUpdater: null,
            cameraUpdateTimeout: null,
            scenarioCamera: null,
            standardCameraDetails: null,
        };
    },
    mounted()
    {
        // cache the active scenario's camera on startup so we don't have to look
        // it up all the time
        if($isInOuterra)
            this.scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();

        // set up updater function factory methods
        this.cameraUpdaters.orbit = this.makeOrbitUpdater;
        this.cameraUpdaters.randomFlight = this.makeRandomFlightUpdater;
    },
    methods:
    {
        /**
         * Switch between camera modes
         */
        switchCameraMode()
        {
            if( this.selectedCameraMode === this.currentCameraMode )
                return; // didn't change the camera, no action required

            this.stopCameraUpdateLoop();
            this.cameraUpdateLast = null;
            this.cameraUpdater = null;
            if( this.currentCameraMode === 'standard' )
            {
                // cache the current position and orientation of the camera so that we can
                // restore it later on
                if(this.scenarioCamera !== null)
                {
                    this.standardCameraDetails = {
                        position: this.scenarioCamera.getPosition(),
                        orientation: this.scenarioCamera.getRotation()
                    };
                }
                else
                {
                    // in browser, use dummy position and orientation for testing
                    this.standardCameraDetails = {
                        position: DUMMY_POSITION,
                        orientation: DUMMY_ORIENTATION,
                    };
                }
            }

            this.currentCameraMode = this.selectedCameraMode;
            if( this.currentCameraMode === 'standard')
            {
                // restore the cached position of the standard camera
                if(this.scenarioCamera !== null)
                {
                    this.scenarioCamera.setPosition(this.standardCameraDetails.position);
                    this.scenarioCamera.setRotation(this.standardCameraDetails.orientation);
                }
                else
                {
                    // in browser
                    $tLogger.info('Restoring standard camera to ', this.standardCameraDetails);
                }
            }
            else
            {
                const cameraUpdaterFactory = this.cameraUpdaters[this.currentCameraMode];
                if(cameraUpdaterFactory)
                {
                    this.cameraUpdater = cameraUpdaterFactory();
                    this.startCameraUpdateLoop();
                }
                else
                {
                    $tLogger.warning(this.PLUGIN_NAME,`No updater for camera mode '${this.currentCamera}'.`);
                }
            }

            $tLogger.debug(`Switched to ${this.currentCameraMode} camera.`);
        },
        /**
         * Start camera updates
         */
        startCameraUpdateLoop()
        {
            this.stopCameraUpdateLoop();
            this.cameraUpdateTimeout = setTimeout(this.cameraUpdateLoop.bind(this), REFRESH_RATE);
        },
        /**
         * Stop camera updates
         */
        stopCameraUpdateLoop()
        {
            if(this.cameraUpdateTimeout!==null)
            {
                clearTimeout(this.cameraUpdateTimeout);
                this.cameraUpdateTimeout = null;
            }
        },
        /**
         * Update the camera as per the current updater function
         */
        cameraUpdateLoop()
        {
            this.stopCameraUpdateLoop();
            const now = Date.now();
            this.cameraUpdateLast = now;

            if( this.cameraUpdater !== null )
            {
                this.cameraUpdater.call(this, now);
                this.startCameraUpdateLoop();
            }
            else
            {
                this.cameraUpdateLast = null;
            }
        },
        /**
         * Utility method which creates a function to update the camera position and orientation
         * so that it orbits a point while maintaining a heading which 'looks' at the point.
         *
         * @returns a function which takes the current timestamp as an argument to update the
         *          camera along its orbit path
         */
        makeOrbitUpdater()
        {
            const orbitContext = {
                ORBIT_TIME: 60.0*1000.0, // takes 60 seconds to complete an orbit around the target location
                ORBIT_RADIUS: 2000.0,    // orbit is 2000m in radius (4000m diameter)
                ORBIT_ALTITUDE: 2000.0,  // orbit altitude is 2000m
                targetLLA: null,         // the point on the ground that the camera should look at
                targetECEF: null,        // the point on the ground that the camera should look at
                startTime: null,         // the time at which the camera started orbiting, in milliseconds
            };

            return function(tNow)
            {
                if( orbitContext.startTime === null )
                {
                    // first time around - set up a target to look at etc (use dummy position if in browser)
                    const posAGL = this.scenarioCamera !== null ? this.scenarioCamera.getPositionAGL() : DUMMY_POSITION;
                    orbitContext.targetLLA = {
                        latitude: posAGL.y,
                        longitude: posAGL.x,
                        altitude: 0.0
                    };
                    orbitContext.targetECEF = LatLongUtils.llaToEcef(orbitContext.targetLLA);
                    orbitContext.startTime = tNow;
                }

                // work out where the camera should be
                const angle = (((tNow - orbitContext.startTime) / orbitContext.ORBIT_TIME) * 360.0) % 360.0;
                const position = LatLongUtils.destinationPoint(orbitContext.targetLLA, orbitContext.ORBIT_RADIUS, angle);
                position.altitude = orbitContext.ORBIT_ALTITUDE;

                // move the camera
                if(this.scenarioCamera === null)
                {
                    // no camera - in browser
                    $tLogger.info('Orbit updates to', position);
                }
                else
                {
                    this.scenarioCamera.setLLA(position);
                    // make the camera look at the target point
                    this.scenarioCamera.setDirectionLookAtWorldAligned(orbitContext.targetECEF);
                }
            }.bind(this);
        },
        /**
         * Utility method which creates a function to update the camera position so that it flies
         * between randomly selected locations
         *
         * @returns a function which takes the current timestamp as an argument to update the
         *          camera along its random path
         */
        makeRandomFlightUpdater()
        {
            const randomFlightContext = {
                JOURNEY_TIME: 30.0 * 1000.0, // takes 10 seconds to move from start location to target location
                startLLA: null,
                startTime: null,
                deltaLLA: null,
            };

            return function(tNow)
            {
                if( randomFlightContext.startTime === null )
                {
                    // first time around - set up a start location, destination target etc (use dummy position
                    // if in browser)
                    const posAGL = this.scenarioCamera !== null ? this.scenarioCamera.getPositionAGL() : DUMMY_POSITION;
                    randomFlightContext.startLLA = {
                        latitude: posAGL.y,
                        longitude: posAGL.x,
                        altitude: this._makeRandom(100, 1000)
                    };
                    const randomHeading = this._makeRandom(0, 360);
                    const randomDistance = this._makeRandom(2000, 5000);
                    const targetLLA = LatLongUtils.destinationPoint(randomFlightContext.startLLA, randomDistance, randomHeading );
                    targetLLA.altitude = this._makeRandom(100, 1000);
                    randomFlightContext.deltaLLA = {
                        latitude: targetLLA.latitude - randomFlightContext.startLLA.latitude,
                        longitude: targetLLA.longitude - randomFlightContext.startLLA.longitude,
                        altitude: targetLLA.altitude - randomFlightContext.startLLA.altitude
                    };
                    randomFlightContext.startTime = tNow;
                }

                // work out where the camera should be
                let journeyFraction = ((tNow - randomFlightContext.startTime) / randomFlightContext.JOURNEY_TIME);
                journeyFraction = this._clamp(journeyFraction, 0.0, 1.0);
                const currentLocation = {
                    latitude: randomFlightContext.startLLA.latitude + (randomFlightContext.deltaLLA.latitude * journeyFraction),
                    longitude: randomFlightContext.startLLA.longitude + (randomFlightContext.deltaLLA.longitude * journeyFraction),
                    altitude: randomFlightContext.startLLA.altitude +  + (randomFlightContext.deltaLLA.altitude * journeyFraction)
                };

                // move the camera
                if(this.scenarioCamera === null)
                {
                    // no camera - in browser
                    $tLogger.info('Random Flight updates to', currentLocation);
                }
                else
                {
                    this.scenarioCamera.setLLA(currentLocation);
                }

                if(journeyFraction >= 1.0)
                {
                    // we've reached the destination - choose a new target
                    randomFlightContext.startLLA = {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude,
                        altitude: currentLocation.altitude
                    };
                    const randomHeading = this._makeRandom(0, 360);
                    const randomDistance = this._makeRandom(2000, 5000);
                    const targetLLA = LatLongUtils.destinationPoint(randomFlightContext.startLLA, randomDistance, randomHeading );
                    targetLLA['altitude'] = this._makeRandom(100, 1000);
                    randomFlightContext.deltaLLA = {
                        latitude: targetLLA.latitude - randomFlightContext.startLLA.latitude,
                        longitude: targetLLA.longitude - randomFlightContext.startLLA.longitude,
                        altitude: targetLLA.altitude - randomFlightContext.startLLA.altitude
                    };
                    randomFlightContext.startTime = tNow;
                }
            };
        },
        /*
         * Returns a value constrained to the range a-b
         *
         * @param value the value to be constrained
         * @param a the lowest value
         * @param b the highest value
         *
         * @return the value constrained to the range a-b
         */
        _clamp:function(value, a, b)
        {
            b = b ? b : 0.0;
            if(b > a)
                return Math.max(a, Math.min(b, value));
            return Math.max(b, Math.min(a, value));
        },
        /*
         * Returns a random value in the range a-b
         *
         * @param a the lowest value
         * @param b the highest value
         *
         * @return a random value in the range a-b
         */
        _makeRandom:function(a, b)
        {
            b = b ? b :0.0;
            if(b > a)
                return Math.random()*(b-a)+a;
            return Math.random()*(a-b)+b;
        },
    }
};
</script>