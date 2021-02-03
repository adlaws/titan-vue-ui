<template>
    <div>
        <v-data-table
            v-model="table.selected"
            dense
            class="compact"
            height="10rem"
            item-key="uid"
            single-select
            no-data-text="There are no waypoints"
            no-results-text="No waypoints match the filter criteria"
            :items-per-page="5"
            :headers="table.headers"
            :footer-props="table.footerprops"
            :options.sync="table.options"
            :items="waypoints"
            @click:row="_handleWaypointRowClicked"
            @contextmenu:row="_handleWaypointRowContextMenu"
        >
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <template v-slot:[`item.idx`]="{ item }">
                {{ waypointIdxLookup[item.uid]+1 }}
            </template>
            <template v-slot:[`item.name`]="{ item }">
                <span v-if="item.name.length>0">{{ item.name }}</span>
                <span v-else class="secondary--text">&mdash;</span>
            </template>
            <template v-slot:[`item.type`]="{ item }">
                <cse-icon :icon="WAYPOINT.TYPE[item.type].icon" />
            </template>
            <template v-slot:[`item.roe`]="{ item }">
                <cse-icon :icon="WAYPOINT.TYPE[item.roe].icon" />
            </template>
            <template v-slot:[`item.speed`]="{ item }">
                {{ item.speed }}m/s
            </template>
            <template v-slot:[`item.wait`]="{ item }">
                {{ item.wait }}s
            </template>
            <template v-slot:[`item.lla`]="{ item }">
                <mgrs v-if="isMGRS" :latitude="item.lla.latitude" :longitude="item.lla.longitude" />
                <span v-else>
                    <latitude :latitude="item.lla.latitude" />
                    <longitude class="ml-1" :longitude="item.lla.longitude" />
                </span>
            </template>
            <template v-slot:[`item.altitude`]="{ item }">
                {{ item.lla.altitude }}m
            </template>
            <template v-slot:[`footer.page-text`]="{ pageStart, pageStop, itemsLength }">
                {{ pageStart }} - {{ pageStop }} of {{ itemsLength }} Waypoints
            </template>
        </v-data-table>

        <cse-context-menu
            v-if="contextMenu.show"
            :items="contextMenu.items"
            :x="contextMenu.x"
            :y="contextMenu.y"
            use-parent-for-position
            @selected="_contextMenuSelection"
            @cancelled="_hideContextMenu"
        />
    </div>
</template>

<script>
import { WAYPOINT } from './waypointsettings.js';

import MathUtils from '@/assets/js/utils/math-utils.js';
import { POSITION_FORMAT } from '@/assets/js/store/preference-manager.js';
import { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

import Latitude from '@/components/common/cse/core/display/Latitude.vue';
import Longitude from '@/components/common/cse/core/display/Longitude.vue';
import MGRS from '@/components/common/cse/core/display/MGRS.vue';

export default {
    name: 'waypoints-table',
    components:
    {
        Latitude, Longitude, 'mgrs':MGRS,
    },
    props:
    {
        waypoints:{
            type:Array,
            default: () => [],
        }
    },
    data()
    {
        return {
            WAYPOINT,
            SPEED_UNITS,
            table:
            {
                page: 1,
                options: {
                    page: 0,
                    itemsPerPage: 5,
                },
                headers:[
                    { value: 'idx', text: '#', sortable: false, align: 'start', width: "1%", },
                    { value: 'name', text: 'Name', sortable: false, align: 'start', width: "1%", cellClass:'ellipsis-overflow' },
                    { value: 'type', text: 'Type', sortable: false, align: 'start', width: "1%", },
                    { value: 'roe', text: 'ROE', sortable: false, align: 'start', width: "1%", },
                    { value: 'speed', text: 'Speed', sortable: false, align: 'start', width: "1%", },
                    { value: 'wait', text: 'Wait', sortable: false, align: 'start', width: "1%", },
                    { value: 'lla', text: 'Location', sortable: false, align: 'start', width: "99%", },
                    { value: 'altitude', text: 'Altitude', sortable: false, align: 'right', width: "1%", },
                ],
                footerprops:
                {
                    'items-per-page-options':[5],
                },
                selected: [],
            },
            contextMenu:
            {
                show:false,
                x: 0,
                y: 0,
                items: []
            },
        };
    },
    computed:
    {
        isMGRS() { return this.$store.getters.isPositionFormat(POSITION_FORMAT.MGRS); },
        waypointIdxLookup()
        {
            return this.waypoints
                .map((x,idx) => [x.uid, idx])
                .reduce((obj,[key,val]) => (obj[key] = val,obj), {});
        },
    },
    methods:
    {
        selectWaypoint(waypoint)
        {
            const idx = this.waypointIdxLookup[waypoint.uid];
            if(!isNaN(idx))
                this._selectWaypointByIdx(idx);
        },
        clearWaypointSelection()
        {
            this.table.selected.splice(0,this.table.selected.length);
        },
        removeWaypoint()
        {
            // TODO
            // this.$emit('delete', waypoint);
        },
        _selectWaypointByIdx(idx)
        {
            if(this.waypoints.length===0)
                return;

            let actualIdx = MathUtils.wrapClamp(idx,0,this.waypoints.length);
            const tablePage = ((actualIdx / this.table.options.itemsPerPage) | 0)+1;

            if(this.table.selected.length>0)
                this.clearWaypointSelection();
            this.table.selected.push(this.waypoints[actualIdx]);
            this.table.options.page = tablePage;
        },
        _handleWaypointRowClicked(evt, row)
        {
            if(!row.isSelected)
            {
                row.select(true);
                this.$emit('selected', row.item);
            }
            else
            {
                this.clearWaypointSelection();
                this.$emit('selected', null);
            }
        },
        _handleWaypointRowContextMenu(evt, row)
        {
            evt.preventDefault();
            const waypoint = row.item;
            const waypointidx = this.waypointIdxLookup[waypoint.uid];
            this.contextMenu.items = [
                {id:0, text: 'Move Up', icon:'arrow-up', disabled:waypointidx===0,},
                {id:1, text: 'Move Down', icon:'arrow-down', disabled:waypointidx>=this.waypoints.length-1,},
                {id:2, text: 'Insert Before', icon:'table-row-plus-before', disabled:false,},
                {id:3, text: 'Insert After', icon:'table-row-plus-after', disabled:false,},
                {id:4, text: 'Attach to Entity', icon:'link-variant', disabled:false,},
                {id:5, text: 'Detach from Entity', icon:'link-variant-off', disabled:false,},
                {id:6, text: 'Delete '+waypoint.name, icon:'trash-can', disabled:false,},
            ];

            // wait until next tick so that this.contextMenu.show = false can take effect and reset the menu
            this.contextMenu.x = evt.clientX-32;
            this.contextMenu.y = evt.clientY-8;
            this.contextMenu.show = true;
        },
        _contextMenuSelection()
        {
            this._hideContextMenu();
        },
        _hideContextMenu()
        {
            this.contextMenu.show = false;
        },
    }
};
</script>
