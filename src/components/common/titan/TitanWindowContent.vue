<template>
    <div
        ref="container"
        class="titan--window-content"
        :class="{active: titanWindow.active}"
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

<style lang="scss">
.titan--window-content
{
    height: 100%;
    overflow: scroll;
    padding: 8px;
    margin: 0px;
    margin-top: 0;
    border-radius: 2px;

    background-color: #ddd;
    color: #111;
    &.active
    {
        background-color: #eee;
    }
}
</style>
