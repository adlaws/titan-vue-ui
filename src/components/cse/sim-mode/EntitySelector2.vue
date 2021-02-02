<template>
    <cse-desktop-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="485"
        :height="465"
        :closable="false"
        :resizable="true"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <div class="filter-buttons-container">
                    <div class="header">
                        <b-button
                            size="is-small"
                            style="float:right;"
                            :class="{'is-success': verifiedOnly}"
                            @click="verifiedOnly=!verifiedOnly"
                        >
                            Verified
                        </b-button>
                        <b-field
                            class="mb-0"
                        >
                            <b-radio-button
                                v-model="entitiesObjects"
                                native-value="entities"
                                size="is-small"
                                class="ellipsis-overflow no-text-transform"
                            >
                                Entities
                            </b-radio-button>
                            <b-radio-button
                                v-model="entitiesObjects"
                                native-value="objects"
                                size="is-small"
                                class="ellipsis-overflow no-text-transform"
                            >
                                Objects
                            </b-radio-button>
                        </b-field>
                    </div>
                    <div class="left-filters-container">
                        <b-button
                            size="is-small"
                            class="ellipsis-overflow no-text-transform"
                            :class="{'is-primary': (allowEntities?isTypeCharacter:isTypeScenery)}"
                            @click="updateTypeFilter(allowEntities?BLUEPRINT_VALUE.TYPE.CHARACTER:BLUEPRINT_VALUE.TYPE.SCENERY)"
                        >
                            {{ allowEntities?'Characters':'Scenery' }}
                        </b-button>
                        <b-field
                            v-if="allowEntities"
                            class="mb-0"
                        >
                            <b-radio-button
                                v-for="(option, idx) in characterSubtypeOptions"
                                :key="`character-subtype-${idx}`"
                                v-model="characterSubtype"
                                size="is-small"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :class="{'is-primary':(characterSubtype===option.value)}"
                                :style="`max-width:${(100/characterSubtypeOptions.length)}%;`"
                                :native-value="option.value"
                                :disabled="!allowCharacterTypes"
                            >
                                {{ option.label }}
                            </b-radio-button>
                        </b-field>
                        <b-field
                            v-if="allowObjects"
                            class="mb-0"
                        >
                            <b-radio-button
                                v-for="(option, idx) in scenerySubtypeOptions"
                                :key="`scenery-subtype-${idx}`"
                                v-model="scenerySubtype"
                                :native-value="option.value"
                                size="is-small"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :class="{'is-primary':(scenerySubtype===option.value)}"
                                :style="`max-width:${(100/scenerySubtypeOptions.length)}%;`"
                                :disabled="!allowSceneryTypes"
                            >
                                {{ option.label }}
                            </b-radio-button>
                        </b-field>
                        <b-field
                            v-if="allowEntities"
                            class="mb-0"
                        >
                            <b-radio-button
                                v-for="(option, idx) in characterDetailOptions"
                                :key="`character-detail-${idx}`"
                                v-model="characterDetailFilter"
                                :native-value="option.value"
                                size="is-small"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :class="{'is-primary':(characterDetailFilter===option.value)}"
                                :style="`max-width:${(100/characterDetailOptions.length)}%;`"
                                :disabled="!allowCharacterTypes"
                            >
                                {{ option.label }}
                            </b-radio-button>
                        </b-field>
                    </div>
                    <div class="right-filters-container">
                        <b-button
                            size="is-small"
                            class="ellipsis-overflow no-text-transform"
                            :class="{'is-primary': (allowEntities?isTypeVehicle:isTypeItem)}"
                            :color="(allowEntities?isTypeVehicle:isTypeItem)?ACTIVE_FILTER_BUTTON_COLOR:''"
                            @click="updateTypeFilter(allowEntities?BLUEPRINT_VALUE.TYPE.VEHICLE:BLUEPRINT_VALUE.TYPE.ITEMS)"
                        >
                            {{ allowEntities?'Vehicles':'Items' }}
                        </b-button>
                        <b-field
                            v-if="allowEntities"
                            class="mb-0"
                        >
                            <b-radio-button
                                v-for="(option, idx) in vehicleSubtypeOptions"
                                :key="`vehicle-subtype-${idx}`"
                                v-model="vehicleSubtype"
                                :native-value="option.value"
                                size="is-small"
                                :class="{'is-primary':(vehicleSubtype===option.value)}"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/vehicleSubtypeOptions.length)}%;`"
                                :disabled="!allowVehicleTypes"
                            >
                                {{ option.label }}
                            </b-radio-button>
                        </b-field>
                        <b-field
                            v-else-if="allowObjects"
                            class="mb-0"
                        >
                            <b-button
                                v-for="(option, idx) in itemsSubtypeOptions"
                                :key="`vehicle-subtype-${idx}`"
                                v-model="itemsSubtype"
                                :native-value="option.value"
                                size="is-small"
                                :class="{'is-primary':(itemsSubtype===option.value)}"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/itemsSubtypeOptions.length)}%;`"
                                :disabled="!allowItemsTypes"
                            >
                                {{ option.label }}
                            </b-button>
                        </b-field>
                        <b-field
                            v-if="allowEntities"
                            class="mb-0"
                        >
                            <b-radio-button
                                v-for="(option, idx) in vehicleDetailOptions"
                                :key="`vehicle-detail-${idx}`"
                                v-model="vehicleDetailFilter"
                                :native-value="option.value"
                                size="is-small"
                                :class="{'is-primary':(vehicleDetailFilter===option.value)}"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/vehicleDetailOptions.length)}%;`"
                                :disabled="!allowVehicleTypes || !vehicleSubtype"
                            >
                                {{ option.label }}
                            </b-radio-button>
                        </b-field>
                    </div>
                </div>

                <!-- NOTE: a lot of inline styles here to make the layout work -->
                <!--       it's definitely not ideal, -->
                <div
                    class="columns"
                    style="height:32px;"
                >
                    <div class="column is-6">
                        <b-input
                            v-model="searchText"
                            label="Search"
                            clearable
                            append-icon="magnify"
                        />
                    </div>
                    <div class="column is-6">
                        <b-dropdown
                            v-model="countryFilter"
                            label="Countries"
                            item-value="numeric"
                            dense
                            attach
                            chips
                            multiple
                            clearable
                            :items="entityCountries"
                            style="top:-20px;"
                        >
                            <template v-slot:selection="{ item, index }">
                                <b-chip
                                    v-if="index < 2"
                                    small
                                    close
                                    @click:close="countryFilter.splice(index,1)"
                                >
                                    <country-flag :alpha2="item.alpha2" />
                                </b-chip>
                                <span
                                    v-if="index === 2"
                                    class="grey--text caption"
                                    style="margin-top:16px;font-size:0.65rem !important;"
                                >
                                    +{{ countryFilter.length - 2 }} more
                                </span>
                            </template>
                            <template v-slot:item="{ item, attrs }">
                                <b-checkbox
                                    :value="attrs.inputValue"
                                />
                                <country-flag class="mr-2" :alpha2="item.alpha2" />
                                {{ item.name }}
                            </template>
                        </b-dropdown>
                    </div>
                </div>

                <div
                    style="display:flex;"
                >
                    <b-virtual-scroll
                        class="no-divider ml-0 mr-1"
                        style="flex-grow:0.975;"
                        :bench="15"
                        :items="filteredEntities"
                        height="256"
                        item-height="32px"
                    >
                        <template v-slot:default="{ item }">
                            <b-list-item
                                :key="item.entityName"
                                dense
                                class="entityListItem px-1"
                                :class="{selected: item.entityName===(selectedEntity&&selectedEntity.entityName)}"
                                @click="selectEntity(item)"
                            >
                                <b-list-item-content>
                                    <b-list-item-title>
                                        <div style="display:flex;align-items: center;">
                                            <img-fallback
                                                :src="`${PACKAGES_PATH}${item.Path}.gif`"
                                                fallback="images/thumbnail-missing.png"
                                                width="48"
                                                height="24"
                                                class="mr-1"
                                            />
                                            <span style="flex-grow:1;max-width:205px;overflow:hidden;white-space:nowrap;font-size:85%;text-overflow:ellipsis;">
                                                {{ item.Name }}
                                            </span>
                                            <b-spacer />
                                            <country-flag
                                                v-if="item.country"
                                                :alpha2="item.country.alpha2"
                                                :title="item.country.name"
                                                size="24px"
                                            />
                                        </div>
                                    </b-list-item-title>
                                </b-list-item-content>
                            </b-list-item>
                            <b-divider />
                        </template>
                    </b-virtual-scroll>
                    <div
                        style="flex-grow:0;width:150px;font-size:85%;display:flex;flex-direction:column;"
                        class="pl-2"
                    >
                        <div v-if="!selectedEntity">
                            <img-fallback
                                key="something-unique-001"
                                src="images/thumbnail-missing.png"
                                width="130"
                                height="65"
                            />
                        </div>
                        <div v-else>
                            <img-fallback
                                key="something-unique-002"
                                :src="`${PACKAGES_PATH}${selectedEntity.Path}_rot.gif`"
                                :fallback="[`${PACKAGES_PATH}${selectedEntity.Path}.gif`,'images/thumbnail-missing.png']"
                                width="130"
                                height="65"
                            />
                            {{ selectedEntity.Name }}
                            <b-dropdown
                                v-if="selectedEntity.loadouts.length"
                                class="mt-4"
                                dense
                                label="Loadout"
                                :items="selectedEntity.loadouts"
                                item-text="name"
                                return-object
                            />
                        </div>
                    </div>
                </div>

                <div
                    class="mt-2"
                    style="width:100%;display:flex;justify-content: flex-end;"
                >
                    <b-button
                        color="secondary"
                        size="is-small"
                        :disabled="!canCreateEntity"
                        @click="placeEntity({empty:true})"
                    >
                        Place Empty
                    </b-button>
                    <b-button
                        color="primary"
                        size="is-small"
                        class="ml-2"
                        :disabled="!canCreateEntity"
                        @click="placeEntity"
                    >
                        Place
                    </b-button>
                </div>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import 'flag-icon-css/sass/flag-icon.scss';

import {TITAN_MUTATION} from '@/assets/js/store/titan-manager.js';
import TitanUtils, { $tCrewInterface, PACKAGES_PATH } from '@/assets/js/titan/titan-utils.js';

import CseDesktopWindow from '@/components/common/cse/CseDesktopWindow.vue';
import CseDesktopWindowContent from '@/components/common/cse/CseDesktopWindowContent.vue';
import ImgFallback from '@/components/cse/core/ImgFallback.vue';
import CountryFlag from '@/components/cse/core/CountryFlag.vue';

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
        CseDesktopWindow, CseDesktopWindowContent,
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
                return [{label:'-', value:false},{label:'-', value:false}, {label:'-', value:false}];
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
            let filtered = this.typeFilteredEntities;

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

            let filtered = this.subtypeFilteredEntities;
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
            let filtered = this.detailFilteredEntities;
            if(this.countryFilter.length)
            {
                filtered = filtered.filter(x =>
                {
                    if(x.country && x.country.numeric)
                    {
                        // do any of the countries in the filter match the entities country?
                        return this.countryFilter.some(country => country === x.country.numeric);
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
            let filtered = this.countryFilteredEntities;
            if(this.searchText && this.searchText.length > 0)
            {
                const lCaseFilter = this.searchText.toLowerCase();
                filtered = filtered.filter(x=>x.normalizedName.indexOf(lCaseFilter)!==-1);
            }
            return filtered.sort((a,b)=>a.normalizedName > b.normalizedName ? 1 : -1);
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
            }
        },
        allowCharacterTypes(newValue)
        {
            if(!newValue)
            {
                this.characterSubtype = null;
                this.characterDetailFilter = null;
            }
        },
        allowVehicleTypes(newValue)
        {
            if(!newValue)
            {
                this.vehicleSubtype = null;
            }
        },
        vehicleSubtype()
        {
            this.vehicleDetailFilter = null;
        },
        allowSceneryTypes(newValue)
        {
            if(!newValue)
            {
                this.scenerySubtype = null;
            }
        },
        allowItemsTypes(newValue)
        {
            if(!newValue)
            {
                this.itemsSubtype = null;
            }
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
        selectEntity(entity)
        {
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