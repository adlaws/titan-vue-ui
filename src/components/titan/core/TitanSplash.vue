<template>
    <div
        class="titan--splash"
    >
        <cse-logo :size="128" />
        <div class="ml-2">
            <span style="font-size:200%;">&nbsp;CALYTRIX CSE</span>
            <br>
            <span style="font-size:75%;">COPYRIGHT 2020</span>
        </div>
    </div>
</template>

<script>
import CseLogo from '@/components/titan/core/CseLogo.vue';

export default {
    name:'titan-splash',
    components:
    {
        CseLogo
    },
};
</script>

<style lang="scss">
@import '@/assets/scss/mixins-functions.scss';
@import '@/assets/scss/variables.scss';

.titan--splash
{
    display: flex;
    justify-content:center;
    align-items: center;

    overflow: hidden;
    position:absolute;

    top:37.5%;
    left:37.5%;
    width:25vw;
    height:25vh;
    min-width:450px;
    min-height:250px;

    background-color: rgba($menu-bg-inactive,0.9);
    backdrop-filter: $glass-blur;
    color: $menu-fg-inactive;

    @include box-shadow($drop-shadow-large, $menu-bg-inactive, 1.0);
    border-radius: 4px;
}
</style>