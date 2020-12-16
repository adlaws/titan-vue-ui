<template>
    <titan-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="600"
        :height="500"
        :start-minimized="true"
    >
        <template #default="context">
            <titan-window-content :titan-window="context.titanWindow">
                <v-text-field
                    v-model="filterText"
                    label="Search:"
                    clearable
                    clear-icon="mdi-close"
                    @input="debouncedFilterUpdate"
                >
                    <template slot="append">
                        <titan-icon icon="magnify" />
                    </template>
                </v-text-field>

                <v-data-table
                    dense
                    item-key="Name"
                    show-select
                    single-select
                    :headers="table.headers"
                    :items="entityDescriptors"
                    :items-per-page="5"
                    :search="filterText"
                    @item-selected="selectEntity"
                    @click:row="selectRow"
                >
                    <template
                        v-slot:[`item.Path`]="{ item }"
                    >
                        <img-fallback
                            :src="`${PACKAGES_PATH}${item.Path}.gif`"
                            fallback="images/thumbnail-missing.gif"
                            width="64"
                            height="32"
                        />
                    </template>
                </v-data-table>
                <hr>
                <div style="user-select:text;">
                    {{ selected?selected:'' }}
                </div>
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import {TITAN_MUTATION} from '@/assets/js/store/titan-manager.js';

import { PACKAGES_PATH } from '@/assets/js/titan/titan-utils.js';
import UiUtils from '@/assets/js/utils/ui-utils.js';

import TitanWindow from '@/components/common/titan/TitanWindow.vue';
import TitanWindowContent from '@/components/common/titan/TitanWindowContent.vue';
import TitanIcon from '@/components/titan/core/TitanIcon.vue';
// import TitanInput from '@/components/common/titan/forms/fields/basic/TitanInput.vue';
import ImgFallback from '@/components/titan/core/ImgFallback.vue';

export default {
    name: 'editor-ui',
    components:
    {
        TitanWindow, TitanWindowContent,
        TitanIcon,
        // TitanInput,
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
                    },
                    { text: 'Image', value: 'Path', sortable: false },
                ],
            },
            filterText: '',
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
        this.updateFilteredEntities();
    },
    beforeDestroy()
    {
        this.$store.commit(TITAN_MUTATION.ENTITY_SELECTOR_CLEAR_SELECTION);
    },
    methods:
    {
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
        previousPage()
        {
            if(this.page>0)
                this.page--;
        },
        nextPage()
        {
            if(this.page<this.pageCount)
                this.page++;
        },
        debouncedFilterUpdate: UiUtils.debounce(function()
        {
            this.updateFilteredEntities();
        }, 250, {onLeadIn: false, onTrailOut: true}),
        updateFilteredEntities()
        {
            if(this.filterText.length === 0)
                this.filteredEntities = this.entityDescriptors;
            else
            {
                const filtered = this.entityDescriptors.filter(x =>
                {
                    return x.Name.toLowerCase().indexOf(this.filterText)>=0;
                });
                this.filteredEntities = filtered;
            }
            this.page = 0;
        }
    }
};
</script>

<style lang="scss">
@import '@/assets/scss/utilities/_all.scss';

.titan-desktop--entity-selector-table
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
