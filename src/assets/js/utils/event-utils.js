export default class EventUtils
{
    /**
     * Determine if the event is a mousedown event
     *
     * @param evt the event
     * @returns true if the event is a mousedown event, false otherwise
     */
    static isMouseDown(evt)
    {
        return EventUtils.isEventType(evt, 'mousedown');
    }

    /**
     * Determine if the event is a left mousedown event
     *
     * @param evt the event
     * @returns true if the event is a left mousedown event, false otherwise
     */
    static isLeftMouseDown(evt)
    {
        return EventUtils.isMouseDown(evt) && EventUtils.hasLeftMouseButton(evt);
    }

    /**
     * Determine if the event is a right mousedown event
     *
     * @param evt the event
     * @returns true if the event is a right mousedown event, false otherwise
     */
    static isRightMouseDown(evt)
    {
        return EventUtils.isMouseDown(evt) && EventUtils.hasRightMouseButton(evt);
    }

    /**
     * Determine if the event is a mouseup event
     *
     * @param evt the event
     * @returns true if the event is a mouseup event, false otherwise
     */
    static isMouseUp(evt)
    {
        return EventUtils.isEventType(evt, 'mouseup');
    }

    /**
     * Determine if the event is a left mouseup event
     *
     * @param evt the event
     * @returns true if the event is a left mouseup event, false otherwise
     */
    static isLeftMouseUp(evt)
    {
        return EventUtils.isMouseUp(evt) && EventUtils.hasLeftMouseButton(evt);
    }

    /**
     * Determine if the event is a right mouseup event
     *
     * @param evt the event
     * @returns true if the event is a right mouseup event, false otherwise
     */
    static isRightMouseUp(evt)
    {
        return EventUtils.isMouseUp(evt) && EventUtils.hasRightMouseButton(evt);
    }

    /**
     * Determine if the event is a key down event, optionally also verifying
     * the key causing the event
     *
     * @param evt the event
     * @param keyCode optionally also verify the keycode
     * @returns true if the event is a keydown event, false otherwise. If
     *          the keycode is specified, the keycode for the event
     *          must also match
     */
    static isKeyDown(evt, keyCode)
    {
        let result = EventUtils.isEventType(evt, 'keydown');
        if(keyCode!==undefined)
            result = result && (evt.keyCode === keyCode);
        return result;
    }

    /**
     * Determine if the event involves the CTRL key
     *
     * @param evt the event (mouse or keyboard event)
     * @returns true if the event involves the left and/or right SHIFT key
     */
    static hasShiftModifier(evt)
    {
        return evt.shiftKey || // standard JavaScript key event
            evt.modifiers & 3 > 0; // Outerra 'desktop' key event - LEFTSHIFT is 1, RIGHTSHIFT is 2;
    }

    /**
     * Determine if the event involves the CTRL key
     *
     * @param evt the event (mouse or keyboard event)
     * @returns true if the event involves the left and/or right CTRL key
     */
    static hasCtrlModifier(evt)
    {
        return evt.ctrlKey || // standard JavaScript key event
            evt.modifiers & 12 > 0; // Outerra 'desktop' key event - LEFTCTRL is 4, RIGHTCTRL is 8;
    }

    /**
     * Determine if the event involves the ALT key
     *
     * @param evt the event (mouse or keyboard event)
     * @returns true if the event involves the left and/or right ALT key
     */
    static hasAltModifier(evt)
    {
        return evt.altKey || // standard JavaScript key event
            evt.modifiers & 48 > 0; // Outerra 'desktop' key event - LEFTALT is 16, RIGHTALT is 32;
    }

    /**
     * Determine if the event is a key up event, optionally also verifying
     * the key causing the event
     *
     * @param evt the event
     * @param keyCode optionally also verify the keycode
     * @returns true if the event is a keyup event, false otherwise. If
     *          the keycode is specified, the keycode for the event
     *          must also match
     */
    static isKeyUp(evt, keyCode)
    {
        let result = EventUtils.isEventType(evt, 'keyup');
        if(keyCode!==undefined)
            result = result && evt.keyCode === keyCode;
        return result;
    }

    /**
     * Determine if an event is of a specific type
     *
     * @param evt the event
     * @param typeName the name of the event type to verify
     * @returns true if the event is of the specified type
     */
    static isEventType(evt, typeName)
    {
        return (evt && evt.type === typeName) || false;
    }

    /**
     * Determine if a mouse event involved the left mouse button
     *
     * Example use:
     * // DOM event
     * const domIsLeft = EventUtils.hasLeftMouseButton(evt);
     * // Outerra event
     * const outerraIsLeft = EventUtils.hasLeftMouseButton(evt, 'on_desktop_mouse_down');
     *
     * @param evt the mouse event
     * @param evtTypeOverride manually specify the event type - required for
     *        Outerra events which always populate the `type` property of the
     *        event with `0`
     * @returns true if the event indicates that the left mouse button was involved
     */
    static hasLeftMouseButton(evt)
    {
        const CHECKER_FUNC_LOOKUP = BUTTON_CHECKER.LEFT;
        const func = CHECKER_FUNC_LOOKUP[evt.type] || CHECKER_FUNC_LOOKUP.default;
        return func(evt);
    }

    /**
     * Determine if a mouse event involved the right mouse button
     *
     * Example use:
     * // DOM event
     * const domIsRight = EventUtils.hasRightMouseButton(evt);
     * // Outerra event
     * const outerraIsRight = EventUtils.hasRightMouseButton(evt, 'on_desktop_mouse_down');
     *
     * @param evt the event
     * @param evtTypeOverride manually specify the event type - required for
     *        Outerra events which always populate the `type` property of the
     *        event with `0`
     * @returns true if the event indicates that the right mouse button was pressed
     */
    static hasRightMouseButton(evt, evtTypeOverride)
    {
        const CHECKER_FUNC_LOOKUP = BUTTON_CHECKER.RIGHT;
        const evtType = evtTypeOverride || evt.type;
        const func = CHECKER_FUNC_LOOKUP[evtType] || CHECKER_FUNC_LOOKUP.default;
        return func(evt);
    }

    /**
     * Utility function to check if an event occurred on an form field element
     * (i.e., <input>, <textarea>, <button>, <select> etc)
     *
     * @param evt the event
     * @returns true if the target of the event is a form field element
     */
    static isInFormField(evt)
    {
        if(!evt)
            return false;
        const tagName = (evt.targetElm && evt.targetElm.tagName) || (evt.target && evt.target.tagName);
        console.log(tagName);
        return FORMFIELD_TAGS.has(tagName);
    }

    static isNotInFormField(evt)
    {
        return !EventUtils.isInFormField(evt);
    }
}

export const FORMFIELD_TAGS = new Set(['INPUT','TEXTAREA','BUTTON','SELECT','OPTION']);

// use to check against `evt.button`
export const MOUSE_BUTTON = {
    LEFT:0,
    RIGHT:2,
    MIDDLE:1
};

// use to check against `evt.buttons`
export const MOUSE_BUTTONS_MASK = {
    LEFT:1,
    RIGHT:2,
    MIDDLE:4
};

// used to check involvement of left/right mouse buttons
const MOUSE_BUTTON_CHECKERS = {
    leftButtonFunc: (evt) => evt && (evt.button === MOUSE_BUTTON.LEFT),
    leftButtonsMaskFunc: (evt) => evt && ((evt.buttons & MOUSE_BUTTONS_MASK.LEFT) !== 0),
    rightButtonFunc:(evt) => evt && (evt.button === MOUSE_BUTTON.RIGHT),
    rightButtonsMaskFunc:(evt) => evt && ((evt.buttons & MOUSE_BUTTONS_MASK.RIGHT) !== 0),
};
export const BUTTON_CHECKER = {
    LEFT:{
        // key is mouse event name, value is function to decide involved mouse button
        // DOM events
        contextmenu: () => false,
        mousedown: MOUSE_BUTTON_CHECKERS.leftButtonFunc,
        mouseup: MOUSE_BUTTON_CHECKERS.leftButtonFunc,
        click: MOUSE_BUTTON_CHECKERS.leftButtonFunc,
        mousemove: MOUSE_BUTTON_CHECKERS.leftButtonsMaskFunc,
        // Outerra events
        on_desktop_mouse_down: MOUSE_BUTTON_CHECKERS.leftButtonsMaskFunc,
        on_desktop_mouse_up: MOUSE_BUTTON_CHECKERS.leftButtonsMaskFunc,
        on_desktop_mouse_move: MOUSE_BUTTON_CHECKERS.leftButtonsMaskFunc,
        // anything else
        default: () => false,
    },
    RIGHT:{
        // key is mouse event name, value is function to decide involved mouse button
        contextmenu: () => true,
        // DOM events
        mousedown: MOUSE_BUTTON_CHECKERS.rightButtonFunc,
        mouseup: MOUSE_BUTTON_CHECKERS.rightButtonFunc,
        click: MOUSE_BUTTON_CHECKERS.rightButtonFunc,
        mousemove: MOUSE_BUTTON_CHECKERS.rightButtonsMaskFunc,
        // Outerra events
        on_desktop_mouse_down: MOUSE_BUTTON_CHECKERS.rightButtonsMaskFunc,
        on_desktop_mouse_up: MOUSE_BUTTON_CHECKERS.rightButtonsMaskFunc,
        on_desktop_mouse_move: MOUSE_BUTTON_CHECKERS.rightButtonsMaskFunc,
        // anything else
        default: () => false,
    }
};

export const KEY_CODE = {
    BACKSPACE:8,
    TAB:9,
    ENTER:13,
    SHIFT:16,
    CTRL:17,
    ALT:18,
    PAUSE_BREAK:19,
    CAPSLOCK:20,
    ESCAPE:27,
    SPACE:32,
    PAGE_UP:33,
    PAGE_DOWN:34,
    END:35,
    HOME:36,
    LEFT_ARROW:37,
    UP_ARROW:38,
    RIGHT_ARROW:39,
    DOWN_ARROW:40,
    INSERT:45,
    DELETE:46,
    _0:48,
    _1:49,
    _2:50,
    _3:51,
    _4:52,
    _5:53,
    _6:54,
    _7:55,
    _8:56,
    _9:57,
    A:65,
    B:66,
    C:67,
    D:68,
    E:69,
    F:70,
    G:71,
    H:72,
    I:73,
    J:74,
    K:75,
    L:76,
    M:77,
    N:78,
    O:79,
    P:80,
    Q:81,
    R:82,
    S:83,
    T:84,
    U:85,
    V:86,
    W:87,
    X:88,
    Y:89,
    Z:90,
    LEFT_WIN:91,
    RIGHT_WIN:92,
    SELECT:93,
    NUMPAD_0:96,
    NUMPAD_1:97,
    NUMPAD_2:98,
    NUMPAD_3:99,
    NUMPAD_4:100,
    NUMPAD_5:101,
    NUMPAD_6:102,
    NUMPAD_7:103,
    NUMPAD_8:104,
    NUMPAD_9:105,
    NUMPAD_MULTIPLY:106,
    NUMPAD_ADD:107,
    NUMPAD_SUBTRACT:109,
    NUMPAD_DECIMAL:110,
    NUMPAD_DIVIDE:111,
    F1:112,
    F2:113,
    F3:114,
    F4:115,
    F5:116,
    F6:117,
    F7:118,
    F8:119,
    F9:120,
    F10:121,
    F11:122,
    F12:123,
    NUM_LOCK:144,
    SCROLL_LOCK:145,
    SEMI_COLON:186,
    EQUALS:187,
    COMMA:188,
    DASH:189,
    PERIOD:190,
    FORWARD_SLASH:191,
    GRAVE_ACCENT:192,
    OPEN_BRACKET:219,
    BACK_SLASH:220,
    CLOSE_BRACKET:221,
    SINGLE_QUOTE:222,
    // JavaScript mouse codes constants to make things more readable and maintainable
    MOUSE_DOWN:1,
    MOUSE_UP:2,
    MOUSE_BUTTON_LEFT:0,
    MOUSE_BUTTON_RIGHT:1,
    MOUSE_BUTTON_MIDDLE:2,
    MOUSE_LEFT_DRAG:1,
    MOUSE_RIGHT_DRAG:2,
    MOUSE_MIDDLE_DRAG:4,
    MOUSE_MODIFIER_ALT:48,
    MOUSE_MODIFIER_CTRL:12,
    MOUSE_MODIFIER_SHIFT:3
};
Object.freeze(KEY_CODE);
