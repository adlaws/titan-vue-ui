<template>
    <cse-desktop-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="485"
        :height="505"
        :closable="false"
        :resizable="true"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <div class="grid-container">
                    <div class="header">
                        <v-btn-toggle
                            v-model="entitiesObjects"
                            mandatory
                        >
                            <v-btn
                                x-small
                                class="ellipsis-overflow no-text-transform"
                                :color="(entitiesObjects==='entities')?'primary':''"
                                value="entities"
                            >
                                Entities
                            </v-btn>
                            <v-btn
                                x-small
                                class="ellipsis-overflow no-text-transform"
                                :color="(entitiesObjects==='objects')?'primary':''"
                                value="objects"
                            >
                                Objects
                            </v-btn>
                        </v-btn-toggle>
                        <v-btn
                            x-small
                            class="float-right"
                            :color="verifiedOnly?'success':''"
                            :class="{'v-btn--active': verifiedOnly}"
                            @click="verifiedOnly=!verifiedOnly"
                        >
                            Verified
                        </v-btn>
                    </div>
                    <div class="CharactersScenery">
                        <v-btn
                            x-small
                            class="ellipsis-overflow no-text-transform"
                            :color="(allowEntities?isTypeCharacter:isTypeScenery)?'primary':''"
                            :class="{'v-btn--active': (allowEntities?isTypeCharacter:isTypeScenery)}"
                            @click="updateTypeFilter(allowEntities?BLUEPRINT_VALUE.TYPE.CHARACTER:BLUEPRINT_VALUE.TYPE.SCENERY)"
                        >
                            {{ allowEntities?'Characters':'Scenery' }}
                        </v-btn>
                        <v-btn-toggle
                            v-if="allowEntities"
                            v-model="characterSubtype"
                            style="display:flex;"
                        >
                            <v-btn
                                v-for="(option, idx) in characterSubtypeOptions"
                                :key="`character-subtype-${idx}`"
                                x-small
                                :color="(characterSubtype===option.value)?'primary':''"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/characterSubtypeOptions.length)}%;`"
                                :value="option.value"
                                :disabled="!allowCharacterTypes"
                            >
                                {{ option.label }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-btn-toggle
                            v-if="allowObjects"
                            v-model="scenerySubtype"
                            style="display:flex;"
                        >
                            <v-btn
                                v-for="(option, idx) in scenerySubtypeOptions"
                                :key="`scenery-subtype-${idx}`"
                                x-small
                                :color="(scenerySubtype===option.value)?'primary':''"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/scenerySubtypeOptions.length)}%;`"
                                :value="option.value"
                                :disabled="!allowSceneryTypes"
                            >
                                {{ option.label }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-btn-toggle
                            v-if="allowEntities"
                            v-model="characterDetailFilter"
                            style="display:flex;"
                        >
                            <v-btn
                                v-for="(option, idx) in characterDetailOptions"
                                :key="`character-detail-${idx}`"
                                x-small
                                :color="(characterDetailFilter===option.value)?'primary':''"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/characterDetailOptions.length)}%;`"
                                :value="option.value"
                                :disabled="!allowCharacterTypes"
                            >
                                {{ option.label }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                    <div class="VehiclesItems">
                        <v-btn
                            x-small
                            class="ellipsis-overflow no-text-transform"
                            :class="{'v-btn--active': (allowEntities?isTypeVehicle:isTypeItem)}"
                            :color="(allowEntities?isTypeVehicle:isTypeItem)?'primary':''"
                            @click="updateTypeFilter(allowEntities?BLUEPRINT_VALUE.TYPE.VEHICLE:BLUEPRINT_VALUE.TYPE.ITEMS)"
                        >
                            {{ allowEntities?'Vehicles':'Items' }}
                        </v-btn>
                        <v-btn-toggle
                            v-if="allowEntities"
                            v-model="vehicleSubtype"
                            style="display:flex;"
                        >
                            <v-btn
                                v-for="(option, idx) in vehicleSubtypeOptions"
                                :key="`vehicle-subtype-${idx}`"
                                x-small
                                :color="(vehicleSubtype===option.value)?'primary':''"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/vehicleSubtypeOptions.length)}%;`"
                                :value="option.value"
                                :disabled="!allowVehicleTypes"
                            >
                                {{ option.label }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-btn-toggle
                            v-else-if="allowObjects"
                            v-model="itemsSubtype"
                            style="display:flex;"
                        >
                            <v-btn
                                v-for="(option, idx) in itemsSubtypeOptions"
                                :key="`vehicle-subtype-${idx}`"
                                x-small
                                :color="(itemsSubtype===option.value)?'primary':''"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/itemsSubtypeOptions.length)}%;`"
                                :value="option.value"
                                :disabled="!allowItemsTypes"
                            >
                                {{ option.label }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-btn-toggle
                            v-if="allowEntities"
                            v-model="vehicleDetailFilter"
                            style="display:flex;"
                        >
                            <v-btn
                                v-for="(option, idx) in vehicleDetailOptions"
                                :key="`vehicle-detail-${idx}`"
                                x-small
                                :color="(vehicleDetailFilter===option.value)?'primary':''"
                                class="ellipsis-overflow no-text-transform"
                                style="flex-grow:1;"
                                :style="`max-width:${(100/vehicleDetailOptions.length)}%;`"
                                :value="option.value"
                                :disabled="!allowVehicleTypes || !vehicleSubtype"
                            >
                                {{ option.label }}
                            </v-btn>
                        </v-btn-toggle>
                    </div>
                </div>

                <v-form dense class="compact">
                    <v-select
                        v-model="countryFilter"
                        label="Countries"
                        item-value="numeric"
                        dense
                        attach
                        chips
                        multiple
                        clearable
                        :items="entityCountries"
                    >
                        <template v-slot:selection="{ item, index }">
                            <v-chip
                                v-if="index < 4"
                                small
                                close
                                @click:close="countryFilter.splice(index,1)"
                            >
                                <country-flag class="mr-2" :alpha2="item.alpha2" />
                                {{ item.name }}
                            </v-chip>
                            <span
                                v-if="index > 4"
                                class="grey--text caption"
                            >
                                (and {{ countryFilter.length - 5 }} more)
                            </span>
                        </template>
                        <template v-slot:item="{ item, attrs }">
                            <v-checkbox
                                :value="attrs.inputValue"
                            />
                            <country-flag class="mr-2" :alpha2="item.alpha2" />
                            {{ item.name }}
                        </template>
                    </v-select>

                    <v-text-field
                        v-model="searchText"
                        label="Search"
                        clearable
                        append-icon="mdi-magnify"
                    />
                </v-form>

                <v-virtual-scroll
                    class="no-divider"
                    :bench="15"
                    :items="filteredEntities"
                    height="256"
                    item-height="32px"
                >
                    <template v-slot:default="{ item }">
                        <v-list-item
                            :key="item.entityName"
                            dense
                            class="entityListItem"
                            :class="{selected: item.entityName===(selectedEntity&&selectedEntity.entityName)}"
                            @click="selectEntity(item)"
                        >
                            <v-list-item-content>
                                <v-list-item-title>
                                    <div style="display:flex;align-items: center;">
                                        <img-fallback
                                            :src="`${PACKAGES_PATH}${item.Path}.gif`"
                                            fallback="images/thumbnail-missing.gif"
                                            width="48"
                                            height="24"
                                            class="mr-2"
                                        />
                                        <span style="flex-grow:1;max-width:330px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                                            {{ item.Name }}
                                        </span>
                                        <v-spacer />
                                        <country-flag
                                            v-if="item.country"
                                            :alpha2="item.country.alpha2"
                                            :title="item.country.name"
                                            size="24px"
                                        />
                                    </div>
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider />
                    </template>
                </v-virtual-scroll>
                <div
                    class="mt-2"
                    style="width:100%;display:flex;justify-content: flex-end;"
                >
                    <v-btn
                        color="secondary"
                        x-small
                    >
                        Place Empty
                    </v-btn>
                    <v-btn
                        color="primary"
                        x-small
                        class="ml-2"
                    >
                        Place
                    </v-btn>
                </div>
            </cse-desktop-window-content>
        </template>
    </cse-desktop-window>
</template>

<script>
import 'flag-icon-css/sass/flag-icon.scss';

import {TITAN_MUTATION} from '@/assets/js/store/titan-manager.js';

import { PACKAGES_PATH } from '@/assets/js/titan/titan-utils.js';

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
        };
    },
    computed:
    {
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        entityCountries() { return this.$store.getters.titanEntityCountries; },
        selectedEntity() { return this.$store.getters.getEntitySelectorSelection; },

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
            return DETAIL_FILTER_OPTIONS[this.vehicleSubtype] ||
                [{label:'-', value:false},{label:'-', value:false}, {label:'-', value:false}];
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
                    for(let i=0; i<filter.length;i++)
                    {
                        if(x.BlueprintMap.subtype === filter[i])
                            return true;
                    }
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
                    for(let i=0; i<filter.length;i++)
                    {
                        if(x.BlueprintMap.detail === filter[i])
                            return true;
                    }
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
                    for(let i=0; i<this.countryFilter.length;i++)
                    {
                        if(x.country && x.country.numeric === this.countryFilter[i])
                            return true;
                    }
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

.grid-container
{
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 0.25fr 1fr;
    gap: 2px 2px;
    grid-template-areas:
    "header header"
    "CharactersScenery VehiclesItems";

    .header { grid-area: header; }
    .CharactersScenery {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 1px 1px;
        grid-template-areas:
        "."
        "."
        ".";
        grid-area: CharactersScenery;
    }
    .VehiclesItems {
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        gap: 1px 1px;
        grid-template-areas:
        "."
        "."
        ".";
        grid-area: VehiclesItems;
    }
}
</style>