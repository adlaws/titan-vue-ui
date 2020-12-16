<template>
    <div
        ref="container"
        class="titan-desktop--window-content"
        :class="{active: titanWindow.isActive}"
    >
        <!-- Active Window: {{ windowContext }} -->
        <slot />
    </div>
</template>

<script>
export default {
    name: 'titan-window-content',
    props:
    {
        titanWindow: {
            type: Object,
            default: () => {},
        },
        // decides what to do if the content overflows the bounds on the content box
        // valid values are standard CSS property values for `overflow`:
        // visible|hidden|scroll|auto|initial|inherit
        overflow:
        {
            type: String,
            default: 'auto',
        },
    },
    data()
    {
        return {
            container: null,
        };
    },
    watch:
    {
        overflow() { this._updateStyles(); },
        'titanWindow.status.x': function() { this._updateStyles(); },
        'titanWindow.status.y': function() { this._updateStyles(); },
        'titanWindow.status.w': function() { this._updateStyles(); },
        'titanWindow.status.h': function() { this._updateStyles(); },
        'titanWindow.status.minimized': function() { this._updateStyles(); },
        'titanWindow.status.maximized': function() { this._updateStyles(); },
        'titanWindow.status.fullscreen': function() { this._updateStyles(); },
    },
    mounted()
    {
        this.container = this.$refs.container;
        this.$nextTick(this._updateStyles);
    },
    methods:
    {
        _updateStyles()
        {
            const overflowRule = this.overflow || 'auto';
            this.container.style.overflow = overflowRule;

            if(overflowRule === 'hidden')
                return; // never any scroll bars

            console.log();
            const isScroll = overflowRule === 'scroll';
            const isHorzScroll = isScroll || this.container.scrollWidth > this.container.clientWidth;
            const isVertScroll = isScroll || this.container.scrollHeight > this.container.clientHeight;
            this.container.style.marginRight = isVertScroll ? '4px' : 0;
            this.container.style.marginBottom = isHorzScroll ? '4px' : 0;
        }
    }
};
</script>
