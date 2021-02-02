<template>
    <cse-desktop-window
        title="World"
        icon="passport"
        :x="150"
        :y="150"
        :width="450"
        :min-width="403"
        :height="545"
        :resizable="true"
        :closable="false"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <b-tabs
                    v-model="tabs.current"
                    class="compact"
                >
                    <b-tab-item
                        :label="$t('worldSettings.atmosphere.Atmosphere', languageID)"
                    >
                        <div class="container">
                            <div class="columns">
                                <div
                                    class="column font-weight-bold"
                                >
                                    <b-icon
                                        icon="weather-cloudy"
                                    />
                                    {{ $t('worldSettings.atmosphere.Clouds', languageID) }}
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Density', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.cloud.density"
                                        :min="0"
                                        :max="100"
                                        :step="1"
                                        hide-details="auto"
                                    />
                                </div>
                                <div class="column is-3">
                                    <percent-field v-model="tabs.atmosphere.cloud.density" />
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Lower Altitude', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.cloud.altitude"
                                        :min="0"
                                        :max="20000"
                                        :step="1"
                                        hide-details="auto"
                                    />
                                </div>
                                <div class="column is-3">
                                    <length-field
                                        v-model="tabs.atmosphere.cloud.altitude"
                                        :show-unit-options="false"
                                        :display-units="LENGTH_UNITS.METERS"
                                    />
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Upper Altitude', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.cloud.height"
                                        :min="0"
                                        :max="20000"
                                        hide-details="auto"
                                    />
                                </div>
                                <div class="column is-3">
                                    <length-field
                                        v-model="tabs.atmosphere.cloud.height"
                                        :show-unit-options="false"
                                        :display-units="LENGTH_UNITS.METERS"
                                    />
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Lightning', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.cloud.lightning"
                                        :min="0"
                                        :max="10"
                                        :step="0.1"
                                        hide-details="auto"
                                        hint="Strikes per minute per 100km2"
                                        persistent-hint
                                    />
                                </div>
                                <div class="column is-3">
                                    <b-input
                                        v-model="tabs.atmosphere.cloud.lightning"
                                        type="number"
                                        reverse
                                        hide-details="auto"
                                    />
                                </div>
                            </div>

                            <div class="columns">
                                <div class="column font-weight-bold">
                                    <b-icon
                                        icon="weather-fog"
                                    />
                                    {{ $t('worldSettings.atmosphere.Fog', languageID) }}
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Density', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.fog.density"
                                        persistent-hint
                                        :min="0"
                                        :max="100"
                                        :step="1"
                                        hide-details="auto"
                                    />
                                </div>
                                <div class="column is-3">
                                    <percent-field v-model="tabs.atmosphere.fog.density" />
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Height', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.fog.height"
                                        :min="0"
                                        :max="20000"
                                        hide-details="auto"
                                    />
                                </div>
                                <div class="column is-3">
                                    <length-field
                                        v-model="tabs.atmosphere.fog.height"
                                        show-unit-options
                                        :display-units="LENGTH_UNITS.METERS"
                                    />
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Scattering', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.fog.scattering"
                                        :min="0"
                                        :max="10"
                                        :step="0.1"
                                    />
                                </div>
                                <div class="column is-3">
                                    <percent-field v-model="tabs.atmosphere.fog.scattering" />
                                </div>
                            </div>

                            <div class="columns">
                                <div class="column font-weight-bold">
                                    <b-icon
                                        icon="weather-hazy"
                                    />
                                    {{ $t('worldSettings.atmosphere.Haze', languageID) }}
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Density', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.haze.density"
                                        :min="0"
                                        :max="100"
                                        :step="1"
                                        hide-details="auto"
                                    />
                                </div>
                                <div class="column is-3">
                                    <percent-field v-model="tabs.atmosphere.haze.density" />
                                </div>
                            </div>
                        </div>

                        <div class="container">
                            <div class="columns">
                                <div class="column font-weight-bold">
                                    <b-icon
                                        icon="weather-pouring"
                                    />
                                    {{ $t('worldSettings.atmosphere.Precipitation', languageID) }}
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Type', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-9">
                                    <b-select
                                        v-model="tabs.atmosphere.precipitation.type"
                                    >
                                        <option
                                            v-for="(item, idx) in precipitationTypes"
                                            :key="`precipitation-${idx}`"
                                            :value="item.value"
                                        >
                                            {{ item.text }}
                                        </option>
                                    </b-select>
                                </div>
                            </div>
                            <div class="columns">
                                <div class="column is-3 my-auto">
                                    <label>
                                        {{ $t('worldSettings.atmosphere.Rate', languageID) }}
                                    </label>
                                </div>
                                <div class="column is-6">
                                    <b-slider
                                        v-model="tabs.atmosphere.precipitation.rate"
                                        :disabled="tabs.atmosphere.precipitation.type==='none'"
                                        :min="0"
                                        :max="100"
                                        :step="1"
                                    />
                                </div>
                                <div class="column is-3">
                                    <percent-field
                                        v-model="tabs.atmosphere.precipitation.rate"
                                        :disabled="tabs.atmosphere.precipitation.type==='none'"
                                    />
                                </div>
                            </div>
                        </div>
                    </b-tab-item>

                    <b-tab-item
                        :label="$t('worldSettings.water.Water', languageID)"
                    >
                        <div class="card" flat>
                            <speed-field
                                v-model="theSpeed"
                                show-unit-options
                                :display-units="SPEED_UNITS.KILOMETERS_PER_HOUR"
                            />
                            {{ theSpeed }}{{ SPEED_UNITS.METERS_PER_SECOND.abbr }}
                            <temperature-field
                                v-model="theTemp"
                                show-unit-options
                                :display-units="TEMPERATURE_UNITS.FAHRENHEIT"
                            />
                            {{ theTemp }}{{ TEMPERATURE_UNITS.CELSIUS.abbr }}
                        </div>
                    </b-tab-item>
                </b-tabs>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import CseDesktopWindow from '@/components/common/cse/CseDesktopWindow.vue';
import CseDesktopWindowContent from '@/components/common/cse/CseDesktopWindowContent.vue';
import SpeedField from '@/components/cse/core/field/SpeedField.vue';
import TemperatureField from '@/components/cse/core/field/TemperatureField.vue';
import LengthField from '@/components/cse/core/field/LengthField.vue';
import PercentField from '@/components/cse/core/field/PercentField.vue';

import { TEMPERATURE_UNITS, SPEED_UNITS, LENGTH_UNITS } from '@/assets/js/utils/convert-utils.js';

const PRECIPITATION_TYPES = [
    {text:'worldSettings.atmosphere.None', value:'none'},
    {text:'worldSettings.atmosphere.Rain', value:'rain'},
    {text:'worldSettings.atmosphere.Snow', value:'snow'},
];

export default {
    name: 'world-state',
    components:
    {
        CseDesktopWindow, CseDesktopWindowContent,
        SpeedField, TemperatureField, LengthField, PercentField,
    },
    data()
    {
        return {
            theSpeed: 0,
            theTemp: 0,
            tabs:
            {
                current: 0,
                atmosphere: {
                    cloud: {
                        density: 0.0,
                        altitude: 20000.0,
                        height: 2277.0,
                        lightning: 0.0,
                    },
                    fog: {
                        height: 0.0,
                        density: 0.0,
                        scattering: 0.0,
                        stuff: 'stuff',
                    },
                    haze: {
                        density: 0.0,
                    },
                    precipitation: {
                        type: 'none',
                        rate: 0.0,
                    },
                }
            },
            percentValidator(val)
            {
                const isPositiveInt = /^\d*$/.test(val);

                if(isPositiveInt)
                {
                    const value = parseInt(val, 10);
                    if(value >= 0 && value <=100)
                        return true;
                }
                return 'Percentage required';
            },
            SPEED_UNITS,
            TEMPERATURE_UNITS,
            LENGTH_UNITS,
        };
    },
    computed:
    {
        languageID() {return this.$store.getters.language.id; },
        precipitationTypes()
        {
            return PRECIPITATION_TYPES.map((item)=>
            {
                return {text: this.$t(item.text, this.languageID), value: item.value};
            });
        }
    },
};
</script>
