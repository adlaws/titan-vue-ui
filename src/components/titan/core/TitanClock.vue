<template>
    <div
        class="vue-os--titan-clock"
        :style="`font-size:${taskbarSize*0.25}px;`"
    >
        <titan-icon icon="clock" class="mr-1" /><span class="monospace">{{ time }}</span>
        <br>
        <titan-icon icon="calendar-month" class="mr-1" /><span class="monospace">{{ date }}</span>
        <titan-place-and-time />
    </div>
</template>

<script>
// import tzlookup from 'tz-lookup';

// import { $tWorldInterface, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';
// import DateTimeUtils from '@/assets/js/utils/datetime-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';
import TitanPlaceAndTime from '@/components/titan/core/TitanPlaceAndTime.vue';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default {
    name: 'titan-clock',
    components: {
        TitanIcon, TitanPlaceAndTime
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
            if($isInsideTitan)
            {
                const activeScenario = $tWorldInterface.getActiveScenario();
                const scenarioCamera = activeScenario.getActiveCamera();
                let tzOffsetMins = 0;
                if(scenarioCamera)
                {
                    const lla = scenarioCamera.getLLA();
                    const timezone = tzlookup(lla.latitude, lla.longitude);
                    tzOffsetMins = ctz.getTimezone(timezone).utcOffset;
                }

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
