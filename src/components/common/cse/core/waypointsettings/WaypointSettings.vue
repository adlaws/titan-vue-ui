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
                <TabView>
                    <TabPanel :header="$t('waypointSettings.waypoints.Waypoints', languageID)">
                        <waypoints-table
                            ref="waypointsTable"
                            :waypoints="waypointPath.waypoints"
                            @selected="handleWaypointSelection"
                        />
                        <waypoint-card
                            :waypoints="waypointPath.waypoints"
                            :waypoint="currentWaypoint"
                            @selected="handleWaypointSelection"
                        />
                    </TabPanel>
                    <TabPanel :header="$t('waypointSettings.assignments.Assignments', languageID)">
                        &times;{{ waypointPath.entities.length }}
                        <ul>
                            <li
                                v-for="(entity, idx) in waypointPath.entities"
                                :key="`entity-${idx}`"
                            >
                                {{ entity }}
                            </li>
                        </ul>
                    </TabPanel>
                </TabView>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import { WAYPOINT, DUMMY_WAYPOINT } from './waypointsettings.js';

import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';
import { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import WaypointsTable from './WaypointsTable.vue';
import WaypointCard from './WaypointCard.vue';

export default {
    name: 'waypoint-settings',
    components:
    {
        TabView, TabPanel,
        WaypointsTable, WaypointCard,
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
            currentWaypoint: DUMMY_WAYPOINT,
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
    },
    methods:
    {
        handleWaypointSelection(waypoint)
        {
            this.currentWaypoint = waypoint || DUMMY_WAYPOINT;
            this.$refs.waypointsTable.selectWaypoint(this.currentWaypoint);
        }
    }
};
</script>
