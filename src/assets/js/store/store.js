import Vue from 'vue';
import Vuex from 'vuex';

import DesktopManager from './desktop-manager.js';
import TitanManager from './titan-manager.js';

Vue.use(Vuex);

const ApplicationState = new Vuex.Store({
    modules: {
        DesktopManager: DesktopManager,
        TitanManager: TitanManager,
    }
});

export default ApplicationState;
