<template>
    <modal-container :is-visible="isVisible">
        <titan-window
            title="Sign In"
            icon="key-variant"
            x="center"
            y="center"
            width="30%"
            height="30%"
            :closable="false"
            :resizable="false"
            :minimizable="false"
            :draggable="false"
        >
            <template #default>
                <div class="login-form">
                    <form>
                        <div class="form-row">
                            <label for="username">Username</label>
                            <input
                                type="text"
                                name="username"
                                autocomplete="none"
                                required
                            >
                        </div>
                        <div class="form-row">
                            <label for="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                autocomplete="current-password"
                                required
                            >
                        </div>
                    </form>
                    <div class="spacer" />
                    <div class="button-row">
                        <button>Cancel</button>
                        <button>Sign In</button>
                    </div>
                </div>
            </template>
        </titan-window>
    </modal-container>
</template>

<script>
import ModalContainer from '@/components/titan/modals/ModalContainer.vue';

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

<style lang="scss">
@import '@/assets/scss/variables.scss';

.login-form
{
    color: $window-fg-active;
    background-color: $window-bg-active;
    padding: 8px;
    height: 100%;

    display: flex;
    flex-direction: column;

    .spacer { flex-grow: 1 }

    .form-row
    {
        width:100%;
        display: flex;
        label {flex-grow: 0.1;flex-basis: 0;}
        input {flex-grow: 1;}
    }

    .button-row
    {
        display: flex;
        justify-content: space-between;
    }
}
</style>