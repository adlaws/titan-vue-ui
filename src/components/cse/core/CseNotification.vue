<template>
    <div
        class="cse-desktop--notification"
        :class="type"
        @click="expire"
    >
        <div class="notification-content">
            <v-icon v-if="_icon">
                {{ _icon }}
            </v-icon>
            <div
                v-else
                class="icon-spacer"
            />
            <div class="notification-text">
                {{ content }}
            </div>
        </div>
        <div
            v-if="_showProgress"
            ref="lifetimeBar"
            class="lifetime-bar"
            :style="`transition: width ${lifetime/1000}s linear;`"
        />
    </div>
</template>

<script>
const TYPE_ICON = {
    info: 'mdi-information',
    warning: 'mdi-alert',
    error: 'mdi-alert-octagon',
    success: 'mdi-check-circle',
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
            default: null,
        },
        lifetime:
        {
            type: Number,
            default: 5000,
        },
        noProgress:
        {
            type: Boolean,
            default: false,
        },
    },
    computed:
    {
        _icon() {return this.icon || TYPE_ICON[this.type.toLowerCase()] || false; },
        _showProgress() { return !this.noProgress && this.lifetime > 0; },
    },
    mounted()
    {
        if(this.lifetime >= 0)
        {
            setTimeout(this.expire, this.lifetime);
            if(this._showProgress)
            {
                this.$nextTick(()=>
                {
                    this.$refs.lifetimeBar.style.width = '0%';
                });
            }
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
