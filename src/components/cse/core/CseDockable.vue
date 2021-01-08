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
        </div>
    </div>
</template>

<script>
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
            type: [String, Number,],
            default: 200,
        },
        height:
        {
            type: [String, Number,],
            default: 200,
        },
        offset:
        {
            type: [String, Number,],
            default: 200,
        },
    },
    data()
    {
        return {
            collapsed: true,
        };
    },
    computed:
    {
        _width() { return this._cssSize(this.width); },
        _height() { return this._cssSize(this.height); },
        _offset() { return this._cssSize(this.offset); },
        _dock() { return ''+this.dock.toLowerCase(); },
        isDockEast() { return this._dock === 'e'; },
        isDockWest() { return this._dock === 'w'; },
        isDockNorth() { return this._dock === 'n'; },
        isDockSouth() { return this._dock === 's'; },
        isDockEW() { return this.isDockEast || this.isDockWest; },
        isDockNS() { return !this.isDockEW; },
        desktopBounds() { return this.ignoreTaskbar ? this.$store.getters.screenBounds : this.$store.getters.desktopBounds; },
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
        desktopBounds() { this.updateStyles(); },
        collapsed() { this.$nextTick(this.updateStyles); },
        _width() { this.updateStyles(); },
        _height() { this.updateStyles(); },
        _offset() { this.updateStyles(); },
    },
    mounted()
    {
        this.container = this.$refs.container;
        this.handle = this.$refs.handle;
        this.updateStyles();
    },
    methods:
    {
        updateStyles()
        {
            if(this.container === null)
                return;

            const style = this.container.style;

            style.height = this.collapsed ? 'auto' : this._height;
            style.width = this.collapsed ? 'auto' : this._width;
            style.maxWidth = this._width;

            if(this.isDockEW)
            {
                style.top = this._offset;

                if(this.isDockWest)
                {
                    style.left = '0px';
                }
                else
                {
                    const handleBounds = this.handle.getBoundingClientRect();
                    const width = this.collapsed ? handleBounds.width : this.width;
                    let xPos = this.desktopBounds.right - width;
                    style.left = xPos + 'px';
                }
            }
            else
            {
                style.left = this._offset;

                if(this.isDockNorth)
                {
                    style.top = '0px';
                }
                else
                {
                    const handleBounds = this.handle.getBoundingClientRect();
                    const height = this.collapsed ? handleBounds.height : this.height;
                    let yPos = this.desktopBounds.bottom - height;
                    style.top = yPos + 'px';
                }
            }
        },
        _cssSize(size, defaultUnit='px')
        {
            if(/^.*[a-zA-Z]+/.test(size))
                return size;
            return size + defaultUnit;
        }
    }
};
</script>
