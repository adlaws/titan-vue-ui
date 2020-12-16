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
        return EventUtils.isKeyEvent(evt, 'keydown', keyCode);
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
        return EventUtils.isKeyEvent(evt, 'keyup', keyCode);
    }

    /**
     * Determine if the event is a key press event, optionally also verifying
     * the key causing the event
     *
     * @param evt the event
     * @param keyCode optionally also verify the keycode
     * @returns true if the event is a keypress event, false otherwise. If
     *          the keycode is specified, the keycode for the event
     *          must also match
     */
    static isKeyPress(evt, keyCode)
    {
        return EventUtils.isKeyEvent(evt, 'keypress', keyCode);
    }

    /**
     * Determine if the key event is of an event type and (optionally) also
     * verifying the key causing the event
     *
     * @param evt the event
     * @param evtType the event type
     * @param keyCode the keycode to check - may be a single keycode, or an Array
     *        or Set of keycodes to match
     * @returns true if the event has the correct keycode, false otherwise
     */
    static isKeyEvent(evt, evtType, keyCode)
    {
        if(!evt || !evtType)
            return false;

        let result = EventUtils.isEventType(evt, evtType);

        // if it's the right event type, also check the keycode if specified
        if(result && keyCode !== undefined)
            result = result && EventUtils.isKey(evt, keyCode);

        return result;
    }

    /**
     * Determine if the event is for a particular key
     *
     * @param evt the event
     * @param keyCode the keycode to check - may be a single keycode, or an Array
     *        or Set of keycodes to match
     * @returns true if the event has the correct keycode, false otherwise
     */
    static isKey(evt, keyCode)
    {
        if(!evt || !keyCode)
            return false;

        if(keyCode instanceof Set)
            return keyCode.has(evt.keyCode);
        if(Array.isArray(keyCode))
            return keyCode.indexOf(evt.keyCode) >= 0;
        return evt.keyCode === keyCode;
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
     * See also FORMFIELD_TAGS definition
     *
     * @param evt the event
     * @returns true if the target of the event is a form field element
     */
    static isInFormField(evt)
    {
        if(!evt)
            return false;
        // need to check both `target` and  `targetElm` to cover our bases in both Outerra and
        // browser environments. Check `target` first as that is the Outerra environment one
        const tagName = (evt.target && evt.target.tagName) ||
                        (evt.targetElm && evt.targetElm.tagName);
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

// NOTE: The `keyCode` property for keyboard events is widely documented as being deprecated,
//       and the `code` property should be used instead... that is, rather than
//
//           evt.keyCode === 65 // check for 'A' key
//
//       we should be doing
//
//           evt.code === 'KeyA' // check for 'A' key
//
//       Ref: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode

//            https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
//       Ref: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
//
//       That said, generally speaking the `keyCode` property is still the most widely
//       used.
//       This lookup map provides constants for both, though at the time of writing the
//       EventUtils utility class only uses the `KEY.KEY_CODE` constants.
export const KEY = {
    KEY_CODE: {
        BACKSPACE:8,
        TAB:9,
        ENTER:13,
        SHIFT:16,
        CTRL:17,
        ALT:18,
        PAUSE:19,
        CAPSLOCK:20,
        ESCAPE:27,
        SPACE:32,
        PAGEUP:33,
        PAGEDOWN:34,
        END:35,
        HOME:36,
        ARROWLEFT:37,
        ARROWUP:38,
        ARROWRIGHT:39,
        ARROWDOWN:40,
        INSERT:45,
        DELETE:46,
        DIGIT0:48,
        DIGIT1:49,
        DIGIT2:50,
        DIGIT3:51,
        DIGIT4:52,
        DIGIT5:53,
        DIGIT6:54,
        DIGIT7:55,
        DIGIT8:56,
        DIGIT9:57,
        KEYA:65,
        KEYB:66,
        KEYC:67,
        KEYD:68,
        KEYE:69,
        KEYF:70,
        KEYG:71,
        KEYH:72,
        KEYI:73,
        KEYJ:74,
        KEYK:75,
        KEYL:76,
        KEYM:77,
        KEYN:78,
        KEYO:79,
        KEYP:80,
        KEYQ:81,
        KEYR:82,
        KEYS:83,
        KEYT:84,
        KEYU:85,
        KEYV:86,
        KEYW:87,
        KEYX:88,
        KEYY:89,
        KEYZ:90,
        METALEFT:91,
        METARIGHT:92,
        CONTEXTMENU:93,
        NUMPAD0:96,
        NUMPAD1:97,
        NUMPAD2:98,
        NUMPAD3:99,
        NUMPAD4:100,
        NUMPAD5:101,
        NUMPAD6:102,
        NUMPAD7:103,
        NUMPAD8:104,
        NUMPAD9:105,
        NUMPADMULTIPLY:106,
        NUMPADADD:107,
        NUMPADSUBTRACT:109,
        NUMPADDECIMAL:110,
        NUMPADDIVIDE:111,
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
        NUMLOCK:144,
        SCROLLLOCK:145,
        SEMICOLON:186,
        EQUALS:187,
        COMMA:188,
        MINUS:189,
        PERIOD:190,
        SLASH:191,
        BACKQUOTE:192,
        BRACKETLEFT:219,
        INTLBACKSLASH:220,
        BRACKETRIGHT:221,
        QUOTE:222,
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
    },
    // from https://w3c.github.io/uievents-code/
    CODE: {
        BACKQUOTE: "Backquote", // `~ on a US keyboard. This is the 半角/全角/漢字 (hankaku/zenkaku/kanji) key on Japanese keyboards
        BACKSLASH: "Backslash", // Used for both the US \| (on the 101-key layout) and also for the key located between the " and Enter keys on row C of the 102-, 104- and 106-key layouts. Labelled #~ on a UK (102) keyboard.
        BRACKETLEFT: "BracketLeft", // [{ on a US keyboard.
        BRACKETRIGHT: "BracketRight", // ]} on a US keyboard.
        COMMA: "Comma", // ,< on a US keyboard.
        DIGIT0: "Digit0", // 0) on a US keyboard.
        DIGIT1: "Digit1", // 1! on a US keyboard.
        DIGIT2: "Digit2", // 2@ on a US keyboard.
        DIGIT3: "Digit3", // 3# on a US keyboard.
        DIGIT4: "Digit4", // 4$ on a US keyboard.
        DIGIT5: "Digit5", // 5% on a US keyboard.
        DIGIT6: "Digit6", // 6^ on a US keyboard.
        DIGIT7: "Digit7", // 7& on a US keyboard.
        DIGIT8: "Digit8", // 8* on a US keyboard.
        DIGIT9: "Digit9", // 9( on a US keyboard.
        EQUAL: "Equal", // =+ on a US keyboard.
        INTLBACKSLASH: "IntlBackslash", // Located between the left Shift and Z keys. Labelled \| on a UK keyboard.
        INTLRO: "IntlRo", // Located between the / and right Shift keys. Labelled \ろ (ro) on a Japanese keyboard.
        INTLYEN: "IntlYen", // Located between the = and Backspace keys. Labelled ¥ (yen) on a Japanese keyboard. \/ on a Russian keyboard.
        KEYA: "KeyA", // a on a US keyboard. Labelled q on an AZERTY (e.g., French) keyboard.
        KEYB: "KeyB", // b on a US keyboard.
        KEYC: "KeyC", // c on a US keyboard.
        KEYD: "KeyD", // d on a US keyboard.
        KEYE: "KeyE", // e on a US keyboard.
        KEYF: "KeyF", // f on a US keyboard.
        KEYG: "KeyG", // g on a US keyboard.
        KEYH: "KeyH", // h on a US keyboard.
        KEYI: "KeyI", // i on a US keyboard.
        KEYJ: "KeyJ", // j on a US keyboard.
        KEYK: "KeyK", // k on a US keyboard.
        KEYL: "KeyL", // l on a US keyboard.
        KEYM: "KeyM", // m on a US keyboard.
        KEYN: "KeyN", // n on a US keyboard.
        KEYO: "KeyO", // o on a US keyboard.
        KEYP: "KeyP", // p on a US keyboard.
        KEYQ: "KeyQ", // q on a US keyboard. Labelled a on an AZERTY (e.g., French) keyboard.
        KEYR: "KeyR", // r on a US keyboard.
        KEYS: "KeyS", // s on a US keyboard.
        KEYT: "KeyT", // t on a US keyboard.
        KEYU: "KeyU", // u on a US keyboard.
        KEYV: "KeyV", // v on a US keyboard.
        KEYW: "KeyW", // w on a US keyboard. Labelled z on an AZERTY (e.g., French) keyboard.
        KEYX: "KeyX", // x on a US keyboard.
        KEYY: "KeyY", // y on a US keyboard. Labelled z on a QWERTZ (e.g., German) keyboard.
        KEYZ: "KeyZ", // z on a US keyboard. Labelled w on an AZERTY (e.g., French) keyboard, and y on a QWERTZ (e.g., German) keyboard.
        MINUS: "Minus", // -_ on a US keyboard.
        PERIOD: "Period", // .> on a US keyboard.
        QUOTE: "Quote", // '" on a US keyboard.
        SEMICOLON: "Semicolon", // ;: on a US keyboard.
        SLASH: "Slash", // /? on a US keyboard.
        ALTLEFT: "AltLeft", // Alt, Option or ⌥.
        ALTRIGHT: "AltRight", // Alt, Option or ⌥. This is labelled AltGr key on many keyboard layouts.
        BACKSPACE: "Backspace", // Backspace or ⌫. Labelled Delete on Apple keyboards.
        CAPSLOCK: "CapsLock", // CapsLock or ⇪
        CONTEXTMENU: "ContextMenu", // The application context menu key, which is typically found between the right Meta key and the right Control key.
        CONTROLLEFT: "ControlLeft", // Control or ⌃
        CONTROLRIGHT: "ControlRight", // Control or ⌃
        ENTER: "Enter", // Enter or ↵. Labelled Return on Apple keyboards.
        METALEFT: "MetaLeft", // The Windows, ⌘, Command or other OS symbol key.
        METARIGHT: "MetaRight", // The Windows, ⌘, Command or other OS symbol key.
        SHIFTLEFT: "ShiftLeft", // Shift or ⇧
        SHIFTRIGHT: "ShiftRight", // Shift or ⇧
        SPACE: "Space", //   (space)
        TAB: "Tab", // Tab or ⇥
        CONVERT: "Convert", // Japanese: 変換 (henkan)
        KANAMODE: "KanaMode", // Japanese: カタカナ/ひらがな/ローマ字 (katakana/hiragana/romaji)
        LANG1: "Lang1", // Korean: HangulMode 한/영 (han/yeong)
        LANG2: "Lang2", // Korean: Hanja 한자 (hanja)
        LANG3: "Lang3", // Japanese (word-processing keyboard): Katakana
        LANG4: "Lang4", // Japanese (word-processing keyboard): Hiragana
        LANG5: "Lang5", // Japanese (word-processing keyboard): Zenkaku/Hankaku
        NONCONVERT: "NonConvert", // Japanese: 無変換 (muhenkan)
        DELETE: "Delete", // ⌦. The forward delete key. Note that on Apple keyboards, the key labelled Delete on the main part of the keyboard should be encoded as "Backspace".
        END: "End", // Page Down, End or ↘
        HELP: "Help", // Help. Not present on standard PC keyboards.
        HOME: "Home", // Home or ↖
        INSERT: "Insert", // Insert or Ins. Not present on Apple keyboards.
        PAGEDOWN: "PageDown", // Page Down, PgDn or ⇟
        PAGEUP: "PageUp", // Page Up, PgUp or ⇞
        ARROWDOWN: "ArrowDown", // ↓
        ARROWLEFT: "ArrowLeft", // ←
        ARROWRIGHT: "ArrowRight", // →
        ARROWUP: "ArrowUp", // ↑
        NUMLOCK: "NumLock", // On the Mac, the "NumLock" code should be used for the numpad Clear key.
        NUMPAD0: "Numpad0", // 0 Ins on a keyboard
        NUMPAD1: "Numpad1", // 1 End on a keyboard
        NUMPAD2: "Numpad2", // 2 ↓ on a keyboard
        NUMPAD3: "Numpad3", // 3 PgDn on a keyboard
        NUMPAD4: "Numpad4", // 4 ← on a keyboard
        NUMPAD5: "Numpad5", // 5 on a keyboard
        NUMPAD6: "Numpad6", // 6 → on a keyboard
        NUMPAD7: "Numpad7", // 7 Home on a keyboard
        NUMPAD8: "Numpad8", // 8 ↑ on a keyboard
        NUMPAD9: "Numpad9", // 9 PgUp on a keyboard
        NUMPADADD: "NumpadAdd", // +
        NUMPADBACKSPACE: "NumpadBackspace", // Found on the Microsoft Natural Keyboard.
        NUMPADCLEAR: "NumpadClear", // C or AC (All Clear). Also for use with numpads that have a Clear key that is separate from the NumLock key. On the Mac, the numpad Clear key should always be encoded as "NumLock".
        NUMPADCLEARENTRY: "NumpadClearEntry", // CE (Clear Entry)
        NUMPADCOMMA: "NumpadComma", // , (thousands separator). For locales where the thousands separator is a "." (e.g., Brazil), this key may generate a ..
        NUMPADDECIMAL: "NumpadDecimal", // . Del. For locales where the decimal separator is "," (e.g., Brazil), this key may generate a ,.
        NUMPADDIVIDE: "NumpadDivide", // /
        NUMPADENTER: "NumpadEnter", //
        NUMPADEQUAL: "NumpadEqual", // =
        NUMPADHASH: "NumpadHash", // # on a phone or remote control device. This key is typically found below the 9 key and to the right of the 0 key.
        NUMPADMEMORYADD: "NumpadMemoryAdd", // M+ Add current entry to the value stored in memory.
        NUMPADMEMORYCLEAR: "NumpadMemoryClear", // MC Clear the value stored in memory.
        NUMPADMEMORYRECALL: "NumpadMemoryRecall", // MR Replace the current entry with the value stored in memory.
        NUMPADMEMORYSTORE: "NumpadMemoryStore", // MS Replace the value stored in memory with the current entry.
        NUMPADMEMORYSUBTRACT: "NumpadMemorySubtract", // M- Subtract current entry from the value stored in memory.
        NUMPADMULTIPLY: "NumpadMultiply", // * on a keyboard. For use with numpads that provide mathematical operations (+, -, * and /).
        NUMPADPARENLEFT: "NumpadParenLeft", // ( Found on the Microsoft Natural Keyboard.
        NUMPADPARENRIGHT: "NumpadParenRight", // ) Found on the Microsoft Natural Keyboard.
        NUMPADSTAR: "NumpadStar", // * on a phone or remote control device. This key is typically found below the 7 key and to the left of the 0 key.
        NUMPADSUBTRACT: "NumpadSubtract", // -
        ESCAPE: "Escape", // Esc or ⎋
        F1: "F1", // F1
        F2: "F2", // F2
        F3: "F3", // F3
        F4: "F4", // F4
        F5: "F5", // F5
        F6: "F6", // F6
        F7: "F7", // F7
        F8: "F8", // F8
        F9: "F9",    // F9
        F10: "F10", // F10
        F11: "F11", // F11
        F12: "F12", // F12
        FN: "Fn", // Fn This is typically a hardware key that does not generate a separate code. Most keyboards do not place this key in the function section, but it is included here to keep it with related keys.
        FNLOCK: "FnLock", // FLock or FnLock. Function Lock key. Found on the Microsoft Natural Keyboard.
        PRINTSCREEN: "PrintScreen", // PrtScr SysRq or Print Screen
        SCROLLLOCK: "ScrollLock", // Scroll Lock
        PAUSE: "Pause", // Pause Break
        BROWSERBACK: "BrowserBack", // Some laptops place this key to the left of the ↑ key.
        BROWSERFAVORITES: "BrowserFavorites", //
        BROWSERFORWARD: "BrowserForward", // Some laptops place this key to the right of the ↑ key.
        BROWSERHOME: "BrowserHome", //
        BROWSERREFRESH: "BrowserRefresh", //
        BROWSERSEARCH: "BrowserSearch", //
        BROWSERSTOP: "BrowserStop", //
        EJECT: "Eject", // Eject or ⏏. This key is placed in the function section on some Apple keyboards.
        LAUNCHAPP1: "LaunchApp1", // Sometimes labelled My Computer on the keyboard
        LAUNCHAPP2: "LaunchApp2", // Sometimes labelled Calculator on the keyboard
        LAUNCHMAIL: "LaunchMail", //
        MEDIAPLAYPAUSE: "MediaPlayPause", //
        MEDIASELECT: "MediaSelect", //
        MEDIASTOP: "MediaStop", //
        MEDIATRACKNEXT: "MediaTrackNext", //
        MEDIATRACKPREVIOUS: "MediaTrackPrevious", //
        POWER: "Power", // This key is placed in the function section on some Apple keyboards, replacing the Eject key.
        SLEEP: "Sleep", //
        AUDIOVOLUMEDOWN: "AudioVolumeDown", //
        AUDIOVOLUMEMUTE: "AudioVolumeMute", //
        AUDIOVOLUMEUP: "AudioVolumeUp", //
        WAKEUP: "WakeUp", //
        HYPER: "Hyper", //
        SUPER: "Super", //
        TURBO: "Turbo", //
        ABORT: "Abort", //
        RESUME: "Resume", //
        SUSPEND: "Suspend", //
        AGAIN: "Again", // Found on Sun’s USB keyboard.
        COPY: "Copy", // Found on Sun’s USB keyboard.
        CUT: "Cut", // Found on Sun’s USB keyboard.
        FIND: "Find", // Found on Sun’s USB keyboard.
        OPEN: "Open", // Found on Sun’s USB keyboard.
        PASTE: "Paste", // Found on Sun’s USB keyboard.
        PROPS: "Props", // Found on Sun’s USB keyboard.
        SELECT: "Select", // Found on Sun’s USB keyboard.
        UNDO: "Undo", // Found on Sun’s USB keyboard.
        HIRAGANA: "Hiragana", // Use for dedicated ひらがな key found on some Japanese word processing keyboards.
        KATAKANA: "Katakana", // Use for dedicated カタカナ key found on some Japanese word processing keyboards.
        UNIDENTIFIED: "Unidentified", // This value code should be used when no other value given in this specification is appropriate.
    }
};
Object.freeze(KEY);

export const ALPHA_KEY_CODES = new Set([
    KEY.KEY_CODE.A, KEY.KEY_CODE.B, KEY.KEY_CODE.C, KEY.KEY_CODE.D, KEY.KEY_CODE.E, KEY.KEY_CODE.F,
    KEY.KEY_CODE.G, KEY.KEY_CODE.H, KEY.KEY_CODE.I, KEY.KEY_CODE.J, KEY.KEY_CODE.K, KEY.KEY_CODE.L,
    KEY.KEY_CODE.M, KEY.KEY_CODE.N, KEY.KEY_CODE.O, KEY.KEY_CODE.P, KEY.KEY_CODE.Q, KEY.KEY_CODE.R,
    KEY.KEY_CODE.S, KEY.KEY_CODE.T, KEY.KEY_CODE.U, KEY.KEY_CODE.V, KEY.KEY_CODE.W, KEY.KEY_CODE.X,
    KEY.KEY_CODE.Y, KEY.KEY_CODE.Z
]);
export const NUM_KEY_CODES = new Set([
    KEY.KEY_CODE._0, KEY.KEY_CODE._1, KEY.KEY_CODE._2, KEY.KEY_CODE._3, KEY.KEY_CODE._4,
    KEY.KEY_CODE._5, KEY.KEY_CODE._6, KEY.KEY_CODE._7, KEY.KEY_CODE._8, KEY.KEY_CODE._9
]);
export const FUNCTION_KEY_CODES = new Set([
    KEY.KEY_CODE.F1, KEY.KEY_CODE.F2, KEY.KEY_CODE.F3, KEY.KEY_CODE.F4, KEY.KEY_CODE.F5, KEY.KEY_CODE.F6,
    KEY.KEY_CODE.F7, KEY.KEY_CODE.F8, KEY.KEY_CODE.F9, KEY.KEY_CODE.F10, KEY.KEY_CODE.F11, KEY.KEY_CODE.F12
]);
