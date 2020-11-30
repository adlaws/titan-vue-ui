// --------------------------------------------------------------------------------------------------------------------
/**
 * Set up functions required by:
 *
 *     src\titan_module_hyperion\interfaces\TitanEventInterface.cpp
 *
 * Refer to lines 72-80 of this file, and also to the original
 * implementation of these functions in:
 *
 *     gui/js/titanEventListener.js
 */

/** $global.titanEventHandlers functions must be added by window context to prevent crash
 *
 * @type {{}}
 */
var $global = typeof($global) === 'undefined' ? {} : $global;
if(typeof(window) !== 'undefined')
{
    // NOTE: This section is entirely for to provide a `$global` when working in a
    //       browser
    // NOTE: in Titan at the stage this JavaScript is brought in, there is no
    //       `window` instance (it's not merely null, but actually `undefined`),
    //       so we need to be carefule about how we reference it here. If Titan
    //       ever touches `window` in here it will just crash immediately.
    window.$global = $global;
}

// eslint-disable-next-line no-undef
var $otLogger = typeof($query_interface) === 'undefined' ? null : $query_interface('ot::js::logger.get');
// "mini" version of the logger found in `titan-utils.js` just so we can provide
// some logging functionality here
var $tLogger = {
    error: function() { $tLogger._doLog('error', arguments); },
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
            var logFunc = $otLogger[level+'_log'] || $otLogger.info_log;
            var concatenated = parts.map((x) => JSON.stringify(x)).join(' ');
            logFunc.call($otLogger, concatenated);
        }
    },
};

if(!$global.titanEventHandlers)
{
    $global.titanEventHandlers = {};

    var TitanEvent = $global.TitanEvent =
    {
        _L: {}, // subscribers to single titan event
        _G: [], // subscribers to any titan event, could be perf problem if misused
        addListener: function(name, handler)
        {
            var subs = TitanEvent._L[name] = (TitanEvent._L[name] || []);
            // add at front - most recent is at index 0
            subs.unshift(handler);
        },
        removeListener: function(name, handler)
        {
            var subs = TitanEvent._L[name];
            if (!subs) return false;

            var index = subs.indexOf(handler);
            if (index < 0)
                return false;

            subs.splice(index, 1);
            return true;
        },
        addGlobalListener: function(handler)
        {
            // add at front - most recent is at index 0
            TitanEvent._G.unshift(handler);
        },
        removeGlobalListener: function(handler)
        {
            var index = TitanEvent._G.indexOf(handler);
            if (index < 0)
                return false;

            TitanEvent._G.splice(index, 1);
            return true;
        }
    };
}

/**
 * Triggered by Titan CPP
 * @param evtName
 * @param evtArgs
 */
// eslint-disable-next-line no-unused-vars
function onUserEventArgs(evtName, evtArgs)
{
    var titanEvent = $global.TitanEvent;
    if(!titanEvent)
        return;

    try
    {
        (titanEvent._L[evtName] || []).forEach((handlerFunc)=>
        {
            try
            {
                handlerFunc(evtName, evtArgs);
            }
            catch (e)
            {
                $tLogger.error(`onUserEventArgs() could not process user event handler event '${evtName}': ${e.message}`);
            }
        });

        titanEvent._G.forEach((handlerFunc)=>
        {
            try
            {
                handlerFunc(evtName, evtArgs);
            }
            catch (e)
            {
                $tLogger.error(`onUserEventArgs() could not process global handler for event '${evtName}': ${e.message}`);
            }
        });
    }
    catch (e)
    {
        $tLogger.error('onUserEventArgs() failed: ' + e.message);
    }

    var titanEventHandlers = $global.titanEventHandlers;
    if(!titanEventHandlers)
        return;
    // route through to callbacks registered against window
    try
    {
        var handlerFunc = $global.titanEventHandlers[evtName];
        if (typeof handlerFunc === 'function')
            handlerFunc(evtName, evtArgs);
    }
    catch (e)
    {
        $tLogger.error(`onUserEventArgs() could not process window user event handler event '${evtName}': ${e.message}`);
    }

    /* see titanGlobalWindowAPI.js for triggerTitanWindowEvent instance - declared there to prevent crash */
    // TODO: create a $global register so windows can register against event names
    var triggerTitanWindowEvent = titanEventHandlers.triggerTitanWindowEvent;
    if(!triggerTitanWindowEvent)
        return;

    try
    {
        titanEventHandlers.triggerTitanWindowEvent(evtName, evtArgs);
    }
    catch (e)
    {
        $tLogger.error(`onUserEventArgs() could not trigger Titan window event for '${evtName}': ${e.message}`);
    }
}

/**
 * Scenario event triggered by Titan CPP
 *
 * @param evtName
 * @param evtArgs
 */
// eslint-disable-next-line no-unused-vars
function onScenarioEvent(evtName, evtArgs)
{
    var titanEventHandlers = $global.titanEventHandlers;
    if(!titanEventHandlers)
        return;

    try
    {
        var handlerFunc = titanEventHandlers[evtName];
        if (typeof handlerFunc === 'function')
            handlerFunc(evtName, evtArgs);
    }
    catch (e)
    {
        $tLogger.error(`onScenarioEvent() could not process scenario event for '${evtName}': ${e.message}`);
    }

    var triggerTitanWindowEvent = titanEventHandlers.triggerTitanWindowEvent;
    if(!triggerTitanWindowEvent)
        return;

    try
    {
        /* see titanGlobalWindowAPI.js for triggerTitanWindowEvent instance - declared there to prevent crash */
        // TODO: create a $global register so windows can register against event names
        triggerTitanWindowEvent(evtName, evtArgs);
    }
    catch (e)
    {
        $tLogger.error(`onScenarioEvent() could not trigger Titan window event for '${evtName}': ${e.message}`);
    }
}


/**
 * entity event triggered by Titan CPP
 *
 * @param entityGUID
 * @param eventName
 */
// eslint-disable-next-line no-unused-vars
function onEntityEvent(entityGUID, evtName)
{
    // TODO: this is empty in the original gui/js/titanEventListener.js implementation
    // and may not actually be needed
    $tLogger.error(`onEntityEvent() was called for event '${evtName}', entity '${entityGUID}'`);
}
