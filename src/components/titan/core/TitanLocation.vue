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
            <g fill="white" stroke="white" stroke-linejoin="round" :transform="`rotate(${heading})`">
                <path d="M-5 6l5-3 5 3L0-6z" />
            </g>
        </svg>
    </div>
</template>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="-8 -8 16 16"><path d="M-5 5l5-3 5 3L0-7z" stroke="#000" stroke-linejoin="round"/></svg>

<script>
import { $tWorldInterface, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';
import { Vec3, Quat } from '@/assets/js/utils/math-utils.js';
import GeoUtils from '@/assets/js/utils/geo-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

const DEFAULT_UPDATE_INTERVAL = 250; // update every 500ms (4x per second)
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
            latlngText: '0.000°N 0.000°E',
            headingText: '000.00°',
            heading: 0,
        };
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
    },
    mounted()
    {
        this.update();
    },
    methods:
    {
        update()
        {
            let ecef = Vec3.fromObj({x:3038503.691797,y:307043.4483106,z:5599910.849361});
            let orientation = Quat.fromObj({x:-0.2685823440551758,y:0.15256258845329285,z:-0.8806082010269165,w:0.3593290448188782});

            if($isInsideTitan)
            {
                const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
                if(scenarioCamera)
                {
                    ecef = Vec3.fromObj(scenarioCamera.getPositionECEF());
                    orientation = Quat.fromObj(scenarioCamera.getRotation());
                }
            }

            const lla = GeoUtils.xyzToLatLongElevation(ecef);
            let heading = GeoUtils.radToDeg( GeoUtils.getEcefQuatHeadingRad(ecef, orientation));
            while(heading < 0)
                heading += 360.0;
            let lat = GeoUtils.radToDeg(lla.latitude);
            const ns = lat<0?'S':'N';
            lat = Math.abs(lat);
            let lng = GeoUtils.radToDeg(lla.longitude);
            const ew = lng<0?'W':'E';
            lng = Math.abs(lng);

            const i18nEW = this.$t(`direction.${ew}.abbr`);
            const i18nNS = this.$t(`direction.${ns}.abbr`);
            this.latlngText = `${lat.toFixed(3)}°${i18nNS} ${lng.toFixed(3)}°${i18nEW}`;
            this.headingText = (heading < 10 ? '00' : (heading < 100 ? '0' : '')) + `${heading.toFixed(2)}°`;
            this.heading = heading;

            setTimeout(this.update, Math.max(MIN_UPDATE_INTERVAL, this.updateRate));
        },
    },
};
</script>
