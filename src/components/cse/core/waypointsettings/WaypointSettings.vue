<template>
    <cse-desktop-window
        title="Waypoint Path"
        icon="vector-polyline"
        :x="150"
        :y="150"
        :width="550"
        :min-width="550"
        :height="500"
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
                    <v-tab key="Waypoints">
                        {{ $t('waypointSettings.waypoints.Waypoints', languageID) }}
                    </v-tab>
                    <v-tab key="Assignments">
                        {{ $t('waypointSettings.assignments.Assignments', languageID) }}
                        &times;{{ waypointPath.entities.length }}
                    </v-tab>
                </v-tabs>
                <v-tabs-items
                    v-model="tabs.current"
                >
                    <v-tab-item
                        key="Waypoints"
                    >
                        <v-container
                            class="compact"
                        >
                            <v-data-table
                                v-model="table.selected"
                                dense
                                class="compact"
                                item-key="uid"
                                single-select
                                no-data-text="There are no waypoints"
                                no-results-text="No waypoints match the filter criteria"
                                :headers="table.headers"
                                :items="waypointPath.waypoints"
                                @click:row="handleWaypointRowClicked"
                            >
                                <!-- eslint-disable-next-line vue/no-unused-vars -->
                                <template v-slot:[`item.idx`]="{ item, index }">
                                    {{ index+1 }}
                                </template>
                                <template v-slot:[`item.type`]="{ item }">
                                    <v-icon>{{ WAYPOINT.TYPE[item.type].icon }}</v-icon>
                                </template>
                                <template v-slot:[`item.roe`]="{ item }">
                                    <v-icon>{{ WAYPOINT.ROE[item.roe].icon }}</v-icon>
                                </template>
                                <template v-slot:[`item.lla`]="{ item }">
                                    <mgrs v-if="isMGRS" :latitude="item.lla.latitude" :longitude="item.lla.longitude" />
                                    <span v-else>
                                        <latitude :latitude="item.lla.latitude" />
                                        <longitude class="ml-1" :longitude="item.lla.longitude" />
                                    </span>
                                </template>
                                <template v-slot:[`item.speed`]="{ item }">
                                    {{ item.speed }}m/s
                                </template>
                                <template v-slot:[`item.wait`]="{ item }">
                                    {{ item.wait }}s
                                </template>
                                <template v-slot:[`item.actions`]="{ item }">
                                    <v-icon
                                        @click="removeWaypoint(item)"
                                    >
                                        mdi-trash-can-outline
                                    </v-icon>
                                </template>
                            </v-data-table>
                            <v-card
                                v-if="selectedWaypoint!==null"
                                min-height="100%"
                            >
                                <v-card-title>
                                    {{ selectedWaypoint.name }}
                                    <v-spacer />
                                    <div class="subtitle-2">
                                        Waypoint {{ waypointIdxLookup[selectedWaypoint.uid]+1 }}
                                    </div>
                                </v-card-title>
                                <v-card-text>
                                    <v-form
                                        class="compact"
                                    >
                                        <v-row>
                                            <v-col cols="6">
                                                <v-text-field
                                                    v-model="selectedWaypoint.name"
                                                    label="Name"
                                                />
                                            </v-col>
                                            <v-col cols="6">
                                                <location-field
                                                    v-model="selectedWaypoint.lla"
                                                    label="Location"
                                                />
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="4">
                                                <v-select
                                                    v-model="selectedWaypoint.type"
                                                    label="Type"
                                                    item-value="id"
                                                    :items="WAYPOINT.TYPE_OPTIONS"
                                                >
                                                    <template v-slot:selection="data">
                                                        <div class="ellipsis-overflow maxw-99">
                                                            <v-icon style="color:inherit;" class="mr-1">
                                                                {{ data.item.icon }}
                                                            </v-icon>
                                                            {{ data.item.label }}
                                                        </div>
                                                    </template>
                                                    <template v-slot:item="data">
                                                        <v-icon class="mr-1">
                                                            {{ data.item.icon }}
                                                        </v-icon>
                                                        {{ data.item.label }}
                                                    </template>
                                                </v-select>
                                            </v-col>
                                            <v-col cols="4">
                                                <v-select
                                                    v-model="selectedWaypoint.roe"
                                                    label="ROE"
                                                    item-value="id"
                                                    :items="WAYPOINT.ROE_OPTIONS"
                                                >
                                                    <template v-slot:selection="data">
                                                        <div class="ellipsis-overflow maxw-99">
                                                            <v-icon style="color:inherit;" class="mr-1">
                                                                {{ data.item.icon }}
                                                            </v-icon>
                                                            {{ data.item.label }}
                                                        </div>
                                                    </template>
                                                    <template v-slot:item="data">
                                                        <v-icon class="mr-1">
                                                            {{ data.item.icon }}
                                                        </v-icon>
                                                        {{ data.item.label }}
                                                    </template>
                                                </v-select>
                                            </v-col>
                                            <v-col cols="4">
                                                <speed-field
                                                    v-model="selectedWaypoint.speed"
                                                    label="Speed"
                                                    :display-units="SPEED_UNITS.METERS_PER_SECOND"
                                                />
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-card-text>
                            </v-card>
                        </v-container>
                    </v-tab-item>

                    <v-tab-item
                        key="Assignments"
                    >
                        <ul>
                            <li
                                v-for="(entity, idx) in waypointPath.entities"
                                :key="`entity-${idx}`"
                            >
                                {{ entity }}
                            </li>
                        </ul>
                    </v-tab-item>
                </v-tabs-items>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';
import { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

import CseDesktopWindow from '@/components/common/cse/CseDesktopWindow.vue';
import CseDesktopWindowContent from '@/components/common/cse/CseDesktopWindowContent.vue';
import Latitude from '@/components/cse/core/display/Latitude.vue';
import Longitude from '@/components/cse/core/display/Longitude.vue';
import MGRS from '@/components/cse/core/display/MGRS.vue';
import SpeedField from '@/components/cse/core/field/SpeedField.vue';
import LocationField from '@/components/cse/core/field/LocationField.vue';

const WAYPOINT =
{
    TYPE:
    {
        MOVE: {id: 'MOVE', label: 'Move', icon:'mdi-chevron-double-right'},
        ATTACK: {id: 'ATTACK', label: 'Attack', icon:'mdi-octagram-outline'},
        LOITER: {id: 'LOITER', label: 'Loiter', icon:'mdi-orbit-variant'},
        CYCLE: {id: 'CYCLE', label: 'Cycle', icon:'mdi-redo-variant'},
        BEHAVIOUR: {id: 'BEHAVIOUR', label: 'Behaviour', icon:'mdi-script-text-outline'},
        CITY_ROAM_PATH: {id: 'CITY_ROAM_PATH', label: 'City Roam Path', icon:'mdi-city-variant-outline'},
        FOLLOW_ROAD: {id: 'FOLLOW_ROAD', label: 'Follow Road', icon:'mdi-road'},
    },
    ROE:
    {
        UNIT_DEFAULT:{id: 'UNIT_DEFAULT', label:'Unit Default', icon: 'mdi-book'},
        NEVER:{id: 'NEVER', label:'Never', icon: 'mdi-cancel'},
        ON_SIGHT:{id: 'ON_SIGHT', label:'On Sight', icon: 'mdi-eye'},
        ON_SIGHT_IN_RANGE:{id: 'ON_SIGHT_IN_RANGE', label:'On Sight In Range', icon: 'mdi-eye-circle-outline'},
        ON_SIGHT_ON_PATH:{id: 'ON_SIGHT_ON_PATH', label:'On Sight On Path', icon: 'mdi-eye-settings'},
        ON_ATTACKED:{id: 'ON_ATTACKED', label:'On Attacked', icon: 'mdi-alert-octagram-outline'},
        FALL_BACK_ON_FIRE:{id: 'FALL_BACK_ON_FIRE', label:'Fall Back On Fire', icon: 'mdi-vanish'},
        SELECT_POSITION_FROM_WAYPOINTS:{id: 'SELECT_POSITION_FROM_WAYPOINTS', label:'Select Position From Waypoints', icon: 'mdi-vector-point'},
    },
};
WAYPOINT.TYPE_OPTIONS = Object.getOwnPropertyNames(WAYPOINT.TYPE).map(x => WAYPOINT.TYPE[x]);
WAYPOINT.ROE_OPTIONS = Object.getOwnPropertyNames(WAYPOINT.ROE).map(x => WAYPOINT.ROE[x]);

export default {
    name: 'waypoint-settings',
    components:
    {
        CseDesktopWindow, CseDesktopWindowContent,
        Latitude, Longitude, 'mgrs':MGRS,
        SpeedField, LocationField,
    },
    data()
    {
        return {
            WAYPOINT,
            SPEED_UNITS,
            tabs:
            {
                current: 'Primary',
            },
            table:
            {
                headers:[
                    { value: 'idx', text: '#', sortable: false, align: 'start', width: "1%", },
                    { value: 'name', text: 'Name', sortable: false, align: 'start', width: "1%", cellClass:'ellipsis-overflow' },
                    { value: 'type', text: 'Type', sortable: false, align: 'start', width: "1%", },
                    { value: 'roe', text: 'ROE', sortable: false, align: 'start', width: "1%", },
                    { value: 'speed', text: 'Speed', sortable: false, align: 'start', width: "1%", },
                    { value: 'wait', text: 'Wait', sortable: false, align: 'start', width: "1%", },
                    { value: 'lla', text: 'Location', sortable: false, align: 'start', width: "99%", },
                    { value: 'actions', text: '', sortable: false, align: 'start', width: "1%", },
                ],
                selected: [],
            },
            waypointPath:
            {
                name:'The Path',
                entities:[1,2,3],
                waypoints:[
                    {
                        uid: 101,
                        name:'Alpha',
                        type: WAYPOINT.TYPE.MOVE.id,
                        lla: { latitude: 12.34, longitude: 34.56, altitude: 0},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.NEVER.id,
                    },
                    {
                        uid: 102,
                        name:'Bravo',
                        type: WAYPOINT.TYPE.LOITER.id,
                        lla: { latitude: 12.341, longitude: 34.561, altitude: 1},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.ON_SIGHT_IN_RANGE.id,
                    },
                    {
                        uid: 103,
                        name:'Charlie',
                        type: WAYPOINT.TYPE.CYCLE.id,
                        lla: { latitude: 12.342, longitude: 34.562, altitude: 2},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.UNIT_DEFAULT.id,
                    },
                ]
            }
        };
    },
    computed:
    {
        languageID() {return this.$store.getters.language.id; },
        isMGRS() { return this.$store.getters.isPositionFormat(POSITION_FORMAT.MGRS); },
        waypointIdxLookup()
        {
            return this.waypointPath.waypoints
                .map((x,idx) => [x.uid, idx])
                .reduce((obj,[key,val]) => (obj[key] = val,obj), {});
        },
        selectedWaypoint()
        {
            return this.table.selected.length ? this.table.selected[0] : null;
        }
    },
    methods:
    {
        handleWaypointRowClicked(evt, row)
        {
            if(!row.isSelected)
                row.select(true);
            else
                this.table.selected.splice(0,this.table.selected.length);
        },
        removeWaypoint()
        {
            // TODO
        }
    }
};
</script>
