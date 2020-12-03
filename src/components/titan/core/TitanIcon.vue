<template>
    <i
        class="m-0 p-0"
        :class="mdiClasses"
        :style="`font-size:${size};`"
    />
</template>

<script>
export default {
    name: 'titan-icon',
    props:
    {
        icon: {
            type: String,
            default: '',
        },
        size: {
            type: String,
            default: '1em;',
        },
        angle: {
            type: Number,
            default: 0,
        },
    },
    computed:
    {
        mdiClasses()
        {
            return 'mdi '+ this.icon.split(' ').map(x => 'mdi-'+x).join(' ');
        }
    }
};
</script>