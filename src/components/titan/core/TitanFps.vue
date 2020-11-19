<template>
    <div
        class="titan--fps pass-through"
    >
        {{ currentSimMode }}
        <br>
        <router-link :to="{name:'desktop'}">
            EXIT FPS
        </router-link>
    </div>
</template>

<script>
import { TITAN_MUTATION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';
import { SIM_MODE, $tWorldInterface, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';

export default {
    name: 'titan-fps',
    components:
    {
    },
    data()
    {
        return {};
    },
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
    },
    watch:
    {
    },
    created()
    {
    },
    mounted()
    {
        this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.FPS);
        this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.PLAY);

        if($isInsideTitan)
        {
            const entityDescriptor = 'hmmwv_m1025a2_desert';
            const activeScenario = $tWorldInterface.getCurrentScenario();
            const activeCamera = activeScenario.getActiveCamera();
            const cameraPos = activeCamera.getPositionAGL();
            const targetLLA = { latitude: cameraPos.y, longitude: cameraPos.x, altitude: 0 };
            activeScenario.createEntityLLA( entityDescriptor, targetLLA );
        }
    },
    beforeDestroy()
    {
        this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.FPS);
        this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.MENU);
    },
    methods:
    {
    }
};
</script>
