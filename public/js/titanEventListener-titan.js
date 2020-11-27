// TODO: Maybe define array of window names that should receive special event types
// NOTE: due to a bug in Outerra bind_script, you will have to assign $eview externally, or use this.getHyperion();

/** $global.titanEventHandlers functions must be added by window context to prevent crash
 *
 * @type {{}}
 */
if (!$global.titanEventHandlers) {

    $global.titanEventHandlers = {};

    var TitanEvent = $global.TitanEvent = {
        _L: {}, // subscribers to single titan event
        _G: [], // subscribers to any titan event, could be perf problem if misused

        addListener: function (name, handler) {
            var subs = TitanEvent._L[name];
            if (!subs) {
                subs = TitanEvent._L[name] = [];
            }
            subs.push(handler);
        },
        removeListener: function (name, handler) {
            var subs = TitanEvent._L[name];
            if (!subs) return false;

            var index = subs.indexOf(handler);
            if (index === -1) return false;

            subs.splice(index, 1);
            return true;
        },
        addGlobalListener: function (handler) {
            TitanEvent._G.push(handler);
        },
        removeGlobalListener: function (handler) {
            var index = TitanEvent._G.indexOf(handler);
            if (index === -1) return false;
            TitanEvent._G.splice(index, 1);
            return true;
        }
    };
}

/** user event triggered by Titan CPP
 *
 * @param eventName
 * @param eventArgs
 */
function onUserEventArgs(eventName, eventArgs) {
    try {
        var titanEvent = $global.TitanEvent;
        var g = titanEvent._G;
        var l = titanEvent._L;

        var lsubs = l[eventName];
        if (lsubs) for (var i = lsubs.length - 1; i >= 0; i--) {
            try {
                lsubs[i](eventName, eventArgs);
            }
            catch (e) {
                if (this.$log) this.$log('ERROR onUserEventArgs#1 : ' + e.message);
            }
        }

        for (var j = g.length - 1; j >= 0; j--) {
            try {
                g[j](eventName, eventArgs);
            }
            catch (e) {
                if (this.$log) this.$log('ERROR onUserEventArgs#2 : ' + e.message);
            }
        }

        // route through to callbacks registered against $global
        try {
            var userFunc = $global.titanEventHandlers[eventName];
            if (typeof userFunc !== "undefined") userFunc(eventName, eventArgs);
        }
        catch (e) {
            if (this.$log) this.$log('ERROR onUserEventArgs#3 : ' + e.message);
        }

        /* see titanGlobalWindowAPI.js for triggerTitanWindowEvent instance - declared there to prevent crash */
        // TODO: create a $global register so windows can register against event names
        // NOTE: errorLog method isn't bound when executing tests, so need to check if it's available
        // (otherwise unit tests will break)
        // [disabled for performance reasons, plus it spams during firefights]
        //if( $global.fadingLog )
        //	$global.fadingLog("User event despatched: "+eventName+", args: "+eventArgs);

        /* see titanGlobalWindowAPI.js for triggerTitanWindowEvent instance - declared there to prevent crash */
        if ($global.titanEventHandlers.triggerTitanWindowEvent) {
            $global.titanEventHandlers.triggerTitanWindowEvent(eventName, eventArgs);
            //$global.titanEventHandlers.triggerTitanWindowEvent('pilotStation', eventName, eventArgs);
        }
    }
    catch (e) {
        if (this.$log) this.$log('ERROR onUserEventArgs#4: ' + e.message);
    }
}

/** scenario event trigered by Titan CPP
 *
 * @param eventName
 * @param eventArgs
 */
function onScenarioEvent(eventName, eventArgs) {
    try {
        // route through to callbacks registered against $global
        var userFunc = $global.titanEventHandlers[eventName];
        if (typeof userFunc !== "undefined") {
            userFunc(eventName, eventArgs);
        }

        /* see titanGlobalWindowAPI.js for triggerTitanWindowEvent instance - declared there to prevent crash */
        if ($global.titanEventHandlers.triggerTitanWindowEvent) {
            $global.titanEventHandlers.triggerTitanWindowEvent(eventName, eventArgs);
        }
    }
    catch (e) {
        if (this.$log) this.$log('ERROR onScenarioEvent: ' + e.message);
    }
}

/** entity event trigered by Titan CPP
 *
 * @param entityGUID
 * @param eventName
 */
function onEntityEvent(entityGUID, eventName) {
    // route the event through to registered callback
    //this.entityCallbackHandler(entityGUID, eventName);
    //this.onEntityEvent(entityGUID, eventName);
}