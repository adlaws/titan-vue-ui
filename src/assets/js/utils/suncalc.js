/*
 Based on Vladimir Agafonkin's SunCalc - a JavaScript library for calculating
 sun/moon position and light phases.
 https://github.com/mourner/suncalc
 */

// shortcuts for easier to read formulas
const PI   = Math.PI,
    sin  = Math.sin,
    cos  = Math.cos,
    tan  = Math.tan,
    asin = Math.asin,
    atan = Math.atan2,
    acos = Math.acos,
    rad  = PI / 180,
    dayMs = 1000 * 60 * 60 * 24,
    J1970 = 2440588,
    J2000 = 2451545,
    J0 = 0.0009,
    e = rad * 23.4397; // obliquity of the Earth

// sun calculations are based on http://aa.quae.nl/en/reken/zonpositie.html formulas
export default class SunCalc
{
    /**
     * adds a custom time to the times config
     */
    static addTime(angle, riseName, setName)
    {
        SunCalc.times.push([angle, riseName, setName]);
    }

    /**
     * Calculates sun position for a given date and latitude/longitude (degrees)
     */
    static getSunPosition(date, lat, lng)
    {
        const lw  = rad * -lng,
            phi = rad * lat,
            d   = SunCalc._toDays(date),
            c  = SunCalc._sunCoords(d),
            H  = SunCalc._siderealTime(d, lw) - c.ra;
        return {
            _azimuth: SunCalc._azimuth(H, phi, c.dec),
            _altitude: SunCalc._altitude(H, phi, c.dec)
        };
    }

    /**
     * Calculates sun times for a given date, latitude/longitude, and, optionally,
     * the observer height (in meters) relative to the horizon
     */
    static getSunTimes(date, lat, lng, height = 0)
    {
        height = height || 0;

        const lw = rad * -lng,
            phi = rad * lat,
            dh = SunCalc._observerAngle(height),
            d = SunCalc._toDays(date),
            n = SunCalc._julianCycle(d, lw),
            ds = SunCalc._approxTransit(0, lw, n),
            M = SunCalc._solarMeanAnomaly(ds),
            L = SunCalc._eclipticLongitude(M),
            dec = SunCalc._declination(L, 0),
            Jnoon = SunCalc._solarTransitJ(ds, M, L);

        const result = {
            solarNoon: SunCalc._fromJulian(Jnoon),
            nadir: SunCalc._fromJulian(Jnoon - 0.5)
        };

        const len = SunCalc.times.length;
        for (let i = 0; i < len; i ++)
        {
            const time = SunCalc.times[i];
            const h0 = (time[0] + dh) * rad;

            const Jset = SunCalc._getSetJ(h0, lw, phi, dec, n, M, L);
            const Jrise = Jnoon - (Jset - Jnoon);

            result[time[1]] = SunCalc._fromJulian(Jrise);
            result[time[2]] = SunCalc._fromJulian(Jset);
        }

        return result;
    }

    static getMoonPosition(date, lat, lng)
    {
        const lw  = rad * -lng,
            phi = rad * lat,
            d   = SunCalc._toDays(date),
            c = SunCalc._moonCoords(d),
            H = SunCalc._siderealTime(d, lw) - c.ra,
            // formula 14.1 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
            pa = atan(sin(H), tan(phi) * cos(c.dec) - sin(c.dec) * cos(H));

        let h = SunCalc._altitude(H, phi, c.dec);
        h = h + SunCalc._astroRefraction(h); // _altitude correction for refraction

        return {
            _azimuth: SunCalc._azimuth(H, phi, c.dec),
            _altitude: h,
            distance: c.dist,
            parallacticAngle: pa
        };
    }

    // calculations for illumination parameters of the moon,
    // based on http://idlastro.gsfc.nasa.gov/ftp/pro/astro/mphase.pro formulas and
    // Chapter 48 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
    static getMoonIllumination(date)
    {
        const d = SunCalc._toDays(date || new Date()),
            s = SunCalc._sunCoords(d),
            m = SunCalc._moonCoords(d),
            sdist = 149598000, // distance from Earth to Sun in km
            phi = acos(sin(s.dec) * sin(m.dec) + cos(s.dec) * cos(m.dec) * cos(s.ra - m.ra)),
            inc = atan(sdist * sin(phi), m.dist - sdist * cos(phi)),
            angle = atan(cos(s.dec) * sin(s.ra - m.ra), sin(s.dec) * cos(m.dec) -
                    cos(s.dec) * sin(m.dec) * cos(s.ra - m.ra));
        return {
            fraction: (1 + cos(inc)) / 2,
            phase: 0.5 + 0.5 * inc * (angle < 0 ? -1 : 1) / Math.PI,
            angle: angle
        };
    }

    // calculations for moon rise/set times are based on http://www.stargazing.net/kepler/moonrise.html article
    static getMoonTimes(date, lat, lng, inUTC=true)
    {
        const t = new Date(date);
        if (inUTC)
            t.setUTCHours(0, 0, 0, 0);
        else
            t.setHours(0, 0, 0, 0);

        const hc = 0.133 * rad;
        let h0 = SunCalc.getMoonPosition(t, lat, lng)._altitude - hc;

        // go in 2-hour chunks, each time seeing if a 3-point quadratic curve crosses zero (which means rise or set)
        let rise = 0;
        let set = 0;
        let ye = 0;
        for(let i = 1; i <= 24; i += 2)
        {
            const h1 = SunCalc.getMoonPosition(SunCalc._hoursLater(t, i), lat, lng)._altitude - hc;
            const h2 = SunCalc.getMoonPosition(SunCalc._hoursLater(t, i + 1), lat, lng)._altitude - hc;
            const a = (h0 + h2) / 2 - h1;
            const b = (h2 - h0) / 2;
            const xe = -b / (2 * a);
            ye = (a * xe + b) * xe + h1;
            const d = b * b - 4 * a * h1;

            let roots = 0,
                x1 = 0,
                x2 = 0;
            if (d >= 0)
            {
                const dx = Math.sqrt(d) / (Math.abs(a) * 2);
                let x1 = xe - dx;
                const x2 = xe + dx;
                if (Math.abs(x1) <= 1)
                    roots++;
                if (Math.abs(x2) <= 1)
                    roots++;
                if (x1 < -1)
                    x1 = x2;
            }

            if (roots === 1)
            {
                if (h0 < 0)
                    rise = i + x1;
                else
                    set = i + x1;
            }
            else if (roots === 2)
            {
                rise = i + (ye < 0 ? x2 : x1);
                set = i + (ye < 0 ? x1 : x2);
            }

            if (rise && set)
                break;

            h0 = h2;
        }

        const result = {};

        if (rise) result.rise = SunCalc._hoursLater(t, rise);
        if (set) result.set = SunCalc._hoursLater(t, set);
        if (!rise && !set) result[ye > 0 ? 'alwaysUp' : 'alwaysDown'] = true;
        return result;
    }

    // date/time constants and conversions
    static _toJulian(date) { return date.valueOf() / dayMs - 0.5 + J1970; }
    static _fromJulian(j)  { return new Date((j + 0.5 - J1970) * dayMs); }
    static _toDays(date)   { return SunCalc._toJulian(date) - J2000; }
    // general calculations for position
    static _rightAscension(l, b) { return atan(sin(l) * cos(e) - tan(b) * sin(e), cos(l)); }
    static _declination(l, b)    { return asin(sin(b) * cos(e) + cos(b) * sin(e) * sin(l)); }
    static _azimuth(H, phi, dec)  { return atan(sin(H), cos(H) * sin(phi) - tan(dec) * cos(phi)); }
    static _altitude(H, phi, dec) { return asin(sin(phi) * sin(dec) + cos(phi) * cos(dec) * cos(H)); }
    static _siderealTime(d, lw) { return rad * (280.16 + 360.9856235 * d) - lw; }
    static _astroRefraction(h)
    {
        if (h < 0) // the following formula works for positive _altitudes only.
            h = 0; // if h = -0.08901179 a div/0 would occur.
        // formula 16.4 of "Astronomical Algorithms" 2nd edition by Jean Meeus (Willmann-Bell, Richmond) 1998.
        // 1.02 / tan(h + 10.26 / (h + 5.10)) h in degrees, result in arc minutes -> converted to rad:
        return 0.0002967 / Math.tan(h + 0.00312536 / (h + 0.08901179));
    }
    // general sun calculations
    static _solarMeanAnomaly(d) { return rad * (357.5291 + 0.98560028 * d); }
    static _eclipticLongitude(M)
    {
        const C = rad * (1.9148 * sin(M) + 0.02 * sin(2 * M) + 0.0003 * sin(3 * M)), // equation of center
            P = rad * 102.9372; // perihelion of the Earth
        return M + C + P + PI;
    }
    static _sunCoords(d)
    {
        const M = SunCalc._solarMeanAnomaly(d),
            L = SunCalc._eclipticLongitude(M);
        return {
            dec: SunCalc._declination(L, 0),
            ra: SunCalc._rightAscension(L, 0)
        };
    }
    // calculations for sun times
    static _julianCycle(d, lw) { return Math.round(d - J0 - lw / (2 * PI)); }
    static _approxTransit(Ht, lw, n) { return J0 + (Ht + lw) / (2 * PI) + n; }
    static _solarTransitJ(ds, M, L)  { return J2000 + ds + 0.0053 * sin(M) - 0.0069 * sin(2 * L); }
    static _hourAngle(h, phi, d) { return acos((sin(h) - sin(phi) * sin(d)) / (cos(phi) * cos(d))); }
    static _observerAngle(height) { return -2.076 * Math.sqrt(height) / 60; }
    static _hoursLater(date, h)
    {
        return new Date(date.valueOf() + h * dayMs / 24);
    }
    // returns set time for the given sun altitude
    static _getSetJ(h, lw, phi, dec, n, M, L)
    {
        const w = SunCalc._hourAngle(h, phi, dec),
            a = SunCalc._approxTransit(w, lw, n);
        return SunCalc._solarTransitJ(a, M, L);
    }
    // moon calculations, based on http://aa.quae.nl/en/reken/hemelpositie.html formulas
    static _moonCoords(d)
    {
        // geocentric ecliptic coordinates of the moon
        const L = rad * (218.316 + 13.176396 * d), // ecliptic longitude
            M = rad * (134.963 + 13.064993 * d), // mean anomaly
            F = rad * (93.272 + 13.229350 * d),  // mean distance
            l  = L + rad * 6.289 * sin(M), // longitude
            b  = rad * 5.128 * sin(F),     // latitude
            dt = 385001 - 20905 * cos(M);  // distance to the moon in km

        return {
            ra: SunCalc._rightAscension(l, b),
            dec: SunCalc._declination(l, b),
            dist: dt
        };
    }
}

SunCalc.times = [
    [-0.833, 'sunrise',       'sunset'      ],
    [  -0.3, 'sunriseEnd',    'sunsetStart' ],
    [    -6, 'dawn',          'dusk'        ],
    [   -12, 'nauticalDawn',  'nauticalDusk'],
    [   -18, 'nightEnd',      'night'       ],
    [     6, 'goldenHourEnd', 'goldenHour'  ]
];
