<template>
    <div
        v-show="isShown && !status.minimized"
        ref="container"
        class="vue-os--window"
        :class="{fullscreen: isFullscreen}"
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
            :maximizable="maximizable && resizable"
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
            type: [Number, String],
            default: 0,
        },
        // y position of the window (top is 0)
        y: {
            type: [Number, String],
            default: 0,
        },
        // width of window (pixels)
        width: {
            type: [Number, String],
            default: 200
        },
        // height of window (pixels)
        height: {
            type: [Number, String],
            default: 100
        },
        // minimum width of window (pixels)
        minWidth: {
            type: [Number, String],
            default: 128
        },
        // minimum height of window (pixels)
        minHeight: {
            type: [Number, String],
            default: 128
        },
        // maximum width of window (pixels)
        maxWidth: {
            type: [Number, String],
            default: -1
        },
        // maximum height of window (pixels)
        maxHeight: {
            type: [Number, String],
            default: -1
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
        // can the window be resized?
        // NOTE: if not resizable, it is also not maximizable!
        resizable: {
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
        // is the window minimized initially?
        startMinimized: {
            type: Boolean,
            default: false,
        },
        // is the window maximized initially?
        startMaximized: {
            type: Boolean,
            default: false,
        },
        // is the window fullscreen initially?
        startFullscreen: {
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
        isShown() { return this.$store.getters.isWindowShown(this.id); },
        isFullscreen() { return this.$store.getters.isWindowFullscreen(this.id); },
        desktopBounds() { return this.$store.getters.desktopBounds;},
    },
    watch:
    {
        'status.x': function(newX, /*oldX*/) { this.$refs.container.style.left = newX + 'px'; },
        'status.y': function(newY, /*oldY*/) { this.$refs.container.style.top = newY + 'px'; },
        'status.w': function(newW, /*oldW*/) { this.$refs.container.style.width = newW + 'px'; },
        'status.h': function(newH, /*oldH*/) { this.$refs.container.style.height = newH + 'px'; },
        zIndex(newZ, /*oldZ*/) { this.$refs.container.style.zIndex = newZ; },
        icon(newIcon, /*oldIcon*/) { this.$store.commit(DESKTOP_MUTATION.UPDATE_WINDOW, {id:this.id, icon:newIcon}); },
        title(newTitle, /*oldTitle*/) { this.$store.commit(DESKTOP_MUTATION.UPDATE_WINDOW, {id:this.id, title:newTitle}); },
        isActive(isActive, /*wasActive*/) { this.$emit('window-active', isActive); },
        desktopBounds(/*newBounds, oldBounds*/) { this._handleScreenSizeChange(); },
        isFullscreen(isFullscreen, /*wasFullscreen*/) { this._handleFullScreenChange(isFullscreen); },
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

        if(this.startMinimized && this.minimizable)
            this.minimize();
        else if(this.startMaximized && this.resizable && this.maximizable)
            this.maximize();
        else if(this.startFullscreen)
            this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_ENTER, {id: window.id});
    },
    beforeDestroy()
    {
        this.$emit('window-closed');
        window.removeEventListener('resize', this._handleScreenSizeChange);
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

            this.$emit('window-minimized');
            this.$emit('window-resized', {x: -1, y: -1, w: 0, h: 0});
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
            this.status.x = this.desktopBounds.x;
            this.status.y = this.desktopBounds.y;
            this.status.w = this.desktopBounds.w;
            this.status.h = this.desktopBounds.h;

            const bounds = { x:this.status.x, y:this.status.y, w:this.status.w, h:this.status.h};
            this.$emit('window-maximized', bounds);
            this.$emit('window-resized', bounds);
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
            let restored = false;
            if(this.status.fullscreen)
            {
                this.status.x = this.status.fullscreen.x;
                this.status.y = this.status.fullscreen.y;
                this.status.w = this.status.fullscreen.w;
                this.status.h = this.status.fullscreen.h;
                this.status.fullscreen = false;
                restored = true;
            }
            if(this.status.maximized)
            {
                this.status.x = this.status.maximized.x;
                this.status.y = this.status.maximized.y;
                this.status.w = this.status.maximized.w;
                this.status.h = this.status.maximized.h;
                this.status.maximized = false;
                restored = true;
            }
            if(this.status.minimized)
            {
                this.status.x = this.status.minimized.x;
                this.status.y = this.status.minimized.y;
                this.status.w = this.status.minimized.w;
                this.status.h = this.status.minimized.h;
                this.status.minimized = false;
                restored = true;
            }
            if(restored)
            {
                const bounds = { x:this.status.x, y:this.status.y, w:this.status.w, h:this.status.h};
                this.$emit('window-restored', bounds);
                this.$emit('window-resized', bounds);
            }
        },
        _handleFullScreenChange(isFullscreen)
        {
            if(this.status.fullscreen === isFullscreen)
                return;

            if(isFullscreen)
            {
                this.status.fullscreen = { x: this.status.x, y: this.status.y, w: this.status.w, h: this.status.h };
                this.status.x = this.desktopBounds.x;
                this.status.y = this.desktopBounds.y;
                this.status.w = this.desktopBounds.w;
                this.status.h = this.desktopBounds.h;

                const bounds = { x:this.status.x, y:this.status.y, w:this.status.w, h:this.status.h};
                this.$emit('window-fullscreened', bounds);
                this.$emit('window-resized', bounds);
            }
            else
            {
                this.restore();
            }
        },
        close()
        {
            this.$destroy();
            // NOTE:/TODO: remove the element from the DOM - this is definitely
            // not the most "Vue" thing to do here since we should be letting
            // Vue manage the DOM... we should watch out for side effects
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

            const bounds = { x:this.status.x, y:this.status.y, w:this.status.w, h:this.status.h};
            this.$emit('window-resized', bounds);
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
        _handleScreenSizeChange(/*evt*/)
        {
            if(!this.status.maximized)
                return;

            this.status.x = this.desktopBounds.x;
            this.status.y = this.desktopBounds.y;
            this.status.w = this.desktopBounds.w;
            this.status.h = this.desktopBounds.h;

            const bounds = { x:this.status.x, y:this.status.y, w:this.status.w, h:this.status.h};
            this.$emit('window-resized', bounds);
        },
    }
};
</script>

<style lang="scss">
.vue-os--window
{
    position:absolute;

    padding: 0;
    margin: 0;

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;

    background-color: rgba(0,0,0,0);
    border: 2px solid #024;
    border-radius: 4px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.6666);

    &.fullscreen{
        border: 0px solid rgba(0,0,0,0);
        border-radius: 0;
        box-shadow: none;
    }

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
