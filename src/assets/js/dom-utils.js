export default class DOMUtils
{
    static hasClass(elm, klass)
    {
        return elm.className.match(new RegExp('(\\s|^)'+klass+'(\\s|$)'));
    }
    static addClass(elm, klass)
    {
        DOMUtils.toggleClass(elm, klass, true);
    }
    static removeClass(elm, klass)
    {
        DOMUtils.toggleClass(elm, klass, false);
    }
    static toggleClass(elm, klass, makeActive)
    {
        var wholeWordRegExp = new RegExp('(?:\\W|^)('+klass+')(?:\\W|$)','g');
        if( typeof(makeActive) === 'undefined')
            makeActive = (wholeWordRegExp.exec(elm.className)===null);
        if(makeActive)
            elm.className += wholeWordRegExp.exec(elm.className)===null?' '+klass:'';
        else
            elm.className = elm.className.replace(wholeWordRegExp, ' ');
        elm.className = elm.className.trim();
    }
}
