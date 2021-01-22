<template>
    <div
        ref="container"
        class="cse-desktop--entity-spotlight"
    >
        <div class="search-box">
            <input
                ref="searchField"
                v-model.trim="search"
                @keydown.down.prevent="_handleArrowDown"
                @keydown.up.prevent="_handleArrowUp"
                @keydown.tab.prevent="_handleTab"
                @keydown.enter="_handleEnter"
                @input="_updateResults"
            >
        </div>
        <div class="results-box">
            <ul>
                <li
                    v-for="(item, idx) in results"
                    :id="`spotlight-result-${idx}`"
                    :key="`result-${idx}`"
                    :class="{active: idx===selectedIdx}"
                    :tabindex="idx"
                    @click="_handleItemClicked(item)"
                    @keydown.down.prevent="_handleArrowDown"
                    @keydown.up.prevent="_handleArrowUp"
                    @keydown.tab.prevent="_handleTab"
                    @keydown.enter="_handleEnter"
                >
                    {{ item.Name }}
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';

const TAB_SYMBOL='\u00BB';

// the spotlight menu can be dismissed without making a selection by clicking
// anywhere outside the bounds of the menu, by pressing the ESCAPE key, or
// moving the mouse pointer outside the window
const CANCELLATION_EVENTS = ['keydown', 'mousedown', 'mouseout'];

export default {
    name:'entity-spotlight',
    data()
    {
        return {
            search: '',
            results: [],
            selectedIdx: -1,
        };
    },
    computed:
    {
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        hasResults() { return this.results.length > 0; },
        hasSelection() { return this.hasResults && this.selectedIdx > -1; },
        selectedItem() { return this.hasSelection ? this.results[this.selectedIdx] : null; },
    },
    mounted()
    {
        CANCELLATION_EVENTS.forEach((evtName) =>
        {
            document.addEventListener(evtName, this._watchForClickOutsideOrEscape);
        });
        this.$refs.searchField.focus();
    },
    beforeDestroy()
    {
        CANCELLATION_EVENTS.forEach((evtName) =>
        {
            document.removeEventListener(evtName, this._watchForClickOutsideOrEscape);
        });
    },
    methods:
    {
        _updateResults()
        {
            if(this.search.length > 0)
            {
                const lCaseFilter = this.search.toLowerCase().split(TAB_SYMBOL)[0];
                this.results = this.entityDescriptors.filter(x=>
                {
                    if(x.Name.toLowerCase().indexOf(lCaseFilter)!==-1)
                        return true;
                    return false;
                });
            }
            else
            {
                this.results = [];
            }

            this.selectedIdx = this.results.length > 0 ? 0 : -1;
        },
        _handleEnter()
        {
            if(!this.hasSelection)
                return;

            const payload = this._constructPayload();
            this.$emit('selected', payload);
        },
        _handleTab()
        {
            if(!this.hasSelection)
                return;

            this.search = this.selectedItem.Name + TAB_SYMBOL;
            this._updateResults();
            this.$refs.searchField.focus();
        },
        _handleItemClicked(item)
        {
            if(item.disabled)
                return;

            this.$emit('selected', { item, args: {} });
        },
        _handleArrowDown()
        {
            if(!this.hasResults)
                return;

            this.selectedIdx = Math.min(this.selectedIdx+1, this.results.length -1);

            if(this.selectedIdx>=0)
            {
                const selectedItem = this.results[this.selectedIdx];
                this.search = selectedItem.Name;
                document.getElementById(`spotlight-result-${this.selectedIdx}`).focus();
            }
        },
        _handleArrowUp()
        {
            if(!this.hasResults || this.selectedIdx < 0)
                return;

            this.selectedIdx = Math.max(this.selectedIdx-1, -1);

            if(this.selectedIdx>=0)
            {
                const selectedItem = this.results[this.selectedIdx];
                this.search = selectedItem.Name;
                document.getElementById(`spotlight-result-${this.selectedIdx}`).focus();
            }
            else
                this.$refs.searchField.focus();
        },
        /**
         * TODO: this is a quickly hacked together parsing of an altitude argument
         * for the purposes of prototyping, and needs work if it's to be an
         * actual feature
         */
        _constructPayload()
        {
            const searchParts = this.search.split(TAB_SYMBOL);
            const args = {};
            if(searchParts.length>1)
            {
                searchParts.forEach(x=>
                {
                    const keyVal = x.split(':').map(y=>y.trim());
                    if(keyVal.length === 2)
                    {
                        args[keyVal[0]]=keyVal[1];
                    }
                });
            }

            const item = this.results[this.selectedIdx];
            return { item, args };
        },
        /**
         * This method checks for clicks outside the context menu or pressing
         * of the escape key, or the mouse moving outside the window to
         * cancel/dismiss the context menu without making a selection.
         */
        _watchForClickOutsideOrEscape(evt)
        {
            if(this.$refs.container.contains(evt.target))
                return; // it's on the context menu, don't do anything

            if(EventUtils.isMouseOut(evt))
            {
                const from = evt.relatedTarget || evt.toElement;
                if (!from || from.nodeName === 'HTML')
                {
                    this.$emit('cancelled'); // mouse left the window - cancelled
                }
            }
            else if(EventUtils.isMouseDown(evt) || EventUtils.isKey(evt, KEY.KEY_CODE.ESCAPE))
                this.$emit('cancelled'); // ESC key or click outside - cancelled
        },
    },
};
</script>