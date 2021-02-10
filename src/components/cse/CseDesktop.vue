<template>
    <div
        v-show="desktopVisible"
        ref="container"
        class="cse-desktop pass-through"
        :class="{'faux-outerra-background': !isInOuterra}"
    >
        <cse-menu-bar v-if="menubarVisible" />

        <transition
            name="fade-slow"
            mode="out-in"
        >
            <cse-splash
                v-if="showSplashScreen"
                @click.native="_hideSplashScreen"
            />
        </transition>

        <editor-ui v-if="isSimModeEditor" />
        <lobby-ui v-if="isSimModeAdmin" />

        <cse-task-bar v-if="taskbarVisible" />
    </div>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';
import { TITAN_MUTATION, TITAN_ACTION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';

import UiUtils from '@/assets/js/utils/ui-utils.js';
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';
import TitanUtils, { $eview, $isInOuterra, $tWorldInterface, $tLogger, SIM_MODE, CAMERA_MODE, FREE_CAMERA_MODE } from '@/assets/js/titan/titan-utils.js';

import EditorUi from '@/components/common/cse/sim-mode/EditorUI.vue';
import LobbyUi from '@/components/common/cse/sim-mode/LobbyUI.vue';

export default {
    name: 'cse-desktop',
    components:
    {
        EditorUi, LobbyUi,
    },
    data()
    {
        return {
            desktopVisible: true,
        };
    },
    computed:
    {
        isInOuterra() { return $isInOuterra; },
        showSplashScreen() { return this.$store.getters.showSplashScreen; },
        currentSimMode() { return this.$store.getters.titanSimMode; },
        isSimModeEditor() { return this.currentSimMode === SIM_MODE.EDITOR; },
        isSimModeAdmin() { return this.currentSimMode === SIM_MODE.ADMIN; },
        taskbarVisible() { return this.$store.getters.isTaskbarVisible; },
        menubarVisible() { return this.$store.getters.isMenubarVisible; },
    },
    watch:
    {
        currentSimMode() { if(this.showSplashScreen) this._hideSplashScreen(); },
        desktopVisible(isVisible, /*wasVisible*/)
        {
            if(isVisible)
            {
                self.moveTo(0, 0);
                self.resizeTo(screen.availWidth, screen.availHeight);
            }
            else
            {
                self.moveTo(0, 0);
                self.resizeTo(0, 0);
            }
        },
    },
    created()
    {
        // here we read in and initialize the plugin configuration
        this.$store.dispatch(TITAN_ACTION.INIT_PLUGIN_CONFIG);
        if(!$isInOuterra)
            window.addEventListener('resize', this._browserResizeHandler);
    },
    mounted()
    {
        this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.Desktop);

        // bind event handlers
        // NOTE: binding event handlers to `window` or `document` both
        // achieve the same thing - not sure which (if either) is a
        // better choice here
        [
            'mousedown', 'mouseup', 'mousemove','mousewheel',
            'mouseout', 'mouseover',
            'click', 'dblclick', 'contextmenu',
        ].forEach((evtType) => document.addEventListener(evtType, this.handleMouseEvent) );
        [
            'keyup', 'keydown'
        ].forEach((evtType) => document.addEventListener(evtType, this.handleKeyEvent) );

        window.on_desktop_key_down = function(evt)
        {
            if(!this.desktopVisible)
            {
                const isEscapeKey = EventUtils.isKey(evt, KEY.KEY_CODE.ESCAPE );
                if((isEscapeKey))
                {
                    this.desktopVisible = true;
                    if($isInOuterra)
                    {
                        setTimeout(()=>
                        {
                            const activeScenario = $tWorldInterface.getActiveScenario();
                            const activeCamera = activeScenario ? activeScenario.getActiveCamera() : null;
                            if(activeCamera)
                            {
                                activeCamera.setCameraMode( CAMERA_MODE.FREEVIEW );
                                activeCamera.setFreeCameraMode( FREE_CAMERA_MODE.AUTO_ROLL );
                            }
                        },100);
                    }
                }
            }
            $eview.mark_unhandled();
        }.bind(this);

        window.on_desktop_mouse_down = function(evt)
        {
            if(EventUtils.hasRightMouseButton(evt, 'on_desktop_mouse_down'))
            {
                // feed through to Outerra for camera look functionality by
                // marking as unhandled.
                // NOTE: by doing this on the mouse down event, we also cause the
                //       mouse pointer to be hidden and "lock" to it's current
                //       position so that after the mouse look is over the pointer
                //       will reappear where it last was. If we leave it until
                //       the mouse move event, the pointer remains visible and
                //       moves around on the screen as the camera look occurs.
                // NOTE: when we mark this event as 'unhandled', if a
                //       mouse drag occurs before the button is released,
                //       no corresponding window.on_desktop_mouse_up
                //       event will be fired(!)
                $eview.mark_unhandled();
            }
        }.bind(this);
        window.on_desktop_mouse_move = function(evt)
        {
            if(EventUtils.hasRightMouseButton(evt, 'on_desktop_mouse_move'))
            {
                // feed through to Outerra for camera look functionality by
                // marking as unhandled
                // NOTE: if we don't filter for the right mouse button
                // being down, *any* mouse movement will move the camera
                $eview.mark_unhandled();
            }
        }.bind(this);

        if(this.showSplashScreen)
        {
            // Hide the splash screen after seconds
            setTimeout(this._hideSplashScreen, 5000);
        }
    },
    beforeDestroy()
    {
        this.isVisible = false;
        this.$store.commit(TITAN_MUTATION.EXIT_TO_UI_MODE, TITAN_UI_MODE.Desktop);
        this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.Desktop);
        [
            'mousedown', 'mouseup', 'mousemove','mousewheel',
            'mouseout', 'mouseover',
            'click', 'dblclick', 'contextmenu',
        ].forEach((evtType) => document.removeEventListener(evtType, this.handleMouseEvent) );
        [
            'keyup', 'keydown'
        ].forEach((evtType) => document.removeEventListener(evtType, this.handleKeyEvent) );

        window.on_desktop_key_down = null;
        window.on_desktop_mouse_down = null;
        window.on_desktop_mouse_move = null;
    },
    methods:
    {
        ////////////////////////////////////////////////////////////////////////////////////////////
        // KEY EVENT HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        // general key event handler
        handleKeyEvent(evt)
        {
            this.$store.commit(DESKTOP_MUTATION.UPDATE_MODIFIER_KEY_STATE, evt);

            // the rest of this method is only relevant in the Outerra environment
            if(!$isInOuterra)
                return;

            if(EventUtils.isKey(evt, KEY.KEY_CODE.ESCAPE))
            {
                // prevent ESCAPE key triggering Outerra menus
                return;
            }

            if(EventUtils.isInFormField(evt))
            {
                // prevent key presses in INPUT, TEXTAREA etc fields
                // from being handled by Outerra (which might accidentally
                // cause the camera to start moviing if you hit WASD etc)
                if(EventUtils.isKeyDown(evt, KEY.KEY_CODE.TAB))
                {
                    // currently require the "tab hack" to navigate between
                    // fields using the TAB key in Outerra
                    TitanUtils.outerraTabHack(evt);
                }
                return;
            }

            if(this.desktopVisible && EventUtils.isKeyDown(evt, [KEY.KEY_CODE.F6, KEY.KEY_CODE.F7]))
            {
                // hide desktop
                $tLogger.info('hide desktop');
                this.desktopVisible = false;
                return;
            }

            // mark anything else as unhandled to let Outerra handle the
            // key event as it sees fit
            $eview.mark_unhandled();
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // MOUSE EVENT HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        // general mouse event handler
        handleMouseEvent(evt)
        {
            this.$store.commit(DESKTOP_MUTATION.UPDATE_MOUSE_BUTTON_STATE, evt);

            const passThrough = TitanUtils.isPassThrough(evt);
            if(passThrough)
            {
                // in a pass-through area, so process the click as if it
                // happened on the Outerra world
                if(EventUtils.isRightMouseDown(evt))
                {
                    // right mouse button events are camera control - just mark as unhandled and
                    // let Outerra do the rest
                    // NOTE: a right mouse click can trigger context menus etc in certain
                    //       circumstances, but this is separate
                    // evt.stopPropagation();
                    // evt.preventDefault();
                    $eview.mark_unhandled();
                }
                return;
            }
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // OTHER HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        _browserResizeHandler: UiUtils.throttle(function()
        {
            const screenSize = {w: document.body.clientWidth, h:document.body.clientHeight};
            this.$store.commit(DESKTOP_MUTATION.UPDATE_SCREEN_SIZE, screenSize);
        }, false),
        ////////////////////////////////////////////////////////////////////////////////////////////
        // OTHER HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        _hideSplashScreen()
        {
            // we hide the splash screen by marking it as shown, which prevents it
            // from displaying again during this execution cycle
            this.$store.commit(TITAN_MUTATION.SET_SPLASH_SCREEN_SHOWN, true);
        },
    }
};
</script>

<style lang="scss">
.cse-desktop
{
    overflow: hidden;
    top:0px;
    left:0px;
    width:100vw;
    height:100vh;
    background-color: rgba(0,0,0,0);
}
</style>
