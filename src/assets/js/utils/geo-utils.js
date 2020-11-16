import MathUtils, { Vec3, Mat3x3 } from './math-utils.js';

export class LatLonRad
{
    constructor(lat, lon)
    {
        this.lat = lat;
        this.lon = lon;
        this.lng = lon;
    }

    static fromDeg()
    {
        let lat = 0;
        let lon = 0;

        if(arguments.length === 1)
        {
            let obj = arguments[0];
            if(typeof(obj)==='object')
            {
                lat = obj.lat || lat;
                lon = obj.lon || obj.lng || lon;
            }
        }
        else if(arguments.length >= 2)
        {
            lat = arguments[0];
            lon = arguments[1];
        }

        return new LatLonRad(GeoUtils.degToRad(lat), GeoUtils.degToRad(lon));
    }

    asDeg()
    {
        return new LatLonDeg(GeoUtils.radToDeg(this.lat), GeoUtils.radToDeg(this.lon));
    }

    toString()
    {
        return `latitude: ${this.lat} longitude: ${this.lon}`;
    }
}

export class LatLonDeg
{
    constructor(lat, lon)
    {
        this.lat = lat;
        this.lon = lon;
        this.lng = lon;
    }

    static fromRad()
    {
        let lat = 0;
        let lon = 0;

        if(arguments.length === 1)
        {
            let obj = arguments[0];
            if(typeof(obj)==='object')
            {
                lat = obj.lat || lat;
                lon = obj.lon || obj.lng || lon;
            }
        }
        else if(arguments.length >= 2)
        {
            lat = arguments[0];
            lon = arguments[1];
        }

        return new LatLonDeg(GeoUtils.radToDeg(lat), GeoUtils.radToDeg(lon));
    }

    asRad()
    {
        return new LatLonRad(GeoUtils.degToRad(this.lat), GeoUtils.degToRad(this.lon));
    }

    toString()
    {
        return `latitude: ${this.lat} longitude: ${this.lon}`;
    }
}

/**
 * Useful operations when dealing with latitude and longitude
 *
 * Most methods are strong influenced by the formulae and implementations found her:
 * https://www.movable-type.co.uk/scripts/latlong.html
 */
export default class GeoUtils
{
    /**
     * Conversion from degrees to radians.
     *
     * @private
     * @param {number} deg the angle in degrees.
     * @return {number} the angle in radians.
     */
    static degToRad(deg)
    {
        return deg * GeoUtils.DEG2RAD;
    }
    /**
     * Conversion from radians to degrees.
     *
     * @private
     * @param {number} rad the angle in radians.
     * @return {number} the angle in degrees.
     */
    static radToDeg(rad)
    {
        return rad / GeoUtils.DEG2RAD;
    }
    /**
    * This utility method provides a {'deg':DEG, 'min':MIN, 'sec':SEC} object corresponding
    * to the given angle
    *
    * @param {number} angle the angle in degrees
    * @returns {'deg':DEG, 'min':MIN, 'sec':SEC} corresponding to the given angle
    */
    static angleToDMS(angle)
    {
        let sign = angle < 0 ? -1 : 1;

        let degs = Math.floor(Math.abs(angle));
        let mins = (Math.abs(angle) - degs) * 60.0;
        let secs = (mins - Math.floor(mins)) * 60.0;
        mins = Math.floor(mins);

        return {'deg': degs * sign, 'min': mins, 'sec': secs};
    }
    /**
     * This uses the ‘haversine’ formula to calculate the great-circle distance between two points;
     * that is, the shortest distance over the earth’s surface – giving an ‘as-the-crow-flies’
     * distance between the points.
     *
     * @param {LatLonRad} latlon1 the latitude/longitude of the first point in radians
     * @param {LatLonRad} latlon2 the latitude/longitude of the second point in radians
     * @returns {number} the distance in meters
     */
    static distance(latlon1, latlon2)
    {
        let lat1 = latlon1.lat;
        let lat2 = latlon2.lat;
        let lon1 = latlon1.lon;
        let lon2 = latlon2.lon;

        let dLat = lat2 - lat1;
        let dLon = lon2 - lon1;

        let sinDlat2 = Math.sin(dLat / 2);
        let sinDlon2 = Math.sin(dLon / 2);

        let a = sinDlat2 * sinDlat2 +
                Math.cos(lat1) * Math.cos(lat2) *
                sinDlon2 * sinDlon2;
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return GeoUtils.EARTH_MEAN_RADIUS * c;
    }
    /**
     * This formula is for the initial bearing (sometimes referred to as forward azimuth) which if
     * followed in a straight line along a great-circle arc will take you from the start point to
     * the end point:
     *
     * @param {LatLonRad} latlon1 the latitude/longitude of the first point in radians
     * @param {LatLonRad} latlon2 the latitude/longitude of the second point in radians
     * @returns {number} the bearing in radians
     */
    static bearing(latlon1, latlon2)
    {
        let lat1 = latlon1.lat;
        let lat2 = latlon2.lat;
        let lon1 = latlon1.lon;
        let lon2 = latlon2.lon;

        let y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        let x = Math.cos(lat1) * Math.sin(lat2) -
                Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        return Math.atan2(y, x);
    }
    /**
     * This is the half-way point along a great circle path between the two points
     *
     * @param {LatLonRad} latlon1 the latitude/longitude of the first point in radians
     * @param {LatLonRad} latlon2 the latitude/longitude of the second point in radians
     * @returns {object} the midpoint latitude and longitude in radians
     */
    static midpoint(latlon1, latlon2)
    {
        let lat1 = latlon1.lat;
        let lat2 = latlon2.lat;
        let lon1 = latlon1.lon;
        let lon2 = latlon2.lon;

        let Bx = Math.cos(lat2) * Math.cos(lon2 - lon1);
        let By = Math.cos(lat2) * Math.sin(lon2 - lon1);
        let lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2),
            Math.sqrt((Math.cos(lat1) + Bx) * (Math.cos(lat1) + Bx) + By * By));
        let lon3 = lon1 + Math.atan2(By, Math.cos(lat1) + Bx);
        return new LatLonRad(lat3, lon3);
    }
    /**
     * Given a start point, initial bearing, and distance, this will calculate the destina­tion
     * point and final bearing travelling along a (shortest distance) great circle arc.
     *
     * @param {LatLonRad} latlon the latitude/longitude of the starting point in radians
     * @param {number} bearing the bearing in radians
     * @param {number} the distance in meters
     * @returns {LatLonRad} the destination latitude and longitude in radians
     */
    static destination(latlon, bearing, distance)
    {
        let lat = latlon.lat;
        let lon = latlon.lon;

        let R = GeoUtils.EARTH_MEAN_RADIUS;
        let lat2 = Math.asin(Math.sin(lat) * Math.cos(distance / R) +
                           Math.cos(lat) * Math.sin(distance / R) * Math.cos(bearing));
        let lon2 = lon + Math.atan2(Math.sin(bearing) * Math.sin(distance / R) * Math.cos(lat),
            Math.cos(distance / R) - Math.sin(lat) * Math.sin(lat2));
        return new LatLonRad(lat2, lon2);
    }
    /**
     * Returns the point of intersection of two paths defined by point and bearing.
     *
     * @param {LatLonRad} latlon1 the latitude/longitude of the first point in radians
     * @param {number}    bearing1 - Initial bearing from first point in radians
     * @param {LatLonRad} latlon2 the latitude/longitude of the second point in radians
     * @param {number}    bearing1 - Initial bearing from second point in radians
     * @returns {LatLonRad|null} Destination point (null if no unique intersection defined).
     *
     * @example
     *   const p1 = new LatLonDeg(51.8853, 0.2545).asRad(), brng1 = 108.547;
     *   const p2 = new LatLonDeg(49.0034, 2.5735).asRad(), brng2 =  32.435;
     *   const pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9078°N, 004.5084°E
     */
    static intersection(latlon1, bearing1, latlon2, bearing2)
    {
        const lat1 = latlon1.lat, lon1 = latlon1.lon || latlon1.lng;
        const lat2 = latlon2.lat, lon2 = latlon2.lon || latlon2.lng;
        const deltaLat = lat2 - lat1, deltaLon = lon2 - lon1;

        const sinLat1 = Math.sin(lat1);
        const sinLat2 = Math.sin(lat2);
        const sinHalfDeltaLat = Math.sin(deltaLat/2);
        const sinDeltaLon = Math.sin(deltaLon);
        const sinHalfDeltaLon = Math.sin(deltaLon/2);
        const cosLat1 = Math.cos(lat1);
        const cosLat2 = Math.cos(lat2);

        // angular distance p1-p2
        const δ12 = 2 * Math.asin(Math.sqrt(sinHalfDeltaLat * sinHalfDeltaLat
                    + cosLat1 * cosLat2 * sinHalfDeltaLon * sinHalfDeltaLon));
        if (Math.abs(δ12) < Number.EPSILON) return new LatLonRad(lat1, lon1); // coincident points

        const cosδ12 = Math.cos(δ12);
        const sinδ12 = Math.sin(δ12);

        // initial/final bearings between points
        const cosθa = (sinLat2 - sinLat1*cosδ12) / (sinδ12*cosLat1);
        const cosθb = (sinLat1 - sinLat2*cosδ12) / (sinδ12*cosLat2);
        const θa = Math.acos(Math.min(Math.max(cosθa, -1), 1)); // protect against rounding errors
        const θb = Math.acos(Math.min(Math.max(cosθb, -1), 1)); // protect against rounding errors

        const θ12 = sinDeltaLon>0 ? θa : GeoUtils._2PI-θa;
        const θ21 = sinDeltaLon>0 ? GeoUtils._2PI-θb : θb;

        const α1 = bearing1 - θ12; // angle 2-1-3
        const α2 = θ21 - bearing2; // angle 1-2-3
        const sinα1 = Math.sin(α1);
        const sinα2 = Math.sin(α2);

        if (sinα1 == 0 && sinα2 == 0) return null; // infinite intersections
        if (sinα1 * sinα2 < 0) return null;        // ambiguous intersection (antipodal?)

        const cosα1 = Math.cos(α1);
        const cosα2 = Math.cos(α2);
        const cosα3 = -cosα1*cosα2 + sinα1*sinα2*cosδ12;

        const δ13 = Math.atan2(sinδ12*sinα1*sinα2, cosα2 + cosα1*cosα3);
        const sinδ13 = Math.sin(δ13);
        const cosδ13 = Math.cos(δ13);
        const φ3 = Math.asin(sinLat1*cosδ13 + cosLat1*sinδ13*Math.cos(bearing1));

        const Δλ13 = Math.atan2(Math.sin(bearing1)*sinδ13*cosLat1, cosδ13 - sinLat1*Math.sin(φ3));
        const λ3 = lon1 + Δλ13;

        return new LatLonRad(φ3, λ3);
    }
    /**
     * Given a center point and distance, this will calculate the "corners" of a square bounding
     * a circle of the given radius at the center point.
     *
     * @param {LatLonRad} latlon the latitude/longitude of the center point in radians
     * @param {number} radius the distance in meters
     * @returns {Array} the corners of the bounding area
     */
    static bounds(latlon, radius)
    {
        let cornerDistance = Math.sqrt(radius * radius * 2);
        let nw = GeoUtils.destination(latlon, GeoUtils.NORTHWEST, cornerDistance);
        let se = GeoUtils.destination(latlon, GeoUtils.SOUTHEAST, cornerDistance);
        return [nw, se];
    }

    /**
     * Converts a xyz position in WGS84 space to a position defined in latitude/longitude/elevation
     * space. The WGS84 space is a right-handed, geocentric Cartesian coordinate system, whose
     * origin lies at the centre of the earth.
     *
     * @param x The x component value, where the positive x-axis passes through the prime meridian
     * at the equator
     * @param y The y component value, where the positive y-axis passes through 90 degrees east
     * longitude at the equator
     * @param z The z component value, where the positive z-axis passes through the north pole
     *
     * @return An Object containing 3 values
     * <ol>
     *  <li>the angle of latitude, specified in radians</li>
     *  <li>the angle of longitude, specified in radians</li>
     *  <li>the elevation above sea level, specified in meters</li>
     * </ol>
     */
    static xyzToLatLongElevation( xyz )
    {
        let x = xyz.x;
        let y = xyz.y;
        let z = xyz.z;

        let pythagRadius = Math.sqrt( x * x + y * y + z * z );
        let geocentricLatitude = Math.asin( z / pythagRadius );

        let longitude = 0.0;
        let latitude = 0.0;
        let elevation = 0.0;

        if ( (Math.abs(x) + Math.abs(y)) >= 1.0e-6 )
            longitude = Math.atan2( y, x );

        let p = Math.sqrt( x * x + y * y );
        if ( p < 1.0e-6 )
        {
            // If the point is on a pole
            latitude = (z < 0.0) ? -(Math.PI / 2) : (Math.PI / 2);
            elevation = pythagRadius - GeoUtils.radiusOfCurvatureR( latitude );
        }
        else
        {
            // If the point is not on a pole
            let geocentricRadius = GeoUtils.radiusOfCurvatureR( geocentricLatitude );
            elevation = pythagRadius - geocentricRadius;
            latitude = GeoUtils.geocentricToGeodeticLatitude( geocentricLatitude, elevation );
            let radiusN = GeoUtils.radiusOfCurvatureN( latitude );

            for ( let i = 0 ; i < 5 ; ++i )
            {
                let sinLat = Math.sin( latitude );
                let tanGeodetic = (z + radiusN * GeoUtils.WGS84_ECC_SQ * sinLat) / p;
                let latitudeN = Math.atan( tanGeodetic );

                let diffLat = latitudeN - latitude;
                latitude = latitudeN;
                let cosLat = Math.cos( latitude );

                radiusN = GeoUtils.radiusOfCurvatureN( latitude );
                elevation = (p/cosLat) - radiusN;

                if ( Math.abs(diffLat) < 1e-6 )
                    break;
            }
        }

        return { latitude, longitude, elevation };
    }

    /**
     * Converts a position defined in latitude/longitude/elevation to a xyz position in WGS84
     * space. The WGS84 space is a right-handed, geocentric Cartesian coordinate system, whose
     * origin lies at the centre of the earth.
     *
     * @param {LatLonRad} latLon latitude/longitude in radians
     * @param alt the (optional) altitude component
     * @return An Object containing the corresponding x,y,z WGS84 coordinates
     */
    static latLongElevationToXyz( latLon, alt=0 )
    {
        let cosLat = Math.cos(latLon.lat);
        let sinLat = Math.sin(latLon.lat);
        let cosLng = Math.cos(latLon.lng);
        let sinLng = Math.sin(latLon.lng);
        let radius = GeoUtils.radiusOfCurvatureR(latLon.lat);

        let x =  (radius + alt) * cosLat * cosLng;
        let y =  (radius + alt) * cosLat * sinLng;
        let z =  ( (1-GeoUtils.WGS84_ECC_SQ)*radius + alt ) * sinLat;

        return {x,y,z};
    }

    /**
     * Returns the radii of the principle circles formed on the WGS84 reference ellipsoid
     * at the specified angle of latitude
     *
     * @param latitude The angle of latitude, specified in radians
     * @return a double array populated with the following measurements, in meters
     * <ol>
     *  <li>The radius of the ellipsoid (R)</li>
     *  <li>The radius of curvature in the meridian (M)</li>
     *  <li>The radius of curvature in the prime vertical (N)</li>
     * </ol>
     */
    static radiiOfCurvature( latitude )
    {
        let sinLat = Math.sin( latitude );
        let cosLat = Math.cos( latitude );

        let dSq = 1.0 - GeoUtils.WGS84_ECC_SQ * sinLat * sinLat;
        let d = Math.sqrt( dSq );

        let radiusN = GeoUtils.WGS84_A / d;
        let radiusM = radiusN * (1.0 - GeoUtils.WGS84_ECC_SQ) / dSq;

        let z = (1.0 - GeoUtils.WGS84_ECC_SQ) * radiusN * sinLat;
        let horizontalRadius = radiusN * cosLat;
        let rSq = horizontalRadius * horizontalRadius + z * z;
        let radiusR = Math.sqrt( rSq );

        return [ radiusR, radiusM, radiusN ];
    }

    /**
     * Returns the ellipsoid radius (R) formed on the WGS84 reference ellipsoid at the specified
     * angle of latitude
     *
     * @param latitude The angle of latitude, specified in radians
     * @return a double representing the radius of the ellipsoid (R), in meters
     */
    static radiusOfCurvatureR( latitude )
    {
        let radii = GeoUtils.radiiOfCurvature( latitude );
        return radii[0];
    }

    /**
     * Returns the radius of curvature in the prime vertical (N) formed on the WGS84 reference
     * ellipsoid at the specified angle of latitude
     *
     * @param latitude The angle of latitude, specified in radians
     * @return a double representing the radius of the ellipsoid (N), in meters
     */
    static radiusOfCurvatureN( latitude )
    {
        // Optimisation of radiiOfCurvature() containing only the things required to calculate the
        // N radius, as that's the most commonly calculated of the three.
        let sinLat = Math.sin( latitude );
        let dSq = 1.0 - GeoUtils.WGS84_ECC_SQ * sinLat * sinLat;
        let d = Math.sqrt( dSq );

        return GeoUtils.WGS84_A / d;
    }

    /**
     * Returns the corresponding geodetic latitude for the specified geocentric latitude/elevation
     *
     * @param geocentricLatitude an angle of latitude, specified in radians
     * @param elevation an elevation above sea level, specified in meters
     *
     * @return The corresponding geodetic latitude in radians
     */
    static geocentricToGeodeticLatitude( geocentricLatitude, elevation )
    {
        // Step 1: Use geocentric latitude as if it is geodetic (correct for elevation difference
        // later in step 2)
        let radiusN = GeoUtils.radiusOfCurvatureN( geocentricLatitude );
        let ratio = 1 - GeoUtils.WGS84_ECC_SQ * radiusN / (radiusN + elevation);
        let tanLatitude = Math.tan( geocentricLatitude ) / ratio;
        let geodeticLatitude = Math.atan( tanLatitude );

        // Step 2: Use above approximation to get radiusN and then correct for elevation
        radiusN = GeoUtils.radiusOfCurvatureN( geodeticLatitude );
        ratio = 1 - GeoUtils.WGS84_ECC_SQ * radiusN / (radiusN + elevation);
        tanLatitude = Math.tan( geocentricLatitude ) / ratio;
        geodeticLatitude = Math.atan( tanLatitude );

        return geodeticLatitude;
    }

    /**
     * Get the compass heading given an ECEF position and a vector for the
     * direction the entity is facing
     *
     * @param {Vec3} ecef the location as an ECEF coordinate
     * @param {Vec3} facing the facing vector as a Vec3
     */
    static getEcefVec3HeadingRad( ecef, facingVec )
    {
        let toNorth = GeoUtils.getDirectionToNorth( ecef );
        let toEast = GeoUtils.getDirectionToEast( ecef );
        return Math.atan2(
            MathUtils.dot( facingVec, toEast ),
            MathUtils.dot( facingVec, toNorth )
        );
    }

    /**
     * Get the compass heading given an ECEF position and a quaterion for the
     * direction the entity is facing
     *
     * @param {Vec3} ecef the location as an ECEF coordinate
     * @param {Vec3} facing the facing vector as a Vec3
     */
    static getEcefQuatHeadingRad(ecef, quat)
    {
        let facing = MathUtils.add(
            ecef,
            MathUtils.multiply(
                new Vec3(0,1,0), // FORWARD vector
                quat
            )
        );
        return GeoUtils.getEcefVec3HeadingRad(
            ecef,
            facing
        );
    }

    static getNorthFacingQuat( ecef )
    {
        let worldUpVec = MathUtils.normalize( ecef ); // vertical vector (feet to head)
        let northVec = GeoUtils.getDirectionToNorth( ecef ); // forward facing vector
        let orthogonal = MathUtils.normalize(
            MathUtils.cross( northVec, worldUpVec )
        ); // eastward vector

        let mat3x3 = new Mat3x3( orthogonal, northVec, worldUpVec );
        let quat = mat3x3.toQuat();

        return quat;
    }

    static getDirectionToNorth( ecef )
    {
        let northPoleDir = new Vec3( 0.0, 0.0, 1.0 );
        let worldUpVec = MathUtils.normalize( ecef );
        return MathUtils.normalize(
            MathUtils.cross(
                worldUpVec,
                MathUtils.cross(
                    northPoleDir, worldUpVec
                )
            )
        );
    }

    static getDirectionToEast( ecef )
    {
        let northPoleDir = new Vec3( 0.0, 0.0, 1.0 );
        let worldUpVec = MathUtils.normalize( ecef );
        return MathUtils.normalize(
            MathUtils.cross(
                northPoleDir, worldUpVec
            )
        );
    }
}

// Some useful constants
GeoUtils.EARTH_MEAN_RADIUS = 6371000; // 6,371km
GeoUtils.DEG2RAD = Math.PI / 180.0;
GeoUtils.RAD2DEG = 1.0 / GeoUtils.DEG2RAD;
GeoUtils.NORTH = 0;
GeoUtils.NORTHEAST = GeoUtils.DEG2RAD * 45.0;
GeoUtils.EAST = GeoUtils.DEG2RAD * 90.0;
GeoUtils.SOUTHEAST = GeoUtils.DEG2RAD * 135.0;
GeoUtils.SOUTH = GeoUtils.DEG2RAD * 180.0;
GeoUtils.SOUTHWEST = GeoUtils.DEG2RAD * 225.0;
GeoUtils.WEST = GeoUtils.DEG2RAD * 270.0;
GeoUtils.NORTHWEST = GeoUtils.DEG2RAD * 315.0;
GeoUtils.DEG_SYMBOL = '\u00b0';
GeoUtils.MIN_SYMBOL = '\u2032';
GeoUtils.SEC_SYMBOL = '\u2033';

GeoUtils.WGS84_A = 6378137.0; // average Earth radius
GeoUtils.WGS84_F = 0.0;       // flattening (0.0 = perfect sphere)
GeoUtils.WGS84_B = GeoUtils.WGS84_A * ( 1.0 - GeoUtils.WGS84_F ); // equatorial radius
GeoUtils.WGS84_ECC_SQ = 1 - ((GeoUtils.WGS84_B * GeoUtils.WGS84_B) / (GeoUtils.WGS84_A * GeoUtils.WGS84_A)); // eccentricity
