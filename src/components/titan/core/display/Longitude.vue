<template>
    <span>{{ longitudeText }}</span>
</template>

<script>
export default {
    name: 'longitude',
    props:
    {
        longitude:{
            type: Number,
            default: 0.0,
        },
        format:{
            type: String,
            default: 'decimal',
        },
        precision:{
            type: Number,
            default: 3,
        },
        zeroPad:{
            type: Boolean,
            default: true,
        },
    },
    computed:
    {
        longitudeText()
        {
            const ew = this.longitude<0?'W':'E';
            // internationalized NSEW compass cardinals
            const i18nEW = this.$t('direction.'+ew+'.abbr');

            const absLng = Math.abs(this.longitude);
            // use string concatenation rather than formatters for performance
            const padding = this.zeroPad ? (absLng<10?'0':'') + (absLng<100?'0':'') : '';
            return padding + absLng.toFixed(this.precision) + '°' + i18nEW;
        },
    },
};
</script>
