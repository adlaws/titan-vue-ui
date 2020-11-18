import Vue from 'vue';
import Vuex from 'vuex';

import TitanUtils, { SIM_MODE, SIM_MODES, $eview, $isInsideTitan, $tWorldInterface, $tFileInterface } from '@/assets/js/titan/titan-utils.js';
import FetchUtils from '@/assets/js/utils/fetch-utils.js';
import { DUMMY_ENTITIES } from '@/assets/js/titan/titan-dev.js';

Vue.use(Vuex);

export const TITAN_MUTATION = {
    // TITAN STATE MANAGEMENT
    CHANGE_SIM_MODE:'titan::changeSimMode',
    ENTITY_SELECTOR_SET_SELECTION:'titan::entitySelector::setSelection',
    ENTITY_SELECTOR_CLEAR_SELECTION:'titan::entitySelector::clearSelection',
};
export const TITAN_ACTION = {
    INIT_PLUGIN_CONFIG:'titan::initPluginConfig',
};

const ENTITY_DESCRIPTORS = ($isInsideTitan?$tWorldInterface.getEntityDescriptionList():DUMMY_ENTITIES)
    .map(e=>
    {
        // the `Blueprint` field value is a comma delimited string, which is not particularly useful,
        // so convert the string into an array, and additional `Set` to make life simpler
        const blueprintArray = e.Blueprint.split(',').map(x=>x.trim());
        e.Blueprint = blueprintArray.join(',');
        e.BlueprintArr = blueprintArray;
        e.BlueprintSet = new Set(blueprintArray.filter(x=> x.length > 0 && x !== 'null'));

        // remove unnecessary fields form descriptor - not needed for the UI
        ['ClassName', 'Tags', 'Filter', 'draggableLive', 'legacyInitialize', 'visible', 'colliding'].forEach(k => delete e[k]);

        return e;
    });

const TitanManager =
{
    state: () => ({
        window:{
            width: window.screen.availWidth,
            height: window.screen.availHeight,
        },
        simMode: null,
        entityDescriptors: ENTITY_DESCRIPTORS,
        entitySelector:
        {
            selected: null,
        },
    }),
    getters: {
        // --------------------------------------------------------------------
        // PLUGIN MANAGEMENT
        // --------------------------------------------------------------------
        plugins: (state) => state.plugins,
        // --------------------------------------------------------------------
        // TITAN STATE MANAGEMENT
        // --------------------------------------------------------------------
        titanWindow: (state) => state.window,
        titanSimMode: (state) => state.simMode,
        titanEntityDescriptors: (state) => state.entityDescriptors,
        // --------------------------------------------------------------------
        // ENTITY SELECTOR WINDOW
        // --------------------------------------------------------------------
        getEntitySelectorSelection: (state) => state.entitySelector.selected,
    },
    mutations: {
        // --------------------------------------------------------------------
        // TITAN STATE MANAGEMENT
        // --------------------------------------------------------------------
        [TITAN_MUTATION.CHANGE_SIM_MODE](state, mode)
        {
            if(!SIM_MODES.has(mode))
                return;

            state.simMode = mode;
            if($isInsideTitan)
            {
                $tWorldInterface.enterSimulationMode(mode);
                // tasks for Titan when switching modes
                if(SIM_MODE.EDITOR === mode)
                {
                    TitanUtils.setScenarioMarkersVisible(true);

                    const scenario = $tWorldInterface.getActiveScenario();
                    const camera = scenario.getActiveCamera();
                    camera.setFreeCameraMode('FreeCamMode_AutoRoll');
                    $eview.camctrl_capture(false);

                    // pretend that we clicked in the middle of the screen
                    const worldPos =TitanUtils.worldPosForWindowCoords({x:screen.availWidth/2, y:screen.availHeight/2});
                    // show the cursor gizmo at the location
                    $tWorldInterface.showGizmoAt(worldPos);
                    $tWorldInterface.clearSelection();
                    // create an entity at the gizmo's location
                    TitanUtils.createEntity('abrams_m1a1', worldPos);
                }
            }
        },
        // --------------------------------------------------------------------
        // ENTITY SELECTOR WINDOW
        // --------------------------------------------------------------------
        /**
         * Updates the currently selected entity from the entity selection
         * window.
         *
         * @param {object} state the store state object
         * @param {object} entity the selected entity
         */
        [TITAN_MUTATION.ENTITY_SELECTOR_SET_SELECTION](state, entity)
        {
            state.entitySelector.selected = entity;
        },
        /**
         * Clears the selection state of the selection window (i.e, nothing is
         * selected).
         *
         * @param {object} state the store state object
         */
        [TITAN_MUTATION.ENTITY_SELECTOR_CLEAR_SELECTION](state)
        {
            state.entitySelector.selected = null;
        },


        /**
         * NOTE: INTERNAL USE ONLY - do not expose via TITAN_MUTATION
         * NOTE: See also actions: TITAN_ACTION.INIT_PLUGIN_CONFIG
         *
         * Initializes the plugin configuration
         *
         * @param {object} state the store state object
         * @param {object} plugins the plugins payload
         */
        _initializePluginConfig: (state, plugins) =>
        {
            state.plugins = plugins;
        }
    },
    actions: {
        [TITAN_ACTION.INIT_PLUGIN_CONFIG]: ({commit}) =>
        {
            const pluginsConfigFile = '/plugins/config.json';
            if($isInsideTitan)
            {
                const cachedPath = $tFileInterface.getCurrentDir();
                $tFileInterface.switchProgramPath();
                $tFileInterface.changeDir('./gui/adlaws/titan-gui-js/dist/');
                const currentDir = $tFileInterface.getCurrentDir();

                const json = $tWorldInterface.readJsonData(`${currentDir}${pluginsConfigFile}`);
                $tFileInterface.changeDir(cachedPath);
                commit('_initializePluginConfig', json);
            }
            else
            {
                (async function()
                {
                    let json = {};
                    try
                    {
                        const response = await FetchUtils.doGET(pluginsConfigFile);
                        if(response.ok)
                            json = await response.json();
                    }
                    catch(e)
                    {
                        // ignore
                    }
                    // deliberately hard coded string here - don't want to expose
                    // the mutation for external use
                    commit('_initializePluginConfig', json);
                })();
            }
        }
    },
};

export default TitanManager;