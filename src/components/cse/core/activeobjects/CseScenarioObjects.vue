<template>
    <cse-dockable
        title="ACTIVE"
        icon="mdi-lightning-bolt"
        :width="width"
        :height="height"
        :offset="offset"
        :dock="dock"
        :draggable="draggable"
        :collapsed="false"
    >
        <v-container>
            <v-text-field
                label="Search"
                dense
                append-icon="mdi-magnify"
                clearable
            />
            <v-select
                v-model="filters"
                dense
                clearable
                :items="filterChoices"
                label="Filters"
                multiple
            >
                <template v-slot:selection="data">
                    <v-chip
                        small
                        close
                        @click:close="removeFilter(data.item)"
                    >
                        <v-icon>{{ data.item.icon }}</v-icon>
                    </v-chip>
                </template>
                <template v-slot:item="data">
                    <v-checkbox :value="filters.indexOf(data.item.value)!==-1" />
                    <v-icon class="mr-2">
                        {{ data.item.icon }}
                    </v-icon>
                    {{ data.item.text }}
                </template>
            </v-select>
            <v-data-table
                dense
                item-key="uid"
                :items="scenarioObjects"
                show-expand
                single-expand
                :expanded="table.expanded"
                :headers="table.headers"
            >
                <template v-slot:[`item.country`]="{ item }">
                    <span
                        class="flag-icon"
                        :class="`flag-icon-${item.country}`"
                        :title="item.country"
                    />
                    {{ item.country.toUpperCase() }}
                </template>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-icon
                        :color="item.locked?'warning':'secondary'"
                        @click="toggleLock(item)"
                    >
                        mdi-lock{{ item.locked === false ? '-open-outline' : '' }}
                    </v-icon>
                    <v-icon
                        :color="item.cameraLocked?'primary':'secondary'"
                        @click="toggleCamera(item)"
                    >
                        {{ item.cameraLocked ? 'mdi-camera' : 'mdi-camera-outline' }}
                    </v-icon>
                    <v-icon
                        :color="item.controlledBy === 'player'?'error':'secondary'"
                        @click="toggleControl(item)"
                    >
                        {{ item.controlledBy === 'player' ? 'mdi-google-controller' : 'mdi-robot-outline' }}
                    </v-icon>
                </template>
                <template v-slot:[`item.data-table-expand`]="{ item, isExpanded, expand }">
                    <v-btn
                        v-if="item.crew && item.crew.length>0"
                        icon
                        @click="expand(!isExpanded)"
                    >
                        <v-icon
                            :class="{'mdi-rotate-180': isExpanded}"
                        >
                            mdi-chevron-down
                        </v-icon>
                    </v-btn>
                </template>
                <template v-slot:expanded-item="{ headers, item }">
                    <td :colspan="headers.length">
                        Crew:
                        <ul>
                            <!-- eslint-disable-next-line vue/require-v-for-key -->
                            <li v-for="crew in item.crew">
                                <crew-entry
                                    :crew-descriptor="crew"
                                    :crew-entry="scenarioObjects[scenarioObjectUidToIndex[crew.uid]]"
                                    @toggle-camera="toggleCamera"
                                    @toggle-lock="toggleLock"
                                    @toggle-control="toggleControl"
                                />
                            </li>
                        </ul>
                    </td>
                </template>
            </v-data-table>
        </v-container>
    </cse-dockable>
</template>

<script>
import { /*$tLogger*/ } from '@/assets/js/titan/titan-utils.js';

import CseDockable from '@/components/cse/core/CseDockable.vue';
import CrewEntry from './CrewEntry.vue';

export default {
    name:'cse-scenario-objects',
    components:{
        CseDockable, CrewEntry
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
            filters: [],
            table: {
                headers:[
                    { value: 'kind', text: 'Thing', sortable: true, align: 'start', },
                    { value: 'name', text: 'Callsign', sortable: true, align: 'start', },
                    { value: 'country', text: 'Country', sortable: true, align: 'start', },
                    { value: 'actions', text: 'Actions', sortable: false, align: 'start', },
                    { text: '', value: 'data-table-expand' },
                ],
                expanded: [],
            },
            scenarioObjects: [
                {
                    uid:1,
                    kind:'Abrams M1A1',
                    name:'Tank A',
                    country:'au',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[
                        {role: 'Driver', uid: 3},
                        {role: 'Passenger 1', uid: 4},
                    ],
                    canExpand: true,
                },
                {
                    uid:2,
                    kind:'Bushmaster PMV',
                    name:'BushMan',
                    country:'au',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[],
                    canExpand: false,
                },
                {
                    uid:3,
                    kind:'CAMCU AU',
                    name:'George',
                    country:'au',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[],
                    canExpand: false,
                },
                {
                    uid:4,
                    kind:'CAMCU AU',
                    name:'Sam',
                    country:'au',
                    locked:false,
                    cameraLocked:false,
                    controlledBy:'ai',
                    crew:[],
                    canExpand: false,
                },
            ],
            filterChoices:
            [
                {text: 'Human', value: 'human', icon: 'mdi-human'},
                {text: 'Animal', value: 'animal', icon: 'mdi-dog-side'},
                {text: 'Vehicle', value: 'vehicle', icon: 'mdi-car'},
                {text: 'Scenery', value: 'scenery', icon: 'mdi-pine-tree'},
                {text: 'Civilian', value: 'civilian', icon: 'mdi-account-tie'},
                {text: 'Military', value: 'military', icon: 'mdi-police-badge'},
                {text: 'Locked', value: 'locked', icon: 'mdi-lock'},
            ]
        };
    },
    computed:
    {
        scenarioObjectUidToIndex()
        {
            return this.scenarioObjects
                .map((x,idx) => [x.uid, idx])
                .reduce((obj,[key,val]) => (obj[key] = val,obj), {});
        }
    },
    methods:
    {
        removeFilter(filterChoice)
        {
            for(let idx=0;idx<this.filters.length;idx++)
            {
                if(this.filters[idx] === filterChoice.value)
                {
                    this.filters.splice(idx, 1);
                    return;
                }
            }
        },
        toggleLock(item)
        {
            item.locked = !item.locked;
        },
        toggleCamera(item)
        {
            if(!item.cameraLocked)
            {
                this.scenarioObjects.filter(x => x.cameraLocked).forEach(x => x.cameraLocked = false);
                item.cameraLocked = true;
            }
            else
            {
                item.cameraLocked = false;
            }
        },
        toggleControl(item)
        {
            if(item.controlledBy === 'ai')
            {
                this.scenarioObjects.filter(x => x.controlledBy === 'player').forEach(x => x.controlledBy = 'ai');
                item.controlledBy = 'player';
            }
            else if(item.controlledBy === 'player')
            {
                item.controlledBy = 'ai';
            }
        }
    }
};
</script>