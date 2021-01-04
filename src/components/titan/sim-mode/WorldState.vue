<template>
    <titan-window
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
            <titan-window-content :titan-window="context.titanWindow">
                <v-tabs
                    v-model="tabs.current"
                    align-with-title
                >
                    <v-tabs-slider color="accent" />
                    <v-tab key="Atmosphere">
                        Atmosphere
                    </v-tab>
                    <v-tab key="Water">
                        Water
                    </v-tab>
                </v-tabs>
                <v-tabs-items
                    v-model="tabs.current"
                >
                    <v-tab-item
                        key="Atmosphere"
                    >
                        <v-form class="super-compact no-messages">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-cloudy</v-icon>
                                        Clouds
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Density</v-label>
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
                                    <v-col>
                                        <v-text-field
                                            v-model="tabs.atmosphere.cloud.density"
                                            type="number"
                                            suffix="%"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Lower Altitude</v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.cloud.altitude"
                                            min="0"
                                            max="20000"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field
                                            v-model="tabs.atmosphere.cloud.altitude"
                                            type="number"
                                            suffix="m"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Upper Altitude</v-label>
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
                                        <v-text-field
                                            v-model="tabs.atmosphere.cloud.height"
                                            type="number"
                                            suffix="m"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Lightning</v-label>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-slider
                                            v-model="tabs.atmosphere.cloud.lightning"
                                            min="0"
                                            max="10"
                                            step="0.1"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col cols="3">
                                        <v-text-field
                                            v-model="tabs.atmosphere.cloud.lightning"
                                            type="number"
                                            suffix="/min"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>

                        <v-form class="super-compact no-messages">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-fog</v-icon>
                                        Fog
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="9">
                                        <v-slider
                                            v-model="tabs.atmosphere.fog.density"
                                            label="Density"
                                            persistent-hint
                                            min="0"
                                            max="100"
                                            step="1"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                    <v-col>
                                        <v-text-field
                                            v-model="tabs.atmosphere.fog.density"
                                            persistent-hint
                                            type="number"
                                            suffix="%"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <label>Height</label>
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
                                        <v-text-field
                                            v-model="tabs.atmosphere.fog.height"
                                            type="number"
                                            suffix="m"
                                            hide-details="auto"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Scattering</v-label>
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
                                        <v-text-field
                                            v-model="tabs.atmosphere.fog.scattering"
                                            type="number"
                                            suffix="%"
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>

                        <v-form class="super-compact">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-hazy</v-icon>
                                        Haze
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Density</v-label>
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
                                        <v-text-field
                                            v-model="tabs.atmosphere.haze.density"
                                            reverse
                                            prefix="%"
                                            hide-details="auto"
                                            :rules="[percentValidator,]"
                                        />
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>

                        <v-form class="super-compact no-messages">
                            <v-container>
                                <v-row>
                                    <v-col class="font-weight-bold">
                                        <v-icon>mdi-weather-pouring</v-icon>
                                        Precipitation
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Type</v-label>
                                    </v-col>
                                    <v-col>
                                        <v-select
                                            v-model="tabs.atmosphere.precipitation.type"
                                            :items="precipitationTypes"
                                            label="Type"
                                        />
                                    </v-col>
                                </v-row>
                                <v-row>
                                    <v-col cols="3" class=" my-auto">
                                        <v-label>Rate</v-label>
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
                                        <v-text-field
                                            v-model="tabs.atmosphere.precipitation.rate"
                                            :disabled="tabs.atmosphere.precipitation.type==='none'"
                                            type="number"
                                            suffix="%"
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
                            <v-card-text>Water</v-card-text>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import TitanWindow from '@/components/common/titan/TitanWindow.vue';
import TitanWindowContent from '@/components/common/titan/TitanWindowContent.vue';

export default {
    name: 'editor-ui',
    components:
    {
        TitanWindow, TitanWindowContent,
    },
    data()
    {
        return {
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
            precipitationTypes:[
                {text:'None', value:'none'},
                {text:'Rain', value:'rain'},
                {text:'Snow', value:'snow'},
            ],
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
            }
        };
    },
    methods:
    {
        applyPreset()
        {

        }
    }
};
</script>

<style lang="scss">
</style>
