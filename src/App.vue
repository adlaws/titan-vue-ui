<template>
    <router-view />
</template>

<script>
import { $eview, $isInOuterra } from '@/assets/js/titan/titan-utils.js';

export default {
    name: 'app',
    mounted()
    {
        if(!$isInOuterra)
            return;

        $eview.set_transparent(true);
        $eview.show_window(true);

        self.moveTo(0, 0);
        self.resizeTo(screen.availWidth, screen.availHeight);
    }
};
</script>

<style lang="scss">
    // material design icons https://materialdesignicons.com/
    @import '~@mdi/font/css/materialdesignicons.css';
    @import '@/assets/scss/styles.scss';
</style>
