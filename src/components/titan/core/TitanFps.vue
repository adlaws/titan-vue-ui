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
import TitanUtils, { $tWorldInterface, $isInsideTitan, /*$tLogger,*/ SIM_MODE, CAMERA_MODE, } from '@/assets/js/titan/titan-utils.js';

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
            // $tWorldInterface.flushCallbackFunctions(); // TODO: What is this for, exactly?
            const activeScenario = $tWorldInterface.getActiveScenario();
            const activeCamera = activeScenario.getActiveCamera();

            // find the entity with direct control (if any) and disable control
            const controlledEntity = activeScenario.get_direct_control_vehicle();
            if( controlledEntity )
                controlledEntity.disableDirectControl();

            // create an entity at the location in the middle of the screen
            const worldPos = TitanUtils.worldPosForWindowCoords({x:screen.availWidth/2, y:screen.availHeight/2});
            // const entity = TitanUtils.createEntity('abrams_m1a1', worldPos);
            const entity = TitanUtils.createEntity('aus_soldier_camcu', worldPos);
            entity.enableDirectControl();
            activeCamera.setCameraMode( CAMERA_MODE.FREEVIEW );

            activeScenario.scenarioEntered(true);
            $tWorldInterface.pause(false);
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
