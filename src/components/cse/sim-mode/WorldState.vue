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
                <v-tabs
                    v-model="tabs.current"
                    align-with-title
                    class="compact"
                >
                    <v-tabs-slider color="accent" />
                    <v-tab key="Atmosphere">
                        {{ $t('worldSettings.atmosphere.Atmosphere', languageID) }}
                    </v-tab>
                    <v-tab key="Water">
                        {{ $t('worldSettings.water.Water', languageID) }}
                    </v-tab>
                </v-tabs>
                <v-tabs-items
                    v-model="tabs.current"
                >
                    <v-tab-item
                        key="Atmosphere"
                    >
                        <v-form class="compact no-messages">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-cloudy</v-icon>
                                        {{ $t('worldSettings.atmosphere.Clouds', languageID) }}
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Density', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.cloud.density"
                                            min="0"
                                            max="100"
                                            step="1"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <percent-field v-model="tabs.atmosphere.cloud.density" />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Lower Altitude', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.cloud.altitude"
                                            min="0"
                                            max="20000"
                                            step="1"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <length-field
                                            v-model="tabs.atmosphere.cloud.altitude"
                                            :show-unit-options="false"
                                            :display-units="LENGTH_UNITS.METERS"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Upper Altitude', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.cloud.height"
                                            min="0"
                                            max="20000"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <length-field
                                            v-model="tabs.atmosphere.cloud.height"
                                            :show-unit-options="false"
                                            :display-units="LENGTH_UNITS.METERS"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Lightning', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.cloud.lightning"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            hide-details="auto"
                                            hint="Strikes per minute per 100km2"
                                            persistent-hint
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field
                                            v-model="tabs.atmosphere.cloud.lightning"
                                            type="number"
                                            reverse
                                            hide-details="auto"
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>

                        <v-form class="compact no-messages">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-fog</v-icon>
                                        {{ $t('worldSettings.atmosphere.Fog', languageID) }}
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="9">
                                        <v-slider
                                            v-model="tabs.atmosphere.fog.density"
                                            :label="$t('worldSettings.atmosphere.Density', languageID)"
                                            persistent-hint
                                            min="0"
                                            max="100"
                                            step="1"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <percent-field v-model="tabs.atmosphere.fog.density" />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <label>
                                            {{ $t('worldSettings.atmosphere.Height', languageID) }}
                                        </label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.fog.height"
                                            min="0"
                                            max="20000"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <length-field
                                            v-model="tabs.atmosphere.fog.height"
                                            :show-unit-options="false"
                                            :display-units="LENGTH_UNITS.METERS"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Scattering', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.fog.scattering"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <percent-field v-model="tabs.atmosphere.fog.scattering" />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>

                        <v-form class="compact">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-hazy</v-icon>
                                        {{ $t('worldSettings.atmosphere.Haze', languageID) }}
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Density', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.haze.density"
                                            min="0"
                                            max="100"
                                            step="1"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <percent-field v-model="tabs.atmosphere.haze.density" />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>

                        <v-form class="compact no-messages">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-pouring</v-icon>
                                        {{ $t('worldSettings.atmosphere.Precipitation', languageID) }}
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Type', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="9">
                                        <v-select
                                            v-model="tabs.atmosphere.precipitation.type"
                                            :items="precipitationTypes"
                                            :label="$t('worldSettings.atmosphere.Type', languageID)"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>
                                            {{ $t('worldSettings.atmosphere.Rate', languageID) }}
                                        </v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.precipitation.rate"
                                            :disabled="tabs.atmosphere.precipitation.type==='none'"
                                            min="0"
                                            max="100"
                                            step="1"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <percent-field
                                            v-model="tabs.atmosphere.precipitation.rate"
                                            :disabled="tabs.atmosphere.precipitation.type==='none'"
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>
                    </v-tab-item>

                    <v-tab-item
                        key="Water"
                    >
                        <v-card flat>
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
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
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
    name: 'editor-ui',
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
                current: 'Atmosphere',
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
