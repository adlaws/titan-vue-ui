<template>
    <titan-window
        title="Drawing"
        icon="draw"
        :x="150"
        :y="150"
        :width="224"
        :height="170"
        :resizable="false"
        @window-active="windowActiveChanged"
        @window-closed="beforeCloseCleanup"
    >
        <template #default="context">
            <titan-window-content :titan-window="context.titanWindow">
                <div class="vue-os--drawing-tools">
                    <button
                        v-for="tool in tools"
                        :key="tool.type"
                        class="tool small mr-1"
                        :class="{active:currentTool && currentTool.type===tool.type}"
                        @click="setTool(tool)"
                    >
                        <titan-icon :icon="tool.icon" size="150%" />
                    </button>
                    <div class="mt-1" />
                    <div
                        v-for="(swatch, idx) in palette"
                        :key="`swatch-${idx}`"
                        class="swatch"
                        :class="{active:(currentFill && currentFill.id===swatch.id)}"
                        :style="`background-color:${swatch.color.toRgbaString()};`"
                        @click="setFillColor(swatch)"
                    />
                </div>
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import {TITAN_MUTATION, TITAN_UI_MODE} from '@/assets/js/store/titan-manager.js';

import TitanUtils, { $isInsideTitan, $tRenderToolbox } from '@/assets/js/titan/titan-utils.js';
import { Vec3, Vec2 } from '@/assets/js/utils/math-utils.js';
import { Color } from '@/assets/js/utils/color-utils.js';
import DataUtils from '@/assets/js/utils/data-utils.js';

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
        // just make a nice palette of 5 colors - should be plenty
        const palette = [];
        const colorCount = 5;
        for(let idx=0; idx<colorCount;idx++)
        {
            const color = new Color('#F00').adjustHue(idx*360/colorCount);
            palette.push({id:idx, color:color});
        }
        // 5 shades of grey
        for(let idx=0; idx<colorCount;idx++)
        {
            const color = new Color(`hsl(0,0,${1-((1/(colorCount-1))*idx)})`);
            palette.push({id:idx+colorCount, color:color});
        }

        return {
            palette,
            tools:[
                {type: 'rectangle', icon: 'shape-square-plus', tooltip: 'Square'},
                {type: 'ellipse', icon: 'shape-circle-plus', tooltip: 'Circle'},
            ],
            drag:{
                mightDrag: false,
                isDrawingShape: false,
            },
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
        // unbind event handlers and exit modes as required
        this.beforeCloseCleanup();
    },
    methods:
    {
        /**
         * Set the tool. If the same tool is set twice it is turned off (i.e., toggles if the same tool is
         * set).
         *
         * @param {object} tool the tool definition
         */
        setTool(tool)
        {
            if(this.currentTool === null || tool === null)
                this.currentTool = tool;
            else
            {
                // change if different tool, turn off if same tool again
                this.currentTool = this.currentTool.type === tool.type ? null : tool;
            }
        },
        /**
         * Sets the fill and stroke color
         *
         * @param {object} swatch the swatch color definition, expected to be an object of the
         *        form {name:{String}, color: {Color}}
         */
        setFillColor(swatch)
        {
            this.currentFill = swatch;
            this.currentStroke = swatch;
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
        beforeCloseCleanup()
        {
            HANDLED_MOUSE_EVENTS.forEach((evtType) => document.removeEventListener(evtType, this.handleMouseEvent) );
            if(this.isUiModeDrawing)
                this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.Drawing);
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
            TitanUtils.injectMousePosition(winXY);
            const worldPos = Vec3.fromObj( TitanUtils.worldPosUnderMouse() );

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
            if(!this.drag.isDrawingShape && !this.drag.mightDrag)
                return;

            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );

            // initialise object drag or rubber band selection if required
            if(this.drag.mightDrag)
            {
                // not *might* drag any more - we are *definitely* dragging something at this point
                this.drag.mightDrag = false;
                this.drag.isDrawingShape = true;

                // update selection if required to ensure that the item under the mouse is selected
                TitanUtils.injectMousePosition(this.drag.lastWinXY);
                TitanUtils.showGizmoAt(this.drag.lastEcef);

                const titanColor = this._toRenderToolboxColor(this.currentFill ? this.currentFill.color : null);
                const toolType = this.currentTool ? this.currentTool.type : 'ellipse';

                $tRenderToolbox.setShapeFillColor(titanColor);
                $tRenderToolbox.setShapeBorderColor(titanColor);
                $tRenderToolbox.setTool('shape', {type: toolType});
                $tRenderToolbox.setDefaultStartHeight(0.5);
                $tRenderToolbox.setPenPosition(winXY);
                $tRenderToolbox.penDown();
            }

            // update shape as required
            const ecef = Vec3.fromObj( TitanUtils.worldPosForWindowCoords(winXY) );
            // may be unable to query world position from screen (happens when move above horizon)
            // so check before proceeding
            if(TitanUtils.isValidWorldPos(ecef))
            {
                // const vecOffset = MathUtils.subtract(ecef, this.drag.lastECEF);
                // update the shape as required
                $tRenderToolbox.setPenPosition(winXY);
                // show the gizmo where the mouse is
                TitanUtils.showGizmoAt(ecef);
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
            TitanUtils.injectMousePosition(winXY);
            const worldPos = TitanUtils.worldPosUnderMouse();

            if(TitanUtils.isValidWorldPos(worldPos))
                TitanUtils.showGizmoAt(worldPos);

            // NOTE: we have to clear `mightDrag` here in case there was no
            //       `mousemove` event to clear it
            this.drag.mightDrag = false;
            if(this.drag.isDrawingShape)
            {
                // end of object dragging
                this.drag.isDrawingShape = false;
                $tRenderToolbox.penUp();
            }
        },
        /**
         * Converts a color to one usable by the Titan render toolbox
         *
         * Titan render toolbox colors are expressed as {x:R,y:G,z:B,w:A} with
         * the RGBA values being between 0.0 and 1.0
         *
         * @param {Color} a Color instance (see color-utils.js)
         * @returns {Object} an object of the form {x:R,y:G,z:B,w:A} suitable for
         * use with the Titan render toolbox
         */
        _toRenderToolboxColor(color)
        {
            // get the normalized RGBA values
            const rgbNormalized = color ? color.toRgbNormalized() : {r:0,g:0,b:0,a:1};
            // remap RGBA to XYZW
            return DataUtils.remap(rgbNormalized, {r:'x', g:'y', b:'z', a:'w'});
        }
    }
};
</script>

<style lang="scss">
.vue-os--drawing-tools
{
    div
    {
        &.swatch
        {
            display:inline-block;
            width:32px;
            height:32px;
            border: 2px solid black;
            &.active
            {
                border: 2px solid white;
                box-shadow: inset 0 0 8px rgba(255,255,255,0.5), 0 0 8px rgba(0,0,0,0.5);
            }
        }
    }
}
</style>
