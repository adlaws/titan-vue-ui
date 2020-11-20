<template>
    <div
        v-show="desktopVisible"
        class="titan--desktop pass-through"
    >
        {{ currentSimMode }} |
        <router-link :to="{name:'fps'}">
            FPS
        </router-link>

        <editor-ui v-if="isSimModeEditor" />
        <lobby-ui v-if="isSimModeAdmin" />

        <titan-task-bar v-if="taskbarVisible" />
    </div>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';
import { TITAN_MUTATION, TITAN_ACTION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';

import UiUtils from '@/assets/js/utils/ui-utils.js';
import EventUtils, { KEY_CODE } from '@/assets/js/utils/event-utils.js';
import TitanUtils, { $eview, $isInsideTitan, $tWorldInterface, $tLogger, SIM_MODE, CAMERA_MODE } from '@/assets/js/titan/titan-utils.js';

import TitanTaskBar from '@/components/titan/core/TitanTaskBar.vue';
import EditorUi from '@/components/titan/sim-mode/EditorUI.vue';
import LobbyUi from '@/components/titan/sim-mode/LobbyUI.vue';

export default {
    name: 'titan-desktop',
    components:
    {
        TitanTaskBar,
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
        currentSimMode() { return this.$store.getters.titanSimMode; },
        isSimModeEditor() { return this.currentSimMode === SIM_MODE.EDITOR; },
        isSimModeAdmin() { return this.currentSimMode === SIM_MODE.ADMIN; },
        taskbarVisible() { return this.$store.getters.isTaskbarVisible; },
    },
    watch:
    {
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
        if(!$isInsideTitan)
            window.addEventListener('resize', this._browserResizeHandler);
    },
    mounted()
    {
        this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.Desktop);

        /* eslint-disable no-undef */
        $eview.set_transparent(true);
        $eview.show_window(true);

        self.moveTo(0, 0);
        self.resizeTo(screen.availWidth, screen.availHeight);

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
            $tLogger.info('window.on_desktop_key_down');

            if(!this.desktopVisible)
            {
                const isEscapeKey = EventUtils.isKey(evt, KEY_CODE.ESCAPE );
                if((isEscapeKey))
                {
                    this.desktopVisible = true;
                    if($isInsideTitan)
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
    },
    beforeDestroy()
    {
        this.isVisible = false;
        this.$store.commit(TITAN_MUTATION.EXIT_TO_UI_MODE, TITAN_UI_MODE.Desktop);
        this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.Desktop);
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

            if(EventUtils.isNotInFormField(evt))
            {
                // event is not for a text field, so mark as
                // unhandled to let Outerra handle the key event
                if(this.desktopVisible && EventUtils.isKeyDown(evt, [KEY_CODE.F6, KEY_CODE.F7]))
                {
                    // hide desktop
                    $tLogger.info('hide desktop');
                    this.desktopVisible = false;
                }
                else
                {
                    $eview.mark_unhandled();
                }
            }
            else if(EventUtils.isKeyDown(evt, KEY_CODE.TAB))
            {
                TitanUtils.outerraTabHack(evt);
            }
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
                    // right mouse button events are camera control - for now we
                    // just mark as unhandled and let Outerra do the rest
                    // TODO: in future a right mouse click could trigger context
                    //       menus etc in certain circumstances
                    // evt.stopPropagation();
                    // evt.preventDefault();
                    $eview.mark_unhandled();
                }
                return;
            }
        },
        _browserResizeHandler: UiUtils.debounce(function()
        {
            const screenSize = {w: document.body.clientWidth, h:document.body.clientHeight};
            this.$store.commit(DESKTOP_MUTATION.UPDATE_SCREEN_SIZE, screenSize);
        }, 100, {onLeadIn: true, onTrailOut: true}),
    }
};
</script>

<style lang="scss">
.titan--desktop
{
    overflow: hidden;
    top:0px;
    left:0px;
    width:100vw;
    height:100vh;
    background-color: rgba(0,0,0,0);
}
.blue-area
{
    background-color: rgba(0,128,255,0.125);
    position: absolute;
    top:100;
    left:100;
    width: 250px;
    height: 350px;
}
</style>
