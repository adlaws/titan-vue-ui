import Vue from 'vue';
import App from './App.vue';
import store from '@/assets/js/store/store.js';
import router from '@/assets/js/router/router.js';

Vue.config.productionTip = false;

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
    render: h => h(App),
}).$mount('#app');


