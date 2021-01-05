export default class DataUtils
{
    /**
     * Remaps the values associated with keys in the source to new keys in the
     * output object.
     *
     * For example:
     *     const foo = {r:1, g:2, b:3, a:4};
     *     // remap r to x, g to y, b to z and a to w
     *     const bar = remap(foo, {r:'x', g:'y', b:'z', a:'w'})
     *     // bar is now {x: 1, y: 2, z: 3, w: 4}
     */
    static remap(source, mapping)
    {
        const result = {};
        Object.keys(mapping)
            .forEach((key)=>
            {
                result[mapping[key]] = source[key];
            });
        return result;
    }

    /**
     * Create an array of pairs from an object. For example:
     *
     * var x = ;
     *
     * var x = {
     *     a: 123,
     *     b: 456,
     *     c: 789,
     * };
     *
     * dictToPairs(x);
     *
     * ...will produce...
     *   [
     *     ['a', 123],
     *     ['b', 456],
     *     ['c', 789],
     *   ]
     *
     * NOTE: ordering of pairs is not guaranteed to be consistent
     *
     * @param {} pairs the array of pairs
     */
    static dictToPairs(obj)
    {
        return Object.getOwnPropertyNames(obj).map(key => [key, obj[key]]);
    }

    /**
     * Create a lookup object from an array of pairs. For example:
     *
     * var x = [
     *   ['a', 123],
     *   {'b', 456],
     *   {'c', 789],
     * ];
     *
     * pairsToDict(x);
     *
     * ...will produce...
     *   {
     *     a: 123,
     *     b: 456,
     *     c: 789,
     *   }
     *
     * @param {Array} pairs the array of pairs
     */
    static pairsToDict(pairs)
    {
        return pairs.reduce( (obj,[key,val]) => (obj[key]=val,obj), {} );
    }

    /**
     * Create an array of entries from an object. For example:
     *
     * var x = ;
     *
     * var x = {
     *     a: 123,
     *     b: 456,
     *     c: 789,
     * };
     *
     * dictToList(x);
     *
     * ...will produce...
     *   [
     *     {id:'a', value:123},
     *     {id:'b', value:456},
     *     {id:'c', value:789},
     *   ]
     *
     * dictToList(x, 'key', 'count');
     *
     * ...will produce...
     *   [
     *     {key:'a', count:123},
     *     {key:'b', count:456},
     *     {key:'c', count:789},
     *   ]
     *
     * NOTE: ordering of pairs is not guaranteed to be consistent
     *
     * @param {Object} obj the object to be converted
     * @param {String} idKey the key to use for keys (optional)
     * @param {String} valueKey the key to use for values (optional)
     * @return {Array} the array of pairs
     */
    static dictToList(obj, idKey = 'id', valueKey = 'value')
    {
        return Object.getOwnPropertyNames(obj).map(id =>
        {
            const entry = {};
            entry[idKey] = id;
            entry[valueKey] = obj[id];
            return entry;
        });
    }

    /**
     * Create a reverse lookup object from an object. For example:
     *
     * var x = {
     *     a: 123,
     *     b: 456,
     *     c: 789,
     * };
     *
     * pairsToDict(x);
     *
     * ...will produce...
     *   {
     *     123: 'a',
     *     456: 'b',
     *     789: 'c',
     *   }
     *
     * NOTE: this only works well for objects with simple/single values assiociated with each key
     *
     * @param {Object} pairs the array of pairs
     */
    static rvsDict(obj)
    {
        let pairs = DataUtils.dictToPairs(obj);
        return pairs.reduce( (obj,[key,val]) => (obj[val]=key,obj), {} );
    }

    /**
     * Create a lookup dictionary from an array of objects using the value of a field as
     * the lookup key. For example:
     *
     * var x = [
     *   {id:'a', foo:123, bar:'cat'},
     *   {id:'b', foo:456, bar:'sat'},
     *   {id:'c', foo:789, bar:'mat'},
     * ];
     *
     * objArrayToLookup(x, 'id');
     *
     * ...will produce...
     *   {
     *     a: {id:'a', foo:123, bar:'cat'},
     *     b: {id:'b', foo:456, bar:'sat'},
     *     c: {id:'c', foo:789, bar:'mat'},
     *   }
     *
     *
     * @param {} objArray the array of objects
     * @param {*} key the key in the objects to base the lookup key on
     * @return {Object} the resulting lookup object
     */
    static objArrayToLookup(objArray, key)
    {
        return DataUtils.pairsToDict(objArray.map((x) => [x[key], x]));
    }
}