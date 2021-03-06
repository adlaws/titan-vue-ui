// Precomputed linear color channel values, for use in contrast calculations.
// See https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
const LINEAR_CHANNEL_VALUES = [0, .0003035269835488375, .000607053967097675, .0009105809506465125, .00121410793419535, .0015176349177441874, .001821161901293025, .0021246888848418626, .0024282158683907, .0027317428519395373, .003035269835488375, .003346535763899161, .003676507324047436, .004024717018496307, .004391442037410293, .004776953480693729, .005181516702338386, .005605391624202723, .006048833022857054, .006512090792594475, .006995410187265387, .007499032043226175, .008023192985384994, .008568125618069307, .009134058702220787, .00972121732023785, .010329823029626936, .010960094006488246, .011612245179743885, .012286488356915872, .012983032342173012, .013702083047289686, .014443843596092545, .01520851442291271, .01599629336550963, .016807375752887384, .017641954488384078, .018500220128379697, .019382360956935723, .0202885630566524, .021219010376003555, .022173884793387385, .02315336617811041, .024157632448504756, .02518685962736163, .026241221894849898, .027320891639074894, .028426039504420793, .0295568344378088, .030713443732993635, .03189603307301153, .033104766570885055, .03433980680868217, .03560131487502034, .03688945040110004, .0382043715953465, .03954623527673284, .04091519690685319, .042311410620809675, .043735029256973465, .04518620438567554, .046665086336880095, .04817182422688942, .04970656598412723, .05126945837404324, .052860647023180246, .05448027644244237, .05612849004960009, .05780543019106723, .0595112381629812, .06124605423161761, .06301001765316767, .06480326669290577, .06662593864377289, .06847816984440017, .07036009569659588, .07227185068231748, .07421356838014963, .07618538148130785, .07818742180518633, .08021982031446832, .0822827071298148, .08437621154414882, .08650046203654976, .08865558628577294, .09084171118340768, .09305896284668745, .0953074666309647, .09758734714186246, .09989872824711389, .10224173308810132, .10461648409110419, .10702310297826761, .10946171077829933, .1119324278369056, .11443537382697373, .11697066775851084, .11953842798834562, .12213877222960187, .12477181756095049, .12743768043564743, .1301364766903643, .13286832155381798, .13563332965520566, .13843161503245183, .14126329114027164, .14412847085805777, .14702726649759498, .14995978981060856, .15292615199615017, .1559264637078274, .1589608350608804, .162029375639111, .1651321945016676, .16826940018969075, .1714411007328226, .17464740365558504, .17788841598362912, .18116424424986022, .184474994500441, .18782077230067787, .19120168274079138, .1946178304415758, .19806931955994886, .20155625379439707, .20507873639031693, .20863687014525575, .21223075741405523, .21586050011389926, .2195261997292692, .2232279573168085, .22696587351009836, .23074004852434915, .23455058216100522, .238397573812271, .24228112246555486, .24620132670783548, .25015828472995344, .25415209433082675, .2581828529215958, .26225065752969623, .26635560480286247, .2704977910130658, .27467731206038465, .2788942634768104, .2831487404299921, .2874408377269175, .29177064981753587, .2961382707983211, .3005437944157765, .3049873140698863, .30946892281750854, .31398871337571754, .31854677812509186, .32314320911295075, .3277780980565422, .33245153634617935, .33716361504833037, .3419144249086609, .3467040563550296, .35153259950043936, .3564001441459435, .3613067797835095, .3662525955988395, .3712376804741491, .3762621229909065, .38132601143253014, .386429433787049, .39157247774972326, .39675523072562685, .4019777798321958, .4072402119017367, .41254261348390375, .4178850708481375, .4232676699860717, .4286904966139066, .43415363617474895, .4396571738409188, .44520119451622786, .45078578283822346, .45641102318040466, .4620769996544071, .467783796112159, .47353149614800955, .4793201831008268, .4851499400560704, .4910208498478356, .4969329950608704, .5028864580325687, .5088813208549338, .5149176653765214, .5209955732043543, .5271151257058131, .5332764040105052, .5394794890121072, .5457244613701866, .5520114015120001, .5583403896342679, .5647115057049292, .5711248294648731, .5775804404296506, .5840784178911641, .5906188409193369, .5972017883637634, .6038273388553378, .6104955708078648, .6172065624196511, .6239603916750761, .6307571363461468, .6375968739940326, .6444796819705821, .6514056374198242, .6583748172794485, .665387298282272, .6724431569576875, .6795424696330938, .6866853124353135, .6938717612919899, .7011018919329731, .7083757798916868, .7156935005064807, .7230551289219693, .7304607400903537, .7379104087727308, .7454042095403874, .7529422167760779, .7605245046752924, .768151147247507, .7758222183174236, .7835377915261935, .7912979403326302, .799102738014409, .8069522576692516, .8148465722161012, .8227857543962835, .8307698767746546, .83879901174074, .846873231509858, .8549926081242338, .8631572134541023, .8713671191987972, .8796223968878317, .8879231178819663, .8962693533742664, .9046611743911496, .9130986517934192, .9215818562772946, .9301108583754237, .938685728457888, .9473065367331999, .9559733532492861, .9646862478944651, .9734452903984125, .9822505503331171, .9911020971138298, 1];
export class Color
{
    constructor(color)
    {
        if(!(this instanceof Color))
            return new Color(color);
        if(typeof color === 'object')
            return color;
        this._attachValues(Color.toColorObject(color));
    }

    toRgbString()
    {
        return 'rgb(' + this.red + ', ' + this.green + ', ' + this.blue + ')';
    }

    toRgbaString()
    {
        return 'rgba(' + this.red + ', ' + this.green + ', ' + this.blue + ', ' + this.opacity + ')';
    }

    toHwbString()
    {
        return 'hwb(' + this.hue + ', ' + Math.round(this.whiteness * 100) + '%, ' + Math.round(this.blackness * 100) + '%)';
    }

    toHwbStringDecimal()
    {
        return 'hwb(' + this.hue + ', ' + this.whiteness + ', ' + this.blackness + ')';
    }

    toHwbaString()
    {
        return 'hwba(' + this.hue + ', ' + Math.round(this.whiteness * 100) + '%, ' + Math.round(this.blackness * 100) + '%, ' + this.opacity + ')';
    }

    toHslString()
    {
        return 'hsl(' + this.hue + ', ' + Math.round(this.sat * 100) + '%, ' + Math.round(this.lightness * 100) + '%)';
    }

    toHslStringDecimal()
    {
        return 'hsl(' + this.hue + ', ' + this.sat + ', ' + this.lightness + ')';
    }

    toHslaString()
    {
        return 'hsla(' + this.hue + ', ' + Math.round(this.sat * 100) + '%, ' + Math.round(this.lightness * 100) + '%, ' + this.opacity + ')';
    }

    toCmykString()
    {
        return 'cmyk(' + Math.round(this.cyan * 100) + '%, ' + Math.round(this.magenta * 100) + '%, ' + Math.round(this.yellow * 100) + '%, ' + Math.round(this.black * 100) + '%)';
    }

    toCmykStringDecimal()
    {
        return 'cmyk(' + this.cyan + ', ' + this.magenta + ', ' + this.yellow + ', ' + this.black + ')';
    }

    toNcolString()
    {
        return this.ncol + ', ' + Math.round(this.whiteness * 100) + '%, ' + Math.round(this.blackness * 100) + '%';
    }

    toNcolStringDecimal()
    {
        return this.ncol + ', ' + this.whiteness + ', ' + this.blackness;
    }

    toNcolaString()
    {
        return this.ncol + ', ' + Math.round(this.whiteness * 100) + '%, ' + Math.round(this.blackness * 100) + '%, ' + this.opacity;
    }

    toName()
    {
        let r;
        let g;
        let b;
        const colorhexs = Color.getColorArr('hexs');
        for (let i = 0; i < colorhexs.length; i++)
        {
            r = parseInt(colorhexs[i].substr(0, 2), 16);
            g = parseInt(colorhexs[i].substr(2, 2), 16);
            b = parseInt(colorhexs[i].substr(4, 2), 16);
            if(this.red === r && this.green === g && this.blue === b)
                return Color.getColorArr('names')[i];
        }
        return '';
    }

    toHexString()
    {
        const r = Color.toHex(this.red);
        const g = Color.toHex(this.green);
        const b = Color.toHex(this.blue);
        return '#' + r + g + b;
    }

    toHexAlphaString()
    {
        const a = Color.toHex(Math.round(this.alpha * 255));
        return this.toHexString() + a;
    }

    toRgb()
    {
        return {
            r: this.red,
            g: this.green,
            b: this.blue,
        };
    }

    toRgba()
    {
        return {
            ...this.toRgb(),
            a: this.opacity
        };
    }

    toRgbNormalized()
    {
        return {
            r: this.red / 255.0,
            g: this.green / 255.0,
            b: this.blue / 255.0,
        };
    }

    toRgbaNormalized()
    {
        return {
            ...this.toRgbNormalized(),
            a: this.opacity
        };
    }

    toHsl()
    {
        return {
            h: this.hue,
            s: this.sat,
            l: this.lightness,
        };
    }

    toHsla()
    {
        return {
            ...this.toHsl(),
            a: this.opacity
        };
    }

    toHwb()
    {
        return {
            h: this.hue,
            w: this.whiteness,
            b: this.blackness,
        };
    }

    toHwba()
    {
        return {
            ...this.toHwb(),
            a: this.opacity
        };
    }

    toCmyk()
    {
        return {
            c: this.cyan,
            m: this.magenta,
            y: this.yellow,
            k: this.black,
        };
    }

    toCmyka()
    {
        return {
            ...this.toCmyk(),
            a: this.opacity
        };
    }

    toNcol()
    {
        return {
            ncol: this.ncol,
            w: this.whiteness,
            b: this.blackness,
            a: this.opacity
        };
    }

    toNcola()
    {
        return {
            ...this.toNcol(),
            a: this.opacity
        };
    }

    /**
     * Calculate the luminance for this color.
     * See https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
     *
     * @return a luminance level in the range of 0 (black) to 1 (white)
     */
    getLuminance()
    {
        const red = LINEAR_CHANNEL_VALUES[this.red];
        const green = LINEAR_CHANNEL_VALUES[this.green];
        const blue = LINEAR_CHANNEL_VALUES[this.blue];
        return .2126 * red + .7152 * green + .0722 * blue;
    }

    /**
     * Provide a contrast level between this color and the provided color
     *
     * @return the contrast level
     */
    getContrast(other)
    {
        if(!other)
            return 0.55;

        const bgLuminance = this.getLuminance() + .05;
        const fgLuminance = other.getLuminance() + .05;
        return Math.max(bgLuminance, fgLuminance) / Math.min(bgLuminance, fgLuminance);
    }

    /**
     * Determine whether to use a dark or light color on to contrast with this color. Useful
     * for determining what color text to use on a given background, for example.
     *
     * @param {Color} light the the light alternative
     * @param {Color} dark the the dark alternative
     * @return {Color} the color which provides the best contrast with this color
     *         chosen from the provided `light` and `dark` aletrnatives
     */
    findContrastColor(light=WHITE, dark=BLACK)
    {
        const lightContrast = this.getContrast(light);
        const darkContrast =  this.getContrast(dark);
        return lightContrast > darkContrast ? light : dark;
    }

    isDark(n)
    {
        const m = (n || 128);
        return (((this.red * 299 + this.green * 587 + this.blue * 114) / 1000) < m);
    }

    saturate(n)
    {
        n = n || 0;
        const x = (n / 100 || 0.1);
        this.sat += x;
        if(this.sat > 1)
            this.sat = 1;
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    desaturate(n)
    {
        n = n || 0;
        const x = (n / 100 || 0.1);
        this.sat -= x;
        if(this.sat < 0)
            this.sat = 0;
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    lighter(n)
    {
        n = n || 0;
        const x = (n / 100 || 0.1);
        this.lightness += x;
        if(this.lightness > 1)
            this.lightness = 1;
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    darker(n)
    {
        n = n || 0;
        const x = (n / 100 || 0.1);
        this.lightness -= x;
        if(this.lightness < 0)
            this.lightness = 0;
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    scale(n)
    {
        n = n || 0;
        const rgb = {
            r: Math.max(0, Math.min(255, this.r * n)),
            g: Math.max(0, Math.min(255, this.g * n)),
            b: Math.max(0, Math.min(255, this.b * n)),
        };
        const color = Color.colorObject(rgb, this.opacity);
        this._attachValues(color);
        return this;
    }

    opacify(opacity)
    {
        this.opacity = opacity < 0.0 ? 0 : opacity > 1 ? 1 : opacity;
        this.alpha = this.opacity;
        this.a = this.opacity;
        return this;
    }

    adjustHue(angle)
    {
        let hue = this.hue + angle;
        while(hue >= 360)
            hue -= 360;
        while(hue < 0)
            hue += 360;
        this.hue = hue;
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    setHue(angle)
    {
        while(angle >= 360)
            angle -= 360;
        while(angle < 0)
            angle += 360;
        this.hue = angle;
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    setSaturation(sat)
    {
        this.sat = Math.min(1.0, Math.max(0.0, sat));
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    setLightness(lightness)
    {
        this.lightness = Math.min(1.0, Math.max(0.0, lightness));
        const rgb = Color.hslToRgb(this.hue, this.sat, this.lightness);
        const color = Color.colorObject(rgb, this.opacity, this.hue, this.sat);
        this._attachValues(color);
        return this;
    }

    clone()
    {
        return new Color(this.toRgbaString());
    }

    _attachValues(color)
    {
        this.red = color.red;
        this.green = color.green;
        this.blue = color.blue;
        this.r = this.red;
        this.g = this.green;
        this.b = this.blue;

        this.hue = color.hue;
        this.sat = color.sat;
        this.lightness = color.lightness;
        this.h = this.hue;
        this.s = this.sat;
        this.l = this.lightness;

        this.whiteness = color.whiteness;
        this.blackness = color.blackness;

        this.cyan = color.cyan;
        this.magenta = color.magenta;
        this.yellow = color.yellow;
        this.black = color.black;
        this.c = this.cyan;
        this.m = this.magenta;
        this.y = this.yellow;
        this.k = this.black;

        this.opacity = color.opacity;
        this.alpha = this.opacity;
        this.a = this.opacity;

        this.ncol = color.ncol;
        this.valid = color.valid;
    }

    static toColorObject(c)
    {
        c = Color.w3trim(c.toLowerCase());
        let typ;
        let arr = [];
        let arrlength;
        let i;
        let opacity;
        let match;
        let hue;
        let sat;
        let rgb;
        let colornames = [];
        let colorhexs = [];

        const x = c.substr(0, 1).toUpperCase();
        const y = c.substr(1);
        let a = 1;
        if((x === 'R' || x === 'Y' || x === 'G' || x === 'C' || x === 'B' || x === 'M' || x === 'W') && !isNaN(y))
        {
            if(c.length === 6 && c.indexOf(',') === -1)
            {
                // do nothing
            }
            else
                c = 'ncol(' + c + ')';
        }
        if(c.length !== 3 && c.length !== 6 && !isNaN(c))
            c = 'ncol(' + c + ')';
        if(c.indexOf(',') > 0 && c.indexOf('(') === -1)
            c = 'ncol(' + c + ')';
        if(c.substr(0, 3) === 'rgb' || c.substr(0, 3) === 'hsl' || c.substr(0, 3) === 'hwb' || c.substr(0, 4) === 'ncol' || c.substr(0, 4) === 'cmyk')
        {
            if(c.substr(0, 4) === 'ncol')
            {
                if(c.split(',').length === 4 && c.indexOf('ncola') === -1)
                    c = c.replace('ncol', 'ncola');
                typ = 'ncol';
                c = c.substr(4);
            }
            else if(c.substr(0, 4) === 'cmyk')
            {
                typ = 'cmyk';
                c = c.substr(4);
            }
            else
            {
                typ = c.substr(0, 3);
                c = c.substr(3);
            }
            arrlength = 3;
            opacity = false;
            if(c.substr(0, 1).toLowerCase() === 'a')
            {
                arrlength = 4;
                opacity = true;
                c = c.substr(1);
            }
            else if(typ === 'cmyk')
            {
                arrlength = 4;
                if(c.split(',').length === 5)
                {
                    arrlength = 5;
                    opacity = true;
                }
            }
            c = c.replace('(', '');
            c = c.replace(')', '');
            arr = c.split(',');
            if(typ === 'rgb')
            {
                if(arr.length !== arrlength)
                    return Color.emptyObject();

                for (i = 0; i < arrlength; i++)
                {
                    if(arr[i] === '' || arr[i] === ' ')
                        arr[i] = '0';
                    if(arr[i].indexOf('%') > -1)
                    {
                        arr[i] = arr[i].replace('%', '');
                        arr[i] = Number(arr[i] / 100);
                        if(i < 3)
                            arr[i] = Math.round(arr[i] * 255);
                    }
                    if(isNaN(arr[i]))
                        return Color.emptyObject();
                    if(parseInt(arr[i]) > 255)
                        arr[i] = 255;
                    if(i < 3)
                        arr[i] = parseInt(arr[i]);
                    if(i === 3 && Number(arr[i]) > 1)
                        arr[i] = 1;
                }
                rgb = {
                    r: arr[0],
                    g: arr[1],
                    b: arr[2]
                };
                if(opacity === true)
                    a = Number(arr[3]);
            }
            if(typ === 'hsl' || typ === 'hwb' || typ === 'ncol')
            {
                while (arr.length < arrlength)
                    arr.push('0');

                if(typ === 'hsl' || typ === 'hwb')
                {
                    if(parseInt(arr[0]) >= 360)
                        arr[0] = 0;
                }

                for (i = 1; i < arrlength; i++)
                {
                    if(arr[i].indexOf('%') > -1)
                    {
                        arr[i] = arr[i].replace('%', '');
                        arr[i] = Number(arr[i]);
                        if(isNaN(arr[i]))
                            return Color.emptyObject();
                        arr[i] = arr[i] / 100;
                    }
                    else
                        arr[i] = Number(arr[i]);

                    if(Number(arr[i]) > 1)
                        arr[i] = 1;

                    if(Number(arr[i]) < 0)
                        arr[i] = 0;
                }
                if(typ === 'hsl')
                {
                    rgb = Color.hslToRgb(arr[0], arr[1], arr[2]);
                    hue = Number(arr[0]);
                    sat = Number(arr[1]);
                }
                if(typ === 'hwb')
                    rgb = Color.hwbToRgb(arr[0], arr[1], arr[2]);

                if(typ === 'ncol')
                    rgb = Color.ncolToRgb(arr[0], arr[1], arr[2]);

                if(opacity === true)
                    a = Number(arr[3]);
            }
            if(typ === 'cmyk')
            {
                while (arr.length < arrlength)
                    arr.push('0');
                for (i = 0; i < arrlength; i++)
                {
                    if(arr[i].indexOf('%') > -1)
                    {
                        arr[i] = arr[i].replace('%', '');
                        arr[i] = Number(arr[i]);
                        if(isNaN(arr[i]))
                            return Color.emptyObject();

                        arr[i] = arr[i] / 100;
                    }
                    else
                        arr[i] = Number(arr[i]);

                    if(Number(arr[i]) > 1)
                        arr[i] = 1;

                    if(Number(arr[i]) < 0)
                        arr[i] = 0;
                }
                rgb = Color.cmykToRgb(arr[0], arr[1], arr[2], arr[3]);

                if(opacity === true)
                    a = Number(arr[4]);
            }
        }
        else if(c.substr(0, 3) === 'ncs')
            rgb = Color.ncsToRgb(c);
        else
        {
            match = false;
            colornames = Color.getColorArr('names');
            for (i = 0; i < colornames.length; i++)
            {
                if(c.toLowerCase() === colornames[i].toLowerCase())
                {
                    colorhexs = Color.getColorArr('hexs');
                    match = true;
                    rgb = {
                        r: parseInt(colorhexs[i].substr(0, 2), 16),
                        g: parseInt(colorhexs[i].substr(2, 2), 16),
                        b: parseInt(colorhexs[i].substr(4, 2), 16)
                    };
                    break;
                }
            }
            if(match === false)
            {
                c = c.replace('#', '');
                if(c.length === 3)
                    c = c.substr(0, 1) + c.substr(0, 1) + c.substr(1, 1) + c.substr(1, 1) + c.substr(2, 1) + c.substr(2, 1);
                for (i = 0; i < c.length; i++)
                {
                    if(!Color.isHex(c.substr(i, 1)))
                        return Color.emptyObject();
                }
                arr[0] = parseInt(c.substr(0, 2), 16);
                arr[1] = parseInt(c.substr(2, 2), 16);
                arr[2] = parseInt(c.substr(4, 2), 16);
                for (i = 0; i < 3; i++)
                {
                    if(isNaN(arr[i]))
                        return Color.emptyObject();
                }
                rgb = {
                    r: arr[0],
                    g: arr[1],
                    b: arr[2]
                };
            }
        }
        return Color.colorObject(rgb, a, hue, sat);
    }

    static colorObject(rgb, a, h, s)
    {
        if(!rgb)
            return Color.emptyObject();

        if(a === null)
            a = 1;

        const hsl = Color.rgbToHsl(rgb.r, rgb.g, rgb.b);
        const hwb = Color.rgbToHwb(rgb.r, rgb.g, rgb.b);
        const cmyk = Color.rgbToCmyk(rgb.r, rgb.g, rgb.b);
        const hue = (h || hsl.h);
        const sat = (s || hsl.s);
        const ncol = Color.hueToNcol(hue);

        let color = {
            // RGB
            red: rgb.r,
            green: rgb.g,
            blue: rgb.b,
            // aliases for RGB
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
            // HSL
            hue: hue,
            sat: sat,
            lightness: hsl.l,
            // aliases for HSL
            h: hue,
            s: sat,
            l: hsl.l,
            // CMYK
            cyan: cmyk.c,
            magenta: cmyk.m,
            yellow: cmyk.y,
            black: cmyk.k,
            // aliases for CMYK
            c: cmyk.c,
            m: cmyk.m,
            y: cmyk.y,
            k: cmyk.k,
            // opacity
            opacity: a,
            // aliases for opacity
            alpha: a,
            a: a,
            // WHITE/BLACK
            whiteness: hwb.w,
            blackness: hwb.b,
            // other stuff
            ncol: ncol,
            valid: true
        };
        color = Color.roundDecimals(color);
        return color;
    }

    static emptyObject()
    {
        return {
            red: 0,
            green: 0,
            blue: 0,
            r: 0,
            g: 0,
            b: 0,

            hue: 0,
            sat: 0,
            lightness: 0,
            h: 0,
            s: 0,
            l: 0,

            cyan: 0,
            magenta: 0,
            yellow: 0,
            black: 0,
            c: 0,
            m: 0,
            y: 0,
            k: 0,

            opacity: 1,
            alpha: 1,
            a: 1,

            whiteness: 0,
            blackness: 0,

            ncol: 'R',
            valid: false
        };
    }

    static getColorArr(x)
    {
        if(x === 'names')
            return ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGrey', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkSlateGrey', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DimGrey', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Grey', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed', 'Indigo', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGrey', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSlateGrey', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'SlateGrey', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'];
        if(x === 'hexs')
            return ['f0f8ff', 'faebd7', '00ffff', '7fffd4', 'f0ffff', 'f5f5dc', 'ffe4c4', '000000', 'ffebcd', '0000ff', '8a2be2', 'a52a2a', 'deb887', '5f9ea0', '7fff00', 'd2691e', 'ff7f50', '6495ed', 'fff8dc', 'dc143c', '00ffff', '00008b', '008b8b', 'b8860b', 'a9a9a9', 'a9a9a9', '006400', 'bdb76b', '8b008b', '556b2f', 'ff8c00', '9932cc', '8b0000', 'e9967a', '8fbc8f', '483d8b', '2f4f4f', '2f4f4f', '00ced1', '9400d3', 'ff1493', '00bfff', '696969', '696969', '1e90ff', 'b22222', 'fffaf0', '228b22', 'ff00ff', 'dcdcdc', 'f8f8ff', 'ffd700', 'daa520', '808080', '808080', '008000', 'adff2f', 'f0fff0', 'ff69b4', 'cd5c5c', '4b0082', 'fffff0', 'f0e68c', 'e6e6fa', 'fff0f5', '7cfc00', 'fffacd', 'add8e6', 'f08080', 'e0ffff', 'fafad2', 'd3d3d3', 'd3d3d3', '90ee90', 'ffb6c1', 'ffa07a', '20b2aa', '87cefa', '778899', '778899', 'b0c4de', 'ffffe0', '00ff00', '32cd32', 'faf0e6', 'ff00ff', '800000', '66cdaa', '0000cd', 'ba55d3', '9370db', '3cb371', '7b68ee', '00fa9a', '48d1cc', 'c71585', '191970', 'f5fffa', 'ffe4e1', 'ffe4b5', 'ffdead', '000080', 'fdf5e6', '808000', '6b8e23', 'ffa500', 'ff4500', 'da70d6', 'eee8aa', '98fb98', 'afeeee', 'db7093', 'ffefd5', 'ffdab9', 'cd853f', 'ffc0cb', 'dda0dd', 'b0e0e6', '800080', '663399', 'ff0000', 'bc8f8f', '4169e1', '8b4513', 'fa8072', 'f4a460', '2e8b57', 'fff5ee', 'a0522d', 'c0c0c0', '87ceeb', '6a5acd', '708090', '708090', 'fffafa', '00ff7f', '4682b4', 'd2b48c', '008080', 'd8bfd8', 'ff6347', '40e0d0', 'ee82ee', 'f5deb3', 'ffffff', 'f5f5f5', 'ffff00', '9acd32'];
    }

    static roundDecimals(c)
    {
        c.red = Number(c.red.toFixed(0));
        c.green = Number(c.green.toFixed(0));
        c.blue = Number(c.blue.toFixed(0));
        c.hue = Number(c.hue.toFixed(0));
        c.sat = Number(c.sat.toFixed(2));
        c.lightness = Number(c.lightness.toFixed(2));
        c.whiteness = Number(c.whiteness.toFixed(2));
        c.blackness = Number(c.blackness.toFixed(2));
        c.cyan = Number(c.cyan.toFixed(2));
        c.magenta = Number(c.magenta.toFixed(2));
        c.yellow = Number(c.yellow.toFixed(2));
        c.black = Number(c.black.toFixed(2));
        c.ncol = c.ncol.substr(0, 1) + Math.round(Number(c.ncol.substr(1)));
        c.opacity = Number(c.opacity.toFixed(2));
        return c;
    }

    static hslToRgb(hue, sat, light)
    {
        hue = hue / 60;

        let t2 = 0;
        if(light <= 0.5)
            t2 = light * (sat + 1);
        else
            t2 = light + sat - (light * sat);

        const t1 = light * 2 - t2;
        const r = Color.hueToRgb(t1, t2, hue + 2) * 255;
        const g = Color.hueToRgb(t1, t2, hue) * 255;
        const b = Color.hueToRgb(t1, t2, hue - 2) * 255;
        return {
            r: r,
            g: g,
            b: b
        };
    }

    static hueToRgb(t1, t2, hue)
    {
        if(hue < 0) hue += 6;
        if(hue >= 6) hue -= 6;
        if(hue < 1) return (t2 - t1) * hue + t1;
        else if(hue < 3) return t2;
        else if(hue < 4) return (t2 - t1) * (4 - hue) + t1;
        else return t1;
    }

    static hwbToRgb(hue, white, black)
    {
        const rgb = Color.hslToRgb(hue, 1, 0.50);
        const rgbArr = [];
        rgbArr[0] = rgb.r / 255;
        rgbArr[1] = rgb.g / 255;
        rgbArr[2] = rgb.b / 255;
        const tot = white + black;
        if(tot > 1)
        {
            white = Number((white / tot).toFixed(2));
            black = Number((black / tot).toFixed(2));
        }
        for (let i = 0; i < 3; i++)
        {
            rgbArr[i] *= (1 - (white) - (black));
            rgbArr[i] += (white);
            rgbArr[i] = Number(rgbArr[i] * 255);
        }
        return {
            r: rgbArr[0],
            g: rgbArr[1],
            b: rgbArr[2]
        };
    }

    static cmykToRgb(c, m, y, k)
    {
        const r = 255 - ((Math.min(1, c * (1 - k) + k)) * 255);
        const g = 255 - ((Math.min(1, m * (1 - k) + k)) * 255);
        const b = 255 - ((Math.min(1, y * (1 - k) + k)) * 255);
        return {
            r: r,
            g: g,
            b: b
        };
    }

    static ncolToRgb(ncol, white, black)
    {
        let h = ncol;
        if(isNaN(ncol.substr(0, 1)))
        {
            const letter = ncol.substr(0, 1).toUpperCase();
            let percent = ncol.substr(1);
            if(percent === '')
                percent = 0;
            percent = Number(percent);
            if(isNaN(percent))
                return false;
            if(letter === 'R')
                h = 0 + (percent * 0.6);
            if(letter === 'Y')
                h = 60 + (percent * 0.6);
            if(letter === 'G')
                h = 120 + (percent * 0.6);
            if(letter === 'C')
                h = 180 + (percent * 0.6);
            if(letter === 'B')
                h = 240 + (percent * 0.6);
            if(letter === 'M')
                h = 300 + (percent * 0.6);
            if(letter === 'W')
            {
                h = 0;
                white = 1 - (percent / 100);
                black = (percent / 100);
            }
        }
        return Color.hwbToRgb(h, white, black);
    }

    static hueToNcol(hue)
    {
        while (hue >= 360)
            hue = hue - 360;

        if(hue < 60)
            return 'R' + (hue / 0.6);
        if(hue < 120)
            return 'Y' + ((hue - 60) / 0.6);
        if(hue < 180)
            return 'G' + ((hue - 120) / 0.6);
        if(hue < 240)
            return 'C' + ((hue - 180) / 0.6);
        if(hue < 300)
            return 'B' + ((hue - 240) / 0.6);
        if(hue < 360)
            return 'M' + ((hue - 300) / 0.6);
    }

    static ncsToRgb(ncs)
    {
        let black1, chroma1, factor1, red1, red2, green1, green2, blue1, blue2, max, factor2, grey, r, g, b;
        ncs = Color.w3trim(ncs).toUpperCase();
        ncs = ncs.replace('(', '');
        ncs = ncs.replace(')', '');
        ncs = ncs.replace('NCS', 'NCS ');
        ncs = ncs.replace(/ {2}/g, ' ');
        if(ncs.indexOf('NCS') === -1)
            ncs = 'NCS ' + ncs;
        ncs = ncs.match(/^(?:NCS|NCS\sS)\s(\d{2})(\d{2})-(N|[A-Z])(\d{2})?([A-Z])?$/);
        if(ncs === null) return false;
        const black = parseInt(ncs[1], 10);
        const chroma = parseInt(ncs[2], 10);
        const bc = ncs[3];
        if(bc !== 'N' && bc !== 'Y' && bc !== 'R' && bc !== 'B' && bc !== 'G')
            return false;

        const percent = parseInt(ncs[4], 10) || 0;
        if(bc !== 'N')
        {
            black1 = (1.05 * black - 5.25);
            chroma1 = chroma;
            if(bc === 'Y' && percent <= 60)
                red1 = 1;
            else if((bc === 'Y' && percent > 60) || (bc === 'R' && percent <= 80))
            {
                if(bc === 'Y')
                    factor1 = percent - 60;
                else
                    factor1 = percent + 40;
                red1 = ((Math.sqrt(14884 - Math.pow(factor1, 2))) - 22) / 100;
            }
            else if((bc === 'R' && percent > 80) || (bc === 'B'))
                red1 = 0;
            else if(bc === 'G')
            {
                factor1 = (percent - 170);
                red1 = ((Math.sqrt(33800 - Math.pow(factor1, 2))) - 70) / 100;
            }
            if(bc === 'Y' && percent <= 80)
                blue1 = 0;
            else if((bc === 'Y' && percent > 80) || (bc === 'R' && percent <= 60))
            {
                if(bc === 'Y')
                    factor1 = (percent - 80) + 20.5;
                else
                    factor1 = (percent + 20) + 20.5;
                blue1 = (104 - (Math.sqrt(11236 - Math.pow(factor1, 2)))) / 100;
            }
            else if((bc === 'R' && percent > 60) || (bc === 'B' && percent <= 80))
            {
                if(bc === 'R')
                    factor1 = (percent - 60) - 60;
                else
                    factor1 = (percent + 40) - 60;
                blue1 = ((Math.sqrt(10000 - Math.pow(factor1, 2))) - 10) / 100;
            }
            else if((bc === 'B' && percent > 80) || (bc === 'G' && percent <= 40))
            {
                if(bc === 'B')
                    factor1 = (percent - 80) - 131;
                else
                    factor1 = (percent + 20) - 131;
                blue1 = (122 - (Math.sqrt(19881 - Math.pow(factor1, 2)))) / 100;
            }
            else if(bc === 'G' && percent > 40)
                blue1 = 0;

            if(bc === 'Y')
                green1 = (85 - 17 / 20 * percent) / 100;
            else if(bc === 'R' && percent <= 60)
                green1 = 0;
            else if(bc === 'R' && percent > 60)
            {
                factor1 = (percent - 60) + 35;
                green1 = (67.5 - (Math.sqrt(5776 - Math.pow(factor1, 2)))) / 100;
            }
            else if(bc === 'B' && percent <= 60)
            {
                factor1 = (1 * percent - 68.5);
                green1 = (6.5 + (Math.sqrt(7044.5 - Math.pow(factor1, 2)))) / 100;
            }
            else if((bc === 'B' && percent > 60) || (bc === 'G' && percent <= 60))
                green1 = 0.9;
            else if(bc === 'G' && percent > 60)
            {
                factor1 = (percent - 60);
                green1 = (90 - (1 / 8 * factor1)) / 100;
            }
            factor1 = (red1 + green1 + blue1) / 3;
            red2 = ((factor1 - red1) * (100 - chroma1) / 100) + red1;
            green2 = ((factor1 - green1) * (100 - chroma1) / 100) + green1;
            blue2 = ((factor1 - blue1) * (100 - chroma1) / 100) + blue1;
            if(red2 > green2 && red2 > blue2)
                max = red2;
            else if(green2 > red2 && green2 > blue2)
                max = green2;
            else if(blue2 > red2 && blue2 > green2)
                max = blue2;
            else
                max = (red2 + green2 + blue2) / 3;

            factor2 = 1 / max;
            r = parseInt((red2 * factor2 * (100 - black1) / 100) * 255, 10);
            g = parseInt((green2 * factor2 * (100 - black1) / 100) * 255, 10);
            b = parseInt((blue2 * factor2 * (100 - black1) / 100) * 255, 10);
            if(r > 255)
                r = 255;
            if(g > 255)
                g = 255;
            if(b > 255)
                b = 255;
            if(r < 0)
                r = 0;
            if(g < 0)
                g = 0;
            if(b < 0)
                b = 0;
        }
        else
        {
            grey = parseInt((1 - black / 100) * 255, 10);
            if(grey > 255)
                grey = 255;
            if(grey < 0)
                grey = 0;
            r = grey;
            g = grey;
            b = grey;
        }
        return {
            r: r,
            g: g,
            b: b
        };
    }

    static rgbToHsl(r, g, b)
    {
        const rgb = [];
        rgb[0] = r / 255;
        rgb[1] = g / 255;
        rgb[2] = b / 255;
        let min = rgb[0];
        let max = rgb[0];
        let maxcolor = 0;
        let h = 0;

        for (let i = 0; i < rgb.length - 1; i++)
        {
            if(rgb[i + 1] <= min)
                min = rgb[i + 1];
            if(rgb[i + 1] >= max)
            {
                max = rgb[i + 1];
                maxcolor = i + 1;
            }
        }

        if(maxcolor === 0)
            h = (rgb[1] - rgb[2]) / (max - min);
        if(maxcolor === 1)
            h = 2 + (rgb[2] - rgb[0]) / (max - min);
        if(maxcolor === 2)
            h = 4 + (rgb[0] - rgb[1]) / (max - min);
        if(isNaN(h))
            h = 0;

        h = h * 60;
        if(h < 0)
            h = h + 360;

        const l = (min + max) / 2;

        let s = 0;
        if(min === max)
            s = 0;
        else
        {
            if(l < 0.5)
                s = (max - min) / (max + min);
            else
                s = (max - min) / (2 - max - min);
        }
        return {
            h: h,
            s: s,
            l: l
        };
    }

    static rgbToHwb(r, g, b)
    {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const chroma = max - min;
        let h = 0;
        if(chroma === 0)
            h = 0;
        else if(r === max)
            h = (((g - b) / chroma) % 6) * 360;
        else if(g === max)
            h = ((((b - r) / chroma) + 2) % 6) * 360;
        else
            h = ((((r - g) / chroma) + 4) % 6) * 360;

        const w = min;
        const bl = 1 - max;
        return {
            h: h,
            w: w,
            b: bl
        };
    }

    static rgbToCmyk(r, g, b)
    {
        r = r / 255;
        g = g / 255;
        b = b / 255;
        const max = Math.max(r, g, b);
        const k = 1 - max;
        let c = 0;
        let m = 0;
        let y = 0;
        if(k === 1)
        {
            c = 0;
            m = 0;
            y = 0;
        }
        else
        {
            c = (1 - r - k) / (1 - k);
            m = (1 - g - k) / (1 - k);
            y = (1 - b - k) / (1 - k);
        }
        return {
            c: c,
            m: m,
            y: y,
            k: k
        };
    }

    static toHex(n)
    {
        let hex = n.toString(16);
        while (hex.length < 2)
            hex = '0' + hex;
        return hex;
    }

    static w3trim(x)
    {
        return x.replace(/^\s+|\s+$/g, '');
    }

    static isHex(x)
    {
        return ('0123456789ABCDEFabcdef'.indexOf(x) > -1);
    }
}

const BLACK = new Color('#000');
const WHITE = new Color('#FFF');
