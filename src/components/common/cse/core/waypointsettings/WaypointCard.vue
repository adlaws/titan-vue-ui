<template>
    <Card
        :class="{secondary: !isDummyWaypoint}"
    >
        <template #title>
            <div class="p-grid">
                <div class="p-col-3">
                    <Button
                        icon="mdi mdi-chevron-double-left"
                        class="p-button-sm p-mr-1"
                        :disabled="isDummyWaypoint"
                        @click="_selectWaypointByIdx(0)"
                    />
                    <Button
                        icon="mdi mdi-chevron-left"
                        class="p-button-sm"
                        :disabled="isDummyWaypoint"
                        @click="_selectWaypointByIdx(waypointIdxLookup[waypoint.uid]-1)"
                    />
                </div>
                <div class="p-col-6 p-flex">
                    <span v-if="isDummyWaypoint" class="secondary--text">
                        <cse-icon class="inherit-color" icon="map-marker-radius" />
                    </span>
                    <span v-else>
                        <cse-icon icon="map-marker-radius" />
                        {{ waypoint.name }}
                    </span>
                    <div class="spacer" />
                    <div
                        v-if="!isDummyWaypoint"
                        style="font-size:50%;"
                    >
                        Waypoint #{{ waypointIdxLookup[waypoint.uid]+1 }}
                    </div>
                </div>
                <div class="p-col-3">
                    <Button
                        icon="mdi mdi-chevron-right"
                        class="p-button-sm"
                        :disabled="isDummyWaypoint"
                        @click="_selectWaypointByIdx(waypointIdxLookup[waypoint.uid]+1)"
                    />
                    <Button
                        icon="mdi mdi-chevron-double-right"
                        class="p-button-sm p-ml-1"
                        :disabled="isDummyWaypoint"
                        @click="_selectWaypointByIdx(-1)"
                    />
                </div>
            </div>
        </template>
        <template #content>
            <div class="p-grid">
                <div class="p-col-3">
                    <label>Waypoint Name</label>
                    <InputText
                        v-model="waypoint.name"
                        :disabled="isDummyWaypoint"
                        class="p-inputtext-sm"
                        placeholder="Unnamed"
                    />
                </div>
                <div class="p-col-6">
                    <label>Location</label>
                    <location-field
                        v-model="waypoint.lla"
                        :disabled="isDummyWaypoint"
                        class="p-inputtext-sm"
                    />
                </div>
                <div class="p-col-3">
                    <label>Altitude</label>
                    <length-field
                        v-model="waypoint.lla.altitude"
                        :disabled="isDummyWaypoint"
                        class="p-inputtext-sm"
                    />
                </div>
            </div>
            <div class="p-formgrid p-grid">
                <div class="p-field p-col-4">
                    <label>Type</label>
                    <Dropdown
                        v-model="waypoint.type"
                        :disabled="isDummyWaypoint"
                        class="p-dropdown-sm"
                        data-key="id"
                        :options="WAYPOINT.TYPE_OPTIONS"
                    >
                        <template #value="slotProps">
                            <div class="ellipsis-overflow maxw-99">
                                <cse-icon :icon="WAYPOINT.TYPE[slotProps.value].icon" class="mr-1" />
                                {{ WAYPOINT.TYPE[slotProps.value].label }}
                            </div>
                        </template>
                        <template #option="slotProps">
                            <cse-icon :icon="WAYPOINT.TYPE[slotProps.option].icon" class="mr-1" />
                            {{ WAYPOINT.TYPE[slotProps.option].label }}
                        </template>
                    </Dropdown>
                </div>
                <div class="p-field p-col-4">
                    <label>ROE</label>
                    <Dropdown
                        v-model="waypoint.roe"
                        :disabled="isDummyWaypoint"
                        class="p-dropdown-sm"
                        data-key="id"
                        :options="WAYPOINT.ROE_OPTIONS"
                    >
                        <template #value="slotProps">
                            <div class="ellipsis-overflow maxw-99">
                                <cse-icon :icon="WAYPOINT.ROE[slotProps.value].icon" class="mr-1" />
                                {{ WAYPOINT.ROE[slotProps.value].label }}
                            </div>
                        </template>
                        <template #option="slotProps">
                            <cse-icon :icon="WAYPOINT.ROE[slotProps.option].icon" class="mr-1" />
                            {{ WAYPOINT.ROE[slotProps.option].label }}
                        </template>
                    </Dropdown>
                </div>
                <div class="p-col-4">
                    <speed-field
                        v-model="waypoint.speed"
                        :disabled="isDummyWaypoint"
                        label="Speed"
                        :display-units="SPEED_UNITS.METERS_PER_SECOND"
                        class="p-inputtext-sm"
                    />
                </div>
            </div>
            <div class="p-grid">
                <div class="p-col-12">
                    <span
                        class="subtitle-2"
                        :class="{'secondary--text': isDummyWaypoint}"
                    >
                        Secondary Actions: None
                    </span>
                </div>
            </div>
        </template>
    </Card>
</template>

<script>
import { WAYPOINT, DUMMY_WAYPOINT } from './waypointsettings.js';

import MathUtils from '@/assets/js/utils/math-utils.js';
import { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';


import SpeedField from '@/components/common/cse/core/field/SpeedField.vue';
import LengthField from '@/components/common/cse/core/field/LengthField.vue';
import LocationField from '@/components/common/cse/core/field/LocationField.vue';

export default {
    name: 'waypoint-card',
    components:
    {
        Card, Button, InputText, Dropdown,
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
