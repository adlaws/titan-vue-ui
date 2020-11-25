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
const $query_interface = window.$query_interface ? window.$query_interface : () => {return null;};
const $otLogger = $query_interface('ot::js::logger.get');
const $tLogger = {
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

if(!window.titanEventHandlers)
{
    window.titanEventHandlers = {};

    const TitanEvent = window.TitanEvent =
    {
        _L: {}, // subscribers to single titan event
        _G: [], // subscribers to any titan event, could be perf problem if misused
        addListener: function(name, handler)
        {
            const subs = TitanEvent._L[name] = (TitanEvent._L[name] || []);
            // add at front - most recent is at index 0
            subs.unshift(handler);
        },
        removeListener: function(name, handler)
        {
            const subs = TitanEvent._L[name];
            if (!subs) return false;

            const index = subs.indexOf(handler);
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
            const index = TitanEvent._G.indexOf(handler);
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
export function onUserEventArgs(evtName, evtArgs)
{
    const titanEvent = window.TitanEvent;
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

        // route through to callbacks registered against window
        try
        {
            const handlerFunc = window.titanEventHandlers[evtName];
            if (typeof handlerFunc === 'function')
                handlerFunc(evtName, evtArgs);
        }
        catch (e)
        {
            $tLogger.error(`Could not process window user event handler event '${evtName}': ${e.message}`);
        }

        /* see titanGlobalWindowAPI.js for triggerTitanWindowEvent instance - declared there to prevent crash */
        // TODO: create a $global register so windows can register against event names
        if(window.titanEventHandlers.triggerTitanWindowEvent)
        {
            window.titanEventHandlers.triggerTitanWindowEvent(evtName, evtArgs);
        }
    }
    catch (e)
    {
        $tLogger.error('onUserEventArgs: ' + e.message);
    }
}

/**
 * Scenario event trigered by Titan CPP
 *
 * @param evtName
 * @param evtArgs
 */
export function onScenarioEvent(evtName, evtArgs)
{
    try
    {
        const titanEventHandlers = window.titanEventHandlers;
        const handlerFunc = titanEventHandlers[evtName];
        if (typeof handlerFunc === 'function')
        {
            handlerFunc(evtName, evtArgs);
        }

        // see titanGlobalWindowAPI.js for triggerTitanWindowEvent
        // instance - declared there to prevent crash
        if (titanEventHandlers.triggerTitanWindowEvent)
            titanEventHandlers.triggerTitanWindowEvent(evtName, evtArgs);
    }
    catch (e)
    {
        $tLogger.error('onScenarioEvent: ' + e.message);
    }
}

/**
 * entity event triggered by Titan CPP
 *
 * @param entityGUID
 * @param eventName
 */
export function onEntityEvent(/*entityGUID, eventName*/)
{
    // TODO: this is empty in the original gui/js/titanEventListener.js implementation
    // and may not actually be needed
}
// --------------------------------------------------------------------------------------------------------------------