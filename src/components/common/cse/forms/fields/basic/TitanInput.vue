<template>
    <div>
        <label v-if="label" :for="id">{{ label }}</label>
        <slot name="prepend" />
        <input
            :id="id"
            :type="type"
            :name="name"
            :value="value"
            :min="min"
            :max="max"
            :placeholder="placeholder"
            :disabled="disabled"
            @focus="handleFocus"
            @input="$emit('input', $event.target.value)"
            @blur="$emit('blur', $event)"
        >
        <slot name="append" />
    </div>
</template>

<script>
/**
 * Example usage:
 *
 *      <titan-input v-model="someText" />
 */
import { $isInOuterra } from '@/assets/js/titan/titan-utils.js';
import CryptoUtils from '@/assets/js/utils/crypto-utils.js';

export default {
    name: 'titan-input',
    props: {
        id:{
            type:String,
            default:()=>CryptoUtils.simpleUUID()
        },
        name:{
            type:String,
            default:()=>CryptoUtils.simpleUUID()
        },
        label:{
            type:String,
            default:null
        },
        value:{
            type:String,
            default:''
        },
        min:{
            type:[Number, Date],
            default:null
        },
        max:{
            type:[Number, Date],
            default:null
        },
        placeholder:{
            type:String,
            default:''
        },
        disabled:{
            type:[String,Boolean],
            default:false
        },
        type:{
            type:String,
            default:'text'
        },
    },
    methods:
    {
        handleFocus()
        {
            if($isInOuterra)
                return false;

            // special handling for Titan key focus etc
            // TitanUtils.deactivateUndoRedoKeyMonitoring();
            window.onkeydown = () => true;
            window.onkeyup = () => true;
            return true;
        },
    },
};
</script>
