<!-- ------------------------------------------------------------------------------------------
A context menu component, allows nested sub-menus

@param {Number} x the preferred x position on the screen (may be adjusted due to proximity to edges of screen)
@param {Number} y the preferred y position on the screen (may be adjusted due to proximity to edges of screen)
@param {Array} items the context menu items

Events:
    @selected fired when an item is selected, with the selected item as the parameter
    @closed fired when the context menu is closed after a selection is made
    @cancelled fired when the context menu is closed with no selection being made

Example use:

    <template>
        <div>
            <button @click="showContextMenu">Context Menu</button>
        </div>
        <titan-context-menu
            v-if="contextMenu.show"
            :items="contextMenu.items"
            :x="contextMenu.x"
            :y="contextMenu.y"
            @selected="contextMenuSelection"
        />
    </template>

    <script>
        export default {
            data()
            {
                return {
                    contextMenu:{
                        show: false,
                        x: 0,
                        y: 0,
                        items: [
                            {id:'a',text:'Option A'},
                            {id:'b',text:'Option B', disabled:true},
                            {separator:true},
                            {id:'c',text:'Sub menu C', items:[
                                {id:'c-a', text:'C Option A'},
                                {id:'c-b', text:'C Option B'},
                                {id:'c-c', text:'C Sub Menu C', items:[
                                    {id:'c-c-a',text:'Option C-C-A'},
                                    {id:'c-c-b',text:'Option C-C-B'},
                                ]},
                            ]},
                            {id:'d',text:'Option D'},
                        ]
                    },
                };
            },
            methods:
            {
                showContextMenu(evt)
                {
                    this.contextMenu.x = evt.clientX;
                    this.contextMenu.y = evt.clientY;
                    this.contextMenu.show = true;
                },
                contextMenuSelection(selected)
                {
                    this.contextMenu.show = false;
                    console.log(selected.id);
                }
            }
        };
    </script>
----------------------------------------------------------------------------------------------- -->

<template>
    <div
        ref="container"
        class="titan--context-menu"
        :style="`left:${pos.x}px;top:${pos.y}px;`"
    >
        <ul>
            <template
                v-for="(item, idx) in items"
            >
                <li
                    v-if="item.separator"
                    :key="`item-${idx}`"
                    class="separator"
                >
                    <hr>
                </li>
                <li
                    v-else-if="item.items"
                    :ref="`submenu-${idx}`"
                    :key="`item-${idx}`"
                    :class="{disabled:item.disabled===true}"
                    @click="_revealSubmenu(idx)"
                >
                    <titan-icon v-if="item[iconKey]" :icon="item[iconKey]" />
                    <span v-else style="width:1em;display:inline-block;" />
                    <span class="ml-1 mr-2">{{ item[textKey] }}</span>
                    <span class="spacer" />
                    <titan-icon icon="chevron-right" />
                    <titan-context-menu
                        v-if="submenu.idx === idx"
                        :x="submenu.x"
                        :y="submenu.y"
                        :items="item.items"
                        @selected="_handleItemClicked"
                    />
                </li>
                <li
                    v-else
                    :key="`item-${idx}`"
                    :class="{disabled:item.disabled===true}"
                    @click.stop="_handleItemClicked(item)"
                >
                    <titan-icon v-if="item[iconKey]" :icon="item[iconKey]||'blank'" />
                    <span v-else style="width:1em;display:inline-block;" />
                    <span class="ml-1 mr-2">{{ item[textKey] }}</span>
                </li>
            </template>
        </ul>
    </div>
</template>

<script>
import MathUtils from '@/assets/js/utils/math-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name:'titan-context-menu',
    components:
    {
        TitanIcon,
    },
    props:
    {
        // the preferred x position on the screen - may be adjusted due to proximity to edges of screen
        x:
        {
            type:Number,
            default:0
        },
        // the preferred x position on the screen - may be adjusted due to proximity to edges of screen
        y:
        {
            type:Number,
            default:0
        },
        items:
        {
            type:Array,
            default:() => []
        },
        textKey:
        {
            type:String,
            default: 'text'
        },
        iconKey:
        {
            type:String,
            default: 'icon'
        },
        ignoreTaskbar:
        {
            type:Boolean,
            default: false,
        },
    },
    data()
    {
        return {
            // the final position of the context menu on the screen after adjustments
            // due to available screen space
            pos:{
                x:0,
                y:0
            },
            submenu:{
                idx:-1,
                x:0,
                y:0,
            },
            selected: null,
        };
    },
    mounted()
    {
        // need to make sure we keep the context menu inside the available screen space - we can
        // also opt to ignore the taskbar and appear over the top of it if desired, but generally
        // we don't want to do that
        const desktopBounds = this.ignoreTaskbar ? this.$store.getters.screenBounds : this.$store.getters.desktopBounds;
        // work out bounds for context menu
        const container = this.$refs.container;
        const bounds = container.getBoundingClientRect();

        this.pos.x = MathUtils.clamp(this.x, desktopBounds.left, desktopBounds.right - bounds.width);
        this.pos.y = MathUtils.clamp(this.y, desktopBounds.top, desktopBounds.bottom - bounds.height);

        this.$nextTick(() =>
        {
            // once the positions are all updated, wait for the next 'tick' to correct
            // any problems with disappearing off the edge of the screen; we don't know
            // if this happens until after the location/size of the container has been
            // updated and the component has been rendered, hence the need to wait for
            // the tick.
            const parentMenu = container.parentElement;
            if(!parentMenu)
                return; // we are not a sub-menu, so everything is cool

            // get our *absolute* position on the screen and our *current* bounds
            // now that we are rendered
            const absolutePosition = this._getAbsolutePosition(container);
            const bounds2 = container.getBoundingClientRect();
            // check the right edge and bottom to see if we go off the screen
            const rightEdge = absolutePosition.x + bounds2.width;
            const bottomEdge = absolutePosition.y + bounds2.height;
            if( rightEdge > desktopBounds.right)
            {
                // we're off the right edge of the screen - reposition so we are aligned
                // with the left side of the parent menu
                const parentBounds = parentMenu.getBoundingClientRect();
                this.pos.x -= (parentBounds.width + bounds2.width);
            }
            if(bottomEdge > desktopBounds.bottom)
            {
                // we're off the bottom edge of the screen - reposition so we are aligned
                // with the bottom edge of the screen
                this.pos.y -= (bottomEdge - desktopBounds.bottom);
            }
        });
    },
    beforeDestroy()
    {
        if(this.selected === null)
            this.$emit('cancelled');
        else
            this.$emit('closed');
    },
    methods:
    {
        _revealSubmenu(idx)
        {
            const container = this.$refs[`submenu-${idx}`][0];
            const bounds = container.getBoundingClientRect();

            this.submenu.x = bounds.width;
            this.submenu.y = container.offsetTop;


            this.submenu.idx = idx;
        },
        _handleItemClicked(item)
        {
            if(item.disabled)
                return;

            this.selected = item;
            this.$emit('selected', this.selected);
        },
        /**
         * Utility method to obtain the absolute position of the element
         *
         * We need this because elm.getBoundingClientRect() returns results
         * relative to the container of the element
         *
         * @param {DOMElement} the DOM element to check
         * @return {object} the absolute {x,y} coordinates of the element
         */
        _getAbsolutePosition( el )
        {
            let x = 0;
            let y = 0;
            while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) )
            {
                x += el.offsetLeft - el.scrollLeft;
                y += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
            }
            return { x, y };
        }
    }
};
</script>

<style lang="scss">
.titan--context-menu
{
    z-index: 1024;

    box-shadow: 0 0 16px rgba(0,0,0,0.8);
    background-color: rgba(0,32,64,0.9);
    border-radius: 2px;

    padding: 0;
    margin: 0;
    top:0;
    left:0;
    position: absolute;

    min-width:10em;

    ul
    {
        margin:0;
        padding:0;
        list-style: none;
        li
        {
            .spacer { flex-grow: 1; }
            hr { width: 100%; }

            margin:0px;
            padding: 4px 8px;

            display: flex;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;

            &.disabled
            {
                color: rgba(255,255,255,0.333);
            }
            &.separator
            {
                padding: 0px 4px;
            }
            &:not(.separator):not(.disabled)
            {
                &:hover
                {
                    cursor: pointer;
                    color: white;
                    background-color: rgba(0,64,128,0.9);
                }
            }
            &.disabled
            {
                &:hover
                {
                    cursor: not-allowed;
                }
            }
        }
    }

    color: white;
    background-color: rgba(0,16,32,0.9);
}
</style>
