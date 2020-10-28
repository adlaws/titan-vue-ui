<template>
    <titan-desktop
        title="Main "
        titan-id="ui.calytrix.vue-in-titan"
        :icon="favicon"
        :size="{width:800,height:700}"
    >
        <template v-slot:default>
            FOO
        </template>
    </titan-desktop>
</template>

<script>
import favicon from '@/assets/img/terrainconnect-favicon.png';

import TitanDesktop from '@/components/titan/core/TitanDesktop.vue';

export default {
    name: 'app',
    components: {
        TitanDesktop,
    },
    data()
    {
        return {
            favicon: favicon,
        };
    },
};
</script>

<style lang="scss">
    // material design icons https://materialdesignicons.com/
    @import '~@mdi/font/css/materialdesignicons.css';

    // TREX style overrides
    // @import '@/assets/scss/titan/titan.scss';
    // @import '@/assets/scss/titan/titan-widgets.scss';
</style>
