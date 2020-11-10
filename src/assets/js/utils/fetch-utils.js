export default class FetchUtils
{
    /**
     * Utility method to simplify GET requests
     *
     * @param {URL} url the URL for the GET
     * @returns {Promise} the promise for the GET fetch()
     */
    static doGET(url, headers = {})
    {
        return FetchUtils.doFetch('GET', url, null, headers);
    }

    /**
     * Utility method to simplify POST requests
     *
     * @param {URL} url the URL for the POST
     * @param {object} params the parameters for the POST
     * @returns {Promise} the promise for the POST fetch()
     */
    static doPOST(url, params = {}, headers = {})
    {
        return FetchUtils.doFetch('POST', url, params, headers);
    }

    /**
     * Utility method to simplify PUT requests
     *
     * @param {URL} url the URL for the PUT
     * @param {object} params the parameters for the PUT
     * @returns {Promise} the promise for the PUT fetch()
     */
    static doPUT(url, params = {}, headers = {})
    {
        return FetchUtils.doFetch('PUT', url, params, headers);
    }

    /**
     * Utility method to simplify DELETE requests
     *
     * @param {URL} url the URL for the DELETE
     * @param {object} params the parameters for the DELETE
     * @returns {Promise} the promise for the DELETE fetch()
     */
    static doDELETE(url, params = {}, headers = {})
    {
        return FetchUtils.doFetch('DELETE', url, params, headers);
    }

    /**
     * Utility method to simplify various fetch operations
     *
     * @param {String} method the method for the fetch ('GET', 'POST', etc...)
     * @param {URL} url the URL for the fetch
     * @param {object} params the parameters for the fetch
     * @returns {Promise} the promise for the fetch()
     */
    static doFetch(method, url, params = {}, headers = {})
    {
        let payload = {method: method, headers: headers};
        if(params !== null)
        {
            payload.body = JSON.stringify(params);
        }

        return fetch(url, payload);
    }

    /**
     * Utility method to simplify various fetch operations which require a
     * timeout
     *
     * @param {String} method the method for the fetch ('GET', 'POST', etc...)
     * @param {URL} url the URL for the fetch
     * @param {Number} timeout the timeout for the fetch in milliseconds
     * @param {Object} params the parameters for the fetch
     * @returns {Promise} the promise for the fetch()
     */
    static fetchWithTimeout(method, url, timeout = 5000, params = {}, headers = {})
    {
        let payload = {method: method, headers: headers};
        if(params !== null)
        {
            payload.body = JSON.stringify(params);
        }

        return new Promise((resolve, reject) =>
        {
            // Set timeout timer
            let timer = setTimeout(
                () => reject(new Error('Request timed out')),
                timeout
            );
            fetch(url, payload).then(
                response => resolve(response),
                err => reject(err)
            ).finally(() => clearTimeout(timer));
        });
    }

    /**
     * Utility method to simplify uploading files
     *
     * @param {URL} url the URL for the fetch
     * @param {object} files the file (or array of files) to upload
     * @param {object} headers optionally specify request headers (for authorisation etc)
     * @returns {Promise} the promise for the fetch()
     */
    static doFilePOST(url, files, headers = {}, method = 'POST')
    {
        let payload = {method: method, headers: headers};
        const data = new FormData();
        if(Array.isArray(files))
        {
            for (const f of files)
            {
                data.append('files[]', f, f.name);
            }
        }
        else
        {
            data.append('file', files, files.name);
        }
        payload.body = data;

        return fetch(url, payload);
    }
}
