<!-- eslint-disable vue/no-v-html -->
<!-- ------------------------------------------------------------------------------------------
A radial menu component, allows nested sub-menus

@param {Number} x the preferred x position on the screen (may be adjusted due to proximity to edges of screen)
@param {Number} y the preferred y position on the screen (may be adjusted due to proximity to edges of screen)
@param {Array} items the context menu items

Events:
    @selected fired when an item is selected, with the selected item as the parameter
    @cancelled fired when the context menu is closed with no selection being made

Example use:

    <template>
        <div>
            <button @click="showContextMenu">Context Menu</button>
        </div>
        <cse-context-menu
            v-if="contextMenu.show"
            :items="contextMenu.items"
            :x="contextMenu.x"
            :y="contextMenu.y"
            @selected="contextMenuSelection"
        />
    </template>

    <script>
        export default {
            data()
            {
                return {
                    contextMenu:{
                        show: false,
                        x: 0,
                        y: 0,
                        items: [
                            {id:'a',text:'Option A'},
                            {id:'b',text:'Option B', disabled:true},
                            {separator:true},
                            {id:'c',text:'Sub menu C', items:[
                                {id:'c-a', text:'C Option A'},
                                {id:'c-b', text:'C Option B'},
                                {id:'c-c', text:'C Sub Menu C', items:[
                                    {id:'c-c-a',text:'Option C-C-A'},
                                    {id:'c-c-b',text:'Option C-C-B'},
                                ]},
                            ]},
                            {id:'d',text:'Option D'},
                        ]
                    },
                };
            },
            methods:
            {
                showContextMenu(evt)
                {
                    this.contextMenu.x = evt.clientX;
                    this.contextMenu.y = evt.clientY;
                    this.contextMenu.show = true;
                },
                contextMenuSelection(selected)
                {
                    this.contextMenu.show = false;
                    console.log(selected.id);
                }
            }
        };
    </script>
----------------------------------------------------------------------------------------------- -->

<template>
    <div
        ref="container"
        class="cse--radial-menu"
        :style="`left:${pos.x}px;top:${pos.y}px;`"
        @animationend="_resetSpinAnimationClass"
        @mousemove="_handleMouseMove"
        @mouseleave="_handleMouseLeave"
    >
        <svg
            :width="size"
            :height="size"
            :class="{'fast-spin':spinAnimation}"
        >
            <circle
                :cx="centerXY.x"
                :cy="centerXY.y"
                :r="radius"
                fill="#fff"
                opacity="0.25"
                stroke="#000"
                stroke-width="8"
                stroke-opacity="0.125"
                paint-order="stroke"
            />
            <path
                stroke="#002e57"
                stroke-width="subMenuArcThickness"
                :d="mouseArc"
            />
            <template v-if="currentHover">
                <text
                    :font-size="centerTextSize"
                    text-anchor="middle"
                    :fill="currentHover.disabled?'#888':'#000'"
                    stroke="#FFF"
                    stroke-width="2"
                    paint-order="stroke"
                    :x="centerXY.x"
                    :y="currentHover.tooltip?(centerXY.y):(centerXY.y+centerTextSize*0.333)"
                >
                    {{ currentHover.text }}
                </text>
                <text
                    v-if="currentHover.tooltip"
                    text-anchor="middle"
                    :fill="currentHover.disabled?'#888':'#000'"
                    stroke="#FFF"
                    stroke-width="2"
                    paint-order="stroke"
                    :font-size="tooltipTextSize"
                    :x="centerXY.x"
                    :y="centerXY.y+tooltipTextSize*1.5"
                >
                    {{ currentHover.tooltip }}
                </text>
            </template>
            <g
                v-for="(item, idx) in currentItems"
                :key="`item-${idx}-${item.id}`"
                class="wedge"
                :class="{disabled:item.disabled}"
                :fill="item.disabled?'#AAA':'#002e57'"
                opacity="0.8"
                @click="_handleItemClicked(item)"
                @mouseover="currentHover=item"
                @mouseout="currentHover=null"
            >
                <path
                    :d="_makeWedge(idx)"
                />
                <g
                    class="wedge-text"
                    :fill="item.disabled?'#888':'#FFF'"
                    @mouseover="currentHover=item"
                >
                    <text
                        :font-size="iconSize"
                        :font-family="item.icon?'Material Design Icons':'inherit'"
                        text-anchor="middle"
                        :x="centerXY.x+(_itemNormX(idx)*iconPosRadius)"
                        :y="centerXY.y+(_itemNormY(idx)*iconPosRadius)+(iconSize*.333)"
                        v-html="item.icon?MDI_ICON[item.icon]:item.text"
                    />
                </g>
                <polygon
                    v-if="item.items"
                    :points="_makeArrow(idx, currentItems.length)"
                />
                <path
                    v-if="item.items"
                    fill="none"
                    :stroke="item.disabled?'#888':'#FFF'"
                    :stroke-width="subMenuArcThickness"
                    :d="_makeArc(idx)"
                />
            </g>
        </svg>
    </div>
</template>

<script>
import { MDI_ICON } from '@/assets/js/utils/mdi-icon-utils.js';
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';
import SVGUtils from '@/assets/js/utils/svg-utils.js';

const DEG2RAD = Math.PI / 180.0;

// the radial menu can be dismissed without making a selection by clicking
// anywhere outside the bounds of the menu, by pressing the ESCAPE key, or
// moving the mouse pointer outside the window
const CANCELLATION_EVENTS = ['keydown', 'mousedown', 'mouseout'];

export default {
    name:'cse-radial-menu',
    props:
    {
        // the preferred x position on the screen - may be adjusted due to proximity to edges of screen
        x:
        {
            type:Number,
            default:0
        },
        // the preferred x position on the screen - may be adjusted due to proximity to edges of screen
        y:
        {
            type:Number,
            default:0
        },
        size:
        {
            type:Number,
            default: 400,
        },
        items:
        {
            type:Array,
            default:() => []
        },
        textKey:
        {
            type:String,
            default: 'text'
        },
        iconKey:
        {
            type:String,
            default: 'icon'
        },
        ignoreTaskbar:
        {
            type:[Boolean, String],
            default: false,
        },
    },
    data()
    {
        return {
            // the final position of the context menu on the screen after adjustments
            // due to available screen space
            pos:{
                x:0,
                y:0
            },
            currentItems: [],
            currentHover: null,
            mouseArc: '',
            spinAnimation: false,
            selected: null,
            MDI_ICON,
        };
    },
    computed:
    {
        // these are the locations and sizes of the various components, all calculated
        // relative to the `size` property
        diameter() { return this.size * 0.9; },
        radius() { return this.diameter * 0.5; },
        centerXY() { return {x: this.size/2, y: this.size/2 }; },
        iconSize() { return this.size * 0.15; },
        iconPosRadius() { return this.radius*.75; },
        centerTextSize() { return this.iconSize * 0.55; },
        tooltipTextSize() { return this.centerTextSize * 0.5; },
        subMenuArcRadius() { return this.radius*0.95; },
        subMenuArcThickness() { return this.radius*0.025; },
        itemCount() { return this.currentItems.length; },
        wedgeSize() { return 360.0 / this.itemCount; },
    },
    mounted()
    {
        this.currentItems = this.items;
        // need to make sure we keep the context menu inside the available screen space - we can
        // also opt to ignore the taskbar and appear over the top of it if desired, but generally
        // we don't want to do that
        const desktopBounds = this.ignoreTaskbar ? this.$store.getters.screenBounds : this.$store.getters.desktopBounds;
        // work out bounds for context menu
        const container = this.$refs.container;
        const bounds = container.getBoundingClientRect();

        this.pos.x = MathUtils.clamp(this.x, desktopBounds.left, desktopBounds.right - bounds.width);
        this.pos.y = MathUtils.clamp(this.y, desktopBounds.top, desktopBounds.bottom - bounds.height);

        CANCELLATION_EVENTS.forEach((evtName) =>
        {
            document.addEventListener(evtName, this._watchForClickOutsideOrEscape);
        });
    },
    beforeDestroy()
    {
        CANCELLATION_EVENTS.forEach((evtName) =>
        {
            document.removeEventListener(evtName, this._watchForClickOutsideOrEscape);
        });
    },
    methods:
    {
        /**
         * Calculate the angle that a radial menu wedge is oriented
         *
         * @param {number} idx the index of the wedge
         * @returns {number} the angle of the wedge in degrees
         */
        _wedgeAngle(idx)
        {
            return this.wedgeSize * idx;
        },
        _itemNormX(idx)
        {
            return Math.cos((this._wedgeAngle(idx)-90) * DEG2RAD);
        },
        _itemNormY(idx)
        {
            return Math.sin((this._wedgeAngle(idx)-90) * DEG2RAD);
        },
        /**
         * Creates the SVG <path> string which describes a wedge in the radial menu
         *
         * @param {number} idx the index of the wedge
         * @returns {string} the path description for the SVG <path> `d` attribute
         */
        _makeWedge(idx)
        {
            const wedgeAngle = this._wedgeAngle(idx) - (this.wedgeSize / 2.0);
            return SVGUtils.describeSvgArc(
                this.centerXY.x,
                this.centerXY.y,
                this.radius * 0.55,
                this.radius,
                wedgeAngle,
                wedgeAngle + this.wedgeSize
            );
        },
        /**
         * Creates the SVG <path> string which describes an arc at the outer
         * edge of a wedge in the radial menu to indicate that there is a
         * submenu off that item.
         *
         * @param {number} idx the index of the wedge
         * @returns {string} the path description for the SVG
         *          <path> `d` attribute
         */
        _makeArc(idx)
        {
            const portion = 0.8;
            const arcAngle = this.wedgeSize * portion;
            const arcOffset = (this.wedgeSize * (1.0-portion)) * 0.5;
            const wedgeAngle = this._wedgeAngle(idx) - (this.wedgeSize * 0.5);
            const radius = this.radius * 0.95;
            return SVGUtils.describeSvgArc(
                this.centerXY.x,
                this.centerXY.y,
                radius,
                radius,
                wedgeAngle + arcOffset,
                wedgeAngle + arcOffset + arcAngle
            );
        },
        /**
         * Creates the SVG <polygon> string which describes a triangle/arrow at
         * the outer edge of a wedge in the radial menu to indicate that there
         * is a submenu off that item.
         *
         * @param {number} idx the index of the wedge
         * @returns {string} the path description for the SVG <polygon>
         *          `points` attribute
         */
        _makeArrow(idx)
        {
            const cx = this.centerXY.x + this._itemNormX(idx) * this.radius;
            const cy = this.centerXY.y + this._itemNormY(idx) * this.radius;
            const wedgeAngle = this._wedgeAngle(idx);
            return SVGUtils.describeRegularPolygon(
                cx,
                cy,
                this.radius * 0.1,
                3,
                wedgeAngle
            );
        },
        _handleMouseLeave(/*evt*/)
        {
            this.mouseArc = '';
        },
        _handleMouseMove(evt)
        {
            if(!this.currentHover || this.currentHover.disabled)
            {
                this.mouseArc = '';
                return;
            }

            const relX = evt.clientX-this.pos.x-this.centerXY.x;
            const relY = evt.clientY-this.pos.y-this.centerXY.y;
            const angle = Math.atan2(relY,relX) / DEG2RAD + 90 - (this.wedgeSize * 0.25);
            this.mouseArc = SVGUtils.describeSvgArc(
                this.centerXY.x,
                this.centerXY.y,
                this.radius * 0.525,
                this.radius * 0.5,
                angle,
                angle + this.wedgeSize * 0.25
            );
        },
        /**
         * Carry out steps required when a wedge is clicked
         */
        _handleItemClicked(item)
        {
            if(item.disabled)
                return;

            const hasSubmenu = item.items && item.items.length > 0;
            if(hasSubmenu)
            {
                this.spinAnimation = true;
                this.currentItems = item.items;
            }
            else
            {
                this.selected = item;
                this.$emit('selected', this.selected);
            }
        },
        _resetSpinAnimationClass()
        {
            this.spinAnimation = false;
        },
        /**
         * This method checks for clicks outside the context menu or pressing
         * of the escape key, or the mouse moving outside the window to
         * cancel/dismiss the context menu without making a selection.
         */
        _watchForClickOutsideOrEscape(evt)
        {
            if(this.$refs.container.contains(evt.target))
                return; // it's on the context menu, don't do anything

            if(EventUtils.isMouseOut(evt))
            {
                const from = evt.relatedTarget || evt.toElement;
                if (!from || from.nodeName === 'HTML')
                {
                    this.$emit('cancelled'); // mouse left the window - cancelled
                }
            }
            else if(EventUtils.isMouseDown(evt) || EventUtils.isKey(evt, KEY.KEY_CODE.ESCAPE))
                this.$emit('cancelled'); // ESC key or click outside - cancelled
        },
    }
};
</script>
