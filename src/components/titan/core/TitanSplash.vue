<template>
    <div
        class="titan--splash"
    >
        <cse-logo :size="128" />
        <div class="ml-2">
            <span style="font-size:200%;">Calytrix CSE</span>
            <br>
            <span style="font-size:75%;">COPYRIGHT {{ year }}</span>
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
    computed:
    {
        year:() => new Date().getFullYear()
    },
};
</script>
