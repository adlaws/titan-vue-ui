<script>
/**
 * Example usages:
 *
 * Basic:
 *     <t-tabs>
 *         <t-tab title="banana">BANANA TAB CONTENT</t-tab>
 *         <t-tab title="apple">APPLE TAB CONTENT</t-tab>
 *         <t-tab title="orange">ORANGE TAB CONTENT</t-tab>
 *     </t-tabs>
 *
 * Set initial active tab by 0-based index (the apple tab, in this case):
 *     <t-tabs initial-tab="1">
 *         <t-tab title="banana">BANANA TAB CONTENT</t-tab>
 *         <t-tab title="apple">APPLE TAB CONTENT</t-tab>
 *         <t-tab title="orange">ORANGE TAB CONTENT</t-tab>
 *     </t-tabs>
 *
 * Set initial active tab by identifier (the orange tab, in this case):
 *     <t-tabs initial-tab="theOrangeTab">
 *         <t-tab title="banana">BANANA TAB CONTENT</t-tab>
 *         <t-tab title="apple">APPLE TAB CONTENT</t-tab>
 *         <t-tab title="orange" identifier="theOrangeTab">ORANGE TAB CONTENT</t-tab>
 *     </t-tabs>
 */
export default {
    name: 't-tabs',
    provide()
    {
        return {
            // `provide` a reference to `this` instance to all children as
            // a `tabsContainer` property (see also the TTab component `inject`
            // declaration)
            tabsContainer: this,
        };
    },
    props:
    {
        initialTab: {
            // the index or identifier of the tab which should be initially active
            type: [String, Number],
            default: 0
        },
    },
    data()
    {
        return {
            // tabs in order of addition (DOM order)
            tabs: [],
            // a map of tabs and their indices using their `identifier` prop as a lookup key
            tabsByIdentifier:new Map(),
            // the index of the currently active tab
            currentTabIdx: -1,
        };
    },
    mounted()
    {
        // carry out initialisation tasks
        this._initializeTabs();
    },
    methods:
    {
        /**
         * Activate a tab. All other tabs will be deactivated, since only one
         * tab can be active at a a time
         *
         * @param {TTab} tab the tab to activate
         */
        activateTab(tab)
        {
            if(this._isNotTTab(tab) || tab.isDisabled || tab.isActive)
            {
                // not a tab, already active, or is disabled
                return;
            }

            let tabIndex = this.getTabIndex(tab);
            for(let idx=0; idx<this.tabs.length; idx++)
                this.tabs[idx]._setActive(idx === tabIndex);

            this.currentTabIdx = tabIndex;
        },
        /**
         * Obtain a tab based on its index
         *
         * @param {Number} index the tab's index
         * @returns the tab, or `null` if no such tab could be found
         */
        getTabByIndex(index)
        {
            if(!isNaN(index) && index>=0 && index<this.tabs.length)
                return this.tabs[index];
            return null;
        },
        /**
         * Obtain a tab based on its `identifier` property
         *
         * @param {String} identifier the tab's identifier
         * @returns the tab, or `null` if no such tab could be found
         */
        getTabByIdentifier(identifier)
        {
            let entry = this.tabsByIdentifier.get(identifier) || {tab:null};
            return entry.tab;
        },
        /**
         * Obtain the index of a tab
         *
         * @param {TTab} tab the tab
         * @returns the tab's index, or -1 if no such tab could be found
         */
        getTabIndex(tab)
        {
            if(this._isNotTTab(tab))
            {
                // not a tab
                return -1;
            }
            return this.getTabIndexByIdentifier(tab.identifier);
        },
        /**
         * Obtain the index of a tab based on its `identifier` property
         *
         * @param {String} identifier the tab's identifier
         * @returns the tab's index, or -1 if no such tab could be found
         */
        getTabIndexByIdentifier(identifier)
        {
            let entry = this.tabsByIdentifier.get(identifier) || {index:-1};
            return entry.index;
        },
        /**
         * Initialises the tabs, the main task being to work out which tab
         * should initially be activated.
         */
        _initializeTabs()
        {
            let tab = null;
            if(typeof(this.initialTab) === 'string')
            {
                // initial tab is expressed as a string
                // try to find by identifier
                tab = this.getTabByIdentifier(this.initialTab);
                if(tab === null)
                {
                    // try parsing the string as an integer and try to find by index
                    let idx = parseInt(this.initialTab, 10);
                    if(!isNaN(idx) && idx>=0 && idx<this.tabs.length)
                        tab = this.tabs[idx];
                }
            }
            else
            {
                // initial tab is expressed as a number
                tab = this.getTabByIndex(this.initialTab);
            }
            if(tab === null || tab.isDisabled)
            {
                // no tab found, or the specified initial tab is disabled
                // find the first non-disabled tab and activate it
                tab = this._findFirstEnabledTab();
            }
            this.activateTab(tab);
        },
        /**
         * Called by TTab components as they are `mounted()` to register themselves
         * with the TTabs container
         *
         * @param {TTab} tab the tab to be registered
         */
        _registerTab(tab)
        {
            // check if already registered
            if(this._isNotTTab(tab) || this.tabsByIdentifier.has(tab.identifier))
                return;

            // NOTE: the parseInt in the next line is to decouple the reactivity
            //       of the `this.tabs.length` value from the `index` value stored
            //       in the map.
            let mapEntry = {tab:tab, index:parseInt(this.tabs.length, 10)};

            this.tabsByIdentifier.set(tab.identifier, mapEntry);
            this.tabs.push(tab);
        },
        /**
         * Find the first tab which is enabled (i.e., not disabled)
         *
         * @return the first enabled tab, or null if there is no tab that fits
         *         this requirement
         */
        _findFirstEnabledTab()
        {
            for(let idx=0; idx<this.tabs.length; idx++)
            {
                let tab = this.tabs[idx];
                if(!tab.isDisabled)
                    return tab;
            }
            return null;
        },
        /**
         * Utility method to check if a tab is a TTab component
         *
         * See also `_isNotTTab()`
         *
         * @param {*} tab the item to check
         * @returns true if the item is a TTab, false otherwise
         */
        _isTTab(tab)
        {
            return tab !== null && tab !== undefined && tab.isTTab;
        },
        /**
         * Utility method to check if a tab is *not* a TTab component
         *
         * See also `_isTTab()`
         *
         * @param {*} tab the item to check
         * @returns true if the item is *not* a TTab, false otherwise
         */
        _isNotTTab(tab)
        {
            return !this._isTTab(tab);
        },
    },
    /**
     * Render function for the widget - we do this rather than a "normal" template
     * so that we can lift the `title` slot content from the tabs (if it exists)
     * and put it inside the tab `<li>` element.
     *
     * For clarity, we are basically trying to replicate the following template:
     *
     *      <template>
     *          <div class="tabSet">
     *              <li
     *                  v-for="(tab, idx) in tabs"
     *                  :key="`tab-${idx}`"
     *                  class="tabSelection"
     *                  :class="{disabled:tab.isDisabled, 'selected active-button':(currentTabIdx===idx)}"
     *                  @click="activateTab(tab)"
     *              >
     *                  <a :href="`#${tab.id}`">
     *                      {{ tab.title }}
     *                  </a>
     *              </li>
     *              <slot />
     *          </div>
     *      </template>
     */
    render(createElm)
    {
        let tabElms = [];
        for(let idx=0; idx<this.tabs.length; idx++)
        {
            let tab = this.tabs[idx];
            let tabElm = createElm(
                'li',
                // properties
                {
                    key: `tab-${idx}`,
                    class: [
                        'tabSelection',
                        {
                            disabled: tab.isDisabled,
                            'selected active-button': (this.currentTabIdx===idx)
                        }
                    ],
                    on: {
                        click: function() {this.activateTab(tab);}.bind(this)
                    }
                },
                // child nodes
                tab.$slots.title||tab.title,
            );
            tabElms.push(tabElm);
        }
        return createElm(
            'div',
            {
                class:'tabSet'
            },
            [
                ...tabElms,
                this.$slots.default
            ]
        );
    },
};
</script>
