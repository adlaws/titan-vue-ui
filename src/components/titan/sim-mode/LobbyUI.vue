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
        const pluginWindows = [];
        this.adminWindowConfigs.forEach((pwc) =>
        {
            const component = pwc.component;
            const type = pwc.type;
            const extension = type === 'vue' ? '.umd.min.js' : '.js';
            const componentURL = `plugins/components/${component}/${component}${extension}`;
            if(type === 'vue')
            {
                pluginWindows.push( () => VueUtils.externalComponent(componentURL) );
            }
            else
            {
                VueUtils.injectScript(componentURL);
            }
        });
        this.pluginWindows = pluginWindows;
    },
    methods: {
        change()
        {
            this.dynamic = () => VueUtils.externalComponent('dynamic-components/doody.js');
        }
    },
};
</script>
