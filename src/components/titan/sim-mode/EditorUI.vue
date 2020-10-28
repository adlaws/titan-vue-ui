<template>
    <div
        class="pass-through"
        style="width:100%;height:100%;overflow:hidden;"
    >
        <titan-window title="Test 1">
            <template #default="context">
                <titan-window-content :window-context="context.windowContext">
                    {{ selectedObjects }}
                    <hr>
                    {{ drag }}
                    <hr>
                    {{ mouseButtons }}
                    <hr>
                    {{ mousePress }}
                    <hr>
                    {{ modifierKeys }}
                </titan-window-content>
            </template>
        </titan-window>

        <titan-window
            title="Test 2"
            :x="500"
            :y="500"
            :width="200"
            :height="500"
        >
            <template #default="context">
                <titan-window-content :window-context="context.windowContext">
                    <t-button label="A Button" />
                    <t-select :options="testOptions" />
                </titan-window-content>
            </template>
        </titan-window>
    </div>
</template>

<script>
import TitanUtils, { $isInsideTitan, $tWorldInterface, SIM_MODE } from '@/assets/js/titan/titan-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

import TitanWindow from '@/components/titan/core/TitanWindow.vue';
import TitanWindowContent from '@/components/titan/core/TitanWindowContent.vue';
import TButton from '@/components/titan/forms/TButton.vue';
import TSelect from '@/components/titan/forms/fields/basic/TSelect.vue';

const HANDLED_MOUSE_EVENTS = new Set([
    'mousedown', 'mousemove', 'mouseup',
    'click', 'dblclick',
]);

export default {
    name: 'editor-ui',
    components:
    {
        TitanWindow, TitanWindowContent,
        TButton, TSelect,
    },
    data()
    {
        return {
            testOptions: [
                {id:0, text:'Option A', disabled:false, tooltip:'A is for Apple'},
                {id:1, text:'Option B', disabled:false, tooltip:'B is for Banana'},
                {id:2, text:'Option C', disabled:false, tooltip:'C is for Coconut'},
            ],
            drag:
            {
                mightDrag: false,
                isDragging: false,
                lastECEF: null,
            }
        };
    },
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
        // entityDescriptors() { return this.$store.getters.titanEntityDescriptors; }
        entityDescriptors() { return []; },
        modifierKeys() { return this.$store.getters.modifierKeys; },
        mouseButtons() { return this.$store.getters.mouseButtons; },
        mousePress() { return this.$store.getters.mousePress; },
    },
    mounted()
    {
        // bind event handlers
        // NOTE: binding event handlers to `window` or `document` both
        // achieve the same thing - not sure which (if either) is a
        // better choice here
        HANDLED_MOUSE_EVENTS.forEach((evtType) => document.addEventListener(evtType, this.handleMouseEvent) );
    },
    beforeDestroy()
    {
        HANDLED_MOUSE_EVENTS.forEach((evtType) => document.removeEventListener(evtType, this.handleMouseEvent) );
    },
    methods:
    {
        isPassThrough(evt)
        {
            if(evt && evt.target && evt.target.classList)
                return evt.target.classList.contains('pass-through');
            return false;
        },
        // general mouse event handler
        handleMouseEvent(evt)
        {
            if(this.currentSimMode !== SIM_MODE.EDITOR)
                return; // wrong mode of operation - ignore

            const evtType = evt.type;
            if(!HANDLED_MOUSE_EVENTS.has(evtType))
                return; // we don't handle this type of mouse event

            const clickedOnWorld = this.isPassThrough(evt);
            if(!clickedOnWorld)
                return; // we only care about mouse clicks on the world for now

            if(!$isInsideTitan)
                return; // nothing to do if we are in a browser

            const isLeftButton = evt.button === 0;
            if(evtType === 'mousedown')
            {
                if(isLeftButton)
                    this._handleMouseDown(evt);
            }
            else if(evtType === 'mouseup')
            {
                if(isLeftButton)
                    this._handleMouseUp();
            }
            else if(evtType === 'mousemove')
            {
                if(isLeftButton)
                    this._handleMouseMove(evt);
            }
            else if(evtType === 'click')
            {
                if(isLeftButton)
                    this._handleLeftClick(evt);
            }
            else if(evtType === 'dblclick')
            {
                if(isLeftButton)
                    this._handleLeftDblClick(evt);
            }
        },
        _handleMouseDown(evt)
        {
            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = $tWorldInterface.getWorldPositionUnderMouse();

            if($tWorldInterface.isSelectableObjectUnderMouse())
            {
                // maybe starting a drag...?
                // TODO: update selection if required
                this.drag.mightDrag = true;
                this.drag.lastECEF = worldPos;
            }
            else
            {
                // rubber band box selection start
                // TODO:
            }
        },
        _handleMouseUp(/*worldPos*/)
        {
            // NOTE: we don't check for drag or rubber band box selection ending here
            // because there will also be a click event that we want to distinguish
        },
        _handleMouseMove(evt)
        {
            if(!this.drag.isDragging && !this.drag.mightDrag)
                return;

            if(this.drag.mightDrag)
            {
                this.drag.isDragging = true;
                this.drag.mightDrag = false;

                // update selection if required to ensure that the item under the mouse is selected
                const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
                $tWorldInterface.injectMousePosition(winXY, 15000);
                const isSelected = $tWorldInterface.isObjectUnderMouseSelected();
                if(!isSelected)
                {
                    this._doSelection();
                }
            }

            if(this.drag.isDragging)
            {
                const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
                const ecef = $tWorldInterface.getWorldPosFromScreenPix(winXY);
                // may be unable to query world position from screen (happens when move above horizon)
                // so check before proceeding
                if(TitanUtils.isValidWorldPos(ecef))
                {
                    const vecOffset = MathUtils.vecSub(ecef, this.drag.lastECEF);
                    const activeScenario = $tWorldInterface.getActiveScenario();
                    activeScenario.translateSelected(vecOffset, true);
                    this.drag.lastECEF = ecef;
                }
            }
        },
        _handleLeftClick(evt)
        {
            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = $tWorldInterface.getWorldPositionUnderMouse();

            if(TitanUtils.isValidWorldPos(worldPos))
                $tWorldInterface.showGizmoAt(worldPos);

            // NOTE: we have to clear `mightDrag` here in case there was no
            //       `mousemove` event to clear it
            this.drag.mightDrag = false;
            if(this.drag.isDragging)
            {
                this.drag.isDragging = false;
            }
            else if($tWorldInterface.isSelectableObjectUnderMouse())
            {
                this._doSelection();
            }
            else
            {
                $tWorldInterface.clearSelection();
            }

        },
        _handleLeftDblClick(evt)
        {
            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = $tWorldInterface.getWorldPositionUnderMouse();
            if(!$tWorldInterface.isSelectableObjectUnderMouse())
            {
                $tWorldInterface.clearSelection();
                // create an entity at the location
                TitanUtils.createEntity('abrams_m1a1', worldPos);
            }
        },
        _doSelection()
        {
            // NOTE: Outerra does not populate modifier keys on mouse events,
            //       so we currently rely on our own input state management
            //       to track their state
            const isMultiSelect = this.$store.getters.modifierKeys.ctrl;
            if(!isMultiSelect)
                $tWorldInterface.clearSelection();

            $tWorldInterface.select();
        },
    }
};
</script>
