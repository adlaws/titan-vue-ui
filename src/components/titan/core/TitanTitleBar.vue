<template>
    <div
        class="vue-os--title-bar"
        :class="{active, maximized}"
        @mousedown="handleDragStart"
        @dblclick="$emit('window-toggle-maximise')"
    >
        <div
            class="control-btn icon"
        >
            <template
                name="window-icon"
                :window-context="{size:iconSize, active:active}"
            >
                <svg
                    :width="iconSize.w"
                    :height="iconSize.h"
                >
                    <polygon
                        points="1,1 31,1 31,31 1,31 1,1"
                        style="stroke-width:1;fill-rule:evenodd;"
                        :style="`fill:${active?'#08f':'#048'};stroke:${active?'#04f':'#028'}`"
                    />
                </svg>
            </template>
        </div>

        <div class="title">
            <span
                :title="title"
            >
                {{ title }}
            </span>
        </div>
        <div
            class="control-btn minify-btn"
            @click="$emit('window-minimise')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                :width="iconSize.w"
                :height="iconSize.h"
            >
                <g fill="white">
                    <path d="M0 12h16v4H0z" />
                </g>
            </svg>
        </div>
        <div
            class="control-btn toggle-maximise-btn"
            @click="$emit('window-toggle-maximise')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                :width="iconSize.w"
                :height="iconSize.h"
            >
                <g fill="white">
                    <path
                        v-if="maximized===false"
                        d="M0 0v16h16V0H2zm2 2h12v12H2z"
                    />
                    <path
                        v-else
                        d="M4 0v4H0v12h12v-4h4V0H6zm2 2h8v8h-2V4H6zM2 6h8v8H2z"
                    />
                </g>
            </svg>
        </div>
        <div
            class="control-btn close-btn"
            @click="$emit('window-close')"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                :width="iconSize.w"
                :height="iconSize.h"
            >
                <g fill="white">
                    <path d="M1.778 0L0 1.778 6.222 8 0 14.222 1.778 16 8 9.778 14.222 16 16 14.222 9.778 8 16 1.778 14.222 0 8 6.222z" />
                </g>
            </svg>
        </div>
    </div>
</template>

<script>
export default {
    name: 'titan-title-bar',
    props:
    {
        title: {
            type: String,
            default: 'Window',
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
            type: Boolean,
            default: false
        },
    },
    data()
    {
        return {
            dragStart: { x: 0, y: 0 },
            iconSize: { w: 16, h: 16 }
        };
    },
    methods:
    {
        handleDragStart(evt)
        {
            event.preventDefault();

            if(this.maximized !== false)
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
            event.preventDefault();
            const dragDeltaX = evt.clientX - this.dragStart.x;
            const dragDeltaY = evt.clientY - this.dragStart.y;
            this.dragStart.x = evt.clientX;
            this.dragStart.y = evt.clientY;
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

<style lang="scss">
.vue-os--title-bar
{
    margin: 0;
    padding: 0;

    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;

    cursor: move;
    &.maximized
    {
        cursor: default;
    }
    user-select: none;
    width:100%;
    min-height:32px;
    height:32px;
    max-height:32px;

    background-color:#024;
    color:#888;
    &.active
    {
        background-color:#048;
        color:white;
    }

    .icon
    {
        width: 16px;
        height: 16px;
        margin: 2px 4px;
    }

    .title
    {
        margin: 0 2px;
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .control-btn
    {
        margin: 0 4px;
        cursor: pointer;
    }
}
</style>
