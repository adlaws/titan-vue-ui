export default class UiUtils
{
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
        return new Date().getTime();
    }
}

