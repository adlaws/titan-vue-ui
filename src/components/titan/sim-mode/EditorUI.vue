<template>
    <div
        class="pass-through"
        style="width:100%;height:100%;overflow:hidden;"
    >
        <titan-window
            title="Radios"
            icon="radio-tower"
            :x="50"
            :y="50"
        >
            <template #default="context">
                <titan-window-content :window-context="context.windowContext">
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
            title="Weather"
            icon="weather-partly-cloudy"
            :x="300"
            :y="300"
            :width="300"
            :height="200"
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
                isDraggingObject: false,
                isRubberBandSelecting: false,
                lastWinXY: null,
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
        /**
         * Handles mouse events
         *
         * Will ignore events if...
         *  - not in SIM_MODE.EDITOR
         *  - the event is not in HANDLED_MOUSE_EVENTS
         *  - the event target is a DOM element with the class 'pass-through'
         *
         * @param {object} evt the mouse event
         */
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
        /**
         * Handles mousedown events
         *
         * @param {object} evt the mouse event
         */
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

            // mouse is down, so it could be just a click, or about to start
            // dragging an entity or begin a rubber band selection, so get
            // get ready for these possibilties
            this.drag.mightDrag = true;
            this.drag.lastWinXY = winXY;
            this.drag.lastECEF = worldPos;
        },
        /**
         * Handles mouseup events
         *
         * @param {object} evt the mouse event
         */
        _handleMouseUp(/*evt*/)
        {
            // NOTE: we don't check for drag or rubber band box selection ending here
            // because there will also be a click event that we want to distinguish
        },
        /**
         * Handles mousemove events
         *
         * @param {object} evt the mouse event
         */
        _handleMouseMove(evt)
        {
            // do we need to do anything with the mouse movement?
            if(!this.drag.isDraggingObject && !this.drag.isRubberBandSelecting && !this.drag.mightDrag)
                return;

            // initialise object drag or rubber band selection if required
            if(this.drag.mightDrag)
            {
                // not *might* drag any more - we are *definitely* dragging something at this point
                this.drag.mightDrag = false;

                // update selection if required to ensure that the item under the mouse is selected
                $tWorldInterface.injectMousePosition(this.drag.lastWinXY, 15000);
                if($tWorldInterface.isSelectableObjectUnderMouse())
                {
                    // if there's an object under the mouse, we are dragging it
                    this.drag.isDraggingObject = true;
                    const isSelected = $tWorldInterface.isObjectUnderMouseSelected();
                    if(!isSelected)
                    {
                        this._doSelection();
                    }
                    $tWorldInterface.showGizmoAt(this.drag.lastEcef);
                }
                else
                {
                    // if there's nothing selectable under the mouse, it's the start of a
                    // rubber band box selection
                    this.drag.isRubberBandSelecting = true;
                    // clicked on nothing - clear the selection (unless CTRL is pressed)
                    this._clearSelection();
                    $tWorldInterface.showGizmoAt(this.drag.lastEcef);
                    $tWorldInterface.beginAreaDragSelect();
                }
            }

            // update object drag or rubber band selection if required
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            const ecef = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            if(this.drag.isDraggingObject)
            {
                // may be unable to query world position from screen (happens when move above horizon)
                // so check before proceeding
                if(TitanUtils.isValidWorldPos(ecef))
                {
                    // work out how to move the items in relation to the drag
                    const vecOffset = MathUtils.vecSub(ecef, this.drag.lastECEF);
                    const activeScenario = $tWorldInterface.getActiveScenario();
                    // move the selected items accordingly
                    activeScenario.translateSelected(vecOffset, true);
                    // show the gizmo where the mouse is
                    $tWorldInterface.showGizmoAt(ecef);
                    // cache coords for next offset calculation
                    this.drag.lastWinXY = winXY;
                    this.drag.lastECEF = ecef;
                }
            }
            else if(this.drag.isRubberBandSelecting)
            {
                // we need to continually inject the current mouse position so that the blue
                // selection box renders to track with the mouse position; if we don't do this
                // the selection box doesn't render, which is a bad user experience
                $tWorldInterface.injectMousePosition(winXY, 15000);
                // show the gizmo where the mouse is
                $tWorldInterface.showGizmoAt(ecef);
                // cache coords for next offset calculation
                this.drag.lastWinXY = winXY;
                this.drag.lastECEF = ecef;
            }
        },
        /**
         * Handles left mouse single click events
         *
         * @param {object} evt the mouse event
         */
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
            if(this.drag.isDraggingObject)
            {
                // end of object dragging
                this.drag.isDraggingObject = false;
            }
            else if(this.drag.isRubberBandSelecting)
            {
                // end of rubber band box selection
                this.drag.isRubberBandSelecting = false;
                $tWorldInterface.endAreaDragSelect();
            }
            else if($tWorldInterface.isSelectableObjectUnderMouse())
            {
                // clicked on an item, update the selection
                this._doSelection();
            }
            else
            {
                // clicked on nothing; clear selection (unless CTRL is pressed)
                this._clearSelection();
            }
        },
        /**
         * Handles left mouse dblclick events
         *
         * @param {object} evt the mouse event
         */
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
                // force clear any selection (unless CTRL is pressed)
                this._clearSelection(true);
                // create an entity at the location
                TitanUtils.createEntity('abrams_m1a1', worldPos);
            }
        },
        /**
         * Selects whatever is under the mouse, clearing any existing selection
         * first (unless the CTRL key is pressed)
         */
        _doSelection()
        {
            // NOTE: Outerra does not populate modifier keys on mouse events,
            //       so we currently rely on our own input state management
            //       to track their state
            // clear selection (unless CTRL is pressed)
            this._clearSelection();
            $tWorldInterface.select();
        },
        /**
         * Clears the selection, unless the CTRL key is currently held down
         *
         * @param {boolean} forced if true, clear the selection regardless of
         *        the state of the CTRL key
         */
        _clearSelection(forced=false)
        {
            const isAdditiveSelection = this.$store.getters.modifierKeys.ctrl;
            if(forced || !isAdditiveSelection)
                $tWorldInterface.clearSelection();

            $tWorldInterface.select();
        },
        /**
         * Determine if an event happened on a `pass-though` area (i.e., on the
         * Outerra world, rather than on a user interface element).
         *
         * @param {object} evt the mouse event
         * @returns {boolean} true if the target of the event is a DOM element
         *          with a `pass-though` class, false otherwise
         */
        isPassThrough(evt)
        {
            if(evt && evt.target && evt.target.classList)
                return evt.target.classList.contains('pass-through');
            return false;
        },
    }
};
</script>
