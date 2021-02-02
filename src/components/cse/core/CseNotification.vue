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
                {{ content }} {{ lifetime }}
            </div>
        </div>
        <div
            v-if="!noProgress"
            ref="lifetimeBar"
            class="lifetime-bar"
            :style="`transition-duration:${lifetime/1000}s;`"
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
            default: '',
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
    data()
    {
        return {
            lifetimeBarElm: null,
        };
    },
    computed:
    {
        _icon()
        {
            if(this.icon === null)
                return false;
            if(this.icon.length>0)
            {
                if(this.icon.toLowerCase === 'false' || this.icon.toLowerCase === 'none')
                    return false;
                return this.icon;
            }
            return TYPE_ICON[this.type.toLowerCase()] || false;
        },
    },
    watch:
    {
        width(newValue)
        {
            console.log('width changed', newValue);
            if(newValue==='100%')this.width='0%';
        }
    },
    mounted()
    {
        this.lifetimeBarElm = this.$refs.lifetimeBar;
        if(this.lifetime >= 0)
        {
            setTimeout(this.expire, this.lifetime);
            if(this.lifetimeBarElm)
            {
                this.reset();
                setTimeout(this.start, 100);
            }
        }
    },
    methods:
    {
        reset()
        {
            if(this.lifetimeBarElm)
                this.lifetimeBarElm.style.width = '100%';
        },
        start()
        {
            if(this.lifetimeBarElm)
                this.lifetimeBarElm.style.width = '0%';
        },
        expire()
        {
            this.$emit('expired');
        },
    }
};
</script>
