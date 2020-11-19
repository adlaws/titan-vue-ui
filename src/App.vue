<template>
    <titan-desktop
        title=""
        titan-id="ui.calytrix.vue-in-titan"
        :icon="favicon"
        :size="{width:800,height:700}"
    >
        <template v-slot:default />
    </titan-desktop>
</template>

<script>
import TitanDesktop from '@/components/titan/core/TitanDesktop.vue';

export default {
    name: 'app',
    components: {
        TitanDesktop,
    },
};
</script>

<style lang="scss">
    // material design icons https://materialdesignicons.com/
    @import '~@mdi/font/css/materialdesignicons.css';

    @import '@/assets/scss/styles.scss';
</style>
