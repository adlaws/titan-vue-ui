import DataUtils from './data-utils.js';

// Standard International Units
//------------------------
// Unit:       Quantity:
// second      time
// metre       length
// degree      angle
// kilogram    mass
// celsius     tempCelsius (NOTE: SI unit is Kelvin, but is not really used in out usage contexts)

export const DURATION_UNITS = {
    SECONDS:      {id: 'seconds',      full: 'seconds',      abbr: 's', isSIUnit: true },
    MILLISECONDS: {id: 'milliseconds', full: 'milliseconds', abbr: 'ms'},
    MINUTES:      {id: 'minutes',      full: 'minutes',      abbr: 'm'},
    HOURS:        {id: 'hours',        full: 'hours',        abbr: 'h'},
    DAYS:         {id: 'days',         full: 'days',         abbr: 'd'},
    WEEKS:        {id: 'weeks',        full: 'weeks',        abbr: 'w'},
};
export const DURATION_UNIT_OPTIONS = DataUtils.dictToList(DURATION_UNITS, 'id', 'unit');

export const LENGTH_UNITS = {
    METERS:         {id: 'meters',        full: 'meters',         abbr: 'm', isSIUnit: true },
    CENTIMETERS:    {id: 'centimeters',   full: 'centimeters',    abbr: 'cm'},
    INCHES:         {id: 'inches',        full: 'inches',         abbr: 'in'},
    FEET:           {id: 'feet',          full: 'feet',           abbr: 'ft'},
    YARDS:          {id: 'yards',         full: 'yards',          abbr: 'yd'},
    MILES:          {id: 'miles',         full: 'miles',          abbr: 'ml'},
    NAUTICAL_MILES: {id: 'nauticalmiles', full: 'nautical miles', abbr: 'nm'},
};
export const LENGTH_UNIT_OPTIONS = DataUtils.dictToList(LENGTH_UNITS, 'id', 'unit');

export const TEMPERATURE_UNITS = {
    CELSIUS:    {id: 'celsius',    full: 'Celsius',    abbr:'°C', isSIUnit: true },
    FAHRENHEIT: {id: 'fahrenheit', full: 'Fahrenheit', abbr:'°F'},
    KELVIN:     {id: 'kelvin',     full: 'Kelvin',     abbr:'°K'},
};
export const TEMPERATURE_UNIT_OPTIONS = DataUtils.dictToList(TEMPERATURE_UNITS, 'id', 'unit');

export const MASS_UNITS = {
    KILOGRAMS: {id: 'kilograms', full: 'kilograms', abbr: 'kg', isSIUnit: true },
    POUNDS:    {id: 'pounds',    full: 'pounds',    abbr: 'lb'},
};
export const MASS_UNIT_OPTIONS = DataUtils.dictToList(MASS_UNITS, 'id', 'unit');

export const SPEED_UNITS = {
    METERS_PER_SECOND:   {id: 'meters-per-second',   full: 'meters per second',   abbr: 'm/s', isSIUnit: true },
    FEET_PER_SECOND:     {id: 'feet-per-second',     full: 'feet per second',     abbr: 'ft/s'},
    KILOMETERS_PER_HOUR: {id: 'kilometers-per-hour', full: 'kilometers per hour', abbr: 'kph'},
    MILES_PER_HOUR:      {id: 'miles-per-hour',      full: 'miles per hour',      abbr: 'mph'},
    KNOTS:               {id: 'knots',               full: 'knots',               abbr: 'kt'},
};
export const SPEED_UNIT_OPTIONS = DataUtils.dictToList(SPEED_UNITS, 'id', 'unit');

export const PRESSURE_UNITS = {
    PASCAL:                 {id: 'pascal',                 full: 'Pascal',                 abbr: 'Pa', isSIUnit: true },
    KILOPASCAL:             {id: 'kilopascal',             full: 'kilopascal',             abbr: 'kPa'},
    POUNDS_PER_SQUARE_INCH: {id: 'pounds-per-square-inch', full: 'pounds per square inch', abbr: 'psi'},
    BAR:                    {id: 'bar',                    full: 'bar',                    abbr: 'bar'},
    ATMOSPHERES:            {id: 'atmospheres',            full: 'atmospheres',            abbr: 'atm'},
};
export const PRESSURE_UNIT_OPTIONS = DataUtils.dictToList(PRESSURE_UNITS, 'id', 'unit');

export const Conversions =
{
    duration:
    {
        toStandard:
        {
            // convert time in some unit into standard units (seconds)
            [DURATION_UNITS.SECONDS.id]:      (x) => x,
            [DURATION_UNITS.MILLISECONDS.id]: (x) => x / 1000.0,
            [DURATION_UNITS.MINUTES.id]:      (x) => x / 60.0,
            [DURATION_UNITS.HOURS.id]:        (x) => x / 3600.0,
            [DURATION_UNITS.DAYS.id]:         (x) => x / 86400.0,
            [DURATION_UNITS.WEEKS.id]:        (x) => x / 604800.0,
        },
        fromStandard:
        {
            // convert time from standard units (seconds) into some other unit
            [DURATION_UNITS.SECONDS.id]:      (x) => x,
            [DURATION_UNITS.MILLISECONDS.id]: (x) => x * 1000.0,
            [DURATION_UNITS.MINUTES.id]:      (x) => x * 60.0,
            [DURATION_UNITS.HOURS.id]:        (x) => x * 3600.0,
            [DURATION_UNITS.DAYS.id]:         (x) => x * 86400.0,
            [DURATION_UNITS.WEEKS.id]:        (x) => x * 604800.0,
        },
    },
    length:
    {
        toStandard:
        {
            // convert length in some unit into standard units (meters)
            [LENGTH_UNITS.METERS.id]:         (x) => x,
            [LENGTH_UNITS.CENTIMETERS.id]:    (x) => x / 100.0,
            [LENGTH_UNITS.INCHES.id]:         (x) => x / 39.3701,
            [LENGTH_UNITS.FEET.id]:           (x) => x / 3.28084,
            [LENGTH_UNITS.YARDS.id]:          (x) => x / 1.09361,
            [LENGTH_UNITS.MILES.id]:          (x) => x * 1609.34,
            [LENGTH_UNITS.NAUTICAL_MILES.id]: (x) => x * 1852,
        },
        fromStandard:
        {
            // convert length from standard units (meters) into some other unit
            [LENGTH_UNITS.METERS.id]:         (x) => x,
            [LENGTH_UNITS.CENTIMETERS.id]:    (x) => x * 100,
            [LENGTH_UNITS.INCHES.id]:         (x) => x * 39.3701,
            [LENGTH_UNITS.FEET.id]:           (x) => x * 3.28084,
            [LENGTH_UNITS.YARDS.id]:          (x) => x * 1.09361,
            [LENGTH_UNITS.MILES.id]:          (x) => x / 1609.34,
            [LENGTH_UNITS.NAUTICAL_MILES.id]: (x) => x / 1852.0,
        },
    },
    temperature:
    {
        toStandard:
        {
            // convert temperature in some unit into standard units (celsius)
            [TEMPERATURE_UNITS.CELSIUS.id]:    (x) => x,
            [TEMPERATURE_UNITS.FAHRENHEIT.id]: (x) => (x - 32.0) * 5.0/9.0,
            [TEMPERATURE_UNITS.KELVIN.id]:     (x) => x - 273.15,
        },
        fromStandard:
        {
            // convert temperature from standard units (celsius) into some other unit
            [TEMPERATURE_UNITS.CELSIUS.id]:    (x) => x,
            [TEMPERATURE_UNITS.FAHRENHEIT.id]: (x) => 32 + (x * 9.0/5.0),
            [TEMPERATURE_UNITS.KELVIN.id]:     (x) => x + 273.15,
        },
    },
    mass:
    {
        toStandard:
        {
            // convert mass in some unit into standard units (kilograms)
            [MASS_UNITS.KILOGRAMS.id]: (x) => x,
            [MASS_UNITS.POUNDS.id]:    (x) => x / 2.20462,
        },
        fromStandard:
        {
            // convert mass from standard units (kilograms) into some other unit
            [MASS_UNITS.KILOGRAMS.id]: (x) => x,
            [MASS_UNITS.POUNDS.id]:    (x) => x * 2.20462,
        },
    },
    speed:
    {
        toStandard:
        {
            // convert speed in some unit into standard units (meters per second)
            [SPEED_UNITS.METERS_PER_SECOND.id]:   (x) => x,
            [SPEED_UNITS.FEET_PER_SECOND.id]:     (x) => x / 3.28084,
            [SPEED_UNITS.KILOMETERS_PER_HOUR.id]: (x) => x / 3.6,
            [SPEED_UNITS.MILES_PER_HOUR.id]:      (x) => x / 2.23694,
            [SPEED_UNITS.KNOTS.id]:               (x) => x / 1.94384,
        },
        fromStandard:
        {
            // convert speed from standard units (meters per second) into some other unit
            [SPEED_UNITS.METERS_PER_SECOND.id]:   (x) => x,
            [SPEED_UNITS.FEET_PER_SECOND.id]:     (x) => x * 3.28084,
            [SPEED_UNITS.KILOMETERS_PER_HOUR.id]: (x) => x * 3.6,
            [SPEED_UNITS.MILES_PER_HOUR.id]:      (x) => x * 2.23694,
            [SPEED_UNITS.KNOTS.id]:               (x) => x * 1.94384,
        },
    },
    pressure:
    {
        toStandard:
        {
            // convert pressure in some unit into standard units (pascal)
            [PRESSURE_UNITS.PASCAL.id]:                 (x) => x,
            [PRESSURE_UNITS.KILOPASCAL.id]:             (x) => x * 1000.0,
            [PRESSURE_UNITS.POUNDS_PER_SQUARE_INCH.id]: (x) => x * 6894.76,
            [PRESSURE_UNITS.BAR.id]:                    (x) => x * 100000,
            [PRESSURE_UNITS.ATMOSPHERES.id]:            (x) => x * 101325,
        },
        fromStandard:
        {
            // convert pressure from standard units (pascal) into some other unit
            [PRESSURE_UNITS.PASCAL.id]:                 (x) => x,
            [PRESSURE_UNITS.KILOPASCAL.id]:             (x) => x / 1000.0,
            [PRESSURE_UNITS.POUNDS_PER_SQUARE_INCH.id]: (x) => x / 6894.76,
            [PRESSURE_UNITS.BAR.id]:                    (x) => x / 100000,
            [PRESSURE_UNITS.ATMOSPHERES.id]:            (x) => x / 101325,
        },
    },
};

export default class Convert
{
    static time(value, fromUnits, toUnits)
    {
        return Convert.__convert(value, fromUnits, toUnits, Conversions.duration);
    }

    static length(value, fromUnits, toUnits)
    {
        return Convert.__convert(value, fromUnits, toUnits, Conversions.length);
    }

    static temperature(value, fromUnits, toUnits)
    {
        return Convert.__convert(value, fromUnits, toUnits, Conversions.temperature);
    }

    static mass(value, fromUnits, toUnits)
    {
        return Convert.__convert(value, fromUnits, toUnits, Conversions.mass);
    }

    static speed(value, fromUnits, toUnits)
    {
        return Convert.__convert(value, fromUnits, toUnits, Conversions.speed);
    }

    static pressure(value, fromUnits, toUnits)
    {
        return Convert.__convert(value, fromUnits, toUnits, Conversions.pressure);
    }

    static __convert(value, fromUnits, toUnits, converters)
    {
        if(fromUnits === toUnits)
        {
            // from and to units are the same - no conversion is necessary
            return value;
        }

        // find the function to convert value to standard units
        const toStandard = converters.toStandard[fromUnits];
        // find the function to convert standard units to desired units
        const fromStandard = converters.fromStandard[toUnits];

        if(!toStandard || !fromStandard)
        {
            // we don't know how to perform that conversion.
            let msg = `Cannot convert value ${value} from '${fromUnits}' to '${toUnits}'. `;
            if(!toStandard)
                msg += `Unknown units '${fromUnits}'`;
            if(!fromStandard)
            {
                if(!toStandard)
                    msg += ` and '${toUnits}'`;
                else
                    msg += `Unknown units '${toUnits}'`;
            }
            throw new Error(msg);
        }

        // convert value from its units into standard units
        const inStandard = toStandard(value);
        // ...and then to desired units
        return fromStandard(inStandard);
    }
}
