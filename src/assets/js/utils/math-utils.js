export default class MathUtils
{
    /**
     * Modulo function (the JavaScript % operator gives the remainder, not
     * the modulus)
     */
    static mod(n, m)
    {
        return ((n % m) + m) % m;
    }

    /**
     * Clamp a value to the given range (inclusive)
     *
     * @param {number} value the value to clamp
     * @param {number} min the minimum allowed value
     * @param {number} max the maximum value
     * @returns the clamped value
     */
    static clamp(value, min, max)
    {
        return value < min ? min : (value > max ? max : value);
    }

    /**
     * Basic 3D vector subtraction: vecA - vecB
     *
     * @param {Object} vecA the vector to be subtracted from
     * @param {Object} vecB the vector to subtract
     * @returns the result of subtracting vecB from vecA
     */
    static vecSub(vecA, vecB)
    {
        return {
            x: (vecA.x - vecB.x),
            y: (vecA.y - vecB.y),
            z: (vecA.z - vecB.z),
        };
    }

    /**
     * Basic 3D vector addition: vecA + vecB
     *
     * @param {Object} vecA the vector to be added to
     * @param {Object} vecB the vector to add
     * @returns the result of adding vecB to vecA
     */
    static vecAdd(lhs, rhs)
    {
        return {
            x: (lhs.x + rhs.x),
            y: (lhs.y + rhs.y),
            z: (lhs.z + rhs.z),
        };
    }
}