<template>
    <div
        class="cse-desktop--controlled-entity-indicator"
        :style="{width:controlledEntity?'15rem':'auto'}"
    >
        <cse-icon
            :icon="`google-controller${controlledEntity?'':'-off'}`"
            size="1.5rem"
            class="clickable"
            @click="controlledEntity='V-Dagger (JTAC)'"
        />
        <span
            v-if="controlledEntity"
            class="p-ml-1 p-mr-1"
        >
            {{ controlledEntity }}
        </span>
        <cse-icon
            v-if="controlledEntity"
            icon="close"
            size="1.5rem"
            class="clickable"
            @click="controlledEntity=null"
        />
    </div>
</template>

<script>
import { $isInOuterra, /* $tWorldInterface */} from '@/assets/js/titan/titan-utils.js';

import CseDockableMixin from '@/components/cse/CseDockableMixin.vue';

export default {
    name:'controlled-entity-indicator',
    mixins: [CseDockableMixin],
    data()
    {
        return {
            controlledEntity: 'V-Dagger (JTAC)',
        };
    },
    mounted()
    {
        if($isInOuterra)
        {
            // const activeScenario = $tWorldInterface.getActiveScenario();
        }
    },
};
</script>

<style lang="scss">
.cse-desktop--controlled-entity-indicator
{
    display:flex;
    align-items: center;
    justify-content: space-between;

    font-size:0.9rem;

    padding: 4px;

    height: 1.8rem;
    background: rgba(0,64,128,1);
    color: white;

    box-shadow: 0 0 8px rgba(0,0,0,0.5);
}
</style>