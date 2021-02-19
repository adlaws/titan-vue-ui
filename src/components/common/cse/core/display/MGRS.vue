<template>
    <span>
        <span>MGRS:</span>
        <span style="margin-right:0.25em;">{{ zoneNumber }}</span>
        <span style="margin-right:0.25em;">{{ zoneLetter }}</span>
        <span style="margin-right:0.25em;">{{ _100kID }}</span>
        <span style="margin-right:0.25em;">{{ easting }}</span>
        <span style="margin-right:0.25em;">{{ northing }}</span>
    </span>
</template>

<script>
import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';
import { MGRSUtils } from '@/assets/js/utils/latlng-parsing.js';

import Ripple from 'primevue/ripple';

export default {
    name: 'mgrs',
    directives:
    {
        'ripple': Ripple,
    },
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
    data()
    {
        return {
            clipboard: null,
        };
    },
    computed:
    {
        format() { return this.$store.getters.positionFormat; },
        precision() { return this.format.id === POSITION_FORMAT.MGRS ? this.$store.getters.positionPrecision : 4; },
        utm() { return MGRSUtils.latLongToUTM({lat: this.latitude,lon: this.longitude}); },
        zoneNumber() { return this.utm.zoneNumber; },
        zoneLetter() { return this.utm.zoneLetter; },
        _100kID() { return MGRSUtils.get100kID(this.utm.easting, this.utm.northing, this.utm.zoneNumber); },
        easting()
        {
            const easting = '' + this.utm.easting;
            return easting.substr(easting.length - 5, this.precision.dp);
        },
        northing()
        {
            const northing = '' + this.utm.northing;
            return northing.substr(northing.length - 5, this.precision.dp);
        },
        clipboardText()
        {
            return `${this.zoneNumber} ${this.zoneLetter} ${this._100kID} ${this.easting} ${this.northing}`;
        },
    },
};
</script>
