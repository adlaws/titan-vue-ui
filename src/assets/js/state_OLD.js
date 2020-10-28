import Vue from 'vue';
import Vuex from 'vuex'; // store

import TitanUtils from '@/assets/js/titan/titan-utils';

Vue.use(Vuex);

const DEFAULT_PERSISTED_STATE = {
    titan:
    {
        lastResolution:
        {
            width:-1,
            height:-1
        },
    },
    window:
    {
        size:
        {
            width:800,
            height:700,
        },
        position:
        {
            x:-1,
            y:-1,
        },
    },
};
Object.freeze(DEFAULT_PERSISTED_STATE);

const State = new Vuex.Store({
    plugins: [],
    state:
    {
        titanID: null,
        persistent:
        {
            ...DEFAULT_PERSISTED_STATE
        },
        transient:
        {
        }
    },
    getters:
    {
        titanID:             (state) => state.titanID,
        lastTitanResolution: (state) => state.persistent.titan.lastResolution,
        windowSize:          (state) => state.persistent.window.size,
        windowPosition:      (state) => state.persistent.window.position,
        persistentState:     (state) => state.persistent,
    },
    mutations:
    {
        titanID(state, titanID)
        {
            if(state.titanID === titanID)
                return;

            state.titanID = titanID;

            let persistedState = TitanUtils.loadState(titanID, DEFAULT_PERSISTED_STATE);
            State.drillSet(state, persistedState, 'persistent');
        },
        titanResolution(state, resolution)
        {
            let lastResolution = state.persistent.titan.lastResolution;
            lastResolution.width = resolution.width;
            lastResolution.height = resolution.height;
        },
        windowSize(state, size)
        {
            let windowSize = state.persistent.window.size;
            windowSize.width = size.width;
            windowSize.height = size.height;
        },
        windowPosition(state, position)
        {
            let windowPosition = state.persistent.window.position;
            windowPosition.x = position.x;
            windowPosition.y = position.y;
        }
    },
    actions:
    {
        saveState(context)
        {
            TitanUtils.saveState(context.getters.titanID, context.getters.persistentState);
        }
    }
});

/**
 * Utility method to drill into an object along a "path" of property names
 * to set a value. If the path doesn't evaluate to completion, the path
 * elements are added dynamically, using `Vue.set()` to maintain reactivity
 * in the case that a new key/value is added.
 *
 * Example usage:
 *     let foo = {};
 *     drillSet( foo, 'BANANA!',     'a', 'b', 'c') // foo is now {a:{b:{c:'BANANA!'}}}
 *     drillSet( foo, 'APPLE!',      'a', 'b' )     // foo is now {a:{b:'APPLE!'}}
 *     drillSet( foo, 'STRAWBERRY!', 'a', 'x' )     // foo is now {a:{b:'APPLE!', x:'STRAWBERRY!'}}
 *
 * Set a value on an object,
 *
 * @param {Object} obj the object to update
 * @param {Array, String} path the path to the value to set - may be an
 *        array of keys or a delimited string (see `delim` parameter)
 * @param {*} value the value to set
 * @param {String} delim the delimiter for paths specified as a string (`.` by
 *        default)
 * @return the `obj` parameter for method chaining
 */
State.drillSet = function(obj, value, path, delim='.')
{
    if(typeof(obj) !== 'object' || !path)
    {
        // no object or path - nothing to do
        return;
    }

    if(typeof(path) === 'string')
    {
        // the path is specified as a string - turn it into an array
        // by splitting on the delimiter
        path = path.split(delim);
    }

    if(!Array.isArray(path) || path.length === 0)
    {
        // the path is not an array, or the array
        // is of length 0 - nothing to do
        return;
    }

    // drill down the path to the target
    let current = obj;
    for(let idx=0; idx<path.length-1; idx++)
    {
        let next = current[path[idx]];
        if(typeof(next) !== 'object')
        {
            // missing item on the path - add an empty object
            // using `Vue.set` to maintain reactivity
            next = {};
            Vue.set(current, path[idx], next);
        }
        current = next;
    }

    Vue.set(current, path[path.length-1], value);

    return obj;
};

export default State;
