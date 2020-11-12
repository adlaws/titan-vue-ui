<template>
    <titan-window
        :title="`Full Screen Test - ${isFullscreen}`"
        :icon="isFullscreen?'fullscreen':'fullscreen-exit'"
        :x="150"
        :y="150"
        :width="350"
        :height="200"
    >
        <template #default="context">
            <titan-window-content :titan-window="context.titanWindow">
                <button
                    @click="toggleFullscreen(context.titanWindow)"
                >
                    <titan-icon icon="fullscreen" />
                </button>
                {{ context }}
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';

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
        toggleFullscreen(window)
        {
            if(this.isFullscreen)
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_EXIT);
            else
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_ENTER, {id: window.id});

            this.isFullscreen = !this.isFullscreen;
        }
    }
};
</script>
