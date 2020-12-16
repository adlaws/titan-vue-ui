<template>
    <div>
        <label v-if="label" :for="id">{{ label }}</label>
        <select
            ref="select"
            v-model="currentOption"
            :name="name"
            :multiple="isMultiSelect"
            :disabled="disabled"
            @blur="$emit('blur', $event)"
        >
            <option
                v-if="defaultText && defaultText.length > 0"
                :disabled="defaultText"
                value=""
            >
                {{ defaultText }}
            </option>
            <option
                v-for="item in options"
                :key="item[idKey]"
                :value="item[idKey]"
                :selected="value===item[idKey]"
                :disabled="item[disabledKey]||false"
                :title="item[tooltipKey]||''"
            >
                {{ item[textKey] }}
            </option>
        </select>
    </div>
</template>

<script>
/**
 * Example usages:
 *
 * Single Select:
 *      <titan-select
 *          v-model="selection"
 *          :options="options"
 *      />
 *
 * Multiple Select:
 *      <titan-select
 *          v-model="selections"
 *          :options="options"
 *          multiple
 *      />
 *
 * Default text:
 *      <titan-select
 *          v-model="selection"
 *          :options="options"
 *          default-text="Choose something..."
 *      />
 */
import { $isInsideTitan } from '@/assets/js/titan/titan-utils';
import CryptoUtils from '@/assets/js/utils/crypto-utils';

export default {
    name: 'titan-select',
    props: {
        name:{type:String, default:()=>CryptoUtils.simpleUUID()},
        label:{type:String, default:null},
        value: {
            // the initial value of the select
            type: [String, Number, Boolean, Array],
            default: null
        },
        options: {
            // an array of options for the select, of the form...
            //     [
            //       {id:0, text:'Option A', disabled:false, tooltip:'A is for Apple'},
            //       {id:1, text:'Option B', disabled:false, tooltip:'B is for Banana'}
            //     ]
            //
            // Notes:
            //  - the `disabled` and `tooltip` values are optional.
            //  - The `id`, `text`, `disabled` and `tooltip` keys are
            //    configurable to match your data structure - see `idKey`, `textKey`,
            //    `disabledKey` and `tooltipKey` below.
            type: Array,
            default: ()=>[]
        },
        multiple:{
            type:[String, Boolean], default:null
        },
        disabled:{
            type:[String,Boolean],
            default:false
        },
        defaultText: {
            // text to show at the top of the dropdown
            // in the event that there is no current selection
            type: String,
            default: ''
        },
        idKey: {
            // optionally specify the key under which
            // option IDs will be found
            type: String,
            default: 'id'
        },
        textKey: {
            // optionally specify the key under which
            // option text/labels will be found
            type: String,
            default: 'text'
        },
        disabledKey: {
            // optionally specify the key under which
            // option disabled status will be found
            type: String,
            default: 'disabled'
        },
        tooltipKey: {
            // optionally specify the key under which
            // option tooltip text will be found
            type: String,
            default: 'tooltip'
        },
    },
    data()
    {
        return {
            currentOption: this.multiple !== null?[]:null,
        };
    },
    computed:
    {
        isMultiSelect()
        {
            // determine multiple select state
            if(this.multiple === null)
                return false;
            if(typeof(this.multiple)==='string')
                return this.multiple.toLowerCase()!=='false';
            // must be boolean (by nature of the `multiple` prop's `type` requirements)
            return this.multiple === true;
        },
    },
    watch: {
        currentOption(newOption/*, oldOption*/)
        {
            this.$emit('input', newOption);
        }
    },
    mounted()
    {
        if(this.isMultiple)
        {
            if(this.value===undefined || this.value===null)
                this.currentOption = [];
            else if(Array.isArray(this.value))
                this.currentOption = this.value;
            else
                this.currentOption = [this.value];
        }
        else
            this.currentOption = this.value;

        if( $isInsideTitan && !this.isMultiSelect )
        {
            // <select> dropdowns do not currently render correctly in Titan,
            // this `_outerraDropdownHack` is required to fix it for now.
            // NOTE: only works for single select drop downs for now
            this._outerraDropdownHack(this.$refs.select);
        }
    },
    methods:
    {
        /**
         * Currently required to make dropdowns work correctly in Titan
         *
         * Borrowed mainly from code created by Marek Hrabcek (Titan) with
         * minor modifications for clarity in Vue
         */
        _outerraDropdownHack(el, maxHeight)
        {
            if (!el || el.children.length < 2 || el.__ddhack !== undefined)
            {
                // already done or not necessary
                return;
            }

            el.__ddhack = {
                shown: false,
                inside:false
            };

            const children = el.children;
            const d = el.ownerDocument;
            const decorator = d.createElement('select');

            decorator.size = children.length;
            decorator.style.maxHeight = maxHeight;
            decorator.style.display = 'none';
            decorator.style.outline = 'none';
            decorator.style.overflow = 'auto';
            decorator.style.position = 'fixed';
            decorator.style.zIndex = 100000;

            [...children]
                .filter((child) => child.nodeName === 'OPTION')
                .forEach(child =>
                {
                    const item = child.cloneNode(true); // Copy the element and any child nodes
                    item.classList.add('__ddhack'); // hover styles from stylesheet: `option.__ddhack:hover{background-color: #1e90ff;}`
                    item.addEventListener('click', () => hideContainer() );
                    decorator.appendChild(item);
                });

            function insertAfter(targetEl, insertedEl)
            {
                const parent = targetEl.parentNode;
                if (targetEl.nextSibling === null)
                {
                    parent.appendChild(insertedEl);
                }
                else
                {
                    parent.insertBefore(insertedEl, targetEl.nextSibling);
                }
            }
            function showContainer()
            {
                if (el.__ddhack.shown === false)
                {
                    const client = el.getBoundingClientRect();
                    decorator.style.display = 'block';
                    decorator.style.width = `${client.width}px`;
                    decorator.style.left = `${client.left}px`;
                    decorator.style.top = `${client.height + client.top}px`;
                    decorator.selectedIndex = el.selectedIndex;
                    el.__ddhack.shown = true;
                }
            }
            function hideContainer()
            {
                if (el.__ddhack.shown === true)
                {
                    decorator.style.display = 'none';
                    el.__ddhack.shown = false;
                }
            }
            decorator.addEventListener('change', () =>
            {
                el.selectedIndex = decorator.selectedIndex;
                el.dispatchEvent(new Event('change'));
            });

            decorator.addEventListener('mouseenter', () =>
            {
                el.__ddhack.inside = true;
            });
            decorator.addEventListener('mouseleave', () =>
            {
                el.__ddhack.inside = false;
            });
            decorator.addEventListener('blur', () =>
            {
                if (!el.__ddhack.inside) hideContainer();
            });
            el.addEventListener('blur', () =>
            {
                if (!el.__ddhack.inside) hideContainer();
            });
            insertAfter(el, decorator);
            el.addEventListener('click', () =>
            {
                if (el.__ddhack.shown) // is visible
                {
                    hideContainer();
                }
                else // is hidden
                {
                    showContainer();
                }
            });
            el.addEventListener('change', () =>
            {
                decorator.selectedIndex = el.selectedIndex;
            });
        }
    }
};
</script>

<style lang="scss">
option.__ddhack:hover
{
    background-color: #1e90ff;
}
</style>