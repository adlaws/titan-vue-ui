<template>
    <div
        ref="container"
        class="titan--window-content"
        :class="{active: windowContext.active}"
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
        windowContext: {
            type: Object,
            default: () => {},
        }
    }
};
</script>

<style lang="scss">
.titan--window-content
{
    height: 100%;
    overflow: scroll;
    padding: 8px;
    margin: 2px;
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
