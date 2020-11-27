<template>
    <div
        class="titan--fps pass-through"
    >
        {{ currentSimMode }}
        <br>

        <div style="position:absolute;display:block;width:8em;height:2.25em;right:16px;bottom:96px;background-color:black;color:#08f;padding: 0 5px;">
            <span style="font-size:200%">31</span>
            AUTO
        </div>

        <div
            style="position:absolute;display:block;width:8em;height:1.25em;right:16px;bottom:148px;background-color:black;color:#08f;padding: 0 5px;"
            @click="status.health.head=Math.random()*100.0"
        >
            F-88 A2 (ACOG)
        </div>

        <character-damage
            :size="128"
            :head="status.health.head"
            :torso="100"
            :left-arm="100"
            :right-arm="100"
            :left-leg="100"
            :right-leg="100"
            style="position:absolute;bottom:96px;left:16px;"
        />

        <character-posture
            :posture="status.posture"
            style="position:absolute;bottom:96px;left:64px;"
        />

        <router-link :to="{name:'desktop'}">
            EXIT FPS
        </router-link>
    </div>
</template>

<script>
import { TITAN_MUTATION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';
import TitanUtils, { $tWorldInterface, /*$tEventInterface,*/ $isInsideTitan, $tLogger, SIM_MODE, CAMERA_MODE, FREE_CAMERA_MODE } from '@/assets/js/titan/titan-utils.js';

import CharacterDamage from './character/CharacterDamage.vue';
import CharacterPosture from './character/CharacterPosture.vue';

// ref: src\titan_module_hyperion\interfaces\EntityInterface.cpp: getCharacterPose()
const POSTURE = {
    STANDING: 0,
    CROUCHING: 1,
    KNEELING: 2,
    PRONE: 3,
    CLIMBING: 4,
    PARACHUTING: 5,
    SWIMMING: 6,
};

export default {
    name: 'titan-fps',
    components:{
        CharacterDamage, CharacterPosture,
    },
    data()
    {
        return {
            activeScenario: null,
            activeCamera: null,
            cachedCameraPosRot: null,
            entity: null,
            status:
            {
                health:{ head:100 },
                posture: POSTURE.STANDING,
            },
            POSTURE
        };
    },
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
    },
    mounted()
    {
        $tLogger.info('>>>>>>>>>>>>>>>>> window.TitanEvent is ', window.TitanEvent);

        this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.FPS);
        this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.PLAY);

        if($isInsideTitan)
        {
            // $tWorldInterface.flushCallbackFunctions(); // TODO: What is this for, exactly?
            this.activeScenario = $tWorldInterface.getActiveScenario();
            this.activeCamera = this.activeScenario.getActiveCamera();

            // cache the current position and orientation of the camera so that we can
            // restore it when we exit the scenario
            this.cachedCameraPosRot = {
                position: this.activeCamera.getPosition(),
                orientation: this.activeCamera.getRotation()
            };

            // find the entity with direct control (if any) and disable control
            const controlledEntity = this.activeScenario.get_direct_control_vehicle();
            if( controlledEntity )
                controlledEntity.disableDirectControl();

            // create an entity at the location in the middle of the screen
            const worldPos = TitanUtils.worldPosForWindowCoords({x:screen.availWidth/2, y:screen.availHeight/2});
            this.entity = TitanUtils.createEntity('aus_soldier_camcu', worldPos);
            // control the created entity
            this.entity.enableDirectControl();

            // get notified of entity changes to stuff
            const entityEventSystem = this.entity.getEventSystem();
            entityEventSystem.bindCallbackFunction('CharacterPostureChanged_EventInstant', ()=>
            {
                // $tLogger.info('CharacterPostureChanged_EventInstant!!');
                this.status.posture = this.entity.getCharacterPose();
                // $tLogger.info(this.entity.getCharacterPoseData());
            });

            this.activeCamera.setCameraMode( CAMERA_MODE.FIRST_PERSON );
            this.activeScenario.scenarioEntered(true);
            $tWorldInterface.pause(false);

            $tLogger.info('Adding Global Listener...');
            window.TitanEvent.addGlobalListener((evtName, evtArgs)=>
            {
                $tLogger.info('GLOBAL LISTENER', evtName, evtArgs);
            });
            $tLogger.info('Added Global Listener!');
        }
    },
    beforeDestroy()
    {
        // clean up after ourselves
        if($isInsideTitan)
        {
            $tWorldInterface.pause(true);
            this.activeScenario.scenarioEntered(false);

            const controlledEntity = this.activeScenario.get_direct_control_vehicle();
            if( controlledEntity )
                controlledEntity.disableDirectControl();
            this.entity.remove();

            // NOTE: for some reason cant' immediately set the free camera mode after
            // setting the camera mode, so we have to do a little 100ms wait here.
            this.activeCamera.setCameraMode( CAMERA_MODE.FREEVIEW );
            setTimeout(()=>
            {
                this.activeCamera.setFreeCameraMode( FREE_CAMERA_MODE.AUTO_ROLL );

                // restore the cached position of the standard camera
                this.activeCamera.setPosition(this.cachedCameraPosRot.position);
                this.activeCamera.setRotation(this.cachedCameraPosRot.orientation);
            }, 100);
        }

        this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.MENU);
        this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.FPS);
    },
};
</script>
