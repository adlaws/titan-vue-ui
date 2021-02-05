<template>
    <i
        class="m-0 p-0"
        :class="mdiClasses"
        :style="{fontSize:size, color:color}"
        @click="$emit('click', $event)"
        @dblclick="$emit('dblclick', $event)"
        @contextmenu="$emit('contextmenu', $event)"
        @mousedown="$emit('mousedown', $event)"
        @mouseup="$emit('mouseup', $event)"
        @mousemove="$emit('mousemove', $event)"
        @mouseenter="$emit('mouseenter', $event)"
        @mouseleave="$emit('mouseleave', $event)"
        @mouseover="$emit('mouseover', $event)"
        @mouseout="$emit('mouseout', $event)"
    />
</template>

<script>
export default {
    name: 'cse-icon',
    props:
    {
        icon: {
            type: String,
            default: '',
        },
        pack: {
            type: String,
            default: 'mdi',
        },
        size: {
            type: String,
            default: '1em;',
        },
        color: {
            type: String,
            default: null,
        },
    },
    computed:
    {
        mdiClasses()
        {
            return this.pack + ' '+ this.icon.split(' ').map(x => this.pack+'-'+x).join(' ');
        },
    }
};
</script>