/*
 *   Copyright 2019 Calytrix Technologies
 *
 *   This file is part of Titan.CX
 *
 *   NOTICE:  All information contained herein is, and remains
 *            the property of Calytrix Technologies Pty Ltd.
 *            The intellectual and technical concepts contained
 *            herein are proprietary to Calytrix Technologies Pty Ltd.
 *            Dissemination of this information or reproduction of
 *            this material is strictly forbidden unless prior written
 *            permission is obtained from Calytrix Technologies Pty Ltd.
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 */

//-------------------------------------------------------------------------------
//                       Utilities for Working with Titan
//-------------------------------------------------------------------------------
// get global context from any scope we are in now
// eslint-disable-next-line
import KEY_CODE from '@/assets/js/utils/event-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';
import UIUtils from '@/assets/js/utils/ui-utils.js';

export const TITAN_ROOT_PATH = '../../../../';
export const PACKAGES_PATH = `${TITAN_ROOT_PATH}packages/`;
export const DATA_PATH = `${TITAN_ROOT_PATH}data/`;

export const _GLOBAL = Function('return this')();
export const window = _GLOBAL.window;
export const $got = _GLOBAL.$got || {}; // NOTE: not currently used

// Determine if we are running in a production environment (as opposed to development)
export const $isProduction = process.env.NODE_ENV === 'production';
// Determine if we are running in Titan
export const $isInsideTitan = window.$eview !== undefined;
// Determine if we are running in Outerra
export const $isInsideOuterra = /Outerra\/c4e/g.test(window.navigator.userAgent); // true if inside OUTERRA

// take $eview from the window, otherwise make up dummy implementation
// for use when developing widgets in browsers
export const $eview = window.$eview || {
    $query_interface() {return null;},
    mark_unhandled() {return;},
    show_window() {return;},
    enable_window() {return;},
    set_transparent() {return;},
    set_always_bottom() {return;},
    $rebind_events() {return;},
    camctrl_capture() {return;},
};

export const $query_interface = window.$query_interface ? window.$query_interface : () => {return null;};
// Outerra Interfaces
export const $otWorld = $query_interface('ot::js::world.get');
export const $otEnvironment = $query_interface('ot::js::environment.get');
export const $otLocation = $query_interface('ot::js::location.get');
export const $otLogger = $query_interface('ot::js::logger.get');
export const $otSketch = $query_interface('ot::js::sketch.get');
export const $otSoundManager = $query_interface('ot::js::soundman.get');
export const $otExplosions = $query_interface('ot::js::explosions.get');
export const $otFrameBuffer = $query_interface('ot::js::fb.get');
export const $otLightManager = $query_interface('ot::js::light_manager.get');
export const $otScreenReport = $query_interface('ot::js::screen_report.get');
export const $otTerrainData = $query_interface('ot::js::terrain_data.get');
// Titan Interfaces
export const $tWorldInterface = $query_interface('ti::js::WorldInterface.instance');
export const $tUiStateStorage = $query_interface('ti::js::UIStateStorageInterface.instance'); // UI state persistence
export const $tRenderToolbox = $query_interface('ti::js::RenderToolboxInterface.instance'); // for drawing shapes
export const $tEventInterface =  $query_interface('ti::js::TitanEventInterface.instance'); // not sure how this differs from $tGlobalStorage.eventHandlers?
export const $tMathInterface = $query_interface('ti::js::MathInterface.instance');
export const $tScenarioInterface = $query_interface('ti::js::ScenarioInterface.instance');
export const $tViewSettingsInterface = $query_interface('ti::js::ViewSettingsInterface.instance');
export const $tEffectInterface = $query_interface('ti::js::EffectInterface.instance');
export const $tDebugConsoleInterface = $query_interface('ti::js::DebugConsoleInterface.createInstance');
export const $tCrewInterface = $query_interface('ti::js::CrewInterface.instance');
export const $tFactoryInterface = $query_interface('ti::js::FactoryInterface.instance');
export const $tInstructorControlInterface = $query_interface('ti::js::InstructorControlInterface.instance');
export const $tRopeAttachmentQueryInterface = $query_interface('ti::js::RopeAttachmentQueryInterface.instance');
export const $tGroupingInterface = $query_interface('ti::js::GroupingInterface.instance');
// dummy file system interface implementation for use when developing widgets in browsers
const DUMMY_FILE_SYSTEM = {
    switchUserPath:    () => null,
    switchProgramPath: () => null,
    getBasePath:       () => '',
};
export const $tFileInterface = $query_interface('ti::js::TitanFileSystem.create') || DUMMY_FILE_SYSTEM;
// TODO: investigate how "global storage" is actually needed in single page UI setup
export const $tGlobalStorage = $tWorldInterface ? $tWorldInterface.getGlobalStorageObject() : null;

/**
 * Simplified logging - will log in both browser and Outerra environments
 *
 * Automatically stringifies and concatenates arguments as required
 *
 * Example use:
 *     $tLogger.info('Log something');
 *     $tLogger.info('Multiple args', 1, 'a', [1,2,3], {a:1, b:'two'});
 */
export const $tLogger = {
    error: function() { $tLogger._doLog('error', arguments); },
    warning: function() { $tLogger._doLog('warning', arguments); },
    info: function() { $tLogger._doLog('info', arguments); },
    debug: function() { $tLogger._doLog('debug', arguments); },
    fading: function() { $tLogger._doLog('fading', arguments); },
    _doLog: function(level, varargs)
    {
        var parts = Array.prototype.slice.call(varargs);
        if ($otLogger === null)
        {
            // logging in a web browser
            console.log.apply(console, [`${level.toUpperCase()}:`, ...parts]);
        }
        else
        {
            // logging in Outerra/Titan
            const logFunc = $otLogger[level+'_log'] || $otLogger.info_log;
            const concatenated = parts.map((x) => JSON.stringify(x)).join(' ');
            logFunc.call($otLogger, concatenated);
        }
    },
};

// ref titan-git\src\titan_core\core\types\SimulationMode.h
export const SIM_MODE = {
    NONE: 'SimMode_None',
    MENU: 'SimMode_Menu',
    EDITOR: 'SimMode_Editor',
    ADMIN: 'SimMode_Admin',
    OBSERVER: 'SimMode_Observer',
    PLAY: 'SimMode_Play',
    AAR: 'SimMode_AfterActionReview',
    LIVEMENU: 'SimMode_LiveMenu',
    MAXMODES: 'SimMode_MaxModes',
};
Object.freeze(SIM_MODE);
export const SIM_MODES = new Set(Object.values(SIM_MODE));

export const CAMERA_MODE = {
    CHASE: 'CamMode_OT_Chase',
    FREEVIEW: 'CamMode_FreeView',
    FIRST_PERSON: 'CamMode_OT_FirstPerson',
    THIRD_PERSON: 'CamMode_OT_ThirdPerson',
};
Object.freeze(CAMERA_MODE);

export const FREE_CAMERA_MODE = {
    PANNING: 'FreeCamMode_Panning',
    AUTO_ROLL: 'FreeCamMode_AutoRoll',
    MANUAL_ROLL: 'FreeCamMode_ManualRoll',
};
Object.freeze(FREE_CAMERA_MODE);

export const OBJECT_TYPE = {
    OBJECT: 'Object',
    ENTITY: 'Entity',
    WAYPOINT: 'Waypoint',
    TRIGGER: 'Trigger',
    CHARACTER: 'Character',
    GROUND_VEHICLE: 'GroundVehicle',
    AEROPLANE: 'Aeroplane',
    HELICOPTER: 'Helicopter',
    WATERCRAFT: 'Watercraft',
    STATIC_UNIT: 'StaticUnit',
    TURRET: 'Turret',
    GROUP_ENTITY: 'EntityGroup'
};
Object.freeze(OBJECT_TYPE);
export const OBJECT_TYPES = Object.values(OBJECT_TYPE);
export const OBJECT_TYPES_SET = new Set(OBJECT_TYPES);

//.. Keys used for OT camera control.. and others
export const DESKTOP_KEY_CODES = new Set([
    KEY_CODE.BACKSPACE,
    KEY_CODE.TAB,
    KEY_CODE.ENTER,
    KEY_CODE.SHIFT,
    KEY_CODE.CTRL,
    KEY_CODE.ALT,
    KEY_CODE.PAUSE_BREAK,
    KEY_CODE.CAPSLOCK,
    KEY_CODE.PAGE_UP,
    KEY_CODE.PAGE_DOWN,
    KEY_CODE.END,
    KEY_CODE.HOME,
    KEY_CODE.LEFT_ARROW,
    KEY_CODE.UP_ARROW,
    KEY_CODE.RIGHT_ARROW,
    KEY_CODE.DOWN_ARROW,
    KEY_CODE.INSERT,
    KEY_CODE.DELETE,
    KEY_CODE._0,
    KEY_CODE._1,
    KEY_CODE._2,
    KEY_CODE._3,
    KEY_CODE._4,
    KEY_CODE._5,
    KEY_CODE._6,
    KEY_CODE._7,
    KEY_CODE._8,
    KEY_CODE._9,
    KEY_CODE.A,
    KEY_CODE.B,
    KEY_CODE.C,
    KEY_CODE.D,
    KEY_CODE.E,
    KEY_CODE.F,
    KEY_CODE.G,
    KEY_CODE.H,
    KEY_CODE.I,
    KEY_CODE.J,
    KEY_CODE.K,
    KEY_CODE.L,
    KEY_CODE.M,
    KEY_CODE.N,
    KEY_CODE.O,
    KEY_CODE.P,
    KEY_CODE.Q,
    KEY_CODE.R,
    KEY_CODE.S,
    KEY_CODE.T,
    KEY_CODE.U,
    KEY_CODE.V,
    KEY_CODE.W,
    KEY_CODE.X,
    KEY_CODE.Y,
    KEY_CODE.Z,
    KEY_CODE.NUMPAD_0,
    KEY_CODE.NUMPAD_1,
    KEY_CODE.NUMPAD_2,
    KEY_CODE.NUMPAD_3,
    KEY_CODE.NUMPAD_4,
    KEY_CODE.NUMPAD_5,
    KEY_CODE.NUMPAD_6,
    KEY_CODE.NUMPAD_7,
    KEY_CODE.NUMPAD_8,
    KEY_CODE.NUMPAD_9,
    KEY_CODE.NUMPAD_MULTIPLY,
    KEY_CODE.NUMPAD_ADD,
    108, // ??????????
    KEY_CODE.NUMPAD_SUBTRACT,
    KEY_CODE.NUMPAD_DECIMAL,
    KEY_CODE.NUMPAD_DIVIDE,
    KEY_CODE.F1,
    KEY_CODE.F2,
    KEY_CODE.F3,
    KEY_CODE.F4,
    KEY_CODE.F5,
    KEY_CODE.F6,
    KEY_CODE.F7,
    KEY_CODE.F8,
    KEY_CODE.F9,
    KEY_CODE.F10,
    KEY_CODE.F11,
    KEY_CODE.F12,
    KEY_CODE.SEMI_COLON,
    KEY_CODE.EQUALS,
    KEY_CODE.COMMA,
    KEY_CODE.DASH,
    KEY_CODE.PERIOD,
    KEY_CODE.FORWARD_SLASH,
    KEY_CODE.GRAVE_ACCENT, // GRAVE ACCENT `
    KEY_CODE.OPEN_BRACKET, // OPEN BRACKET [
    KEY_CODE.BACK_SLASH,
    KEY_CODE.CLOSE_BRACKET, // CLOSE BRACKET ]
    KEY_CODE.SINGLE_QUOTE  // SINGLE QUOTE '
]);

export default class TitanUtils
{
    /**
     * A very simple function solely for the purpose of determining whether this is being viewed within
     * a web browser, such as Internet Explorer, Firefox, Chrome, Safari, Opera, etc (for layout
     * debugging purposes, for example).
     *
     * This can be used to avoid making Titan specific JavaScript function calls when testing in
     * browsers.
     */
    static isInsideTitan()
    {
        return $isInsideTitan;
    }

    static getWindowSize()
    {
        return {
            width:window.screen.availWidth,
            height:window.screen.availHeight,
        };
    }

    static quitApplication()
    {
        if(!$isInsideTitan)
            return;

        // shut down NodeJS before exit
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:3009/closeNodeJsPluginServer');
        xhr.send();

        $tWorldInterface.quit();
    }

    /**
     * Determine if an event happened on a `pass-though` area (i.e., on the
     * Outerra world, rather than on a user interface element).
     *
     * @param {object} evt the mouse event
     * @returns {boolean} true if the target of the event is a DOM element
     *          with a `pass-though` class, false otherwise
     */
    static isPassThrough(evt)
    {
        if(evt && evt.target && evt.target.classList)
            return evt.target.classList.contains('pass-through');
        return false;
    }

    /**
     * A common handler function to capture mouse/key events which have not been
     * explicitly ignored or otherwise handled, purely for the purposes of
     * catching and logging what is most likely an error.
     *
     * NOTE: IF THIS FUNCTION IS BEING CALLED, IT IS A PROBLEM TO BE FIXED, NOT
     *       A PROBLEM TO BE IGNORED!!!
     *
     * @param {object} evt the event
     * @param {string} contextText some text to give the error context
     */
    static unhandledEventHandler(evt, contextText)
    {
        $tLogger.error(`Expected handler but none found for '${evt.type}' in '${contextText}'!`);
    }

    /**
     * Simplifies entity creation
     *
     * @param {string} entityKeyName the entity key name for the entity to create (can be found in
     *        the corresponding *.entdef file)
     * @param {object} ecef the ECEF coordinates at which to create the entity as an object of the
     *        form {x:X, y:Y, z:Z}. If unspecified the currently selected ground point will be usde.
     */
    static createEntity(entityKeyName, ecef=null)
    {
        const $scenario = $tWorldInterface.getActiveScenario();
        // set to the gizmo pos if not supplied
        ecef === ecef || $scenario.getSelectedGroundPoint();

        let entity = null;
        const desc = $tWorldInterface.getEntityDescriptorFromName(entityKeyName);
        if(desc)
        {
            entity = $scenario.createEntityECEF(desc, ecef);
            if(entity)
            {
                const entityTypeName = entity.getTypeName();
                if (entityTypeName !== OBJECT_TYPE.OBJECT)
                {
                    if(OBJECT_TYPES_SET.has(entityTypeName))
                    {
                        const name = desc.Name || desc.entityName;
                        entity.setUniqueName(name);
                    }
                }
            }
        }
        return entity;
    }

    /**
     * Converts screen coordinates from a mouse event to coordinates used by
     * Outerra, which inverts the Y-axis.
     *
     * @param {object} evt the DOM mouse event
     * @returns the Outerra screen coordinates as an object of the form {x:X, y:Y}
     */
    static domEventXYtoOuterraXY(evt)
    {
        return {x: evt.clientX, y: screen.availHeight - evt.clientY};
    }

    /**
     * Obtain world coordinates (ECEF/(x,y,z) coordinates) for the terrain location which
     * currently coincides with the given screen coordinates (if any).
     *
     * @param {Object} winXY the x,y screen coordinate as an object of the form {x:X, y:Y}
     * @param {number} range optionally specify the the maximum distance (in
     *        meters) to extend the ray to intersect the terrain to obtain the
     *        location (15km by default). If the ray has to extend further than
     *        this distance the location is undefined.
     * @returns the world coordinates of the point of the terrain under the given
     *        screen x,y coordinates
     */
    static worldPosForWindowCoords(winXY, /*range=15000*/)
    {
        // $tWorldInterface.injectMousePosition(winXY, range);
        // return $tWorldInterface.getWorldPositionUnderMouse();
        if($isInsideTitan)
            return $tWorldInterface.getWorldPosFromScreenPix(winXY);
        return {x: 0, y: 0, z: 0};
    }

    /**
     * Utility method to check if a world position (ECEF coordinates) is
     * valid.
     *
     * Basically it checks that X,Y and Z are not all 0, which will happen if,
     * say, an attempt is made to extract a world position for a screen location
     * which is in the sky rather than on the ground.
     *
     * @param {object} candidate the candidate as an object of the form {x:X, y:Y, z:Z}
     * @returns true if the candidate is a valid ECEF coordinate, false otherwise
     */
    static isValidWorldPos(candidate)
    {
        if(!candidate)
            return false;
        return !(candidate.x === 0 && candidate.y === 0 && candidate.z === 0);
    }

    /**
     * Utility method to check if the object with the given UUID is selected
     *
     * NOTE: this seems like a very convoluted and resource hungry way to
     *       determine if a particular entity is selected based on the UUID,
     *       particularly since the data needs to be marshalled across the
     *       C++/JavaScript boundary for the `getSelectedObjectsList()` call
     *       and then iterated over just to check for the UUID. However the
     *       existing API has no `isSelected(uuid)` method (or equivalent)
     *       so this is what we are currently left with.
     *
     * @param {string} uuid the UUID of the object to be checked for selection
     * @returns {boolean} true if the UUID is for a selected object, false otherwise
     */
    static isSelected(uuid)
    {
        const activeScenario = $tWorldInterface.getActiveScenario();
        if(!activeScenario)
            return false;
        const selectedObjects = activeScenario.getSelectedObjectsList();
        // const selectedObjectUUIDs = new Set(selectedObjects.map(obj => obj.GUID));
        // return selectedObjectUUIDs.has(uuid);
        for(let idx=0; idx<selectedObjects.length; idx++)
        {
            if(selectedObjects[idx].GUID === uuid)
                return true;
        }
        return false;
    }

    /**
     * For debugging - converts the properties/values of Outerra mouse/key events to a
     * string suitable for logging
     *
     * For DOM (HTML) events, see {@link domEventToString(evt)}
     *
     * @param evt the Outerra mouse or key event
     * @return a string detailing the properties and values of the event
     */
    static outerraEventToString(evt)
    {
        return Object.keys(evt).map((key) => `${key}: ${JSON.stringify(evt[key])}`).join(', ');
    }

    /**
     * For debugging - converts the properties/values of DOM mouse/key events to a
     * string suitable for logging
     *
     * For Outerra events, see {@link outerraEventToString(evt)}
     *
     * @param evt the DOM mouse or key event
     * @return a string detailing the properties and values of the event
     */
    static domEventToString(evt)
    {
        const eventKeys = Object.keys(evt.__proto__);
        const entries = [];
        for(let idx=0; idx<eventKeys.length; idx++)
        {
            const key = eventKeys[idx];
            try
            {
                entries.push(`${key}: ${JSON.stringify(evt[key])}`);
            }
            catch(e)
            {
                // ignore - probably a circular structure or some such thing
            }

        }
        return entries.join(', ');
    }

    /**
     * Set the visibility of all waypoint paths, markers, and triggers
     *
     * @param {Boolean} isVisible true if scenario markers should be visible,
     *        false otherwise
     */
    static setScenarioMarkersVisible(isVisible)
    {
        const scenario = $tWorldInterface.getActiveScenario();
        const objs = scenario.getObjectsList();
        // batch process the items to avoid locking up the UI
        UIUtils.batchProcess(0, objs.length, (idx)=>
        {
            const obj = objs[idx];
            const typeName = obj.typeName;
            if(typeName === 'WaypointPath')
            {
                const wpp = scenario.getWaypointPath(obj);
                if(wpp)
                    wpp.setVisible(isVisible);
            }
            else if(typeName === 'Entity')
            {
                const entity = scenario.getEntity(obj);
                if(entity)
                    entity.setLineVisible(isVisible);
            }
            else if(typeName === 'Trigger')
            {
                const trigger = scenario.getEntity(obj);
                if(trigger)
                    trigger.setVisible(isVisible);
            }
        });
        $tGroupingInterface.setAllGroupLinesVisible(isVisible);
    }

    static launchPluginExecutable(cmdLineStr)
    {
        if(!$isInsideTitan)
            return;
        $tWorldInterface.launchPluginExecutable(cmdLineStr);
    }

    /**
     * Utility method for debug purposes to see what properties an object has. Logs to ERROR level
     * by default.
     *
     * @param {Object} obj the object instance to inspect
     * @param {Function} loggerFunc a logging function which accepts a string as a parameter. If
     *        unspecified, `TitanUtils.log.error` is used.
     */
    static logProps(obj, loggerFunc=$tLogger.error)
    {
        if(obj === null)
        {
            loggerFunc( 'null' );
        }
        else if(obj === undefined)
        {
            loggerFunc( 'undefined' );
        }
        else
        {
            const objType = typeof obj;
            if(objType !== 'object')
            {
                loggerFunc( objType );
            }
            else
            {
                const logContent = '{'+Object.getOwnPropertyNames(obj).sort().map(p=>`'${p}': '${typeof(p)}'`).join(', ')+'}';
                loggerFunc( logContent );
            }
        }
    }

    /**
    * This function ensures that clicks are handled correctly - if it is left out, the widget 'absorbs'
    * all mouse and keyboard clicks, preventing anything else from happening until the widget is
    * closed. It needs to be called immediately!
    **/
    static bindEventHandlers()
    {
        if(!$isInsideTitan)
            return;
        let eventHandlers = $tGlobalStorage.eventHandlers;
        window.onblur                    = eventHandlers.handleMouseDownEvent.bind(window);
        window.on_desktop_mouse_down     = eventHandlers.handleMouseDownEvent.bind(window);
        window.on_desktop_mouse_move     = eventHandlers.handleMouseMoveEvent.bind(window);
        window.on_desktop_mouse_up       = eventHandlers.handleMouseUpEvent.bind(window);
        window.on_desktop_mouse_wheel    = eventHandlers.editorModeMouseWheel.bind(window);
        window.on_desktop_mouse_dblclick = eventHandlers.handleDoubleClick.bind(window);
        window.onkeydown                 = eventHandlers.handleKeyDownEvent.bind(window);
        window.onkeyup                   = eventHandlers.handleKeyUpEvent.bind(window);
    }

    static deactivateUndoRedoKeyMonitoring()
    {
        TitanUtils.setUndoRedoKeyMonitoringState(false);
    }

    static activateUndoRedoKeyMonitoring()
    {
        TitanUtils.setUndoRedoKeyMonitoringState(true);
    }

    static setUndoRedoKeyMonitoringState(isActive)
    {
        if(!$isInsideTitan)
            return;
        $tWorldInterface.set_undo_redo_keypress_monitoring_active(isActive);
    }

    /**
     * Sends a Titan event with the specified name and arguments.
     */
    static sendTitanEvent(eventName, args)
    {
        if (!eventName || !$tEventInterface)
        {
            return; //no event name or Titan Event Interface
        }
        // sanity check for arguments
        args = args ? args : {};
        $tEventInterface.sendEventArgs(eventName, args);
    }

    static addEventListener(name, handler)
    {
        if(!$isInsideTitan)
            return;
        $tGlobalStorage.TitanEvent.addListener(name, handler);
    }

    static removeEventListener(name, handler)
    {
        if(!$isInsideTitan)
            return;
        $tGlobalStorage.TitanEvent.removeListener(name, handler);
    }

    static addGlobalEventListener(handler)
    {
        if(!$isInsideTitan)
            return;
        TitanUtils.GLOBAL_LISTENERS.push(handler);
        $tGlobalStorage.TitanEvent.addGlobalListener(handler);
    }

    static removeGlobalEventListener(handler)
    {
        if(!$isInsideTitan)
            return;
        // TODO: remove from TitanUtils.GLOBAL_LISTENERS
        $tGlobalStorage.TitanEvent.removeGlobalListener(handler);
    }

    static removeAllGlobalEventListeners()
    {
        if(!$isInsideTitan)
            return;
        TitanUtils.GLOBAL_LISTENERS.forEach(handler =>
        {
            $tGlobalStorage.TitanEvent.removeGlobalListener(handler);
        });
    }

    static closeWindow()
    {
        if(!$isInsideTitan)
            return;
        $tGlobalStorage.closeWindow( window.name );
    }

    static fileSystem()
    {
        return $tFileInterface;
    }

    /**
     * returns user's data path
     */
    static getUserPath()
    {
        $tFileInterface.switchUserPath();
        return $tFileInterface.getBasePath();
    }

    /**
     * returns system path
     */
    static getSystemPath()
    {
        $tFileInterface.switchProgramPath();
        return $tFileInterface.getBasePath();
    }

    static loadUserData(path, defaultData={})
    {
        let dataPath = TitanUtils.getUserPath() + TitanUtils._rationalizeDataPath(path);
        return TitanUtils._loadJsonData(dataPath, defaultData);
    }

    static saveUserData(path, data={})
    {
        let dataPath = TitanUtils.getUserPath() + TitanUtils._rationalizeDataPath(path);
        return TitanUtils._saveJsonData(dataPath, data);
    }

    static loadSystemData(path, defaultData={})
    {
        let dataPath = TitanUtils.getSystemPath() + TitanUtils._rationalizeDataPath(path);
        return TitanUtils._loadJsonData(dataPath, defaultData);
    }

    static saveSystemData(path, data={})
    {
        let dataPath = TitanUtils.getSystemPath() + TitanUtils._rationalizeDataPath(path);
        return TitanUtils._saveJsonData(dataPath, data);
    }

    static _rationalizeDataPath(path)
    {
        // replace all backslashes (\) with forward slashes (/)
        path = path.trim().replace(/\\/g, '/');
        // if the path doesn't start with a '/' add one
        if(path.charAt(0)!=='/')
            path = '/'+path;
        // done
        return path;
    }

    static _loadJsonData(path, defaultData={})
    {
        if(!$isInsideTitan)
            return {...defaultData};

        let data = {...defaultData};
        try
        {
            data = $tWorldInterface.readJsonData(path);
        }
        catch (e)
        {
            TitanUtils.log.error('Failed to load JSON data from ${path}');
        }
        return data;
    }

    static _saveJsonData(path, data={})
    {
        if(!$isInsideTitan)
            return;

        $tWorldInterface.writeJsonData(path, data);
    }

    // persistent state storage, restoration, setters and getters ----------------------------------
    static loadState(stateID, defaultState={})
    {
        if(!$isInsideTitan)
            return {...defaultState};

        // load in persisted state
        let persistedState = $tGlobalStorage.loadState(stateID);
        if (typeof(persistedState) === 'object')
        {
            // merge in persistent state properties, overriding defaults
            return {...defaultState, ...persistedState};
        }

        return {...defaultState};
    }

    static saveState(stateID, state={})
    {
        if(!$isInsideTitan)
            return;

        $tGlobalStorage.saveState(stateID, state);
    }

    /**
     * HTML in Outerra doesn't seem to provide navigating between fields with the tab key
     * 'out of the box', so this method is provided until this is fixed.
     *
     * It simply tries to focus the next (enabled) editable field
     */
    static outerraTabHack(evt)
    {
        // no need to do anything if we are just in a browser
        if(!$isInsideTitan)
            return;

        // sanity check to make sure this is a TAB key (really this method
        // should only be called if the key is already verified to be a TAB
        // but we keep this here in case someone does something silly)
        if(evt.keyCode !== KEY_CODE.TAB)
            return;

        evt.preventDefault();

        // only do this on keydown - if we do it on keyup as well we get a
        // 'double skip' across fields
        if(evt.type !== 'keydown')
            return;

        const direction = evt.shiftKey ? -1 : 1;
        // current field
        const currentElm = evt.target;
        // find all tab-able elements
        const allElements = document.querySelectorAll('input, button, a, area, object, select, textarea, [contenteditable]');
        // Find the current tab index.
        const currentIndex = [...allElements].findIndex(el => currentElm.isEqualNode(el));
        // focus the following element
        let targetIndex = MathUtils.mod(currentIndex + direction, allElements.length);
        let targetElm = allElements[targetIndex];
        if(targetElm.hasAttribute('disabled'))
        {
            // don't tab into disabled items - find next enabled one
            let count = 0;
            while(targetElm.hasAttribute('disabled') && count<allElements.length)
            {
                targetIndex = MathUtils.mod(targetIndex + direction, allElements.length);
                targetElm = allElements[targetIndex];
                count ++; // prevent infinite loop if all are disabled(!)
            }
            if(count>=allElements.length)
                targetElm = currentElm;
        }

        targetElm.focus();
        if(targetElm.tagName === 'INPUT' || targetElm.tagName === 'TEXTAREA')
            targetElm.select();
    }
    /**
     * Currently required for <select> elements to function properly -
     * without this clicking on a <select> dropdown element has no
     * effect.
     *
     * Essentially what is happening is that a cloned version of the
     * original <select> is created with correct functionality and
     * displayed over the top of the original one when a click event
     * occurs.
     *
     * @param {Object} el the <select> DOM element to 'fix'
     * @param {Number} maxHeight (optional) specify the maximum allowed
     *        height of the dropdown
     */
    static outerraDropdownHack(el, maxHeight)
    {
        if (!el || el.children.length < 2 || el.__ddhack !== undefined)
        {
            // already done or not necessary
            return;
        }

        el.__ddhack = {
            shown: false,
            inside:false
        };

        const children = el.children;
        const d = el.ownerDocument;
        const decorator = d.createElement('select');

        decorator.size = children.length;
        decorator.style.maxHeight = maxHeight;
        decorator.style.display = 'none';
        decorator.style.outline = 'none';
        decorator.style.overflow = 'auto';
        decorator.style.position = 'fixed';
        decorator.style.zIndex = 100000;

        [...children]
            .filter((child) => child.nodeName === 'OPTION')
            .forEach(child =>
            {
                const item = child.cloneNode(true); // Copy the element and any child nodes
                item.classList.add('__ddhack'); // hover styles from stylesheet: `option.__ddhack:hover{background-color: #1e90ff;}`
                item.addEventListener('click', () => hideContainer() );
                decorator.appendChild(item);
            });

        function insertAfter(targetEl, insertedEl)
        {
            const parent = targetEl.parentNode;
            if (targetEl.nextSibling === null)
            {
                parent.appendChild(insertedEl);
            }
            else
            {
                parent.insertBefore(insertedEl, targetEl.nextSibling);
            }
        }

        function showContainer()
        {
            if (el.__ddhack.shown === false)
            {
                const client = el.getBoundingClientRect();
                decorator.style.display = 'block';
                decorator.style.width = `${client.width}px`;
                decorator.style.left = `${client.left}px`;
                decorator.style.top = `${client.height + client.top}px`;
                decorator.selectedIndex = el.selectedIndex;
                el.__ddhack.shown = true;
            }
        }

        function hideContainer()
        {
            if (el.__ddhack.shown === true)
            {
                decorator.style.display = 'none';
                el.__ddhack.shown = false;
            }
        }

        decorator.addEventListener('change', () =>
        {
            el.selectedIndex = decorator.selectedIndex;
            el.dispatchEvent(new Event('change'));
        });

        decorator.addEventListener('mouseenter', () =>
        {
            el.__ddhack.inside = true;
        });

        decorator.addEventListener('mouseleave', () =>
        {
            el.__ddhack.inside = false;
        });

        decorator.addEventListener('blur', () =>
        {
            if (!el.__ddhack.inside) hideContainer();
        });
        el.addEventListener('blur', () =>
        {
            if (!el.__ddhack.inside) hideContainer();
        });

        insertAfter(el, decorator);

        el.addEventListener('click', () =>
        {
            if (el.__ddhack.shown)
            { // is visible
                hideContainer();
            }
            else
            { // is hidden
                showContainer();
            }
        });

        el.addEventListener('change', () =>
        {
            decorator.selectedIndex = el.selectedIndex;
        });
    }
}

TitanUtils.GLOBAL_LISTENERS = [];
