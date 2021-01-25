<template>
    <cse-desktop-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="600"
        :height="600"
        :closable="false"
        :resizable="false"
    >
        <template #default="context">
            <cse-desktop-window-content :cse-desktop-window="context.cseDesktopWindow">
                <v-btn-toggle
                    v-model="entityObjectsGroups"
                    mandatory
                >
                    <v-btn
                        small
                        value="entities"
                    >
                        Entities
                    </v-btn>
                    <v-btn
                        small
                        value="objects"
                    >
                        Objects
                    </v-btn>
                    <v-btn
                        small
                        value="groups"
                    >
                        Groups
                    </v-btn>
                </v-btn-toggle>
                <hr>
                <v-btn-toggle
                    v-model="typeFilter"
                    mandatory
                >
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.TYPE.ANY"
                    >
                        All
                    </v-btn>
                    <v-btn
                        v-if="allowEntities"
                        small
                        :value="BLUEPRINT_VALUE.TYPE.CHARACTER"
                    >
                        Characters
                    </v-btn>
                    <v-btn
                        v-if="allowEntities"
                        small
                        :value="BLUEPRINT_VALUE.TYPE.VEHICLE"
                    >
                        Vehicles
                    </v-btn>
                    <v-btn
                        v-if="allowObjects"
                        small
                        :value="BLUEPRINT_VALUE.TYPE.SCENERY"
                    >
                        Scenery
                    </v-btn>
                    <v-btn
                        v-if="allowObjects"
                        small
                        :value="BLUEPRINT_VALUE.TYPE.ITEMS"
                    >
                        Items
                    </v-btn>
                </v-btn-toggle>
                <hr>
                <v-btn-toggle
                    v-if="allowEntities"
                    v-model="characterSubtype"
                >
                    <v-btn
                        v-for="(option, idx) in characterSubtypeOptions"
                        :key="`character-subtype-${idx}`"
                        small
                        :value="option.value"
                        :disabled="!allowCharacterTypes"
                    >
                        {{ option.label }}
                    </v-btn>
                </v-btn-toggle>
                <v-btn-toggle
                    v-if="allowEntities"
                    v-model="vehicleSubtype"
                    disabled
                >
                    <v-btn
                        v-for="(option, idx) in vehicleSubtypeOptions"
                        :key="`vehicle-subtype-${idx}`"
                        small
                        :value="option.value"
                        :disabled="!allowVehicleTypes"
                    >
                        {{ option.label }}
                    </v-btn>
                </v-btn-toggle>
                <v-btn-toggle
                    v-if="allowObjects"
                    v-model="scenerySubtype"
                    disabled
                >
                    <v-btn
                        v-for="(option, idx) in scenerySubtypeOptions"
                        :key="`scenery-subtype-${idx}`"
                        small
                        :value="option.value"
                        :disabled="!allowSceneryTypes"
                    >
                        {{ option.label }}
                    </v-btn>
                </v-btn-toggle>
                <v-btn-toggle
                    v-if="allowObjects"
                    v-model="itemsSubtype"
                    disabled
                >
                    <v-btn
                        v-for="(option, idx) in itemsSubtypeOptions"
                        :key="`vehicle-subtype-${idx}`"
                        small
                        :value="option.value"
                        :disabled="!allowItemsTypes"
                    >
                        {{ option.label }}
                    </v-btn>
                </v-btn-toggle>
                <hr>
                <v-btn-toggle
                    v-if="allowEntities"
                    v-model="characterDetailFilter"
                >
                    <v-btn
                        v-for="(option, idx) in characterDetailOptions"
                        :key="`character-detail-${idx}`"
                        small
                        :value="option.value"
                        :disabled="!allowCharacterTypes"
                    >
                        {{ option.label }}
                    </v-btn>
                </v-btn-toggle>
                <v-btn-toggle
                    v-if="allowEntities"
                    v-model="vehicleDetailFilter"
                >
                    <v-btn
                        v-for="(option, idx) in vehicleDetailOptions"
                        :key="`vehicle-detail-${idx}`"
                        small
                        :value="option.value"
                        :disabled="!allowVehicleTypes || !vehicleSubtype"
                    >
                        {{ option.label }}
                    </v-btn>
                </v-btn-toggle>
                <hr>
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
                        :items="countries"
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
                    :bench="5"
                    :items="filteredEntities"
                    height="310"
                    item-height="60"
                >
                    <template v-slot:default="{ item }">
                        <v-list-item
                            :key="item.entityName"
                            class="entityListItem"
                            :class="{selected: item.entityName===(selectedEntity&&selectedEntity.entityName)}"
                            @click="selectEntity(item)"
                        >
                            <v-list-item-content>
                                <v-list-item-title>
                                    <img-fallback
                                        :src="`${PACKAGES_PATH}${item.Path}.gif`"
                                        fallback="images/thumbnail-missing.gif"
                                        width="64"
                                        height="32"
                                    />
                                    {{ item.Name }}
                                    <country-flag
                                        v-if="item.country"
                                        :alpha2="item.country.alpha2"
                                        :title="item.country.name"
                                        class="float-right"
                                        size="32px"
                                    />
                                </v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider />
                    </template>
                </v-virtual-scroll>
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
            isDragging: false,
            searchText: '',
            entityObjectsGroups: 'entities',
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
        selectedEntity() { return this.$store.getters.getEntitySelectorSelection; },

        countries()
        {
            const entitiesWithCountry = this.entityDescriptors.filter(x=>x.country);
            const uniqueCountries = [];
            const alpha2codes = new Set();
            for(let idx=0; idx<entitiesWithCountry.length; idx++)
            {
                const entityCountry = entitiesWithCountry[idx].country;
                if(!alpha2codes.has(entityCountry.alpha2))
                {
                    alpha2codes.add(entityCountry.alpha2);
                    uniqueCountries.push(entityCountry);
                }

            }
            uniqueCountries.sort((a,b)=> a.lcasename < b.lcasename ? -1 : 1);
            return uniqueCountries;
        },

        allowEntities() { return this.entityObjectsGroups === 'entities'; },
        allowObjects() { return this.entityObjectsGroups === 'objects'; },
        allowGroups() { return this.entityObjectsGroups === 'groups'; },

        allowAnyType() { return this.typeFilter === BLUEPRINT_VALUE.TYPE.ANY; },
        allowCharacterTypes() { return this.allowEntities && (this.allowAnyType || this.typeFilter === BLUEPRINT_VALUE.TYPE.CHARACTER); },
        allowVehicleTypes() { return this.allowEntities && (this.allowAnyType || this.typeFilter === BLUEPRINT_VALUE.TYPE.VEHICLE ); },
        allowSceneryTypes() { return this.allowObjects && (this.allowAnyType || this.typeFilter === BLUEPRINT_VALUE.TYPE.SCENERY); },
        allowItemsTypes() { return this.allowObjects && (this.allowAnyType || this.typeFilter === BLUEPRINT_VALUE.TYPE.ITEMS); },

        typeFilteredEntities()
        {
            let filtered = this.entityDescriptors;
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

            if(!this.allowAnyType)
            {
                filtered = filtered.filter(x => x.BlueprintMap.type === this.typeFilter);
            }

            return filtered;
        },
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
        filteredEntities()
        {
            return this.textFilteredEntities;
        },
        selected() { return this.$store.getters.getEntitySelectorSelection; },
        vehicleDetailOptions()
        {
            return DETAIL_FILTER_OPTIONS[this.vehicleSubtype] ||
                [{label:'-', value:false},{label:'-', value:false}, {label:'-', value:false}];
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
        allowGroups()
        {
            this.typeFilter = BLUEPRINT_VALUE.TYPE.ANY;
            this.characterSubtype = null;
            this.characterDetailFilter = null;
            this.vehicleSubtype = null;
            this.vehicleDetailFilter = null;
            this.scenerySubtype = null;
            this.itemSubtype = null;
        },
        entitiesObjectsGroups(newValue)
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
</style>