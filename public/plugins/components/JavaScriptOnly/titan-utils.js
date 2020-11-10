/*
 *   Copyright 2019 Calytrix Technologies
 *
 *   This file is part of Titan.CX
 *
 *   NOTICE:  All information contained herein is, and remains
 *            the property of Calytrix Technologies Pty Ltd.
 *            The intellectual and technical concepts contained
 *            herein are proprietary to Calytrix Technologies Pty Ltd.
 *            Dissemination of this information or reproduction of
 *            this material is strictly forbidden unless prior written
 *            permission is obtained from Calytrix Technologies Pty Ltd.
 *
 *   Unless required by applicable law or agreed to in writing,
 *   software distributed under the License is distributed on an
 *   'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 *   KIND, either express or implied.  See the License for the
 *   specific language governing permissions and limitations
 *   under the License.
 */

//-------------------------------------------------------------------------------
//                       Utilities for Working with Titan
//-------------------------------------------------------------------------------
// get global context from any scope we are in now
// eslint-disable-next-line

export const _GLOBAL = Function('return this')();
export const window = _GLOBAL.window;
export const $got = _GLOBAL.$got || {}; // NOTE: not currently used

// Determine if we are running in Titan
export const $isInsideTitan = window.$eview !== undefined;
// Determine if we are running in Outerra
export const $isInsideOuterra = /Outerra\/c4e/g.test(window.navigator.userAgent); // true if inside OUTERRA

export const $query_interface = window.$query_interface ? window.$query_interface : () => {return null;};
// Outerra Interfaces
export const $otLogger = $query_interface('ot::js::logger.get');

/**
 * Simplified logging - will log in both browser and Outerra environments
 *
 * Automatically stringifies and concatenates arguments as required
 *
 * Example use:
 *     $tLogger.info('Log something');
 *     $tLogger.info('Multiple args', 1, 'a', [1,2,3], {a:1, b:'two'});
 */
export const $tLogger = {
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

export const simpleUUID = () =>
{
    return ('s' +
           Date.now().toString(36) +
           new Array(3).fill(null).map(()=>Math.random() * Number.MAX_SAFE_INTEGER).map((x)=>x.toString(36)).join('')).replace(/\./g, '');
};

export const addComponent = function(options)
{
    const defaultOptions = {html:'', css:undefined, id:simpleUUID()};
    const finalOptions = {...defaultOptions, ...options};

    if(finalOptions.css)
    {
        // create and add CSS style rules
        const styleElement = document.createElement('style');
        styleElement.textContent = finalOptions.css;
        document.body.appendChild(styleElement);
    }

    // create and add component
    const componentElement = document.createElement('div');
    componentElement.id = finalOptions.id;
    componentElement.innerHTML = finalOptions.html;
    const theBody = document.querySelector('body');
    theBody.appendChild(componentElement);

    return componentElement;
};

