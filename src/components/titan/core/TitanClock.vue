<template>
    <div
        class="vue-os--titan-clock"
        :style="`font-size:${taskbarSize*0.25}px;`"
    >
        <titan-icon icon="clock" class="mr-1" /><span class="monospace">{{ time }}</span>
        <br>
        <titan-icon icon="calendar-month" class="mr-1" /><span class="monospace">{{ date }}</span>
    </div>
</template>

<script>
// import tzlookup from 'tz-lookup';
// import ctz from 'countries-and-timezones';

// import { $tWorldInterface, $isInsideTitan, $tLogger } from '@/assets/js/titan/titan-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
            // if($isInsideTitan)
            // {
            //     const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
            //     if(scenarioCamera)
            //     {
            //         const lla = scenarioCamera.getLLA();
            //         const tzName = tzlookup(lla.latitude, lla.longitude);
            //         $tLogger.info(tzName, ctz.getTimezone(tzName).utcOffset);
            //     }
            // }

            const now = new Date();

            const year = now.getFullYear();
            const month = MONTHS[now.getMonth()];
            let day = now.getDate();
            day = (day < 10 ? '0' : '') + day;

            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours > 12 ? hours - 12 : hours;
            hours = (hours < 10 ? '0' : '') + hours;
            let minutes = now.getMinutes();
            minutes = (minutes < 10 ? '0' : '') + minutes;
            let seconds = now.getSeconds();
            seconds = (seconds < 10 ? '0' : '') + seconds;

            this.time = `${hours}:${minutes}:${seconds} ${ampm}`;
            this.date = `${day} ${month} ${year}`;

            const nextRefresh = (1000 - now.getMilliseconds())+ 50;
            setTimeout(this.updateTime, nextRefresh);
        },
    },
};
</script>
