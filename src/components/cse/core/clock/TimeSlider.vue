<template>
    <div class="cse-desktop--time-slider cse-overlay-text">
        <v-icon
            style="text-shadow: 0 0 4px black;"
            @click="useLocalTz=!useLocalTz"
        >
            {{ useLocalTz?'mdi-web-clock':'mdi-clock-outline' }}
        </v-icon>
        {{ theTime }}
        {{ tzOffsetText }}
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
import tz from 'tz-lookup';
import { DateTime } from 'luxon';

import MathUtils from '@/assets/js/utils/math-utils.js';
import { $isInOuterra, $tWorldInterface } from '@/assets/js/titan/titan-utils.js';

// frequency to update timezone for current location
// when local time offset is in use
const UPDATE_INTERVAL = 1000;

export default {
    name:'date-time-widget',
    data()
    {
        return {
            theTime:'00:00:00',
            dayOffset: 0,
            useLocalTz: true,
            localTzOffset: 0,
            localTzName: 'UTC',
            running: false,
        };
    },
    computed:
    {
        tzOffsetText()
        {
            if(!this.useLocalTz)
                return 'UTC';

            const isNeg = this.localTzOffset < 0;
            const absOffset = this.localTzOffset*(isNeg?-1:1);
            const hours = (absOffset / 60) | 0;
            const minutes = absOffset - (hours * 60);

            return this.localTzName + ' (UTC'+(isNeg?'-':'+')+(hours<10?'0':'')+hours+':'+(minutes<10?'0':'')+minutes+')';
        }
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
        useLocalTz(useLocalTz)
        {
            if(useLocalTz)
                this.startUpdates();
            else
            {
                this.stopUpdates();
                this.localTzOffset = 0;
                this.localTzName = 'UTC';
                this.dayOffsetChanged();
            }
        }
    },
    mounted()
    {
        if($isInOuterra)
        {
            const activeScenario = $tWorldInterface.getActiveScenario();
            this.dayOffset = (activeScenario.getTimeOfDay() / 60000) | 0;
            // start the update cycle
            if(this.useLocalTz)
                this.startUpdates();
        }
    },
    beforeDestroy()
    {
        this.stopUpdates();
    },
    methods:
    {
        dayOffsetChanged()
        {
            const offsetMins = MathUtils.wrapClamp(this.dayOffset - this.localTzOffset, 0, 1440);
            const offsetMs = offsetMins * 60000;
            if($isInOuterra)
            {
                const activeScenario = $tWorldInterface.getActiveScenario();
                activeScenario.setTime(activeScenario.getDayOfYear(), offsetMs, 1.0);
            }
            this.$emit('day-offset', offsetMs);
        },
        startUpdates()
        {
            this.stopUpdates();
            this.running = true;
            this.update();
        },
        stopUpdates()
        {
            this.running = false;
            if(this.updateTimer !== null)
            {
                clearTimeout(this.updateTimer);
                this.updateTimer = null;
            }
        },
        update()
        {
            if(!this.running)
                return;

            if($isInOuterra)
            {
                const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
                if(scenarioCamera)
                {
                    const lla = scenarioCamera.getLLA();
                    const timezone = tz(lla.latitude, lla.longitude);
                    const dummy = DateTime.local().setZone(timezone);
                    if(dummy.offset !== this.localTzOffset)
                    {
                        const offsetDelta = this.localTzOffset - dummy.offset;
                        this.dayOffset = MathUtils.wrapClamp(this.dayOffset - offsetDelta, 0, 1440);
                    }
                    this.localTzOffset = dummy.offset;
                    this.localTzName = dummy.offsetNameShort;
                }
            }
            else
            {
                const timezone = tz(42.7235, -73.6931);
                const dummy = DateTime.local().setZone(timezone);
                this.localTzOffset = dummy.offset;
                this.localTzName = dummy.offsetNameShort;
            }

            this.updateTimer = setTimeout(this.update, UPDATE_INTERVAL);
        },
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
    width:300px;
    height:200px;
    background: rgba(0,0,0,0);
    color: white;
}
</style>