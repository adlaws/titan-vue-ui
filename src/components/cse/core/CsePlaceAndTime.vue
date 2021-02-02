<template>
    <div
        class="vue-os--cse-place-and-time-setter"
    >
        <h1>Spatiotemporal Navigation</h1>
        <b-icon
            icon="clock"
        />
        Current timezone is {{ timezone }}
        {{ latitude }} {{ longitude }} {{ altitude }}
        <location-field />
    </div>
</template>

<script>
import tzlookup from 'tz-lookup';

import { $tWorldInterface, $isInOuterra } from '@/assets/js/titan/titan-utils.js';

import LocationField from '@/components/cse/core/field/LocationField.vue';


export default {
    name: 'cse-place-and-time',
    components: {
        LocationField,
    },
    data()
    {
        return {
            time: '00:00:00am',
            date: '01 Jan 2020',
            timezone: 'UTC',
            timezoneOffset: {},
            latitude: 0.0,
            longitude: 0.0,
            altitude: 0.0,
        };
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
    },
    mounted()
    {
        this.updateFromCamera();
    },
    methods:
    {
        updateFromCamera()
        {
            if($isInOuterra)
            {
                const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
                if(scenarioCamera)
                {
                    const lla = scenarioCamera.getLLA();
                    this.latitude = lla.latitude,
                    this.longitide = lla.longitude;
                    this.altitude = lla.altitude;

                    this.timezone = tzlookup(lla.latitude, lla.longitude);
                }
            }
        },
    },
};
</script>

<style lang="scss">
.vue-os--cse-place-and-time-setter
{
    position: absolute;
    bottom: 64px;
    right: 0px;

    width:512px;
    height:512px;

    z-index: 1025;

    padding: 0;
    margin: 0;

    box-shadow: 0 0 16px rgba(0,0,0,0.8);
    background-color: rgba(0,32,64,0.9);
}
</style>
