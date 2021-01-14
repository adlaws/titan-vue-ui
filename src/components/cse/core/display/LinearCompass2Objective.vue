<template>
    <g v-if="isVisible">
        <path
            :fill="objective.color||'#08F'"
            :d="'M'+xPos+' 0 h-0.8 l 0.8 2.8 l 0.8 -2.8 z'"
        />
        <text
            :x="xPos"
            y="1.8"
            font-family="Verdana"
            font-size="2.4px"
            font-weight="400"
            text-anchor="middle"
            fill="white"
            opacity="0.5"
        >
            {{ objective.text }}
        </text>
    </g>
</template>

<script>
import MathUtils from '@/assets/js/utils/math-utils.js';

export default {
    name:'linear-compass2-objective',
    props:
    {
        objective:{
            type: Object,
            required: true,
        },
        compassHeading:
        {
            type: Number,
            required: true,
        },
    },
    computed:
    {
        xPos() { return 45+(MathUtils.wrapClamp(this.objective.heading-this.compassHeading,-90,270)); },
        isVisible() { return this.xPos > -10 && this.xPos < 100; }
    }
};
</script>