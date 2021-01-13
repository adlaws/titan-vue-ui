<template>
    <transition name="fade-slow" mode="out-in">
        <div
            v-show="notifications.length"
            ref="container"
            class="cse-desktop--notifications-area"
            :class="`dock-${_dock}`"
            @click="addNotification()"
        >
            <transition-group
                name="fade-slow"
                mode="out-in"
                tag="div"
                class="notification-items"
            >
                <cse-notification
                    v-for="notification in notifications"
                    :key="`notification-${notification.id}`"
                    :type="notification.type"
                    :content="notification.content"
                    :icon="notification.icon"
                    :lifetime="notification.lifetime"
                    @expired="removeNotification(notification)"
                />
            </transition-group>
        </div>
    </transition>
</template>

<script>
import DataUtils from '@/assets/js/utils/data-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

import CseNotification from '@/components/cse/core/CseNotification.vue';

export default {
    name:'',
    components:
    {
        CseNotification
    },
    props:{
        dock:
        {
            type: String,
            default: 'w'
        },
        width:
        {
            type: Number,
            default: 200,
        },
        maxHeight:
        {
            type: Number,
            default: -1,
        },
        offset:
        {
            type: [Number, String],
            default: 200,
        },
        ignoreTaskbar:
        {
            type: Boolean,
            default: false,
        },
    },
    data()
    {
        return {
            currentOffset: 0,
            resizeObserver: null,
            bounds:{width:0, height:0},
            notifications: [
                {id: 1, content:'frame test should tales spread task alike badly trade am zoo lost pine could series gave person rays citizen leader upward bit mill vowel', lifetime: 10000, type:'info'},
                {id: 2, content:'Lucille has joined', lifetime: 12000, type:'success', icon:'mdi-login'},
                {id: 3, content:'Michael has left', lifetime: 14000, type:'warning', icon:'mdi-logout'},
                {id: 4, content:'Host 85.67.31.141 is not reachable', lifetime: 16000, type:'error'},
                {id: 5, content:'Today is '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()], lifetime: 18000, type:'info'},
            ],
        };
    },
    computed:
    {
        _dock() { return '' + this.dock.toLowerCase().charAt(0); },
        isDockEast() { return this._dock === 'e'; },
        isDockWest() { return this._dock === 'w'; },
        isDockNorth() { return this._dock === 'n'; },
        isDockSouth() { return this._dock === 's'; },
        isDockEW() { return this.isDockEast || this.isDockWest; },
        isDockNS() { return !this.isDockEW; },
        desktopBounds() { return this.ignoreTaskbar ? this.$store.getters.screenBounds : this.$store.getters.desktopBounds; },
        minXoffset() { return this.desktopBounds.left; },
        maxYoffset() { return this.desktopBounds.bottom - this.bounds.height; },
        minYoffset() { return this.desktopBounds.top; },
        maxXoffset() { return this.desktopBounds.right - this.bounds.width; },
    },
    watch:
    {
        'bounds.width': function() { this.updateStyles(); },
        'bounds.height': function() { this.updateStyles(); },
        dock() { this.updateStyles(); },
        offset(newOffset) { this.currentOffset = this.parseOffset(newOffset); this.updateStyles(); },
        currentOffset() { this.updateStyles(); },
        desktopBounds() { this.updateStyles(); },
        width() { this.updateStyles(); },
        height() { this.updateStyles(); },
    },
    mounted()
    {
        this.container = this.$refs.container;
        this.resizeObserver = new ResizeObserver(this.updateBounds).observe(this.container);

        this.currentOffset = this.parseOffset(this.offset);

        this.updateBounds();
        this.updateStyles();
    },
    destroyed()
    {
        delete this.resizeObserver;
    },
    methods:
    {
        addNotification(notification)
        {
            if(!notification)
            {
                const type = DataUtils.randChoice(['info','success','warning','error','primary','secondary','accent']);
                notification = {id:Date.now(), content:''+Date.now(), lifetime:2000 + Math.random()*5000, type};
                setTimeout(this.addNotification, 3000+Math.random()*5000);
            }
            this.notifications.push(notification);
        },
        /**
         * Remove a notification from display
         * @param {Object} notification the notification to remove
         */
        removeNotification(notification)
        {
            for(let idx=0; idx<this.notifications.length; idx++)
            {
                if(notification.id === this.notifications[idx].id)
                {
                    this.notifications.splice(idx, 1);
                    return;
                }
            }
        },
        /**
         * Called by the ResizeObserver initialised in the mounted()
         * lifecycle hook, which is triggered if the `container` DOM element
         * changes in size
         */
        updateBounds()
        {
            const bounds = this.container.getBoundingClientRect();
            this.bounds.width = bounds.width;
            this.bounds.height = bounds.height;
            this.currentOffset = this.parseOffset(this.offset);
        },
        /**
         * Parse the offset property, and return a value in pixels which can be
         * used to position the docakble along the edge it is docked to.
         *
         * The offset property may be one of:
         *  - a numeric value: if positive, this is the pixel offset from the
         *    'start' of the docked edge, and if negative from the 'end' of
         *    the docked edge. The start of the N/S edges is the left, and the
         *    end is the right. The start of the E/W edges is the top, and the
         *    end is the bottom.
         *  - a string value: if the string value can be parsed as a number,
         *    the numeric value rules apply (see above). Otherwise the allowed
         *    values are 'start', 'end', and 'center' (NOTE: 'middle' is an
         *    allowed alias for 'center'). 'start' and 'end' will position the
         *    dockable at the start and end of the docked edge, and 'center' will
         *    position it in the center of the edge.
         *
         * @param {Number, String} offset the offset value
         * @return {Number} an offset value in pixels
         */
        parseOffset(offset)
        {
            if(!offset)
                return 0;

            // could be just a number (pixel offset)
            const offsetFloat = parseFloat(offset);
            if(!isNaN(offsetFloat))
            {
                if(offsetFloat >= 0)
                    return offsetFloat;

                // negative value - position is relative to 'end' of edge
                if(this.isDockEW)
                    return (this.desktopBounds.bottom  - this.bounds.height) + offsetFloat;
                else
                    return (this.desktopBounds.right  - this.bounds.width) + offsetFloat;
            }

            // not a number, so check for one of 'start', 'middle'  and 'end'.
            // this check is case insensitive and only uses the first character
            // and so is quite resilient to typos in the property value
            const offsetStr = (''+ offset).toLowerCase().charAt(0);
            if(offsetStr === 'e') // 'end'
            {
                // position at 'end' of edge
                if(this.isDockEW)
                    return this.desktopBounds.bottom - this.bounds.height;
                else
                    return this.desktopBounds.right - this.bounds.width;
            }
            else if(offsetStr === 'c' || offsetStr === 'm') // 'center' or 'middle'
            {
                // position at 'center' of edge
                if(this.isDockEW)
                    return this.desktopBounds.top + (this.desktopBounds.h / 2) - (this.bounds.height / 2.0);
                else
                {
                    return this.desktopBounds.left + (this.desktopBounds.w / 2) - (this.bounds.width / 2.0);
                }
            }
            // for anything else just position it at the start of the edge
            return 0;
        },
        /**
         * Utility method to update the CSS styles required to position and
         * display the dockable
         */
        updateStyles()
        {
            if(this.container === null)
                return;

            const style = this.container.style;

            style.maxHeight = this.maxHeight <= 0 ? 'auto' : this.maxHeight + 'px';
            style.width = this.width + 'px';

            if(this.isDockEW)
            {
                // constrain so it fits with screen bounds
                style.top = MathUtils.clamp(this.currentOffset, this.minYoffset, this.maxYoffset) + 'px';

                let xPos = 0;
                if(this.isDockEast)
                {
                    xPos = this.desktopBounds.right - this.bounds.width;
                }
                style.left = xPos + 'px';
            }
            else // if(this.isDockNS)
            {
                // constrain so it fits with screen bounds
                style.left = MathUtils.clamp(this.currentOffset, this.minXoffset, this.maxXoffset) + 'px';

                let yPos = 0;
                if(this.isDockSouth)
                {
                    yPos = this.desktopBounds.bottom - this.bounds.height;
                }
                style.top = yPos + 'px';
            }
        },
    }
};
</script>
