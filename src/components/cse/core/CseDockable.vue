<template>
    <div
        ref="container"
        class="cse-desktop--dockable"
        :class="`dock-${_dock}`"
    >
        <div
            v-if="!collapsed"
            class="dockable-content"
        >
            <slot>
                DEFAULT CONTENT
            </slot>
        </div>
        <div
            ref="handle"
            v-ripple
            class="dockable-handle clickable"
            :class="{draggable: draggable}"
            @click="collapsed=!collapsed"
        >
            <v-icon
                class="dockable-trigger"
            >
                mdi-chevron-double-{{ chevronDirection }}
            </v-icon>
            <div v-if="title" class="title-text">
                {{ title }}
            </div>
            <v-icon v-if="icon">
                {{ icon }}
            </v-icon>
            <v-spacer v-if="draggable" />
            <v-icon
                v-if="draggable"
                class="drag-handle"
                @mousedown="handleDragStart"
                @click.stop
            >
                mdi-dots-{{ isDockEW?'vertical':'horizontal' }}
            </v-icon>
        </div>
    </div>
</template>

<script>
import MathUtils from '@/assets/js/utils/math-utils.js';

export default {
    name:'',
    props:{
        icon:
        {
            type: String,
            default: null
        },
        title:
        {
            type: String,
            default: 'DOCKED'
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
            type: Number,
            default: 200,
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
            collapsed: true,
            currentOffset: 0,
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
            if(this.collapsed)
            {
                const bounds = this.handle.getBoundingClientRect();
                width = bounds.width;
                height = bounds.height;
            }
            return {width, height};
        },
        minXoffset() { return this.desktopBounds.left; },
        maxYoffset() { return this.desktopBounds.bottom - (this.collapsed ? this.bounds.height : this.height); },
        minYoffset() { return this.desktopBounds.top; },
        maxXoffset() { return this.desktopBounds.right - (this.collapsed ? this.bounds.width : this.width); },
        _dock() { return '' + this.dock.toLowerCase().charAt(0); },
        isDockEast() { return this._dock === 'e'; },
        isDockWest() { return this._dock === 'w'; },
        isDockNorth() { return this._dock === 'n'; },
        isDockSouth() { return this._dock === 's'; },
        isDockEW() { return this.isDockEast || this.isDockWest; },
        isDockNS() { return !this.isDockEW; },
        chevronDirection()
        {
            if(this.isDockEast)
                return this.collapsed?'left':'right';
            else if(this.isDockWest)
                return this.collapsed?'right':'left';
            else if(this.isDockNorth)
                return this.collapsed?'down':'up';
            else//  if(this.isDockSouth)
                return this.collapsed?'up':'down';
        },
    },
    watch:
    {
        dock() { this.updateStyles(); },
        collapsed() { this.updateStyles(); },
        offset(newOffset) { this.currentOffset = newOffset; this.updateStyles(); },
        currentOffset() { this.updateStyles(); },
        desktopBounds() { this.updateStyles(); },
        width() { this.updateStyles(); },
        height() { this.updateStyles(); },
    },
    mounted()
    {
        this.container = this.$refs.container;
        this.handle = this.$refs.handle;

        this.currentOffset = this.offset;

        this.updateStyles();
    },
    methods:
    {
        updateStyles()
        {
            if(this.container === null)
                return;

            const style = this.container.style;

            style.height = this.collapsed ? 'auto' : this.height + 'px';
            style.width = this.collapsed ? 'auto' : this.width + 'px';
            style.maxWidth = this.width + 'px';

            if(this.isDockEW)
            {
                // constrain so it fits with screen bounds
                style.top = MathUtils.clamp(this.currentOffset, this.minYoffset, this.maxYoffset) + 'px';

                let xPos = 0;
                if(this.isDockEast)
                {
                    xPos = this.desktopBounds.right - (this.collapsed ? this.bounds.width : this.width);
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
                    yPos = this.desktopBounds.bottom - (this.collapsed ? this.bounds.height : this.height);
                }
                style.top = yPos + 'px';
            }
        },
        handleDragStart(evt)
        {
            if(!this.draggable)
                return;

            evt.preventDefault();

            this.dragStart.x = evt.clientX;
            this.dragStart.y = evt.clientY;
            document.onmousemove = this.handleDrag;
            document.onmouseup = this.handleDragEnd;
        },
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
        handleDragEnd(/*evt*/)
        {
            this.isDragging = false;
            document.onmouseup = null;
            document.onmousemove = null;
        },
    }
};
</script>
