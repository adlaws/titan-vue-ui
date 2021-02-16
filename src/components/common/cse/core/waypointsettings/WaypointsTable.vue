<template>
    <div>
        <DataTable
            ref="theTable"
            :value="waypoints"
            class="p-datatable-sm"
            :paginator="true"
            :rows="table.itemsPerPage"
            paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
            current-page-report-template="Showing {first} to {last} of {totalRecords}"
            data-key="uid"
            selection-mode="single"
            :selection.sync="table.selected"
            @contextmenu:row="_handleWaypointRowContextMenu"
        >
            <!-- eslint-disable-next-line vue/no-unused-vars -->
            <Column field="index" header="" header-style="width:2rem;">
                <template #body="slotProps">
                    {{ waypointIdxLookup[slotProps.data.uid] + 1 }}
                </template>
            </Column>
            <Column field="name" header="Name">
                <template #body="slotProps">
                    <span v-if="slotProps.data.name.length>0">{{ slotProps.data.name }}</span>
                    <span v-else class="secondary--text">&mdash;</span>
                </template>
            </Column>
            <Column field="type" header="Type" header-style="width:3rem;">
                <template #body="slotProps">
                    <cse-icon :icon="WAYPOINT.TYPE[slotProps.data.type].icon" />
                </template>
            </Column>
            <Column field="roe" header="ROE" header-style="width:3rem;">
                <template #body="slotProps">
                    <cse-icon :icon="WAYPOINT.ROE[slotProps.data.roe].icon" />
                </template>
            </Column>
            <Column field="speed" header="Speed">
                <template #body="slotProps">
                    {{ slotProps.data.speed }}m/s
                </template>
            </Column>
            <Column field="wait" header="Wait" header-style="width:3rem;">
                <template #body="slotProps">
                    {{ slotProps.data.wait }}s
                </template>
            </Column>
            <Column field="lla" header="Position" header-style="width:9rem;">
                <template #body="slotProps">
                    <mgrs v-if="isMGRS" :latitude="slotProps.data.lla.latitude" :longitude="slotProps.data.lla.longitude" />
                    <span v-else>
                        <latitude :latitude="slotProps.data.lla.latitude" />
                        <longitude class="ml-1" :longitude="slotProps.data.lla.longitude" />
                    </span>
                </template>
            </Column>
            <Column field="altitude" header="Altitude">
                <template #body="slotProps">
                    {{ slotProps.data.lla.altitude }}m
                </template>
            </Column>
        </DataTable>

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

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import Latitude from '@/components/common/cse/core/display/Latitude.vue';
import Longitude from '@/components/common/cse/core/display/Longitude.vue';
import MGRS from '@/components/common/cse/core/display/MGRS.vue';

export default {
    name: 'waypoints-table',
    components:
    {
        DataTable, Column,
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
                itemsPerPage: 5,
                selected: null,
                paginator: null,
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
    watch:
    {
        'table.selected': function(waypoint) { this.$emit('selected', waypoint); },
    },
    mounted()
    {
        // WARNING: Nasty Stuff
        // here we want to get hold of the paginator component so that we can
        // manually change the paging of the table to track with the currently
        // active/selected waypoint. There's no "official" way to do this, so
        // we run through `DataTable` Vue component's children, and get the first
        // one with the component tag 'DTPaginator` - it's evil but it works,
        // and until there's an official way to do this, this is probably the
        // neatest solution to this problem.
        const theTable = this.$refs.theTable;
        const candidates = theTable.$children.filter((c) => c.$options._componentTag === 'DTPaginator');
        this.table.paginator = candidates.length === 0 ? null : candidates[0];
        // WARNING: Nasty Stuff
        // here we get the table body wrapper and "lock" the height based on the
        // number of rows so that if we display a page which has less than this
        // number of items on it the table won't change size. For the a DataTable
        // with the `p-datatable-sm` class applied, each row is 45px high per
        // item plus 1px for the row 'line' = 46px per row
        theTable.$el.querySelector('.p-datatable-wrapper').style.minHeight = (this.table.itemsPerPage * 46) + 'px';
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
            this.table.selected = null;
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
            const tablePage = ((actualIdx / this.table.itemsPerPage) | 0);

            this.table.selected = this.waypoints[actualIdx];
            this._changePage(tablePage);
        },
        _changePage(pg)
        {
            // only change the page if we are not already on the requested page
            if(this.table.paginator && this.table.paginator.page !== pg)
                this.table.paginator.changePage(pg);
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
