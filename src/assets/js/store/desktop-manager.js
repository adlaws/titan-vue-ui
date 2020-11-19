import Vue from 'vue';
import Vuex from 'vuex';

import { $isInsideTitan } from '@/assets/js/titan/titan-utils.js';

Vue.use(Vuex);

export const DESKTOP_MUTATION = {
    // INPUT STATE TRACKING
    UPDATE_MOUSE_BUTTON_STATE:'desktop::updateMouseButtonState',
    UPDATE_MODIFIER_KEY_STATE:'desktop::updateModifierKeyState',
    // SCREEN UPDATES
    UPDATE_SCREEN_SIZE:'desktop::updateScreenSize',
    // WINDOW MANAGEMENT
    SET_TASKBAR_VISIBLE:'desktop::setTaskbarVisible',
    REGISTER_WINDOW:'desktop::registerWindow',
    UPDATE_WINDOW:'desktop::updateWindow',
    DEREGISTER_WINDOW:'desktop::deregisterWindow',
    CLOSE_WINDOW:'desktop::closeWindow',
    WINDOW_TO_FRONT:'desktop::windowToFront',
    WINDOW_TO_BACK:'desktop::windowToBack',
    FULLSCREEN_ENTER:'desktop::enterFullscreen',
    FULLSCREEN_EXIT:'desktop::exitFullscreen',
};

const DesktopManager =
{
    state: () => ({
        // entire available screen - in reality this is the width and height of the space
        // available to the browser
        screen: {
            size:{
                w: $isInsideTitan ? screen.availWidth : document.body.clientWidth,
                h: $isInsideTitan ? screen.availHeight : document.body.clientHeight,
                x: 0,
                y: 0,
                midX: ($isInsideTitan ? screen.availWidth : document.body.clientWidth) / 2.0,
                midY: ($isInsideTitan ? screen.availHeight : document.body.clientHeight) / 2.0,
            }
        },
        // Outerra events are not reliable in isolation to gather mouse button and modifier
        // key state, so we keep track of it here
        input:{
            state: {
                mouse: {
                    buttons: {
                        left:false,
                        right:false,
                        middle:false
                    }, // true if corresponding button is currently down, false otherwise
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
                        shift: false, // true if either SHIFT key is down, false otherwise
                        ctrl: false, // true if either CTRL key is down, false otherwise
                        alt: false, // true if either ALT key is down, false otherwise
                        meta: false, // true if either META key is down, false otherwise
                    }
                },
            },
            handler:
            {
                mouse: null,
                key: null,
            }
        },
        // the size, visiblity and position of the taskbar, can be 'docked' to north, south,
        // east or west edges
        taskbar: {
            size: 64, // in pixels
            show: true,
            dock: 's', // n,s,e,w
        },
        // window registry and management
        windows: {},
        maxZ: 0,
    }),
    getters: {
        // --------------------------------------------------------------------
        // INPUT STATE
        // --------------------------------------------------------------------
        modifierKeys: (state) => state.input.state.key.modifiers,
        mouseButtons: (state) => state.input.state.mouse.buttons,
        mousePress: (state) => state.input.state.mouse.press,
        // --------------------------------------------------------------------
        // DESKTOP MANAGEMENT
        // --------------------------------------------------------------------
        screenSize: (state) => state.screen.size,
        isTaskbarVisible: (state) => state.taskbar.show,
        taskbarSize: (state) => state.taskbar.size,
        taskbarDock: (state) => state.taskbar.dock,
        taskbarBounds: (state, getters) =>
        {
            const size = getters.taskbarSize;
            const dock = getters.taskbarDock;

            const east = dock === 'e';
            const west = dock === 'w';
            const north = dock === 'n';
            const south = !(east || west || north);

            if(east || west)
            {
                return {
                    vertical: true,
                    left:west?0:'auto', right:east?0:'auto',
                    top:0, bottom:0,
                    width:`${size}px`, height:'100vh',
                };
            }

            return {
                top:north?0:'auto', bottom:south?0:'auto',
                left:0, right:0,
                width:'100vw', height:`${size}px`,
            };
        },
        desktopBounds: (state, getters) =>
        {
            const screenSize = getters.screenSize;
            const bounds = {
                x: 0, y: 0,
                w: screenSize.w, h: screenSize.h
            };
            if(getters.isTaskbarVisible)
            {
                const size = getters.taskbarSize;
                const dock = getters.taskbarDock;

                const east = dock === 'e';
                const west = dock === 'w';
                const north = dock === 'n';

                if(east || west)
                {
                    bounds.w -= size;
                    bounds.x += west?size:0;
                }
                else
                {
                    bounds.h -= size;
                    bounds.y += north?size:0;
                }
            }
            return bounds;
        },
        windows: (state) => state.windows || {},
        getWindow: (state, getters) => (id) => getters.windows[id] || {},
        getWindowManagedProps: (state, getters) => (id) => getters.getWindow(id).managed || {},
        getWindowZindex: (state, getters) => (id) => getters.getWindowManagedProps(id).zIndex || 0,
        isWindowActive: (state, getters) => (id) => getters.getWindowManagedProps(id).active || false,
        isWindowShown: (state, getters) => (id) => getters.getWindowManagedProps(id).show || false,
        isWindowFullscreen: (state, getters) => (id) => getters.getWindowManagedProps(id).fullscreen || false,
        isAnyWindowFullscreen: (state, getters) =>
        {
            return Object.keys(state.windows).filter((id) => getters.isWindowFullscreen(id) ).length > 0;
        },
    },
    mutations: {
        /**
         * Updates the current screen size - should only happen in a browser, Titan window remains
         * the same size for the current execution cycle
         *
         * @param {object} state the store state object
         */
        [DESKTOP_MUTATION.UPDATE_SCREEN_SIZE](state, payload)
        {
            const screenSize = state.screen.size;
            screenSize.w = payload.w;
            screenSize.h = payload.h;
            screenSize.midX = payload.w / 2.0;
            screenSize.midY = payload.h / 2.0;
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
        [DESKTOP_MUTATION.UPDATE_MOUSE_BUTTON_STATE](state, domEvent)
        {
            if(!domEvent)
                return;
            const evtType = domEvent.type;
            if(!evtType)
                return;

            const now = Date.now();

            const mouseStates = state.input.state.mouse;
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
        [DESKTOP_MUTATION.UPDATE_MODIFIER_KEY_STATE](state, domEvent)
        {
            if(!domEvent)
                return;
            const evtType = domEvent.type;
            if(!evtType)
                return;

            const modifierKeyStates = state.input.state.key.modifiers;
            modifierKeyStates.shift = domEvent.shiftKey || false;
            modifierKeyStates.ctrl = domEvent.ctrlKey || false;
            modifierKeyStates.alt = domEvent.altKey || false;
            modifierKeyStates.meta = domEvent.metaKey || false;
        },
        // --------------------------------------------------------------------
        // WINDOW MANAGEMENT
        // --------------------------------------------------------------------
        [DESKTOP_MUTATION.SET_TASKBAR_VISIBLE](state, isVisible=true)
        {
            state.taskbar.show = isVisible;
        },
        /**
         * Registers a new window
         *
         * @param {object} state the store state object
         * @param {object} payload an object of the form...
         *     {id:ID, title:TITLE, icon:ICON, instance:INSTANCE}
         * ...where ID is the unique ID of the window, TITLE is the (string)
         * title displayed in the window, ICON is the icon for the window, and
         * INSTANCE is the component instance itself.
         */
        [DESKTOP_MUTATION.REGISTER_WINDOW](state, payload)
        {
            const windows = state.windows;
            // deactivate all other windows
            for(const id in windows)
            {
                const managed = windows[id].managed;
                managed.active = false;
            }
            // new window is on top of all others
            state.maxZ++;
            // record salient details of the window's details
            Vue.set(
                windows,
                payload.id,
                {
                    id: payload.id,
                    title: payload.title,
                    icon: payload.icon,
                    managed:
                    {
                        active: true,
                        show: true,
                        fullscreen: false,
                        zIndex: state.maxZ,
                        instance: payload.instance, // window instance
                    }
                }
            );
        },
        /**
         * Update the details of an existing window
         *
         * NOTE: not all properies may be updated - only non-managed properties
         *
         * @param {object} state the store state object
         * @param {object} payload an object of the form...
         *     {id:ID, ...}
         * ...where ID is the unique ID of the window, and any remaining
         * key/value pairs are the properties to be updated
         */
        [DESKTOP_MUTATION.UPDATE_WINDOW](state, payload)
        {
            const window = state.windows[payload.id];
            if(!window)
                return; // no such window

            for(const key in payload)
            {
                // only allow updates of non-managed details
                if(key === 'id' || key === 'managed')
                    continue; // we don't allow a change of window ID or managed properties

                if(window[key] !== undefined)
                    window[key] = payload[key];
                {
                    window[key] = payload[key];
                }
            }
        },
        /**
         * Deregisters a window (when closing the window forever)
         *
         * @param {object} state the store state object
         * @param {object} payload an object of the form...
         *     {id:ID}
         * ...where ID is the unique ID of the window.
         */
        [DESKTOP_MUTATION.DEREGISTER_WINDOW](state, payload)
        {
            const window = state.windows[payload.id];
            if(!window)
                return; // no such window

            // remove the record of the window
            const windows = state.windows;
            Vue.delete(
                windows,
                payload.id,
            );

            // adjust the Z-indices of the remaining windows and (if the
            // de-registered window was active) activate the top level
            // window now
            const managed = window.managed;
            const currentZindex = managed.zIndex;
            const wasActive = managed.active;
            let maxZ = 0;
            let topWindow = null;
            for(const id in windows)
            {
                const w = windows[id];
                const wManaged = w.managed;
                if(wManaged.zIndex >= currentZindex)
                    wManaged.zIndex--;
                if(wManaged.zIndex >= maxZ)
                {
                    maxZ = w.zIndex;
                    topWindow = w;
                }
            }
            if(wasActive && topWindow)
                topWindow.active = true;

            state.maxZ--;
        },
        /**
         * Bring a window to the "front"
         *
         * @param {object} state the store state object
         * @param {object} payload an object of the form...
         *     {id:ID}
         * ...where ID is the unique ID of the window.
         */
        [DESKTOP_MUTATION.WINDOW_TO_FRONT](state, payload)
        {
            const window = state.windows[payload.id];
            if(!window)
                return; // no such window

            // adjust the Z-indices of all windows currently
            // in front of the window 'down' by one
            const managed = window.managed;
            const currentZindex = managed.zIndex;
            for(const id in state.windows)
            {
                const w = state.windows[id];
                const wManaged = w.managed;
                wManaged.active = (id === payload.id);
                if(wManaged.zIndex >= currentZindex)
                    wManaged.zIndex--;
            }
            // make the Z-index of the target window the maximum
            managed.zIndex = state.maxZ;
        },
        /**
         * Bring a window to the "back"
         *
         * @param {object} state the store state object
         * @param {object} payload an object of the form...
         *     {id:ID}
         * ...where ID is the unique ID of the window.
         */
        [DESKTOP_MUTATION.WINDOW_TO_BACK](state, payload)
        {
            const window = state.windows[payload.id];
            if(!window)
                return; // no such window

            const managed = window.managed;
            // cache Z-index of the target window
            const currentZindex = managed.zIndex;
            // deactivate and make the Z-index 1 (send to back)
            managed.active = false;
            managed.zIndex = 1;
            // adjust the Z-indices of all windows currently
            // in below the window 'up' by one, activate the
            // 'top' one
            for(const id in state.windows)
            {
                const w = state.windows[id];
                const wManaged = w.managed;
                if(wManaged.zIndex < currentZindex)
                    wManaged.zIndex++;
                wManaged.active = wManaged.zIndex === state.maxZ;
            }
        },
        [DESKTOP_MUTATION.FULLSCREEN_ENTER](state, payload)
        {
            const window = state.windows[payload.id];
            if(!window)
                return; // no such window to fullscreen

            // hide all other windows
            for(const id in state.windows)
            {
                if(id !== payload.id)
                {
                    const w = state.windows[id];
                    const wManaged = w.managed;
                    wManaged.show = false;
                    // only one item may be fullscreen at any time
                    wManaged.fullscreen = false;
                }
            }

            // hide taskbar
            const taskbar = state.taskbar;
            taskbar.show = false;

            // target window to full screen
            const managed = window.managed;
            managed.fullscreen = true;
        },
        [DESKTOP_MUTATION.FULLSCREEN_EXIT](state)
        {
            // show taskbar
            const taskbar = state.taskbar;
            taskbar.show = true;

            // restore all windows
            for(const id in state.windows)
            {
                const w = state.windows[id];
                const wManaged = w.managed;
                wManaged.fullscreen = false;
                wManaged.show = true;
            }
        },
    },
    actions: {},
};

export default DesktopManager;