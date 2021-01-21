<template>
    <div
        v-show="isShown && !status.minimized"
        ref="container"
        class="cse-desktop--window"
        :class="{fullscreen: isFullscreen, active:isActive}"
        @mousemove="_onMouseMove"
        @mousedown="_handleResizeStart"
        @mouseup="_handleFocus"
    >
        <cse-title-bar
            v-if="!(undecorated || noTitleBar || isFullscreen)"
            ref="titlebar"
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
            :cse-desktop-window="{id,title,status,isActive,isFullscreen,zIndex}"
        />
        <slot
            name="status-bar"
            :cse-desktop-window="{id,title,status,isActive,isFullscreen,zIndex}"
        />
    </div>
</template>

<script>
import MathUtils from '@/assets/js/utils/math-utils.js';
import CryptoUtils from '@/assets/js/utils/crypto-utils.js';

import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';

import CseTitleBar from '@/components/cse/core/CseTitleBar.vue';

// distance from edges of window (in pixels) which act as resize drag handles
const RESIZE_THRESHOLD = 8;

const EVENT = {
    WINDOW_ACTIVE:'window-active',
    WINDOW_CLOSED:'window-closed',
    WINDOW_RESIZED:'window-resized',
    WINDOW_MINIMIZED:'window-minimized',
    WINDOW_MAXIMIZED:'window-maximized',
    WINDOW_FULLSCREENED:'window-fullscreened',
    WINDOW_RESTORED:'window-restored',
};


export default {
    name: 'cse-desktop-window',
    components: {
        CseTitleBar
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
                minWidth:128,
                maxWidth:-1,
                minHeight:128,
                maxHeight:-1,
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
        isActive(isActive, /*wasActive*/) { this.$emit(EVENT.WINDOW_ACTIVE, isActive); },
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
        this.status.minWidth = this._processWidth(this.minWidth);
        this.status.maxWidth = this._processWidth(this.maxWidth);
        if(this.status.maxWidth>=0 &&this.status.minWidth > this.status.maxWidth)
        {
            const temp = this.status.minWidth;
            this.status.minWidth = this.status.maxWidth;
            this.status.maxWidth = temp;
        }
        this.status.minHeight = this._processHeight(this.minHeight);
        this.status.maxHeight = this._processHeight(this.maxHeight);
        if(this.status.maxHeight>=0 && this.status.minHeight > this.status.maxHeight)
        {
            const temp = this.status.minHeight;
            this.status.minHeight = this.status.maxHeight;
            this.status.maxHeight = temp;
        }

        const xywh = this._processPositionAndSize(this.x, this.y, this.width, this.height);
        this.status.x = xywh.x;
        this.status.y = xywh.y;
        this.status.w = xywh.width;
        this.status.h = xywh.height;

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
        this.$emit(EVENT.WINDOW_CLOSED);
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
                this.status.minimized = this._getBounds();
            this.$store.commit(DESKTOP_MUTATION.WINDOW_TO_BACK, {id: this.id});

            const bounds = {x: -1, y: -1, w: 0, h: 0};
            this.$emit(EVENT.WINDOW_MINIMIZED, bounds);
            this.$emit(EVENT.WINDOW_RESIZED, bounds);
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

            this.status.maximized = this._getBounds();
            this.status.x = this.desktopBounds.x;
            this.status.y = this.desktopBounds.y;
            this.status.w = this.desktopBounds.w;
            this.status.h = this.desktopBounds.h;

            const bounds = this._getBounds();
            this.$emit(EVENT.WINDOW_MAXIMIZED, bounds);
            this.$emit(EVENT.WINDOW_RESIZED, bounds);
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
                const bounds = this._getBounds();
                this.$emit(EVENT.WINDOW_RESTORED, bounds);
                this.$emit(EVENT.WINDOW_RESIZED, bounds);
            }
        },
        _handleFullScreenChange(isFullscreen)
        {
            if(this.status.fullscreen === isFullscreen)
                return;

            if(isFullscreen)
            {
                this.status.fullscreen = this._getBounds();
                this.status.x = this.desktopBounds.x;
                this.status.y = this.desktopBounds.y;
                this.status.w = this.desktopBounds.w;
                this.status.h = this.desktopBounds.h;

                const bounds = this._getBounds();
                this.$emit(EVENT.WINDOW_FULLSCREENED, bounds);
                this.$emit(EVENT.WINDOW_RESIZED, bounds);
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
        _getBounds()
        {
            if(this.status.minimized)
                return {x: -1, y: -1, w: 0, h: 0};

            return {
                x: this.status.x,
                y: this.status.y,
                w: this.status.w,
                h: this.status.h,
            };
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
                const isW = (mouseX >= left) && (mouseX < left + RESIZE_THRESHOLD);
                const isE = !isW && (mouseX >= right - RESIZE_THRESHOLD) && (mouseX <= right);
                const isN = (mouseY >= top) && (mouseY < top + RESIZE_THRESHOLD);
                const isS = !isN && (mouseY >= bottom - RESIZE_THRESHOLD) && (mouseY <= bottom);
                if(!(!isW && !isE && !isN && !isS))
                {
                    resizeType = { e: isE, w: isW, n: isN, s: isS };
                    if(isW)
                        cursor = isN ? 'nwse' : (isS ? 'nesw' : 'ew');
                    else if(isE)
                        cursor = isN ? 'nesw' : (isS ? 'nwse' : 'ew');
                    else if (isN || isS)
                        cursor = 'ns';
                    cursor += '-resize';
                }
            }
            container.style.cursor = cursor;
            if(this.$refs.titlebar)
            {
                this.$refs.titlebar.$el.style.cursor = cursor === 'default' ? null : cursor;
            }
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
                w = Math.max(this.status.minWidth, w);
                if(this.status.maxWidth > 0)
                    w = Math.min(this.status.maxWidth, w);
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
                h = Math.max(this.status.minHeight, h);
                if(this.status.maxHeight > 0)
                    h = Math.min(this.status.maxHeight, h);
                this.status.y = y;
                this.status.h = h;
            }

            const bounds = this._getBounds();
            this.$emit(EVENT.WINDOW_RESIZED, bounds);
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

            const bounds = this._getBounds();
            this.$emit(EVENT.WINDOW_RESIZED, bounds);
        },
        _processPositionAndSize(x, y, width, height)
        {
            width = this._processWidth(width);
            // constrain width according to limits
            width = Math.max(this.status.minWidth, width);
            if(this.status.maxWidth > 0)
                width = Math.min(this.status.maxWidth, width);

            height = this._processHeight(height);
            // constrain width according to limits
            height = Math.max(this.status.minHeight, height);
            if(this.status.maxHeight > 0)
                height = Math.min(this.status.maxHeight, height);

            x = this._processX(x, height);
            y = this._processY(y, height);
            return {x,y,width,height};
        },
        _processWidth(width)
        {
            if(typeof width !== 'number')
            {
                // convert from percent, pixels as required
                if(width.endsWith('%'))
                    width = (this._parseFloatSafe(width, 0) / 100.0) * this.desktopBounds.w;
                else
                    width = this._parseFloatSafe(width, 0);
            }

            return width;
        },
        _processHeight(height)
        {
            if(typeof height !== 'number')
            {
                // convert from percent, pixels as required
                if(height.endsWith('%'))
                    height = (this._parseFloatSafe(height, 0) / 100.0) * this.desktopBounds.h;
                else
                    height = this._parseFloatSafe(height, 0);
            }

            return height;
        },
        _processX(windowX, windowWidth)
        {
            if(typeof windowX !== 'number')
            {
                if(windowX.endsWith('%'))
                    windowX = this.desktopBounds.left + ((this._parseFloatSafe(windowX, 0) / 100.0) * this.desktopBounds.w);
                else if(windowX === 'left')
                    windowX= this.desktopBounds.left;
                else if(windowX === 'right')
                    windowX= this.desktopBounds.right - windowWidth;
                else if(windowX === 'center')
                    windowX= this.desktopBounds.left + ((this.desktopBounds.w - windowWidth)/2.0);
                else
                    windowX = this._parseFloatSafe(windowX, 0);
            }

            return MathUtils.clamp(windowX, this.desktopBounds.left, this.desktopBounds.right - windowWidth);
        },
        _processY(windowY, windowHeight)
        {
            if(typeof windowY !== 'number')
            {
                if(windowY.endsWith('%'))
                    windowY = this.desktopBounds.left + ((this._parseFloatSafe(windowY, 0) / 100.0) * this.desktopBounds.h);
                else if(windowY === 'top')
                    windowY= this.desktopBounds.top;
                else if(windowY === 'bottom')
                    windowY= this.desktopBounds.bottom - windowHeight;
                else if(windowY === 'center')
                    windowY= this.desktopBounds.top + ((this.desktopBounds.h - windowHeight)/2.0);
                else
                    windowY = this._parseFloatSafe(windowY, 0);
            }

            return MathUtils.clamp(windowY, this.desktopBounds.top, this.desktopBounds.bottom - windowHeight);
        },
        _parseFloatSafe(str, defaultValue=0)
        {
            const result = parseFloat(str);
            return isNaN(result) ? defaultValue : result;
        }
    }
};
</script>
