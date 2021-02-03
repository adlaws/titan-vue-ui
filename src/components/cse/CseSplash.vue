<template>
    <div
        class="cse-splash"
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
export default {
    name:'cse-splash',
    computed:
    {
        year:() => new Date().getFullYear()
    },
};
</script>
