<!-- ------------------------------------------------------------------------------------------
A context menu component, allows nested sub-menus

@param {Number} x the preferred x position on the screen (may be adjusted due to proximity to edges of screen)
@param {Number} y the preferred y position on the screen (may be adjusted due to proximity to edges of screen)
@param {Array} items the context menu items

Events:
    @selected fired when an item is selected, with the selected item as the parameter
    @cancelled fired when the context menu is closed with no selection being made

Example use:

    <template>
        <div>
            <button @click="showContextMenu">Context Menu</button>
        </div>
        <cse-context-menu
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
        class="cse--context-menu"
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
                    @click.stop="_revealSubmenu(idx)"
                >
                    <cse-icon v-if="item[iconKey]" :icon="item[iconKey]" />
                    <span v-else style="width:1em;display:inline-block;" />
                    <span class="ml-1 mr-2">{{ item[textKey] }}</span>
                    <span class="spacer" />
                    <cse-icon icon="chevron-right" />
                    <transition name="fade" mode="out-in">
                        <cse-context-menu
                            v-if="submenu.idx === idx"
                            :x="submenu.x"
                            :y="submenu.y"
                            :items="item.items"
                            :level="level+1"
                            @selected="_handleItemClicked(item)"
                        />
                    </transition>
                </li>
                <li
                    v-else
                    :key="`item-${idx}`"
                    :class="{disabled:item.disabled===true}"
                    @click.stop="_handleItemClicked(item)"
                >
                    <cse-icon v-if="item[iconKey]" :icon="item[iconKey]||'blank'" />
                    <span v-else style="width:1em;display:inline-block;" />
                    <span class="ml-1 mr-2">{{ item[textKey] }}</span>
                </li>
            </template>
        </ul>
    </div>
</template>

<script>
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

// the context menu can be dismissed without making a selection by clicking
// anywhere outside the bounds of the context menu, by pressing the ESCAPE
// key, or moving the mouse pointer outside the window
const CANCELLATION_EVENTS = ['keydown', 'mousedown', 'mouseout',];

export default {
    name:'cse-context-menu',
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
            type: Boolean,
            default: false,
        },
        level:
        {
            type: Number,
            default: 0,
        }
    },
    data()
    {
        return {
            // the DIV containing the context menu
            container: null,
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
    computed:{
        isTopMenu() { return this.level === 0; }
    },
    mounted()
    {
        let x = this.x;
        let y = this.y;

        // need to make sure we keep the context menu inside the available screen space - we can
        // also opt to ignore the taskbar and appear over the top of it if desired, but generally
        // we don't want to do that
        const desktopBounds = this.ignoreTaskbar ? this.$store.getters.screenBounds : this.$store.getters.desktopBounds;

        // work out bounds for context menu
        this.container = this.$el;

        this.pos.x = MathUtils.clamp(x, desktopBounds.left, desktopBounds.right);
        this.pos.y = MathUtils.clamp(y, desktopBounds.top, desktopBounds.bottom);

        this.$nextTick(() =>
        {
            // once the positions are all updated, wait for the next 'tick' to correct
            // any problems with disappearing off the edge of the screen; we don't know
            // if this happens until after the location/size of the container has been
            // updated and the component has been rendered, hence the need to wait for
            // the tick.
            const parentMenu = this.container.parentElement;
            if(!parentMenu)
                return; // we are not a sub-menu, so everything is cool

            // get our *absolute* position on the screen and our *current* bounds
            // now that we are rendered
            const bounds = this.container.getBoundingClientRect();

            // check the right edge and bottom to see if we go off the screen
            const rightEdge = bounds.x + bounds.width;
            const bottomEdge = bounds.y + bounds.height;
            if( rightEdge > desktopBounds.right)
            {
                // we're off the right edge of the screen - reposition so we are aligned
                // with the left side of the parent menu
                const parentBounds = parentMenu.getBoundingClientRect();
                this.pos.x -= parentBounds.width;
                this.pos.x -= bounds.width;
            }
            if(bottomEdge > desktopBounds.bottom)
            {
                // we're off the bottom edge of the screen - reposition so we are aligned
                // with the bottom edge of the screen
                this.pos.y -= (bottomEdge - desktopBounds.bottom);
            }

            CANCELLATION_EVENTS.forEach((evtName) =>
            {
                document.addEventListener(evtName, this._watchForClickOutsideOrEscape);
            });
        });
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
        _revealSubmenu(idx)
        {
            const subMenuListItem = this.$refs[`submenu-${idx}`][0];
            const bounds = subMenuListItem.getBoundingClientRect();

            this.submenu.x = bounds.x + bounds.width;
            this.submenu.y = bounds.top;

            // this next will reveal the sub-menu as the indices will match; see...
            //    v-if="submenu.idx === idx"
            // ...in the template
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
         * This method checks for clicks outside the context menu or pressing
         * of the escape key, or the mouse moving outside the window to
         * cancel/dismiss the context menu without making a selection.
         */
        _watchForClickOutsideOrEscape(evt)
        {
            if(this.container.contains(evt.target))
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
    }
};
</script>
