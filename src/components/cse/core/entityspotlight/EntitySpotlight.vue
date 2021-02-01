<template>
    <div
        ref="container"
        class="cse-desktop--entity-spotlight"
    >
        <div
            class="search-box"
        >
            <div
                class="inline-suggest"
            >
                {{ inlineSuggestion }}
            </div>
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
        <div
            class="results-box"
        >
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
                    <img-fallback
                        :src="`${PACKAGES_PATH}${item.Path}.gif`"
                        fallback="images/thumbnail-missing.png"
                        width="64"
                        height="32"
                        class="mr-1"
                    />
                    <!-- eslint-disable-next-line vue/no-v-html -->
                    <span v-html="_highlight(item.Name)" />
                    <v-icon>mdi-camera</v-icon>
                </li>
            </ul>
        </div>
    </div>
</template>

<script>
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';
import { PACKAGES_PATH } from '@/assets/js/titan/titan-utils.js';

import ImgFallback from '@/components/cse/core/ImgFallback.vue';

const TAB_SYMBOL='\u00BB'; // double rightward chevron kinda thing

// the spotlight menu can be dismissed without making a selection by clicking
// anywhere outside the bounds of the menu, by pressing the ESCAPE key, or
// moving the mouse pointer outside the window
const CANCELLATION_EVENTS = ['keydown', 'mousedown', 'mouseout'];

export default {
    name:'entity-spotlight',
    components:{
        ImgFallback
    },
    data()
    {
        return {
            search: '',
            results: [],
            selectedIdx: -1,
            PACKAGES_PATH,
        };
    },
    computed:
    {
        entityDescriptors() { return this.$store.getters.titanEntityDescriptors; },
        hasResults() { return this.results.length > 0; },
        hasSelection() { return this.hasResults && this.selectedIdx > -1; },
        selectedItem() { return this.hasSelection ? this.results[this.selectedIdx] : null; },
        inlineSuggestion()
        {
            if(!this.search.length)
                return 'Search...';
            if(!this.hasResults)
                return '';

            const suggestion = this.selectedItem ? this.selectedItem.Name : this.results[0].Name;
            if(suggestion.toLowerCase().startsWith(this.search.toLowerCase()))
                return this._blatCase(this.search, suggestion);

            return '';
        },
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
            if(this.search.length === 0)
            {
                this.results = [];
            }
            else
            {
                const filter = this.search.split(TAB_SYMBOL)[0];
                const lcaseFilter = filter.toLowerCase();
                const candidates = this.entityDescriptors.filter(x=>
                {
                    const lcasename = x.Name.toLowerCase();
                    return lcasename.indexOf(lcaseFilter) !== -1;
                });
                candidates.sort((a,b) =>
                {
                    let aNameStartsWith = a.Name.startsWith(filter);
                    let bNameStartsWith = b.Name.startsWith(filter);
                    if(aNameStartsWith && !bNameStartsWith)
                        return -1;
                    if(bNameStartsWith && !aNameStartsWith)
                        return 1;
                    const aNameLcase = a.Name.toLowerCase();
                    const bNameLcase = b.Name.toLowerCase();
                    aNameStartsWith = aNameLcase.startsWith(lcaseFilter);
                    bNameStartsWith = bNameLcase.startsWith(lcaseFilter);
                    if(aNameStartsWith && !bNameStartsWith)
                        return -1;
                    if(bNameStartsWith && !aNameStartsWith)
                        return 1;

                    return bNameLcase.indexOf(lcaseFilter) - aNameLcase.indexOf(lcaseFilter);
                });
                this.results = candidates;
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
        _handleArrowUp()
        {
            this._handleArrow(true);
        },
        _handleArrowDown()
        {
            this._handleArrow(false);
        },
        _handleArrow(isUp)
        {
            if(!this.hasResults)
                return;

            const direction = isUp ? -1 : 1;
            this.selectedIdx = Math.min(Math.max(this.selectedIdx+direction, -1), this.results.length -1);

            if(this.selectedIdx>=0)
                document.getElementById(`spotlight-result-${this.selectedIdx}`).scrollIntoView(false);
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
        /**
         * Forces the casing of alphabetical in the destination string to match those of the
         * source string where the letters match. For example:
         *
         * _blatCase('AbCd','abcF') => 'AbCF'
         *
         * Used to match the auto-suggest text match the currently typed search string
         * so that the suggestion "looks nice" even when casing doesn't match
         */
        _blatCase(src, dst)
        {
            let working = dst;
            const minLength = Math.min(src.length, dst.length);
            for(let idx=0; idx<minLength; idx++)
            {
                const srcChar = src.charAt(idx);
                const dstChar = dst.charAt(idx);
                if(srcChar !== dstChar)
                {
                    const srcCharCode = srcChar.charCodeAt(0);
                    const dstCharCode = dstChar.charCodeAt(0);
                    if(this._isAlphaChar(srcCharCode) && this._isAlphaChar(dstCharCode))
                    {
                        if(srcChar.toLowerCase() === dstChar.toLowerCase())
                        {
                            const srcIsLowerCase = srcCharCode>=97 && srcCharCode <=122;
                            const convertedChar = srcIsLowerCase ? dstChar.toLowerCase() : dstChar.toUpperCase();
                            working = working.substring(0,idx) + convertedChar + working.substring(idx+1);
                        }
                    }
                }
            }
            return working;
        },
        /**
         * Determine if the given character code corresponds to an upper or lower case
         * letter of the alphabet
         *
         * @param {number} charCode the character code
         * @return {boolean} true if the character code is a letter, false otherwise
         */
        _isAlphaChar(charCode)
        {
            //      upper case                         lower case
            return (charCode>=65 && charCode <=90) || (charCode>=97 && charCode <=122);
        },
        /**
         * Adds <b></b> tags around anything in the provided string that case insensitively matches
         * the current search string, indicating which part of the text is being matched.
         *
         * @param {string} the text to be highlighted
         * @return the text with <b></b> tags added around matches
         */
        _highlight(text)
        {
            return text.replace(new RegExp(`(${this.search})`, 'ig'),'<b>$1</b>');
        }
    },
};
</script>