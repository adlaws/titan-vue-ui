<template>
    <div>
        <titan-input
            v-model.trim="$v.email.$model"
            :value="value"
            :label="label"
            :class="{error:$v.email.$error}"
            :title="errorText"
            @input="handleInput"
        />
        <template v-if="$v.email.$error">
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
 *      <t-email-input v-model="theEmail" />
 */
import { validationMixin } from 'vuelidate';
import { required, email } from 'vuelidate/lib/validators';

import TitanInput from '@/components/common/titan/forms/fields/basic/TitanInput.vue';

export default {
    name: 't-email-input',
    components: {
        TitanInput,
    },
    mixins: [validationMixin],
    props: {
        value:
        {
            type:String,
            default:''
        },
        label:
        {
            type:String,
            default:null
        },
    },
    data()
    {
        return{
            email: '',
        };
    },
    computed: {
        self()
        {
            return this;
        },
        isInvalid()
        {
            return this.$v.email.$error;
        },
        isValid()
        {
            return !this.isInvalid;
        },
        errorText()
        {
            return `An valid email address is required`;
        },
    },
    mounted()
    {
        this.email = this.value;
        this.$v.$touch();
    },
    validations: {
        email: {
            required,
            email,
        },
    },
    methods:
    {
        handleInput(value)
        {
            this.email = value;
            this.$nextTick(function()
            {
                this.$emit('input', this.email);
            });
        },
    },
};
</script>
