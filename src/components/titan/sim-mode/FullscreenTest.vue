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
            <div style="overflow:hidden;height:100%;">
                <button
                    style="width:100%;"
                    @click="toggleFullscreen(context.titanWindow)"
                >
                    <titan-icon :icon="`fullscreen${isFullscreen?'-exit':''}`" />
                </button>
                <div
                    :class="{'pass-through':!isFullscreen}"
                    style="width:100%;height:100%;display:block;background-color:rgba(0,255,0,0.5);"
                    @mousewheel="handleZoom"
                >
                    {{ context }}
                </div>
            </div>
        </template>
    </titan-window>
</template>

<script>
import TitanUtils, { $tWorldInterface, $isInsideTitan, /*$tLogger*/ } from '@/assets/js/titan/titan-utils.js';

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
            scenarioCamera:null,
            cameraState:{
                mode: null,
                position: null,
                orientation: null,
            }
        };
    },
    mounted()
    {
        if($isInsideTitan)
        {
            const activeScenario = $tWorldInterface.getActiveScenario();
            this.scenarioCamera = activeScenario ? activeScenario.getActiveCamera() : null;
        }
    },
    methods:
    {
        toggleFullscreen(window)
        {
            if(this.isFullscreen)
            {
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_EXIT);
                if($isInsideTitan)
                {
                    this.restoreCameraState();
                }
            }
            else
            {
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_ENTER, {id: window.id});
                if($isInsideTitan)
                {
                    this.cameraStateSnapshot();
                    this.scenarioCamera.setFreeCameraMode('FreeCamMode_ManualRoll');
                    this.scenarioCamera.switchToEditorCamera(1000);
                }
            }
            this.isFullscreen = !this.isFullscreen;
        },
        handleZoom(evt)
        {
            if(!this.isFullscreen)
                return;

            if($isInsideTitan)
            {
                const screenBounds = this.$store.getters.screenSize;
                const worldPos = TitanUtils.worldPosForWindowCoords({x:screenBounds.w/2, y:screenBounds.h/2});
                if(worldPos)
                {
                    this.scenarioCamera.zoomEditorCamera(evt.deltaY, worldPos);
                }
            }
        },
        cameraStateSnapshot()
        {
            this.cameraState.mode = this.scenarioCamera.getFreeCameraMode();
            this.cameraState.position = this.scenarioCamera.getPosition();
            this.cameraState.orientation = this.scenarioCamera.getRotation();
        },
        restoreCameraState()
        {
            this.scenarioCamera.setFreeCameraMode(this.cameraState.mode);
            this.scenarioCamera.setPosition(this.cameraState.position);
            this.scenarioCamera.setRotation(this.cameraState.orientation);
        }
    }
};
</script>
