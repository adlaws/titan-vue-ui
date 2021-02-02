<template>
    <div
        class="vue-os--cse-location"
        :style="`font-size:${taskbarSize*0.25}px;`"
    >
        <cse-icon icon="map-marker" class="mr-1" />
        <span
            @click="contextMenu.locationFormat.show = false"
            @contextmenu.prevent="showLocationFormatContextMenu"
        >
            <mgrs v-if="isMGRS" :latitude="tweenedLatitude" :longitude="tweenedLongitude" />
            <span v-else>
                <latitude class="monospace" :latitude="tweenedLatitude" />
                <longitude class="monospace ml-2" :longitude="tweenedLongitude" />
            </span>
        </span>
        <br>
        <cse-icon icon="compass" class="mr-1" />
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

        <transition name="fade" mode="out-in">
            <cse-context-menu
                v-if="contextMenu.locationFormat.show"
                :items="locationFormatContextItems"
                :x="contextMenu.locationFormat.x"
                :y="contextMenu.locationFormat.y"
                text-key="label"
                @selected="locationFormatSelection"
                @cancelled="contextMenu.locationFormat.show=false"
            />
        </transition>
    </div>
</template>

<script>
import gsap from 'gsap'; // provides tweening functions

import { POSITION_FORMAT, POSITION_FORMAT_OPTIONS, PREFERENCE_MUTATION } from '@/assets/js/store/preference-manager.js';
import { $tWorldInterface, $isInOuterra } from '@/assets/js/titan/titan-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

import Latitude from '@/components/cse/core/display/Latitude.vue';
import Longitude from '@/components/cse/core/display/Longitude.vue';
import Heading from '@/components/cse/core/display/Heading.vue';
import MGRS from '@/components/cse/core/display/MGRS.vue';
import CseContextMenu from '@/components/cse/core/CseContextMenu.vue';
import CseIcon from '@/components/cse/core/CseIcon.vue';

const DEFAULT_UPDATE_INTERVAL_MS = 125; // update every 125ms (8x per second)
const MIN_UPDATE_INTERVAL = 100; // at most update 10x per second

export default {
    name: 'cse-location',
    components:
    {
        Latitude, Longitude, Heading, 'mgrs':MGRS,
        CseContextMenu,
        CseIcon,
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
            updateTimer: null,
            running: false,
            contextMenu:{
                locationFormat:
                {
                    show:false,
                    x:0,
                    y:0,
                }
            }
        };
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
        positionFormat() { return this.$store.getters.positionFormat; },
        isMGRS() { return this.$store.getters.isPositionFormat(POSITION_FORMAT.MGRS); },
        locationFormatContextItems()
        {
            const formatID = this.positionFormat.id;
            const items = POSITION_FORMAT_OPTIONS.map((opt)=>
            {
                const item = {...opt};
                if(item.id===formatID)
                    item.icon = 'check-bold';
                return item;
            });
            items.push({separator:true});
            items.push({id:'create_bookmark', label:'Bookmark This Place', icon:'map-marker-radius'});
            return items;
        },
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
        this.stopUpdates();
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

            if($isInOuterra)
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

            this.updateTimer = setTimeout(this.update, Math.max(MIN_UPDATE_INTERVAL, this.updateIntervalMs));
        },
        stopUpdates()
        {
            this.running = false;
            if(this.updateTimer !== null)
            {
                clearTimeout(this.updateTimer);
                this.updateTimer = null;
            }
        },
        showLocationFormatContextMenu(evt)
        {
            this.contextMenu.locationFormat.show = false;
            this.contextMenu.locationFormat.x = evt.clientX-64;
            this.contextMenu.locationFormat.y = evt.clientY;
            this.contextMenu.locationFormat.show = true;
        },
        locationFormatSelection(format)
        {
            this.contextMenu.locationFormat.show = false;
            this.$store.commit(PREFERENCE_MUTATION.SET_POSITION_FORMAT, format.id);
        },
        changeLocationFormat()
        {
            const currentFormat = this.positionFormat.id;
            let nextFormat = POSITION_FORMAT.DMS;
            if(currentFormat === POSITION_FORMAT.DMS)
                nextFormat = POSITION_FORMAT.DECIMAL;
            else if(currentFormat === POSITION_FORMAT.DECIMAL)
                nextFormat = POSITION_FORMAT.MGRS;
            this.$store.commit(PREFERENCE_MUTATION.SET_POSITION_FORMAT, nextFormat);
        }
    },
};
</script>
