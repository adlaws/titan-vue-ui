<template>
    <div
        class="vue-os--titan-location"
        :style="`font-size:${taskbarSize*0.25}px;`"
    >
        <titan-icon icon="map-marker" class="mr-1" />
        <latitude class="monospace" :latitude="tweenedLatitude" />
        <longitude class="monospace ml-2" :longitude="tweenedLongitude" />
        <br>
        <titan-icon icon="compass" class="mr-1" />
        <heading class="monospace" :heading="tweenedMagneticHeading" />
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-8 -8 16 16"
            :width="taskbarSize*0.25"
            :height="taskbarSize*0.25"
            :style="`position:relative;top:${taskbarSize/18}px;`"
        >
            <g
                ref="compassNeedle"
                fill="white"
                stroke="white"
                stroke-linejoin="round"
                :transform="`rotate(${compassRotation})`"
            >
                <path d="M-5 6l5-3 5 3L0-6z" />
            </g>
        </svg>
    </div>
</template>

<script>
import gsap from 'gsap'; // provides tweening functions

import { $tWorldInterface, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';
import Latitude from '@/components/titan/core/display/Latitude.vue';
import Longitude from '@/components/titan/core/display/Longitude.vue';
import Heading from '@/components/titan/core/display/Heading.vue';

const DEFAULT_UPDATE_INTERVAL_MS = 125; // update every 125ms (8x per second)
const MIN_UPDATE_INTERVAL = 100; // at most update 10x per second

export default {
    name: 'titan-location',
    components:
    {
        TitanIcon, Latitude, Longitude, Heading,
    },
    props:
    {
        updateInterval:{
            type: Number,
            default: DEFAULT_UPDATE_INTERVAL_MS,
        }
    },
    data()
    {
        return {
            lla: {latitude:0.0, longitude: 0.0, altitude:0.0},
            tweenedLatitude: 0.0,
            tweenedLongitude: 0.0,
            magneticHeading: 0, // between -180.0 and 180.0
            tweenedMagneticHeading: 0,
            compassRotation: 0.0,
            tweenedCompassRotation: 0.0,
            updateIntervalMs: DEFAULT_UPDATE_INTERVAL_MS,
            updateIntervalSeconds: (DEFAULT_UPDATE_INTERVAL_MS/1000.0),
            running: false,
        };
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
    },
    watch:
    {
        updateInterval() { this.updateAllRates(); },
        magneticHeading(newHeading, oldHeading)
        {
            // this is simply to ensure that the compass needle rotates via the "shortest angular
            // distance" so that when the needle goes from, say 359° to 1°, it spins clockwise
            // through 360°, rather than counter-clockwise through 180°
            const delta = MathUtils.shortestAngleDeg(oldHeading, newHeading);
            this.compassRotation += delta;
            // ease the compass heading value to provide the illusion of continuous updates
            this.easeValue({tweenedMagneticHeading: newHeading});
        },
        lla:{
            deep: true,
            handler:function(newVal)
            {
                // ease the lat/long values to provide the illusion of continuous updates
                this.easeValue({tweenedLatitude: newVal.latitude});
                this.easeValue({tweenedLongitude: newVal.longitude});
            }
        },
    },
    mounted()
    {
        this.updateAllRates();
        // start the update cycle
        this.running = true;
        this.update();
    },
    beforeDestroy()
    {
        this.running = false;
    },
    methods:
    {
        updateAllRates()
        {
            this.updateIntervalMs = Math.max(MIN_UPDATE_INTERVAL, this.updateInterval);
            this.updateIntervalSeconds = this.updateIntervalMs/1000.0;
            // CSS easing for the rotation in sync with the update rate to make the
            // compass needle rotate smoothly
            this.$refs.compassNeedle.style.transition = `all ${this.updateIntervalSeconds}s ease-in-out`;
        },
        easeValue(params)
        {
            gsap.to(this.$data, { duration: this.updateIntervalSeconds, ease: 'power2.out', ...params });
        },
        update()
        {
            if(!this.running)
                return;

            if($isInsideTitan)
            {
                const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
                if(scenarioCamera)
                {
                    this.lla = scenarioCamera.getLLA();
                    this.magneticHeading = scenarioCamera.getMagNorthHeading(0); // between -180.0 and 180.0
                }
            }
            else
            {
                this.magneticHeading = 45.67;// MathUtils.wrapClamp(this.magneticHeading + (Math.random() * 10.0) -5, -180.0, 180.0);
                this.lla.latitude = 12.34; // MathUtils.clamp(this.lla.latitude += (Math.random() * 1.0) - 0.5, -90.0, 90.0);
                this.lla.longitude = 56.78; // MathUtils.clamp(this.lla.latitude += (Math.random() * 1.0) - 0.5, -180.0, 180.0);
                this.lla.altitude = 100.0; // MathUtils.clamp(this.lla.latitude += (Math.random() * 1.0) - 0.5, 0.0, 10000.0);
            }

            setTimeout(this.update, Math.max(MIN_UPDATE_INTERVAL, this.updateIntervalMs));
        },
    },
};
</script>
