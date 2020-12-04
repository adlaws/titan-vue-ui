export default class DateTimeUtils
{
    static makeUtcDateTime(year, month=0, day=1, hour=0, minute=0, second=0, ms=0)
    {
        const localDate = new Date(year, month, day, hour, minute, second, ms);
        const offset = localDate.getTimezoneOffset() * 60 * 1000;
        return new Date(localDate.getTime() - offset);
    }

    static dhmsToSeconds(params={days:0,hours:0,minutes:0,seconds:0,milliseconds:0})
    {
        let total = 0;
        if(!isNaN(params.days))
            total += params.days * DateTimeUtils.Duration.DAY_SECONDS;
        if(!isNaN(params.hours))
            total += params.hours * DateTimeUtils.Duration.HOUR_SECONDS;
        if(!isNaN(params.minutes))
            total += params.minutes * DateTimeUtils.Duration.MINUTE_SECONDS;
        if(!isNaN(params.seconds))
            total += params.seconds;
        if(!isNaN(params.milliseconds))
            total += (params.milliseconds / 1000.0);
        return total;
    }

    static secondsToDHMS(duration)
    {
        duration = isNaN(duration) ? 0 : duration;

        const isNeg = duration < 0;
        duration = isNeg ? -duration : duration;

        let seconds = Math.floor(duration / 1000.0) | 0;
        let milliseconds = duration - (seconds * 1000.0);

        let days = Math.floor(seconds / DateTimeUtils.Duration.DAY_SECONDS) | 0;
        seconds -= days * DateTimeUtils.Duration.DAY_SECONDS;

        let hours = Math.floor(seconds / DateTimeUtils.Duration.HOUR_SECONDS) | 0;
        seconds -= hours * DateTimeUtils.Duration.HOUR_SECONDS;

        let minutes = Math.floor(seconds / DateTimeUtils.Duration.MINUTE_SECONDS) | 0;
        seconds -= minutes * DateTimeUtils.Duration.MINUTE_SECONDS;

        seconds = seconds | 0;

        if(isNeg)
        {
            days = -days;
            hours = -hours;
            minutes = -minutes;
            seconds = -seconds;
            milliseconds = -milliseconds;
        }

        return {days, hours, minutes, seconds, milliseconds};
    }

    static add(datetime, params={days:0,hours:0,minutes:0,seconds:0,milliseconds:0})
    {
        const durationMs =  DateTimeUtils.dhmsToSeconds(params) * 1000;
        return new Date(datetime.getTime() + durationMs);
    }
}

export class DateTimeMath
{
}

const Duration = {
    MINUTE_SECONDS: 60,
    HOUR_SECONDS: 60 * 60,
    DAY_SECONDS: 60 * 60 * 24,
    WEEK_SECONDS: 60 * 60 * 24 * 7,
    SECOND_MILLISECONDS: 1000,
    MINUTE_MILLISECONDS: 60 * 1000,
    HOUR_MILLISECONDS: 60 * 60 * 1000,
    DAY_MILLISECONDS: 60 * 60 * 24 * 1000,
    WEEK_MILLISECONDS: 60 * 60 * 24 * 7 * 1000,
};
Object.freeze(Duration);

DateTimeUtils.Duration = Duration;