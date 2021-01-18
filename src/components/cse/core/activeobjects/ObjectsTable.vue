<template>
    <v-data-table
        dense
        item-key="uid"
        no-data-text="There are no objects"
        no-results-text="No objects match the filter criteria"
        :items="objects"
        :headers="table.headers"
    >
        <template v-slot:[`item.country`]="{ item }">
            <country-flag
                :alpha2="item.country"
            />
            {{ item.country.toUpperCase() }}
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
        </template>
    </v-data-table>
</template>

<script>
import { /*$tLogger*/ } from '@/assets/js/titan/titan-utils.js';

import CountryFlag from '@/components/cse/core/CountryFlag.vue';

export default {
    name:'objects-table',
    components:{
        CountryFlag,
    },
    props:
    {
        objects:
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
    }
};
</script>