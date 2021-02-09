<template>
    <div
        style="width:100%;height:100%;"
        class="titan--fps pass-through"
        :class="{'faux-outerra-background': !isInOuterra}"
    >
        {{ currentSimMode }}
        <br>
        <router-link :to="{name:'desktop'}">
            EXIT FPS
        </router-link>

        <linear-compass2
            ignore-taskbar
            :y="-10"
        />

        <cse-notifications-area
            ignore-taskbar
            dock="w"
            offset="-16"
            :width="300"
        />

        <character-damage
            :size="64"
            :head="status.health.head"
            :torso="100"
            :left-arm="100"
            :right-arm="100"
            :left-leg="100"
            :right-leg="100"
            style="position:absolute;bottom:96px;right:100px;"
        />

        <character-posture
            :posture="status.posture"
            :lean="'left'"
            :size="64"
            style="position:absolute;bottom:96px;right:16px;"
        />

        <div
            class="cse-overlay-text"
            style="position:absolute;display:block;width:auto;height:auto;padding: 2px 5px 2px 5px;text-align:right;font-size:80%;right:16px;bottom:40px;"
            @click="status.health.head=Math.random()*100.0"
        >
            AK-74M Tracer + 1P78<br>
            <cse-icon icon="ammunition" />&times;16
        </div>
        <div
            style="position:absolute;display:block;width:auto;height:auto;right:16px;bottom:0px;"
        >
            <svg
                v-for="x in 4"
                :key="x"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                height="24"
            >
                <path fill="white" d="M6 1v1h1v10l-3 6 9 4 4-10V2h1V1zm2 1h8v1h-6v8l-2 4H7l2-4V3H8z" />
                <path fill="grey" d="m 6,1 v 3 h 1 v 9 l -3,6 1,1 9,4 1,-1 4,-10 V 4 h 1 V 1 Z M 7,2 H 19 V 3 H 18 V 13 L 14,23 5,19 8,13 V 3 H 7 Z" />
            </svg>
        </div>
    </div>
</template>

<script>
import { TITAN_MUTATION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';
import TitanUtils, { $tWorldInterface, /*$tEventInterface,*/ $isInOuterra, $tLogger, SIM_MODE, CAMERA_MODE, FREE_CAMERA_MODE } from '@/assets/js/titan/titan-utils.js';

import CharacterDamage from '@/components/common/cse/core/character/CharacterDamage.vue';
import CharacterPosture from '@/components/common/cse/core/character/CharacterPosture.vue';
import LinearCompass2 from '@/components/common/cse/core/display/compass/LinearCompass2.vue';

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
    name: 'cse-fps-overlay',
    components:{
        CharacterDamage, CharacterPosture, LinearCompass2,
    },
    data()
    {
        return {
            activeScenario: null,
            activeCamera: null,
            cachedCameraPosRot: null,
            entity: null,
            entityEventSystem: null,
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
        isInOuterra() { return $isInOuterra; },
        currentSimMode() { return this.$store.getters.titanSimMode; },
    },
    mounted()
    {
        this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.FPS);
        this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.PLAY);

        if($isInOuterra)
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
            if(worldPos)
            {
                this.entity = TitanUtils.createEntity('aus_soldier_camcu', worldPos);
                // control the created entity
                this.entity.enableDirectControl();

                // get notified of entity changes to stuff
                this.entityEventSystem = this.entity.getEventSystem();
                this.entityEventSystem.bindCallbackFunction('CharacterPostureChanged_EventInstant', this.updateCharacterPosture);

                this.activeCamera.setCameraMode( CAMERA_MODE.FIRST_PERSON );
                this.activeScenario.scenarioEntered(true);
                $tWorldInterface.pause(false);
            }

            // NOTE: the $global.TitanEvent thing is a holdover from how TitanEventInterface.cpp
            //       works and hopefully will turn into something more like...
            //       $tEventInterface.addListener('someEventName', myHandlerFunction );
            //       Refer also to the source in titanEventListener.js
            window.$global.TitanEvent.addGlobalListener((evtName, evtArgs)=>
            {
                $tLogger.info(`GLOBAL LISTENER TRIGGERED in component ${this.$options.name}: ${evtName}`, evtArgs);
            });
        }
    },
    beforeDestroy()
    {
        // clean up after ourselves
        if($isInOuterra)
        {
            if(this.entity)
            {
                $tWorldInterface.pause(true);
                this.activeScenario.scenarioEntered(false);

                this.entityEventSystem.removeCallbackFunction(this.updateCharacterPosture);

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
        }

        this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.MENU);
        this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.FPS);
    },
    methods:
    {
        updateCharacterPosture()
        {
            // this gives us an integer back for the current pose - check the following for details:
            //     src\titan_module_hyperion\interfaces\EntityInterface.cpp: getCharacterPose()
            this.status.posture = this.entity.getCharacterPose();
        }
    }
};
</script>
