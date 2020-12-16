<template>
    <modal-container
        :is-visible="isVisible"
        @click="_watchForClickOutsideOrEscape"
    >
        <titan-window
            ref="theWindow"
            title="CSE Sign In"
            icon="key-variant"
            x="center"
            y="center"
            width="30%"
            height="30%"
            min-width="450"
            :closable="false"
            :resizable="false"
            :minimizable="false"
            :draggable="false"
            :class="{'shake-error': shake}"
            @animationend="_resetShake"
        >
            <template #default>
                <div class="login-form">
                    <div class="spacer" />
                    <form
                        ref="loginForm"
                        style="position:relative;"
                    >
                        <v-text-field
                            v-model="form.username"
                            label="Username"
                            prepend-inner-icon="mdi-account"
                            clear-icon="mdi-close"
                            autocomplete="current-username"
                            clearable
                            @click:clear="resetLoginFail();"
                            @input="resetLoginFail"
                        />
                        <v-text-field
                            v-model="form.password"
                            label="Password"
                            :type="revealPassword ? 'password' : 'text'"
                            prepend-inner-icon="mdi-key"
                            :append-outer-icon="revealPassword ? 'mdi-eye' : 'mdi-eye-off'"
                            autocomplete="current-password"
                            clear-icon="mdi-close"
                            clearable
                            @click:clear="resetLoginFail();"
                            @click:append-outer="resetLoginFail();revealPassword = !revealPassword;"
                            @input="resetLoginFail"
                        />
                    </form>
                    <v-alert
                        v-if="loginFailed"
                        dense
                        border="left"
                        type="warning"
                    >
                        Please check your details and try again.
                    </v-alert>
                    <div class="spacer" />
                    <div class="button-row">
                        <v-btn
                            secondary
                            @click="$router.push({name:'titan'})"
                        >
                            Work Offline
                            <v-icon right>
                                mdi-network-off
                            </v-icon>
                        </v-btn>
                        <v-btn
                            primary
                            :disabled="!canLogin"
                            @click="_doLogin"
                        >
                            Sign In
                            <v-icon right>
                                mdi-login
                            </v-icon>
                        </v-btn>
                    </div>
                </div>
            </template>
        </titan-window>
    </modal-container>
</template>

<script>
import TitanUtils from '@/assets/js/titan/titan-utils.js';
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';

// import TitanIcon from '@/components/titan/core/TitanIcon.vue';
import ModalContainer from '@/components/titan/modals/ModalContainer.vue';

export default {
    name: 'titan-login-page',
    components:
    {
        ModalContainer, // TitanIcon,
    },
    data()
    {
        return {
            form:{
                username:'',
                password:'',
            },
            revealPassword: false,
            isVisible: true,
            loginFailed: false,
            shake: false,
            inputElms: null,
        };
    },
    computed:
    {
        canLogin() { return this.form.username.length > 0 && this.form.password.length > 0; }
    },
    mounted()
    {
        this.inputElms = [... this.$refs.loginForm.querySelectorAll('input')];
        this._bindEvents(true);
    },
    beforeDestroy()
    {
        this._unbindEvents(false);
    },
    methods: {
        resetLoginFail()
        {
            this.loginFailed = false;
            this._resetShake();
        },
        _doLogin()
        {
            this._resetShake();

            if(this.form.username==='admin' && this.form.password==='password')
                this.$router.push({name:'titan'});
            else
            {
                this.shake = true;
                this.loginFailed = true;
            }
        },
        _doCancel()
        {
            this.$router.push({name:'titan'});
        },
        _clearUsername()
        {
            this.form.username = '';
        },
        _clearPassword()
        {
            this.form.password = '';
        },
        /**
         * Binds all necessary events
         */
        _bindEvents()
        {
            this.__manageEventBindings(true);
        },
        /**
         * Unbinds all events bound by `_bindEvents()`
         */
        _unbindEvents()
        {
            this.__manageEventBindings(false);
        },
        /**
         * Manages binding/unbinding events
         *
         * @param {boolean} shouldBind true if events need to be bound,
         *        otherwise they will be unbound
         */
        __manageEventBindings(shouldBind)
        {
            const bindFuncName = shouldBind ? 'addEventListener' : 'removeEventListener';

            // reset shake class when shake animation ends
            this.$refs.theWindow.$el[bindFuncName]('animationend', this._resetShake);

            // do tab key press hack as necessary for titan keydown events in input fields
            this.inputElms.forEach((inputElm)=>
            {
                inputElm[bindFuncName]('keydown', this.handleKeyEvent);
            });
        },
        /**
         * This method checks for clicks outside the context menu or pressing
         * of the escape key to cancel/dismiss the context menu without making
         * a selection.
         */
        _watchForClickOutsideOrEscape()
        {
            this.shake = true;
        },
        /**
         * This method simply removes the `shake` class on the window to reset the
         * animation state so that it can be shaken again if another failure occurs
         */
        _resetShake()
        {
            this.shake = false;
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // KEY EVENT HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        // general key event handler
        handleKeyEvent(evt)
        {
            if(!EventUtils.isKeyDown(evt, [KEY.KEY_CODE.TAB, KEY.KEY_CODE.ENTER]))
                return;

            if(EventUtils.isKey(evt, KEY.KEY_CODE.TAB))
            {
                TitanUtils.outerraTabHack(evt, {elements: this.inputElms});
            }
            else if(this.canLogin && EventUtils.isKey(evt, KEY.KEY_CODE.ENTER))
            {
                this._doLogin();
            }
        },
    }
};
</script>

<style lang="scss">
@import '@/assets/scss/styles.scss';

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

    .message-body
    {
        // overrides Bulma message size padding which is huge
        // Ref: node_modules\bulma\sass\components\message.sass - $message-body-padding
        padding: 0.5rem 0.25rem;
    }
}
</style>