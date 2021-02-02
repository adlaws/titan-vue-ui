<template>
    <modal-container :is-visible="isVisible">
        <easy-modal-content height="30%" :no-close="noClose" @cancel="_doCancel">
            <template #header>
                <slot name="title" v-bind="theContext">
                    {{ theTitle }}
                </slot>
            </template>
            <template #body>
                <div class="flex-xy-centered-content">
                    <slot name="message" v-bind="theContext">
                        {{ theMessage }}
                    </slot>
                </div>
            </template>
            <template #footer>
                <div class="button-bar m-1" :style="isOkOnly?'justify-content:flex-end;':''">
                    <titan-button
                        v-if="!isOkOnly"
                        class="inputButton"
                        @click="_doCancel"
                    >
                        <slot name="modal-cancel" v-bind="theContext">
                            {{ theCancelText }}
                        </slot>
                    </titan-button>
                    <titan-button
                        class="inputButton"
                        @click="_doConfirm"
                    >
                        <slot name="modal-ok" v-bind="theContext">
                            {{ theOkText }}
                        </slot>
                    </titan-button>
                </div>
            </template>
        </easy-modal-content>
    </modal-container>
</template>

<script>
import ModalContainer from './ModalContainer.vue';
import EasyModalContent from './EasyModalContent.vue';
import TitanButton from '@/components/common/cse/forms/TitanButton.vue';

export default {
    name: 'basic-modal-dialog',
    components:
    {
        ModalContainer, EasyModalContent, TitanButton
    },
    props:
    {
        title:      { type: String, default: 'Confirm Action'},
        message:    { type: String, default: 'Are you sure you wish to proceed?' },
        okText:     { type: String, default: 'Yes' },
        cancelText: { type: String, default: 'No' },
        okOnly:     { type: String, default: null },
        noClose:    { type:[String, Boolean], default:false},
        context:    { type: [String, Number, Boolean, Array, Object, Date, Function, Symbol], default: null },
    },
    data()
    {
        return {
            isVisible:          false,
            titleOverride:      null,
            messageOverride:    null,
            okTextOverride:     null,
            cancelTextOverride: null,
            contextOverride:    null,
        };
    },
    computed:
    {
        theTitle:      function() { return this.titleOverride      || this.title      || ''; },
        theMessage:    function() { return this.messageOverride    || this.message    || ''; },
        theOkText:     function() { return this.okTextOverride     || this.okText     || ''; },
        theCancelText: function() { return this.cancelTextOverride || this.cancelText || ''; },
        theContext:    function()
        {
            if(this.contextOverride !== undefined)
                return this.contextOverride;
            return this.context || null;
        },
        isOkOnly:    function() { return this.okOnly !== null; }
    },
    methods: {
        setTitle(title)
        {
            this.titleOverride = title;
            return this;
        },
        setMessage(message)
        {
            this.messageOverride = message;
            return this;
        },
        setOkText(okText)
        {
            this.okTextOverride = okText;
            return this;
        },
        setCancelText(cancelText)
        {
            this.cancelTextOverride = cancelText;
            return this;
        },
        setContext(context)
        {
            this.contextOverride = context;
            return this;
        },
        /**
         * Show the confirmation dialog
         * @param {*} context optionally supply contextual data associated with the confirmation
         *        which will be included in the emitted confirmation/cancellation events. Note
         *        that this will override any `context` property already set on the component in
         *        terms of the emitted events.
         */
        show(context)
        {
            this.contextOverride = context;
            this.$nextTick(function()
            {
                this.isVisible = true;
            }.bind(this));
        },
        /**
         * Hide the confirmation dialog
         */
        hide()
        {
            this.isVisible = false;
        },
        _doConfirm()
        {
            this.$emit('confirmed', this.theContext);
            this.hide();
        },
        _doCancel()
        {
            this.$emit('cancelled', this.theContext);
            this.hide();
        }
    }
};
</script>

<style lang="scss">
.flex-xy-centered-content
{
    height:100%;
    /* Flexbox layout */
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: center;
    align-content: stretch;
    align-items: center;
}
</style>