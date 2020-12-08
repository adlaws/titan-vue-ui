<!-- ------------------------------------------------------------------------------------------
A drop down toolbar, which displays a row of items under it ready for action:

                 ----------------------V----------------------
                               +---+ +---+ +---+
                               | A | | B | | C |
                               +---+ +---+ +---+

@param {Number} size the width of the dropdown trigger in pixels
@param {Number} y the preferred y position on the screen (offset from top of screen)
@param {Array} items the items

Events:
    @selected fired when an item is selected, with the selected item as the parameter
    @cancelled fired when the context menu is closed with no selection being made

Example use:

    <template>
        <dropdown-toolbar
            :y="64"
            :items="items"
            @selected="handleSelected"
        />
    </template>

    <script>
        export default {
            data()
            {
                return {
                        items: [
                            {id:'a', icon:'car', text:'Car'},
                            {id:'b', icon:'ferry', text:'Ferry'},
                            {id:'c', icon:'airplane', text:'Aeroplane'},
                        ]
                    },
                };
            },
            methods:
            {
                handleSelected(selected)
                {
                    console.log(selected.id);
                }
            }
        };
    </script>
----------------------------------------------------------------------------------------------- -->
<template>
    <div
        ref="container"
        class="titan--dropdown-toolbar"
        @mouseenter="_handleMouseEnter"
        @mouseleave="_handleMouseLeave"
    >
        <div @click="_toggleShow">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 360 14"
                :width="size"
            >
                <g
                    ref="trigger"
                    :fill="color"
                    :opacity="opacity"
                >
                    <path v-if="showItems" d="M0 8l176.54-2L180 0l3.46 6L360 8z" />
                    <path v-else d="M0 6l176.54 2 3.46 6 3.46-6L360 6z" />
                </g>
            </svg>
        </div>
        <transition
            name="fade"
            mode="out-in"
            @enter="_updatePosition"
            @after-leave="_updatePosition"
        >
            <div
                v-if="showItems"
            >
                <ul>
                    <li
                        v-for="(item, idx) in items"
                        :key="`item-${idx}`"
                        @click="_selected(item)"
                    >
                        <titan-icon :icon="item.icon" />
                        <span class="label">{{ item.text }}</span>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script>
import EventUtils, { KEY_CODE } from '@/assets/js/utils/event-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

const APPEARANCE = {
    ACTIVE: {opacity: 1.0, color: '#888'},
    INACTIVE: {opacity: 0.5, color: '#888'},
};
// the toolbar can be dismissed without making a selection by clicking
// anywhere outside the bounds of the context menu, or by pressing the ESCAPE
// key
const CANCELLATION_EVENTS = ['keydown', 'mousedown'];

export default {
    name: 'dropdown-toolbar',
    components:
    {
        TitanIcon
    },
    props:
    {
        size:
        {
            type: Number,
            default: 480,
        },
        y:
        {
            type: Number,
            default: 0,
        },
    },
    data()
    {
        return {
            showItems: false,
            opacity: APPEARANCE.INACTIVE.opacity,
            color: APPEARANCE.INACTIVE.color,
            items:[
                {id:'a',icon:'map', text:'Map'},
                {id:'b',icon:'draw', text:'Drawing'},
                {id:'c',icon:'car', text:'Entities'},
                {id:'d',icon:'radio-handheld', text:'CNR'},
                {id:'e',icon:'vector-polyline', text:'Waypoints'},
                {id:'f',icon:'rabbit', text:'Rabbits'},
            ],
            autoCloseTimeout: null,
            showTime: null,
        };
    },
    computed:
    {
        desktopBounds() { return this.$store.getters.desktopBounds; },
    },
    watch:
    {
        desktopBounds: function() { this._updatePosition(); },
        y: function() { this._updatePosition(); },
        size: function() { this._updatePosition(); },
        showItems: function(isShowing)
        {
            this._cancelAutoClose();
            this.opacity = isShowing ? APPEARANCE.ACTIVE.opacity : APPEARANCE.INACTIVE.opacity;
            this.color = isShowing ? APPEARANCE.ACTIVE.color : APPEARANCE.INACTIVE.color;
            this.showTime = isShowing ? Date.now() : null;
            const addOrRemove = isShowing ? document.addEventListener : document.removeEventListener;
            CANCELLATION_EVENTS.forEach((evtName) =>
            {
                addOrRemove(evtName, this._watchForClickOutsideOrEscape);
            });
        }
    },
    mounted()
    {
        this.$refs.trigger.style.transition = 'all 0.25s ease-in-out';
        this._updatePosition();
    },
    beforeDestroy()
    {
        // stop any scheduled close of the dropdown
        this._cancelAutoClose();
        // unbind any handlers waiting for clicks outside the dropdown area or
        // escape key presses
        CANCELLATION_EVENTS.forEach((evtName) =>
        {
            document.removeEventListener(evtName, this._watchForClickOutsideOrEscape);
        });
    },
    methods:
    {
        /**
         * When an item is selected, fire off an event so listeners can do the things
         */
        _selected(item)
        {
            this.showItems = false;
            this.$emit('selected', item);
        },
        /**
         * Work out where the dropdown area needs to be to remain centered (after a size
         * or desktop area change, for example)
         */
        _updatePosition()
        {
            const container = this.$refs.container;
            const containerBounds = container.getBoundingClientRect();

            container.style.left = (this.desktopBounds.left + ((this.desktopBounds.w - containerBounds.width)/2)) + 'px';

            if(typeof this.y === 'number')
                container.style.top = MathUtils.clamp(this.y, this.desktopBounds.top, this.desktopBounds.bottom-containerBounds.height) + 'px';
        },
        /**
         * When the mouse enters the dropdown area, we automatically show the items
         */
        _handleMouseEnter()
        {
            // stop any scheduled close of the dropdown
            this._cancelAutoClose();
            this.showItems = true;
        },
        /**
         * When the mouse leaves the dropdown area, we trigger an automatic close after
         * 1 second (this is cancelled if the user re-enters the dropdown area)
         */
        _handleMouseLeave()
        {
            this._cancelAutoClose();
            this.autoCloseTimeout = setTimeout(()=>
            {
                this.$emit('cancelled'); // cancelled without selection
                this.showItems = false;
            }, 1000);
        },
        /**
         * Toggles the visibility of the items in the dropdown area
         */
        _toggleShow()
        {
            // stop any scheduled close of the dropdown
            this._cancelAutoClose();

            // since the dropdown items appearance can be toggled with a click, there's a
            // tendancy after a while of using it to go up and click on the bar, which simply
            // hides the dropdown items if the have just been displayed, which is annoying.
            // To counter this we enforce a short delay after showing the items before we
            // allow them to be toggled off with a click. Trust me, it's a much better
            // user experience this way :) [adlaws]
            if(this.showItems && this.showTime!==null)
            {
                if(Date.now() - this.showTime < 333)
                    return; // to little time has passed to toggle the items away yet
            }

            this.showItems = !this.showItems;
            if(!this.showItems)
                this.$emit('cancelled'); // cancelled without selection
        },
        /**
         * This method checks for clicks outside the context menu or pressing
         * of the escape key to cancel/dismiss the context menu without making
         * a selection.
         */
        _watchForClickOutsideOrEscape(evt)
        {
            if(this.$refs.container.contains(evt.target))
                return; // it's on the toolbar, don't do anything

            if(EventUtils.isMouseDown(evt) || EventUtils.isKey(evt, KEY_CODE.ESCAPE))
            {
                this.$emit('cancelled'); // ESC key or click outside - cancelled without selection
                this.showItems = false;
            }
        },
        /**
         * Cancel any scheduled automatic close - see _handleMouseLeave()
         */
        _cancelAutoClose()
        {
            if(this.autoCloseTimeout !== null)
            {
                clearTimeout(this.autoCloseTimeout);
                this.autoCloseTimeout = null;
            }
        },
    }
};
</script>

<style lang="scss">
.titan--dropdown-toolbar
{
    position:absolute;

    display: flex;
    flex-direction: column;
    align-items: center;
    ul
    {
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-start;
        align-items: center;
        margin:0;
        padding:0;
        list-style: none;
        li
        {
            backdrop-filter: blur(10px);
            color:#CCC;

            width: 52px;
            height: 52px;
            font-size:40px;
            line-height:40px;

            margin: 0 4px;
            padding: 0;

            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;

            color:#999;
            background-color: rgba(0,16,32,1.0);
            border:1px solid rgba(0,32,64,1.0);
            border-radius:4px;

            cursor: pointer;
            &:hover
            {
                color:#FFF;
                border:1px solid rgba(0,32,64,1.0);
                background-color: rgba(0,32,64,1.0);
                box-shadow: 0 0 8px rgba(0,16,32,1.0);
            }
            &.active
            {
                color:#DDD;
                border:1px solid rgba(0,48,96,1.0);
                background-color: rgba(0,48,96,1.0);
                box-shadow: 0 0 8px rgba(0,32,64,1.0);
                &:hover
                {
                    color:#FFF;
                    border:1px solid rgba(0,64,128,1.0);
                    background-color: rgba(0,64,128,1.0);
                    box-shadow: 0 0 8px rgba(0,48,96,1.0);
                }
            }

            .label
            {
                font-size:25%;
                line-height:25%;
                margin-top:2px;
            }
        }
    }
}
</style>