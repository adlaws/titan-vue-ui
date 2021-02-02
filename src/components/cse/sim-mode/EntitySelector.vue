<template>
    <cse-desktop-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="600"
        :height="500"
        :closable="false"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <div class="container">
                    <div class="columns">
                        <div class="column is-4">
                            <b-input
                                v-model="filters.name"
                                label="Search:"
                                dense
                                clearable
                                clear-icon="close"
                            >
                                <template slot="append">
                                    <b-icon icon="magnify" />
                                </template>
                            </b-input>
                        </div>
                        <div class="column is-4">
                            <b-dropdown
                                v-model="filters.country"
                                label="Country"
                                placeholder="Any"
                                dense
                                attach
                                chips
                                multiple
                                clearable
                                :items="filters.countryOpts"
                            >
                                <template v-slot:selection="{ item, index }">
                                    <b-chip v-if="index === 0">
                                        <span>{{ item }}</span>
                                    </b-chip>
                                    <span
                                        v-if="index === 1"
                                        class="grey--text caption"
                                    >
                                        (and {{ filters.country.length - 1 }} others)
                                    </span>
                                </template>
                            </b-dropdown>
                        </div>
                        <div class="column is-4">
                            <b-dropdown
                                v-model="filters.domain"
                                label="Domain"
                                placeholder="Any"
                                dense
                                attach
                                chips
                                multiple
                                clearable
                                :items="filters.domainOpts"
                            >
                                <template v-slot:selection="{ item, index }">
                                    <b-chip v-if="index === 0">
                                        <span>{{ item }}</span>
                                    </b-chip>
                                    <span
                                        v-if="index === 1"
                                        class="grey--text caption"
                                    >
                                        (and {{ filters.domain.length - 1 }} others)
                                    </span>
                                </template>
                            </b-dropdown>
                        </div>
                    </div>
                </div>

                <b-table
                    dense
                    item-key="Name"
                    show-select
                    single-select
                    :headers="table.headers"
                    :items="entityDescriptors"
                    :items-per-page="5"
                    :footer-props="{'items-per-page-options': [10,25,50]}"
                    @item-selected="selectEntity"
                    @click:row="selectRow"
                >
                    <template
                        v-slot:[`item.country`]="{ item }"
                    >
                        <country-flag
                            :alpha2="alphaCodeLookup(item)"
                            :title="item.BlueprintMap.country"
                        />
                    </template>
                    <template
                        v-slot:[`item.domain`]="{ item }"
                    >
                        {{ item.BlueprinttMap.detail }}
                    </template>
                    <template
                        v-slot:[`item.icon`]="{ item }"
                    >
                        <img-fallback
                            :src="`${PACKAGES_PATH}${item.Path}.gif`"
                            fallback="images/thumbnail-missing.png"
                            width="64"
                            height="32"
                        />
                    </template>
                </b-table>
                <hr>
                <div style="user-select:text;">
                    {{ selected?selected:'' }}
                </div>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import 'flag-icon-css/sass/flag-icon.scss';

import {TITAN_MUTATION} from '@/assets/js/store/titan-manager.js';

import { PACKAGES_PATH/*, $tLogger*/} from '@/assets/js/titan/titan-utils.js';
import { COUNTRY } from '@/assets/js/utils/countries.js';

import CseDesktopWindow from '@/components/common/cse/CseDesktopWindow.vue';
import CseDesktopWindowContent from '@/components/common/cse/CseDesktopWindowContent.vue';
import ImgFallback from '@/components/cse/core/ImgFallback.vue';
import CountryFlag from '@/components/cse/core/CountryFlag.vue';

export default {
    name: 'entity-selector',
    components:
    {
        CseDesktopWindow, CseDesktopWindowContent,
        CountryFlag,
        ImgFallback
    },
    data()
    {
        return {
            table:{
                headers: [
                    {
                        text: 'Entity',
                        align: 'start',
                        sortable: true,
                        value: 'Name',
                        filter: this.nameFilter
                    },
                    {
                        text: 'Country',
                        value: 'country',
                        sortable: true,
                        filter: this.countryFilter
                    },
                    {
                        text: 'Domain',
                        value: 'domain',
                        sortable: true,
                        filter: this.domainFilter
                    },
                    {
                        text: 'Image',
                        value: 'icon',
                        sortable: false
                    },
                ],
            },
            filters:
            {
                name:'',
                country:[],
                countryOpts:["Afghanistan","Ariana","Australia","Austria","Belgium","Canada","China","Colombia","Czech Republic","Denmark","Egypt","Finland","France","Germany","Hong Kong","Iran","Israel","Mexico","Netherlands","New Zealand","Poland","Russia","Slovakia","Sweden","UK","USA","Usa","Yemen","afghanistan","australia","bestfit","canada","china","egypt","russia","spain","uk","usa"],
                kind: [],
                kindOpts: ["","Vehicle","character","group","item","items","misc","null","scenery","vehicle","virtual"],
                domain: [],
                domainOpts: ["Building","Infrastructure","afghan","air","animals","barrier","building","civilian","clutter","effect","equipment","household","infrastructure","land","landmark","landscape","military","munition","nature","null","object","sea","tools","weapon","weapons","wrecked","wrecks"],
                subType: [],
                subTypeOpts: ["african","amphibious","artillery","ballistic","boat","bridge","building","chock","civilian","communication","countermeasure","electronic","explosive","female","fixedWing","flashlight","flattener","furniture","garbage","groupmarker","itsec","launcher","machinery","magazine","male","marine","medical","military","moon","navy","null","office","parachute","primaryWeapon","rescue","rotaryWing","rotorWing","rural","scenery","secondaryWeapon","sensor","smoke","space","static","strop","subsurface","surface","tail_hook","targets","towed","track_link_33_8","track_link_42_24","track_link_56_26","track_link_62_28","tracked","transport","trigger","turretWeapon","urban","vehicle","wand","waypoint","weapon","weaponAttachment","wheeled"]            ,
            },
            PACKAGES_PATH,
        };
    },
    computed:
    {
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        selected() { return this.$store.getters.getEntitySelectorSelection; },
    },
    mounted()
    {
        //   0          1       2          3       4      5
        //   kind       domain  type       country force  alliance
        // [ "vehicle", "land", "tracked", "USA", "Army", "blue"]
        // let foo = Array.from(new Set(this.entityDescriptors.map((ed)=>ed.BlueprintMap.type))).filter(x => x !== undefined);
        // foo.sort();
        // $tLogger.info(foo);
    },
    beforeDestroy()
    {
        this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_CLEAR_SELECTION);
    },
    methods:
    {
        nameFilter(value, /*filter, item*/)
        {
            if(!this.filters.name || this.filters.name.length === 0)
                return true;

            return (value.toLowerCase().indexOf(this.filters.name.toLowerCase()) !== -1);
        },
        countryFilter(value, filter, item)
        {
            if(!this.filters.country || this.filters.country.length === 0)
                return true;

            return this.filters.country.some(country => country === item.BlueprintMap.country.lcasename);
        },
        domainFilter(value, filter, item)
        {
            if(!this.filters.domain || this.filters.domain.length === 0)
                return true;

            return this.filters.domain.some(domain => domain === item.BlueprintMap.subtype);
        },
        alphaCodeLookup(item)
        {
            const entry = COUNTRY.NAME[item.BlueprintMap.country];
            return entry ? entry.alpha2 : null;
        },
        selectRow(item, row)
        {
            row.select(true);
        },
        selectEntity(selected)
        {
            const isSelected = selected.value === true;
            if(isSelected)
            {
                const entity = selected.item;
                this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_SET_SELECTION, entity);
            }
            else
            {
                this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_CLEAR_SELECTION);
            }
        },
        /*
        debouncedFilterUpdate: UiUtils.debounce(function()
        {
            this.updateFilteredEntities();
        }, 250, {onLeadIn: false, onTrailOut: true}),
        updateFilteredEntities()
        {
            if(this.filters.text.length === 0)
                this.filteredEntities = this.entityDescriptors;
            else
            {
                const filtered = this.entityDescriptors.filter(x =>
                {
                    return x.Name.toLowerCase().indexOf(this.filters.text)>=0;
                });
                this.filteredEntities = filtered;
            }
        }
        */
    }
};
</script>

<style lang="scss">
@import '@/assets/scss/utilities/_all.scss';

.cse-desktop--entity-selector-table
{
    margin:0;
    padding:0;
    border: none;
    width: 100%;
    tr
    {
        margin:0;
        padding:0;
        border: none;
        &.selected
        {
            background-color: $menu-bg-active;
            color: $menu-fg-active;
        }
        td
        {
            margin:0;
            padding:0;
            border: none;
            &.name
            {
                width:90%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
            &.image
            {
                width:10%;
            }
        }
    }
    .selectable
    {
        -webkit-user-select:text;
    }
}
</style>
