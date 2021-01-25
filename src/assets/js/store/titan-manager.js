import TitanUtils, { SIM_MODE, SIM_MODES, FREE_CAMERA_MODE, $isInOuterra, $tLogger, $tWorldInterface, $tFileInterface } from '@/assets/js/titan/titan-utils.js';
import FetchUtils from '@/assets/js/utils/fetch-utils.js';
import { DUMMY_ENTITIES } from '@/assets/js/titan/titan-dev.js';
import { COUNTRY } from '@/assets/js/utils/countries.js';

export const DEBUG = false;

export const TITAN_MUTATION = {
    // TITAN STATE MANAGEMENT
    SET_SPLASH_SCREEN_SHOWN:'titan::setSplachScreenShown',
    CHANGE_SIM_MODE:'titan::changeSimMode',
    // TITAN UI MODE
    ENTER_UI_MODE:'titan::uimode::enter',
    EXIT_UI_MODE:'titan::uimode::exit',
    EXIT_TO_UI_MODE:'titan::uimode::exitTo',
    // ENTITY SELECTOR WINDOW
    ENTITY_SELECTOR_SET_SELECTION:'titan::entitySelector::setSelection',
    ENTITY_SELECTOR_CLEAR_SELECTION:'titan::entitySelector::clearSelection',
    // GIZMO POSITION
    GIZMO_SET_POSITION:'titan::gizmo::setPosition',
};
export const TITAN_ACTION = {
    INIT_PLUGIN_CONFIG:'titan::initPluginConfig',
};

// Titan UI modes (used to help determine what mouse and keyboard interactions currently "mean"
// and how to handle them)
export const TITAN_UI_MODE = {
    FPS: 'FPS',
    Desktop: 'Desktop',
    Editor: 'Editor',
    Drawing: 'Drawing',
};

const ENTITY_DESCRIPTORS = ($isInOuterra?$tWorldInterface.getEntityDescriptionList():DUMMY_ENTITIES)
    .map(e=>
    {
        // the `Blueprint` field value is a comma delimited string, which is not particularly useful,
        // so convert the string into an array, and additional `Set` to make life simpler
        const blueprintArray = e.Blueprint.split(',').map(x=>x.trim().toLowerCase());
        // make the Name field all lower case and get rid of special characters to make filtering simpler
        e.normalizedName = e.Name.toLowerCase().replace(/[\s\-+()]/g, '');
        // do some processing on the "blueprint" so that it's easier to use/access
        e.Blueprint = blueprintArray.join(',');
        e.BlueprintArr = blueprintArray;
        e.BlueprintSet = new Set(blueprintArray.filter(x=> x.length > 0 && x !== 'null'));
        // NOTE: this next one is not particularly reliable, since people have kind of been doing
        // whatever they feel like with the ordering of this information
        e.BlueprintMap = {
            type: blueprintArray[0],
            subtype: blueprintArray[1],
            detail: blueprintArray[2],
            country: blueprintArray[3],
            force: blueprintArray[4],
            alliance: blueprintArray[5]
        };

        // add in country property with reference to full country details so life is simpler
        const country = COUNTRY.LCASENAME[e.BlueprintMap.country];
        if(country)
            e.country = country;

        // remove unnecessary fields from descriptor - not needed for the UI
        ['ClassName', 'Tags', 'Filter', 'draggableLive', 'legacyInitialize', 'visible', 'colliding'].forEach(k => delete e[k]);
        return e;
    });

// for debugging purposes - find bad/invalid countries ---------------------------------------------------------------
if(DEBUG)
{
    const entitiesWithNoCountry = ENTITY_DESCRIPTORS.filter(x=>!x.country);
    if(entitiesWithNoCountry.length)
    {
        const badRecords = {};
        entitiesWithNoCountry.forEach(x =>
        {
            const badCountry = x.BlueprintMap.country;
            (badRecords[badCountry] = badRecords[badCountry] || []).push(x);
        });
        $tLogger.warning('titan-manager.js has found unknown/invalid countries in entity descriptors:');
        for(const badCountry in badRecords)
        {
            $tLogger.warning('\t', `'${badCountry}'`, 'x'+badRecords[badCountry].length);
        }
    }
}
// end ----------------------------------------------------------------------------------------------------------------

const TitanManager =
{
    state: () => ({
        splashScreen: {
            show: true,
            hasShown: false,
        },
        // screen resolution available to Titan
        window:{
            width: window.screen.availWidth,
            height: window.screen.availHeight,
        },
        // current titan simulation mode - starts in 'SimMode_Menu'
        simMode: ($isInOuterra ? $tWorldInterface.getSimulationMode() : SIM_MODE.MENU),
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
        // The last location that the gizmo was placed - null means the location
        // is not yet set or otherwise unknown
        gizmo: null,
    }),
    getters: {
        // --------------------------------------------------------------------
        // PLUGIN MANAGEMENT
        // --------------------------------------------------------------------
        plugins: (state) => state.plugins,
        // --------------------------------------------------------------------
        // TITAN STATE MANAGEMENT
        // --------------------------------------------------------------------
        showSplashScreen: (state) => state.splashScreen.show && !state.splashScreen.hasShown,
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
        // --------------------------------------------------------------------
        // ENTITY SELECTOR WINDOW
        // --------------------------------------------------------------------
        gizmoPos: (state) => state.gizmo,
        hasGizmoPos: (state, getters) => getters.gizmoPos !== null,
    },
    mutations: {
        // --------------------------------------------------------------------
        // TITAN STATE MANAGEMENT
        // --------------------------------------------------------------------
        [TITAN_MUTATION.SET_SPLASH_SCREEN_SHOWN](state, hasShown)
        {
            state.splashScreen.hasShown = hasShown;
        },
        [TITAN_MUTATION.CHANGE_SIM_MODE](state, mode)
        {
            if(!SIM_MODES.has(mode))
                return;

            if(!$isInOuterra)
            {
                state.simMode = mode;
            }
            else
            {
                const oldMode = $tWorldInterface.getSimulationMode();
                $tWorldInterface.enterSimulationMode(mode);
                state.simMode = $tWorldInterface.getSimulationMode();
                if(state.simMode !== mode)
                    throw(`Could not change simulation mode from '${oldMode}' to '${mode}'!`);

                // tasks for Titan when switching modes
                if(SIM_MODE.EDITOR === state.simMode)
                {
                    TitanUtils.setScenarioMarkersVisible(true);

                    const scenario = $tWorldInterface.getActiveScenario();
                    const camera = scenario.getActiveCamera();
                    camera.setFreeCameraMode( FREE_CAMERA_MODE.AUTO_ROLL );
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
         * @param {object} state the store state object
         * @param {string} uiMode the string identifier of the UI mode to exit
         */
        [TITAN_MUTATION.EXIT_UI_MODE](state, uiMode)
        {
            if(state.uiMode.length === 0)
                return;
            const currentMode = state.uiMode[state.uiMode.length - 1];
            if(currentMode !== uiMode)
                return;
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
                return; // empty mode stack, nothing to do
            const currentMode = state.uiMode[state.uiMode.length - 1];
            if(currentMode === uiMode)
                return; // already the current mode, nothing to do
            const modeIdx = state.uiMode.indexOf(uiMode);
            if(modeIdx < 0)
                return; // not in the mode stack
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
         * Store the current position of the Titan gizmo pointer.
         *
         * @param {object} state the store state object
         * @param {object} ecef the gizmo position
         */
        [TITAN_MUTATION.GIZMO_SET_POSITION](state, ecef)
        {
            state.gizmo = ecef;
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
            if($isInOuterra)
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