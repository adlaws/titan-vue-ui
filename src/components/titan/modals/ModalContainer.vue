<template>
    <div class="modal-container-mask" :class="{active: isVisible}">
        <slot />
    </div>
</template>

<script>
export default {
    name: 'modal-container',
    props:{
        isVisible: {type: Boolean, default:false},
    },
};
</script>

<style lang="scss">
.modal-container-mask {
    /* Flexbox layout */
    display: flex;
    justify-content: center;
    align-items: center;
    /* general appearance */
    z-index: -99999;
    background-color: rgba(0, 0, 0, 0.5);
    position: fixed;
    width: 0px;
    height: 0px;
    top: 0px;
    left: 0px;
    transition: opacity 0.333s ease-out;
    opacity: 0.0;

    &.active {
        opacity: 1.0;
        width: 100%;
        height: 100%;
        z-index: 99999;
    }
}
</style>
