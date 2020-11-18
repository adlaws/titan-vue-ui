<template>
    <titan-window
        title="Drawing"
        icon="draw"
        :x="150"
        :y="150"
        :width="196"
        :height="32"
        :resizable="false"
        @window-active="windowActiveChanged"
    >
        <template #default="context">
            <titan-window-content :titan-window="context.titanWindow">
                <div class="vue-os--drawing-tools">
                    <button
                        :class="{active:currentTool==='square'}"
                        @click="setTool('square')"
                    >
                        <titan-icon icon="shape-square-plus" size="150%" />
                    </button>
                    <button
                        :class="{active:currentTool==='circle'}"
                        @click="setTool('circle')"
                    >
                        <titan-icon icon="shape-circle-plus" size="150%" />
                    </button>
                </div>
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import {TITAN_MUTATION} from '@/assets/js/store/titan-manager.js';

import TitanWindow from '@/components/common/titan/TitanWindow.vue';
import TitanWindowContent from '@/components/common/titan/TitanWindowContent.vue';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

import '@/assets/img/datasource.png';

export default {
    name: 'editor-ui',
    components:
    {
        TitanWindow, TitanWindowContent,
        TitanIcon,
    },
    data()
    {
        return {
            currentTool: null,
        };
    },
    computed:
    {
    },
    watch:
    {
        currentTool()
        {
            if(this.currentTool !== null)
                this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, 'Drawing');
            else
                this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, 'Drawing');
        }
    },
    mounted()
    {
    },
    beforeDestroy()
    {
        if(this.$store.getters.isUiMode('Drawing'))
            this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, 'Drawing');
    },
    methods:
    {
        setTool(tool)
        {
            this.currentTool = tool;
            // this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_SET_SELECTION, selected);
        },
        windowActiveChanged(isActive)
        {
            if(!isActive)
                this.currentTool = null;
        }
    }
};
</script>

<style lang="scss">
.vue-os--drawing-tools
{
    button
    {
        &.active
        {
            background: white;
        }
    }

}
</style>
