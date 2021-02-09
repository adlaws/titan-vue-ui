<template>
    <v-card
        :class="{secondary: !isDummyWaypoint}"
    >
        <v-card-title>
            <v-btn
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(0)"
            >
                <cse-icon icon="chevron-double-left" />
            </v-btn>
            <v-btn
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(waypointIdxLookup[waypoint.uid]-1)"
            >
                <cse-icon icon="chevron-left" />
            </v-btn>
            <span v-if="isDummyWaypoint" class="secondary--text">
                <cse-icon class="inherit-color" icon="map-marker-radius" />
            </span>
            <span v-else>
                <cse-icon icon="map-marker-radius" />
                {{ waypoint.name }}
            </span>
            <v-spacer />
            <div
                v-if="!isDummyWaypoint"
                class="subtitle-2"
            >
                Waypoint #{{ waypointIdxLookup[waypoint.uid]+1 }}
            </div>
            <v-btn
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(waypointIdxLookup[waypoint.uid]+1)"
            >
                <cse-icon icon="chevron-right" />
            </v-btn>
            <v-btn
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(-1)"
            >
                <cse-icon icon="chevron-double-right" />
            </v-btn>
        </v-card-title>
        <v-card-text>
            <v-form
                class="compact"
            >
                <v-row>
                    <v-col cols="3">
                        <v-text-field
                            v-model="waypoint.name"
                            :disabled="isDummyWaypoint"
                            placeholder="Unnamed"
                            label="Waypoint Name"
                        />
                    </v-col>
                    <v-col cols="6">
                        <location-field
                            v-model="waypoint.lla"
                            :disabled="isDummyWaypoint"
                            label="Location"
                        />
                    </v-col>
                    <v-col cols="3">
                        <length-field
                            v-model="waypoint.lla.altitude"
                            :disabled="isDummyWaypoint"
                            label="Altitude"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="4">
                        <v-select
                            v-model="waypoint.type"
                            :disabled="isDummyWaypoint"
                            label="Type"
                            item-value="id"
                            :items="WAYPOINT.TYPE_OPTIONS"
                        >
                            <template v-slot:selection="data">
                                <div class="ellipsis-overflow maxw-99">
                                    <cse-icon
                                        :icon="data.item.icon"
                                        style="color:inherit;"
                                        class="mr-1"
                                    />
                                    {{ data.item.label }}
                                </div>
                            </template>
                            <template v-slot:item="data">
                                <cse-icon class="mr-1">
                                    {{ data.item.icon }}
                                </cse-icon>
                                {{ data.item.label }}
                            </template>
                        </v-select>
                    </v-col>
                    <v-col cols="4">
                        <v-select
                            v-model="waypoint.roe"
                            :disabled="isDummyWaypoint"
                            label="ROE"
                            item-value="id"
                            :items="WAYPOINT.ROE_OPTIONS"
                        >
                            <template v-slot:selection="data">
                                <div class="ellipsis-overflow maxw-99">
                                    <cse-icon
                                        :icon="data.item.icon"
                                        style="color:inherit;"
                                        class="mr-1"
                                    />
                                    {{ data.item.label }}
                                </div>
                            </template>
                            <template v-slot:item="data">
                                <cse-icon
                                    :icon="data.item.icon"
                                    style="color:inherit;"
                                    class="mr-1"
                                />
                                {{ data.item.label }}
                            </template>
                        </v-select>
                    </v-col>
                    <v-col cols="4">
                        <speed-field
                            v-model="waypoint.speed"
                            :disabled="isDummyWaypoint"
                            label="Speed"
                            :display-units="SPEED_UNITS.METERS_PER_SECOND"
                        />
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <span
                            class="subtitle-2"
                            :class="{'secondary--text': isDummyWaypoint}"
                        >
                            Secondary Actions: None
                        </span>
                    </v-col>
                </v-row>
            </v-form>
        </v-card-text>
    </v-card>
</template>

<script>
import { WAYPOINT, DUMMY_WAYPOINT } from './waypointsettings.js';

import MathUtils from '@/assets/js/utils/math-utils.js';
import { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

import SpeedField from '@/components/common/cse/core/field/SpeedField.vue';
import LengthField from '@/components/common/cse/core/field/LengthField.vue';
import LocationField from '@/components/common/cse/core/field/LocationField.vue';

export default {
    name: 'waypoint-card',
    components:
    {
        SpeedField, LocationField, LengthField,
    },
    props:
    {
        waypoint:
        {
            type: Object,
            default: DUMMY_WAYPOINT,
        },
        waypoints:
        {
            type: Array,
            default: () => [],
        },
    },
    data()
    {
        return {
            WAYPOINT,
            SPEED_UNITS,
        };
    },
    computed:
    {
        isDummyWaypoint()
        {
            return this.waypoint.uid === DUMMY_WAYPOINT.uid;
        },
        waypointIdxLookup()
        {
            return this.waypoints
                .map((x,idx) => [x.uid, idx])
                .reduce((obj,[key,val]) => (obj[key] = val,obj), {});
        },
    },
    methods:
    {
        _selectWaypointByIdx(idx)
        {
            idx = MathUtils.wrapClamp(idx, 0, this.waypoints.length);
            this.$emit('selected', this.waypoints[idx]);
        }
    }
};
</script>
