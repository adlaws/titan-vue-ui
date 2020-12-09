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
    mounted()
    {
        this.$refs.container.style.overflow = this.overflow || 'auto';
    }
};
</script>
