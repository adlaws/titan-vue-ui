<template>
    <span>{{ mgrsText }}</span>
</template>

<script>
import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';

import { MGRSUtils } from '@/assets/js/utils/latlng-parsing.js';

export default {
    name: 'mgrs',
    props:
    {
        longitude:{
            type: Number,
            default: 0.0,
        },
        latitude:{
            type: Number,
            default: 0.0,
        },
    },
    computed:
    {
        format() { return this.$store.getters.positionFormat; },
        precision() { return this.format.id === POSITION_FORMAT.MGRS ? this.$store.getters.positionPrecision : 4; },
        mgrsText()
        {
            return MGRSUtils.latLonToMGRS(this.latitude, this.longitude, this.precision.dp);
        },
    },
};
</script>
