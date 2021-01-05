<template>
    <v-text-field
        v-model="displayValue"
        reverse
        :rules="[validation,]"
        :prefix="showUnitOptions?'':currentUnits.abbr"
    >
        <template
            v-if="showUnitOptions"
            slot="append-outer"
        >
            <v-select
                v-model="currentUnits"
                :items="UNIT_OPTIONS"
                item-text="unit.abbr"
                item-value="unit"
                style="max-width:4.5em;min-width:4.5em;"
            />
        </template>
    </v-text-field>
</template>

<script>
import Convert, { SPEED_UNITS, SPEED_UNIT_OPTIONS } from '@/assets/js/utils/convert-utils.js';

const CONVERTER = Convert.speed;
const UNIT_OPTIONS = SPEED_UNIT_OPTIONS;
const SI_UNITS = SPEED_UNITS.METERS_PER_SECOND;

const FLOAT_REGEX = /^[+-]?\d+(\.\d+)?$/;

export default {
    name: 'speed-field',
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
            displayValue: 0.0,
            currentUnits: SI_UNITS,
            validation: (value) =>
            {
                const isValid = FLOAT_REGEX.test(value);
                if(!isValid)
                    return 'A number is required';

                const siValue = CONVERTER(parseFloat(value), this.currentUnits.id, SI_UNITS.id);
                this.$emit('input', siValue);

                return true;
            },
            UNIT_OPTIONS,
        };
    },
    watch:
    {
        currentUnits(newUnits, oldUnits)
        {
            const newUnitsValue = CONVERTER(parseFloat(this.displayValue), oldUnits.id, newUnits.id).toFixed(6);
            // this strips insignificant trailing zeros
            this.displayValue = parseFloat(newUnitsValue);
        }
    },
    mounted()
    {
        this.currentUnits = this.displayUnits;
        let value = parseFloat(this.value);
        value = isNaN(value) ? 0 : value;
        this.displayValue = CONVERTER(value, SI_UNITS.id, this.currentUnits.id);
    },
};
</script>