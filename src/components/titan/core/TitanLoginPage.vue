<template>
    <div>
        <div
            ref="particles"
            style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:201;"
        />
        <v-dialog
            v-model="isVisible"
            max-width="50%"
            eager
            persistent
        >
            <v-card>
                <v-card-title class="white--text accent">
                    <v-icon class="mr-2 white--text">
                        mdi-key-variant
                    </v-icon>
                    CSE Sign In
                </v-card-title>
                <v-card-text>
                    <div style="min-height:25px;" />
                    <v-form
                        ref="loginForm"
                        v-model="form.isValid"
                        style="position:relative;"
                    >
                        <v-text-field
                            v-model="form.username"
                            label="Username"
                            prepend-inner-icon="mdi-account"
                            autocomplete="current-username"
                            clearable
                            clear-icon="mdi-close"
                            :rules="[form.rules.usernameRequired,]"
                            @click:clear="resetLoginFail();"
                            @input="resetLoginFail"
                            @keydown.enter="_doLogin()"
                        />
                        <v-text-field
                            v-model="form.password"
                            label="Password"
                            :type="revealPassword ? 'text' : 'password'"
                            prepend-inner-icon="mdi-key"
                            :append-icon="revealPassword ? 'mdi-eye-off' : 'mdi-eye'"
                            autocomplete="current-password"
                            clear-icon="mdi-close"
                            clearable
                            :rules="[form.rules.passwordRequired,]"
                            @click:clear="resetLoginFail();"
                            @click:append="resetLoginFail();revealPassword = !revealPassword;"
                            @input="resetLoginFail"
                            @keydown.enter="_doLogin()"
                        />
                    </v-form>
                    <div style="min-height:45px;">
                        <v-alert
                            v-if="loginFailed"
                            dense
                            border="left"
                            type="warning"
                        >
                            Please check your details and try again.
                        </v-alert>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn
                        secondary
                        @click="$router.push({name:'titan'})"
                    >
                        Work Offline
                        <v-icon right>
                            mdi-network-off
                        </v-icon>
                    </v-btn>
                    <v-spacer />
                    <v-btn
                        color="accent"
                        :disabled="!form.isValid"
                        @click="_doLogin"
                    >
                        Sign In
                        <v-icon right>
                            mdi-login
                        </v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
import '@/assets/js/vendors/particles/particles.js';
import TitanUtils from '@/assets/js/titan/titan-utils.js';
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';

const PARTICLES = {
    "particles": {
        "number": {
            "value": 50,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#ffffff"
        },
        "shape": {
            "type": "circle",
            "stroke": {
                "width": 0,
                "color": "#000000"
            },
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            }
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": true,
                "speed": 5,
                "size_min": 0.1,
                "sync": false
            }
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#ffffff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 0.5,
            "direction": "none",
            "random": true,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": {
                "enable": false,
                "rotateX": 600,
                "rotateY": 1200
            }
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": false,
                "mode": "repulse"
            },
            "onclick": {
                "enable": false,
                "mode": "push"
            },
            "resize": true
        },
    },
    "retina_detect": false
};

export default {
    name: 'titan-login-page',
    components:
    {
        // ModalContainer, // TitanIcon,
    },
    data()
    {
        return {
            form:{
                username:'',
                password:'',
                isValid: false,
                rules: {
                    usernameRequired: value => !!value || 'A username is required.',
                    passwordRequired: value => !!value || 'A password is required.',
                },
            },
            revealPassword: false,
            isVisible: true,
            loginFailed: false,
            inputElms: null,
        };
    },
    mounted()
    {
        this.inputElms = [... this.$refs.loginForm.$el.querySelectorAll('input')];
        window.particlesJS(this.$refs.particles, PARTICLES);
        // this._bindEvents(true);
    },
    beforeDestroy()
    {
        this._unbindEvents(false);
    },
    methods: {
        resetLoginFail()
        {
            this.loginFailed = false;
        },
        _doLogin()
        {
            if(!this.form.isValid)
                return;

            if(this.form.username==='admin' && this.form.password==='password')
            {
                this.isVisible = false;
                this.$router.push({name:'titan'});
            }
            else
            {
                this.loginFailed = true;
            }
        },
        _doCancel()
        {
            this.$router.push({name:'titan'});
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

            // do tab key press hack as necessary for titan keydown events in input fields
            this.inputElms.forEach((inputElm)=>
            {
                inputElm[bindFuncName]('keydown', this.handleKeyEvent);
            });
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
