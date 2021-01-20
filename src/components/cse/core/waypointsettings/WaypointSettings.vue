<template>
    <cse-desktop-window
        title="Waypoint Path"
        icon="vector-polyline"
        :x="150"
        :y="150"
        :width="600"
        :min-width="600"
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
                                height="10rem"
                                item-key="uid"
                                single-select
                                no-data-text="There are no waypoints"
                                no-results-text="No waypoints match the filter criteria"
                                :items-per-page="5"
                                :headers="table.headers"
                                :footer-props="table.footerprops"
                                :options.sync="table.options"
                                :items="waypointPath.waypoints"
                                @click:row="handleWaypointRowClicked"
                                @contextmenu:row="handleWaypointRowContextMenu"
                            >
                                <!-- eslint-disable-next-line vue/no-unused-vars -->
                                <template v-slot:[`item.idx`]="{ item }">
                                    {{ waypointIdxLookup[item.uid]+1 }}
                                </template>
                                <template v-slot:[`item.name`]="{ item }">
                                    <span v-if="item.name.length>0">{{ item.name }}</span>
                                    <span v-else class="secondary--text">&mdash;</span>
                                </template>
                                <template v-slot:[`item.type`]="{ item }">
                                    <v-icon>{{ WAYPOINT.TYPE[item.type].icon }}</v-icon>
                                </template>
                                <template v-slot:[`item.roe`]="{ item }">
                                    <v-icon>{{ WAYPOINT.ROE[item.roe].icon }}</v-icon>
                                </template>
                                <template v-slot:[`item.speed`]="{ item }">
                                    {{ item.speed }}m/s
                                </template>
                                <template v-slot:[`item.wait`]="{ item }">
                                    {{ item.wait }}s
                                </template>
                                <template v-slot:[`item.lla`]="{ item }">
                                    <mgrs v-if="isMGRS" :latitude="item.lla.latitude" :longitude="item.lla.longitude" />
                                    <span v-else>
                                        <latitude :latitude="item.lla.latitude" />
                                        <longitude class="ml-1" :longitude="item.lla.longitude" />
                                    </span>
                                </template>
                                <template v-slot:[`item.altitude`]="{ item }">
                                    {{ item.lla.altitude }}m
                                </template>
                                <template v-slot:[`footer.page-text`]="{ pageStart, pageStop, itemsLength }">
                                    {{ pageStart }} - {{ pageStop }} of {{ itemsLength }} Waypoints
                                </template>
                            </v-data-table>
                            <v-card
                                :class="{secondary: !selectedIsDummy}"
                            >
                                <v-card-title>
                                    <v-btn
                                        icon
                                        :disabled="selectedIsDummy"
                                        @click="selectWaypointIdx(0)"
                                    >
                                        <v-icon>
                                            mdi-chevron-double-left
                                        </v-icon>
                                    </v-btn>
                                    <v-btn
                                        icon
                                        :disabled="selectedIsDummy"
                                        @click="selectWaypointIdx(waypointIdxLookup[selectedWaypoint.uid]-1)"
                                    >
                                        <v-icon>
                                            mdi-chevron-left
                                        </v-icon>
                                    </v-btn>
                                    <span v-if="selectedIsDummy" class="secondary--text">
                                        <v-icon class="inherit-color">mdi-map-marker-radius</v-icon>
                                    </span>
                                    <span v-else>
                                        <v-icon>mdi-map-marker-radius</v-icon>
                                        {{ selectedWaypoint.name }}
                                    </span>
                                    <v-spacer />
                                    <div
                                        v-if="!selectedIsDummy"
                                        class="subtitle-2"
                                    >
                                        Waypoint #{{ waypointIdxLookup[selectedWaypoint.uid]+1 }}
                                    </div>
                                    <v-btn
                                        icon
                                        :disabled="selectedIsDummy"
                                        @click="selectWaypointIdx(waypointIdxLookup[selectedWaypoint.uid]+1)"
                                    >
                                        <v-icon>
                                            mdi-chevron-right
                                        </v-icon>
                                    </v-btn>
                                    <v-btn
                                        icon
                                        :disabled="selectedIsDummy"
                                        @click="selectWaypointIdx(-1)"
                                    >
                                        <v-icon>
                                            mdi-chevron-double-right
                                        </v-icon>
                                    </v-btn>
                                </v-card-title>
                                <v-card-text>
                                    <v-form
                                        class="compact"
                                    >
                                        <v-row>
                                            <v-col cols="3">
                                                <v-text-field
                                                    v-model="selectedWaypoint.name"
                                                    :disabled="selectedIsDummy"
                                                    placeholder="Unnamed"
                                                    label="Waypoint Name"
                                                />
                                            </v-col>
                                            <v-col cols="6">
                                                <location-field
                                                    v-model="selectedWaypoint.lla"
                                                    :disabled="selectedIsDummy"
                                                    label="Location"
                                                />
                                            </v-col>
                                            <v-col cols="3">
                                                <length-field
                                                    v-model="selectedWaypoint.lla.altitude"
                                                    :disabled="selectedIsDummy"
                                                    label="Altitude"
                                                />
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="4">
                                                <v-select
                                                    v-model="selectedWaypoint.type"
                                                    :disabled="selectedIsDummy"
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
                                                    :disabled="selectedIsDummy"
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
                                                    :disabled="selectedIsDummy"
                                                    label="Speed"
                                                    :display-units="SPEED_UNITS.METERS_PER_SECOND"
                                                />
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="12">
                                                <span
                                                    class="subtitle-2"
                                                    :class="{'secondary--text': selectedIsDummy}"
                                                >
                                                    Secondary Actions: None
                                                </span>
                                            </v-col>
                                        </v-row>
                                    </v-form>
                                </v-card-text>
                            </v-card>
                            <cse-context-menu
                                v-if="contextMenu.show"
                                :items="contextMenu.items"
                                :x="contextMenu.x"
                                :y="contextMenu.y"
                                @selected="contextMenuSelection"
                                @cancelled="hideContextMenu"
                            />
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
import MathUtils from '@/assets/js/utils/math-utils.js';
import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';
import { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

import CseDesktopWindow from '@/components/common/cse/CseDesktopWindow.vue';
import CseDesktopWindowContent from '@/components/common/cse/CseDesktopWindowContent.vue';
import CseContextMenu from '@/components/cse/core/CseContextMenu.vue';

import Latitude from '@/components/cse/core/display/Latitude.vue';
import Longitude from '@/components/cse/core/display/Longitude.vue';
import MGRS from '@/components/cse/core/display/MGRS.vue';
import SpeedField from '@/components/cse/core/field/SpeedField.vue';
import LengthField from '@/components/cse/core/field/LengthField.vue';
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

const DUMMY_WAYPOINT = {
    uid: 'dummy',
    name:'',
    type: WAYPOINT.TYPE.MOVE.id,
    lla: { latitude: 0, longitude: 0, altitude: 0},
    speed: 0,
    wait: 0,
    roe: WAYPOINT.ROE.NEVER.id,
};

export default {
    name: 'waypoint-settings',
    components:
    {
        CseDesktopWindow, CseDesktopWindowContent, CseContextMenu,
        Latitude, Longitude, 'mgrs':MGRS,
        SpeedField, LocationField, LengthField,
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
                page: 1,
                options: {
                    page: 0,
                    itemsPerPage: 5,
                },
                headers:[
                    { value: 'idx', text: '#', sortable: false, align: 'start', width: "1%", },
                    { value: 'name', text: 'Name', sortable: false, align: 'start', width: "1%", cellClass:'ellipsis-overflow' },
                    { value: 'type', text: 'Type', sortable: false, align: 'start', width: "1%", },
                    { value: 'roe', text: 'ROE', sortable: false, align: 'start', width: "1%", },
                    { value: 'speed', text: 'Speed', sortable: false, align: 'start', width: "1%", },
                    { value: 'wait', text: 'Wait', sortable: false, align: 'start', width: "1%", },
                    { value: 'lla', text: 'Location', sortable: false, align: 'start', width: "99%", },
                    { value: 'altitude', text: 'Altitude', sortable: false, align: 'right', width: "1%", },
                ],
                footerprops:
                {
                    'items-per-page-options':[5],
                },
                selected: [],
            },
            contextMenu:
            {
                show:false,
                x: 0,
                y: 0,
                items: []
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
                    {
                        uid: 104,
                        name:'Delta',
                        type: WAYPOINT.TYPE.CYCLE.id,
                        lla: { latitude: 12.3423, longitude: 34.563, altitude: 2},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.UNIT_DEFAULT.id,
                    },
                    {
                        uid: 105,
                        name:'Echo',
                        type: WAYPOINT.TYPE.CYCLE.id,
                        lla: { latitude: 12.344, longitude: 34.564, altitude: 2},
                        speed: 16,
                        wait: 0,
                        roe: WAYPOINT.ROE.UNIT_DEFAULT.id,
                    },
                    {
                        uid: 106,
                        name:'Foxtrot',
                        type: WAYPOINT.TYPE.CYCLE.id,
                        lla: { latitude: 12.345, longitude: 34.565, altitude: 2},
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
            return this.table.selected.length ? this.table.selected[0] : DUMMY_WAYPOINT;
        },
        selectedIsDummy()
        {
            return this.selectedWaypoint.uid === DUMMY_WAYPOINT.uid;
        },
    },
    methods:
    {
        clearWaypointSelection()
        {
            this.table.selected.splice(0,this.table.selected.length);
        },
        handleWaypointRowClicked(evt, row)
        {
            if(!row.isSelected)
                row.select(true);
            else
                this.clearWaypointSelection();
        },
        handleWaypointRowContextMenu(evt, row)
        {
            evt.preventDefault();
            const waypoint = row.item;
            const waypointidx = this.waypointIdxLookup[waypoint.uid];
            this.contextMenu.items = [
                {id:0, text: 'Move Up', icon:'arrow-up', disabled:waypointidx===0,},
                {id:1, text: 'Move Down', icon:'arrow-down', disabled:waypointidx>=this.waypointPath.waypoints.length-1,},
                {id:2, text: 'Insert Before', icon:'table-row-plus-before', disabled:false,},
                {id:3, text: 'Insert After', icon:'table-row-plus-after', disabled:false,},
                {id:4, text: 'Attach to Entity', icon:'link-variant', disabled:false,},
                {id:5, text: 'Detach from Entity', icon:'link-variant-off', disabled:false,},
                {id:6, text: 'Delete '+waypoint.name, icon:'trash-can', disabled:false,},
            ];

            // wait until next tick so that this.contextMenu.show = false can take effect and reset the menu
            this.contextMenu.x = evt.clientX-32;
            this.contextMenu.y = evt.clientY-8;
            this.contextMenu.show = true;
        },
        contextMenuSelection()
        {
            this.hideContextMenu();
        },
        hideContextMenu()
        {
            this.contextMenu.show = false;
        },
        removeWaypoint()
        {
            // TODO
        },
        selectWaypointIdx(idx)
        {
            if(this.waypointPath.waypoints.length===0)
                return;

            let actualIdx = MathUtils.wrapClamp(idx,0,this.waypointPath.waypoints.length);
            const tablePage = ((actualIdx / this.table.options.itemsPerPage) | 0)+1;

            if(this.table.selected.length>0)
                this.clearWaypointSelection();
            this.table.selected.push(this.waypointPath.waypoints[actualIdx]);
            this.table.options.page = tablePage;
        }
    }
};
</script>
