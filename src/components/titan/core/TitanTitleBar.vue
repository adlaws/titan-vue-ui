<template>
    <div
        class="titan-desktop--window-title-bar"
        :class="{active, maximized, nodrag:!draggable}"
        @mousedown="handleDragStart"
        @dblclick="handleDblClickMaxmize"
    >
        <div
            class="icon"
        >
            <template
                name="window-icon"
                :window-context="{size:iconSize, active:active}"
            >
                <titan-icon
                    v-if="icon"
                    :icon="icon"
                    :size="`${iconSize.w}px`"
                    class="title-icon"
                />
                <svg
                    v-else
                    :width="iconSize.w"
                    :height="iconSize.h"
                >
                    <polygon
                        points="1,1 31,1 31,31 1,31 1,1"
                        style="stroke-width:1;fill-rule:evenodd;"
                        :style="`fill:${active?'#FFF':'#08F'};stroke:${active?'#888':'#048'}`"
                    />
                </svg>
            </template>
        </div>

        <div class="title-text">
            <span
                class="ml-1"
                :title="title"
            >
                {{ title }}
            </span>
        </div>
        <div
            v-if="minimizable"
            @click="$emit('window-minimise')"
        >
            <titan-icon
                icon="window-minimize"
                :size="`${iconSize.w}px`"
                class="icon control-btn"
            />
        </div>
        <div
            v-if="maximizable"
            @click="$emit('window-toggle-maximise')"
        >
            <titan-icon
                :icon="maximized===false?'window-maximize':'window-restore'"
                :size="`${iconSize.w}px`"
                class="icon control-btn"
            />
        </div>
        <div
            v-if="closable"
            @click="$emit('window-close')"
        >
            <titan-icon
                icon="window-close"
                :size="`${iconSize.w}px`"
                class="icon control-btn"
            />
        </div>
    </div>
</template>

<script>
import MathUtils from '@/assets/js/utils/math-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name: 'titan-title-bar',
    components:
    {
        TitanIcon
    },
    props:
    {
        title: {
            type: String,
            default: 'Window',
        },
        icon: {
            type: String,
            default: null,
        },
        active: {
            type: Boolean,
            default: true,
        },
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        },
        maximized: {
            type: [Boolean, Object],
            default: false
        },
        minimized: {
            type: [Boolean, Object],
            default: false
        },
        // can the window be moved?
        draggable: {
            type: Boolean,
            default: true
        },
        // can the window be closed/dismissed?
        closable: {
            type: Boolean,
            default: true
        },
        // can the window be minimized (to the taskbar)?
        minimizable: {
            type: Boolean,
            default: true
        },
        // can the window be maximized (to cover the entire desktop)?
        maximizable: {
            type: Boolean,
            default: true
        },
    },
    data()
    {
        return {
            dragStart: { x: 0, y: 0 },
            iconSize: { w: 24, h: 24 }
        };
    },
    computed:
    {
        desktopBounds() { return this.$store.getters.desktopBounds; }
    },
    methods:
    {
        handleDblClickMaxmize()
        {
            if(this.maximizable)
                this.$emit('window-toggle-maximise');
        },
        handleDragStart(evt)
        {
            evt.preventDefault();

            if(!this.draggable || this.maximized !== false)
                return;

            if(evt.target.classList.contains('control-btn'))
                return;

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
            const newX = this.x + dragDeltaX;
            const newY = this.y + dragDeltaY;
            this.$emit('window-updateXY', { x: newX, y: newY });
        },
        handleDragEnd(/*evt*/)
        {
            document.onmouseup = null;
            document.onmousemove = null;
        },
    }
};
</script>
