<template>
    <span
        class="m-0 p-0"
        :class="mdiClasses"
        :style="`font-size:${size};line-height:${size};`"
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
            type: String,
            default: '1em;',
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