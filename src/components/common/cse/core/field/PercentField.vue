<!--
    A component which accepts and validates percentage values
    Optionally specify min and max allowed values
-->
<template>
    <div class="p-field">
        <label
            v-if="label"
        >
            {{ label }}
        </label>
        <InputNumber
            v-model.trim.number="currentValue"
            class="input-align-right"
            hide-details="auto"
            suffix="%"
            style="width:99%;"
            :class="{'p-invalid':!isValid}"
            :disabled="disabled"
            :hint="hint"
            :placeholder="placeholder"
            :readonly="readonly"
        />
        <Slider
            v-model="currentValue"
            :min="min"
            :max="max"
            style="width:99%;"
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
import InputNumber from 'primevue/inputnumber';
import Slider from 'primevue/slider';

const POSITIVE_FLOAT_REGEX = /^\d+(\.\d+)?$/;
const FLOAT_REGEX = /^[+-]?\d+(\.\d+)?$/;

export default {
    name: 'percent-field',
    // model: {
    //     // Using `v-model` directive custom components:
    //     //  Ref: https://dev.to/vue-storefront/vue-during-coffee-break-using-v-model-with-custom-components-3bo9
    //     // Since the name of the event we emit is 'input', which is the default,
    //     // we don't actually need to bother specifying it here (see the `validate()` method)
    // event: 'input'
    // },
    components:
    {
        InputNumber, Slider
    },
    props:
    {
        value:
        {
            type: [Number, String,],
            default: 0.0,
            validator: (value) => !isNaN(parseFloat(value))
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
            default: 100.0,
            validator: (value) => !isNaN(parseFloat(value))
        },
        slider: {
            type: Boolean,
            default: true,
        },
        // these are Vuetify <v-text-field> properties which we allow and pass through
        //   Ref: https://vuetifyjs.com/en/api/v-text-field/#props
        disabled: Boolean,
        readonly: Boolean,
        hint: { type: String, default: undefined },
        label: { type: String, default: undefined },
        placeholder: { type: String, default: undefined },
    },
    data()
    {
        return {
            currentValue: 0,
        };
    },
    computed:
    {
        isValid()
        {
            if(!this.validationRegex.test(this.currentValue))
                return false;
            const floatVal = parseFloat(this.currentValue);
            return floatVal >= this.min && floatVal <=this.max;
        },
        validationRegex()
        {
            // choose validation regex based on allowed range of values
            return this.min < 0 ? FLOAT_REGEX : POSITIVE_FLOAT_REGEX;
        },
        errorMessage()
        {
            // create error message based on range
            // use parseFloat() to remove insignificant trailing zeroes
            const min = parseFloat(this.min);
            const max = parseFloat(this.max);
            return `${min}% - ${max}% required`;
        },
        messages()
        {
            return this.isValid ? null : this.errorMessage;
        }
    },
    watch:
    {
        value(newValue)
        {
            // if the prop changes from outside
            const asFloat = parseFloat(newValue);
            this.currentValue = isNaN(asFloat) ? 0 : asFloat;
        },
        currentValue(newValue)
        {
            // emit new value as a float if valid
            if(this.isValid)
                this.$emit('input', newValue);
        }
    },
    beforeMounted()
    {
        this.currentValue = this.value;
    },
};
</script>