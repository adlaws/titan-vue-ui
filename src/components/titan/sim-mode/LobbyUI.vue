<template>
    <div>
        <div
            v-for="(pluginWindow, idx) in pluginWindows"
            :key="`pluginWindow${idx}`"
        >
            <component :is="pluginWindow" />
        </div>
    </div>
</template>

<script>
import VueUtils from '@/assets/js/utils/vue-utils.js';

export default {
    name: "lobby-ui",
    data: () => ({
        dynamic: null,
        pluginWindows: []
    }),
    computed:
    {
        plugins() { return this.$store.getters.plugins; },
        adminPlugins() { return this.plugins.SimMode_Admin || {}; },
        adminWindowConfigs() { return this.adminPlugins.windows || []; },
    },
    mounted()
    {
        this.dynamic = () => VueUtils.externalComponent('plugins/components/Howdy/Howdy.umd.min.js');
        this.pluginWindows = this.adminWindowConfigs.map((pwc) =>
        {
            const component = pwc.component;
            const componentURL = `plugins/components/${component}/${component}.umd.min.js`;
            return () => VueUtils.externalComponent(componentURL);
        });
    },
    methods: {
        change()
        {
            this.dynamic = () => VueUtils.externalComponent('dynamic-components/doody.js');
        }
    },
};
</script>
