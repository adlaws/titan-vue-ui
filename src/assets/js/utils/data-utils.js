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
}