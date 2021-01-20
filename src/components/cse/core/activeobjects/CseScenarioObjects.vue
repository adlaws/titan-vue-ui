<template>
    <cse-dockable
        title="ACTIVE OBJECTS"
        icon="mdi-lightning-bolt"
        :width="width"
        :height="height"
        :offset="offset"
        :dock="dock"
        :draggable="draggable"
        :collapsed="false"
    >
        <div style="margin:4px;margin-top:16px;">
            <v-row>
                <v-col cols="12">
                    <v-text-field
                        v-model.trim="textFilter"
                        trim
                        label="Search"
                        dense
                        append-icon="mdi-magnify"
                        clearable
                    />
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="1">
                    <v-btn
                        small
                        :disabled="!hasFilters()"
                        @click="clearFilters"
                    >
                        <v-icon>
                            mdi-filter-remove
                        </v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateAllianceFilter"
                    >
                        <v-icon
                            :color="allianceColor(allianceFilter)"
                        >
                            mdi-flag{{ allianceFilter === null ? '-outline' : '' }}
                        </v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateLockFilter"
                    >
                        <v-icon
                            :color="lockFilter === null ? '' : 'warning'"
                        >
                            mdi-lock{{ lockFilter === null ? '-off-outline' : (lockFilter === true ? '' : '-open-variant') }}
                        </v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateControlFilter"
                    >
                        <v-icon
                            :color="controlFilter === null ? '' : 'warning'"
                        >
                            {{ controlFilter === null ? 'mdi-google-controller-off' : (controlFilter === 'ai' ? 'mdi-robot' : 'mdi-google-controller') }}
                        </v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateDomainFilter"
                    >
                        <v-icon
                            :color="domainFilter === null ? '' : 'warning'"
                        >
                            mdi-{{ domainIcon(domainFilter) }}
                        </v-icon>
                    </v-btn>
                </v-col>
                <v-col cols="3">
                    <v-select
                        v-model="countryFilter"
                        dense
                        clearable
                        :items="countryFilterOptions"
                        label="Country"
                        multiple
                    >
                        <template v-slot:selection="data">
                            <v-chip
                                small
                                close
                                @click:close="removeCountryFilter(data.item)"
                            >
                                <country-flag
                                    :alpha2="data.item"
                                />
                            </v-chip>
                        </template>
                        <template v-slot:item="data">
                            <v-checkbox :value="countryFilter.indexOf(data.item)!==-1" />
                            <country-flag class="mr-2" :alpha2="data.item" />
                            {{ countryLookup(data.item).name }}
                        </template>
                    </v-select>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12">
                    <v-tabs
                        v-model="tab"
                        vertical
                    >
                        <v-tab>
                            <v-icon left>
                                mdi-tank
                            </v-icon>
                            &times;{{ vehicles.length }}
                        </v-tab>
                        <v-tab>
                            <v-icon left>
                                mdi-human
                            </v-icon>
                            &times;{{ lifeforms.length }}
                        </v-tab>
                        <v-tab>
                            <v-icon left>
                                mdi-cube
                            </v-icon>
                            &times;{{ others.length }}
                        </v-tab>
                        <v-tabs-items v-model="tab">
                            <v-tab-item>
                                <vehicle-table
                                    :vehicles="vehicles"
                                    :scenario-objects="scenarioObjects"
                                    :scenario-objects-by-uid="scenarioObjectsByUid"
                                />
                            </v-tab-item>
                            <v-tab-item>
                                <lifeform-table
                                    :lifeforms="lifeforms"
                                    :scenario-objects="scenarioObjects"
                                />
                            </v-tab-item>
                            <v-tab-item>
                                <objects-table
                                    :objects="others"
                                    :scenario-objects="scenarioObjects"
                                />
                            </v-tab-item>
                        </v-tabs-items>
                    </v-tabs>
                </v-col>
            </v-row>
        </div>
    </cse-dockable>
</template>

<script>
import { /*$tLogger*/ } from '@/assets/js/titan/titan-utils.js';
import { COUNTRY } from '@/assets/js/utils/countries.js';

import CseDockable from '@/components/cse/core/CseDockable.vue';
import CountryFlag from '@/components/cse/core/CountryFlag.vue';
import VehicleTable from './VehicleTable.vue';
import LifeformTable from './LifeformTable.vue';
import ObjectsTable from './ObjectsTable.vue';

const KIND = {
    VEHICLE:'vehicle',
    LIFEFORM:'lifeform',
};

export default {
    name:'cse-scenario-objects',
    components:{
        CseDockable, CountryFlag,
        VehicleTable, LifeformTable, ObjectsTable,
    },
    props:
    {
        dock:
        {
            type: String,
            default: 'e'
        },
        width:
        {
            type: Number,
            default: 700,
        },
        height:
        {
            type: Number,
            default: 500,
        },
        offset:
        {
            type: [Number, String],
            default: 'end',
        },
        draggable:
        {
            type: Boolean,
            default: false,
        },
    },
    data()
    {
        return {
            tab: null,
            textFilter:'',
            countryFilter: [],
            allianceFilter: null,
            domainFilter: null,
            lockFilter: null,
            controlFilter: null,
            scenarioObjects: [
                {
                    uid:1,
                    model:'Abrams M1A1',
                    kind:KIND.VEHICLE,
                    domain:'land',
                    name:'Tank A',
                    country:'au',
                    alliance:'blufor',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[
                        {role: 'Driver', uid: 3},
                        {role: 'Passenger 1', uid: 4},
                    ],
                },
                {
                    uid:2,
                    model:'Bushmaster PMV',
                    name:'BushMan',
                    kind:KIND.VEHICLE,
                    domain:'land',
                    country:'au',
                    alliance:'blufor',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[],
                },
                {
                    uid:3,
                    model:'CAMCU AU',
                    kind:KIND.LIFEFORM,
                    domain:'land',
                    name:'George',
                    country:'au',
                    alliance:'blufor',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                },
                {
                    uid:4,
                    model:'CAMCU AU',
                    kind:KIND.LIFEFORM,
                    domain:'land',
                    name:'Sam',
                    country:'au',
                    alliance:'blufor',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                },
                {
                    uid:5,
                    model:'MRH',
                    name:'Chopper',
                    kind:KIND.VEHICLE,
                    domain:'land',
                    country:'au',
                    alliance:'blufor',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[],
                },
                {
                    uid:100,
                    model:'Abrams M1A1',
                    kind:KIND.VEHICLE,
                    domain:'land',
                    name:'Tankovski',
                    country:'ru',
                    alliance:'opfor',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[
                        {role: 'Driver', uid: 101},
                    ],
                },
                {
                    uid:101,
                    model:'CAMCU AU',
                    kind:KIND.LIFEFORM,
                    domain:'land',
                    name:'Yuri',
                    country:'ru',
                    alliance:'opfor',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                },
            ],
        };
    },
    computed:
    {
        countryFilterOptions()
        {
            const countries = Array.from(new Set(this.scenarioObjects.map(x=>x.country)));
            countries.sort();
            return countries;
        },
        vehicles()
        {
            let vehicles = this.scenarioObjects.filter(x => x.kind===KIND.VEHICLE);
            return this.filterItems(vehicles);
        },
        lifeforms()
        {
            let lifeforms = this.scenarioObjects.filter(x => x.kind===KIND.LIFEFORM);
            return this.filterItems(lifeforms);
        },
        others() { return this.scenarioObjects.filter(x => !(x.kind===KIND.VEHICLE || x.kind===KIND.LIFEFORM)); },
        scenarioObjectsByUid()
        {
            return this.scenarioObjects
                .map((x) => [x.uid, x])
                .reduce((obj,[key,val]) => (obj[key] = val,obj), {});
        },
    },
    methods:
    {
        countryLookup(alpha2)
        {
            return COUNTRY.ALPHA2[alpha2] || {name: 'UNKNOWN', alpha2: alpha2, alpha3: '---', numeric: -1};
        },
        hasFilters()
        {
            return this.lockFilter !== null ||
                this.controlFilter !== null ||
                this.domainFilter !== null ||
                this.allianceFilter !== null ||
                this.countryFilter.length > 0 ||
                this.textFilter.length > 0;
        },
        clearFilters()
        {
            this.lockFilter = null;
            this.controlFilter = null;
            this.domainFilter = null;
            this.allianceFilter = null;
            this.countryFilter = [];
            this.textFilter = '';
        },
        filterItems(items)
        {
            // cheapest / most likely to knock out the most things goes first
            if(this.lockFilter !== null)
                items = items.filter(x => x.locked === this.lockFilter);

            if(this.controlFilter !== null)
                items = items.filter(x => x.controlledBy === this.controlFilter);

            if(this.domainFilter !== null)
                items = items.filter(x => x.domain === this.domainFilter);

            if(this.allianceFilter !== null)
                items = items.filter(x => x.alliance === this.allianceFilter);

            if(this.countryFilter.length>0)
                items = items.filter(x => this.countryFilter.indexOf(x.country)>=0);

            // most expensive filter goes last
            if(this.textFilter.length > 0)
            {
                const lCaseFilter = this.textFilter.toLowerCase();
                items = items.filter(x=>
                {
                    return x.model.toLowerCase().indexOf(lCaseFilter)>=0 ||
                        x.name.toLowerCase().indexOf(lCaseFilter)>=0;
                });
            }

            return items;
        },
        removeCountryFilter(country)
        {
            for(let idx=0;idx<this.countryFilter.length;idx++)
            {
                if(this.countryFilter[idx] === country)
                {
                    this.countryFilter.splice(idx, 1);
                    return;
                }
            }
        },
        updateAllianceFilter()
        {
            if(this.allianceFilter === null)
                this.allianceFilter = 'blufor';
            else if(this.allianceFilter === 'blufor')
                this.allianceFilter = 'opfor';
            else if(this.allianceFilter === 'opfor')
                this.allianceFilter = 'civilian';
            else if(this.allianceFilter === 'civilian')
                this.allianceFilter = 'neutral';
            else
                this.allianceFilter = null;
        },
        allianceColor(alliance)
        {
            if(alliance === null)
                return '';
            if(alliance === 'blufor')
                return '#04f';
            if(alliance === 'opfor')
                return '#F00';
            if(alliance === 'civilian')
                return '#4f4';
            // neutral
            return '#Ff0';
        },
        updateDomainFilter()
        {
            if(this.domainFilter === null)
                this.domainFilter = 'land';
            else if(this.domainFilter === 'land')
                this.domainFilter = 'surface';
            else if(this.domainFilter === 'surface')
                this.domainFilter = 'subsurface';
            else if(this.domainFilter === 'subsurface')
                this.domainFilter = 'air';
            else if(this.domainFilter === 'air')
                this.domainFilter = 'space';
            else
                this.domainFilter = null;
        },
        domainIcon(domain)
        {
            if(domain === null)
                return 'earth-off';
            if(domain === 'land')
                return 'car';
            if(domain === 'surface')
                return 'ferry';
            if(domain === 'subsurface')
                return 'submarine';
            if(domain === 'air')
                return 'airplane';
            if(domain === 'space')
                return 'space-station';
            return 'crosshairs-question';
        },
        updateLockFilter()
        {
            if(this.lockFilter === null)
                this.lockFilter = true;
            else if(this.lockFilter === true)
                this.lockFilter = false;
            else
                this.lockFilter = null;
        },
        updateControlFilter()
        {
            if(this.controlFilter === null)
                this.controlFilter = 'ai';
            else if(this.controlFilter === 'ai')
                this.controlFilter = 'player';
            else
                this.controlFilter = null;
        },
    }
};
</script>