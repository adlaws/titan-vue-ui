<template>
    <cse-desktop-window
        title="Drawing"
        icon="draw"
        :x="150"
        :y="150"
        :width="185"
        :min-width="175"
        :height="32"
        :resizable="true"
        :closable="false"
        @window-active="windowActiveChanged"
        @window-closed="beforeCloseCleanup"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <div class="p-grid">
                    <div class="p-col-12">
                        <SelectButton
                            v-model="currentTool"
                            :options="tools"
                            option-value="type"
                            data-key="type"
                        >
                            <template #option="slotProps">
                                <cse-icon :icon="slotProps.option.icon" />
                            </template>
                        </SelectButton>
                    </div>
                    <div class="p-col-12">
                        <div class="p-field-checkbox">
                            <Checkbox
                                id="city1"
                                v-model="fill.active"
                                binary
                            />
                            <label for="city1">Fill</label>
                            <Button
                                :style="{backgroundColor:fill.active?fill.color.hexa:'#AAA', marginLeft:'0.5rem'}"
                                class="p-button-sm"
                            >
                                <cse-icon
                                    icon="shape"
                                    :color="fill.active?fillContrast:'#888'"
                                />
                            </Button>
                        </div>
                        <div class="p-field-checkbox">
                            <Checkbox
                                id="city2"
                                v-model="stroke.active"
                                binary
                            />
                            <label for="city1">Stroke</label>
                            <Button
                                :style="{backgroundColor:stroke.active?stroke.color.hexa:'#AAA', marginLeft:'0.5rem'}"
                                class="p-button-sm"
                            >
                                <cse-icon
                                    icon="shape-outline"
                                    :color="stroke.active?strokeContrast:'#888'"
                                />
                            </Button>
                        </div>
                        <div v-show="stroke.active">
                            <slider
                                v-model="stroke.width"
                                label="Width:"
                                class="pr-4 pl-4"
                                :min="0"
                                :max="10"
                                :step="0.1"
                                thumb-label
                            >
                                <template v-slot:append>
                                    <v-text-field
                                        v-model="stroke.width"
                                        class="mt-0 pt-0"
                                        dense
                                        hide-details
                                        single-line
                                        type="number"
                                        min="0"
                                        max="10"
                                        style="width: 70px"
                                        suffix="px"
                                    />
                                </template>
                            </slider>
                        </div>
                    </div>
                </div>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import {TITAN_MUTATION, TITAN_UI_MODE} from '@/assets/js/store/titan-manager.js';

import Slider from 'primevue/slider';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';
import SelectButton from 'primevue/selectbutton';

import TitanUtils, { $isInOuterra, $tRenderToolbox } from '@/assets/js/titan/titan-utils.js';
import { Vec3, Vec2 } from '@/assets/js/utils/math-utils.js';
import { Color } from '@/assets/js/utils/color-utils.js';
import DataUtils from '@/assets/js/utils/data-utils.js';

const HANDLED_MOUSE_EVENTS = new Set([
    'mousedown', 'mousemove',
    'click',
]);

const RED = { "alpha": 1, "hex": "#FF0000", "hexa": "#FF0000FF", "hsla": { "h": 0, "s": 1, "l": 0.5, "a": 1 }, "hsva": { "h": 0, "s": 1, "v": 1, "a": 1 }, "hue": 0, "rgba": { "r": 255, "g": 0, "b": 0, "a": 1 } };
const BLACK = { "alpha": 1, "hex": "#000000", "hexa": "#000000FF", "hsla": { "h": 0, "s": 0, "l": 0.0, "a": 1 }, "hsva": { "h": 0, "s": 0, "v": 0, "a": 1 }, "hue": 0, "rgba": { "r": 0, "g": 0, "b": 0, "a": 1 } };

export default {
    name: 'editor-ui',
    components:
    {
        Slider, Checkbox, Button, SelectButton,
    },
    data()
    {
        return {
            colorPicker:
            {
                fill: false,
                stroke: false,
                palette:[
                    ['#FF0000','#FFC000','#FFFF00','#00CC00','#0088FF','#0000FF','#8800FF','#FF00FF'],
                    ['#CC0000','#FF8800','#CCAA00','#009900','#0044CC','#000099','#6600AA','#CC00AA'],
                    ['#880000','#CC6600','#AA8800','#005500','#0022AA','#000055','#330088','#880088',],
                    ['#dc322f','#cb4b16','#b58900','#859900','#2aa198','#268bd2','#6c71c4','#d33682',],
                    ['#FFFFFF','#DDDDDD','#BBBBBB','#888888','#666666','#444444','#222222','#000000',],
                ],
            },
            tools:[
                {type: 'rectangle', icon: 'shape-square-plus', tooltip: 'Square'},
                {type: 'ellipse', icon: 'shape-circle-plus', tooltip: 'Circle'},
            ],
            drag:{
                mightDrag: false,
                isDrawingShape: false,
            },
            currentTool: undefined,
            fill:{
                active: true,
                color: RED,
            },
            stroke:{
                active: false,
                color:BLACK,
                width:1,
            }
        };
    },
    computed:
    {
        isUiModeDrawing() { return this.$store.getters.isUiMode(TITAN_UI_MODE.Drawing); },
        currentFillRgba() { return this.asRgbaColor(this.fill.color); },
        currentStrokeRgba() { return this.asRgbaColor(this.stroke.color); },
        fillContrast() { return this.contrastFor(this.fill.color); },
        strokeContrast() { return this.contrastFor(this.stroke.color); },
    },
    watch:
    {
        currentTool(newTool, /*oldTool*/)
        {
            if(!newTool)
                this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.Drawing);
            else if(!this.isUiModeDrawing)
                this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.Drawing);
        },
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
        contrastFor(pickerColor)
        {
            pickerColor = pickerColor || BLACK;
            return new Color(pickerColor.hex).findContrastColor().toRgbString();
        },
        asRgbaColor(pickerColor)
        {
            pickerColor = pickerColor || BLACK;
            return `rgba(${pickerColor.r},${pickerColor.g},${pickerColor.b},${pickerColor.a})`;
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
            if(!$isInOuterra)
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
            // do we need to do anything with the mouse movement?
            if(!this.currentTool)
                return; // no tool selected - we're not doing any drawing

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
            if(!this.currentTool)
                return; // no tool selected - we're not doing any drawing
            if(!this.drag.isDrawingShape && !this.drag.mightDrag)
                return; // we're not doing anything at the moment

            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );

            // initialise object drag or rubber band selection if required
            if(this.drag.mightDrag)
            {
                // not *might* drag any more - we are *definitely* dragging something at this point
                this.drag.mightDrag = false;
                this.drag.isDrawingShape = true;

                // update selection if required to ensure that the item under the mouse is selected
                TitanUtils.injectMousePosition(this.drag.lastWinXY);
                this.updateGizmoPos(this.drag.lastEcef);

                const titanFillColor = this.fill.active ? this._toRenderToolboxColor(this.fill.color) : {x:0,y:0,z:0,w:0};
                const titanStrokeColor = this.stroke.active ? this._toRenderToolboxColor(this.stroke.color) : {x:0,y:0,z:0,w:0};

                $tRenderToolbox.setShapeFillColor(titanFillColor);
                $tRenderToolbox.setShapeBorderColor(titanStrokeColor);
                $tRenderToolbox.setTool('shape', {type: this.currentTool});
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
                this.updateGizmoPos(ecef);
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
                this.updateGizmoPos(worldPos);

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
         * @param {Object} color the Vuetify color picker value (ref: https://vuetifyjs.com/en/api/v-color-picker/#update:color)
         * @returns {Object} an object of the form {x:R,y:G,z:B,w:A} suitable for
         *          use with the Titan render toolbox
         */
        _toRenderToolboxColor(color)
        {
            // convert to rgba string
            const rgbaStr = `rgba(${color.rgba.r},${color.rgba.g},${color.rgba.b},${color.rgba.a})`;
            // get the normalized RGBA values
            const rgbaNormalized = new Color(rgbaStr).toRgbaNormalized();
            // remap RGBA to XYZW for render toolbox usage
            return DataUtils.remap(rgbaNormalized, {r:'x', g:'y', b:'z', a:'w'});
        },
        updateGizmoPos(ecef)
        {
            TitanUtils.showGizmoAt(ecef);
            this.$store.commit(TITAN_MUTATION.GIZMO_SET_POSITION, ecef);
        },
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
            &.selected
            {
                border: 2px solid white;
                box-shadow: inset 0 0 8px rgba(255,255,255,0.5), 0 0 8px rgba(0,0,0,0.5);
            }
        }
    }
}
</style>
