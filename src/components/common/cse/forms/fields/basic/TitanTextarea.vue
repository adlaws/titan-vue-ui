<template>
    <div>
        <label v-if="label" :for="id">{{ label }}</label>
        <textarea
            :id="id"
            :name="name"
            :value="value"
            @focus="handleFocus"
            @input="$emit('input', $event.target.value)"
            @blur="$emit('blur', $event)"
        />
    </div>
</template>

<script>
/**
 * Example usage:
 *
 *      <titan-textarea v-model="someText" />
 */
import TitanUtils from '@/assets/js/titan/titan-utils';
import CryptoUtils from '@/assets/js/utils/crypto-utils.js';

export default {
    name: 'titan-textarea',
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
        }
    },
    methods:
    {
        handleFocus()
        {
            if(!TitanUtils.isInOuterra())
                return;

            // special handling for Titan key focus etc
            TitanUtils.deactivateUndoRedoKeyMonitoring();
            window.onkeydown = () => true;
            window.onkeyup = () => true;
            return true;
        },
    },
};
</script>
