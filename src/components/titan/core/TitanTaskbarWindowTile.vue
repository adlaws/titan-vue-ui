<template>
    <div
        ref="container"
        class="vue-os--titan-taskbar-window-tile"
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

<style lang="scss">
    .vue-os--titan-taskbar-window-tile
    {
        width: 48px;
        height: 48px;
        font-size:40px;
        line-height:40px;

        margin: 0;
        padding: 0;

        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;

        color:#999;
        background-color: rgba(0,16,32,1.0);
        border:1px solid rgba(0,32,64,1.0);
        border-radius:4px;
        margin-right:8px;

        cursor: pointer;
        &:hover
        {
            color:#FFF;
            border:1px solid rgba(0,32,64,1.0);
            background-color: rgba(0,32,64,1.0);
            box-shadow: 0 0 8px rgba(0,16,32,1.0);
        }
        &.active
        {
            color:#DDD;
            border:1px solid rgba(0,48,96,1.0);
            background-color: rgba(0,48,96,1.0);
            box-shadow: 0 0 8px rgba(0,32,64,1.0);
            &:hover
            {
                color:#FFF;
                border:1px solid rgba(0,64,128,1.0);
                background-color: rgba(0,64,128,1.0);
                box-shadow: 0 0 8px rgba(0,48,96,1.0);
            }
        }
    }

</style>