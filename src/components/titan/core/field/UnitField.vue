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
                :items="unitOptions"
                item-text="unit.abbr"
                item-value="unit"
                style="max-width:4.5em;min-width:4.5em;"
            />
        </template>
    </v-text-field>
</template>

<script>
const FLOAT_REGEX = /^[+-]?\d+(\.\d+)?$/;

export default {
    name: 'unit-field',
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
            required: true,
        },
        siUnits:
        {
            type: Object,
            required: true,
        },
        converter:
        {
            type: Function,
            required: true,
        },
        showUnitOptions:
        {
            type: [Boolean, String],
            default: false
        },
        unitOptions:
        {
            type: Array,
            default: () => []
        },
    },
    data()
    {
        return {
            displayValue: 0.0,
            currentUnits: null,
            validation: (value) =>
            {
                const isValid = FLOAT_REGEX.test(value);
                if(!isValid)
                    return 'A number is required';

                const currentUnits = this.currentUnits || this.siUnits;
                const siValue = this.converter(parseFloat(value), currentUnits.id, this.siUnits.id);
                this.$emit('input', siValue);

                return true;
            },
        };
    },
    watch:
    {
        currentUnits(newUnits, oldUnits)
        {
            oldUnits = oldUnits || this.siUnits;
            const newUnitsValue = this.converter(parseFloat(this.displayValue), oldUnits.id, newUnits.id).toFixed(6);
            // this strips insignificant trailing zeros
            this.displayValue = parseFloat(newUnitsValue);
        }
    },
    mounted()
    {
        this.currentUnits = this.displayUnits || this.siUnits;
        let value = parseFloat(this.value);
        value = isNaN(value) ? 0 : value;
        this.displayValue = this.converter(value, this.siUnits.id, this.currentUnits.id);
    },
};
</script>