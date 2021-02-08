<template>
    <cse-desktop-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="470"
        :height="500"
        :closable="false"
        :resizable="true"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <div class="filter-buttons-container">
                    <div class="header">
                        <ToggleButton
                            v-model="verifiedOnly"
                            on-label="Verified"
                            off-label="Verified"
                            class="p-button-xsm"
                            :class="{'p-button-success':verifiedOnly}"
                            style="float:right;"
                        />
                        <SelectButton
                            v-model="entitiesObjects"
                            :options="[{label:'Entities',value:'entities'},{label:'Objects',value:'objects'}]"
                            class="p-button-xsm"
                            data-key="value"
                            option-label="label"
                            option-value="value"
                        />
                    </div>
                    <div class="left-filters-container">
                        <Button
                            class="p-button-xsm"
                            :class="{'p-button-outlined p-button-secondary':allowVehicleTypes||allowItemsTypes}"
                            :label="allowEntities?'Characters':'Scenery'"
                            @click="updateTypeFilter(allowEntities?BLUEPRINT_VALUE.TYPE.CHARACTER:BLUEPRINT_VALUE.TYPE.SCENERY)"
                        />
                        <SelectButton
                            v-if="allowEntities"
                            v-model="characterSubtype2"
                            class="p-button-xsm flex-grow"
                            :options="characterSubtypeOptions"
                            :disabled="!allowCharacterTypes"
                            data-key="value"
                            option-label="label"
                            option-value="value"
                            option-disabled="disabled"
                            @input="updateCharacterSubtypeFilter"
                        />
                        <SelectButton
                            v-if="allowObjects"
                            v-model="scenerySubtype2"
                            class="p-button-xsm flex-grow"
                            :options="scenerySubtypeOptions"
                            data-key="value"
                            option-label="label"
                            option-value="value"
                            @input="updateScenerySubtypeFilter"
                        />
                        <SelectButton
                            v-if="allowEntities"
                            v-model="characterDetailFilter2"
                            class="p-button-xsm flex-grow"
                            :options="characterDetailOptions"
                            :disabled="!allowCharacterTypes"
                            data-key="value"
                            option-label="label"
                            option-value="value"
                            @input="updateCharacterDetailFilter"
                        />
                    </div>
                    <div
                        class="right-filters-container"
                    >
                        <Button
                            class="p-button-xsm"
                            :class="{'p-button-outlined p-button-secondary':allowCharacterTypes||allowSceneryTypes}"
                            :label="allowEntities?'Vehicles':'Items'"
                            @click="updateTypeFilter(allowEntities?BLUEPRINT_VALUE.TYPE.VEHICLE:BLUEPRINT_VALUE.TYPE.ITEMS)"
                        />
                        <SelectButton
                            v-if="allowEntities"
                            v-model="vehicleSubtype2"
                            :options="vehicleSubtypeOptions"
                            class="p-button-xsm flex-grow"
                            data-key="value"
                            option-label="label"
                            option-value="value"
                            @input="updateVehicleSubtypeFilter"
                        />
                        <SelectButton
                            v-else-if="allowObjects"
                            v-model="itemsSubtype2"
                            :options="itemsSubtypeOptions"
                            class="p-button-xsm flex-grow"
                            data-key="value"
                            option-label="label"
                            option-value="value"
                            style="flex-grow:1;"
                            @input="updateItemsSubtypeFilter"
                        />
                        <SelectButton
                            v-if="allowEntities"
                            v-model="vehicleDetailFilter2"
                            :options="vehicleDetailOptions"
                            :disabled="!vehicleSubtype"
                            class="p-button-xsm flex-grow"
                            data-key="value"
                            option-label="label"
                            option-value="value"
                            @input="updateVehicleDetailFilter"
                        />
                    </div>
                </div>

                <!-- NOTE: a lot of inline styles here to make the layout work -->
                <!--       it's definitely not ideal, -->
                <div
                    class="p-grid"
                >
                    <div class="p-col-6">
                        <span class="p-input-icon-left p-input-icon-right">
                            <cse-icon icon="magnify" />
                            <InputText
                                v-model="searchText"
                                class="p-inputtext-sm"
                                placeholder="Search"
                            />
                            <cse-icon
                                v-show="searchText.length!==0"
                                class="clickable"
                                icon="close"
                                @click="searchText=''"
                            />
                        </span>
                    </div>
                    <div class="p-col-6">
                        <MultiSelect
                            v-model="countryFilter"
                            :options="entityCountries"
                            style="width:210px;"
                            data-key="alpha2"
                            option-label="name"
                            placeholder="Select Countries"
                            class="multiselect-custom p-multiselect-sm"
                            :filter="true"
                        >
                            <template #value="slotProps">
                                <span
                                    v-for="(option, idx) of slotProps.value"
                                    :key="option.alpha2"
                                    class="country-item country-item-value"
                                >
                                    <country-flag
                                        v-if="idx<5"
                                        :alpha2="option.alpha2"
                                        :class="{'p-ml-1':idx>0}"
                                    />
                                    <span v-if="idx===6">
                                        + {{ slotProps.value.length - 5 }}
                                    </span>
                                </span>
                                <template v-if="!slotProps.value || slotProps.value.length === 0">
                                    Select Countries
                                </template>
                            </template>
                            <template #option="slotProps">
                                <country-flag class="mr-2" :alpha2="slotProps.option.alpha2" />
                                {{ slotProps.option.name }}
                            </template>
                        </MultiSelect>
                    </div>
                </div>

                <div
                    style="display:flex;"
                >
                    <DataTable
                        :value="filteredEntities"
                        class="p-datatable-sm no-headers"
                        style="width:300px;min-height:230px;"
                        selection-mode="single"
                        data-key="id"
                        :loading="entityFilterUpdating"
                        :scrollable="true"
                        :rows="filteredEntities.length"
                        :total-records="filteredEntities.length"
                        scroll-height="230px"
                        @row-select="selectEntity"
                    >
                        <Column
                            header="Items"
                        >
                            <template #body="slotProps">
                                <div style="display:flex;">
                                    <img-fallback
                                        :src="`${PACKAGES_PATH}${slotProps.data.Path}.gif`"
                                        fallback="images/thumbnail-missing.png"
                                        width="48"
                                        height="24"
                                        class="mr-1"
                                    />
                                    <span
                                        style="flex-grow:1;max-width:205px;overflow:hidden;white-space:nowrap;font-size:85%;text-overflow:ellipsis;"
                                    >
                                        {{ slotProps.data.Name }}
                                    </span>
                                    <country-flag
                                        v-if="slotProps.data.country"
                                        :alpha2="slotProps.data.country.alpha2"
                                        :title="slotProps.data.country.name"
                                        size="24px"
                                    />
                                </div>
                            </template>
                        </Column>
                    </DataTable>

                    <div
                        style="flex-grow:0;width:150px;font-size:85%;display:flex;flex-direction:column;"
                        class="pl-2"
                    >
                        <div v-if="!selectedEntity">
                            <img-fallback
                                key="sakjhdkjahskjdhksagdiueqgdi"
                                src="images/thumbnail-missing.png"
                                width="130"
                                height="65"
                            />
                        </div>
                        <div v-else>
                            <img-fallback
                                key="sakjhdkjahskjdhksagdiueqgdsadusaodho8qowq"
                                :src="`${PACKAGES_PATH}${selectedEntity.Path}_rot.gif`"
                                :fallback="[`${PACKAGES_PATH}${selectedEntity.Path}.gif`,'images/thumbnail-missing.png']"
                                width="130"
                                height="65"
                            />
                            {{ selectedEntity.Name }}
                            <Dropdown
                                v-if="selectedEntity.loadouts.length"
                                v-model="selectedEntityLoadout"
                                class="p-mt-4 p-dropdown-sm"
                                style="width:100%;"
                                label="Loadout"
                                :options="selectedEntity.loadouts"
                                option-label="name"
                                option-value="name"
                                return-object
                            />
                        </div>
                    </div>
                </div>

                <div
                    class="mt-2"
                    style="width:100%;display:flex;justify-content: flex-end;"
                >
                    <Button
                        class="p-button-xsm"
                        :disabled="!canCreateEntity"
                        @click="placeEntity({empty:true})"
                    >
                        Place Empty
                    </Button>
                    <Button
                        class="p-ml-2 p-button-xsm"
                        :disabled="!canCreateEntity"
                        @click="placeEntity"
                    >
                        Place
                    </Button>
                </div>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import 'flag-icon-css/sass/flag-icon.scss';

import {TITAN_MUTATION} from '@/assets/js/store/titan-manager.js';
import TitanUtils, { $tCrewInterface, PACKAGES_PATH, } from '@/assets/js/titan/titan-utils.js';

import Button from 'primevue/button';
import ToggleButton from 'primevue/togglebutton';
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import MultiSelect from 'primevue/multiselect';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import ImgFallback from '@/components/common/cse/core/ImgFallback.vue';
import CountryFlag from '@/components/common/cse/core/CountryFlag.vue';

const BLUEPRINT_VALUE = {
    TYPE:
    {
        ANY: '*',
        CHARACTER: 'character',
        VEHICLE: 'vehicle',
        SCENERY: 'scenery',
        ITEMS: 'items',
    },
    SUBTYPE:
    {
        // character --> ?
        MILITARY: 'military',
        CIVILIAN: 'civilian',
        ANIMAL: 'animal',
        // vehicle --> ?
        AIR: 'air',
        LAND: 'land',
        SEA: 'sea',
        // scenery --> ?
        BUILDING: 'building',
        INFRASTRUCTURE: 'infrastructure',
        NATURE: 'nature',
        // items --> ?
        EQUIPMENT: 'equipment',
        HOUSING: 'housing',
        CLUTTER: 'clutter',
    },
    DETAIL:
    {
        // character -> military / civilian / animal
        MALE: 'male',
        FEMALE: 'female',
        // vehicle -> air --> ?
        ROTORWING: 'rotorwing',
        FIXEDWING: 'fixedwing',
        SPACE: 'space',
        // vehicle -> land --> ?
        WHEELED: 'wheeled',
        TRACKED: 'tracked',
        STATIC: 'static',
        // vehicle -> sea --> ?
        SURFACE: 'surface',
        SUBSURFACE: 'subsurface',
        AMPHIBIOUS: 'amphibious',
    },
};


// eslint-disable-next-line no-unused-vars
const SUBTYPE_FILTER_OPTIONS = {
    [BLUEPRINT_VALUE.TYPE.CHARACTER]:[
        {label:'Military', value:BLUEPRINT_VALUE.SUBTYPE.MILITARY},
        {label:'Civilian', value:BLUEPRINT_VALUE.SUBTYPE.CIVILIAN},
        {label:'Animal', value:BLUEPRINT_VALUE.SUBTYPE.ANIMAL},
    ],
    [BLUEPRINT_VALUE.TYPE.VEHICLE]:[
        {label:'Land', value:BLUEPRINT_VALUE.SUBTYPE.LAND},
        {label:'Sea', value:BLUEPRINT_VALUE.SUBTYPE.SEA},
        {label:'Air', value:BLUEPRINT_VALUE.SUBTYPE.AIR},
    ],
    [BLUEPRINT_VALUE.TYPE.SCENERY]:[
        {label:'Building', value:BLUEPRINT_VALUE.SUBTYPE.BUILDING},
        {label:'Infrastructure', value:BLUEPRINT_VALUE.SUBTYPE.INFRASTRUCTURE},
        {label:'Nature', value:BLUEPRINT_VALUE.SUBTYPE.NATURE},
    ],
    [BLUEPRINT_VALUE.TYPE.ITEMS]:[
        {label:'Equipment', value:BLUEPRINT_VALUE.SUBTYPE.EQUIPMENT},
        {label:'Housing', value:BLUEPRINT_VALUE.SUBTYPE.HOUSING},
        {label:'Clutter', value:BLUEPRINT_VALUE.SUBTYPE.CLUTTER},
    ],
};

const DETAIL_FILTER_OPTIONS = {
    [BLUEPRINT_VALUE.SUBTYPE.CHARACTER]:[
        {label:'Male', value:BLUEPRINT_VALUE.DETAIL.MALE},
        {label:'Female', value:BLUEPRINT_VALUE.DETAIL.FEMALE},
    ],
    [BLUEPRINT_VALUE.SUBTYPE.AIR]:[
        {label:'Rotary', value:BLUEPRINT_VALUE.DETAIL.ROTORWING},
        {label:'Fixed', value:BLUEPRINT_VALUE.DETAIL.FIXEDWING},
        {label:'Space', value:BLUEPRINT_VALUE.DETAIL.SPACE},
    ],
    [BLUEPRINT_VALUE.SUBTYPE.LAND]:[
        {label:'Wheeled', value:BLUEPRINT_VALUE.DETAIL.WHEELED},
        {label:'Tracked', value:BLUEPRINT_VALUE.DETAIL.TRACKED},
        {label:'Static', value:BLUEPRINT_VALUE.DETAIL.STATIC},
    ],
    [BLUEPRINT_VALUE.SUBTYPE.SEA]:[
        {label:'Surface', value:BLUEPRINT_VALUE.DETAIL.SURFACE},
        {label:'Sub', value:BLUEPRINT_VALUE.DETAIL.SUBSURFACE},
        {label:'Amphib', value:BLUEPRINT_VALUE.DETAIL.AMPHIBIOUS},
    ],
};

const ACTIVE_FILTER_BUTTON_COLOR = '#003055';
const ACTIVE_VERIFIED_BUTTON_COLOR = '#005530';

export default {
    name: 'entity-selector2',
    components:
    {
        Button, ToggleButton, SelectButton, Dropdown, InputText, MultiSelect, DataTable, Column,
        ImgFallback, CountryFlag,
    },
    data()
    {
        return {
            searchText: '',
            verifiedOnly: false,
            entitiesObjects: 'entities',
            typeFilter: BLUEPRINT_VALUE.TYPE.ANY,
            characterSubtype: null,
            characterSubtypeOptions: SUBTYPE_FILTER_OPTIONS[BLUEPRINT_VALUE.TYPE.CHARACTER],
            vehicleSubtype: null,
            vehicleSubtypeOptions: SUBTYPE_FILTER_OPTIONS[BLUEPRINT_VALUE.TYPE.VEHICLE],
            scenerySubtype: null,
            scenerySubtypeOptions: SUBTYPE_FILTER_OPTIONS[BLUEPRINT_VALUE.TYPE.SCENERY],
            itemsSubtype: null,
            itemsSubtypeOptions: SUBTYPE_FILTER_OPTIONS[BLUEPRINT_VALUE.TYPE.ITEMS],
            characterDetailFilter: null,
            characterDetailOptions: DETAIL_FILTER_OPTIONS[BLUEPRINT_VALUE.SUBTYPE.CHARACTER],
            vehicleDetailFilter: null,
            // vehicleDetailOptions is a computed value, depends on vehicle subtype
            countryFilter: [],
            entityFilterUpdating: false,
            tableSelection: null,
            selectedEntityLoadout: null,
            vehicleSubtype2: null, // required for toggling of vehicleSubtype filter button appearance
            vehicleDetailFilter2: null, // required for toggling of vehicleSubtype filter button appearance
            characterSubtype2: null, // required for toggling of characterSubtype filter button appearance
            scenerySubtype2: null, // required for toggling of scenerySubtype filter button appearance
            itemsSubtype2: null, // required for toggling of itemsSubtype filter button appearance
            characterDetailFilter2: null, // required for toggling of vehicleSubtype filter button appearance
            PACKAGES_PATH,
            BLUEPRINT_VALUE,
            ACTIVE_FILTER_BUTTON_COLOR,
            ACTIVE_VERIFIED_BUTTON_COLOR,
        };
    },
    computed:
    {
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        entityCountries() { return this.$store.getters.titanEntityCountries; },

        selectedEntity() { return this.$store.getters.getEntitySelectorSelection; },
        gizmoPos() { return this.$store.getters.gizmoPos; },
        canCreateEntity() { return this.gizmoPos !== null && this.selectedEntity !== null; },

        allowEntities() { return this.entitiesObjects === 'entities'; },
        allowObjects() { return this.entitiesObjects === 'objects'; },

        isTypeAny() { return this.typeFilter === BLUEPRINT_VALUE.TYPE.ANY; },
        isTypeCharacter() { return this.typeFilter === BLUEPRINT_VALUE.TYPE.CHARACTER; },
        isTypeVehicle() { return this.typeFilter === BLUEPRINT_VALUE.TYPE.VEHICLE; },
        isTypeScenery() { return this.typeFilter === BLUEPRINT_VALUE.TYPE.SCENERY; },
        isTypeItem() { return this.typeFilter === BLUEPRINT_VALUE.TYPE.ITEMS; },
        allowCharacterTypes() { return this.allowEntities && (this.isTypeAny || this.isTypeCharacter); },
        allowVehicleTypes() { return this.allowEntities && (this.isTypeAny || this.isTypeVehicle ); },
        allowSceneryTypes() { return this.allowObjects && (this.isTypeAny || this.isTypeScenery); },
        allowItemsTypes() { return this.allowObjects && (this.isTypeAny || this.isTypeItem); },

        vehicleDetailOptions()
        {
            if(!this.vehicleSubtype)
            {
                // fillers in the case that no vehicle subtype is specified - in this caes
                // there's no way to determine which detail options to provide. We *could*
                // show all 9 possible options, but there's screen real estate prevents us
                // from doing so, at least without switching to a drop-down list or
                // something like that, and it would probably be ugly if we did.
                return [{label:'-', value:1},{label:'-', value:2}, {label:'-', value:3}];
            }
            return DETAIL_FILTER_OPTIONS[this.vehicleSubtype];
        },

        verificationFilteredEntities()
        {
            let filtered = this.entityDescriptors;
            if(this.verifiedOnly)
            {
                filtered = filtered.filter(x => x.Verification !== undefined && x.Verification > 0);
            }
            return filtered;
        },

        typeFilteredEntities()
        {
            let filtered = this.verificationFilteredEntities;
            if(this.allowEntities)
            {
                filtered = filtered.filter(x =>
                {
                    const type = x.BlueprintMap.type;
                    return type === BLUEPRINT_VALUE.TYPE.CHARACTER || type === BLUEPRINT_VALUE.TYPE.VEHICLE;
                });
            }
            else if(this.allowObjects)
            {
                filtered = filtered.filter(x =>
                {
                    const type = x.BlueprintMap.type;
                    return type === BLUEPRINT_VALUE.TYPE.SCENERY || type === BLUEPRINT_VALUE.TYPE.ITEMS;
                });
            }

            if(!this.isTypeAny)
            {
                filtered = filtered.filter(x => x.BlueprintMap.type === this.typeFilter);
            }

            return filtered;
        },
        /**
         * NOTE: chains onward from typeFilteredEntities
         */
        subtypeFilteredEntities()
        {
            let filtered =this.typeFilteredEntities;

            let filter = [];
            if(this.allowCharacterTypes && this.characterSubtype)
            {
                filter.push(''+this.characterSubtype);
            }
            if(this.allowVehicleTypes && this.vehicleSubtype)
            {
                filter.push(''+this.vehicleSubtype);
            }
            if(this.allowSceneryTypes && this.scenerySubtype)
            {
                filter.push(''+this.scenerySubtype);
            }
            if(this.allowItemsTypes && this.itemsSubtype)
            {
                filter.push(''+this.itemsSubtype);
            }

            if(filter.length)
            {
                filtered = filtered.filter(x =>
                {
                    return filter.some(subtype => subtype === x.BlueprintMap.subtype);
                });
            }

            return filtered;
        },
        /**
         * NOTE: chains onward from subtypeFilteredEntities
         */
        detailFilteredEntities()
        {
            let filter = [];
            if(this.allowCharacterTypes && this.characterDetailFilter)
            {
                filter.push('' + this.characterDetailFilter);
            }
            if(this.allowVehicleTypes && this.vehicleDetailFilter)
            {
                filter.push('' + this.vehicleDetailFilter);
            }
            if(this.allowSceneryTypes && this.sceneryDetailFilter)
            {
                filter.push('' + this.sceneryDetailFilter);
            }
            if(this.allowItemsTypes && this.itemsDetailFilter)
            {
                filter.push('' + this.itemsDetailFilter);
            }

            let filtered =this.subtypeFilteredEntities;
            if(filter.length)
            {
                filtered = filtered.filter(x =>
                {
                    return filter.some(detail => detail === x.BlueprintMap.detail);
                });
            }

            return filtered;
        },
        /**
         * NOTE: chains onward from detailFilteredEntities
         */
        countryFilteredEntities()
        {
            let filtered =this.detailFilteredEntities;
            if(this.countryFilter.length)
            {
                filtered = filtered.filter(x =>
                {
                    if(x.country && x.country.numeric)
                    {
                        // do any of the countries in the filter match the entities country?
                        return this.countryFilter.some(country => country.numeric === x.country.numeric);
                    }
                    return false;
                });
            }
            return filtered;
        },
        /**
         * NOTE: chains onward from countryFilteredEntities
         */
        textFilteredEntities()
        {
            let filtered =this.countryFilteredEntities;
            const searchText = this.searchText || '';
            if(searchText.length > 0)
            {
                const lCaseFilter = this.searchText.toLowerCase();
                filtered = filtered.filter(x=>x.normalizedName.indexOf(lCaseFilter)!==-1);
            }
            filtered = filtered.sort((a,b)=>a.normalizedName > b.normalizedName ? 1 : -1);

            return filtered;
        },
        /**
         * NOTE: chains onward from textFilteredEntities
         */
        filteredEntities()
        {
            return this.textFilteredEntities;
        },
    },
    watch:
    {
        allowEntities()
        {
            this.typeFilter = BLUEPRINT_VALUE.TYPE.ANY;
            this.characterSubtype = null;
            this.characterDetailFilter = null;
            this.vehicleSubtype = null;
            this.vehicleDetailFilter = null;
            this.scenerySubtype = null;
            this.itemSubtype = null;
        },
        allowObjects()
        {
            this.typeFilter = BLUEPRINT_VALUE.TYPE.ANY;
            this.characterSubtype = null;
            this.characterDetailFilter = null;
            this.vehicleSubtype = null;
            this.vehicleDetailFilter = null;
            this.scenerySubtype = null;
            this.itemSubtype = null;
        },
        entitiesObjects(newValue)
        {
            if(newValue === 'entities')
            {
                this.characterSubtype = null;
                this.characterDetailFilter = null;
                this.characterDetailFilter2 = null;
            }
        },
        allowCharacterTypes(newValue)
        {
            if(!newValue)
            {
                this.characterSubtype = null;
                this.characterDetailFilter = null;
                this.characterDetailFilter2 = null;
            }
        },
        allowVehicleTypes(newValue)
        {
            if(!newValue)
            {
                this.vehicleSubtype = null;
                this.vehicleSubtype2 = null;
            }
        },
        vehicleSubtype()
        {
            this.vehicleDetailFilter = null;
            this.vehicleDetailFilter2 = null;
        },
        allowSceneryTypes(newValue)
        {
            if(!newValue)
            {
                this.scenerySubtype = null;
                this.scenerySubtype2 = null;
            }
        },
        allowItemsTypes(newValue)
        {
            if(!newValue)
            {
                this.itemsSubtype = null;
                this.itemsSubtype2 = null;
            }
        },
        selectedEntity(newValue)
        {
            const loadouts = (newValue && newValue.loadouts.length) ? newValue.loadouts : [];
            this.selectedEntityLoadout = loadouts.length ? loadouts[0].name : null;
        },
    },
    beforeDestroy()
    {
        this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_CLEAR_SELECTION);
    },
    methods:
    {
        updateTypeFilter(typeFilterValue)
        {
            this.typeFilter = (this.typeFilter !== typeFilterValue) ? typeFilterValue : BLUEPRINT_VALUE.TYPE.ANY;
        },
        selectEntity(evt)
        {
            const entity = evt.data;
            this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_SET_SELECTION, entity);
        },
        placeEntity(opts={empty:false})
        {
            const gizmoPos = this.$store.getters.gizmoPos;
            if(gizmoPos && this.selectedEntity)
            {
                // create an entity at the location
                const entity =TitanUtils.createEntity(this.selectedEntity.entityName, gizmoPos);
                if(entity && opts.empty)
                {
                    // Ermagerd... this seems bad...? From the original Titan code:
                    //     this must be called immediately, to prevent crew getting spawned
                    //     momentarily before being deleted by 'clear' method the 'clear'
                    //     method may be called before entity loading is complete
                    $tCrewInterface.clear(entity.getGUID());
                }
            }
        },
        updateVehicleSubtypeFilter(evt)
        {
            this.vehicleSubtype = (evt === this.vehicleSubtype) ? null : evt;
            setTimeout(()=>{this.vehicleSubtype2 = this.vehicleSubtype;}, 100);
        },
        updateItemsSubtypeFilter(evt)
        {
            this.itemsSubtype = (evt === this.itemsSubtype) ? null : evt;
            setTimeout(()=>{this.itemsSubtype2 = this.itemsSubtype;}, 100);
        },
        updateVehicleDetailFilter(evt)
        {
            this.vehicleDetailFilter = (evt === this.vehicleDetailFilter) ? null : evt;
            setTimeout(()=>{this.vehicleDetailFilter2 = this.vehicleDetailFilter;}, 100);
        },
        updateCharacterSubtypeFilter(evt)
        {
            this.characterSubtype = (evt === this.characterSubtype) ? null : evt;
            setTimeout(()=>{this.characterSubtype2 = this.characterSubtype;}, 100);
        },
        updateScenerySubtypeFilter(evt)
        {
            this.scenerySubtype = (evt === this.scenerySubtype) ? null : evt;
            setTimeout(()=>{this.scenerySubtype2 = this.scenerySubtype;}, 100);
        },
        updateCharacterDetailFilter(evt)
        {
            this.characterDetailFilter = (evt === this.characterDetailFilter) ? null : evt;
            setTimeout(()=>{this.characterDetailFilter2 = this.characterDetailFilter;}, 100);
        },
    }
};
</script>

<style lang="scss">
@import '@/assets/scss/utilities/_all.scss';
.entityListItem
{
    &.selected
    {
        background-color: $menu-bg-active !important;
    }
}

.filter-buttons-container
{
    .header { grid-area: header; }
    .left-filters-container, .right-filters-container {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 1px 1px;
        grid-template-areas: "." "." ".";
        grid-area: left-filters-container;
    }
    .left-filters-container { grid-area: left-filters-container; }
    .right-filters-container { grid-area: right-filters-container; }

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0.25fr 1fr;
    gap: 2px 2px;
    grid-template-areas:
    "header header"
    "left-filters-container right-filters-container";
}
</style>