<template>
    <div class="cse-desktop--date-time-widget">
        <div class="columns">
            <div class="column is-4">
                <b-input
                    v-model="theTime"
                    prepend-icon="clock-outline"
                    label="Time"
                />
                <b-slider
                    v-model="dayOffset"
                    :min="0"
                    :max="1439"
                    :step="1"
                />
            </div>
            <div class="column is-4">
                <b-menu
                    ref="menu"
                    v-model="menu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    offset-y
                    min-width="auto"
                >
                    <template v-slot:activator="{ on, attrs }">
                        <b-input
                            v-model="theDate"
                            label="Date"
                            prepend-icon="calendar"
                            v-bind="attrs"
                            v-on="on"
                        />
                    </template>
                    <b-date-picker
                        ref="picker"
                        v-model="theDate"
                        :max="new Date().toISOString().substr(0, 10)"
                        min="1950-01-01"
                    />
                </b-menu>
            </div>
            <div class="column is-4">
                <b-dropdown
                    v-model="theTimezone"
                    label="Timezone"
                    :items="timezones"
                />
            </div>
        </div>
        {{ theTime }}
        <br>
        {{ dayOffset }}
    </div>
</template>

<script>
export default {
    name:'date-time-widget',
    data()
    {
        return {
            theTime: '12:00:00',
            theDate: '15/6/2021',
            theTimezone: 'utc',
            dayOffset: 0,
            menu: false,
            timezones:[
                {value:'utc', text:'UTC'},
                {value:'awst', text:'AWST'},
                {value:'aest', text:'AEST'},
            ]
        };
    },
    watch:
    {
        theTime(newValue)
        {
            const parts = newValue.split(':');
            if(parts.length!==2)
                return;
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);
            if(isNaN(hours)||isNaN(minutes))
                return;

            this.dayOffset = hours * 60 + minutes;
        },
        dayOffset(newValue)
        {
            const hours = (newValue / 60) | 0;
            const minutes = (newValue - (hours * 60)) | 0;
            this.theTime = (hours<10?'0':'')+hours+':'+(minutes<10?'0':'')+minutes;
        },
    }
};
</script>

<style lang="scss">
.cse-desktop--date-time-widget
{
    position:absolute;
    bottom: 64px;
    right:0px;

    padding: 8px;

    width:400px;
    height:400px;
    background: #004;
    color: white;
}
</style>