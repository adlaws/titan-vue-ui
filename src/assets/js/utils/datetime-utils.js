export default class DateTimeUtils
{
    static makeUtcDateTime(year, month=0, day=1, hour=0, minute=0, second=0, ms=0)
    {
        const localDate = new Date(year, month, day, hour, minute, second, ms);
        const offset = localDate.getTimezoneOffset() * 60 * 1000;
        return new Date(localDate.getTime() - offset);
    }

    static dateTimeAdd(datetime, params={days:0,hours:0,minutes:0,seconds:0,ms:0})
    {
        const delta = (params.days||0) * 24*60*60*1000 +
                      (params.hours||0) * 60*60*1000 +
                      (params.minutes||0) * 60*1000 +
                      (params.seconds||0) * 1000 +
                      (params.ms||0);
        return new Date(datetime.getTime() + delta);
    }
}