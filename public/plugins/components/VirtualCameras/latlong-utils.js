const DEG2RAD = Math.PI / 180.0;
const MEAN_EARTH_RADIUS = 6378135.0;

export default class LatLongUtils
{
    /**
     * Returns the (initial) bearing from the origin point to the target point.
     *
     * @param   origin the origin point in the form {latitude:12.34, longitude:56.78} in degrees
     * @param   target the target point in the form {latitude:12.34, longitude:56.78} in degrees
     * @returns the initial bearing in degrees from north.
     *
     * @example
     *     var b = LatLongUtils.bearingTo({latitude:52.205,longitude:0.119},{latitude:48.857,longitude:2.351}); // b is 156.1665825815317
     */
    static bearingTo(origin, target)
    {
        const originLatRad = LatLongUtils.deg2rad(origin.latitude);
        const targetLatRad = LatLongUtils.deg2rad(target.latitude);
        const deltaLonRad = LatLongUtils.deg2rad(target.longitude - origin.longitude);

        // see http://mathforum.org/library/drmath/view/55417.html
        const y = Math.sin(deltaLonRad) * Math.cos(targetLatRad);
        const x = Math.cos(originLatRad) * Math.sin(targetLatRad) -
            Math.sin(originLatRad) * Math.cos(targetLatRad) * Math.cos(deltaLonRad);
        const result = Math.atan2(y, x);

        return LatLongUtils.rad2deg(result);
    }

    /**
     * Returns the destination point from an origin point having travelled the given distance on the
     * given initial bearing (bearing normally varies around path followed).
     *
     * @param   origin the origin point in the form {latitude:12.34, longitude:56.78} in degrees
     * @param   distance the distance travelled, in meters
     * @param   bearing the initial bearing in degrees from north.
     * @returns the destination point
     *
     * @example
     *     var p2 = LatLongUtils.destinationPoint({latitude:51.4778, longitude:-0.0015}, 7794, 300.7); // p2 is 51.5135°N, 000.0983°W
     */
    static destinationPoint(origin, distance, bearing)
    {
        // see http://williams.best.vwh.net/avform.htm#LL

        const angularDistance = distance / MEAN_EARTH_RADIUS; // angular distance in radians
        const bearingRad = LatLongUtils.deg2rad(bearing);

        const originLatRad = LatLongUtils.deg2rad(origin.latitude);
        const originLonRad = LatLongUtils.deg2rad(origin.longitude);

        const destinationLatRad = Math.asin(Math.sin(originLatRad) * Math.cos(angularDistance) +
            Math.cos(originLatRad) * Math.sin(angularDistance) * Math.cos(bearingRad));
        let destinationLonRad = originLonRad + Math.atan2(Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(originLatRad),
            Math.cos(angularDistance) - Math.sin(originLatRad) * Math.sin(destinationLatRad));
        destinationLonRad = (destinationLonRad + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180°

        return {
            latitude: LatLongUtils.rad2deg(destinationLatRad),
            longitude: LatLongUtils.rad2deg(destinationLonRad)
        };
    }

    /**
     * Converts a point from LLA (latitude, longitude, altitude) to ECEF coordinates.
     *
     * @param   lla the point in the form {latitude:12.34, longitude:56.78, altitude:910.123} in degrees and meters
     * @returns the ECEF coordinates for the given point
     *
     * @example
     *     var ecef = LatLongUtils.llaToEcef({latitude:51.4778, longitude:-0.0015, altitude:0.0}); // ecef is { x:3972416.1457164665,  y:-103.9976115269624,  z:4990041.686465217}
     */
    static llaToEcef(lla)
    {
        var ecef = {
            x: 0,
            y: 0,
            z: 0
        };
        // lla.x = latitude (degrees), lla.y = longitude (degrees), lla.z = altitude (m)
        const radLat = LatLongUtils.deg2rad(lla.latitude);
        const radLon = LatLongUtils.deg2rad(lla.longitude);
        const sinLat = Math.sin(radLat);
        const sinLon = Math.sin(radLon);
        const cosLat = Math.cos(radLat);
        const cosLon = Math.cos(radLon);

        const N = MEAN_EARTH_RADIUS; // prime vertical radius of curvature

        ecef.x = (N + lla.altitude) * cosLat * cosLon;
        ecef.y = (N + lla.altitude) * cosLat * sinLon;
        ecef.z = (N + lla.altitude) * sinLat;

        return ecef;
    }

    static deg2rad(deg) { return (deg % 360.0) * DEG2RAD; }
    static rad2deg(rad) { return (rad / DEG2RAD) % 360.0; }
}
