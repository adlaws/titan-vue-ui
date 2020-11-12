<template>
    <titan-window
        title="Full Screen Test"
        :icon="`fullscreen${isFullscreen?'-exit':''}`"
        :x="150"
        :y="150"
        :width="350"
        :height="200"
    >
        <template #default="context">
            <div style="overflow:hidden;">
                <button
                    @click="toggleFullscreen(context.titanWindow)"
                >
                    <titan-icon :icon="`fullscreen${isFullscreen?'-exit':''}`" />
                </button>
                <div>
                    <div
                        style="width:33%;height:100px;display:inline-block;background-color:rgba(255,0,0,1);"
                    />
                    <div
                        class="pass-through"
                        style="width:33%;height:100px;display:inline-block;background-color:rgba(0,255,0,0.5);"
                    />
                    <div
                        style="width:33%;height:100px;display:inline-block;background-color:rgba(255,0,0,1);"
                    />
                </div>
                {{ context }}
            </div>
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
