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
                    Might Drag: {{ mightDrag }} Dragging: {{ isDragging }}
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
            mightDrag: false,
            isDragging: false,
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
                this.mightDrag = true;
                $tWorldInterface.setOffsetStartPoint(worldPos);
                $tWorldInterface.setMouseDragLocation(winXY);
                $tWorldInterface.setDraggedEntityScreenLocation(winXY);
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
            if(!this.isDragging && !this.mightDrag)
                return;

            if(this.mightDrag)
            {
                this.isDragging = true;
                this.mightDrag = false;
                // update selection if required to ensure that the item under the mouse is selected

                // TODO: this seems like a very convoluted way to determine if a particular entity
                //       is selected based on the UUID...why is there no `isSelected(id)` method?
                /*
                const objectUuid = $tWorldInterface.getObjectUUIDUnderMouse();
                const activeScenario = $tWorldInterface.getActiveScenario();
                const selectedObjects = activeScenario.getSelectedObjectsList();
                const selectedObjectUUIDs = new Set(selectedObjects.map(obj => obj.GUID));
                const isSelected = selectedObjectUUIDs.has(objectUuid);
                if(!isSelected)
                {
                    this._doSelection();
                }
                */
            }

            if(this.isDragging)
            {
                const lastMouseXY = $tWorldInterface.getMouseDragLocation();
                const lastDraggedXY = $tWorldInterface.getDraggedEntityScreenLocation();

                const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
                const dX = winXY.x - lastMouseXY.x;
                const dY = winXY.y - lastMouseXY.y;
                const newScreenXY = {
                    x: lastDraggedXY.x + dX,
                    y: lastDraggedXY.y + dY
                };
                const newWorldPosition = $tWorldInterface.getWorldPosFromScreenPix(newScreenXY);

                // may be unable to query world position from screen (happens when move above horizon)
                // so check before proceeding
                if(TitanUtils.isValidWorldPos(newWorldPosition))
                {
                    const vecOffset = MathUtils.vecSub(newWorldPosition, $tWorldInterface.getOffsetStartPoint());
                    const activeScenario = $tWorldInterface.getActiveScenario();
                    activeScenario.translateSelected(vecOffset, false);

                    $tWorldInterface.setOffsetStartPoint(newWorldPosition);
                    $tWorldInterface.setMouseDragLocation(winXY);
                    $tWorldInterface.setDraggedEntityScreenLocation(newScreenXY);
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

            this.mightDrag = false;
            if(this.isDragging)
            {
                this.isDragging = false;
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
