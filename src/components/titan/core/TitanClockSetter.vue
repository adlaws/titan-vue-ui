<template>
    <div
        class="vue-os--titan-clock-setter"
    >
        <h1>Set the clock</h1>
        <titan-icon icon="clock" />
        Current timezone is {{ timezone }}
    </div>
</template>

<script>
import tzlookup from 'tz-lookup';
import ctz from 'countries-and-timezones';

import { $tWorldInterface, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name: 'titan-clock',
    components: {
        TitanIcon,
    },
    data()
    {
        return {
            time: '00:00:00am',
            date: '01 Jan 2020',
            timezone: 'UTC',
            timezoneOffset: {},
        };
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
    },
    mounted()
    {
        this.updateTime();
    },
    methods:
    {
        updateTime()
        {
            if($isInsideTitan)
            {
                const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
                if(scenarioCamera)
                {
                    const lla = scenarioCamera.getLLA();
                    this.timezone = tzlookup(lla.latitude, lla.longitude);
                    this.timezoneOffset = ctz.getTimezone(this.timezone).utcOffset;
                }
            }
            const now = new Date();
            const nextRefresh = (1000 - now.getMilliseconds())+ 50;
            setTimeout(this.updateTime, nextRefresh);
        },
    },
};
</script>

<style lang="scss">
.vue-os--titan-clock-setter
{
    position: absolute;
    bottom: 64px;
    right: 0px;

    width:256px;
    height:256px;

    z-index: 1025;

    padding: 0;
    margin: 0;

    box-shadow: 0 0 16px rgba(0,0,0,0.8);
    background-color: rgba(0,32,64,0.9);
}
</style>
