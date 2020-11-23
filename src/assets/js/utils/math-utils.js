/**
 * Useful math stuff
 */
export class Vec2
{
    constructor(x,y)
    {
        this.x = x?x:0.0;
        this.y = y?y:0.0;
    }
    static fromObj( obj )
    {
        return new Vec2(
            obj.x || 0.0,
            obj.y || 0.0
        );
    }
    static toString()
    {
        return `{x:${this.x},y:${this.y}}`;
    }
}

export class Vec3
{
    constructor(x,y,z)
    {
        this.x = x?x:0.0;
        this.y = y?y:0.0;
        this.z = z?z:0.0;
    }
    static fromObj( obj )
    {
        return new Vec3(
            obj.x || 0.0,
            obj.y || 0.0,
            obj.z || 0.0
        );
    }
    static toString()
    {
        return `{x:${this.x},y:${this.y},z:${this.z}}`;
    }
}

export class Quat
{
    constructor(w,x,y,z)
    {
        this.w = w?w:0.0;
        this.x = x?x:0.0;
        this.y = y?y:0.0;
        this.z = z?z:0.0;
    }
    static fromObj( obj )
    {
        return new Quat(
            obj.w || 0.0,
            obj.x || 0.0,
            obj.y || 0.0,
            obj.z || 0.0
        );
    }
    static toString()
    {
        return `{w:${this.w},x:${this.x},y:${this.y},z:${this.z}}`;
    }
}

export class Mat3x3
{
    constructor(a,b,c)
    {
        this.a = a?a:new Vec3();
        this.b = b?b:new Vec3();
        this.c = c?c:new Vec3();
    }
    static toQuat()
    {
        // based heavily on https://github.com/g-truc/glm/blob/master/glm/gtc/quaternion.inl
        let m00 = this.a.x, m10 = this.b.x, m20 = this.c.x,
            m01 = this.a.y, m11 = this.b.y, m21 = this.c.y,
            m02 = this.a.z, m12 = this.b.z, m22 = this.c.z;

        let fourXSquaredMinus1 = m00 - m11 - m22;
        let fourYSquaredMinus1 = m11 - m00 - m22;
        let fourZSquaredMinus1 = m22 - m00 - m11;
        let fourWSquaredMinus1 = m00 + m11 + m22;

        let biggestIndex = 0;
        let fourBiggestSquaredMinus1 = fourWSquaredMinus1;
        if (fourXSquaredMinus1 > fourBiggestSquaredMinus1)
        {
            fourBiggestSquaredMinus1 = fourXSquaredMinus1;
            biggestIndex = 1;
        }
        if (fourYSquaredMinus1 > fourBiggestSquaredMinus1)
        {
            fourBiggestSquaredMinus1 = fourYSquaredMinus1;
            biggestIndex = 2;
        }
        if (fourZSquaredMinus1 > fourBiggestSquaredMinus1)
        {
            fourBiggestSquaredMinus1 = fourZSquaredMinus1;
            biggestIndex = 3;
        }

        let biggestVal = Math.sqrt(fourBiggestSquaredMinus1 + 1) * 0.5;
        let mult = 0.25 / biggestVal;

        let result = new Quat(0,0,0,0);
        switch (biggestIndex)
        {
        case 0:
            result.w = biggestVal;
            result.x = (m12 - m21) * mult;
            result.y = (m20 - m02) * mult;
            result.z = (m01 - m10) * mult;
            break;
        case 1:
            result.w = (m12 - m21) * mult;
            result.x = biggestVal;
            result.y = (m01 + m10) * mult;
            result.z = (m20 + m02) * mult;
            break;
        case 2:
            result.w = (m20 - m02) * mult;
            result.x = (m01 + m10) * mult;
            result.y = biggestVal;
            result.z = (m12 + m21) * mult;
            break;
        case 3:
            result.w = (m01 - m10) * mult;
            result.x = (m20 + m02) * mult;
            result.y = (m12 + m21) * mult;
            result.z = biggestVal;
            break;
        default: // Should never actually get here
            break;
        }
        return result;
    }
}

class MathUtils
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
     * Clamp a value to the given range, wrapping if it goes outside the range
     *
     * Useful to constrain "circular" values (such as clock hours, compass
     * headings, and so on) to a given range of values
     *
     * @param {number} value the value to clamp
     * @param {number} min the minimum allowed value (inclusive)
     * @param {number} max the maximum value (exclusive)
     * @returns the clamped value
     */
    static wrapClamp(value, min, max)
    {
        if(value >= min && value < max)
            return value;

        let delta = max - min;
        while(value < min)
        {
            value += delta;
        }
        while(value >= max)
        {
            value -= delta;
        }
        return value;
    }

    /**
     * Find the shortest angular offset required to go from a start heading
     * to a target heading.
     *
     * This is useful so that when a compass heading goes from, say 359° to 1°,
     * it spins clockwise through 360°, rather than counter-clockwise through
     * 180°
     *
     * @param {number} start the start angle (in degrees)
     * @param {number} end the end angle (in degrees)
     * @return the shortest angular offset to reach `end` from `start`
     */
    static shortestAngleDeg(start, end)
    {
        return ((((end - start) % 360) + 540) % 360) - 180;
    }

    static negate(item)
    {
        if(item instanceof Vec2)
            return new Vec2(-item.x, -item.y);
        else if(item instanceof Vec3)
            return new Vec3(-item.x, -item.y, -item.z);
        else if(item instanceof Quat)
            return new Quat(-item.w, -item.x, -item.y, -item.z);
        else if(item instanceof Mat3x3)
            return new Mat3x3(MathUtils.negate(item.a), MathUtils.negate(item.b), MathUtils.negate(item.c));
        return null;
    }

    static add(vec1, vec2)
    {
        if(vec1 instanceof Vec2 && vec2 instanceof Vec2)
            return new Vec2(vec1.x + vec2.x, vec1.y + vec2.y);
        else if(vec1 instanceof Vec3 && vec2 instanceof Vec3)
            return new Vec3(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z);
        return null;
    }

    static subtract(vec1, vec2)
    {
        if(vec1 instanceof Vec2 && vec2 instanceof Vec2)
            return new Vec2(vec1.x - vec2.x, vec1.y - vec2.y);
        else if(vec1 instanceof Vec3 && vec2 instanceof Vec3)
            return new Vec3(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z);
        return null;
    }

    static multiply(a, b)
    {
        if(a instanceof Vec2 && b instanceof Vec2)
            return new Vec2(a.x * b, a.y * b);
        else if(a instanceof Vec3 && b instanceof Vec3)
            return new Vec3(a.x * b, a.y * b, a.z * b);
        else if(a instanceof Quat && b instanceof Quat)
        {
            return new Quat(
                b.w * a.w - b.x * a.x - b.y * a.y - b.z * a.z,
                b.w * a.x + b.x * a.w + b.y * a.z - b.z * a.y,
                b.w * a.y + b.y * a.w + b.z * a.x - b.x * a.z,
                b.w * a.z + b.z * a.w + b.x * a.y - b.y * a.x
            );
        }
        else if(a instanceof Vec3 && b instanceof Quat)
        {
            // transform vector by quaternion
            let x = a.x;
            let y = a.y;
            let z = a.z;

            let qx = b.x;
            let qy = b.y;
            let qz = b.z;
            let qw = b.w;

            let ix =  qw * x + qy * z - qz * y;
            let iy =  qw * y + qz * x - qx * z;
            let iz =  qw * z + qx * y - qy * x;
            let iw = -qx * x - qy * y - qz * z;

            return new Vec3(
                ix * qw + iw * -qx + iy * -qz - iz * -qy, // x
                iy * qw + iw * -qy + iz * -qx - ix * -qz, // y
                iz * qw + iw * -qz + ix * -qy - iy * -qx, // z
            );
        }
        return null;
    }

    static dot(vec1, vec2)
    {
        if(vec1 instanceof Vec2 && vec2 instanceof Vec2)
            return (vec1.x * vec2.x) + (vec1.y * vec2.y);
        else if(vec1 instanceof Vec3 && vec2 instanceof Vec3)
            return (vec1.x * vec2.x) + (vec1.y * vec2.y) + (vec1.z * vec2.z);
    }

    static cross(vec1, vec2)
    {
        if(vec1 instanceof Vec3 && vec2 instanceof Vec3)
        {
            return new Vec3(
                vec1.y * vec2.z - vec2.y * vec1.z,
                vec1.z * vec2.x - vec2.z * vec1.x,
                vec1.x * vec2.y - vec2.x * vec1.y
            );
        }
        return null;
    }

    static normalize(vec)
    {
        let vecLength = MathUtils.length(vec);
        if(vec instanceof Vec2)
            return new Vec2(vec.x / vecLength, vec.y / vecLength);
        else if(vec instanceof Vec3)
            return new Vec3(vec.x / vecLength, vec.y / vecLength, vec.z / vecLength);
        return null;
    }

    static length(vec, origin)
    {
        return Math.sqrt(MathUtils.sqrdLength(vec, origin));
    }

    static sqrdLength(vec, origin)
    {
        if(vec instanceof Vec2)
        {
            origin = (origin instanceof Vec2)?origin:new Vec2(0,0);
            let dx = vec.x - origin.x;
            let dy = vec.y - origin.y;
            return (dx*dx) + (dy*dy);
        }
        else if(vec instanceof Vec3)
        {
            origin = (origin instanceof Vec3)?origin:new Vec3(0,0,0);
            let dx = vec.x - origin.x;
            let dy = vec.y - origin.y;
            let dz = vec.z - origin.z;
            return (dx*dx) + (dy*dy) + (dz*dz);
        }
        return null;
    }

    static perpendicular(vec)
    {
        // perpendicular vector can be either (x, y) ==> (-y, x) or (y, -x)
        if(vec instanceof Vec2)
            return new Vec2(vec.y, vec.x * -1);
        return null;
    }

    static average(vec)
    {
        if(!Array.isArray(vec))
            return vec;
        if(vec.length == 0)
            return vec;
        let first = vec[0];
        if(first instanceof Vec2)
        {
            let sumX = first.x;
            let sumY = first.y;
            for(let i=1; i<vec.length; i++)
            {
                sumX += vec[i].x;
                sumY += vec[i].y;
            }
            return new Vec2(sumX/vec.length, sumY/vec.length);
        }
        return null;
    }

    /*
    * Finds the intersection of the lines formed by vector1 passing through
    * point1 and vector2 passing through point2
    * @param point1 a point through which the first vector passes
    * @param vec1 the vector passing through point1
    * @param point2 a point through which the second vector passes
    * @param vec2 the vector passing through point2
    * @return point at which the two vectors intersect
    */
    static findLineIntersection(point1, vec1, point2, vec2)
    {
        let dd = (vec1.x*vec2.y) - (vec1.y*vec2.x);
        if( dd==0 )
        {
            // lines are parallel - no intersection!
            return null;
        }

        let dx = point2.x-point1.x;
        let dy = point2.y-point1.y;
        let t = (dx*vec2.y-dy*vec2.x)/dd;

        let ix = point1.x+(t*vec1.x);
        let iy = point1.y+(t*vec1.y);

        return new Vec2(ix, iy);
    }

    static angle(vec1, vec2)
    {
        let du = MathUtils.length(vec1);
        let dv = MathUtils.length(vec2);
        if (Math.abs(du)<MathUtils.EPSILON || Math.abs(dv)<MathUtils.EPSILON) return 0.0;

        let dp = MathUtils.dot(vec1, vec2) / (du * dv);
        if (dp >= 1.0) return 0.0;
        if (dp <= -1.0) return MathUtils.T_PI;

        return Math.acos(dp);
    }

    static diamond( vec )
    {
        if ( Math.abs(vec.x)<MathUtils.EPSILON && Math.abs(vec.y)<MathUtils.EPSILON )
            return 0.0;

        if( vec.x >= 0 )
            if( vec.y >= 0 )
                return (vec.x/(vec.x+vec.y));// 0-1 range
            else
                return 2-(vec.x/(vec.x-vec.y));// 1-2 range
        else
        {
            if( vec.y <= 0 )
                return 2+(vec.x/(vec.x+vec.y));// 2-3 range
            else
                return 3+(-vec.x/(-vec.x+vec.y));// 3-4/0 range
        }
    }
}

MathUtils.T_PI = 3.14159265358979323846;
MathUtils.EPSILON = 0.0000001;

export default MathUtils;
