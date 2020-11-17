export default class UiUtils
{
    /**
     * Advanced debouncing function, to avoid multiple calls to the same function in rapid
     * succession, such as may occur when handling events related to dragging, zooming and so
     * on.
     *
     * See also `throttle()`
     *
     * By default, it creates a function which will only be invoked until it has *not* been
     * invoked for a certain timeout - more concretely, the function will be called after it
     * *stops* being called for 'wait' milliseconds.
     *
     * NOTE:
     *   - If the `onTrailOut` option is true (default), the function will be triggered once
     *     when things "quiet down" at the end of the wait cycle (i.e., once the rapid
     *     succession of events ceases).
     *   - If `onLeadIn` is true, the function will be triggered once, immediately (i.e., as
     *     the rapid succession of events begins).
     *   - If `onLeadIn` and `onTrailOut` are *both* true, the function will be triggered
     *     once immediately, and then once again when things quiet down.
     *
     * Example usage:
     *
     *      var debouncedFunction = debounce(function() {
     *          // something time consuming
     *       }, 250);
     *      window.addEventListener('resize', debouncedFunction);
     *
     * @param func the function to be 'debounced'
     * @param wait the time to wait for "non-execution" before actually calling the function
     * @param options a JavaScript object which specifies when the debounced function should be
     *        called in the context of the start or end of the rapid succession of events. It
     *        is of the form...
     *
     *            {onLeadIn:{boolean}, onTrailOut:{boolean}}
     *
     *        ...where
     *            onTrailOut if true (default) call on the 'end' of the wait cycle, if false do
     *                       *not* call on the end of the wait cycle
     *            onLeadIn if true call on the 'start' of the wait cycle, if false (default)
     *                     do *not* call on the start of the wait cycle.
     * @return {Function}
     */
    static debounce(func, wait, options = {onLeadIn: false, onTrailOut: true})
    {
        let timeout = null;
        return function()
        {
            let context = this;
            let args = arguments;
            let later = function()
            {
                timeout = null;
                if (options.onTrailOut === true) func.apply(context, args);
            };
            let callNow = (options.onLeadIn === true) && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
            {
                func.apply(context, args);
            }
        };
    }

    // Returns a function, that, when invoked, will only be triggered at most once
    // during a given window of time. Normally, the throttled function will run
    // as much as it can, without ever going more than once per `wait` duration;
    // but if you'd like to disable the execution on the leading edge, pass
    // `{leading: false}`. To disable execution on the trailing edge, ditto.
    /**
     * Advanced debouncing function, to avoid multiple calls to the same function in rapid
     * succession, such as may occur when handling events related to dragging, zooming and so
     * on.
     *
     * See also `debounce()`
     *
     * By default, it creates a function which will only be triggered at most once
     * during a given window of time. More concretely the throttled function will run
     * as much as it can, without ever going more than once per `wait` duration
     *
     * NOTE:
     *   - If the `onTrailOut` option is true (default), the function will be triggered once
     *     at the end of the wait cycle.
     *   - If `onLeadIn` is true, the function will be triggered once, immediately (i.e., as
     *     the rapid succession of events begins).
     *   - If `onLeadIn` and `onTrailOut` are *both* true, the function will be triggered
     *     once immediately, and then once again when things quiet down.
     *
     * Example usage:
     *
     *      var throttledFunction = throttle(function() {
     *          // something time consuming
     *      }, 250);
     *      window.addEventListener('resize', throttledFunction);
     *
     * @param func the function to be 'throttledFunction'
     * @param wait the time to wait before actually calling the function again
     * @param options a JavaScript object which specifies when the throttled function should be
     *        called in the context of the start or end of the rapid succession of events. It
     *        is of the form...
     *
     *            {onLeadIn:{boolean}, onTrailOut:{boolean}}
     *
     *        ...where
     *            onTrailOut if true (default) call on the 'end' of the wait cycle, if false do
     *                       *not* call on the end of the wait cycle
     *            onLeadIn if true call on the 'start' of the wait cycle, if false (default)
     *                     do *not* call on the start of the wait cycle.
     * @return {Function}
     */
    static throttle(func, wait, options = {onLeadIn: true, onTrailOut: true})
    {
        var context, args, result;
        var timeout = null;
        var previous = 0;

        if (!options)
            options = {};

        const later = function()
        {
            previous = options.onLeadIn === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);

            if (!timeout)
                context = args = null;
        };

        return function()
        {
            const now = Date.now();
            if (!previous && options.onLeadIn === false)
                previous = now;

            const remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait)
            {
                if (timeout)
                {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout)
                    context = args = null;
            }
            else if (!timeout && options.onTrailOut !== false)
            {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }

    /**
     * Batch processing for large numbers of items - prevents things locking
     * up because of continuous processing of a large number of items
     *
     * Example usage:
     *
     * // Trivial example
     * // this would lock up a browser until it was finished
     * for(let idx=0; idx<1000000; idx++){ console.log(idx); }
     * // this does the same thing, but will not lock up the browser
     * batch(0, 1000000, (idx) => { console.log(idx); };
     *
     * // More useful example
     * const someLargeArrayOfThings = [1,2,3,4,5.....999999999999, 1000000000000, 1000000000001];
     * batch(
     *     0,
     *     someLargeArrayOfThings.length,
     *     function (i) {
     *         let value = someLargeArrayOfThings[i];
     *         console.log(value);
     *     }
     * );
     * @param startIndex {number} the start index of the batch (usually 0)
     * @param count {number} the number of items to process (usually the length of an array)
     * @param callbackFunc {function} the callback function which will process each item in the
     *        batch. The function will be passed the current item index as a parameter
     * @param maxContinuousTime {function} the maximum amount of time, in milliseconds, that items
     *        may be processed for before the batch is split (1ms by default)
     * @param batchCallback {function} a function which is called each time a batch is processed.
     *        The function will be passed the start index and final index of the batch which was
     *        just processed (i.e., the range of items processed in the batch). Useful for
     *        UI feedback in the form of progress bars etc.
     * @param timeCheckInterval {number} how often, in milliseconds, to check for going over the
     *        maxContinuousTime for processing (1ms by default)
     * @param delay {number} the delay, in milliseconds, between batches
     * @return an object with functions for monitoring and controlling the batch process:
     *         isRunning() returns true if the batch is currently processing, false otherwise
     *         cancel() stop the processing of the batch wherever it is.
     *         complete() resume the batch after cancellation (if cancelled)
     */
    static batchProcess(startIndex, count, callbackFunc, maxContinuousTime=1, batchCallbackFunc=null, timeCheckInterval=1, delay=0)
    {
        let timer;
        const split = function()
        {
            timer = undefined;

            const startTime = UiUtils._now();
            let nextTimeCheck = startIndex + (timeCheckInterval || 1);

            let index = startIndex;
            while(index < count)
            {
                callbackFunc(index++);

                if((index >= nextTimeCheck) && (index < count))
                {
                    if ((UiUtils._now() - startTime) > maxContinuousTime)
                    {
                        if (!timeCheckInterval)
                        {
                            timeCheckInterval = nextTimeCheck;
                        }

                        timer = setTimeout(split, delay || 0);
                        break;
                    }

                    nextTimeCheck += (timeCheckInterval || 1);
                }
            }

            if(batchCallbackFunc)
            {
                batchCallbackFunc(startIndex, index);
            }

            startIndex = index;
        };

        split();

        return {
            isRunning: function()
            {
                return (timer !== undefined);
            },

            complete: function()
            {
                if(this.cancel())
                {
                    timeCheckInterval = count;
                    split();
                }
            },

            cancel: function()
            {
                if (timer === undefined)
                {
                    return false;
                }

                clearTimeout(timer);
                timer = undefined;
                return true;
            }
        };
    }

    /**
     * Obtain current timestamp in milliseconds
     */
    static _now()
    {
        return Date.now();
    }
}

