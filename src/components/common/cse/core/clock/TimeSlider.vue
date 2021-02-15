<template>
    <div
        ref="container"
        class="cse-desktop--time-slider cse-overlay-text"
    >
        <cse-icon
            :icon="useLocalTz?'web-clock':'clock-outline'"
            style="text-shadow: 0 0 4px black;"
            @click="useLocalTz=!useLocalTz"
        />
        {{ theTime }}
        {{ tzOffsetText }}
        <slider
            v-model="dayOffset"
            class="mt-1 no-range-color"
            :min="0"
            :max="1439"
            :step="1"
            @input="dayOffsetChanged"
        />
        <div
            v-if="daylightGradient"
            style="position:relative;top:-8px;margin: 0 8px;width:auto;height:5px;"
            :style="daylightGradient"
        />
    </div>
</template>

<script>
import tz from 'tz-lookup';
import { DateTime } from 'luxon';

import { $isInOuterra, $tWorldInterface } from '@/assets/js/titan/titan-utils.js';

import SunCalc from '@/assets/js/utils/suncalc.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

import CseDockableMixin from '@/components/cse/CseDockableMixin.vue';

import Slider from 'primevue/slider';

// frequency to update timezone for current location
// when local time offset is in use
const UPDATE_INTERVAL = 1000;

export default {
    name:'time-slider',
    components:
    {
        Slider,
    },
    mixins: [CseDockableMixin],
    data()
    {
        return {
            theTime:'00:00:00',
            dayOffset: 0,
            useLocalTz: true,
            localTzOffset: 0,
            localTzName: 'UTC',
            isUpdating: false,
            daylightGradient: null,
            container: null,
        };
    },
    computed:
    {
        desktopBounds() { return this.$store.getters.desktopBounds; },
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
        }
        this.startUpdates();
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
            this.isUpdating = true;
            this.update();
        },
        stopUpdates()
        {
            this.isUpdating = false;
            this.daylightGradient = null;

            if(this.updateTimer !== null)
            {
                clearTimeout(this.updateTimer);
                this.updateTimer = null;
            }
        },
        update()
        {
            if(!this.isUpdating)
                return;

            let lla = {latitude: -41.4354, longitude:173.9198 }; // New Zealand
            // let lla = {latitude: -73.6931, longitude:42.7235 }; New York
            if($isInOuterra)
            {
                const scenarioCamera = $tWorldInterface.getActiveScenario().getActiveCamera();
                if(scenarioCamera)
                {
                    lla = scenarioCamera.getLLA();
                }
            }
            const timezone = tz(lla.latitude, lla.longitude);
            const datetime = DateTime.local().setZone(timezone);
            // datetime.set({hour:0,minute:0,second:0});
            // this.daylightGradient = this.makeDaylightGradient(lla.latitude, lla.longitude, datetime);
            if(datetime.offset !== this.localTzOffset)
            {
                const offsetDelta = this.localTzOffset - datetime.offset;
                this.dayOffset = MathUtils.wrapClamp(this.dayOffset - offsetDelta, 0, 1440);
            }
            this.localTzOffset = datetime.offset;
            this.localTzName = datetime.offsetNameShort;

            this.updateTimer = setTimeout(this.update, UPDATE_INTERVAL);
        },
        makeDaylightGradient(lat, long, date)
        {
            const foo = SunCalc.getSunTimes(date, lat, long);
            const values = [
                {name:'nadir', time: foo.nadir, color:'#000000'},
                {name:'nightEnd', time: foo.nightEnd, color:'#000010'},
                {name:'dawn', time: foo.dawn, color:'#000040'},
                {name:'sunrise', time: foo.sunrise, color:'#ff7c30'},
                {name:'sunriseEnd', time: foo.sunriseEnd, color:'#0080ff'},
                {name:'solarNoon', time: foo.solarNoon, color:'#00c0ff'},
                {name:'sunsetStart', time: foo.sunsetStart, color:'#0080ff'},
                {name:'sunset', time: foo.sunset, color:'#fc412f'},
                {name:'dusk', time: foo.dusk, color:'#010060'},
                {name:'night', time: foo.night, color:'#000040'},
            ];

            //                                       nadir      nightend    dawn        sunrise     sunrise end solar noon  sunsetstart sunset      dusk        night        nadir
            // background: linear-gradient(to right, #000000 0%,#000010 10%, #000040 18%,#ff7c30 21%,#0080ff 24%,#80c0ff 51%,#0080ff 77%,#fc412f 80%,#010060 83%,#000040 88%,#000000 100%)
            const nadir = foo.nadir.getTime();
            const colors = [];
            for(let i=0; i<values.length; i++)
            {
                const value = values[i];
                const time = value.time.getTime();
                let relTime = time - nadir;
                const pct = relTime / (24 * 3600 * 1000) * 100;
                colors.push(value.color+' '+pct+'%');
            }
            return 'background: linear-gradient(to right, '+colors.join(',')+',#000000 100%)';
        },
    }
};
</script>

<style lang="scss">
.cse-desktop--time-slider
{
    display:block;

    font-size:90%;

    padding: 8px;

    max-width:400px;
    width:300px;
    height:200px;
    background: rgba(0,0,0,0);
    color: white;
}
</style>