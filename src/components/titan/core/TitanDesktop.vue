<template>
    <div
        class="titan--desktop pass-through"
    >
        <editor-ui v-if="currentSimMode===SIM_MODE.EDITOR" />
        <lobby-ui v-if="currentSimMode===SIM_MODE.ADMIN" />

        <titan-task-bar />
    </div>
</template>

<script>
import { STORE_MUTATION, STORE_ACTION } from '@/assets/js/store/store.js';

import EventUtils from '@/assets/js/utils/event-utils.js';
import TitanUtils, { $eview, SIM_MODE } from '@/assets/js/titan/titan-utils.js';

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
            // flag to indicate that we have manually "forced" camera control
            // mode for the mouse
            isForcedCamCapturePassThrough: false,
            SIM_MODE,
        };
    },
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
    },
    created()
    {
        // here we read in and initialize the plugin configuration
        this.$store.dispatch(STORE_ACTION.INIT_PLUGIN_CONFIG);
    },
    mounted()
    {
        /* eslint-disable no-undef */
        $eview.set_transparent(true);
        $eview.show_window(true);

        self.moveTo(0, 0);
        self.resizeTo(screen.availWidth*0.75, screen.availHeight*0.75);

        document.querySelectorAll('select').forEach((sel) => TitanUtils.outerraDropdownHack(sel));

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
    methods:
    {
        isPassThrough(evt)
        {
            if(evt && evt.target && evt.target.classList)
                return evt.target.classList.contains('pass-through');
            return false;
        },
        // general key event handler
        handleKeyEvent(evt)
        {
            this.$store.commit(STORE_MUTATION.UPDATE_MODIFIER_KEY_STATE, evt);

            if(EventUtils.isNotInFormField(evt))
            {
                // event is not for a text field, so mark as
                // unhandled to let Outerra handle the key event
                $eview.mark_unhandled();
            }
            else if(EventUtils.isKeyDown(evt, EventUtils.KEY_CODE.TAB))
            {
                TitanUtils.outerraTabHack(evt);
            }
        },
        // general mouse event handler
        handleMouseEvent(evt)
        {
            this.$store.commit(STORE_MUTATION.UPDATE_MOUSE_BUTTON_STATE, evt);

            const passThrough = this.isPassThrough(evt);
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
    }
};
</script>

<style lang="scss">
@import '@/assets/scss/titan/titan.scss';
@import '@/assets/scss/titan/titan-widgets.scss';

.titan--desktop
{
    overflow: hidden;
    top:0px;
    left:0px;
    width:100vw;
    height:100vh;
    background-color: rgba(0,255,0,0.125);
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
