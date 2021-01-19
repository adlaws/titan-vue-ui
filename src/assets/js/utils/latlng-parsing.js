const LATLNG_REGEX = {
    // a regular expression which case insensitively captures E or W
    EW: '([EeWw])',
    // a regular expression which case insensitively captures N or S
    NS: '([NnSs])',
    DEG_SYMBOL: '[o' + '\u00b0' + ']', // accepts 'o' or degree symbol
    MIN_SYMBOL: '[\\\'' + '\u2032' + ']', // accepts "'" or XHTML entity &prime;
    SEC_SYMBOL: '[\\"' + '\u2033' + ']', // accepts '"' or XHTML entity &Prime;
    // a regular expression which captures float values between 0 and 180 inclusive (i.e. 0.000r - 180.0000r)
    // REGEX_FLOAT_0_180: '(0*\d|0*\d\d|1[0-7]\d)(\.\d+)?|180(\.0+)'
    FLOAT_0_180: '(180(\\.0+)?|180|((1[0-7]\\d|0*\\d\\d|0*\\d)(\\.\\d+)?))',
    // a regular expression which captures float values between 0 and 90 inclusive  (i.e. 0.000r - 90.0000r)
    FLOAT_0_90: '(90(\\.0+)|90|([0-8][0-9]|\\d)(\\.\\d+)?)',
    // a regular expression which captures integer values between 0 and 179 inclusive (i.e. 0 - 180)
    INT_0_180: '(180|1[0-7]\\d|\\d\\d|\\d)',
    // a regular expression which captures integer values between 0 and 90 inclusive  (i.e. 0 - 90)
    INT_0_90: '(90|[0-8][0-9]|\\d)',
    // a regular expression which captures integer values between 0 and 59 inclusive  (i.e. 0 - 59)
    INT_0_59: '([0-5][0-9]|\\d)',
    // a regular expression which captures float values between 0 and 60 (i.e. 0.000r - 59.999r)
    FLOAT_0_59_9r: '(([0-5][0-9]|\\d)(\\.\\d+)?)',
    LEADING_SPACES: '^\\s*',
    TRAILING_SPACES: '\\s*$',
};

// Format identifiers:
export const LATLNG_FORMAT = {
    DECIMAL: 'decimal',
    DMS: 'dms',
    WIKIPEDIA: 'wikipedia',
    GOOGLE: 'google',
    MGRS: 'mgrs',
};

const DEGREES_TO_RADIANS = Math.PI / 180.0;
const RADIANS_TO_DEGREES = 180.0 / Math.PI;
class LatLongUtils
{
    static degToRad(degrees)
    {
        return degrees * DEGREES_TO_RADIANS;
    }

    static radToDeg(radians)
    {
        return radians * RADIANS_TO_DEGREES;
    }
}

export default class LatLongParser
{
    /**
     * This utility method removes the trailing zeros of a text representation of a floating point
     * value. For example:
     *     stripTrailingZeros( '1.230000' )
     * returns
     *     1.23
     *
     * Note that
     *     stripTrailingZeros( '1.00000' )
     * returns
     *     1.0
     */
    static stripTrailingZeros(floatText)
    {
        let tmpFloatTest = floatText;
        if (floatText.indexOf('.') !== -1)
        {
            while (floatText.substr(floatText.length - 1) === '0' && floatText.substr(floatText.length - 2, 1) !== '.')
            {
                tmpFloatTest = floatText.substr(0, floatText.length - 1);
            }
        }
        return tmpFloatTest;
    }

    /**
     *  This utility method provides a {'deg':DEG, 'min':MIN, 'sec':SEC} object corresponding
     *  to the given angle
     *
     *  @return a {'deg':DEG, 'min':MIN, 'sec':SEC} object corresponding to the given angle
     */
    static angleToDMS(angle)
    {
        const sign = angle < 0 ? -1 : 1;

        const degs = Math.floor(Math.abs(angle));
        let mins = (Math.abs(angle) - degs) * 60.0;
        const secs = (mins - Math.floor(mins)) * 60.0;
        mins = Math.floor(mins);

        return {
            'deg': degs * sign,
            'min': mins,
            'sec': secs
        };
    }

    /**
     *  This method attempts to convert the given text into a {latitude:x, longitude:y} object using
     *  a variety of different parsing methods
     *  @param text the textual representation of the GeoLocation
     *  @return a GeoLocation instance, or None if the text could not be understood as a
     *   location
     */
    static fromString(text)
    {
        if (text === '' || text === undefined || text === null)
        {
            return null;
        }
        // we try each of the ways we now for converting text to a lat long
        // be careful with the ordering of these as some of the 'simpler'
        // ones are able to successfully partially parse the more complex ones
        // so leave the simpler ones at the end!
        const parsers = [
            LatLongParser.from_mgrs,                 // MOST COMPLEX
            LatLongParser.from_wikipedia_lat_lon,    // ||
            LatLongParser.from_nsewdms_lat_lon,      // ||
            LatLongParser.from_decimaldegs_lat_lon,  // ||
            LatLongParser.from_google_lat_lon        // LEAST COMPLEX
        ];
        for(let i = 0; i < parsers.length; i++)
        {
            const latLong = parsers[i](text.trim());
            if (latLong !== null)
            {
                return latLong;
            }
        }
        // none of the parsers knew what to do with the text
        return null;
    }

    static toString(latitude, longitude, format, decimalPlaces)
    {
        if (latitude === null || latitude === undefined)
            return '';
        latitude = parseFloat(latitude);
        if (isNaN(latitude))
            return '';

        if (longitude === null || longitude === undefined)
            return '';
        longitude = parseFloat(longitude);
        if (isNaN(longitude))
            return '';

        if (decimalPlaces === null || decimalPlaces === undefined)
            decimalPlaces = 3;
        decimalPlaces = parseInt(decimalPlaces, 10);
        if (isNaN(decimalPlaces))
            decimalPlaces = 3;

        if (format === null || format === undefined)
            format = LatLongParser.DECIMAL;

        const formatters = {
            [LATLNG_FORMAT.DECIMAL]: LatLongParser.to_decimaldegs_lat_lon,
            [LATLNG_FORMAT.DMS]: LatLongParser.to_nsewdms_lat_lon,
            [LATLNG_FORMAT.WIKIPEDIA]: LatLongParser.to_wikipedia_lat_lon,
            [LATLNG_FORMAT.GOOGLE]: LatLongParser.to_google_lat_lon,
            [LATLNG_FORMAT.MGRS]: LatLongParser.to_mgrs,
        };

        let formatter = formatters[format] || LatLongParser.to_decimaldegs_lat_lon;
        return formatter(latitude, longitude, decimalPlaces);
    }

    /**
     *  This method attempts to determine what format the given location is in.
     *
     *  @param candidate the text representation of the GeoLocation
     *  @return one of mgrs, wikipedia, dms, decimal or google, depending on the identified format.
     *           If no format could be identified, null is returned.
     */
    static getFormat(candidate)
    {
        if (candidate === '' || candidate === undefined || candidate === null)
            return null;

        // we try each of the ways we now for converting text to a lat long
        // be careful with the ordering of these as some of the 'simpler'
        // ones are able to successfully partially parse the more complex ones
        // so leave the simpler ones at the end!
        const parsers = [
            {format: LatLongParser.MGRS,      parser: LatLongParser.from_mgrs},                // MOST COMPLEX
            {format: LatLongParser.WIKIPEDIA, parser: LatLongParser.from_wikipedia_lat_lon},   // ||
            {format: LatLongParser.DMS,       parser: LatLongParser.from_nsewdms_lat_lon},     // ||
            {format: LatLongParser.DECIMAL,   parser: LatLongParser.from_decimaldegs_lat_lon}, // ||
            {format: LatLongParser.GOOGLE,    parser: LatLongParser.from_google_lat_lon}       // LEAST COMPLEX
        ];
        for (let i = 0; i < parsers.length; i++)
        {
            const formatName = parsers[i].format;
            const parser = parsers[i].parse;
            const latLong = parser(candidate.trim());
            if (latLong !== null)
                return formatName;
        }
        // none of the parsers knew what to do with the text
        return null;
    }

    /**
     *  This method attempts to convert the given text into a {latitude:x, longitude:y} object using
     *  the representation accepted by Google Maps, such as '0,0', '48.05,11.966667',
     *  '90,0', '-90,-180', and so on.
     *
     *  @param text the Google Maps representation of the GeoLocation
     *  @return a GeoLocation instance, or None if the text could not be understood as a
     *         location
     */
    static from_google_lat_lon(text)
    {
        // Create Google style regex, accepts decimal latitude,longitude degree values like '0,0',
        // '11.966667,48.05',  '0,90', '-180,-90' and so on. Expects values in lat,long order, but
        // in  the case that one of the values is unambiguously a longitude (by nature of it being
        // outside the range -90 <==> +90), the values may also be provided in longitude,latitude
        // order
        const PATTERN_1 = new RegExp('^\\s*((\\-?)' + LATLNG_REGEX.FLOAT_0_90 + ')\\s+((\\-?)' + LATLNG_REGEX.FLOAT_0_180 + ')\\s*$');
        const PATTERN_2 = new RegExp('^\\s*((\\-?)' + LATLNG_REGEX.FLOAT_0_90 + ')\\s*\\,\\s*((\\-?)' + LATLNG_REGEX.FLOAT_0_180 + ')\\s*$');
        const PATTERN_3 = new RegExp('^\\s*((\\-?)' + LATLNG_REGEX.FLOAT_0_180 + ')\\s+((\\-?)' + LATLNG_REGEX.FLOAT_0_90 + ')\\s*$');
        const PATTERN_4 = new RegExp('^\\s*((\\-?)' + LATLNG_REGEX.FLOAT_0_180 + ')\\s*\\,\\s*((\\-?)' + LATLNG_REGEX.FLOAT_0_90 + ')\\s*$');
        // put the patterns in a dictionary which also defines which regex capture
        // group indices contain the relevant information
        const matchers = [
            {
                'pattern': PATTERN_1,
                'latitude': 1,
                'longitude': 7
            },
            {
                'pattern': PATTERN_2,
                'latitude': 1,
                'longitude': 7
            },
            {
                'pattern': PATTERN_3,
                'latitude': 8,
                'longitude': 1
            },
            {
                'pattern': PATTERN_4,
                'latitude': 8,
                'longitude': 1
            },
        ];
        // check all patterns for a match
        for (let i = 0; i < matchers.length; i++)
        {
            const matcher = matchers[i];
            const pattern = matcher['pattern'];
            const matches = text.trim().match(pattern);
            if (matches)
            {
                try
                {
                    const latitude = parseFloat(matches[matcher['latitude']]);
                    const longitude = parseFloat(matches[matcher['longitude']]);
                    // make the lat/long
                    return {latitude, longitude};
                }
                catch (e)
                {
                    // something was bad - return null
                    return null;
                }
            }
        }
        return null;
        // nothing worked - return null
    }

    /**
     *  This method provides a text representation of the the instance using
     *  the representation accepted by Google Maps, such as '0,0', '48.05,11.966667',
     *  '90,0', '-90,-180', and so on.
     *
     *  @return a textual representation of the lat/long
     */
    static to_google_lat_lon(latitude, longitude, decimalPlaces)
    {
        if (latitude === null || latitude === undefined)
            return '';
        latitude = parseFloat(latitude);
        if (isNaN(latitude))
            return '';

        if (longitude === null || longitude === undefined)
            return '';
        longitude = parseFloat(longitude);
        if (isNaN(longitude))
            return '';

        if (decimalPlaces === null || decimalPlaces === undefined)
            decimalPlaces = 3;
        decimalPlaces = parseInt(decimalPlaces, 10);
        if (isNaN(decimalPlaces))
            decimalPlaces = 3;

        if (decimalPlaces >= 0)
            return latitude.toFixed(decimalPlaces) + ' ' + longitude.toFixed(decimalPlaces);

        return LatLongParser.stripTrailingZeros('' + latitude) + ' ' + LatLongParser.stripTrailingZeros('' + longitude);
    }
    /**
     *  This method attempts to convert the given text into a {latitude:x, longitude:y} object using
     *  the representation given by Wikipedia, such as 31o57'8'S 115o51'32'E.
     *
     *  @param text the Wikipedia representation of the GeoLocation
     *  @return a GeoLocation instance, or None if the text could not be understood as a
     *         location
     */
    static from_wikipedia_lat_lon(text)
    {
        // Create Wikipedia style regex, accepts decimal latitude,longitude degree values like,
        // Will accept any of the following, which are all equivalent:
        // 31o57'8'N,115o51'32'E      31o57'8'N 115o51'32'E     31o57'8' N 115o51'32' E
        const PATTERN_1 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.INT_0_90 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + '\\s*' + LATLNG_REGEX.NS + '\\s*\\,?\\s*' +
            LATLNG_REGEX.INT_0_180 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + '\\s*' + LATLNG_REGEX.EW + LATLNG_REGEX.TRAILING_SPACES
        );
        // N31o57'8',E115o51'32'      N31o57'8' E115o51'32'      N 31o57'8' E 115o51'32'
        const PATTERN_2 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.NS + '\\s*' + LATLNG_REGEX.INT_0_90 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + '\\s*\\,?\\s*' +
            LATLNG_REGEX.EW + '\\s*' + LATLNG_REGEX.INT_0_180 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + LATLNG_REGEX.TRAILING_SPACES
        );
        // 115o51'32'E,31o57'8'N      115o51'32'E 31o57'8'N      115o51'32' E 31o57'8' N
        const PATTERN_3 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.INT_0_180 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + '\\s*' + LATLNG_REGEX.EW + '\\s*\\,?\\s*' +
            LATLNG_REGEX.INT_0_90 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + '\\s*' + LATLNG_REGEX.NS + LATLNG_REGEX.TRAILING_SPACES
        );
        // E115o51'32' N31o57'8'      E115o51'32' N31o57'8'      E 115o51'32' N 31o57'8'
        const PATTERN_4 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.EW + '\\s*' + LATLNG_REGEX.INT_0_180 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + '\\s*\\,?\\s*' +
            LATLNG_REGEX.NS + '\\s*' + LATLNG_REGEX.INT_0_90 + LATLNG_REGEX.DEG_SYMBOL + '\\s*' + LATLNG_REGEX.INT_0_59 + LATLNG_REGEX.MIN_SYMBOL + '\\s*' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.SEC_SYMBOL + LATLNG_REGEX.TRAILING_SPACES
        );
        // put the patterns in a dictionary which also defines which regex capture
        // group indices contain the relevant information
        const matchers = [
            {
                'pattern': PATTERN_1,
                'longitude_ns': 6,
                'longitude_deg': 1,
                'longitude_min': 2,
                'longitude_sec': 3,
                'latitude_ew': 12,
                'latitude_deg': 7,
                'latitude_min': 8,
                'latitude_sec': 9
            },
            {
                'pattern': PATTERN_2,
                'longitude_ns': 1,
                'longitude_deg': 2,
                'longitude_min': 3,
                'longitude_sec': 4,
                'latitude_ew': 7,
                'latitude_deg': 8,
                'latitude_min': 9,
                'latitude_sec': 10
            },
            {
                'pattern': PATTERN_3,
                'longitude_ns': 12,
                'longitude_deg': 7,
                'longitude_min': 8,
                'longitude_sec': 9,
                'latitude_ew': 6,
                'latitude_deg': 1,
                'latitude_min': 2,
                'latitude_sec': 3
            },
            {
                'pattern': PATTERN_4,
                'longitude_ns': 7,
                'longitude_deg': 8,
                'longitude_min': 9,
                'longitude_sec': 10,
                'latitude_ew': 1,
                'latitude_deg': 2,
                'latitude_min': 3,
                'latitude_sec': 4
            }
        ];
        // check all patterns for a match
        for (let i = 0; i < matchers.length; i++)
        {
            const matcher = matchers[i];
            const pattern = matcher['pattern'];
            const matches = text.trim().match(pattern);
            if (matches)
            {
                try
                {
                    // grab the N/S and E/W portions of the text from the regex matching groups
                    const ns_label = matches[matcher['longitude_ns']].toLowerCase();
                    const ew_label = matches[matcher['latitude_ew']].toLowerCase();
                    const ns_sign = ns_label === 's' ? -1 : 1;
                    const ew_sign = ew_label === 'w' ? -1 : 1;
                    // grab the degrees,minutes and sconds portions of the text
                    // from the regex matching groups and process the text values
                    // into numbers we can actually use
                    const ns_deg = parseInt(matches[matcher['longitude_deg']], 10);
                    const ns_min = parseFloat(matches[matcher['longitude_min']], 10);
                    const ns_sec = parseFloat(matches[matcher['longitude_sec']], 10);
                    const ew_deg = parseInt(matches[matcher['latitude_deg']], 10);
                    const ew_min = parseFloat(matches[matcher['latitude_min']], 10);
                    const ew_sec = parseFloat(matches[matcher['latitude_sec']], 10);
                    const latitude = (ns_deg + (ns_min / 60.0) + (ns_sec / 3600.0)) * ns_sign;
                    const longitude = (ew_deg + (ew_min / 60.0) + (ew_sec / 3600.0)) * ew_sign;
                    // make the lat/long
                    return {latitude, longitude};
                }
                catch (e)
                {
                    // something was bad - return null
                    return null;
                }
            }
        }
        // nothing worked - return null
        return null;
    }
    /**
     *  This method provides a text representation of the the instance using
     *  the representation accepted by Wikipedia, such as '31o57'8'S 115o51'32'E'
     *
     *  @return a textual representation of the lat/long
     */
    static to_wikipedia_lat_lon(latitude, longitude, decimalPlaces)
    {
        if (latitude === null || latitude === undefined)
            return '';
        latitude = parseFloat(latitude);
        if (isNaN(latitude))
            return '';

        if (longitude === null || longitude === undefined)
            return '';
        longitude = parseFloat(longitude);
        if (isNaN(longitude))
            return '';

        if (decimalPlaces === null || decimalPlaces === undefined)
            decimalPlaces = 3;
        decimalPlaces = parseInt(decimalPlaces);
        if (isNaN(decimalPlaces))
            decimalPlaces = 3;

        const latDMS = LatLongParser.angleToDMS(latitude);
        const lonDMS = LatLongParser.angleToDMS(longitude);
        const nsLabel = latDMS.deg < 0 ? 'S' : 'N';
        const ewLabel = lonDMS.deg < 0 ? 'W' : 'E';

        if (decimalPlaces >= 0)
        {
            const latSecStr = LatLongParser.rationalizeSecondsString(latDMS.sec, decimalPlaces);
            const lonSecStr = LatLongParser.rationalizeSecondsString(lonDMS.sec, decimalPlaces);
            return Math.abs(latDMS.deg) + '\u00b0' + latDMS.min + '\u2032' + latSecStr + '\u2033' + nsLabel + ' ' +
                Math.abs(lonDMS.deg) + '\u00b0' + lonDMS.min + '\u2032' + lonSecStr + '\u2033' + ewLabel;
        }

        const northingStr = Math.abs(latDMS.deg) + '\u00b0' + latDMS.min + '\u2032' + LatLongParser.stripTrailingZeros('' + latDMS.sec) + '\u2033' + nsLabel;
        const eastingStr = Math.abs(lonDMS.deg) + '\u00b0' + lonDMS.min + '\u2032' + LatLongParser.stripTrailingZeros('' + lonDMS.sec) + '\u2033' + ewLabel;
        return northingStr + ' ' + eastingStr;
    }

    /**
     * Utility function to correct a problem which sometimes occurs when rounding seconds to a
     * lesser number of decimal places than the actual value requires for full accuracy.
     *
     * More specifically, the seconds value of a degree, minutes seconds representation of a
     * latitude or longitude sometimes rounds up to 60, which is an invalid number of seconds, since
     * if the seconds reach 60, the minutes should increase by 1, etc etc etc.
     *
     * For example, if the seconds value is 59.9999995, and we try to represent it as a 3 decimal
     * place value, it will round to '60.000', which is not correct, as discussed above.
     *
     * This method simply ensures that in such cases the number shown is '59.9999', with the 9's after
     * the decimal place reaching the required number of decimal places.
     */
    static rationalizeSecondsString(seconds, decimalPlaces)
    {
        let secondsStr = seconds.toFixed(decimalPlaces);
        if (parseFloat(secondsStr) >= 60)
        {
            secondsStr = '59';
            if (decimalPlaces > 0)
            {
                secondsStr += '.';
                for (let i = 0; i < decimalPlaces; i++)
                {
                    secondsStr += '9';
                }
            }
        }
        return secondsStr;
    }

    /**
     *  This method attempts to convert the given text into a {latitude:x, longitude:y} object using
     *  a representation such as 'N123.34.56 E56.23.45'.
     *
     *  @param text the representation of the GeoLocation
     *  @return a GeoLocation instance, or None if the text could not be understood as a
     *         location
     */
    static from_nsewdms_lat_lon(text)
    {
        // Create Wikipedia style regex, accepts decimal latitude,longitude degree values like,
        // Will accept any of the following, which are all equivalent:
        // N12.34.56,E23.45.56      N12.34.56 E23.45.56     N 12.34.56 E 23.45.56
        const PATTERN_1 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.NS + '\\s*' + LATLNG_REGEX.INT_0_90 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + '\\s*\\,?\\s*' +
            LATLNG_REGEX.EW + '\\s*' + LATLNG_REGEX.INT_0_180 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.TRAILING_SPACES);
        // 12.34.56N,23.45.56E      12.34.56N 23.45.56E     12.34.56 N 23.45.56 E
        const PATTERN_2 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.INT_0_90 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + '\\s*' + LATLNG_REGEX.NS + '\\s*\\,?\\s*' +
            LATLNG_REGEX.INT_0_180 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + '\\s*' + LATLNG_REGEX.EW + LATLNG_REGEX.TRAILING_SPACES);
        // E23.45.56,N12.34.56      E23.45.56 N12.34.56     E 23.45.56 N 12.34.56
        const PATTERN_3 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.EW + '\\s*' + LATLNG_REGEX.INT_0_180 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + '\\s*\\,?\\s*' +
            LATLNG_REGEX.NS + '\\s*' + LATLNG_REGEX.INT_0_90 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + LATLNG_REGEX.TRAILING_SPACES);
        // 23.45.56E,12.34.56N      23.45.56E 12.34.56N     23.45.56 E 12.34.56 N
        const PATTERN_4 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.INT_0_180 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + '\\s*' + LATLNG_REGEX.EW + '\\s*\\,?\\s*' +
            LATLNG_REGEX.INT_0_90 + '\\.' + LATLNG_REGEX.INT_0_59 + '\\.' + LATLNG_REGEX.FLOAT_0_59_9r + '\\s*' + LATLNG_REGEX.NS + LATLNG_REGEX.TRAILING_SPACES);
        // put the patterns in a dictionary which also defines which regex capture
        // group indices contain the relevant information
        const matchers = [
            {
                'pattern': PATTERN_1,
                'longitude_ns': 1,
                'longitude_deg': 2,
                'longitude_min': 3,
                'longitude_sec': 4,
                'latitude_ew': 7,
                'latitude_deg': 8,
                'latitude_min': 9,
                'latitude_sec': 10
            },
            {
                'pattern': PATTERN_2,
                'longitude_ns': 6,
                'longitude_deg': 1,
                'longitude_min': 2,
                'longitude_sec': 3,
                'latitude_ew': 12,
                'latitude_deg': 7,
                'latitude_min': 8,
                'latitude_sec': 9
            },
            {
                'pattern': PATTERN_3,
                'longitude_ns': 7,
                'longitude_deg': 8,
                'longitude_min': 9,
                'longitude_sec': 10,
                'latitude_ew': 1,
                'latitude_deg': 2,
                'latitude_min': 3,
                'latitude_sec': 4
            },
            {
                'pattern': PATTERN_4,
                'longitude_ns': 12,
                'longitude_deg': 7,
                'longitude_min': 8,
                'longitude_sec': 9,
                'latitude_ew': 6,
                'latitude_deg': 1,
                'latitude_min': 2,
                'latitude_sec': 3
            }
        ];
        // check all patterns for a match
        for (let i = 0; i < matchers.length; i++)
        {
            const matcher = matchers[i];
            const pattern = matcher['pattern'];
            const matches = text.trim().match(pattern);
            if (matches)
            {
                try
                {
                    // grab the N/S and E/W portions of the text from the regex matching groups
                    const ns_label = matches[matcher['longitude_ns']].toLowerCase();
                    const ew_label = matches[matcher['latitude_ew']].toLowerCase();
                    const ns_sign = ns_label === 's' ? -1 : 1;
                    const ew_sign = ew_label === 'w' ? -1 : 1;
                    // grab the degrees,minutes and sconds portions of the text
                    // from the regex matching groups and process the text values
                    // into numbers we can actually use
                    const ns_deg = parseInt(matches[matcher['longitude_deg']], 10);
                    const ns_min = parseFloat(matches[matcher['longitude_min']], 10);
                    const ns_sec = parseFloat(matches[matcher['longitude_sec']], 10);
                    const ew_deg = parseInt(matches[matcher['latitude_deg']], 10);
                    const ew_min = parseFloat(matches[matcher['latitude_min']], 10);
                    const ew_sec = parseFloat(matches[matcher['latitude_sec']], 10);
                    const latitude = (ns_deg + (ns_min / 60.0) + (ns_sec / 3600.0)) * ns_sign;
                    const longitude = (ew_deg + (ew_min / 60.0) + (ew_sec / 3600.0)) * ew_sign;
                    // make the lat/long
                    return {latitude, longitude};
                }
                catch (e)
                {
                    // something was bad - return null
                    return null;
                }
            }
        }
        // nothing worked - return null
        return null;
    }

    /**
     *  This method provides a text representation of the the instance using
     *  a representation in the style '123.34.56N 56.23.45E'
     *
     *  @return a textual representation of the lat/long
     */
    static to_nsewdms_lat_lon(latitude, longitude, decimalPlaces)
    {
        if (latitude === null || latitude === undefined)
            return '';
        latitude = parseFloat(latitude);
        if (isNaN(latitude))
            return '';

        if (longitude === null || longitude === undefined)
            return '';
        longitude = parseFloat(longitude);
        if (isNaN(longitude))
            return '';

        if (decimalPlaces === null || decimalPlaces === undefined)
            decimalPlaces = 3;
        decimalPlaces = parseInt(decimalPlaces, 10);
        if (isNaN(decimalPlaces))
            decimalPlaces = 3;

        const latDMS = LatLongParser.angleToDMS(latitude);
        const lonDMS = LatLongParser.angleToDMS(longitude);
        const nsLabel = latDMS.deg < 0 ? 'S' : 'N';
        const ewLabel = lonDMS.deg < 0 ? 'W' : 'E';

        if (decimalPlaces >= 0)
        {
            const latSecStr = LatLongParser.rationalizeSecondsString(latDMS.sec, decimalPlaces);
            const lonSecStr = LatLongParser.rationalizeSecondsString(lonDMS.sec, decimalPlaces);
            return Math.abs(latDMS.deg) + '.' + latDMS.min + '.' + latSecStr + nsLabel + ' ' +
                Math.abs(lonDMS.deg) + '.' + lonDMS.min + '.' + lonSecStr + ewLabel;
        }

        const northingStr = Math.abs(latDMS.deg) + '.' + latDMS.min + '.' + LatLongParser.stripTrailingZeros('' + latDMS.sec) + nsLabel;
        const eastingStr = Math.abs(lonDMS.deg) + '.' + lonDMS.min + '.' + LatLongParser.stripTrailingZeros('' + lonDMS.sec) + ewLabel;
        return northingStr + ' ' + eastingStr;
    }

    /**
     *  This method attempts to convert the given text into a {latitude:x, longitude:y} object using
     *  a decimal degrees style representation such as '34.56N,23.45E'.
     *
     *  @param text the decimal degrees representation of the GeoLocation
     *  @return a GeoLocation instance, or None if the text could not be understood as a
     *         location
     */
    static from_decimaldegs_lat_lon(text)
    {
        // Create regex patterns to match variations of '34.56N,23.45E' style degrees/mins/seconds
        // Will accept any of the following, which are all equivalent:
        // 34.56N,23.45E        34.56N 23.45E       34.56 N 23.45 E
        const PATTERN_1 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.FLOAT_0_90 + '\\s*' + LATLNG_REGEX.DEG_SYMBOL + '?\\s*' + LATLNG_REGEX.NS + '\\s*\\,?\\s*' + LATLNG_REGEX.FLOAT_0_180 + '\\s*' + LATLNG_REGEX.DEG_SYMBOL + '?\\s*' + LATLNG_REGEX.EW + LATLNG_REGEX.TRAILING_SPACES);
        // N34.56,E23.45        N34.56 E23.45       N 34.56 E 23.45
        const PATTERN_2 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.NS + '\\s*' + LATLNG_REGEX.FLOAT_0_90 + '\\s*' + LATLNG_REGEX.DEG_SYMBOL + '?\\s*\\,?\\s*' + LATLNG_REGEX.EW + '\\s*' + LATLNG_REGEX.FLOAT_0_180 + '\\s*' + LATLNG_REGEX.DEG_SYMBOL + '?' + LATLNG_REGEX.TRAILING_SPACES);
        // 23.45E,34.56N        23.45E 34.56N       23.45 E 34.56 N
        const PATTERN_3 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.FLOAT_0_180 + '\\s*' + LATLNG_REGEX.DEG_SYMBOL + '?\\s*' + LATLNG_REGEX.EW + '\\s*\\,?\\s*' + LATLNG_REGEX.FLOAT_0_90 + '\\s*' + LATLNG_REGEX.DEG_SYMBOL + '?\\s*' + LATLNG_REGEX.NS + LATLNG_REGEX.TRAILING_SPACES);
        // E23.45,N34.56        E23.45 N34.56       E 23.45 N 34.56
        const PATTERN_4 = new RegExp(LATLNG_REGEX.LEADING_SPACES + LATLNG_REGEX.EW + '\\s*' + LATLNG_REGEX.FLOAT_0_180 + '\\s*'+ LATLNG_REGEX.DEG_SYMBOL + '?\\s*\\,?\\s*' + LATLNG_REGEX.NS + '\\s*' + LATLNG_REGEX.FLOAT_0_90 + '\\s*' + LATLNG_REGEX.DEG_SYMBOL + '?' + LATLNG_REGEX.TRAILING_SPACES);
        // put the patterns in a dictionary which also defines which regex capture
        // group indices contain the relevant information
        const matchers = [
            {
                'pattern': PATTERN_1,
                'longitude_ns': 5,
                'longitude': 1,
                'latitude_ew': 11,
                'latitude': 8
            },
            {
                'pattern': PATTERN_2,
                'longitude_ns': 1,
                'longitude': 2,
                'latitude_ew': 6,
                'latitude': 7
            },
            {
                'pattern': PATTERN_3,
                'longitude_ns': 11,
                'longitude': 7,
                'latitude_ew': 6,
                'latitude': 1
            },
            {
                'pattern': PATTERN_4,
                'longitude_ns': 7,
                'longitude': 8,
                'latitude_ew': 1,
                'latitude': 2
            }
        ];
        // check all patterns for a match
        for (let i = 0; i < matchers.length; i++)
        {
            const matcher = matchers[i];
            const pattern = matcher['pattern'];
            const matches = text.trim().match(pattern);
            if (matches)
            {
                try
                {
                    // grab the N/S and E/W portions of the text from the regex matching groups
                    const ns_label = matches[matcher['longitude_ns']].toLowerCase();
                    const ew_label = matches[matcher['latitude_ew']].toLowerCase();
                    const ns_sign = ns_label === 's' ? -1 : 1;
                    const ew_sign = ew_label === 'w' ? -1 : 1;
                    // grab the degrees,minutes and sconds portions of the text
                    // from the regex matching groups and process the text values
                    // into numbers we can actually use
                    const ns_deg = parseFloat(matches[matcher['longitude']]);
                    const ew_deg = parseFloat(matches[matcher['latitude']]);
                    const latitude = ns_deg * ns_sign;
                    const longitude = ew_deg * ew_sign;
                    // make the lat/long
                    return {latitude, longitude};
                }
                catch (e)
                {
                    // something was bad - return null
                    return null;
                }
            }
        }
        // nothing worked - return null
        return null;
    }

    /**
     *  This method provides a text representation of the the instance using
     *  a representation in the style '123.3456N,56.2345E'
     *
     *  @return a textual representation of the lat/long
     */
    static to_decimaldegs_lat_lon(latitude, longitude, decimalPlaces)
    {
        if (latitude === null || latitude === undefined)
            return '';
        latitude = parseFloat(latitude);
        if (isNaN(latitude))
            return '';

        if (longitude === null || longitude === undefined)
            return '';
        longitude = parseFloat(longitude);
        if (isNaN(longitude))
            return '';

        if (decimalPlaces === null || decimalPlaces === undefined)
            decimalPlaces = 3;
        decimalPlaces = parseInt(decimalPlaces, 10);
        if (isNaN(decimalPlaces))
            decimalPlaces = 3;

        const nsLabel = latitude < 0 ? 'S' : 'N';
        const ewLabel = longitude < 0 ? 'W' : 'E';

        if (decimalPlaces >= 0)
            return Math.abs(latitude).toFixed(decimalPlaces) + nsLabel + ' ' + Math.abs(longitude).toFixed(decimalPlaces) + ewLabel;

        const northingStr = LatLongParser.stripTrailingZeros('' + Math.abs(latitude)) + nsLabel;
        const eastingStr = LatLongParser.stripTrailingZeros('' + Math.abs(longitude)) + ewLabel;
        return northingStr + ' ' + eastingStr;
    }

    /**
     *  This method attempts to convert the given text into a {latitude:x, longitude:y} object using
     *  an MGRS parser.
     *
     *  @param text the MGRS representation of the GeoLocation
     *  @return a GeoLocation instance, or None if the text could not be parsed as an MGRS location
     */
    static from_mgrs(text)
    {
        try
        {
            return MGRSUtils.mgrsToLatLon(text);
        }
        catch (e)
        {
            // ignore
        }
        return null;
    }
    /**
     *  This method provides an MGRS representation of the the latitude and longitude
     *
     *  @return an MGRS representation of the the latitude and longitude
     */
    static to_mgrs(latitude, longitude, accuracy)
    {
        if (accuracy === null || accuracy === undefined)
            accuracy = -1;
        return MGRSUtils.latLonToMGRS(latitude, longitude, accuracy);
    }
}


const MGRS = {
    NUM_100K_SETS: 6,
    // The column letters (for easting) of the lower left value, per set.
    SET_ORIGIN_COLUMN_LETTERS: 'AJSAJS',
    // The row letters (for northing) of the lower left value, per set.
    SET_ORIGIN_ROW_LETTERS: 'AFAFAF',
    A: 'A'.charCodeAt(), // A
    I: 'I'.charCodeAt(), // I
    O: 'O'.charCodeAt(), // O
    V: 'V'.charCodeAt(), // V
    Z: 'Z'.charCodeAt(), // Z
    MIN_NORTHINGS: {
        'C': 1100000.0,
        'D': 2000000.0,
        'E': 2800000.0,
        'F': 3700000.0,
        'G': 4600000.0,
        'H': 5500000.0,
        'J': 6400000.0,
        'K': 7300000.0,
        'L': 8200000.0,
        'M': 9100000.0,
        'N': 0.0,
        'P': 800000.0,
        'Q': 1700000.0,
        'R': 2600000.0,
        'S': 3500000.0,
        'T': 4400000.0,
        'U': 5300000.0,
        'V': 6200000.0,
        'W': 7000000.0,
        'X': 7900000.0,
    }
};

export class MGRSUtils
{
    // UTM zones are grouped, and assigned to one of a group of 6 sets.

    /**
     * Conversion of lat/lon to MGRS.
     *
     * @param {float} latitude on a WGS84 ellipsoid in degrees.
     * @param {float} longitude on a WGS84 ellipsoid in degrees.
     * @param {int} accuracy Accuracy in digits (5 for 1 m, 4 for 10 m, 3 for
     *        100 m, 4 for 1000 m or 5 for 10000 m). Optional, default is 5.
     * @return {string} the MGRS string for the given location and accuracy.
     */
    static latLonToMGRS(latitude, longitude, accuracy)
    {
        accuracy = accuracy || 5; // default accuracy 1m
        if (accuracy < 0)
            accuracy = 5;

        return MGRSUtils.encode(MGRSUtils.latLongToUTM({
            lat: latitude,
            lon: longitude
        }), Math.max(1, Math.min(5, accuracy)));
    }

    /**
     * Conversion of MGRS to lat/lon.
     *
     * @param {string} mgrs MGRS string.
     * @return {array} An array with left (longitude), bottom (latitude), right
     *         (longitude) and top (latitude) values in WGS84, representing the
     *         bounding box for the provided MGRS reference.
     */
    static mgrsToBoundingBox(mgrs)
    {
        const bbox = MGRSUtils.UTMtoLatLong(MGRSUtils.decode(mgrs.toUpperCase()));
        return [bbox.left, bbox.bottom, bbox.right, bbox.top];
    }

    /**
     * Conversion of MGRS to lat/lon.
     *
     * @param {string} mgrs MGRS string.
     * @return {object} with latitude ('latitude') and longitude ('longitude') properties in
     *         degrees on the WGS84 ellipsoid
     */
    static mgrsToLatLon(mgrsStr)
    {
        const llbbox = MGRSUtils.mgrsToBoundingBox(mgrsStr);
        return {
            'latitude': (llbbox[3] + llbbox[1]) / 2,
            'longitude': (llbbox[2] + llbbox[0]) / 2
        };
    }

    /**
     * Converts a set of Longitude and Latitude co-ordinates to UTM
     * using the WGS84 ellipsoid.
     *
     * @private
     * @param {object} ll Object literal with lat and lon properties
     *        representing the WGS84 coordinate to be converted.
     * @return {object} Object literal containing the UTM value with easting,
     *        northing, zoneNumber and zoneLetter properties, and an optional
     *        accuracy property in digits. Returns null if the conversion failed.
     */
    static latLongToUTM(ll)
    {
        const lat = ll.lat;
        const long = ll.lon;
        const latRad = LatLongUtils.degToRad(lat);
        const longRad = LatLongUtils.degToRad(long);
        const a = 6378137.0; //ellip.radius;
        const eccSquared = 0.00669438; //ellip.eccsq;
        const k0 = 0.9996;

        // (int)
        let zoneNumber = Math.floor((long + 180) / 6) + 1;

        //Make sure the longitude 180.00 is in Zone 60
        if (long === 180)
        {
            zoneNumber = 60;
        }

        // Special zone for Norway
        if (lat >= 56.0 && lat < 64.0 && long >= 3.0 && long < 12.0)
        {
            zoneNumber = 32;
        }

        // Special zones for Svalbard
        if (lat >= 72.0 && lat < 84.0)
        {
            if (long >= 0.0 && long < 9.0)
            {
                zoneNumber = 31;
            }
            else if (long >= 9.0 && long < 21.0)
            {
                zoneNumber = 33;
            }
            else if (long >= 21.0 && long < 33.0)
            {
                zoneNumber = 35;
            }
            else if (long >= 33.0 && long < 42.0)
            {
                zoneNumber = 37;
            }
        }

        const longOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin in middle of zone
        const longOriginRad = LatLongUtils.degToRad(longOrigin);

        const eccPrimeSquared = (eccSquared) / (1 - eccSquared);

        const N = a / Math.sqrt(1 - eccSquared * Math.sin(latRad) * Math.sin(latRad));
        const T = Math.tan(latRad) * Math.tan(latRad);
        const C = eccPrimeSquared * Math.cos(latRad) * Math.cos(latRad);
        const A = Math.cos(latRad) * (longRad - longOriginRad);

        const M = a * ((1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256) * latRad - (3 * eccSquared / 8 + 3 * eccSquared * eccSquared / 32 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(2 * latRad) + (15 * eccSquared * eccSquared / 256 + 45 * eccSquared * eccSquared * eccSquared / 1024) * Math.sin(4 * latRad) - (35 * eccSquared * eccSquared * eccSquared / 3072) * Math.sin(6 * latRad));

        const utmEasting = (k0 * N * (A + (1 - T + C) * A * A * A / 6.0 + (5 - 18 * T + T * T + 72 * C - 58 * eccPrimeSquared) * A * A * A * A * A / 120.0) + 500000.0);

        let utmNorthing = (k0 * (M + N * Math.tan(latRad) * (A * A / 2 + (5 - T + 9 * C + 4 * C * C) * A * A * A * A / 24.0 + (61 - 58 * T + T * T + 600 * C - 330 * eccPrimeSquared) * A * A * A * A * A * A / 720.0)));
        if (lat < 0.0)
        {
            utmNorthing += 10000000.0; //10000000 meter offset for southern hemisphere
        }

        return {
            northing: Math.round(utmNorthing),
            easting: Math.round(utmEasting),
            zoneNumber: zoneNumber,
            zoneLetter: MGRSUtils.getLetterDesignator(lat)
        };
    }

    /**
     * Converts UTM coords to lat/long, using the WGS84 ellipsoid. This is a convenience
     * class where the Zone can be specified as a single string eg.'60N' which
     * is then broken down into the ZoneNumber and ZoneLetter.
     *
     * @private
     * @param {object} utm An object literal with northing, easting, zoneNumber
     *        and zoneLetter properties. If an optional accuracy property is
     *        provided (in meters), a bounding box will be returned instead of
     *        latitude and longitude.
     * @return {object} An object literal containing either lat and lon values
     *        (if no accuracy was provided), or top, right, bottom and left values
     *        for the bounding box calculated according to the provided accuracy.
     *        Returns null if the conversion failed.
     */
    static UTMtoLatLong(utm)
    {
        const UTMNorthing = utm.northing;
        const UTMEasting = utm.easting;
        const zoneLetter = utm.zoneLetter;
        const zoneNumber = utm.zoneNumber;
        // check the ZoneNummber is valid
        if (zoneNumber < 0 || zoneNumber > 60)
        {
            return null;
        }

        const k0 = 0.9996;
        const a = 6378137.0; //ellip.radius;
        const eccSquared = 0.00669438; //ellip.eccsq;
        const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));

        // remove 500,000 meter offset for longitude
        const x = UTMEasting - 500000.0;
        let y = UTMNorthing;

        // We must know somehow if we are in the Northern or Southern hemisphere, this is the only
        // time we use the letter So even if the Zone letter isn't exactly correct it should
        // indicate the hemisphere correctly
        if (zoneLetter < 'N')
        {
            y -= 10000000.0; // remove 10,000,000 meter offset used for southern hemisphere
        }

        // There are 60 zones with zone 1 being at West -180 to -174
        const longOrigin = (zoneNumber - 1) * 6 - 180 + 3; // +3 puts origin in middle of zone

        const eccPrimeSquared = (eccSquared) / (1 - eccSquared);

        const M = y / k0;
        const mu = M / (a * (1 - eccSquared / 4 - 3 * eccSquared * eccSquared / 64 - 5 * eccSquared * eccSquared * eccSquared / 256));

        const phi1Rad = mu + (3 * e1 / 2 - 27 * e1 * e1 * e1 / 32) * Math.sin(2 * mu) + (21 * e1 * e1 / 16 - 55 * e1 * e1 * e1 * e1 / 32) * Math.sin(4 * mu) + (151 * e1 * e1 * e1 / 96) * Math.sin(6 * mu);

        const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad));
        const T1 = Math.tan(phi1Rad) * Math.tan(phi1Rad);
        const C1 = eccPrimeSquared * Math.cos(phi1Rad) * Math.cos(phi1Rad);
        const R1 = a * (1 - eccSquared) / Math.pow(1 - eccSquared * Math.sin(phi1Rad) * Math.sin(phi1Rad), 1.5);
        const D = x / (N1 * k0);

        let lat = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * eccPrimeSquared) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * eccPrimeSquared - 3 * C1 * C1) * D * D * D * D * D * D / 720);
        lat = LatLongUtils.radToDeg(lat);

        let lon = (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * eccPrimeSquared + 24 * T1 * T1) * D * D * D * D * D / 120) / Math.cos(phi1Rad);
        lon = longOrigin + LatLongUtils.radToDeg(lon);

        let result;
        if (utm.accuracy)
        {
            const topRight = MGRSUtils.UTMtoLatLong({
                northing: utm.northing + utm.accuracy,
                easting: utm.easting + utm.accuracy,
                zoneLetter: utm.zoneLetter,
                zoneNumber: utm.zoneNumber
            });
            result = {
                top: topRight.lat,
                right: topRight.lon,
                bottom: lat,
                left: lon
            };
        }
        else
        {
            result = {lat, lon};
        }
        return result;
    }

    /**
     * Calculates the MGRS letter designator for the given latitude.
     *
     * @private
     * @param {number} lat The latitude in WGS84 to get the letter designator for.
     * @return {char} The letter designator.
     */
    static getLetterDesignator(lat)
    {
        // This is here as an error flag to show that the Latitude is outside MGRS limits
        let letterDesignator = 'Z';

        if ((84 >= lat) && (lat >= 72))
            letterDesignator = 'X';
        else if ((72 > lat) && (lat >= 64))
            letterDesignator = 'W';
        else if ((64 > lat) && (lat >= 56))
            letterDesignator = 'V';
        else if ((56 > lat) && (lat >= 48))
            letterDesignator = 'U';
        else if ((48 > lat) && (lat >= 40))
            letterDesignator = 'T';
        else if ((40 > lat) && (lat >= 32))
            letterDesignator = 'S';
        else if ((32 > lat) && (lat >= 24))
            letterDesignator = 'R';
        else if ((24 > lat) && (lat >= 16))
            letterDesignator = 'Q';
        else if ((16 > lat) && (lat >= 8))
            letterDesignator = 'P';
        else if ((8 > lat) && (lat >= 0))
            letterDesignator = 'N';
        else if ((0 > lat) && (lat >= -8))
            letterDesignator = 'M';
        else if ((-8 > lat) && (lat >= -16))
            letterDesignator = 'L';
        else if ((-16 > lat) && (lat >= -24))
            letterDesignator = 'K';
        else if ((-24 > lat) && (lat >= -32))
            letterDesignator = 'J';
        else if ((-32 > lat) && (lat >= -40))
            letterDesignator = 'H';
        else if ((-40 > lat) && (lat >= -48))
            letterDesignator = 'G';
        else if ((-48 > lat) && (lat >= -56))
            letterDesignator = 'F';
        else if ((-56 > lat) && (lat >= -64))
            letterDesignator = 'E';
        else if ((-64 > lat) && (lat >= -72))
            letterDesignator = 'D';
        else if ((-72 > lat) && (lat >= -80))
            letterDesignator = 'C';
        return letterDesignator;
    }

    /**
     * Encodes a UTM location as MGRS string.
     *
     * @private
     * @param {object} utm An object literal with easting, northing, zoneLetter, zoneNumber
     * @param {number} accuracy Accuracy in digits (1-5).
     * @return {string} MGRS string for the given UTM location.
     */
    static encode(utm, accuracy)
    {
        const seasting = '' + utm.easting;
        const snorthing = '' + utm.northing;

        return utm.zoneNumber + utm.zoneLetter + MGRSUtils.get100kID(utm.easting, utm.northing, utm.zoneNumber) + seasting.substr(seasting.length - 5, accuracy) + snorthing.substr(snorthing.length - 5, accuracy);
    }

    /**
     * Get the two letter 100k designator for a given UTM easting, northing and zone number value.
     *
     * @private
     * @param {number} easting
     * @param {number} northing
     * @param {number} zoneNumber
     * @return the two letter 100k designator for the given UTM location.
     */
    static get100kID(easting, northing, zoneNumber)
    {
        const setParm = MGRSUtils.get100kSetForZone(zoneNumber);
        const setColumn = Math.floor(easting / 100000);
        const setRow = Math.floor(northing / 100000) % 20;
        return MGRSUtils.getLetter100kID(setColumn, setRow, setParm);
    }

    /**
     * Given a UTM zone number, figure out the MGRS 100K set it is in.
     *
     * @private
     * @param {number} i An UTM zone number.
     * @return {number} the 100k set the UTM zone is in.
     */
    static get100kSetForZone(i)
    {
        let setParm = i % MGRS.NUM_100K_SETS;
        if (setParm === 0)
        {
            setParm = MGRS.NUM_100K_SETS;
        }
        return setParm;
    }

    /**
     * Get the two-letter MGRS 100k designator given information translated from the UTM northing,
     * easting and zone number.
     *
     * @private
     * @param {number} column the column index as it relates to the MGRS 100k set spreadsheet,
     *          created from the UTM easting. Values are 1-8.
     * @param {number} row the row index as it relates to the MGRS 100k set spreadsheet, created
     *          from the UTM northing value. Values are from 0-19.
     * @param {number} parm the set block, as it relates to the MGRS 100k set spreadsheet, created
     *          from the UTM zone. Values are from 1-60.
     * @return two letter MGRS 100k code.
     */
    static getLetter100kID(column, row, parm)
    {
        // colOrigin and rowOrigin are the letters at the origin of the set
        const index = parm - 1;
        const colOrigin = MGRS.SET_ORIGIN_COLUMN_LETTERS.charCodeAt(index);
        const rowOrigin = MGRS.SET_ORIGIN_ROW_LETTERS.charCodeAt(index);

        // colInt and rowInt are the letters to build to return
        let colInt = colOrigin + column - 1;
        let rowInt = rowOrigin + row;
        let rollover = false;

        if (colInt > MGRS.Z)
        {
            colInt = colInt - MGRS.Z + MGRS.A - 1;
            rollover = true;
        }

        if (colInt === MGRS.I || (colOrigin < MGRS.I && colInt > MGRS.I) || ((colInt > MGRS.I || colOrigin < MGRS.I) && rollover))
        {
            colInt++;
        }

        if (colInt === MGRS.O || (colOrigin < MGRS.O && colInt > MGRS.O) || ((colInt > MGRS.O || colOrigin < MGRS.O) && rollover))
        {
            colInt++;

            if (colInt === MGRS.I)
            {
                colInt++;
            }
        }

        if (colInt > MGRS.Z)
        {
            colInt = colInt - MGRS.Z + MGRS.A - 1;
        }

        if (rowInt > MGRS.V)
        {
            rowInt = rowInt - MGRS.V + MGRS.A - 1;
            rollover = true;
        }
        else
        {
            rollover = false;
        }

        if (((rowInt === MGRS.I) || ((rowOrigin < MGRS.I) && (rowInt > MGRS.I))) || (((rowInt > MGRS.I) || (rowOrigin < MGRS.I)) && rollover))
        {
            rowInt++;
        }

        if (((rowInt === MGRS.O) || ((rowOrigin < MGRS.O) && (rowInt > MGRS.O))) || (((rowInt > MGRS.O) || (rowOrigin < MGRS.O)) && rollover))
        {
            rowInt++;

            if (rowInt === MGRS.I)
            {
                rowInt++;
            }
        }

        if (rowInt > MGRS.V)
        {
            rowInt = rowInt - MGRS.V + MGRS.A - 1;
        }

        var twoLetter = String.fromCharCode(colInt) + String.fromCharCode(rowInt);
        return twoLetter;
    }

    /**
     * Decode the UTM parameters from a MGRS string.
     *
     * @private
     * @param {string} mgrsString an UPPERCASE coordinate string is expected.
     * @return {object} An object literal with easting, northing, zoneLetter, zoneNumber and
     *             accuracy (in meters) properties.
     */
    static decode(mgrsString)
    {
        if (mgrsString && mgrsString.length === 0)
        {
            throw ('MGRSPoint coverting from nothing');
        }

        const length = mgrsString.length;

        let hunK = null;
        let sb = '';
        let testChar;
        let i = 0;
        // get Zone number
        while (!(/[A-Z]/).test(testChar = mgrsString.charAt(i)))
        {
            if (i >= 2)
            {
                throw ('MGRSPoint bad conversion from: ' + mgrsString);
            }
            sb += testChar;
            i++;
        }

        var zoneNumber = parseInt(sb, 10);

        if (i === 0 || i + 3 > length)
        {
            // A good MGRS string has to be 4-5 digits long, ##AAA/#AAA at least.
            throw ('MGRSPoint bad conversion from: ' + mgrsString);
        }

        const zoneLetter = mgrsString.charAt(i++);

        // Should we check the zone letter here? Why not.
        if (zoneLetter <= 'A' || zoneLetter === 'B' || zoneLetter === 'Y' || zoneLetter >= 'Z' || zoneLetter === 'I' || zoneLetter === 'O')
        {
            throw ('MGRSPoint zone letter ' + zoneLetter + ' not handled: ' + mgrsString);
        }

        hunK = mgrsString.substring(i, i += 2);

        const set = MGRSUtils.get100kSetForZone(zoneNumber);
        const east100k = MGRSUtils.getEastingFromChar(hunK.charAt(0), set);
        let north100k = MGRSUtils.getNorthingFromChar(hunK.charAt(1), set);

        // We have a bug where the northing may be 2000000 too low. How do we know when to roll over?

        while (north100k < MGRSUtils.getMinNorthing(zoneLetter))
        {
            north100k += 2000000;
        }

        // calculate the char index for easting/northing separator
        const remainder = length - i;

        if (remainder % 2 !== 0)
        {
            throw ('MGRSPoint has to have an even number \nof digits after the zone letter and two 100km letters - front \nhalf for easting meters, second half for \nnorthing meters' + mgrsString);
        }

        const sep = remainder / 2;
        let sepEasting = 0.0;
        let sepNorthing = 0.0;
        let accuracyBonus, sepEastingString, sepNorthingString;
        if (sep > 0)
        {
            accuracyBonus = 100000.0 / Math.pow(10, sep);
            sepEastingString = mgrsString.substring(i, i + sep);
            sepEasting = parseFloat(sepEastingString) * accuracyBonus;
            sepNorthingString = mgrsString.substring(i + sep);
            sepNorthing = parseFloat(sepNorthingString) * accuracyBonus;
        }

        const easting = sepEasting + east100k;
        const northing = sepNorthing + north100k;

        return {
            easting: easting,
            northing: northing,
            zoneLetter: zoneLetter,
            zoneNumber: zoneNumber,
            accuracy: accuracyBonus
        };
    }

    /**
     * Given the first letter from a two-letter MGRS 100k zone, and given the MGRS table set for
     * the zone number, figure out the easting value that should be added to the other, secondary
     * easting value.
     *
     * @private
     * @param {char} e The first letter from a two-letter MGRS 100k zone.
     * @param {number} set The MGRS table set for the zone number.
     * @return {number} The easting value for the given letter and set.
     */
    static getEastingFromChar(e, set)
    {
        // colOrigin is the letter at the origin of the set for the column
        let curCol = MGRS.SET_ORIGIN_COLUMN_LETTERS.charCodeAt(set - 1);
        let eastingValue = 100000.0;
        let rewindMarker = false;

        while (curCol !== e.charCodeAt(0))
        {
            curCol++;
            if (curCol === MGRS.I)
            {
                curCol++;
            }
            if (curCol === MGRS.O)
            {
                curCol++;
            }
            if (curCol > MGRS.Z)
            {
                if (rewindMarker)
                {
                    throw ('Bad character: ' + e);
                }
                curCol = MGRS.A;
                rewindMarker = true;
            }
            eastingValue += 100000.0;
        }

        return eastingValue;
    }
    /**
     * Given the second letter from a two-letter MGRS 100k zone, and given the MGRS table set for
     * the zone number, figure out the northing value that should be added to the other, secondary
     * northing value. You have to remember that Northings are determined from the equator, and the
     * vertical cycle of letters mean a 2000000 additional northing meters. This happens approx.
     * every 18 degrees of latitude. This method does *NOT* count any additional northings. You
     * have to figure out how many 2000000 meters need to be added for the zone letter of the MGRS
     * coordinate.
     *
     * @private
     * @param {char} n Second letter of the MGRS 100k zone
     * @param {number} set The MGRS table set number, which is dependent on the UTM zone number.
     * @return {number} The northing value for the given letter and set.
     */
    static getNorthingFromChar(n, set)
    {
        if (n > 'V')
        {
            throw ('MGRSPoint given invalid Northing ' + n);
        }

        // rowOrigin is the letter at the origin of the set for the column
        let curRow = MGRS.SET_ORIGIN_ROW_LETTERS.charCodeAt(set - 1);
        let northingValue = 0.0;
        let rewindMarker = false;

        while (curRow !== n.charCodeAt(0))
        {
            curRow++;
            if (curRow === MGRS.I)
            {
                curRow++;
            }
            if (curRow === MGRS.O)
            {
                curRow++;
            }
            // fixing a bug making whole application hang in this loop when 'n' is a wrong character
            if (curRow > MGRS.V)
            {
                if (rewindMarker)
                { // making sure that this loop ends
                    throw ('Bad character: ' + n);
                }
                curRow = MGRS.A;
                rewindMarker = true;
            }
            northingValue += 100000.0;
        }

        return northingValue;
    }

    /**
     * The function getMinNorthing returns the minimum northing value of a MGRS zone.
     *
     * Ported from Geotrans' c Lattitude_Band_Value structure table.
     *
     * @private
     * @param {char} zoneLetter The MGRS zone to get the min northing for.
     * @return {number}
     */
    static getMinNorthing(zoneLetter)
    {
        const northing = MGRSUtils.MIN_NORTHINGS[zoneLetter];
        if (northing != 'undefined')
        {
            return northing;
        }
        else
        {
            throw ('Invalid zone letter: ' + zoneLetter);
        }
    }
}
