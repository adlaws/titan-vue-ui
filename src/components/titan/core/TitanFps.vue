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

        <div style="position:absolute;display:block;width:8em;height:1.25em;right:16px;bottom:148px;background-color:black;color:#08f;padding: 0 5px;">
            F-88 A2 (ACOG)
        </div>

        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 8 16"
            height="128"
            style="position:absolute;bottom:96px;left:16px;"
        >
            <path :fill="headColor" d="M4 0c-.28 0-.86.22-.69.92 0 0 .08.37.11.6a.88.88 0 01-.44.9s.64.24 1.02.24 1.02-.24 1.02-.24a.88.88 0 01-.44-.9l.1-.6C4.87.22 4.29 0 4 0z" />
            <path :fill="leftArmColor" d="M2.98 2.42c-.17.1-.38.16-.64.17 0 0-.97.13-.75 1.34 0 .1 0 .16-.04.26a3.5 3.5 0 00-.26 1.04C.8 6.63 1.1 6.97.77 7.57c-.23.13-.53.3-.64.5 0 .03-.07.03-.11.07-.04.03-.04.2.19.1 0 0 .07-.07.18-.14 0 .14-.1.97 0 1 0 0 .04.04.12-.03v.17c0 .03.07.13.18-.03 0 0 .11.13.19 0 .07-.17.15-.8.19-.7.03.13-.04.43-.04.5 0 .06.07.13.15.03.15-.87.22-1 .19-1.3-.04-.2.3-.87.4-1.07.53-.77.23-1.2.5-1.77.03-.06.09-.07.13-.03.41-.41.56-.95.62-1.49.04-.36.1-.7-.04-.96z" />
            <path :fill="rightArmColor" d="M5.02 2.42c-.14.26-.08.6-.04.96.06.54.2 1.08.62 1.5.04-.05.1-.04.14.02.26.56-.04 1 .48 1.77.11.2.45.87.41 1.07-.03.3.04.43.2 1.3.07.1.14.03.14-.03 0-.07-.07-.37-.04-.5.04-.1.12.53.2.7.07.13.18 0 .18 0 .11.16.18.06.18.03v-.17c.08.07.12.04.12.04.1-.04 0-.87 0-1l.18.13c.23.1.23-.07.2-.1-.05-.04-.12-.04-.12-.07-.11-.2-.41-.37-.64-.5-.33-.6-.03-.94-.52-2.34a3.5 3.5 0 00-.26-1.04c-.04-.1-.04-.16-.04-.26.22-1.2-.75-1.34-.75-1.34a1.35 1.35 0 01-.64-.17z" />
            <path :fill="torsoColor" d="M3.42 1.52zm1.16 0zm-1.15.1zm1.14 0zm-1.14.08zm1.14 0zm-1.15.1zm1.16 0zM3.4 1.9zm1.2 0zm-1.23.1zm1.26 0zm-1.3.07zm1.34 0zm-1.4.1zm1.46 0zm-1.52.07zm1.58 0zm-1.74.14zm1.9 0zm-1.97.05c.14.26.08.6.04.96a2.4 2.4 0 01-.62 1.5l.01.02c.45.93.01 1.2.15 1.69a1.62 2 0 011.23 1 1.62 2 0 01.21.99 1.62 2 0 01.2-.98 1.62 2 0 011.24-1.01c.14-.5-.3-.76.15-1.7l.01-.02a2.4 2.4 0 01-.62-1.49c-.04-.36-.1-.7.04-.96 0 0-.64.24-1.02.24s-1.02-.24-1.02-.24zM5.6 4.87zm-3.2 0zm.45-2.39h-.01.01zm2.3 0h0zm-2.37.03h-.01.01zm2.44 0h0zm-2.6.05H2.6h.02zm2.76 0h0zm-2.84.01zm2.92 0zm-3.01.01h-.02.02zm3.1 0h0zm-3.2 2.27zm3.3 0zm-3.32 0zm3.34 0zm-3.3 0zm3.27 0h-.01zm-3.33 0zm3.38 0zm-3.4.01zm3.41 0zm-3.42.02zm3.44 0zM4 8.59a1.62 2 0 010 .12 1.62 2 0 010-.12zm-1.75.09z" />
            <path :fill="leftLegColor" d="M2.56 6.59v.01l-.07.17c-.08.7-.56 3.04.04 4.04.48.8-.08 1.54.33 2.87.23.77.12 1.34.19 1.68.04.1.19.13-.3.36-.11.07-.22.34.49.24.11 0 .3.06.37.03 0 0 .19-.03.15-.3 0-.13.04-.57 0-.67-.34-1 .26-1.47.04-2.54-.19-1 .04-1.2 0-1.87-.04-.57-.08-1.64.11-1.8.02-.02.05-.03.09-.03v-.07a1.62 2 0 00-.2-1.11 1.62 2 0 00-1.24-1.01z" />
            <path :fill="rightLegColor" d="M5.44 6.59a1.62 2 0 00-1.23 1A1.62 2 0 004 8.72H4v.07c.04 0 .07.01.09.03.19.16.15 1.23.11 1.8-.04.67.19.87 0 1.87-.22 1.07.38 1.54.04 2.54-.04.1 0 .54 0 .67-.04.27.15.3.15.3.07.03.26-.03.37-.03.71.1.6-.17.49-.24-.49-.23-.34-.26-.3-.36.07-.34-.04-.9.19-1.68.4-1.33-.15-2.07.33-2.87.6-1 .12-3.34.04-4.04l-.07-.17V6.6z" />
        </svg>
        <router-link :to="{name:'desktop'}">
            EXIT FPS
        </router-link>
    </div>
</template>

<script>
import { TITAN_MUTATION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';
import TitanUtils, { $tWorldInterface, $isInsideTitan, /*$tLogger,*/ SIM_MODE, CAMERA_MODE, FREE_CAMERA_MODE } from '@/assets/js/titan/titan-utils.js';

export default {
    name: 'titan-fps',
    data()
    {
        return {
            activeScenario: null,
            activeCamera: null,
            cachedCameraPosRot: null,
            entity: null,
            status:
            {
                body:
                {
                    head:100.0,
                    leftArm:100.0,
                    rightArm:100.0,
                    torso:100.0,
                    leftLeg:100.0,
                    rightLeg:100.0,
                }
            }
        };
    },
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
        headColor: () => '#08F',
        leftArmColor: () => 'red',
        rightArmColor: () => '#08F',
        torsoColor: () => '#08F',
        leftLegColor: () => '#08F',
        rightLegColor: () => '#08F',
    },
    mounted()
    {
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

            this.activeCamera.setCameraMode( CAMERA_MODE.FIRST_PERSON );

            this.activeScenario.scenarioEntered(true);
            $tWorldInterface.pause(false);
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
