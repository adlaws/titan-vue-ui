/* eslint-disable no-unused-vars */

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
// eslint-disable-next-line no-undef
var $global = typeof($global) === 'undefined' ? {} : $global;
// eslint-disable-next-line no-undef
var $otLogger = typeof($query_interface) === 'undefined' ? null : $query_interface('ot::js::logger.get');
var $tLogger = {
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
                $tLogger.error(`Could not process user event handler event '${evtName}': ${e.message}`);
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
                $tLogger.error(`Could not process global user event handler event '${evtName}': ${e.message}`);
            }
        });
    }
    catch (e)
    {
        $tLogger.error('onUserEventArgs: ' + e.message);
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
        $tLogger.error(`Could not process window user event handler event '${evtName}': ${e.message}`);
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
        $tLogger.error(`Could not trigger Titan window event for '${evtName}': ${e.message}`);
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
    $tLogger.info('>>>>>>>>>>>>>>>>>>>> Oh yeah it\'s working, it\'s time to get excited!!!!!', evtName, evtArgs);
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
        // $tLogger.error('onScenarioEvent: ' + e.message);
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
        $tLogger.error(`Could not trigger Titan window event for '${evtName}': ${e.message}`);
    }
}


/**
 * entity event triggered by Titan CPP
 *
 * @param entityGUID
 * @param eventName
 */
// eslint-disable-next-line no-unused-vars
function onEntityEvent(/*entityGUID, eventName*/)
{
    // TODO: this is empty in the original gui/js/titanEventListener.js implementation
    // and may not actually be needed
}
