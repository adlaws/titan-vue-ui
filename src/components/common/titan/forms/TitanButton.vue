<template>
    <button
        class="titan-button"
        :disabled="isDisabled"
        :title="tooltip"
        @click="handleClick"
    >
        <template v-if="hasLabel">
            {{ label }}
        </template>
        <template v-else>
            <slot />
        </template>
    </button>
</template>

<script>
/**
 * Example usages:
 *
 * Basic usage:
 *      <titan-button label="Push This" @click="doSomething" />
 * Disabled:
 *      <titan-button label="Push This" @click="doSomething" disabled />
 * Custom content:
 *      <titan-button @click="doSomething" />
 *          <p>Push This</p>
 *          <p>To Win!</p>
 *      </titan-button>
 */
export default {
    name: 'titan-button',
    props:
    {
        label:{
            // the text on the button
            type:String,
            default: '',
        },
        tooltip:{
            // the text to display on mouse hover
            type:String,
            default: null,
        },
        disabled:{
            // is the button disabled?
            type:[String, Boolean],
            default: null,
        },
    },
    computed:
    {
        isDisabled()
        {
            // determine disabled state
            if(this.disabled === null)
                return false;
            if(typeof(this.noClose)==='string')
                return this.noClose.toLowerCase()!=='false';
            // must be boolean (by nature of the `disabled` prop's `type` requirements)
            return this.disabled === true;
        },
        hasLabel()
        {
            if(!this.label || this.label.length===0)
                return false;
            return true;
        },
    },
    methods:
    {
        handleClick(evt)
        {
            if(!this.isDisabled)
                this.$emit('click', evt);
        },
    },
};
</script>

<style lang="scss">
/*
button.titan-button {
    $bgColor:         #2f3d47;
    $highlightColor:  #40c4eb;
    $disabledColor:   #BBB;
    $disabledBgColor: transparent;

    color: $highlightColor;
    background-color: $bgColor;
    border: 1px solid $highlightColor;
    font-weight: bold;
    cursor:pointer;
    &:hover {
        color: $bgColor;
        border-color: $bgColor;
        background-color: $highlightColor;
    }
    &[disabled], &[disabled]:hover {
        cursor:default;
        color: $disabledColor;
        border-color: $disabledColor;
        background-color: $disabledBgColor;
    }
}
*/
</style>
