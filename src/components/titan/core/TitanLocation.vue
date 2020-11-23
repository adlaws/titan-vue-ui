<template>
    <div
        class="vue-os--titan-location"
        :style="`font-size:${taskbarSize*0.25}px;`"
    >
        <titan-icon icon="map-marker" class="mr-1" /><span class="monospace">{{ latlngText }}</span>
        <br>
        <titan-icon icon="compass" class="mr-1" /><span class="monospace">{{ headingText }}</span>
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
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-8 -8 16 16"><path d="M-5 5l5-3 5 3L0-7z" stroke="#000" stroke-linejoin="round"/></svg>

<script>
import { $tWorldInterface, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

const DEFAULT_UPDATE_INTERVAL = 125; // update every 125ms (8x per second)
const MIN_UPDATE_INTERVAL = 100; // at most update 10x per second

export default {
    name: 'titan-location',
    components: {
        TitanIcon,
    },
    props:
    {
        updateRate:{
            type: Number,
            default: DEFAULT_UPDATE_INTERVAL,
        }
    },
    data()
    {
        return {
            lla: {latitude:0.0, longitude: 0.0, altitude:0.0},
            magneticHeading: 0, // between -180.0 and 180.0
            compassRotation: 0.0,
            running: false,
        };
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
        latlngText()
        {
            let lat = this.lla.latitude;
            let lng = this.lla.longitude;

            const ns = lat<0?'S':'N';
            const ew = lng<0?'W':'E';

            lat = Math.abs(lat);
            lng = Math.abs(lng);

            // internationalized NSEW compass cardinals
            const i18nEW = this.$t('direction.'+ew+'.abbr');
            const i18nNS = this.$t('direction.'+ns+'.abbr');

            // use string concatenation rather than formatters for performance
            const latStr = (lat<10?'0':'') + lat.toFixed(3) + '°' + i18nNS;
            const lngStr = (lng<10?'0':'') + (lng<100?'0':'') + lng.toFixed(3) + '°' + i18nEW;

            return latStr + ' ' + lngStr;
        },
        headingText()
        {
            const heading = MathUtils.wrapClamp(this.magneticHeading, 0.0, 360.0);
            return (heading<10?'0':'') + (heading<100?'0':'') + `${heading.toFixed(2)}°`;
        }
    },
    watch:
    {
        magneticHeading(to, from)
        {
            // this is simply to ensure that the compass needle rotates vai the "shortest angular
            // distance" so that when the needle goes from, say 359° to 1°, it spins clockwise
            // through 360°, rather than counter-clockwise through 180°
            const delta = ((((to - from) % 360) + 540) % 360) - 180;
            this.compassRotation += delta;
        }
    },
    mounted()
    {
        // easing for the rotation in sync with the update rate to make the
        // compass needle rotate smoothly
        this.$refs.compassNeedle.style.transition = `all ${this.updateRate/1000.0}s ease-in-out`;
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
                this.magneticHeading = MathUtils.wrapClamp(this.magneticHeading + (Math.random() * 10.0) -5, -180.0, 180.0);
                this.lla.latitude = MathUtils.clamp(this.lla.latitude += (Math.random() * 1.0) - 0.5, -90.0, 90.0);
                this.lla.longitude = MathUtils.clamp(this.lla.latitude += (Math.random() * 1.0) - 0.5, -180.0, 180.0);
                this.lla.altitude = MathUtils.clamp(this.lla.latitude += (Math.random() * 1.0) - 0.5, 0.0, 10000.0);
            }

            setTimeout(this.update, Math.max(MIN_UPDATE_INTERVAL, this.updateRate));
        },
    },
};
</script>
