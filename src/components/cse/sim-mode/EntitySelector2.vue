<template>
    <cse-desktop-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="600"
        :height="545"
        :closable="false"
        :resizable="false"
        @window-dragstart="handleDragStart"
        @window-dragend="handleDragEnd"
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
                    v-model="charactersAllVehicles"
                    mandatory
                >
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.TYPE.CHARACTER"
                    >
                        Characters
                    </v-btn>
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.TYPE.ANY"
                    >
                        All
                    </v-btn>
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.TYPE.VEHICLE"
                    >
                        Vehicles
                    </v-btn>
                </v-btn-toggle>
                <hr>
                <v-btn-toggle
                    v-model="milCivAnimal"
                >
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.SUBTYPE.MILITARY"
                        :disabled="!allowCharacterTypes"
                    >
                        Military
                    </v-btn>
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.SUBTYPE.CIVILIAN"
                        :disabled="!allowCharacterTypes"
                    >
                        Civilian
                    </v-btn>
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.SUBTYPE.ANIMAL"
                        :disabled="!allowCharacterTypes"
                    >
                        Animal
                    </v-btn>
                </v-btn-toggle>
                ||
                <v-btn-toggle
                    v-model="airLandSea"
                    disabled
                >
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.SUBTYPE.AIR"
                        :disabled="!allowVehicleTypes"
                    >
                        Air
                    </v-btn>
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.SUBTYPE.LAND"
                        :disabled="!allowVehicleTypes"
                    >
                        Land
                    </v-btn>
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.SUBTYPE.SEA"
                        :disabled="!allowVehicleTypes"
                    >
                        Sea
                    </v-btn>
                </v-btn-toggle>
                <hr>
                <v-btn-toggle
                    v-model="maleFemale"
                >
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.DETAIL.MALE"
                        :disabled="!allowCharacterTypes"
                    >
                        Male
                    </v-btn>
                    <v-btn
                        small
                        :value="BLUEPRINT_VALUE.DETAIL.FEMALE"
                        :disabled="!allowCharacterTypes"
                    >
                        Female
                    </v-btn>
                </v-btn-toggle>
                ||
                <v-btn-toggle
                    v-model="airLandSeaFilter"
                >
                    <v-btn
                        small
                        :value="domainOptions[0].value"
                        :disabled="!allowVehicleTypes"
                    >
                        {{ domainOptions[0].label }}
                    </v-btn>
                    <v-btn
                        small
                        :value="domainOptions[1].value"
                        :disabled="!allowVehicleTypes"
                    >
                        {{ domainOptions[1].label }}
                    </v-btn>
                    <v-btn
                        small
                        :value="domainOptions[2].value"
                        :disabled="!allowVehicleTypes"
                    >
                        {{ domainOptions[2].label }}
                    </v-btn>
                </v-btn-toggle>

                <v-text-field
                    v-model="searchText"
                    label="Search"
                    clearable
                    append-icon="mdi-magnify"
                />

                <v-virtual-scroll
                    :bench="5"
                    :items="filteredEntityDescriptors"
                    height="310"
                    item-height="60"
                >
                    <template v-slot:default="{ item }">
                        <v-list-item
                            :key="item.entityName"
                            class="fooglyBoogly"
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

import { PACKAGES_PATH/*, $tLogger*/} from '@/assets/js/titan/titan-utils.js';
import { COUNTRY } from '@/assets/js/utils/countries.js';

import CseDesktopWindow from '@/components/common/cse/CseDesktopWindow.vue';
import CseDesktopWindowContent from '@/components/common/cse/CseDesktopWindowContent.vue';
import ImgFallback from '@/components/cse/core/ImgFallback.vue';

const BLUEPRINT_VALUE = {
    TYPE:
    {
        ANY: '*',
        CHARACTER: 'character',
        VEHICLE: 'vehicle',
    },
    SUBTYPE:
    {
        MILITARY: 'military',
        CIVILIAN: 'civilian',
        ANIMAL: 'animal',
        AIR: 'air',
        LAND: 'land',
        SEA: 'sea',
    },
    DETAIL:
    {
        MALE: 'male',
        FEMALE: 'female',
        ROTORWING: 'rotorwing',
        FIXEDWING: 'fixedwing',
        SPACE: 'space',
        WHEELED: 'wheeled',
        TRACKED: 'tracked',
        STATIC: 'static',
        SURFACE: 'surface',
        SUBSURFACE: 'subsurface',
        AMPHIBIOUS: 'amphib',
    },
};

const DOMAIN_FILTER_OPTIONS = {
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
        ImgFallback,
    },
    data()
    {
        return {
            isDragging: false,
            searchText: '',
            entityObjectsGroups: 'entities',
            charactersAllVehicles: BLUEPRINT_VALUE.TYPE.ANY,
            milCivAnimal: null,
            maleFemale: null,
            airLandSea: null,
            airLandSeaFilter: null,
            PACKAGES_PATH,
            BLUEPRINT_VALUE,
        };
    },
    computed:
    {
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        selectedEntity() { return this.$store.getters.getEntitySelectorSelection; },

        allowAnyType() { return this.charactersAllVehicles === BLUEPRINT_VALUE.TYPE.ANY; },
        allowCharacterTypes() { return this.allowAnyType || this.charactersAllVehicles === BLUEPRINT_VALUE.TYPE.CHARACTER; },
        allowVehicleTypes() { return this.allowAnyType || this.charactersAllVehicles === BLUEPRINT_VALUE.TYPE.VEHICLE; },
        typeFilteredEntityDescriptors()
        {
            let filtered = this.entityDescriptors;
            if(!this.allowAnyType)
            {
                filtered = filtered.filter(x => x.BlueprintMap.type === this.charactersAllVehicles);
            }
            return filtered;
        },
        subTypeFilteredEntityDescriptors()
        {
            let filtered = this.typeFilteredEntityDescriptors;

            let filter = [];
            if(this.allowCharacterTypes && this.milCivAnimal)
            {
                filter.push(''+this.milCivAnimal);
            }
            if(this.allowVehicleTypes && this.airLandSea)
            {
                filter.push(''+this.airLandSea);
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
        detailFilteredEntityDescriptors()
        {
            let filtered = this.subTypeFilteredEntityDescriptors;

            let filter = null;
            if(this.allowCharacterTypes)
            {
                filter = this.maleFemale ? ''+this.maleFemale : null;
            }
            else if(this.allowVehicleTypes)
            {
                filter = this.airLandSeaFilter ? ''+this.airLandSeaFilter : null;
            }

            if(filter)
                filtered = filtered.filter(x => x.BlueprintMap.detail === filter);

            return filtered;
        },
        textFilteredEntityDescriptors()
        {
            let filtered = this.detailFilteredEntityDescriptors;
            if(this.searchText && this.searchText.length > 0)
            {
                const lCaseFilter = this.searchText.toLowerCase();
                filtered = filtered.filter(x=>x.normalizedName.indexOf(lCaseFilter)!==-1);
            }
            return filtered.sort((a,b)=>a.normalizedName > b.normalizedName ? 1 : -1);
        },
        filteredEntityDescriptors()
        {
            return this.textFilteredEntityDescriptors;
        },
        selected() { return this.$store.getters.getEntitySelectorSelection; },
        domainOptions()
        {
            return DOMAIN_FILTER_OPTIONS[this.airLandSea] ||
                [{label:'-', value:null},{label:'-', value:null}, {label:'-', value:null}];
        },
    },
    watch:
    {
        allowCharacterTypes(newValue)
        {
            if(!newValue)
            {
                this.milCivAnimal = null;
                this.maleFemale = null;
            }
        },
        allowVehicleTypes(newValue)
        {
            if(!newValue)
            {
                this.airLandSea = null;
            }
        },
        airLandSea()
        {
            this.airLandSeaFilter = null;
        }
    },
    beforeDestroy()
    {
        this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_CLEAR_SELECTION);
    },
    methods:
    {
        alphaCodeLookup(item)
        {
            const entry = COUNTRY.NAME[item.BlueprintArr[3]];
            return entry ? entry.alpha2 : null;
        },
        selectRow(item, row)
        {
            row.select(true);
        },
        selectEntity(entity)
        {
            this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_SET_SELECTION, entity);
        },
        handleDragStart()
        {
            this.isDragging = true;
        },
        handleDragEnd()
        {
            this.isDragging = false;
        },
    }
};
</script>

<style lang="scss">
@import '@/assets/scss/utilities/_all.scss';
.fooglyBoogly
{
    &.selected
    {
        background-color: $menu-bg-active !important;
    }
}
</style>