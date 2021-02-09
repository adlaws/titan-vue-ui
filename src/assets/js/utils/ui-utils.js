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
     *   - If the `trailing` option is true (default), the function will be triggered once
     *     when things "quiet down" at the end of the wait cycle (i.e., once the rapid
     *     succession of events ceases).
     *   - If `leading` is true, the function will be triggered once, immediately (i.e., as
     *     the rapid succession of events begins).
     *   - If `leading` and `trailing` are *both* true, the function will be triggered
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
     * @param wait the time to wait for "non-execution" before actually calling the function.
     *             If omitted or `false`, `requestAnimationFrame` is used (if available).
     * @param options a JavaScript object which specifies when the debounced function should be
     *        called in the context of the start or end of the rapid succession of events. It
     *        is of the form...
     *
     *            {leading:{boolean}, trailing:{boolean}, maxWait:{number}}
     *
     *        ...where
     *            leading if true call on the 'start' of the wait cycle, if false (default) do
     *                       *not* call on the start of the wait cycle
     *            trailing if true (default) call on the 'end' of the wait cycle, if false (default)
     *                     do *not* call on the end of the wait cycle.
     *            maxWait The maximum time `func` is allowed to be delayed before it's invoked.
     * @return {Function} the new debounced function.
     */
    static debounce(func, wait, options)
    {
        let lastArgs,
            lastThis,
            maxWait,
            result,
            timerId,
            lastCallTime;

        let lastInvokeTime = 0;
        let leading = false;
        let maxing = false;
        let trailing = true;

        // Bypass `requestAnimationFrame` by explicitly setting `wait=0`.
        const useRAF = (!wait && wait !== 0 && typeof requestAnimationFrame === 'function');

        if (typeof func !== 'function')
        {
            throw new TypeError('Expected a function');
        }
        wait = +wait || 0;
        if(UiUtils._isObject(options))
        {
            leading = !!options.leading;
            maxing = 'maxWait' in options;
            maxWait = maxing ? Math.max(+options.maxWait || 0, wait) : maxWait;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time)
        {
            const args = lastArgs;
            const thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function startTimer(pendingFunc, wait)
        {
            if (useRAF)
            {
                cancelAnimationFrame(timerId);
                return requestAnimationFrame(pendingFunc);
            }
            return setTimeout(pendingFunc, wait);
        }

        function cancelTimer(id)
        {
            if (useRAF)
            {
                return cancelAnimationFrame(id);
            }
            clearTimeout(id);
        }

        function leadingEdge(time)
        {
            // Reset any `maxWait` timer.
            lastInvokeTime = time;
            // Start the timer for the trailing edge.
            timerId = startTimer(timerExpired, wait);
            // Invoke the leading edge.
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time)
        {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;
            const timeWaiting = wait - timeSinceLastCall;

            return maxing
                ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
                : timeWaiting;
        }

        function shouldInvoke(time)
        {
            const timeSinceLastCall = time - lastCallTime;
            const timeSinceLastInvoke = time - lastInvokeTime;

            // Either this is the first call, activity has stopped and we're at the
            // trailing edge, the system time has gone backwards and we're treating
            // it as the trailing edge, or we've hit the `maxWait` limit.
            return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
                (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired()
        {
            const time = Date.now();
            if (shouldInvoke(time))
            {
                return trailingEdge(time);
            }
            // Restart the timer.
            timerId = startTimer(timerExpired, remainingWait(time));
        }

        function trailingEdge(time)
        {
            timerId = undefined;

            // Only invoke if we have `lastArgs` which means `func` has been
            // debounced at least once.
            if (trailing && lastArgs)
            {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel()
        {
            if (timerId !== undefined)
            {
                cancelTimer(timerId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush()
        {
            return timerId === undefined ? result : trailingEdge(Date.now());
        }

        function pending()
        {
            return timerId !== undefined;
        }

        function debounced(...args)
        {
            const time = Date.now();
            const isInvoking = shouldInvoke(time);

            lastArgs = args;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking)
            {
                if (timerId === undefined)
                {
                    return leadingEdge(lastCallTime);
                }
                if (maxing)
                {
                    // Handle invocations in a tight loop.
                    timerId = startTimer(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined)
            {
                timerId = startTimer(timerExpired, wait);
            }
            return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        debounced.pending = pending;
        return debounced;
    }

    /**
     * Advanced throttling function, to avoid multiple calls to the same function in rapid
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
     *            {leading:{boolean}, trailing:{boolean}}
     *
     *        ...where
     *            leading if true (default) call on the 'start' of the wait cycle, if false
     *                     do *not* call on the start of the wait cycle.
     *            trailing if true (default) call on the 'end' of the wait cycle, if false do
     *                       *not* call on the end of the wait cycle
     * @return {Function}
     */
    static throttle(func, wait, options)
    {
        let leading = true;
        let trailing = true;

        if (typeof func !== 'function')
        {
            throw new TypeError('Expected a function');
        }

        if(UiUtils._isObject(options))
        {
            leading = 'leading' in options ? !!options.leading : leading;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        return UiUtils.debounce(func, wait, {
            leading,
            trailing,
            maxWait: wait
        });
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

            const startTime = Date.now();
            let nextTimeCheck = startIndex + (timeCheckInterval || 1);

            let index = startIndex;
            while(index < count)
            {
                callbackFunc(index++);

                if((index >= nextTimeCheck) && (index < count))
                {
                    if ((Date.now() - startTime) > maxContinuousTime)
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
     *
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * isObject({})
     * // => true
     *
     * isObject([1, 2, 3])
     * // => true
     *
     * isObject(Function)
     * // => true
     *
     * isObject(null)
     * // => false
     *
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, `false` otherwise.
     */
    static _isObject(x)
    {
        const type = typeof x;
        return (x !== null && (type === 'object' || type === 'function'));
    }
}
