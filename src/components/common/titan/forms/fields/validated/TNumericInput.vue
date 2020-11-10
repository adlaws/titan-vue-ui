<template>
    <div>
        <titan-input
            v-model.trim="$v.strValue.$model"
            :value="strValue"
            type="number"
            :label="label"
            :min="minValue"
            :max="maxValue"
            :class="{error:$v.strValue.$error}"
            :title="errorText"
            :placeholder="placeholder"
            :disabled="disabled"
            @input="handleInput"
        >
            <template #prepend>
                <slot name="prepend" />
            </template>
            <template #append>
                <slot name="append" />
            </template>
        </titan-input>
        <template v-if="$v.strValue.$error">
            <slot name="user-hint" v-bind="self">
                <span>{{ errorText }}</span>
            </slot>
        </template>
    </div>
</template>

<script>
/**
 * Example usages:
 *
 * Basic Usage:
 *      <t-integer-input v-model="theInteger" />
 *
 * Specifiy minimum allowed value:
 *      <t-integer-input v-model="theInteger" min="0" />
 *
 * Specifiy maximum allowed value:
 *      <t-integer-input v-model="theInteger" max="10" />
 *
 * Specifiy allowed value range:
 *      <t-integer-input v-model="theInteger" min="0" max="10" />
 *
 * Custom error rendering with `user-hint` slot (`context` contains a reference to `this`):
 *
 *      <t-integer-input v-model="theInteger" min="0" max="10">
 *          <template #user-hint="context">
*              <span style="color:red;">{{ context.errorText }}</span>
 *          </template>
 *      </t-integer-input>
 *
 * ...or (older VueJS syntax):
 *
 *      <t-integer-input v-model="theInteger" min="0" max="10">
 *          <template v-slot:user-hint="context">
 *              <span style="color:red;">{{ context.errorText }}</span>
 *          </template>
 *      </t-integer-input>
 */
import { validationMixin } from 'vuelidate';
import { required, integer } from 'vuelidate/lib/validators';

import TitanInput from '@/components/common/titan/forms/fields/basic/TitanInput.vue';

export default {
    name: 't-numeric-input',
    components: {
        TitanInput,
    },
    mixins: [validationMixin],
    props: {
        value:
        {
            type:[String, Number],
            default:'0'
        },
        label:
        {
            type:String,
            default:null
        },
        placeholder:
        {
            type:[String, Number],
            default:''
        },
        disabled:{
            type:[String,Boolean],
            default:false
        },
        min:
        {
            type:[String, Number],
            default:null
        },
        max:
        {
            type:[String, Number],
            default:null
        },
    },
    data()
    {
        return{
            strValue: '0',
        };
    },
    computed: {
        self()
        {
            return this;
        },
        isInvalid()
        {
            return this.$v.strValue.$error;
        },
        isValid()
        {
            return !this.isInvalid;
        },
        getValue()
        {
            let result = parseFloat(this.strValue);
            return isNaN(result)?null:result;
        },
        minValue()
        {
            if(this.min === null)
                return null;
            let result = Number(this.min);
            return isNaN(result)?null:result;
        },
        maxValue()
        {
            if(this.max === null)
                return null;
            let result = Number(this.max);
            return isNaN(result)?null:result;
        },
        errorText()
        {
            return `An integer ${this._rangeText}is required`;
        },
        _rangeText()
        {
            if(this.minValue !== null && this.maxValue !== null)
                return `between ${this.minValue} and ${this.maxValue} (inclusive) `;
            if(this.minValue !== null)
                return `${this.minValue} or more `;
            if(this.maxValue !== null)
                return `${this.maxValue} or less `;
            return '';
        },
    },
    mounted()
    {
        this.strValue = new String(this.value);
        this.$v.$touch();
    },
    validations: {
        strValue: {
            required,
            integer,
            inRange: function(value)
            {
                if(this.minValue === null && this.maxValue === null)
                    return true;

                let result = true;
                let getValue = parseInt(value, 10);
                if(this.minValue !== null)
                    result = result && (getValue >= this.minValue);
                if(this.maxValue !== null)
                    result = result && (getValue <= this.maxValue);
                return result;
            }
        },
    },
    methods:
    {
        handleInput(value)
        {
            this.strValue = value;
            this.$nextTick(function()
            {
                this.$emit('input', this.getValue);
            });
        },
    },
};
</script>
