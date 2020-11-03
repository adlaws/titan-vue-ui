<template>
    <span
        class="m-0 p-0"
        :class="mdiClasses"
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
        }
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