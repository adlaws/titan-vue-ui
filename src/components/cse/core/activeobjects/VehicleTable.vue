<template>
    <b-table
        dense
        item-key="uid"
        no-data-text="There are no vehicles"
        no-results-text="No vehicles match the filter criteria"
        :items="vehicles"
        show-expand
        single-expand
        :expanded="table.expanded"
        :headers="table.headers"
    >
        <template v-slot:[`item.country`]="{ item }">
            <country-flag
                :alpha2="item.country.alpha2"
            />
            {{ item.country.alpha2.toUpperCase() }}
            <b-icon :color="item.alliance==='blufor'?'#08f':'red'">
                triangle
            </b-icon>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
            <b-icon
                :icon="`lock${ item.locked === false ? '-open-variant-outline' : '' }`"
                :color="item.locked?'warning':'secondary'"
                @click="toggleLock(item)"
            />
            <b-icon
                :icon="`camera${item.cameraLocked ? '' : '-outline'}`"
                :color="item.cameraLocked?'primary':'secondary'"
                @click="toggleCamera(item)"
            />
            <b-icon
                :icon="item.controlledBy === 'player' ? 'google-controller' : 'robot-outline'"
                :color="item.controlledBy === 'player'?'error':'secondary'"
                @click="toggleControl(item)"
            />
        </template>
        <template v-slot:[`item.data-table-expand`]="{ item, isExpanded, expand }">
            <b-button
                v-if="item.crew && item.crew.length>0"
                icon
                @click="expand(!isExpanded)"
            >
                <b-icon
                    :icon="chevron-down"
                    :class="{'rotate-180': isExpanded}"
                />
            </b-button>
        </template>
        <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
                Crew:
                <ul>
                    <!-- eslint-disable-next-line vue/require-v-for-key -->
                    <li v-for="crew in item.crew">
                        <crew-entry
                            :crew-descriptor="crew"
                            :crew-entry="scenarioObjectsByUid[crew.uid]"
                            @toggle-camera="toggleCamera"
                            @toggle-lock="toggleLock"
                            @toggle-control="toggleControl"
                        />
                    </li>
                </ul>
            </td>
        </template>
    </b-table>
</template>

<script>
import { /*$tLogger*/ } from '@/assets/js/titan/titan-utils.js';

import CountryFlag from '@/components/cse/core/CountryFlag.vue';
import CrewEntry from './CrewEntry.vue';

export default {
    name:'vehicle-table',
    components:{
        CrewEntry, CountryFlag,
    },
    props:
    {
        vehicles:
        {
            type: Array,
            default: () => [],
        },
        scenarioObjects:
        {
            type: Array,
            default: () => [],
        },
        scenarioObjectsByUid:
        {
            type: Object,
            default: () => {},
        },
    },
    data()
    {
        return {
            table: {
                headers:[
                    { value: 'model', text: 'Model', sortable: true, align: 'start', },
                    { value: 'name', text: 'Callsign', sortable: true, align: 'start', },
                    { value: 'country', text: 'Affiliation', sortable: true, align: 'start', },
                    { value: 'actions', text: 'Actions', sortable: false, align: 'start', },
                    { text: '', value: 'data-table-expand' },
                ],
                expanded: [],
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