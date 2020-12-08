<template>
    <modal-container :is-visible="isVisible">
        <titan-window
            title="Sign In"
            icon="key-variant"
            :x="100"
            :y="100"
            :width="300"
            :height="300"
            :closable="false"
            :resizable="false"
            :minimizable="false"
            :draggable="false"
        >
            <template #default="context">
                <titan-window-content :titan-window="context.titanWindow">
                    Some stuff here
                </titan-window-content>
            </template>
        </titan-window>
    <!--
        <easy-modal-content height="30%" @cancel="_doCancel">
            <template #header>
                Login
            </template>
            <template #body>
                Some Login Fields here
            </template>
            <template #footer>
                <div class="button-bar m-1">
                    <button
                        @click="_doCancel"
                    >
                        <slot name="modal-cancel">
                            Single Player
                        </slot>
                    </button>
                    <button
                        class="inputButton"
                        @click="_doConfirm"
                    >
                        <slot name="modal-ok">
                            Sign In
                        </slot>
                    </button>
                </div>
            </template>
        </easy-modal-content>
        -->
    </modal-container>
</template>

<script>
import ModalContainer from '@/components/titan/modals/ModalContainer.vue';
// import EasyModalContent from '@/components/titan/modals/EasyModalContent.vue';

export default {
    name: 'titan-login-page',
    components:
    {
        ModalContainer,
        // EasyModalContent
    },
    data()
    {
        return {
            isVisible: true,
        };
    },
    methods: {
        /**
         * Show the dialog
         */
        show()
        {
            this.$nextTick(function()
            {
                this.isVisible = true;
            }.bind(this));
        },
        /**
         * Hide the dialog
         */
        hide()
        {
            this.isVisible = false;
        },
        _doConfirm()
        {
            this.$emit('confirmed');
            this.hide();
        },
        _doCancel()
        {
            this.$emit('cancelled');
            this.hide();
            this.$router.push({name:'titan'});
        }
    }
};
</script>
