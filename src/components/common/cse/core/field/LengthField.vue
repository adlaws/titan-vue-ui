<template>
    <div>
        <label
            v-if="label"
        >
            {{ label }}
        </label>
        <div :class="{'p-inputgroup':showUnitOptions}">
            <InputNumber
                v-model="currentValue"
                class="input-align-right"
                hide-details="auto"
                :suffix="showUnitOptions?'':currentUnits.abbr"
                :messages="messages"
                :class="{'p-invalid':!isValid}"
                :disabled="disabled"
                :placeholder="placeholder"
                :use-grouping="false"
            />
            <Dropdown
                v-if="showUnitOptions"
                v-model="currentUnits"
                :options="UNIT_OPTIONS"
                option-label="unit.abbr"
                option-value="unit"
                style="max-width:5rem;min-width:5rem;"
                :disabled="disabled"
            />
        </div>
        <Slider
            v-if="useSlider"
            v-model="currentValue"
            :min="min"
            :max="max"
            :disabled="disabled"
        />
        <small
            v-if="messages||hint"
            :class="{'p-invalid':!isValid}"
        >
            {{ messages||hint }}
        </small>
    </div>
</template>

<script>
import Convert, { LENGTH_UNITS, LENGTH_UNIT_OPTIONS } from '@/assets/js/utils/convert-utils.js';

import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Slider from 'primevue/slider';

const CONVERTER = Convert.length;
const UNIT_OPTIONS = LENGTH_UNIT_OPTIONS;
const SI_UNITS = LENGTH_UNITS.METERS;

const POSITIVE_FLOAT_REGEX = /^\d+(\.\d+)?$/;
const FLOAT_REGEX = /^[+-]?\d+(\.\d+)?$/;

export default {
    name: 'length-field',
    components:
    {
        InputNumber, Dropdown, Slider
    },
    props:
    {
        value:
        {
            type: [Number, String,],
            default: 0.0
        },
        min:
        {
            type: [Number, String,],
            default: 0.0,
            validator: (value) => !isNaN(parseFloat(value))
        },
        max:
        {
            type: [Number, String,],
            default: null,
            validator: (value) => value === null || !isNaN(parseFloat(value))
        },
        slider: {
            type: Boolean,
            default: true,
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
        // these are Vuetify <v-text-field> properties which we allow and pass through
        //   Ref: https://vuetifyjs.com/en/api/v-text-field/#props
        disabled: Boolean,
        hint: { type: String, default: undefined },
        label: { type: String, default: undefined },
        placeholder: { type: String, default: undefined },
    },
    data()
    {
        return {
            currentValue: 0.0,
            currentUnits: SI_UNITS,
            UNIT_OPTIONS,
        };
    },
    computed:
    {
        useSlider()
        {
            return this.slider && this.min !== null && this.max !== null;
        },
        isValid()
        {
            if(!this.validationRegex.test(this.currentValue))
                return false;

            const floatVal = parseFloat(this.currentValue);

            let isValid = true;
            if(this.min !== null)
                isValid = floatVal >= this.min;
            if(isValid && this.max !== null)
                isValid = floatVal <=this.max;

            return isValid;
        },
        siValue()
        {
            if(!this.isValid)
                return 0;
            return CONVERTER(this.currentValue, this.currentUnits.id, SI_UNITS.id);
        },
        validationRegex()
        {
            // choose validation regex based on allowed range of values
            return (this.min !== null && this.min < 0) ? FLOAT_REGEX : POSITIVE_FLOAT_REGEX;
        },
        errorMessage()
        {
            return 'A number is required';
        },
        messages()
        {
            return this.isValid ? null : this.errorMessage;
        }
    },
    watch:
    {
        value(siValue)
        {
            // if the prop changes from outside
            let siFloat = parseFloat(siValue);
            siFloat = isNaN(siFloat) ? 0 : siFloat;
            const unitsValue = CONVERTER(siFloat, SI_UNITS.id, this.currentUnits.id);
            this.currentValue = parseFloat(unitsValue);
        },
        currentUnits(newUnits, oldUnits)
        {
            const newUnitsValue = CONVERTER(parseFloat(this.currentValue), oldUnits.id, newUnits.id);
            // this strips insignificant trailing zeros
            this.currentValue = parseFloat(newUnitsValue);
        },
        currentValue()
        {
            // emit new value as a float in SI Units if valid
            if(this.isValid)
            {
                this.$emit('input', this.siValue);
            }
        }
    },
    mounted()
    {
        this.currentUnits = this.displayUnits;
        let value = parseFloat(this.value);
        value = isNaN(value) ? 0 : value;
        this.currentValue = CONVERTER(value, SI_UNITS.id, this.currentUnits.id);
    },
};
</script>