<template>
    <cse-desktop-window
        title="Waypoint Path"
        icon="vector-polyline"
        :x="150"
        :y="150"
        :width="725"
        :min-width="725"
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
                        <table>
                            <thead />
                            <tfoot />
                            <tbody>
                                <tr>
                                    <th
                                        v-for="(header,idx) in table.headers"
                                        :key="`th-${idx}`"
                                    >
                                        {{ header.text }}
                                    </th>
                                </tr>
                                <tr
                                    v-for="(waypoint, rowIdx) in waypointPath.waypoints"
                                    :key="`waypoint-${rowIdx}`"
                                    :class="{selected:true}"
                                    @click.stop="handleWaypointRowClicked($event,{idx:rowIdx,item:waypoint})"
                                >
                                    <td>{{ rowIdx+1 }}</td>
                                    <td>{{ waypoint.name }}</td>
                                    <td><v-icon>{{ waypoint.type.icon }}</v-icon></td>
                                    <td><v-icon>{{ waypoint.roe.icon }}</v-icon></td>
                                    <td>{{ waypoint.speed }}m/s</td>
                                    <td>{{ waypoint.wait }}s</td>
                                    <td>
                                        <mgrs v-if="isMGRS" :latitude="waypoint.lla.latitude" :longitude="waypoint.lla.longitude" />
                                        <span v-else>
                                            <latitude :latitude="waypoint.lla.latitude" />
                                            <longitude class="ml-1" :longitude="waypoint.lla.longitude" />
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <v-card
                            v-if="selectedWaypoint!==null"
                        >
                            <v-card-text>
                                <v-form>
                                    <v-row>
                                        <v-col cols="3">
                                            <v-text-field
                                                v-model="selectedWaypoint.name"
                                                label="Name"
                                            />
                                        </v-col>
                                        <v-col cols="3">
                                            <v-select
                                                v-model="selectedWaypoint.type"
                                                label="Type"
                                                :items="WAYPOINT.TYPE.OPTIONS"
                                            >
                                                <template v-slot:selection="data">
                                                    <div class="ellipsis-overflow maxw-99">
                                                        <v-icon class="mr-1">
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
                                        <v-col cols="3">
                                            <v-select
                                                v-model="selectedWaypoint.roe"
                                                label="ROE"
                                                :items="WAYPOINT.ROE.OPTIONS"
                                            >
                                                <template v-slot:selection="data">
                                                    <div class="ellipsis-overflow maxw-99">
                                                        <v-icon class="mr-1">
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
                                        <v-col cols="3">
                                            <speed-field
                                                v-model="selectedWaypoint.speed"
                                                label="Speed"
                                                :display-units="SPEED_UNITS.METERS_PER_SECOND"
                                            />
                                        </v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col cols="6">
                                            <location-field
                                                v-model="selectedWaypoint.lla"
                                                label="Location"
                                            />
                                        </v-col>
                                    </v-row>
                                </v-form>
                            </v-card-text>
                        </v-card>
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
        MOVE: {id: 'move', label: 'Move', icon:'mdi-chevron-double-right'},
        ATTACK: {id: 'attack', label: 'Attack', icon:'mdi-octagram-outline'},
        LOITER: {id: 'loiter', label: 'Loiter', icon:'mdi-orbit-variant'},
        CYCLE: {id: 'cycle', label: 'Cycle', icon:'mdi-redo-variant'},
        BEHAVIOUR: {id: 'behaviour', label: 'Behaviour', icon:'mdi-script-text-outline'},
        CITY_ROAM_PATH: {id: 'city-roam-path', label: 'City Roam Path', icon:'mdi-city-variant-outline'},
        FOLLOW_ROAD: {id: 'follow-road', label: 'Follow Road', icon:'mdi-road'},
    },
    ROE:
    {
        UNIT_DEFAULT:{id: 'unit-default', label:'Unit Default', icon: 'mdi-book'},
        NEVER:{id: 'never', label:'Never', icon: 'mdi-cancel'},
        ON_SIGHT:{id: 'on-sight', label:'On Sight', icon: 'mdi-eye'},
        ON_SIGHT_IN_RANGE:{id: 'on-sight-in-range', label:'On Sight In Range', icon: 'mdi-eye-circle-outline'},
        ON_SIGHT_ON_PATH:{id: 'on-sight-on-path', label:'On Sight On Path', icon: 'mdi-eye-settings'},
        ON_ATTACKED:{id: 'on-attacked', label:'On Attacked', icon: 'mdi-alert-octagram-outline'},
        FALL_BACK_ON_FIRE:{id: 'fall-back-on-fire', label:'Fall Back On Fire', icon: 'mdi-vanish'},
        SELECT_POSITION_FROM_WAYPOINTS:{id: 'select-position-from-waypoints', label:'Select Position From Waypoints', icon: 'mdi-vector-point'},
    },
};
WAYPOINT.TYPE['OPTIONS'] = Object.getOwnPropertyNames(WAYPOINT.TYPE).map(x => WAYPOINT.TYPE[x]);
WAYPOINT.ROE['OPTIONS'] = Object.getOwnPropertyNames(WAYPOINT.ROE).map(x => WAYPOINT.ROE[x]);

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
                    { value: 'idx', text: '#', sortable: false, align: 'start', },
                    { value: 'name', text: 'Name', sortable: false, align: 'start', },
                    { value: 'type', text: 'Type', sortable: false, align: 'start', },
                    { value: 'roe', text: 'ROE', sortable: false, align: 'start', },
                    { value: 'speed', text: 'Speed', sortable: false, align: 'start', },
                    { value: 'wait', text: 'Wait', sortable: false, align: 'start', },
                    { value: 'lla', text: 'Location', sortable: false, align: 'start', },
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
                        type: WAYPOINT.TYPE.MOVE,
                        lla: { latitude: 12.34, longitude: 34.56, altitude: 0},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.NEVER,
                    },
                    {
                        uid: 102,
                        name:'Bravo',
                        type: WAYPOINT.TYPE.LOITER,
                        lla: { latitude: 12.341, longitude: 34.561, altitude: 1},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.ON_SIGHT_IN_RANGE,
                    },
                    {
                        uid: 103,
                        name:'Charlie',
                        type: WAYPOINT.TYPE.CYCLE,
                        lla: { latitude: 12.342, longitude: 34.562, altitude: 2},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.UNIT_DEFAULT,
                    },
                ]
            }
        };
    },
    computed:
    {
        languageID() {return this.$store.getters.language.id; },
        isMGRS() { return this.$store.getters.isPositionFormat(POSITION_FORMAT.MGRS); },
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
        }
    }
};
</script>
