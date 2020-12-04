<template>
    <span>{{ headingText }}</span>
</template>

<script>
import MathUtils from '@/assets/js/utils/math-utils.js';

export default {
    name: 'heading',
    props:
    {
        heading:{
            type: Number,
            default: 0.0,
        },
        format:{
            type: String,
            default: 'decimal',
        },
        precision:{
            type: Number,
            default: 2,
        },
        zeroPad:{
            type: Boolean,
            default: true,
        },
    },
    computed:
    {
        headingText()
        {
            const clamped = MathUtils.wrapClamp(this.heading, 0.0, 360.0);
            const padding = this.zeroPad ? (clamped<10?'0':'') + (clamped<100?'0':'') : '';
            return padding + clamped.toFixed(this.precision) + '°';
        },
    },
};
</script>
