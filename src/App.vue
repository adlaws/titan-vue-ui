<template>
    <v-app>
        <router-view />
    </v-app>
</template>

<script>
import { $eview, $isInsideTitan } from '@/assets/js/titan/titan-utils.js';

export default {
    name: 'app',
    mounted()
    {
        if(!$isInsideTitan)
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
