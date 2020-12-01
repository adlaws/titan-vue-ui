<template>
    <div
        class="titan--context-menu"
        :style="`left:${x}px;top:${y}px;`"
    >
        <ul>
            <template
                v-for="(item, idx) in items"
            >
                <li v-if="item.separator"
                    :key="`item-${idx}`"
                    class="separator"
                >
                    <hr>
                </li>
                <li v-else
                    :key="`item-${idx}`"
                    :class="{disabled:item.disabled===true}"
                    @click="$emit('selected', item)"
                >
                    {{ item.text }}
                </li>
            </template>
        </ul>
    </div>
</template>

<script>
export default {
    name:'titan-context-menu',
    props:
    {
        x:
        {
            type:Number,
            default:0
        },
        y:
        {
            type:Number,
            default:0
        },
        items:{
            type:Array,
            default:() => []
        },
    },
};
</script>

<style lang="scss">
.titan--context-menu
{
    z-index: 1025;

    box-shadow: 0 0 16px rgba(0,0,0,0.8);
    background-color: rgba(0,32,64,0.9);
    border-radius: 2px;

    padding: 0;
    margin: 0;
    position: absolute;
    min-width:10em;

    ul
    {
        margin:0;
        padding:0;
        list-style: none;
        li
        {
            margin:0px;
            padding: 4px 8px;
            &.disabled
            {
                color: rgba(255,255,255,0.333);
            }
            &.separator
            {
                padding: 0px 8px;
            }
            &:not(.separator):not(.disabled)
            {
                &:hover
                {
                    cursor: pointer;
                    color: white;
                    background-color: rgba(0,64,128,0.9);
                }
            }
            &.disabled
            {
                &:hover
                {
                    cursor: not-allowed;
                }
            }
        }
    }

    color: white;
    background-color: rgba(0,16,32,0.9);
}
</style>
