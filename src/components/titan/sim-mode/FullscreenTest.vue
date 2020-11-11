<template>
    <titan-window
        title="Full Screen Test"
        :icon="isFullscreen?'fullscreen':'fullscreen-exit'"
        :x="150"
        :y="150"
        :width="200"
        :height="200"
    >
        <template #default="context">
            <titan-window-content :titan-window="context.titanWindow">
                <button
                    @click="toggleFullscreen(context.fullscreenHandler)"
                >
                    <titan-icon icon="fullscreen" />
                </button>
                {{ context }}
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name: 'editor-ui',
    components:
    {
        TitanIcon,
    },
    data()
    {
        return {
            isFullscreen:false,
        };
    },
    computed:
    {
    },
    methods:
    {
        toggleFullscreen(func)
        {
            // TODO
            console.log('fullscreen', func);
            this.isFullscreen = func();
        }
    }
};
</script>
