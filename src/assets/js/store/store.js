import Vue from 'vue';
import Vuex from 'vuex';

import DesktopManager from './desktop-manager.js';
import TitanManager from './titan-manager.js';
import PreferenceManager from './preference-manager.js';

Vue.use(Vuex);

const ApplicationState = new Vuex.Store({
    modules: {
        DesktopManager,
        TitanManager,
        PreferenceManager,
    }
});

export default ApplicationState;
