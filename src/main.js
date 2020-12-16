import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

// application state store and routing
import store from '@/assets/js/store/store.js';
import router from '@/assets/js/router/router.js';

// internationalisation
import VueI18n from 'vue-i18n';
Vue.use(VueI18n);
import { LANGUAGE, DEFAULT_LOCALE } from '@/locales';
const messages = Object.assign(LANGUAGE);
const i18n = new VueI18n({
    locale: DEFAULT_LOCALE,
    messages,
});

import vuetify from '@/plugins/vuetify';

// ----------------------------------------------------------------------------
// This is necessary so that TitanEventInterface works correctly
// NOTE: It's possible that this will not be needed in the future - currently
//       it's only needed because of the odd way that TitanEventInterface
//       sets itself up and operates in comparison to the other Titan
//       event systems, namely in that events must be registered via a kind of
//       JavaScript proxy to an intergen interface, rather than directly on
//       an *actual* intergen interface.
require('@/../public/js/titanEventListener.js');
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// 'AUTOMAGIC' GLOBAL REGISTRATION OF 'COMMON' TITAN COMPONENTS
// NOTE: needs to be done before `new Vue({...})` call
// ----------------------------------------------------------------------------
const requireComponent = require.context(
    // The relative path of the components folder
    './components/common/titan',
    // Whether or not to look in subfolders
    true,
    // The regular expression used to match base component filenames
    /Titan[A-Z]\w+\.(vue|js)$/
);

requireComponent.keys().forEach(fileName =>
{
    // Get component config
    const componentConfig = requireComponent(fileName);

    const componentName =
    // Gets the file name regardless of folder depth
    fileName.split('/')
        .pop()
        .replace(/\.\w+$/, '');
    // Register component globally (uses file name)
    Vue.component(
        componentName,
        // Look for the component options on `.default`, which will
        // exist if the component was exported with `export default`,
        // otherwise fall back to module's root.
        componentConfig.default || componentConfig
    );
});
// ----------------------------------------------------------------------------

new Vue({
    router,
    store,
    i18n,
    vuetify,
    render: h => h(App),
}).$mount('#app');


