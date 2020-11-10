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
            :title="title"
            :icon="icon"
            :x="status.x"
            :y="status.y"
            :active="active"
            :maximized="status.maximized"
            :minimized="status.minimized"
            @window-updateXY="updateXY"
            @window-minimise="minimize"
            @window-toggle-maximise="toggleMaximize"
            @window-close="close"
        />
        <slot
            name="default"
            :window-context="{title,status,active,zIndex}"
        >
            <div
                class="content"
            >
                {{ id }}
                <br>
                Active?: {{ active }}
                <br>
                Z-index: {{ zIndex }}
                <br>
                {{ status }}
                <br>
                {{ resizing }}
            </div>
        </slot>
    </div>
</template>

<script>
import CryptoUtils from '@/assets/js/utils/crypto-utils.js';

import TitanTitleBar from '@/components/titan/core/TitanTitleBar.vue';
import {STORE_MUTATION} from '@/assets/js/store/store.js';

export default {
    name: 'titan-window',
    components: {
        TitanTitleBar
    },
    props:
    {
        title: {
            type: String,
            default: 'Window Title'
        },
        icon: {
            type: String,
            default: 'reorder-horizontal'
        },
        x: {
            type: Number,
            default: 0,
        },
        y: {
            type: Number,
            default: 0,
        },
        width: {
            type: Number,
            default: 200
        },
        height: {
            type: Number,
            default: 100
        },
        minWidth: {
            type: Number,
            default: 128
        },
        minHeight: {
            type: Number,
            default: 128
        },
        maxWidth: {
            type: Number,
            default: -1
        },
        maxHeight: {
            type: Number,
            default: -1
        }
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
        active() { return this.$store.getters.isWindowActive(this.id); },
    },
    watch:
    {
        'status.x': function(newValue, /*oldValue*/) { this.$refs.container.style.left = newValue + 'px'; },
        'status.y': function(newValue, /*oldValue*/) { this.$refs.container.style.top = newValue + 'px'; },
        'status.w': function(newValue, /*oldValue*/) { this.$refs.container.style.width = newValue + 'px'; },
        'status.h': function(newValue, /*oldValue*/) { this.$refs.container.style.height = newValue + 'px'; },
        zIndex: function(newValue, /*oldValue*/) { this.$refs.container.style.zIndex = newValue; },
    },
    created()
    {
        window.addEventListener('resize', this._handleBrowserResize);
    },
    destroyed()
    {
        window.removeEventListener('resize', this._handleBrowserResize);
        this.$store.commit(STORE_MUTATION.DEREGISTER_WINDOW, {id: this.id});
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
        this.$store.commit(STORE_MUTATION.REGISTER_WINDOW, windowDetails);
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
            if(this.status.minimized)
                return;
            if(this.status.maximized)
                this.status.minimized = { ...this.status.maximized };
            else
                this.status.minimized = { x: this.status.x, y: this.status.y, w: this.status.w, h: this.status.h };
            this.$store.commit(STORE_MUTATION.WINDOW_TO_BACK, {id: this.id});
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
            if(this.status.maximized)
                return;
            this.status.maximized = { x: this.status.x, y: this.status.y, w: this.status.w, h: this.status.h };
            this.status.x = 0;
            this.status.y = 0;
            this.status.w = this.$parent.$el.clientWidth;
            this.status.h = this.$parent.$el.clientHeight - 64;
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
        },
        close()
        {
            console.log('CLOSE WINDOW');
        },
        _onMouseMove(evt)
        {
            if(this.resizing.active)
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
            this.$store.commit(STORE_MUTATION.WINDOW_TO_FRONT, {id: this.id} );
        },
        _handleBrowserResize(/*evt*/)
        {
            if(this.status.maximized)
            {
                this.status.w = this.$parent.$el.clientWidth;
                this.status.h = this.$parent.$el.clientHeight - 64; // 64px is the height of the taskbar along the bottom of the desktop
            }
        },
    }
};
</script>

<style lang="scss">
.vue-os--window
{
    position:absolute;

    background-color: #048;
    border: 1px solid #024;

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
