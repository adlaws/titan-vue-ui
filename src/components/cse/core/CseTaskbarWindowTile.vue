<template>
    <div
        ref="container"
        class="cse-desktop--taskbar-window-tile"
        :class="{active:window.managed.active}"
        :title="window.title"
    >
        <b-icon
            v-if="window.icon"
            :icon="window.icon"
            size="is-medium"
        />
        <div v-else>
            {{ window.title.charAt(0).toUpperCase() }}
        </div>
    </div>
</template>

<script>
export default {
    name:'cse-taskbar-window-tile',
    props:{
        window: {
            type: Object,
            required: true,
        },
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
    },
    watch:
    {
        taskbarSize(/*newValue, oldValue*/) { this.updateStyle(); },
    },
    mounted()
    {
        this.updateStyle();
    },
    methods:
    {
        updateStyle()
        {
            const size = (this.taskbarSize * 0.75) + 'px';
            const fontSize = (this.taskbarSize * 0.625) + 'px';
            const marginRight = (this.taskbarSize / 8.0) + 'px';
            const borderRadius = (this.taskbarSize / 16.0) + 'px';

            const container = this.$refs.container;

            container.style.width = size;
            container.style.height = size;
            container.style.fontSize = fontSize;
            container.style.lineHeight = fontSize;
            container.style.marginRight = marginRight;
            container.style.borderRadius = borderRadius;
        }
    },
};
</script>
