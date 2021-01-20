<template>
    <v-card>
        <v-data-table
            dense
            class="compact"
            item-key="uid"
            no-data-text="There are no lifeforms"
            no-results-text="No lifeforms match the filter criteria"
            :items="lifeforms"
            :headers="table.headers"
        >
            <template v-slot:[`item.country`]="{ item }">
                <country-flag
                    :alpha2="item.country"
                />
                {{ item.country.toUpperCase() }}
                <v-icon :color="item.alliance==='blufor'?'#08f':'red'">
                    mdi-triangle
                </v-icon>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon
                    :color="item.locked?'warning':'secondary'"
                    @click="toggleLock(item)"
                >
                    mdi-lock{{ item.locked === false ? '-open-variant-outline' : '' }}
                </v-icon>
                <v-icon
                    :color="item.cameraLocked?'primary':'secondary'"
                    @click="toggleCamera(item)"
                >
                    {{ item.cameraLocked ? 'mdi-camera' : 'mdi-camera-outline' }}
                </v-icon>
                <v-icon
                    :color="item.controlledBy === 'player'?'error':'secondary'"
                    @click="toggleControl(item)"
                >
                    {{ item.controlledBy === 'player' ? 'mdi-google-controller' : 'mdi-robot-outline' }}
                </v-icon>
            </template>
        </v-data-table>
    </v-card>
</template>

<script>
import { /*$tLogger*/ } from '@/assets/js/titan/titan-utils.js';

import CountryFlag from '@/components/cse/core/CountryFlag.vue';

export default {
    name:'lifeform-table',
    components:{
        CountryFlag,
    },
    props:
    {
        lifeforms:
        {
            type: Array,
            default: () => [],
        },
        scenarioObjects:
        {
            type: Array,
            default: () => [],
        },
    },
    data()
    {
        return {
            table: {
                headers:[
                    { value: 'model', text: 'Model', sortable: true, align: 'start', },
                    { value: 'name', text: 'Callsign', sortable: true, align: 'start', },
                    { value: 'country', text: 'Country', sortable: true, align: 'start', },
                    { value: 'actions', text: 'Actions', sortable: false, align: 'start', },
                ],
            },
        };
    },
    methods:
    {
        toggleLock(item)
        {
            item.locked = !item.locked;
        },
        toggleCamera(item)
        {
            if(!item.cameraLocked)
            {
                this.scenarioObjects.filter(x => x.cameraLocked).forEach(x => x.cameraLocked = false);
                item.cameraLocked = true;
            }
            else
            {
                item.cameraLocked = false;
            }
        },
        toggleControl(item)
        {
            if(item.controlledBy === 'ai')
            {
                this.scenarioObjects.filter(x => x.controlledBy === 'player').forEach(x => x.controlledBy = 'ai');
                item.controlledBy = 'player';
            }
            else if(item.controlledBy === 'player')
            {
                item.controlledBy = 'ai';
            }
        },
    }
};
</script>