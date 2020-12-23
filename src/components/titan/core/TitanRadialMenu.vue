/* eslint-disable vue/no-v-html */
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
        <titan-context-menu
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
        class="titan--radial-menu"
        :style="`left:${pos.x}px;top:${pos.y}px;`"
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
                opacity="0.666"
                stroke="#000"
                stroke-width="8"
                stroke-opacity="0.333"
                paint-order="stroke"
            />
            <template v-if="currentHover">
                <text
                    :font-size="centerTextSize"
                    text-anchor="middle"
                    fill="#000"
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
                    fill="#000"
                    stroke="#FFF"
                    stroke-width="2"
                    paint-order="stroke"
                    :font-size="tooltipTextSize"
                    :x="centerXY.x"
                    :y="centerXY.y+tooltipTextSize"
                >
                    {{ currentHover.tooltip }}
                </text>
            </template>
            <g
                v-for="(item, idx) in currentItems"
                :key="`item-${idx}-${item.id}`"
                class="wedge"
                fill="#002e57"
                opacity="0.8"
                @click="_handleItemClicked(item)"
                @mouseover="currentHover=item"
                @mouseout="currentHover=null"
            >
                <path
                    :d="_makeWedge(centerXY.x, centerXY.y, radius, idx, currentItems.length)"
                />
                <g
                    class="wedge-text"
                    fill="#FFF"
                    @mouseover="currentHover=item"
                >
                    <text
                        :font-size="iconSize"
                        :font-family="item.icon?'Material Design Icons':'inherit'"
                        text-anchor="middle"
                        :x="centerXY.x+(_itemNormX(idx, currentItems.length)*iconPosRadius)"
                        :y="centerXY.y+(_itemNormY(idx, currentItems.length)*iconPosRadius)+(iconSize*.333)"
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
                    stroke="#FFF"
                    :stroke-width="subMenuArcThickness"
                    :d="_makeArc(centerXY.x, centerXY.y, subMenuArcRadius, idx, currentItems.length)"
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

const _360DEG = (Math.PI * 2.0);
const _90DEG = _360DEG / 4.0;

// the context menu can be dismissed without making a selection by clicking
// anywhere outside the bounds of the context menu, or by pressing the ESCAPE
// key
const CANCELLATION_EVENTS = ['keydown', 'mousedown'];

export default {
    name:'titan-radial-menu',
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
        centerTextSize() { return this.iconSize * 0.6; },
        tooltipTextSize() { return this.centerTextSize * 0.5; },
        subMenuArcRadius() { return this.radius*0.95; },
        subMenuArcThickness() { return this.radius*0.025; },
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

        this.$refs.container.addEventListener('animationend', this._resetSpinAnimationClass);
        CANCELLATION_EVENTS.forEach((evtName) =>
        {
            document.addEventListener(evtName, this._watchForClickOutsideOrEscape);
        });
    },
    beforeDestroy()
    {
        this.$refs.container.removeEventListener('animationend', this._resetSpinAnimationClass);
        CANCELLATION_EVENTS.forEach((evtName) =>
        {
            document.removeEventListener(evtName, this._watchForClickOutsideOrEscape);
        });
    },
    methods:
    {
        _itemNormX(idx, count)
        {
            const step = _360DEG / count;
            return Math.cos((step * idx) - _90DEG);
        },
        _itemNormY(idx, count)
        {
            const step = _360DEG / count;
            return Math.sin((step * idx)  - _90DEG);
        },
        _makeWedge(cx, cy, radius, idx, count)
        {
            const wedgeSize = 360.0 / count;
            const wedgeAngle = (idx * wedgeSize) - (wedgeSize / 2.0);
            return SVGUtils.describeSvgArc(cx, cy, radius * 0.55, radius, wedgeAngle, wedgeAngle + wedgeSize);
        },
        _makeArc(cx, cy, radius, idx, count)
        {
            const portion = 0.8;
            const wedgeSize = 360.0 / count;
            const arcAngle = wedgeSize * portion;
            const arcOffset = (wedgeSize * (1.0-portion)) / 2.0;
            const wedgeAngle = (idx * wedgeSize) - (wedgeSize / 2.0);
            return SVGUtils.describeSvgArc(cx, cy, radius, radius, wedgeAngle + arcOffset, wedgeAngle + arcOffset + arcAngle);
        },
        _makeArrow(idx, count)
        {
            const cx = this.centerXY.x + this._itemNormX(idx, count) * this.radius;
            const cy = this.centerXY.y + this._itemNormY(idx, count) * this.radius;
            const wedgeSize = 360.0 / count;
            const wedgeAngle = (idx * wedgeSize);
            return SVGUtils.describeRegularPolygon(cx, cy, this.radius * 0.1, 3, wedgeAngle);
        },
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
         * of the escape key to cancel/dismiss the context menu without making
         * a selection.
         */
        _watchForClickOutsideOrEscape(evt)
        {
            if(this.$refs.container.contains(evt.target))
                return; // it's on the context menu, don't do anything

            if(EventUtils.isMouseDown(evt) || EventUtils.isKey(evt, KEY.CODE.ESCAPE))
                this.$emit('cancelled'); // ESC key or click outside - cancelled
        },
        /**
         * Utility method to obtain the absolute position of the element
         *
         * We need this because elm.getBoundingClientRect() returns results
         * relative to the container of the element
         *
         * @param {DOMElement} the DOM element to check
         * @return {object} the absolute {x,y} coordinates of the element
         */
        _getAbsolutePosition( el )
        {
            let x = 0;
            let y = 0;
            while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) )
            {
                x += el.offsetLeft - el.scrollLeft;
                y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return { x, y };
        },
    }
};
</script>
