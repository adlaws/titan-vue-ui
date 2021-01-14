<template>
    <div class="cse-desktop--time-slider">
        <v-icon>mdi-clock-outline</v-icon>
        {{ theTime }} {{ theTimezone }}
        <v-slider
            v-model="dayOffset"
            class="compact"
            min="0"
            max="1439"
            step="1"
            style="min-height:16px;"
            @input="dayOffsetChanged"
        />
    </div>
</template>

<script>
import { $isInOuterra, $tWorldInterface, $tLogger } from '@/assets/js/titan/titan-utils.js';

export default {
    name:'date-time-widget',
    data()
    {
        return {
            theTime:'00:00:00',
            theTimezone: 'UTC',
            dayOffset: 0,
        };
    },
    watch:
    {
        dayOffset(newValue)
        {
            const hours = (newValue / 60) | 0;
            const minutes = (newValue - (hours * 60)) | 0;
            const seconds = 0;
            this.theTime = (hours<10?'0':'')+hours+':'+(minutes<10?'0':'')+minutes+':'+(seconds<10?'0':'')+seconds;
        },
    },
    mounted()
    {
        if($isInOuterra)
        {
            const activeScenario = $tWorldInterface.getActiveScenario();
            this.dayOffset = (activeScenario.getTimeOfDay() / 60000) | 0;
        }
    },
    methods:
    {
        dayOffsetChanged()
        {
            const offsetMs = this.dayOffset * 60000;
            $tLogger.info('Day offset is ', this.dayOffset, offsetMs);
            if($isInOuterra)
            {
                const activeScenario = $tWorldInterface.getActiveScenario();
                activeScenario.setTime(activeScenario.getDayOfYear(), offsetMs, 1.0);
            }
            this.$emit('day-offset', offsetMs);
        }
    }
};
</script>

<style lang="scss">
.cse-desktop--time-slider
{
    display:block;
    position:absolute;
    top: 0px;
    right:0px;

    font-size:90%;

    padding: 8px;

    max-width:400px;
    width:200px;
    height:200px;
    background: rgba(0,0,0,0);
    color: white;
}
</style>