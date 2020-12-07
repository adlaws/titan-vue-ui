<template>
    <span>{{ longitudeText }}</span>
</template>

<script>
import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';

import GeoUtils from '@/assets/js/utils/geo-utils.js';


export default {
    name: 'longitude',
    props:
    {
        longitude:{
            type: Number,
            default: 0.0,
        },
    },
    computed:
    {
        format() { return this.$store.getters.positionFormat; },
        precision() { return this.$store.getters.positionPrecision; },
        language() {return this.$store.getters.language; },
        longitudeText()
        {
            const ew = this.longitude<0?'W':'E';
            // internationalized NSEW compass cardinals
            const i18nEW = this.$t('direction.'+ew+'.abbr', this.language.id);
            const absLng = Math.abs(this.longitude);

            if(this.format.id === POSITION_FORMAT.DECIMAL)
            {
                // use string concatenation rather than formatters for performance
                const padding = (absLng<10?'0':'') + (absLng<100?'0':'');
                return padding + absLng.toFixed(this.precision.dp) + '°' + i18nEW;
            }
            else if(this.format.id === POSITION_FORMAT.DMS)
            {
                const dms = GeoUtils.angleToDMS(absLng);
                const degPadding = (dms.deg<10?'0':'') + (dms.deg<100?'0':'');
                const minPadding = (dms.min<10?'0':'');
                const secPadding = (dms.sec<10?'0':'');
                return degPadding + dms.deg + '°' +
                    minPadding + dms.min + '′' +
                    secPadding + dms.sec.toFixed(this.precision.dp) + '″' +
                    i18nEW;
            }
            return '!!Unknown format' + this.format.id + '!!';
        },
    },
};
</script>
