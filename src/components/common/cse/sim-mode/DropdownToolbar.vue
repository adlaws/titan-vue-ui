<!-- ------------------------------------------------------------------------------------------
A drop down toolbar, which displays a row of items under it ready for action:

                ----------------------V----------------------
                          +---+ +---+   +---+ +---+
                          | A | | B |   | C | | D |
                          +---+ +---+   +---+ +---+

@param {Number} size the width of the dropdown trigger in pixels
@param {Number} y the preferred y position on the screen (offset from top of screen)
@param {Array} items the items

Events:
    @selected fired when an item is selected, with the selected item as the parameter
    @cancelled fired when the dropdown is closed with no selection being made

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
                            {separator:true},
                            {id:'c', icon:'airplane', text:'Aeroplane'},
                            {id:'d', icon:'submarine', text:'Submarine'},
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
        class="cse-desktop--dropdown-toolbar"
        @mouseenter="_handleMouseEnter"
        @mouseleave="_handleMouseLeave"
    >
        <div
            class="trigger"
            @click="_toggleShow"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 360 14"
                :width="size"
            >
                <g :fill="color" :opacity="opacity">
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
                <transition
                    :name="`slide-${navDirection}`"
                    mode="out-in"
                >
                    <ul
                        :key="`group-${groupIdx}`"
                    >
                        <template
                            v-for="(item, idx) in currentGroup.items"
                        >
                            <li
                                v-if="item.separator"
                                :key="`item-${groupIdx}-${idx}`"
                                class="separator"
                            />
                            <li
                                v-else
                                :key="`item-${idx}`"
                                class="item"
                                @click="_selected(item)"
                            >
                                <cse-icon :icon="item.icon" />
                                <span class="label">{{ item.text }}</span>
                            </li>
                        </template>
                    </ul>
                </transition>
                <div
                    v-if="hasPreviousGroup || hasNextGroup"
                    class="pagination"
                    style="display:flex;justify-content:space-between;"
                >
                    <div
                        class="previous"
                        :class="{empty:!hasPreviousGroup}"
                        @click="navDirection='right';groupIdx--"
                    >
                        <span v-if="hasPreviousGroup">
                            <cse-icon icon="chevron-left" />
                            {{ previousGroup.name }}
                            <cse-icon
                                v-if="previousGroup.icon"
                                :icon="previousGroup.icon"
                            />
                        </span>
                    </div>
                    <div
                        class="next"
                        :class="{empty:!hasNextGroup}"
                        @click="navDirection='left';groupIdx++"
                    >
                        <span v-if="hasNextGroup">
                            <cse-icon
                                v-if="nextGroup.icon"
                                :icon="nextGroup.icon"
                            />
                            {{ nextGroup.name }}
                            <cse-icon icon="chevron-right" />
                        </span>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

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
            navDirection: 'right',
            groupIdx: 1,
            groups:[
                {
                    name:'Terrain',
                    icon:'terrain',
                    items:[
                        {id:'a',icon:'road-variant', text:'Roads'},
                        {id:'b',icon:'pine-tree', text:'Scenery'},
                        {separator: true},
                        {id:'c',icon:'server-network', text:'Terrain Connect'},
                        {id:'d',icon:'package-variant', text:'Terrain Packs'},
                    ],
                },
                {
                    name:'World',
                    icon:'earth',
                    items:[
                        {id:'g',icon:'alpha-x-box-outline', text:'ORBAT'},
                        {id:'h',icon:'file-table-box-outline', text:'Overlays'},
                        {id:'i',icon:'radio-handheld', text:'Comms'},
                        {separator: true},
                        {id:'j',icon:'tank', text:'Units'},
                        {id:'k',icon:'vector-polyline', text:'Waypoints'},
                        {id:'l',icon:'electric-switch', text:'Triggers'},
                        {separator: true},
                        {id:'m',icon:'map', text:'Scenario'},
                        {id:'n',icon:'chart-timeline', text:'Briefing'},
                        {id:'o',icon:'globe-model', text:'World'},
                    ],
                },
                {
                    name:'Tools',
                    icon:'hammer-wrench',
                    items:[
                        {id:'p',icon:'alert-octagram', text:'Fires'},
                        {id:'q',icon:'bomb', text:'Munition'},
                        {id:'r',icon:'notebook', text:'Reports'},
                        {id:'s',icon:'book-variant', text:'Bookmarks'},
                        {separator: true},
                        {id:'k',icon:'mine', text:'Plugin A'},
                        {id:'t',icon:'flower', text:'Plugin B'},
                        {id:'u',icon:'chess-knight', text:'Plugin C'},
                        {id:'v',icon:'motion', text:'Plugin D'},
                    ],
                },
            ],
            autoCloseTimeout: null,
            showTime: null,
        };
    },
    computed:
    {
        desktopBounds() { return this.$store.getters.desktopBounds; },
        currentGroup()
        {
            if(this.groups.length === 0)
                return [];

            return this.groups[this.groupIdx] || [];
        },
        previousGroup()
        {
            if(this.groupIdx<1)
                return null;
            return this.groups[this.groupIdx-1];
        },
        nextGroup()
        {
            if(this.groupIdx>=this.groups.length-1)
                return null;
            return this.groups[this.groupIdx+1];
        },
        hasPreviousGroup() { return this.previousGroup !== null; },
        hasNextGroup() { return this.nextGroup !== null; },
    },
    watch:
    {
        desktopBounds: function() { this.$nextTick(this._updatePosition); },
        y: function() { this.$nextTick(this._updatePosition); },
        size: function() { this.$nextTick(this._updatePosition); },
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

            container.style.left = (this.desktopBounds.left + ((this.desktopBounds.width - containerBounds.width)/2)) + 'px';

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

            if(EventUtils.isMouseDown(evt) || EventUtils.isKey(evt, KEY.KEY_CODE.ESCAPE))
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
