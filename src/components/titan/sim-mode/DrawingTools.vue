<template>
    <titan-window
        title="Drawing"
        icon="draw"
        :x="150"
        :y="150"
        :width="196"
        :height="32"
        :resizable="false"
        @window-active="windowActiveChanged"
    >
        <template #default="context">
            <titan-window-content :titan-window="context.titanWindow">
                <div class="vue-os--drawing-tools">
                    <button
                        v-for="tool in tools"
                        :key="tool.type"
                        class="tool"
                        :class="{active:currentTool===tool.type}"
                        @click="setTool(tool.type)"
                    >
                        <titan-icon :icon="tool.icon" size="150%" />
                    </button>
                    <br>
                    <div
                        v-for="color in colors"
                        :key="`fill-${color.type}`"
                        class="color"
                        :class="{active:(currentFill && currentFill.type===color.type)}"
                        :style="`background-color:rgb(${color.rgb[0]},${color.rgb[1]},${color.rgb[2]});`"
                        @click="setFillColor(color)"
                    />
                </div>
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import {TITAN_MUTATION, TITAN_UI_MODE} from '@/assets/js/store/titan-manager.js';

import TitanUtils, { $isInsideTitan, $tWorldInterface } from '@/assets/js/titan/titan-utils.js';
import MathUtils, { Vec3, Vec2 } from '@/assets/js/utils/math-utils.js';

import TitanWindow from '@/components/common/titan/TitanWindow.vue';
import TitanWindowContent from '@/components/common/titan/TitanWindowContent.vue';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

const HANDLED_MOUSE_EVENTS = new Set([
    'mousedown', 'mousemove',
    'click',
]);

export default {
    name: 'editor-ui',
    components:
    {
        TitanWindow, TitanWindowContent,
        TitanIcon,
    },
    data()
    {
        return {
            tools:[
                {type: 'square', icon: 'shape-square-plus', tooltip: 'Square'},
                {type: 'circle', icon: 'shape-circle-plus', tooltip: 'Circle'},
            ],
            colors:[
                {type:'red', rgb: [255,0,0]},
                {type:'green', rgb: [0,255,0]},
                {type:'blue', rgb: [0,0,255]},
            ],
            currentTool: null,
            currentFill: null,
            currentStroke: null,
        };
    },
    computed:
    {
        isUiModeDrawing() { return this.$store.getters.isUiMode(TITAN_UI_MODE.Drawing); },
    },
    watch:
    {
        currentTool(newTool, /*oldTool*/)
        {
            if(newTool === null)
                this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.Drawing);
            else if(!this.isUiModeDrawing)
                this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.Drawing);
        }
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
        if(this.isUiModeDrawing)
            this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.Drawing);
    },
    methods:
    {
        setTool(tool)
        {
            this.currentTool = this.currentTool === tool ? null : tool;
        },
        setFillColor(color)
        {
            this.currentFill = color;
        },
        /**
         * Handle activities required as this window becomes active/inactive
         *
         * @param {boolean} isActive true if the window has become active, false otherwise
         */
        windowActiveChanged(isActive)
        {
            // if the window becomes inactive, we aren't drawing any more, so
            // any ative tool becomes inactive
            if(!isActive)
                this.currentTool = null;
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // MOUSE EVENT HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Handles mouse events
         *
         * Will ignore events if...
         *  - not in 'Drawing' UI Mode
         *  - the event is not in HANDLED_MOUSE_EVENTS
         *  - the event target is a DOM element with the class 'pass-through'
         *
         * @param {object} evt the mouse event
         */
        handleMouseEvent(evt)
        {
            if(!$isInsideTitan)
                return; // nothing to do if we are in a browser

            if(!this.isUiModeDrawing)
                return; // wrong UI mode of operation - ignore

            const evtType = evt.type;
            if(!HANDLED_MOUSE_EVENTS.has(evtType))
                return; // we don't handle this type of mouse event

            const clickedOnWorld = TitanUtils.isPassThrough(evt);
            if(!clickedOnWorld)
                return; // we only care about mouse clicks on the world for now

            const isLeftButton = evt.button === 0;
            if(!isLeftButton)
                return; // we only care about left mouse clicks at the moment

            // handler function lookup
            const handlers = {
                mousedown: this._handleLeftMouseDown,
                mousemove: this._handleMouseMove,
                click: this._handleLeftClick,
            };
            const handler = handlers[evtType];
            if(handler)
                handler(evt);
            else
                TitanUtils.unhandledEventHandler(evt, this.$options.name);
        },
        /**
         * Handles mousedown events
         *
         * @param {object} evt the mouse event
         */
        _handleLeftMouseDown(evt)
        {
            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = Vec3.fromObj( $tWorldInterface.getWorldPositionUnderMouse() );

            // mouse is down, so it could be just a click, or about to start
            // dragging an entity or begin a rubber band selection, so get
            // get ready for these possibilties
            this.drag.mightDrag = true;
            this.drag.lastWinXY = winXY;
            this.drag.lastECEF = worldPos;
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
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            const ecef = Vec3.fromObj( $tWorldInterface.getWorldPosFromScreenPix(winXY) );
            if(this.drag.isDraggingObject)
            {
                // may be unable to query world position from screen (happens when move above horizon)
                // so check before proceeding
                if(TitanUtils.isValidWorldPos(ecef))
                {
                    // work out how to move the items in relation to the drag
                    const vecOffset = MathUtils.subtract(ecef, this.drag.lastECEF);
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
    }
};
</script>

<style lang="scss">
.vue-os--drawing-tools
{
    button
    {
        &.tool
        {
             &.active
             {
                background: white;
             }
        }
    }
    div
    {
        &.color
        {
            display:inline-block;
            width:32px;
            height:32px;
            border: 2px solid black;
            &.active
            {
                border: 2px solid white;
            }
        }
    }
}
</style>
