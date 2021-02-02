<template>
    <cse-desktop-window
        title="Simple"
        icon="emoticon-happy"
        :x="0"
        :y="100"
        :width="275"
        :height="160"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <b-dropdown
                    v-model="selectedOption"
                    label="Entity Type:"
                    :items="entityOptions"
                    item-text="text"
                    item-value="id"
                />
                <b-button
                    :disabled="!selectedOption"
                    @click="createEntity"
                >
                    Create
                </b-button>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import { $isInOuterra, $tWorldInterface } from '@/assets/js/titan/titan-utils.js';

export default {
    name: 'simple',
    data()
    {
        return {
            entityOptions:[
                { id: 'bus_blue',               text: 'Bus' },
                { id: 'Toyota Corolla (grey)',  text: 'Toyota Corolla (grey)' },
                { id: 'hmmwv_m1025a2_desert',   text: 'HMMWV Humvee' },
                { id: 'mh60r_seahawk',          text: 'MH 60R Seahawk' },
            ],
            selectedOption: null,
        };
    },
    methods:
    {
        createEntity()
        {
            if(!$isInOuterra)
            {
                console.log('Not inside Outerra - would have created a '+this.selectedOption);
                return;
            }

            // obtain references to the required Titan interfaces - note that usually this would be
            // done once and the values cached for later re-use, rather than asking for them each
            // time the button is clicked
            const scenario = $tWorldInterface.getActiveScenario();
            const camera = scenario.getActiveCamera();

            // obtain the camera's current position so that we can create the entity on the
            // ground, directly underneath this location
            const cameraPos = camera.getPositionAGL();
            // convert the camera position data to a latitude/longitude object which we can use
            // when creating the entity. Note that the camera's latitude is stored in cameraPos.y,
            // and the longitude is stored in cameraPos.x (not the other way around, as might be
            // expected).
            const targetLLA = { latitude: cameraPos.y, longitude: cameraPos.x, altitude: 0 };

            // obtain the entity descriptor template to create the entity from
            const entityDescriptor = $tWorldInterface.getEntityDescriptorFromName( this.selectedOption );
            // create the entity directly below the camera, snapped to the ground
            const entity = scenario.createEntityLLA( entityDescriptor, targetLLA );
            console.log(JSON.stringify(entity));
            entity.snapToGround();
            entity.setUniqueName("Target");
        }
    }
};
</script>