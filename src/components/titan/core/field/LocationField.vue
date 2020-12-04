<template>
    <span>
        <input
            v-model="location"
            @input="parseLocation"
        >
        <latitude class="ml-1" :latitude="latLng?latLng.latitude:0" />
        <longitude class="ml-1" :longitude="latLng?latLng.longitude:0" />
    </span>
</template>

<script>
import LatLongParser from '@/assets/js/utils/latlng-parsing.js';

import Latitude from '@/components/titan/core/display/Latitude.vue';
import Longitude from '@/components/titan/core/display/Longitude.vue';

export default {
    name: 'location-field',
    components:{
        Latitude, Longitude,
    },
    data()
    {
        return {
            location:'',
            latLng: null,
        };
    },
    methods:
    {
        parseLocation()
        {
            this.latLng = LatLongParser.fromString(this.location);
            if(this.latLng !== null)
                this.$emit('input', this.latLng);
        }
    }
};

</script>