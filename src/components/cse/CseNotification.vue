<template>
    <div
        class="cse-desktop--notification"
        :style="{color:_color}"
        @click="expire"
    >
        <div class="notification-content">
            <cse-icon
                v-if="_icon"
                :icon="_icon"
                size="2em"
            />
            <div
                v-else
                class="icon-spacer"
                :style="`border-left: 1em solid ${_color};`"
            />
            <div class="notification-text">
                {{ content }} {{ lifetime }}
            </div>
        </div>
        <div
            v-if="!noProgress"
            ref="lifetimeBar"
            class="lifetime-bar"
            :style="{'background-color':_color, 'transition-duration':_transitionDuration}"
        />
    </div>
</template>

<script>
const TYPE_ICON = {
    info: 'information',
    warning: 'alert',
    error: 'alert-octagon',
    success: 'check-circle',
};

const TYPE_COLORS = {
    info: '#0288D1',
    warning: '#FBC02D',
    error: '#D32F2F',
    success: '#689F38',
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
            TYPE_COLORS
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
        _color()
        {
            return TYPE_COLORS[this.type]||'#08f';
        },
        _transitionDuration()
        {
            return this.lifetime/1000 +'s';
        }
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
