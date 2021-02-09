<template>
    <cse-dockable
        title="ACTIVE OBJECTS"
        icon="lightning-bolt"
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
                        append-icon="magnify"
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
                        <cse-icon
                            icon="filter-remove"
                        />
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateAllianceFilter"
                    >
                        <cse-icon
                            :icon="`flag${ allianceFilter === null ? '-outline' : '' }`"
                            :color="allianceColor(allianceFilter)"
                        />
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateLockFilter"
                    >
                        <cse-icon
                            :icon="`lock${ lockFilter === null ? '-off-outline' : (lockFilter === true ? '' : '-open-variant') }`"
                            :color="lockFilter === null ? '' : 'warning'"
                        />
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateControlFilter"
                    >
                        <cse-icon
                            :icon="controlFilter === null ? 'google-controller-off' : (controlFilter === 'ai' ? 'robot' : 'google-controller')"
                            :color="controlFilter === null ? '' : 'warning'"
                        />
                    </v-btn>
                </v-col>
                <v-col cols="1">
                    <v-btn
                        small
                        @click="updateDomainFilter"
                    >
                        <cse-icon
                            :icon="`${ domainIcon(domainFilter) }`"
                            :color="domainFilter === null ? '' : 'warning'"
                        />
                    </v-btn>
                </v-col>
                <v-col cols="3">
                    <v-select
                        v-model="countryFilter"
                        dense
                        clearable
                        :items="entityCountries"
                        item-value="numeric"
                        label="Country"
                        multiple
                    >
                        <template v-slot:selection="{ item, index }">
                            <v-chip
                                small
                                close
                                @click:close="countryFilter.splice(index,1)"
                            >
                                <country-flag
                                    :alpha2="item.alpha2"
                                />
                            </v-chip>
                        </template>
                        <template v-slot:item="{ item, attrs }">
                            <v-checkbox :value="attrs.inputValue" />
                            <country-flag class="mr-2" :alpha2="item.alpha2" />
                            {{ item.name }}
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
                            <cse-icon
                                icon="tank"
                            />
                            &times;{{ vehicles.length }}
                        </v-tab>
                        <v-tab>
                            <cse-icon
                                icon="human"
                            />
                            &times;{{ lifeforms.length }}
                        </v-tab>
                        <v-tab>
                            <cse-icon
                                icon="cube"
                            />
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
import CountryFlag from '@/components/common/cse/core/CountryFlag.vue';
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
        CountryFlag,
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
                    country:{name: 'Australia', lcasename: 'australia', alpha2: 'au', alpha3: 'aus', numeric: 36},
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
                    country:{name: 'Australia', lcasename: 'australia', alpha2: 'au', alpha3: 'aus', numeric: 36},
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
                    country:{name: 'Australia', lcasename: 'australia', alpha2: 'au', alpha3: 'aus', numeric: 36},
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
                    country:{name: 'Australia', lcasename: 'australia', alpha2: 'au', alpha3: 'aus', numeric: 36},
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
                    country:{name: 'Australia', lcasename: 'australia', alpha2: 'au', alpha3: 'aus', numeric: 36},
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
                    country:{name: 'Russia', lcasename: 'russia', alpha2: 'ru', alpha3: 'rus', numeric: 643},
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
                    country:{name: 'Russia', lcasename: 'russia', alpha2: 'ru', alpha3: 'rus', numeric: 643},
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
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        // create an array containing all (unique) countries referenced by *active* Titan entities
        //entityCountries() { return this.$store.getters.titanEntityCountries; },
        entityCountries()
        {
            const entitiesWithCountry = this.scenarioObjects.filter(x=>x.country);
            const uniqueCountries = [];
            const alpha2codes = new Set();
            for(let idx=0; idx<entitiesWithCountry.length; idx++)
            {
                const entityCountry = entitiesWithCountry[idx].country;
                if(!alpha2codes.has(entityCountry.alpha2))
                {
                    alpha2codes.add(entityCountry.alpha2);
                    uniqueCountries.push(entityCountry);
                }

            }
            uniqueCountries.sort((a,b)=> a.lcasename < b.lcasename ? -1 : 1);
            return uniqueCountries;
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
            {
                items = items.filter(x =>
                {
                    if(x.country && x.country.numeric)
                    {
                        // do any of the countries in the filter match the entities country?
                        return this.countryFilter.some(country => country === x.country.numeric);
                    }
                    return false;
                });
            }

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