<template>
    <span>{{ latitudeText }}</span>
</template>

<script>
export default {
    name: 'latitude',
    props:
    {
        latitude:{
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
        latitudeText()
        {
            const ns = this.latitude<0?'S':'N';
            // internationalized NSEW compass cardinals
            const i18nNS = this.$t('direction.'+ns+'.abbr');

            const absLat = Math.abs(this.latitude);
            // use string concatenation rather than formatters for performance
            const padding = this.zeroPad ? (absLat<10?'0':'') : '';
            const latStr = padding + absLat.toFixed(this.precision) + '°' + i18nNS;
            return latStr;
        },
    },
};
</script>
