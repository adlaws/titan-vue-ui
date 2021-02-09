<template>
    <cse-desktop-window
        title="World"
        icon="passport"
        :x="150"
        :y="150"
        :width="420"
        :min-width="420"
        :height="605"
        :resizable="true"
        :closable="false"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <TabView>
                    <TabPanel
                        :header="$t('worldSettings.atmosphere.Atmosphere', languageID)"
                    >
                        <div class="p-grid p-formgrid">
                            <div class="p-text-bold">
                                <cse-icon icon="weather-cloudy" />
                                {{ $t('worldSettings.atmosphere.Clouds', languageID) }}
                            </div>
                        </div>

                        <div class="p-grid p-formgrid">
                            <div
                                class="p-col-6"
                                style="padding-bottom:0;"
                            >
                                <length-field
                                    v-model="tabs.atmosphere.cloud.altitude[0]"
                                    class="p-inputtext-sm"
                                    :label="$t('worldSettings.atmosphere.Lower Altitude', languageID)"
                                    :slider="false"
                                    :min="0"
                                    :max="tabs.atmosphere.cloud.altitude[1]"
                                />
                            </div>
                            <div
                                class="p-col-6"
                                style="padding-bottom:0;"
                            >
                                <length-field
                                    v-model="tabs.atmosphere.cloud.altitude[1]"
                                    class="p-inputtext-sm"
                                    :label="$t('worldSettings.atmosphere.Upper Altitude', languageID)"
                                    :slider="false"
                                    :min="tabs.atmosphere.cloud.altitude[0]"
                                    :max="50000"
                                />
                            </div>
                        </div>
                        <div class="p-grid p-formgrid">
                            <div
                                class="p-col-12"
                                style="padding-top:0;"
                            >
                                <Slider
                                    v-model="tabs.atmosphere.cloud.altitude"
                                    :range="true"
                                    :min="0"
                                    :max="50000"
                                    :step="1"
                                />
                            </div>
                        </div>

                        <div class="p-grid p-formgrid">
                            <div class="p-col-6">
                                <percent-field
                                    v-model="tabs.atmosphere.cloud.density"
                                    :label="$t('worldSettings.atmosphere.Density', languageID)"
                                    class="p-inputtext-sm"
                                />
                            </div>
                            <div class="p-col-6">
                                <label>
                                    {{ $t('worldSettings.atmosphere.Lightning', languageID) }}
                                </label>
                                <InputNumber
                                    v-model="tabs.atmosphere.cloud.lightning"
                                    mode="decimal"
                                    :min="0"
                                    :max="10"
                                    :min-fraction-digits="0"
                                    :max-fraction-digits="1"
                                    suffix=" strikes/minute"
                                    class="p-inputtext-sm"
                                />
                                <Slider
                                    v-model="tabs.atmosphere.cloud.lightning"
                                    :min="0"
                                    :max="10"
                                    :step="0.1"
                                />
                                <small>per 100km2</small>
                            </div>
                        </div>

                        <div class="p-grid">
                            <div class="p-text-bold">
                                <cse-icon icon="weather-pouring" />
                                {{ $t('worldSettings.atmosphere.Precipitation', languageID) }}
                            </div>
                        </div>

                        <div class="p-grid p-formgrid">
                            <div class="p-col-6">
                                <label>Type</label>
                                <br>
                                <Dropdown
                                    v-model="tabs.atmosphere.precipitation.type"
                                    :options="precipitationTypes"
                                    option-label="text"
                                    option-value="value"
                                    class="p-dropdown-sm"
                                />
                            </div>
                            <div class="p-col-6">
                                <percent-field
                                    v-model="tabs.atmosphere.precipitation.rate"
                                    :disabled="tabs.atmosphere.precipitation.type==='none'"
                                    :label="$t('worldSettings.atmosphere.Rate', languageID)"
                                    class="p-inputtext-sm"
                                />
                            </div>
                        </div>

                        <div class="p-grid">
                            <div class="p-text-bold">
                                <cse-icon icon="weather-fog" />
                                {{ $t('worldSettings.atmosphere.Fog', languageID) }}
                            </div>
                        </div>

                        <div class="p-grid p-formgrid">
                            <div class="p-col-6">
                                <percent-field
                                    v-model="tabs.atmosphere.fog.density"
                                    :label="$t('worldSettings.atmosphere.Density', languageID)"
                                    class="p-inputtext-sm"
                                />
                            </div>
                            <div class="p-col-6">
                                <length-field
                                    v-model="tabs.atmosphere.fog.height"
                                    :label="$t('worldSettings.atmosphere.Height', languageID)"
                                    show-unit-options
                                    :display-units="LENGTH_UNITS.METERS"
                                    :min="0"
                                    :max="20000"
                                    class="p-inputtext-sm"
                                />
                            </div>
                        </div>

                        <div class="p-grid p-formgrid">
                            <div class="p-col-6">
                                <percent-field
                                    v-model="tabs.atmosphere.fog.scattering"
                                    :label="$t('worldSettings.atmosphere.Scattering', languageID)"
                                    class="p-inputtext-sm"
                                />
                            </div>
                        </div>

                        <div class="p-grid">
                            <div class="p-text-bold">
                                <cse-icon icon="weather-hazy" />
                                {{ $t('worldSettings.atmosphere.Haze', languageID) }}
                            </div>
                        </div>

                        <div class="p-grid p-formgrid">
                            <div class="p-col-6">
                                <percent-field
                                    v-model="tabs.atmosphere.haze.density"
                                    :label="$t('worldSettings.atmosphere.Density', languageID)"
                                    class="p-inputtext-sm"
                                />
                            </div>
                        </div>
                    </TabPanel>
                    <TabPanel
                        :header="$t('worldSettings.water.Water', languageID)"
                    >
                        <Card>
                            <template #content>
                                <speed-field
                                    v-model="theSpeed"
                                    show-unit-options
                                    :display-units="SPEED_UNITS.KILOMETERS_PER_HOUR"
                                    class="p-inputtext-sm"
                                />
                                {{ theSpeed }}{{ SPEED_UNITS.METERS_PER_SECOND.abbr }}
                                <temperature-field
                                    v-model="theTemp"
                                    show-unit-options
                                    :display-units="TEMPERATURE_UNITS.FAHRENHEIT"
                                    class="p-inputtext-sm"
                                />
                                {{ theTemp }}{{ TEMPERATURE_UNITS.CELSIUS.abbr }}
                            </template>
                        </Card>
                    </TabPanel>
                </TabView>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';
import Dropdown from 'primevue/dropdown';
import Card from 'primevue/card';

import SpeedField from '@/components/common/cse/core/field/SpeedField.vue';
import TemperatureField from '@/components/common/cse/core/field/TemperatureField.vue';
import LengthField from '@/components/common/cse/core/field/LengthField.vue';
import PercentField from '@/components/common/cse/core/field/PercentField.vue';

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
        TabView, TabPanel, Card, InputNumber, Slider, Dropdown,
        SpeedField, TemperatureField, LengthField, PercentField,
    },
    data()
    {
        return {
            value4:[20, 40],
            theSpeed: 0,
            theTemp: 0,
            tabs:
            {
                current: 'Atmosphere',
                atmosphere: {
                    cloud: {
                        density: 0.0,
                        altitude: [20000.0, 27000.0],
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
