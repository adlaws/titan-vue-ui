<template>
    <div
        v-show="!status.minimized"
        ref="container"
        class="vue-os--window"
        @mousemove="_onMouseMove"
        @mousedown="_handleResizeStart"
        @mouseup="_handleFocus"
    >
        <titan-title-bar
            v-if="!(undecorated || noTitleBar || isFullscreen)"
            :title="title"
            :icon="icon"
            :x="status.x"
            :y="status.y"
            :closable="closable"
            :minimizable="minimizable"
            :maximizable="maximizable"
            :draggable="draggable"
            :active="isActive"
            :fullscreen="isFullscreen"
            :maximized="status.maximized"
            :minimized="status.minimized"
            @window-updateXY="updateXY"
            @window-minimise="minimize"
            @window-toggle-maximise="toggleMaximize"
            @window-close="close"
        />
        <slot
            name="default"
            :titan-window="{id,title,status,isActive,isFullscreen,zIndex}"
            :fullscreen-handler="() => toggleFullscreen()"
        />
    </div>
</template>

<script>
import CryptoUtils from '@/assets/js/utils/crypto-utils.js';

import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';

import TitanTitleBar from '@/components/titan/core/TitanTitleBar.vue';

export default {
    name: 'titan-window',
    components: {
        TitanTitleBar
    },
    props:
    {
        // title for the window
        title: {
            type: String,
            default: 'Window Title'
        },
        // icon for the the window
        // refer to: https://cdn.materialdesignicons.com/5.6.55/
        icon: {
            type: String,
            default: 'reorder-horizontal'
        },
        // x position of the window (left is 0)
        x: {
            type: Number,
            default: 0,
        },
        // y position of the window (top is 0)
        y: {
            type: Number,
            default: 0,
        },
        // width of window (pixels)
        width: {
            type: Number,
            default: 200
        },
        // height of window (pixels)
        height: {
            type: Number,
            default: 100
        },
        // minimum width of window (pixels)
        minWidth: {
            type: Number,
            default: 128
        },
        // minimum height of window (pixels)
        minHeight: {
            type: Number,
            default: 128
        },
        // maximum width of window (pixels)
        maxWidth: {
            type: Number,
            default: -1
        },
        // maximum height of window (pixels)
        maxHeight: {
            type: Number,
            default: -1
        },
        // can the window be resized?
        resizable: {
            type: Boolean,
            default: true
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
        // can the window be made to occupy the entire screen (no task bar visible)
        fullScreenable: {
            type: Boolean,
            default: true
        },
        // does the window have a title bar?
        noTitleBar: {
            type: Boolean,
            default: false,
        },
        // is the window undecorated (no title bar, border, etc etc etc)
        undecorated: {
            type: Boolean,
            default: false,
        },
    },
    data()
    {
        return {
            id: null,
            status:
            {
                x: 0,
                y: 0,
                w: 64,
                h: 64,
                maximized: false,
                minimized: false,
                fullscreen: false,
            },
            resizing:
            {
                active: false,
                type: null,
                drag: { x: 0, y: 0 },
                edge: { x: 0, y: 0 },
            }
        };
    },
    computed:
    {
        zIndex() { return this.$store.getters.getWindowZindex(this.id); },
        isActive() { return this.$store.getters.isWindowActive(this.id); },
        isFullscreen() { return this.$store.getters.isWindowFullscreen(this.id); },
    },
    watch:
    {
        'status.x': function(newValue, /*oldValue*/) { this.$refs.container.style.left = newValue + 'px'; },
        'status.y': function(newValue, /*oldValue*/) { this.$refs.container.style.top = newValue + 'px'; },
        'status.w': function(newValue, /*oldValue*/) { this.$refs.container.style.width = newValue + 'px'; },
        'status.h': function(newValue, /*oldValue*/) { this.$refs.container.style.height = newValue + 'px'; },
        zIndex: function(newValue, /*oldValue*/) { this.$refs.container.style.zIndex = newValue; },
        icon: function(newValue, /*oldValue*/) { this.$store.commit(DESKTOP_MUTATION.UPDATE_WINDOW, {id:this.id, icon:newValue}); },
        title: function(newValue, /*oldValue*/) { this.$store.commit(DESKTOP_MUTATION.UPDATE_WINDOW, {id:this.id, title:newValue}); },
    },
    created()
    {
        window.addEventListener('resize', this._handleBrowserResize);
    },
    beforeMount()
    {
        this.id = CryptoUtils.simpleUUID();
        const windowDetails = {
            id: this.id,
            title: this.title,
            icon: this.icon,
            instance: this,
        };
        this.$store.commit(DESKTOP_MUTATION.REGISTER_WINDOW, windowDetails);
    },
    mounted()
    {
        this.status.x = this.x;
        this.status.y = this.y;
        this.status.w = Math.max(this.minWidth, this.width);
        this.status.h = Math.max(this.minHeight, this.height);

        const style = this.$refs.container.style;
        style.left = status.x + 'px';
        style.top = status.y + 'px';
        style.width = status.width + 'px';
        style.height = status.height + 'px';

        if(this.undecorated)
        {
            style.borderRadius = '0px';
            style.border = '0px solid black';
            style.boxShadow = 'none';
        }
    },
    beforeDestroy()
    {
        window.removeEventListener('resize', this._handleBrowserResize);
        this.$store.commit(DESKTOP_MUTATION.DEREGISTER_WINDOW, {id: this.id});
    },
    methods:
    {
        updateXY(xy)
        {
            this.status.x = xy.x;
            this.status.y = xy.y;
        },
        isMinimized()
        {
            return this.status.minimized !== false;
        },
        isMaximized()
        {
            return this.status.maximized !== false;
        },
        minimize()
        {
            if(this.status.minimized || !this.minimizable)
                return;
            if(this.status.maximized)
                this.status.minimized = { ...this.status.maximized };
            else
                this.status.minimized = { x: this.status.x, y: this.status.y, w: this.status.w, h: this.status.h };
            this.$store.commit(DESKTOP_MUTATION.WINDOW_TO_BACK, {id: this.id});
        },
        toggleMinimize()
        {
            if(this.status.minimized)
                this.restore();
            else
                this.minimise();
        },
        maximize()
        {
            if(this.status.maximized || !this.maximizable)
                return;

            this.status.maximized = { x: this.status.x, y: this.status.y, w: this.status.w, h: this.status.h };
            this.status.x = 0;
            this.status.y = 0;
            this.status.w = document.body.clientWidth;
            this.status.h = document.body.clientHeight - 64; // 64px is the height of the taskbar along the bottom of the desktop
        },
        toggleMaximize()
        {
            if(this.status.maximized)
                this.restore();
            else
                this.maximize();
        },
        restore()
        {
            if(this.status.maximized)
            {
                this.status.x = this.status.maximized.x;
                this.status.y = this.status.maximized.y;
                this.status.w = this.status.maximized.w;
                this.status.h = this.status.maximized.h;
                this.status.maximized = false;
            }
            else if(this.status.minimized)
            {
                this.status.x = this.status.minimized.x;
                this.status.y = this.status.minimized.y;
                this.status.w = this.status.minimized.w;
                this.status.h = this.status.minimized.h;
                this.status.minimized = false;
            }
            else if(this.status.fullscreen)
            {
                this.status.x = this.status.fullscreen.x;
                this.status.y = this.status.fullscreen.y;
                this.status.w = this.status.fullscreen.w;
                this.status.h = this.status.fullscreen.h;
                this.status.fullscreen = false;
            }
        },
        toggleFullscreen()
        {
            if(this.status.fullscreen)
            {
                this.restore();
                return false;
            }
            else
                return this.fullscreen();
        },
        fullscreen()
        {
            if(this.status.fullscreen || !this.fullScreenable)
                return false;

            this.status.fullscreen = { x: this.status.x, y: this.status.y, w: this.status.w, h: this.status.h };
            this.status.x = 0;
            this.status.y = 0;
            this.status.w = document.body.clientWidth;
            this.status.h = document.body.clientHeight;

            return true;
        },
        close()
        {
            this.$destroy();
            // remove the element from the DOM
            this.$el.parentNode.removeChild(this.$el);
        },
        _onMouseMove(evt)
        {
            if(this.resizing.active || !this.resizable)
                return;

            const mouseX = evt.clientX;
            const mouseY = evt.clientY;

            const container = this.$refs.container;
            const bounds = container.getBoundingClientRect();

            const left = bounds.x;
            const right = left + bounds.width;
            const top = bounds.y;
            const bottom = top + bounds.height;

            let cursor = 'default';
            let resizeType = null;
            if(mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom)
            {
                const threshold = 16;
                const isW = (mouseX >= left) && (mouseX < left + threshold);
                const isE = !isW && (mouseX >= right - threshold) && (mouseX <= right);
                const isN = (mouseY >= top) && (mouseY < top + threshold);
                const isS = !isN && (mouseY >= bottom - threshold) && (mouseY <= bottom);
                if(!(!isW && !isE && !isN && !isS))
                {
                    resizeType = { e: isE, w: isW, n: isN, s: isS };
                    if(isW)
                        cursor = isN ? 'nw' : (isS ? 'sw' : 'ew');
                    else if(isE)
                        cursor = isN ? 'ne' : (isS ? 'se' : 'ew');
                    else if (isN || isS)
                        cursor = 'ns';
                    cursor += '-resize';
                }
            }
            container.style.cursor = cursor;
            this.resizing.type = resizeType;
        },
        _handleResizeStart(evt)
        {
            this._handleFocus(evt);

            if(!this.resizing.type)
                return;

            this.resizing.active = true;

            this.resizing.drag.x = evt.clientX;
            this.resizing.drag.y = evt.clientY;

            const container = this.$refs.container;
            const bounds = container.getBoundingClientRect();

            this.resizing.edge.x = this.resizing.type.w ? bounds.x : (this.resizing.type.e ? bounds.width : null);
            this.resizing.edge.y = this.resizing.type.n ? bounds.y : (this.resizing.type.s ? bounds.height : null);

            document.onmousemove = this._handleDrag;
            document.onmouseup = this._handleDragEnd;
        },
        _handleDrag(evt)
        {
            evt.preventDefault();

            if(this.status.maximized !== false || this.status.minimized !== false)
                return;

            if(!this.resizing.active)
                return;

            const dragDeltaX = evt.clientX - this.resizing.drag.x;
            const dragDeltaY = evt.clientY - this.resizing.drag.y;
            this.resizing.drag.x = evt.clientX;
            this.resizing.drag.y = evt.clientY;

            if(this.resizing.type.e || this.resizing.type.w)
            {
                let x = this.status.x;
                let w = this.status.w;
                if(this.resizing.type.e)
                    w += dragDeltaX;
                else if(this.resizing.type.w)
                {
                    x += dragDeltaX;
                    w -= dragDeltaX;
                }
                w = Math.max(this.minWidth, w);
                if(this.maxWidth > 0)
                    w = Math.min(this.maxWidth, w);
                this.status.x = x;
                this.status.w = w;
            }

            if(this.resizing.type.s || this.resizing.type.n)
            {
                let y = this.status.y;
                let h = this.status.h;
                if(this.resizing.type.s)
                    h += dragDeltaY;
                else if(this.resizing.type.n)
                {
                    y += dragDeltaY;
                    h -= dragDeltaY;
                }
                h = Math.max(this.minHeight, h);
                if(this.maxHeight > 0)
                    h = Math.min(this.maxWidth, h);
                this.status.y = y;
                this.status.h = h;
            }
        },
        _handleDragEnd(/*evt*/)
        {
            document.onmouseup = null;
            document.onmousemove = null;
            this.resizing.active = false;
            this.resizing.type = null;
            this.resizing.drag.x = 0;
            this.resizing.drag.y = 0;
            this.resizing.edge.x = 0;
            this.resizing.edge.y = 0;
        },
        _handleFocus(/*evt*/)
        {
            this.$store.commit(DESKTOP_MUTATION.WINDOW_TO_FRONT, {id: this.id} );
        },
        _handleBrowserResize(/*evt*/)
        {
            if(this.status.maximized)
            {
                this.status.w = document.body.clientWidth;
                this.status.h = document.body.clientHeight - 64; // 64px is the height of the taskbar along the bottom of the desktop
            }
        },
    }
};
</script>

<style lang="scss">
.vue-os--window
{
    position:absolute;

    background-color: rgba(0,0,0,0);
    border: 2px solid #024;

    padding: 0;
    margin: 0;
    border-radius: 4px;

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;

    box-shadow: 0 5px 20px rgba(0,0,0,0.6666);

    .content
    {
        background-color: #eee;
        color: #111;
        height: 100%;
        overflow: hidden;
        padding: 8px;
    }
}
</style>
