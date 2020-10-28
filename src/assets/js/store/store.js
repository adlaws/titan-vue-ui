import Vue from 'vue';
import Vuex from 'vuex';

import TitanUtils, { SIM_MODE, SIM_MODES, $eview, $isInsideTitan, $tWorldInterface } from '@/assets/js/titan/titan-utils.js';

Vue.use(Vuex);

export const STORE_MUTATION = {
    // WINDOW MANAGEMENT
    REGISTER_WINDOW:'registerWindow',
    CLOSE_WINDOW:'closeWindow',
    WINDOW_TO_FRONT:'windowToFront',
    // TITAN STATE MANAGEMENT
    CHANGE_SIM_MODE:'changeSimMode',
    UPDATE_MOUSE_BUTTON_STATE:'updateMouseButtonState',
    UPDATE_MODIFIER_KEY_STATE:'updateModifierKeyState',
};

const ApplicationState = new Vuex.Store({
    state: {
        windows: {},
        maxZ: 0,
        titan:
        {
            simMode: null,
            entityDescriptors: $isInsideTitan?$tWorldInterface.getEntityDescriptionList():[],
            inputState: {
                // Outerra events are not reliable in isolation to gather mouse button and modifier
                // key state, so we keep track of it here
                mouse: {
                    buttons: {left:false, right:false, middle:false}, // true if corresponding button is currently down, false otherwise
                    press: {
                        lastDown: {time: -1, x: -1, y:- 1},
                        lastUp: {time: -1, x: -1, y: -1},
                        delta: {time: 0, x: 0, y: 0, dist:0},
                        button: {left:false, right:false, middle:false}, // true if corresponding button was part of the last press, false otherwise
                    }
                },
                key: {
                    modifiers:
                    {
                        shift: false, // true if any SHIFT key is down, false otherwise
                        ctrl: false, // true if any CTRL key is down, false otherwise
                        alt: false, // true if any ALT key is down, false otherwise
                        meta: false, // true if any META key is down, false otherwise
                    }
                },
            }
        }
    },
    getters: {
        // --------------------------------------------------------------------
        // WINDOW MANAGEMENT
        // --------------------------------------------------------------------
        getWindowZindex: (state) => (id) =>
        {
            const registeredWindow = state.windows[id];
            return registeredWindow ? registeredWindow.zIndex : 0;
        },
        isWindowActive: (state) => (id) =>
        {
            const registeredWindow = state.windows[id];
            return registeredWindow ? registeredWindow.active : false;
        },

        // --------------------------------------------------------------------
        // TITAN STATE MANAGEMENT
        // --------------------------------------------------------------------
        titanSimMode: (state) => state.titan.simMode,
        titanEntityDescriptors: (state) => state.titan.entityDescriptors,
        // INPUT STATE
        modifierKeys: (state) => state.titan.inputState.key.modifiers,
        mouseButtons: (state) => state.titan.inputState.mouse.buttons,
        mousePress: (state) => state.titan.inputState.mouse.press,
    },
    mutations: {
        // --------------------------------------------------------------------
        // WINDOW MANAGEMENT
        // --------------------------------------------------------------------
        [STORE_MUTATION.REGISTER_WINDOW](state, payload)
        {
            const windows = state.windows;
            for(const id in state.windows)
            {
                const w = state.windows[id];
                w.active = false;
            }
            state.maxZ++;
            Vue.set(windows, payload.id, { active: true, zIndex: state.maxZ });
        },
        [STORE_MUTATION.WINDOW_TO_FRONT](state, payload)
        {
            const window = state.windows[payload.id];
            if(!window)
                return;
            const currentZindex = window.zIndex;
            for(const id in state.windows)
            {
                const w = state.windows[id];
                w.active = id === payload.id;
                if(w.zIndex > currentZindex)
                    w.zIndex--;
            }
            window.zIndex = state.maxZ;
        },
        [STORE_MUTATION.CLOSE_WINDOW](/*state, payload*/)
        {
            // TODO
        },
        // --------------------------------------------------------------------
        // TITAN STATE MANAGEMENT
        // --------------------------------------------------------------------
        [STORE_MUTATION.CHANGE_SIM_MODE](state, mode)
        {
            if(!SIM_MODES.has(mode))
                return;

            state.titan.simMode = mode;
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
        /**
         * Updates the current state of the mouse buttons based on a DOM mouse
         * event.
         *
         * This is necessary because the DOM mouse events in Outerra do not
         * consistently populate the `button` or `buttons` properties associated
         * with those events.
         *
         * @param {object} state the store state object
         * @param {object} domEvent the DOM key event
         */
        [STORE_MUTATION.UPDATE_MOUSE_BUTTON_STATE](state, domEvent)
        {
            if(!domEvent)
                return;
            const evtType = domEvent.type;
            if(!evtType)
                return;

            const now = new Date().getTime();

            const mouseStates = state.titan.inputState.mouse;
            const buttonStates = mouseStates.buttons;
            const buttonPress = mouseStates.press;

            const isMouseDown = evtType === 'mousedown';
            let isMouseUp = !isMouseDown && evtType === 'mouseup';

            if($isInsideTitan && (!(isMouseDown || isMouseUp)) && evtType === 'mousemove')
            {
                // A bit of a nasty workaround to address the fact that a
                // `mousedown` event which is marked as unhandled with
                // `$eview.mark_unhandled()` prevents the expected `mouseup`
                // from being fired; without this event we can't tell when the
                // button is released.
                // Currently this only really affects right mouse clicks, which
                // are marked unhandled to allow camera panning to be handled
                // by Outerra.
                // To get around this, we check `mousemove` events as well, and
                // if a button which is currently thought to be "down" is not
                // down according to the mouse move event, treat it as if a
                // `mouseup` event occurred.
                // Note that this is not perfect because it relies heavily on
                // the assumption that the user will be moving the mouse almost
                // immediately after releasing the button.
                const leftReleased = buttonStates.left && (domEvent.buttons & 1) === 0;
                const rightReleased = buttonStates.right && (domEvent.buttons & 2) === 0;
                const middleReleased = buttonStates.middle && (domEvent.buttons & 4) === 0;

                isMouseUp = (leftReleased || rightReleased || middleReleased);
            }

            if(isMouseDown || isMouseUp)
            {
                if(isMouseDown)
                {
                    buttonPress.delta.time = -1;
                    buttonPress.delta.x = 0;
                    buttonPress.delta.y = 0;
                    buttonPress.lastUp.time = -1;
                    buttonPress.lastUp.x = -1;
                    buttonPress.lastUp.y = -1;

                    buttonPress.lastDown.time = now;
                    buttonPress.lastDown.x = domEvent.clientX;
                    buttonPress.lastDown.y = domEvent.clientY;
                    buttonStates.left = domEvent.button === 0;
                    buttonStates.right = domEvent.button === 2;
                    buttonStates.middle = domEvent.button === 1;
                }
                else if(isMouseUp)
                {
                    buttonPress.lastUp.time = now;
                    buttonPress.lastUp.x = domEvent.clientX;
                    buttonPress.lastUp.y = domEvent.clientY;

                    // statistics on press - duration and mouse movement
                    buttonPress.delta.time = now - buttonPress.lastDown.time;
                    const dX = domEvent.clientX - buttonPress.lastDown.x;
                    const dY = domEvent.clientY - buttonPress.lastDown.y;
                    buttonPress.delta.x = dX;
                    buttonPress.delta.y = dY;
                    buttonPress.delta.dist = Math.sqrt(dX * dX + dY * dY);
                    // statistics on press - button(s) involved
                    buttonPress.button.left = buttonStates.left;
                    buttonPress.button.right = buttonStates.right;
                    buttonPress.button.middle = buttonStates.middle;

                    // from the event we can't tell which button was released,
                    // so we have to assume that all mouse buttons are up now
                    buttonStates.left = false;
                    buttonStates.right = false;
                    buttonStates.middle = false;
                }
            }
        },
        /**
         * Updates the current state of the SHIFT, CTRL, ALT and META keys based
         * on a DOM key event.
         *
         * This is necessary because the DOM mouse events in Outerra do not
         * populate the key modifier properties associated with those events.
         * In other words the mouse events *always* have modifier key properties
         * such as `shiftKey`, `ctrlKey` etc as `false`.
         *
         * @param {object} state the store state object
         * @param {object} domEvent the DOM key event
         */
        [STORE_MUTATION.UPDATE_MODIFIER_KEY_STATE](state, domEvent)
        {
            if(!domEvent)
                return;
            const evtType = domEvent.type;
            if(!evtType)
                return;

            const modifierKeyStates = state.titan.inputState.key.modifiers;
            modifierKeyStates.shift = domEvent.shiftKey || false;
            modifierKeyStates.ctrl = domEvent.ctrlKey || false;
            modifierKeyStates.alt = domEvent.altKey || false;
            modifierKeyStates.meta = domEvent.metaKey || false;
        },

    },
    actions: {},
    modules: {}
});

export default ApplicationState;
