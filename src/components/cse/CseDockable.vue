<!--

An component which can be "docked" to an edge of the screen taking up minimal
space, and expanded to reveal the full content inside.

isCollapsed:       Expanded:
|                |
+-+              +------------+-+
|»|              | CONTENT    |«|
|D|              | IN         |D|
|O|              | HERE       |O|
|C|              |            |C|
|K|              |            |K|
|A|              |            |A|
|B|              |            |B|
|L|              |            |L|
|E|              |            |E|
+-+              +------------+-+
|                |

It is possible to configure the edge to which the dockable is attached, its
expanded size, and initial position, amongst other things.

NOTE: Dockables are not required to respect each others boundaries and may
    overlap if desired.

Example usage:

    <cse-dockable
        :width="300"
        :height="400"
        :offset="100"
        dock="e"
        title="EAST DOCK"
        icon="ferry"
    >
        Welcome to the East Dock.
    </cse-dockable>

Properties:
    title: the text to display in the title bar
    icon: an icon to display in the title bar (optional)
    dock: the location to dock the dockable (may be 'w', 'e', 'n' or 's', corresponding to the left, right,
        top and bottom edges of the screen). Defaults to 'w' (left).
    width: the width of the dockable in in pixels when expanded (defaults to 200)
    height: the height of the dockable in in pixels when expanded (defaults to 200)
    offset: the offset of the dockable from the top of the screen when docked e/w, or from the left of the
        screen when docked n/s. May be a numeric value in pixels, or one of 'start, 'end' or 'middle'
        ('center' is also accepted as an alias for 'middle'), which corresponds to the top, bottom and
        vertical center for e/w docked components and left, right and horizontal center for n/s docked
        components. If the numeric offset is negative, the offset is calculated from the 'opposite'
        edge to normal. Default is 200 pixels.
    draggable: optionally make the dockable draggable from it's original position with a 'drag handle'
        added to the dockable. When docked e/w the dockabled may be dragged up/down, and when docked
        n/s it may be dragged left/right. Note that at the moment dockables may only be dragged
        along* their current docked edge, not to a different edge. Default is false (i.e., not
        draggable).
    ignoreTaskbar: if true, the positioning of the dockable will ignore the taskbar, potentially making them
        appear behind the taskbar. Default is false, use at own risk.

Events:
    expanded: fired when the dockable is expanded
    isCollapsed: fired when the dockable is isCollapsed
-->
<template>
    <div
        ref="container"
        class="cse-desktop--dockable"
        :class="`dock-${_dock}`"
    >
        <div
            v-if="!isCollapsed"
            class="dockable-content"
        >
            <slot>
                DEFAULT CONTENT
            </slot>
        </div>
        <div
            ref="handle"
            v-ripple
            class="dockable-handle clickable p-ripple"
            :class="{draggable: draggable}"
            @mouseup="isCollapsed=isDragging?isCollapsed:!isCollapsed"
        >
            <cse-icon
                :icon="`chevron-double-${ chevronDirection }`"
                class="dockable-trigger"
            />
            <div v-if="title" class="title-text">
                {{ title }}
            </div>
            <cse-icon
                v-if="icon"
                :icon="icon"
            />
            <div v-if="draggable" style="flex-grow:1;" />
            <cse-icon
                v-if="draggable"
                :icon="`dots-${ isDockEW?'vertical':'horizontal' }`"
                class="drag-handle"
                @mousedown.prevent.stop="handleDragStart"
                @click.prevent.stop
            />
        </div>
    </div>
</template>

<script>
import MathUtils from '@/assets/js/utils/math-utils.js';

import Ripple from 'primevue/ripple';

const EVENT = {
    EXPANDED: 'expanded',
    isCollapsed: 'isCollapsed',
};

export default {
    name:'',
    directives:
    {
        'ripple': Ripple,
    },
    props:{
        title:
        {
            type: String,
            default: 'DOCKED'
        },
        icon:
        {
            type: String,
            default: null
        },
        dock:
        {
            type: String,
            default: 'w'
        },
        width:
        {
            type: Number,
            default: 200,
        },
        height:
        {
            type: Number,
            default: 200,
        },
        offset:
        {
            type: [Number, String],
            default: 200,
        },
        collapsed:
        {
            type: Boolean,
            default: true,
        },
        draggable:
        {
            type: Boolean,
            default: false,
        },
        ignoreTaskbar:
        {
            type: Boolean,
            default: false,
        },
    },
    data()
    {
        return {
            isCollapsed: true,
            currentOffset: 0,
            isDragging: false,
            dragStart: { x: 0, y: 0 },
        };
    },
    computed:
    {
        desktopBounds() { return this.ignoreTaskbar ? this.$store.getters.screenBounds : this.$store.getters.desktopBounds; },
        bounds()
        {
            let width = this.width;
            let height = this.height;
            if(this.isCollapsed)
            {
                const bounds = this.handle.getBoundingClientRect();
                width = bounds.width;
                height = bounds.height;
            }
            return {width, height};
        },
        minXoffset() { return this.desktopBounds.left; },
        maxYoffset() { return this.desktopBounds.bottom - (this.isCollapsed ? this.bounds.height : this.height); },
        minYoffset() { return this.desktopBounds.top; },
        maxXoffset() { return this.desktopBounds.right - (this.isCollapsed ? this.bounds.width : this.width); },
        _dock() { return '' + this.dock.toLowerCase().charAt(0); },
        isDockEast() { return this._dock === 'e'; },
        isDockWest() { return this._dock === 'w'; },
        isDockNorth() { return this._dock === 'n'; },
        isDockSouth() { return this._dock === 's'; },
        isDockEW() { return this.isDockEast || this.isDockWest; },
        isDockNS() { return !this.isDockEW; },
        chevronDirection()
        {
            // this is for the expand/collapse trigger icon
            if(this.isDockEast)
                return this.isCollapsed?'left':'right';
            else if(this.isDockWest)
                return this.isCollapsed?'right':'left';
            else if(this.isDockNorth)
                return this.isCollapsed?'down':'up';
            else//  if(this.isDockSouth)
                return this.isCollapsed?'up':'down';
        },
    },
    watch:
    {
        dock() { this.updateStyles(); },
        collapsed(isCollapsed) { this.isCollapsed = isCollapsed; },
        isCollapsed(isCollapsed)
        {
            this.updateStyles();
            this.$emit(isCollapsed ? EVENT.isCollapsed : EVENT.EXPANDED);
        },
        offset(newOffset) { this.currentOffset = this.parseOffset(newOffset); this.updateStyles(); },
        currentOffset() { this.updateStyles(); },
        desktopBounds() { this.updateStyles(); },
        width() { this.updateStyles(); },
        height() { this.updateStyles(); },
    },
    mounted()
    {
        this.container = this.$refs.container;
        this.handle = this.$refs.handle;

        this.currentOffset = this.parseOffset(this.offset);
        this.isCollapsed = this.collapsed;

        this.updateStyles();
    },
    methods:
    {
        /**
         * Parse the offset property, and return a value in pixels which can be
         * used to position the docakble along the edge it is docked to.
         *
         * The offset property may be one of:
         *  - a numeric value: if positive, this is the pixel offset from the
         *    'start' of the docked edge, and if negative from the 'end' of
         *    the docked edge. The start of the N/S edges is the left, and the
         *    end is the right. The start of the E/W edges is the top, and the
         *    end is the bottom.
         *  - a string value: if the string value can be parsed as a number,
         *    the numeric value rules apply (see above). Otherwise the allowed
         *    values are 'start', 'end', and 'center' (NOTE: 'middle' is an
         *    allowed alias for 'center'). 'start' and 'end' will position the
         *    dockable at the start and end of the docked edge, and 'center' will
         *    position it in the center of the edge.
         *
         * @param {Number, String} offset the offset value
         * @return {Number} an offset value in pixels
         */
        parseOffset(offset)
        {
            if(!offset)
                return 0;

            // could be just a number (pixel offset)
            const offsetFloat = parseFloat(offset);
            if(!isNaN(offsetFloat))
            {
                if(offsetFloat >= 0)
                    return offsetFloat;

                // negative value - position is relative to 'end' of edge
                if(this.isDockEW)
                    return (this.desktopBounds.bottom  - this.bounds.height) + offsetFloat;
                else
                    return (this.desktopBounds.right  - this.bounds.width) + offsetFloat;
            }

            // not a number, so check for one of 'start', 'middle'  and 'end'.
            // this check is case insensitive and only uses the first character
            // and so is quite resilient to typos in the property value
            const offsetStr = (''+ offset).toLowerCase().charAt(0);
            if(offsetStr === 'e') // 'end'
            {
                // position at 'end' of edge
                if(this.isDockEW)
                    return this.desktopBounds.bottom - this.bounds.height;
                else
                    return this.desktopBounds.right - this.bounds.width;
            }
            else if(offsetStr === 'c' || offsetStr === 'm') // 'center' or 'middle'
            {
                // position at 'center' of edge
                if(this.isDockEW)
                    return this.desktopBounds.top + (this.desktopBounds.h / 2) - (this.bounds.height / 2.0);
                else
                {
                    console.log(offsetStr, this.desktopBounds);
                    return this.desktopBounds.left + (this.desktopBounds.w / 2) - (this.bounds.width / 2.0);
                }
            }
            // for anything else just position it at the start of the edge
            return 0;
        },
        /**
         * Utility method to update the CSS styles required to position and
         * display the dockable
         */
        updateStyles()
        {
            if(this.container === null)
                return;

            const style = this.container.style;

            style.height = this.isCollapsed ? 'auto' : this.height + 'px';
            style.width = this.isCollapsed ? 'auto' : this.width + 'px';
            style.maxWidth = this.width + 'px';

            if(this.isDockEW)
            {
                // constrain so it fits with screen bounds
                style.top = MathUtils.clamp(this.currentOffset, this.minYoffset, this.maxYoffset) + 'px';

                let xPos = 0;
                if(this.isDockEast)
                {
                    xPos = this.desktopBounds.right - (this.isCollapsed ? this.bounds.width : this.width);
                }
                style.left = xPos + 'px';
            }
            else // if(this.isDockNS)
            {
                // constrain so it fits with screen bounds
                style.left = MathUtils.clamp(this.currentOffset, this.minXoffset, this.maxXoffset) + 'px';

                let yPos = 0;
                if(this.isDockSouth)
                {
                    yPos = this.desktopBounds.bottom - (this.isCollapsed ? this.bounds.height : this.height);
                }
                style.top = yPos + 'px';
            }
        },
        /**
         * If dragging is enabled, this method handles the start of a drag.
         */
        handleDragStart(evt)
        {
            if(!this.draggable)
                return;

            evt.preventDefault();

            this.isDragging = true;

            this.dragStart.x = evt.clientX;
            this.dragStart.y = evt.clientY;
            document.onmousemove = this.handleDrag;
            document.onmouseup = this.handleDragEnd;
        },
        /**
         * If dragging is enabled, this method handles the dragging of the dockable.
         */
        handleDrag(evt)
        {
            evt.preventDefault();

            const dragX = MathUtils.clamp(evt.clientX, this.desktopBounds.left, this.desktopBounds.right);
            const dragY = MathUtils.clamp(evt.clientY, this.desktopBounds.top, this.desktopBounds.bottom);
            const dragDeltaX = dragX - this.dragStart.x;
            const dragDeltaY = dragY - this.dragStart.y;
            this.dragStart.x = dragX;
            this.dragStart.y = dragY;

            if(this.isDockEW)
                this.currentOffset = this.currentOffset += dragDeltaY;
            else // if(this.isDockNS)
                this.currentOffset = this.currentOffset += dragDeltaX;
        },
        /**
         * If dragging is enabled, this method handles the end of a drag operation.
         */
        handleDragEnd(evt)
        {
            evt.preventDefault();

            this.isDragging = false;

            document.onmouseup = null;
            document.onmousemove = null;
        },
    }
};
</script>
