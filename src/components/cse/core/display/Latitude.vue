<template>
    <span>{{ latitudeText }}</span>
</template>

<script>
import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';

import GeoUtils from '@/assets/js/utils/geo-utils.js';

export default {
    name: 'latitude',
    props:
    {
        latitude:{
            type: Number,
            default: 0.0,
        },
    },
    computed:
    {
        format() { return this.$store.getters.positionFormat; },
        precision() { return this.$store.getters.positionPrecision; },
        language() {return this.$store.getters.language; },
        latitudeText()
        {
            const ns = this.latitude<0?'S':'N';
            // internationalized NSEW compass cardinals
            const i18nNS = this.$t('direction.'+ns+'.abbr', this.$store.getters.language.id);

            const absLat = Math.abs(this.latitude);
            if(this.format.id === POSITION_FORMAT.DECIMAL)
            {
                // use string concatenation rather than formatters for performance
                const padding = this.zeroPad ? (absLat<10?'0':'') : '';
                return padding + absLat.toFixed(this.precision.dp) + '°' + i18nNS;
            }
            else if(this.format.id === POSITION_FORMAT.DMS)
            {
                const dms = GeoUtils.angleToDMS(absLat);
                const degPadding = (dms.deg<10?'0':'');
                const minPadding = (dms.min<10?'0':'');
                const secPadding = (dms.sec<10?'0':'');
                return degPadding + dms.deg + '°' +
                    minPadding + dms.min + '′' +
                    secPadding + dms.sec.toFixed(this.precision.dp) + '″' +
                    i18nNS;
            }
            return '!!Unknown format' + this.format.id + '!!';
        },
    },
};
</script>
