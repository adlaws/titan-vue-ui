<template>
    <div>
        <h1>{{ msg }}</h1>

        <t-input
            v-model.trim="$v.theText.$model"
            label="Some Text:"
            :class="{error:$v.theText.$error}"
        />
        <span v-if="$v.theText.$error">That's too short</span>
        <span v-else>{{ theText }}</span>
        <hr>

        <t-textarea
            v-model="theTextArea"
            label="Some Longer Text:"
        />
        {{ theTextArea }}
        <hr>

        <input
            v-model="theCheckBox"
            type="checkbox"
        >
        {{ theCheckBox }}
        <hr>

        <t-select
            v-model="theSelect"
            :options="theSelectOptions"
            default-text="Choose something..."
            label="Please Choose:"
        />
        {{ theSelect }}
        <hr>

        <t-select
            v-model="theMultiSelect"
            :options="theSelectOptions"
            default-text="Choose something..."
            label="Please Choose Some Things:"
            multiple
        />
        {{ theMultiSelect }}
        <hr>

        <t-integer-input
            v-model="theInteger"
            min="0"
            max="10"
            label="Enter a number:"
        >
            <template v-slot:user-hint="field">
                {{ field.errorText }}
            </template>
        </t-integer-input>
        Number is: {{ theInteger }}
        <hr>

        <t-email-input
            v-model="theEmail"
            label="Enter your email address:"
        />
        Email is: {{ theEmail }}
        <hr>

        <t-button @click="showConfirmDialog">
            Confirm Dialog
        </t-button>
        Confirmed?:{{ wasConfirmed }}

        <t-button @click="showInfoDialog">
            Info Dialog
        </t-button>
        Acknowledged?:{{ wasAcknowledged }}
        <hr>
        <t-tabs initial-tab="theApple">
            <t-tab title="banana">
                BANANA TAB CONTENT
            </t-tab>
            <t-tab title="apple" identifier="theApple">
                APPLE TAB CONTENT
            </t-tab>
            <t-tab title="orange" disabled>
                ORANGE TAB CONTENT
            </t-tab>
            <t-tab title="mango">
                MANGO TAB CONTENT
            </t-tab>
        </t-tabs>
        <hr>

        <basic-modal-dialog
            ref="confirmDialog"
            title="Please Confirm"
            message="You need to confirm this action"
            @confirmed="wasConfirmed=true"
            @cancelled="wasConfirmed=false"
        />
        <basic-modal-dialog
            ref="infoDialog"
            ok-only
            title="Notification"
            message="Be aware that stuff has happened"
            @confirmed="handleAcknowledged"
        />
    </div>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, minLength } from 'vuelidate/lib/validators';

import TInput from '@/components/titan/forms/fields/basic/TInput.vue';
import TTextarea from '@/components/titan/forms/fields/basic/TTextarea.vue';
import TSelect from '@/components/titan/forms/fields/basic/TSelect.vue';
import TButton from '@/components/titan/forms/TButton.vue';

import TIntegerInput from '@/components/titan/forms/fields/validated/TIntegerInput.vue';
import TEmailInput from '@/components/titan/forms/fields/validated/TEmailInput.vue';

import TTabs from '@/components/titan/tabs/TTabs.vue';
import TTab from '@/components/titan/tabs/TTab.vue';

import BasicModalDialog from '@/components/titan/modals/BasicModalDialog.vue';

export default {
    name: 'whassup',
    components: {
        TInput, TTextarea, TSelect, TButton,
        TIntegerInput, TEmailInput,
        TTabs, TTab,
        BasicModalDialog,
    },
    mixins: [validationMixin],
    props: {msg:{type:String, default:'Hi'}},
    data()
    {
        return {
            theText: 'What is up?',
            theTextArea: 'Is that rights?',
            theCheckBox: true,
            theSelect: 1,
            theMultiSelect: [1,3],
            theSelectOptions:[{id:1, text:'A', tooltip:'This is SPARTA!'},{id:2, text:'B'},{id:3, text:'C'},{id:4, text:'D', disabled:true}],
            theInteger:123,
            theEmail:'',
            wasConfirmed: false,
            wasAcknowledged: false,
        };
    },
    validations: {
        theText: {
            required,
            minLength: minLength(4)
        },
    },
    methods:
    {
        showConfirmDialog()
        {
            this.$refs.confirmDialog.show();
        },
        showInfoDialog()
        {
            this.$refs.infoDialog.show();
        },
        handleAcknowledged()
        {
            this.wasAcknowledged = true;
            setTimeout(function() {this.wasAcknowledged = false;}.bind(this), 5000);
        }
    }
};
</script>

<style lang="scss">
    @import '@/assets/scss/terrainconnect_manager.scss';
</style>
