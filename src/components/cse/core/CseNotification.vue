<template>
    <div
        class="cse-desktop--notification"
        :class="type"
        @click="expire"
    >
        <v-icon v-if="_icon">
            {{ _icon }}
        </v-icon>
        <div class="notification-content">
            {{ content }}
        </div>
    </div>
</template>

<script>
const TYPE_ICON = {
    info: 'mdi-information',
    error: 'mdi-alert-octagon-outline',
    success: 'mdi-check-bold',
    warning: 'mdi-alert',
};

export default {
    name:'',
    props:{
        type:
        {
            type: String,
            default: 'info',
        },
        content:
        {
            type: String,
            default: ''
        },
        icon:
        {
            type: String,
            default: 'mdi-information',
        },
        lifetime:
        {
            type: Number,
            default: 5000,
        },
    },
    computed:
    {
        _icon() {return this.icon || TYPE_ICON[this.type] || false; }
    },
    mounted()
    {
        if(this.lifetime >= 0)
        {
            setTimeout(this.expire, this.lifetime);
        }
    },
    methods:
    {
        expire()
        {
            this.$emit('expired');
        },
    }
};
</script>
