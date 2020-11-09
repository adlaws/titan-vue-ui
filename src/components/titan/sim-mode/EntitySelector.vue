<template>
    <titan-window
        title="Entities"
        icon="car"
        :x="50"
        :y="50"
        :width="600"
        :height="500"
    >
        <template #default="context">
            <titan-window-content :window-context="context.windowContext">
                <t-input
                    v-model="filterText"
                    type="text"
                    label="Search:"
                    @input="debouncedFilterUpdate"
                >
                    <template slot="append">
                        <titan-icon icon="magnify" />
                    </template>
                </t-input>
                <table
                    class="vue-os--entity-selector-table"
                >
                    <tr>
                        <th>Entity</th>
                        <th>Image</th>
                    </tr>
                    <tr
                        v-for="(entityDescriptor,idx) in pageItems"
                        :key="`entity-${idx}`"
                        :class="{selected:selected && entityDescriptor.entityName===selected.entityName}"
                        @click="selectEntity(entityDescriptor)"
                    >
                        <td class="name">
                            {{ entityDescriptor.Name }}
                        </td>
                        <td class="image">
                            <img-fallback
                                :src="`${PACKAGES_PATH}${entityDescriptor.Path}.gif`"
                                fallback="images/thumbnail-missing.gif"
                                width="64"
                                height="32"
                            />
                        </td>
                    </tr>
                </table>
                <button
                    :disabled="!hasPrevPage"
                    @click="previousPage"
                >
                    Prev
                </button>
                Page {{ pageCount===0?'0':page+1 }} of {{ pageCount }}
                <button
                    :disabled="!hasNextPage"
                    @click="nextPage"
                >
                    Next
                </button>
                <hr>
                {{ selected?selected:'' }}
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
import {STORE_MUTATION} from '@/assets/js/store/store.js';

import { PACKAGES_PATH } from '@/assets/js/titan/titan-utils.js';
import UiUtils from '@/assets/js/utils/ui-utils.js';

import TitanWindow from '@/components/titan/core/TitanWindow.vue';
import TitanWindowContent from '@/components/titan/core/TitanWindowContent.vue';
import TitanIcon from '@/components/titan/core/TitanIcon.vue';
import TInput from '@/components/titan/forms/fields/basic/TInput.vue';
import ImgFallback from '@/components/titan/core/ImgFallback.vue';

import '@/assets/img/datasource.png';

export default {
    name: 'editor-ui',
    components:
    {
        TitanWindow, TitanWindowContent,
        TitanIcon,
        TInput,
        ImgFallback
    },
    data()
    {
        return {
            page:0,
            itemsPerPage:10,
            filterText: '',
            filteredEntities:[],
            tableRows:[],
            PACKAGES_PATH,
        };
    },
    computed:
    {
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        pageCount()
        {
            return Math.ceil(this.filteredEntities.length/this.itemsPerPage);
        },
        pageItems()
        {
            const startItem = this.page * this.itemsPerPage;
            const endItem = startItem + this.itemsPerPage;
            return this.filteredEntities.slice(startItem, endItem);
        },
        hasPrevPage()
        {
            return this.page > 0;
        },
        hasNextPage()
        {
            return this.page < this.pageCount-1;
        },
        selected() { return this.$store.getters.getEntitySelectorSelection; },
    },
    mounted()
    {
        this.updateFilteredEntities();
    },
    beforeDestroy()
    {
        this.$store.commit(STORE_MUTATION.ENTITY_SELECTOR_CLEAR_SELECTION);
    },
    methods:
    {
        selectEntity(selected)
        {
            this.$store.commit(STORE_MUTATION.ENTITY_SELECTOR_SET_SELECTION, selected);
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
.vue-os--entity-selector-table
{
    margin:0;
    padding:0;
    border: 0px solid rgba(0,0,0,0);
    width: 100%;
    tr
    {
        margin:0;
        padding:0;
        border: 0px solid rgba(0,0,0,0);
        &.selected
        {
            background-color: #08f;
        }
        td
        {
            margin:0;
            padding:0;
            border: 0px solid rgba(0,0,0,0);
            &.name
            {
                width:90%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellips;
            }
            &.image
            {
                width:10%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellips;
            }
        }
    }
}
</style>
