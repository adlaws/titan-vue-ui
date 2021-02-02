<script>
/**
 * Example usages:
 *
 * Basic:
 *     <t-tabs>
 *         <t-tab title="banana">BANANA TAB CONTENT</t-tab>
 *         <t-tab title="apple">APPLE TAB CONTENT</t-tab>
 *         <t-tab title="orange">ORANGE TAB CONTENT</t-tab>
 *         <t-tab title="mango">MANGO TAB CONTENT</t-tab>
 *     </t-tabs>
 *
 * Disabled tabs:
 *     <t-tabs>
 *         <t-tab title="banana">BANANA TAB CONTENT</t-tab>
 *         <t-tab title="apple" disabled>APPLE TAB CONTENT</t-tab>
 *         <t-tab title="orange">ORANGE TAB CONTENT</t-tab>
 *         <t-tab title="mango" disabled>MANGO TAB CONTENT</t-tab>
 *     </t-tabs>
 */
import CryptoUtils from '@/assets/js/utils/crypto-utils.js';

export default {
    name: 't-tab',
    inject:[
        'tabsContainer', // `provide`d from <t-tabs> component
    ],
    props:
    {
        title:{
            // the title to display for the tab
            type:String,
            default:'',
        },
        disabled:{
            // is the tab disabled?
            type:[String, Boolean],
            default: null,
        },
        identifier:{
            // a unique identifier for the tab
            type: String,
            default: () => CryptoUtils.simpleUUID(),
        },
    },
    data()
    {
        return {
            isActive: false,
        };
    },
    computed:
    {
        isDisabled()
        {
            // determine disabled state
            if(this.disabled === null)
                return false;
            if(typeof(this.disabled)==='string')
                return true;
            // must be boolean (by nature of the `disabled` prop's `type` requirements)
            return this.disabled === true;
        },
        isTTab: () => true, // used internally to recognise TTab components
    },
    mounted()
    {
        // register with the tab container so that it knows about us
        if(this.tabsContainer && this.tabsContainer._registerTab)
            this.tabsContainer._registerTab(this);
    },
    methods:
    {
        /**
         * Set this tab as active
         * NOTE - do not call this directly, instead use the tab container
         * to activate specific tabs if required
         */
        _setActive(isActive)
        {
            this.isActive = isActive;
        }
    },
    /**
     * Render function for the widget - we do this rather than a "normal" template
     * so that we can lift the `title` slot content from the tab (if it exists)
     * and put it inside the tab selection `<li>` element in the "parent" TTabs
     * component
     *
     * For clarity, we are basically trying to replicate the following template:
     *
     *      <template>
     *          <div class="tabContent" :class="{hide:!isActive}">
     *              <slot name="title" />
     *              <slot />
     *          </div>
     *      </template>
     */
    render(createElm)
    {
        return createElm(
            'div',
            {
                class:[
                    'tabContent',
                    {
                        hide:!this.isActive
                    }
                ]
            },
            [
                this.$slots.default
                // ignore $slots.title, because that's rendered in the tabs
                // container instead
            ]
        );
    },
};
</script>
