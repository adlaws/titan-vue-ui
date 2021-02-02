<template>
    <div
        class="card"
        :class="{secondary: !isDummyWaypoint}"
    >
        <div class="card-title">
            <b-button
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(0)"
            >
                <b-icon icon="chevron-double-left" />
            </b-button>
            <b-button
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(waypointIdxLookup[waypoint.uid]-1)"
            >
                <b-icon icon="chevron-left" />
            </b-button>
            <span v-if="isDummyWaypoint" class="secondary--text">
                <b-icon
                    class="inherit-color"
                    icon="map-marker-radius"
                />
            </span>
            <span v-else>
                <b-icon icon="map-marker-radius" />
                {{ waypoint.name }}
            </span>
            <b-spacer />
            <div
                v-if="!isDummyWaypoint"
                class="subtitle-2"
            >
                Waypoint #{{ waypointIdxLookup[waypoint.uid]+1 }}
            </div>
            <b-button
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(waypointIdxLookup[waypoint.uid]+1)"
            >
                <b-icon icon="chevron-right" />
            </b-button>
            <b-button
                icon
                :disabled="isDummyWaypoint"
                @click="_selectWaypointByIdx(-1)"
            >
                <b-icon icon="chevron-double-right" />
            </b-button>
        </div>
        <div class="card-text">
            <div class="columns">
                <div class="column is-3">
                    <b-input
                        v-model="waypoint.name"
                        :disabled="isDummyWaypoint"
                        placeholder="Unnamed"
                        label="Waypoint Name"
                    />
                </div>
                <div class="column is-6">
                    <location-field
                        v-model="waypoint.lla"
                        :disabled="isDummyWaypoint"
                        label="Location"
                    />
                </div>
                <div class="column is-3">
                    <length-field
                        v-model="waypoint.lla.altitude"
                        :disabled="isDummyWaypoint"
                        label="Altitude"
                    />
                </div>
            </div>
            <div class="columns">
                <div class="column is-4">
                    <b-dropdown
                        v-model="waypoint.type"
                        :disabled="isDummyWaypoint"
                        label="Type"
                        item-value="id"
                        :items="WAYPOINT.TYPE_OPTIONS"
                    >
                        <template v-slot:selection="data">
                            <div class="ellipsis-overflow maxw-99">
                                <b-icon
                                    :icon="data.item.icon"
                                    style="color:inherit;"
                                    class="mr-1"
                                />
                                {{ data.item.label }}
                            </div>
                        </template>
                        <template v-slot:item="data">
                            <b-icon
                                :icon="data.item.icon"
                                class="mr-1"
                            />
                            {{ data.item.label }}
                        </template>
                    </b-dropdown>
                </div>
                <div class="column is-4">
                    <b-dropdown
                        v-model="waypoint.roe"
                        :disabled="isDummyWaypoint"
                        label="ROE"
                        item-value="id"
                        :items="WAYPOINT.ROE_OPTIONS"
                    >
                        <template v-slot:selection="data">
                            <div class="ellipsis-overflow maxw-99">
                                <b-icon
                                    :icon="data.item.icon"
                                    style="color:inherit;"
                                    class="mr-1"
                                />
                                {{ data.item.label }}
                            </div>
                        </template>
                        <template v-slot:item="data">
                            <b-icon
                                :icon="data.item.icon"
                                class="mr-1"
                            />
                            {{ data.item.label }}
                        </template>
                    </b-dropdown>
                </div>
                <div class="column is-4">
                    <speed-field
                        v-model="waypoint.speed"
                        :disabled="isDummyWaypoint"
                        label="Speed"
                        :display-units="SPEED_UNITS.METERS_PER_SECOND"
                    />
                </div>
            </div>
            <div class="columns">
                <div class="column is-12">
                    <span
                        class="subtitle-2"
                        :class="{'secondary--text': isDummyWaypoint}"
                    >
                        Secondary Actions: None
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { WAYPOINT, DUMMY_WAYPOINT } from './waypointsettings.js';

import MathUtils from '@/assets/js/utils/math-utils.js';
import { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

import SpeedField from '@/components/cse/core/field/SpeedField.vue';
import LengthField from '@/components/cse/core/field/LengthField.vue';
import LocationField from '@/components/cse/core/field/LocationField.vue';

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
