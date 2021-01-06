<template>
    <unit-field
        :value="value"
        :display-units="displayUnits"
        :si-units="siUnits"
        :converter="converter"
        :show-unit-options="showUnitOptions"
        :unit-options="unitOptions"
        @input="$emit('input', $event);"
    />
</template>

<script>
import Convert, { SPEED_UNITS, SPEED_UNIT_OPTIONS } from '@/assets/js/utils/convert-utils.js';

import UnitField from './UnitField.vue';

const SI_UNITS = SPEED_UNITS.METERS_PER_SECOND;

export default {
    name: 'speed-field2',
    components:
    {
        UnitField,
    },
    props:
    {
        value:
        {
            type: [Number, String,],
            default: 0.0
        },
        displayUnits:
        {
            type: Object,
            default: () => SI_UNITS
        },
        showUnitOptions:
        {
            type: [Boolean, String],
            default: false
        },
    },
    data()
    {
        return {
            siUnits: SI_UNITS,
            unitOptions: SPEED_UNIT_OPTIONS,
            converter: Convert.speed,
        };
    },
};
</script>