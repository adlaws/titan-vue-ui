<template>
    <div
        ref="container"
        class="titan-desktop--taskbar-window-tile"
        :class="{active:window.managed.active}"
        :title="window.title"
    >
        <titan-icon
            v-if="window.icon"
            :icon="window.icon"
        />
        <div v-else>
            {{ window.title.charAt(0).toUpperCase() }}
        </div>
    </div>
</template>

<script>
import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name:'titan-taskbar-window-tile',
    components:{
        TitanIcon
    },
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
