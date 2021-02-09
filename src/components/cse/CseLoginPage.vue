<template>
    <div style="background-color:rgba(0,0,0,0.5);width:100%;height:100%;">
        <div
            ref="particles"
            style="position:absolute;top:0;left:0;right:0;bottom:0;z-index:0;"
        />
        <Dialog
            :visible="isVisible"
            :modal="true"
            :closable="false"
            :style="{width: '50vw'}"
        >
            <template #header style="background-color:red;">
                <cse-icon
                    icon="key-variant"
                />
                CSE Sign In
            </template>

            <div style="min-height:25px;" />
            <div class="p-fluid">
                <div class="p-field p-grid">
                    <label
                        class="p-col-2"
                    >
                        Username
                    </label>
                    <span class="p-input-icon-left p-input-icon-right">
                        <cse-icon
                            icon="account"
                            size="1.5em"
                            style="top:0.5em;"
                        />
                        <InputText
                            v-model="form.username.value"
                            autocomplete="current-username"
                            autofocus
                            @input="_resetLoginFail();_validate(form.username);"
                            @keydown.enter="_doLogin()"
                        />
                        <cse-icon
                            v-show="form.username.value.length>0"
                            class="clickable"
                            icon="close"
                            size="1.5em"
                            style="top:0.5em;"
                            @click="form.username.value='';_resetLoginFail();_validate(form.username);"
                        />
                        <small
                            class="p-error"
                        >
                            {{ form.username.message }}
                        </small>
                    </span>
                    <label class="p-col-2">
                        Password
                    </label>
                    <span class="p-input-icon-left p-input-icon-right">
                        <cse-icon
                            icon="key"
                            size="1.5em"
                            style="top:0.5em;"
                        />
                        <Password
                            v-model="form.password.value"
                            :feedback="false"
                            autocomplete="current-password"
                            @click:clear="_resetLoginFail();"
                            @input="_resetLoginFail();_validate(form.password);"
                            @keydown.enter="_doLogin()"
                        />
                        <cse-icon
                            v-show="form.password.value.length>0"
                            class="clickable"
                            icon="close"
                            size="1.5em"
                            style="top:0.5em;"
                            @click="form.password.value='';_resetLoginFail();_validate(form.username);"
                        />
                        <small
                            class="p-error"
                        >
                            {{ form.password.message || '' }}
                        </small>
                    </span>
                </div>
                <div style="min-height:45px;">
                    <Message
                        v-if="loginFailed"
                        dense
                        border="left"
                        severity="warn"
                    >
                        Please check your details and try again.
                    </Message>
                </div>
            </div>

            <template #footer>
                <div class="p-d-flex">
                    <Button
                        class="p-button-secondary"
                        @click="_doCancel()"
                    >
                        Work Offline
                        <cse-icon
                            icon="network-off"
                        />
                    </Button>
                    <div class="spacer" />
                    <Button
                        color="accent"
                        :disabled="!isValid"
                        @click="_doLogin"
                    >
                        Sign In
                        <cse-icon
                            icon="login"
                        />
                    </Button>
                </div>
            </template>
        </Dialog>
    </div>
</template>

<script>
import '@/assets/js/vendors/particles/particles.js';
import TitanUtils from '@/assets/js/titan/titan-utils.js';
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';

import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Message from 'primevue/message';


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
    name: 'cse-login-page',
    components:
    {
        Button, Dialog, InputText, Password, Message,
    },
    data()
    {
        return {
            form:{
                username:
                {
                    value:'',
                    message:'',
                    isValid: false,
                    rules:[
                        (value) => (value && value.length!==0) || 'A username is required.',
                    ]
                },
                password:
                {
                    value:'',
                    message:'',
                    isValid: false,
                    rules:[
                        (value) => (value && value.length!==0) || 'A password is required.',
                    ]
                },
            },
            isVisible: false,
            loginFailed: false,
            inputElms: null,
        };
    },
    computed:
    {
        isValid()
        {
            return this.form.username.isValid && this.form.password.isValid;
        }
    },
    mounted()
    {
        window.particlesJS(this.$refs.particles, PARTICLES);
        this._bindEvents(true);
        this.isVisible = true;
    },
    beforeDestroy()
    {
        this._unbindEvents(false);
    },
    methods: {
        _resetLoginFail()
        {
            this.loginFailed = false;
        },
        _validate(field)
        {
            const messages = field.rules.map((rule) => rule(field.value)).filter((result) => result!==true);
            field.isValid = messages.length === 0;
            field.message = messages.join(' ');
        },
        _doLogin()
        {
            if(!this.isValid)
                return;

            if(this.form.username.value ==='admin' && this.form.password.value ==='password')
            {
                this.isVisible = false;
                this.$router.push({name:'cse'});
            }
            else
            {
                this.loginFailed = true;
            }
        },
        _doCancel()
        {
            this.$router.push({name:'cse'});
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
        __manageEventBindings(/* shouldBind */)
        {
            // const bindFuncName = shouldBind ? 'addEventListener' : 'removeEventListener';

            // do tab key press hack as necessary for titan keydown events in input fields
            // this.inputElms.forEach((inputElm)=>
            // {
            //     inputElm[bindFuncName]('keydown', this.handleKeyEvent);
            // });
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
        foo(bar)
        {
            console.log(bar);
        },
    }
};
</script>
