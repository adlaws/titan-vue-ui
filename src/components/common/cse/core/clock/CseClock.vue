<template>
    <div
        class="vue-os--cse-clock"
        :style="`font-size:${taskbarSize*0.25}px;`"
    >
        <cse-icon
            icon="clock"
            class="mr-1"
        />
        <span class="monospace">{{ time }}</span>
        <br>
        <cse-icon
            icon="calendar-month"
            class="mr-1"
        />
        <span class="monospace">{{ date }}</span>

        <!-- date-time-widget / -->
    </div>
</template>

<script>
// import tzlookup from 'tz-lookup';

// import { $tWorldInterface, $isInOuterra } from '@/assets/js/titan/titan-utils.js';
// import DateTimeUtils from '@/assets/js/utils/datetime-utils.js';

import CseIcon from '@/components/common/cse/core/CseIcon.vue';

// import DateTimeWidget from '@/components/common/cse/core/clock/DateTimeWidget.vue';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default {
    name: 'cse-clock',
    components: {
        CseIcon, // DateTimeWidget,
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
            const now = new Date();
            const year = now.getFullYear();

            let titanNow = now;
            /*
            if($isInOuterra)
            {
                const activeScenario = $tWorldInterface.getActiveScenario();
                let tzOffsetMins = 0;
                // const scenarioCamera = activeScenario.getActiveCamera();
                // if(scenarioCamera)
                // {
                //     const lla = scenarioCamera.getLLA();
                //     const timezone = tzlookup(lla.latitude, lla.longitude);
                // }

                let tod = activeScenario.getTimeOfDay();
                let doy = activeScenario.getDayOfYear();

                let totalSeconds = Math.floor(tod / 1000);

                const startOfYear = DateTimeUtils.makeUtcDateTime(year,0,1);
                titanNow = DateTimeUtils.dateTimeAdd(startOfYear, {days:doy,seconds:totalSeconds, minutes:tzOffsetMins});
            }
            */

            const month = MONTHS[titanNow.getMonth()];
            let day = titanNow.getDate();
            day = (day < 10 ? '0' : '') + day;

            let hours = titanNow.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours > 12 ? hours - 12 : hours;
            hours = (hours < 10 ? '0' : '') + hours;
            let minutes = titanNow.getMinutes();
            minutes = (minutes < 10 ? '0' : '') + minutes;
            let seconds = titanNow.getSeconds();
            seconds = (seconds < 10 ? '0' : '') + seconds;

            this.time = `${hours}:${minutes}:${seconds} ${ampm}`;
            this.date = `${day} ${month} ${year}`;

            const nextRefresh = (1000 - now.getMilliseconds())+ 50;
            setTimeout(this.updateTime, nextRefresh);
        },
    },
};
</script>
