<template>
    <div>
        <transition name="fade-slow" mode="out-in">
            <div
                v-show="notifications.length"
                class="cse-desktop--notifications-area"
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
    </div>
</template>

<script>
import DataUtils from '@/assets/js/utils/data-utils.js';

import CseDockableMixin from '@/components/cse/CseDockableMixin.vue';

export default {
    name:'cse-notifications-area',
    mixins:[CseDockableMixin],
    props:{
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
    },
    data()
    {
        return {
            autoAddNotifications: null,
            notifications: [
                {id: 1, content:'frame test should tales spread task alike badly trade am zoo lost pine could series gave person rays citizen leader upward bit mill vowel', lifetime: 10000, type:'info'},
                {id: 2, content:'Lucille has joined', lifetime: 12000, type:'success', icon:'login'},
                {id: 3, content:'Michael has left', lifetime: 14000, type:'warning', icon:'logout'},
                {id: 4, content:'Host 85.67.31.141 is not reachable', lifetime: 16000, type:'error'},
                {id: 5, content:'Today is '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][new Date().getDay()], lifetime: 18000, type:'info'},
            ],
            nextId:6,
        };
    },
    watch:
    {
        width() { this.updateStyles(); },
        maxHeight() { this.updateStyles(); },
    },
    mounted()
    {
        this.container = this.$el;
        this.updateStyles();

        this.autoAddNotifications = setTimeout(this.addNotification, 5000+Math.random()*5000);
    },
    destroyed()
    {
        clearTimeout(this.autoAddNotifications);
    },
    methods:
    {
        addNotification(notification)
        {
            if(!notification)
            {
                if(this.autoAddNotifications!==null)
                    clearTimeout(this.autoAddNotifications);

                const type = DataUtils.randChoice(['info','success','warning','error','primary','secondary','accent']);
                notification = {id:this.nextId, content:''+this.nextId, lifetime:2000 + Math.random()*5000, type};
                this.nextId ++;

                this.autoAddNotifications = setTimeout(this.addNotification, 1000+Math.random()*5000);
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
        },
    }
};
</script>
