import Vue from 'vue';
import Vuex from 'vuex';

import TitanUtils, { SIM_MODE, SIM_MODES, $eview, $isInsideTitan, $tWorldInterface, $tFileInterface } from '@/assets/js/titan/titan-utils.js';
import FetchUtils from '@/assets/js/utils/fetch-utils.js';
import { DUMMY_ENTITIES } from '@/assets/js/titan/titan-dev.js';

Vue.use(Vuex);

export const TITAN_MUTATION = {
    // TITAN STATE MANAGEMENT
    CHANGE_SIM_MODE:'titan::changeSimMode',
    // TITAN UI MODE
    ENTER_UI_MODE:'titan::uimode::enter',
    EXIT_UI_MODE:'titan::uimode::exit',
    EXIT_TO_UI_MODE:'titan::uimode::exitTo',
    // ENTITY SELECTOR WINDOW
    ENTITY_SELECTOR_SET_SELECTION:'titan::entitySelector::setSelection',
    ENTITY_SELECTOR_CLEAR_SELECTION:'titan::entitySelector::clearSelection',
};
export const TITAN_ACTION = {
    INIT_PLUGIN_CONFIG:'titan::initPluginConfig',
};

// Titan UI modes (used to help determine what mouse and keyboard interactions currently "mean"
// and how to handle them)
export const TITAN_UI_MODE = {
    Desktop: 'Desktop',
    Editor: 'Editor',
    Drawing: 'Drawing',
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
        // screen resolution available to Titan
        window:{
            width: window.screen.availWidth,
            height: window.screen.availHeight,
        },
        // current titan simulation mode
        simMode: null,
        // a cached list of all entity descriptors - since this doesn't change
        // during the lifetime of a Titan execution cycle, we just ask for it
        // once here to avoid constantly querying the C++ back end
        entityDescriptors: ENTITY_DESCRIPTORS,
        // current titan UI mode (used to help determine what mouse and
        // keyboard interactions currently "mean" and how to handle them). The
        // current mode is at the top of the 'stack' (i.e., the last item in the
        // array).
        uiMode:[],
        // currently selected entity TODO: this should probably be moved away
        // into the entity selection UI, and use the current UI mode to track
        // mouse events for the creation of entities.
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
        // TITAN UI MODE
        // --------------------------------------------------------------------
        uiMode: (state) => (state.uiMode.length === 0 ? null : state.uiMode[state.uiMode.length-1]),
        isUiMode: (state, getters) => (uiMode) => getters.uiMode === uiMode,
        uiModeState: (state) => state.uiMode.join('::'),
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
        // TITAN UI MODE
        // --------------------------------------------------------------------
        /**
         * Enters the given UI mode (pushes it onto the UI mode stack)
         *
         * @param {object} state the store state object
         * @param {string} uiMode the string identifier of the UI mode to enter
         */
        [TITAN_MUTATION.ENTER_UI_MODE](state, uiMode)
        {
            if(state.uiMode.length > 0)
            {
                const currentMode = state.uiMode[state.uiMode.length - 1];
                if(currentMode === uiMode)
                    throw(`Cannot enter UI mode '${uiMode}' because it is already the current mode!`);
            }
            state.uiMode.push(uiMode);
        },
        /**
         * Leaves the given UI mode (pops it off the UI mode stack)
         *
         * If the given UI mode is not the current mode, an exception will be
         * thrown
         *
         * @param {object} state the store state object
         * @param {string} uiMode the string identifier of the UI mode to exit
         */
        [TITAN_MUTATION.EXIT_UI_MODE](state, uiMode)
        {
            if(state.uiMode.length === 0)
                throw(`Cannot exit UI mode'${uiMode}' - no UI modes left to exit!`);
            const currentMode = state.uiMode[state.uiMode.length - 1];
            if(currentMode !== uiMode)
                throw(`Cannot exit UI mode '${uiMode}' because it is not the current mode. The current mode is '${currentMode}'!`);
            state.uiMode.pop();
        },
        /**
         * Exits the any and all UI modes 'above' the given UI (popping them off
         * the UI mode stack) until the given UI mode is reached.
         *
         * If the 'target' UI mode is already at the top of the current UI mode
         * stack, this mutation will have no effect
         *
         * If the 'target' UI mode is not in the current UI mode stack, an
         * exception will be thrown
         *
         * @param {object} state the store state object
         * @param {string} uiMode the string identifier of the UI mode to exit to
         */
        [TITAN_MUTATION.EXIT_TO_UI_MODE](state, uiMode)
        {
            if(state.uiMode.length === 0)
                throw(`Cannot exit to UI mode'${uiMode}' - no UI modes left to exit from!`);
            const currentMode = state.uiMode[state.uiMode.length - 1];
            if(currentMode === uiMode)
                return; // already the current mode, nothing to do
            const modeIdx = state.uiMode.indexOf(uiMode);
            if(modeIdx < 0)
                throw(`Cannot exit to UI mode'${uiMode}' - it is not in te UI mode stack ${state.uiMode.join('::')}`);
            state.uiMode.splice(modeIdx + 1);
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