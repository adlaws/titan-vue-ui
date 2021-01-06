<template>
    <div
        ref="container"
        class="titan-desktop--window-content dark"
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
            isScroll: false,
            isHorzScroll: false,
            isVertScroll: false,
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
        'titanWindow.isActive': function() { this._updateScrollHandles(); },
        isScroll: function() { this._updateScrollHandles(); },
        isVertScroll: function() { this._updateScrollHandles(); },
        isHorzScroll: function() { this._updateScrollHandles(); },
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

            this.isScroll = overflowRule === 'scroll';
            this.isHorzScroll = this.isScroll || this.container.scrollWidth > this.container.clientWidth;
            this.isVertScroll = this.isScroll || this.container.scrollHeight > this.container.clientHeight;
        },
        _updateScrollHandles()
        {
            let rightBorder = 'none';
            let bottomBorder = 'none';

            const overflowRule = this.container.style.overflow;
            if(this.container.style.overflow !== 'hidden')
            {
                const isScroll = overflowRule === 'scroll';
                const isHorzScroll = isScroll || this.container.scrollWidth > this.container.clientWidth;
                const isVertScroll = isScroll || this.container.scrollHeight > this.container.clientHeight;
                if((isHorzScroll || isVertScroll) && !(isHorzScroll && isVertScroll))
                {
                    const bgColor = window.getComputedStyle(this.container, null).getPropertyValue("background-color");
                    const border = '4px solid ' + bgColor;
                    rightBorder = isVertScroll ? border : rightBorder;
                    bottomBorder = isHorzScroll ? border : bottomBorder;
                }
            }
            this.container.style.borderRight = rightBorder;
            this.container.style.borderBottom = bottomBorder;
        },
    }
};
</script>
