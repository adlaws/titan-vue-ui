<template>
    <div>
        <b-input
            v-model="currentLocation"
            :messages="messages"
            :error="!isValid"
            :disabled="disabled"
            :hint="hint"
            :label="label"
            :placeholder="placeholder"
            :readonly="readonly"
            @input="parseLocation"
        />
    </div>
</template>

<script>
import LatLongParser, { LATLNG_FORMAT } from '@/assets/js/utils/latlng-parsing.js';

export default {
    name: 'location-field',
    props:
    {
        value: {
            type: [Object, String],
            default: null,
        },
        // these are Vuetify <b-input> properties which we allow and pass through
        //   Ref: https://vuetifyjs.com/en/api/v-text-field/#props
        disabled: Boolean,
        readonly: Boolean,
        hint: { type: String, default: undefined },
        label: { type: String, default: undefined },
        placeholder: { type: String, default: undefined },
    },
    data()
    {
        return {
            currentLocation:'0N 0E',
            latLng: {latitude:0, longitude:0},
        };
    },
    computed:
    {
        isValid()
        {
            return this.latLng !== null;
        },
        errorMessage()
        {
            return 'A valid location is required';
        },
        messages()
        {
            return this.isValid ? null : this.errorMessage;
        }
    },
    watch:
    {
        value(newLocation) { this.updateLocation(newLocation); }
    },
    mounted()
    {
        this.updateLocation(this.value);
    },
    methods:
    {
        parseLocation()
        {
            this.latLng = LatLongParser.fromString(this.currentLocation);
            if(this.latLng !== null)
                this.$emit('input', this.latLng);
        },
        updateLocation(location)
        {
            if(!location)
            {
                this.latLng = null;
                return;
            }

            if(typeof location === 'string')
            {
                this.latLng = LatLongParser.fromString(location);
                if(this.latLng !== null)
                    this.currentLocation = location;
            }
            else if(location.latitude !== undefined && location.longitude !== undefined )
            {
                this.latLng = {latitude:location.latitude, longitude: location.longitude};
                if(this.latLng !== null)
                    this.currentLocation = LatLongParser.toString(this.latLng.latitude, this.latLng.longitude, LATLNG_FORMAT.WIKIPEDIA);
            }
        }
    }
};

</script>