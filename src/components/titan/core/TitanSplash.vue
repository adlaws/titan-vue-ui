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
    data()
    {
        return {};
    }
};
</script>

<style lang="scss">
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

    color: white;
    background-color: rgba(0,16,32,0.9);
    box-shadow: 0 0 16px black;
    border-radius: 4px;
}
</style>