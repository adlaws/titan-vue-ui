import DataUtils from './data-utils.js';

// Source: https://www.iban.com/country-codes
const COUNTRY_CODES = [
    {name: 'Afghanistan', alpha2: 'af', alpha3: 'afg', numeric: 4},
    {name: 'Albania', alpha2: 'al', alpha3: 'alb', numeric: 8},
    {name: 'Algeria', alpha2: 'dz', alpha3: 'dza', numeric: 12},
    {name: 'American Samoa', alpha2: 'as', alpha3: 'asm', numeric: 16},
    {name: 'Andorra', alpha2: 'ad', alpha3: 'and', numeric: 20},
    {name: 'Angola', alpha2: 'ao', alpha3: 'ago', numeric: 24},
    {name: 'Anguilla', alpha2: 'ai', alpha3: 'aia', numeric: 660},
    {name: 'Antarctica', alpha2: 'aq', alpha3: 'ata', numeric: 10},
    {name: 'Antigua and Barbuda', alpha2: 'ag', alpha3: 'atg', numeric: 28},
    {name: 'Argentina', alpha2: 'ar', alpha3: 'arg', numeric: 32},
    {name: 'Armenia', alpha2: 'am', alpha3: 'arm', numeric: 51},
    {name: 'Aruba', alpha2: 'aw', alpha3: 'abw', numeric: 533},
    {name: 'Australia', alpha2: 'au', alpha3: 'aus', numeric: 36},
    {name: 'Austria', alpha2: 'at', alpha3: 'aut', numeric: 40},
    {name: 'Azerbaijan', alpha2: 'az', alpha3: 'aze', numeric: 31},
    {name: 'Bahamas (the)', alpha2: 'bs', alpha3: 'bhs', numeric: 44},
    {name: 'Bahrain', alpha2: 'bh', alpha3: 'bhr', numeric: 48},
    {name: 'Bangladesh', alpha2: 'bd', alpha3: 'bgd', numeric: 50},
    {name: 'Barbados', alpha2: 'bb', alpha3: 'brb', numeric: 52},
    {name: 'Belarus', alpha2: 'by', alpha3: 'blr', numeric: 112},
    {name: 'Belgium', alpha2: 'be', alpha3: 'bel', numeric: 56},
    {name: 'Belize', alpha2: 'bz', alpha3: 'blz', numeric: 84},
    {name: 'Benin', alpha2: 'bj', alpha3: 'ben', numeric: 204},
    {name: 'Bermuda', alpha2: 'bm', alpha3: 'bmu', numeric: 60},
    {name: 'Bhutan', alpha2: 'bt', alpha3: 'btn', numeric: 64},
    {name: 'Bolivia (Plurinational State of)', alpha2: 'bo', alpha3: 'bol', numeric: 68},
    {name: 'Bonaire, Sint Eustatius and Saba', alpha2: 'bq', alpha3: 'bes', numeric: 535},
    {name: 'Bosnia and Herzegovina', alpha2: 'ba', alpha3: 'bih', numeric: 70},
    {name: 'Botswana', alpha2: 'bw', alpha3: 'bwa', numeric: 72},
    {name: 'Bouvet Island', alpha2: 'bv', alpha3: 'bvt', numeric: 74},
    {name: 'Brazil', alpha2: 'br', alpha3: 'bra', numeric: 76},
    {name: 'British Indian Ocean Territory (the)', alpha2: 'io', alpha3: 'iot', numeric: 86},
    {name: 'Brunei Darussalam', alpha2: 'bn', alpha3: 'brn', numeric: 96},
    {name: 'Bulgaria', alpha2: 'bg', alpha3: 'bgr', numeric: 100},
    {name: 'Burkina Faso', alpha2: 'bf', alpha3: 'bfa', numeric: 854},
    {name: 'Burundi', alpha2: 'bi', alpha3: 'bdi', numeric: 108},
    {name: 'Cabo Verde', alpha2: 'cv', alpha3: 'cpv', numeric: 132},
    {name: 'Cambodia', alpha2: 'kh', alpha3: 'khm', numeric: 116},
    {name: 'Cameroon', alpha2: 'cm', alpha3: 'cmr', numeric: 120},
    {name: 'Canada', alpha2: 'ca', alpha3: 'can', numeric: 124},
    {name: 'Cayman Islands (the)', alpha2: 'ky', alpha3: 'cym', numeric: 136},
    {name: 'Central African Republic (the)', alpha2: 'cf', alpha3: 'caf', numeric: 140},
    {name: 'Chad', alpha2: 'td', alpha3: 'tcd', numeric: 148},
    {name: 'Chile', alpha2: 'cl', alpha3: 'chl', numeric: 152},
    {name: 'China', alpha2: 'cn', alpha3: 'chn', numeric: 156},
    {name: 'Christmas Island', alpha2: 'cx', alpha3: 'cxr', numeric: 162},
    {name: 'Cocos (Keeling) Islands (the)', alpha2: 'cc', alpha3: 'cck', numeric: 166},
    {name: 'Colombia', alpha2: 'co', alpha3: 'col', numeric: 170},
    {name: 'Comoros (the)', alpha2: 'km', alpha3: 'com', numeric: 174},
    {name: 'Congo (the Democratic Republic of the)', alpha2: 'cd', alpha3: 'cod', numeric: 180},
    {name: 'Congo (the)', alpha2: 'cg', alpha3: 'cog', numeric: 178},
    {name: 'Cook Islands (the)', alpha2: 'ck', alpha3: 'cok', numeric: 184},
    {name: 'Costa Rica', alpha2: 'cr', alpha3: 'cri', numeric: 188},
    {name: 'Croatia', alpha2: 'hr', alpha3: 'hrv', numeric: 191},
    {name: 'Cuba', alpha2: 'cu', alpha3: 'cub', numeric: 192},
    {name: 'Curaçao', alpha2: 'cw', alpha3: 'cuw', numeric: 531},
    {name: 'Cyprus', alpha2: 'cy', alpha3: 'cyp', numeric: 196},
    {name: 'Czechia', alpha2: 'cz', alpha3: 'cze', numeric: 203},
    {name: 'Côte d\'Ivoire', alpha2: 'ci', alpha3: 'civ', numeric: 384},
    {name: 'Denmark', alpha2: 'dk', alpha3: 'dnk', numeric: 208},
    {name: 'Djibouti', alpha2: 'dj', alpha3: 'dji', numeric: 262},
    {name: 'Dominica', alpha2: 'dm', alpha3: 'dma', numeric: 212},
    {name: 'Dominican Republic (the)', alpha2: 'do', alpha3: 'dom', numeric: 214},
    {name: 'Ecuador', alpha2: 'ec', alpha3: 'ecu', numeric: 218},
    {name: 'Egypt', alpha2: 'eg', alpha3: 'egy', numeric: 818},
    {name: 'El Salvador', alpha2: 'sv', alpha3: 'slv', numeric: 222},
    {name: 'Equatorial Guinea', alpha2: 'gq', alpha3: 'gnq', numeric: 226},
    {name: 'Eritrea', alpha2: 'er', alpha3: 'eri', numeric: 232},
    {name: 'Estonia', alpha2: 'ee', alpha3: 'est', numeric: 233},
    {name: 'Eswatini', alpha2: 'sz', alpha3: 'swz', numeric: 748},
    {name: 'Ethiopia', alpha2: 'et', alpha3: 'eth', numeric: 231},
    {name: 'Falkland Islands (the) [Malvinas]', alpha2: 'fk', alpha3: 'flk', numeric: 238},
    {name: 'Faroe Islands (the)', alpha2: 'fo', alpha3: 'fro', numeric: 234},
    {name: 'Fiji', alpha2: 'fj', alpha3: 'fji', numeric: 242},
    {name: 'Finland', alpha2: 'fi', alpha3: 'fin', numeric: 246},
    {name: 'France', alpha2: 'fr', alpha3: 'fra', numeric: 250},
    {name: 'French Guiana', alpha2: 'gf', alpha3: 'guf', numeric: 254},
    {name: 'French Polynesia', alpha2: 'pf', alpha3: 'pyf', numeric: 258},
    {name: 'French Southern Territories (the)', alpha2: 'tf', alpha3: 'atf', numeric: 260},
    {name: 'Gabon', alpha2: 'ga', alpha3: 'gab', numeric: 266},
    {name: 'Gambia (the)', alpha2: 'gm', alpha3: 'gmb', numeric: 270},
    {name: 'Georgia', alpha2: 'ge', alpha3: 'geo', numeric: 268},
    {name: 'Germany', alpha2: 'de', alpha3: 'deu', numeric: 276},
    {name: 'Ghana', alpha2: 'gh', alpha3: 'gha', numeric: 288},
    {name: 'Gibraltar', alpha2: 'gi', alpha3: 'gib', numeric: 292},
    {name: 'Greece', alpha2: 'gr', alpha3: 'grc', numeric: 300},
    {name: 'Greenland', alpha2: 'gl', alpha3: 'grl', numeric: 304},
    {name: 'Grenada', alpha2: 'gd', alpha3: 'grd', numeric: 308},
    {name: 'Guadeloupe', alpha2: 'gp', alpha3: 'glp', numeric: 312},
    {name: 'Guam', alpha2: 'gu', alpha3: 'gum', numeric: 316},
    {name: 'Guatemala', alpha2: 'gt', alpha3: 'gtm', numeric: 320},
    {name: 'Guernsey', alpha2: 'gg', alpha3: 'ggy', numeric: 831},
    {name: 'Guinea', alpha2: 'gn', alpha3: 'gin', numeric: 324},
    {name: 'Guinea-Bissau', alpha2: 'gw', alpha3: 'gnb', numeric: 624},
    {name: 'Guyana', alpha2: 'gy', alpha3: 'guy', numeric: 328},
    {name: 'Haiti', alpha2: 'ht', alpha3: 'hti', numeric: 332},
    {name: 'Heard Island and McDonald Islands', alpha2: 'hm', alpha3: 'hmd', numeric: 334},
    {name: 'Holy See (the)', alpha2: 'va', alpha3: 'vat', numeric: 336},
    {name: 'Honduras', alpha2: 'hn', alpha3: 'hnd', numeric: 340},
    {name: 'Hong Kong', alpha2: 'hk', alpha3: 'hkg', numeric: 344},
    {name: 'Hungary', alpha2: 'hu', alpha3: 'hun', numeric: 348},
    {name: 'Iceland', alpha2: 'is', alpha3: 'isl', numeric: 352},
    {name: 'India', alpha2: 'in', alpha3: 'ind', numeric: 356},
    {name: 'Indonesia', alpha2: 'id', alpha3: 'idn', numeric: 360},
    {name: 'Iran (Islamic Republic of)', alpha2: 'ir', alpha3: 'irn', numeric: 364},
    {name: 'Iraq', alpha2: 'iq', alpha3: 'irq', numeric: 368},
    {name: 'Ireland', alpha2: 'ie', alpha3: 'irl', numeric: 372},
    {name: 'Isle of Man', alpha2: 'im', alpha3: 'imn', numeric: 833},
    {name: 'Israel', alpha2: 'il', alpha3: 'isr', numeric: 376},
    {name: 'Italy', alpha2: 'it', alpha3: 'ita', numeric: 380},
    {name: 'Jamaica', alpha2: 'jm', alpha3: 'jam', numeric: 388},
    {name: 'Japan', alpha2: 'jp', alpha3: 'jpn', numeric: 392},
    {name: 'Jersey', alpha2: 'je', alpha3: 'jey', numeric: 832},
    {name: 'Jordan', alpha2: 'jo', alpha3: 'jor', numeric: 400},
    {name: 'Kazakhstan', alpha2: 'kz', alpha3: 'kaz', numeric: 398},
    {name: 'Kenya', alpha2: 'ke', alpha3: 'ken', numeric: 404},
    {name: 'Kiribati', alpha2: 'ki', alpha3: 'kir', numeric: 296},
    {name: 'Korea (the Democratic People\'s Republic of)', alpha2: 'kp', alpha3: 'prk', numeric: 408},
    {name: 'Korea (the Republic of)', alpha2: 'kr', alpha3: 'kor', numeric: 410},
    {name: 'Kuwait', alpha2: 'kw', alpha3: 'kwt', numeric: 414},
    {name: 'Kyrgyzstan', alpha2: 'kg', alpha3: 'kgz', numeric: 417},
    {name: 'Lao People\'s Democratic Republic (the)', alpha2: 'la', alpha3: 'lao', numeric: 418},
    {name: 'Latvia', alpha2: 'lv', alpha3: 'lva', numeric: 428},
    {name: 'Lebanon', alpha2: 'lb', alpha3: 'lbn', numeric: 422},
    {name: 'Lesotho', alpha2: 'ls', alpha3: 'lso', numeric: 426},
    {name: 'Liberia', alpha2: 'lr', alpha3: 'lbr', numeric: 430},
    {name: 'Libya', alpha2: 'ly', alpha3: 'lby', numeric: 434},
    {name: 'Liechtenstein', alpha2: 'li', alpha3: 'lie', numeric: 438},
    {name: 'Lithuania', alpha2: 'lt', alpha3: 'ltu', numeric: 440},
    {name: 'Luxembourg', alpha2: 'lu', alpha3: 'lux', numeric: 442},
    {name: 'Macao', alpha2: 'mo', alpha3: 'mac', numeric: 446},
    {name: 'Madagascar', alpha2: 'mg', alpha3: 'mdg', numeric: 450},
    {name: 'Malawi', alpha2: 'mw', alpha3: 'mwi', numeric: 454},
    {name: 'Malaysia', alpha2: 'my', alpha3: 'mys', numeric: 458},
    {name: 'Maldives', alpha2: 'mv', alpha3: 'mdv', numeric: 462},
    {name: 'Mali', alpha2: 'ml', alpha3: 'mli', numeric: 466},
    {name: 'Malta', alpha2: 'mt', alpha3: 'mlt', numeric: 470},
    {name: 'Marshall Islands (the)', alpha2: 'mh', alpha3: 'mhl', numeric: 584},
    {name: 'Martinique', alpha2: 'mq', alpha3: 'mtq', numeric: 474},
    {name: 'Mauritania', alpha2: 'mr', alpha3: 'mrt', numeric: 478},
    {name: 'Mauritius', alpha2: 'mu', alpha3: 'mus', numeric: 480},
    {name: 'Mayotte', alpha2: 'yt', alpha3: 'myt', numeric: 175},
    {name: 'Mexico', alpha2: 'mx', alpha3: 'mex', numeric: 484},
    {name: 'Micronesia (Federated States of)', alpha2: 'fm', alpha3: 'fsm', numeric: 583},
    {name: 'Moldova (the Republic of)', alpha2: 'md', alpha3: 'mda', numeric: 498},
    {name: 'Monaco', alpha2: 'mc', alpha3: 'mco', numeric: 492},
    {name: 'Mongolia', alpha2: 'mn', alpha3: 'mng', numeric: 496},
    {name: 'Montenegro', alpha2: 'me', alpha3: 'mne', numeric: 499},
    {name: 'Montserrat', alpha2: 'ms', alpha3: 'msr', numeric: 500},
    {name: 'Morocco', alpha2: 'ma', alpha3: 'mar', numeric: 504},
    {name: 'Mozambique', alpha2: 'mz', alpha3: 'moz', numeric: 508},
    {name: 'Myanmar', alpha2: 'mm', alpha3: 'mmr', numeric: 104},
    {name: 'Namibia', alpha2: 'na', alpha3: 'nam', numeric: 516},
    {name: 'Nauru', alpha2: 'nr', alpha3: 'nru', numeric: 520},
    {name: 'Nepal', alpha2: 'np', alpha3: 'npl', numeric: 524},
    {name: 'Netherlands (the)', alpha2: 'nl', alpha3: 'nld', numeric: 528},
    {name: 'New Caledonia', alpha2: 'nc', alpha3: 'ncl', numeric: 540},
    {name: 'New Zealand', alpha2: 'nz', alpha3: 'nzl', numeric: 554},
    {name: 'Nicaragua', alpha2: 'ni', alpha3: 'nic', numeric: 558},
    {name: 'Niger (the)', alpha2: 'ne', alpha3: 'ner', numeric: 562},
    {name: 'Nigeria', alpha2: 'ng', alpha3: 'nga', numeric: 566},
    {name: 'Niue', alpha2: 'nu', alpha3: 'niu', numeric: 570},
    {name: 'Norfolk Island', alpha2: 'nf', alpha3: 'nfk', numeric: 574},
    {name: 'Northern Mariana Islands (the)', alpha2: 'mp', alpha3: 'mnp', numeric: 580},
    {name: 'Norway', alpha2: 'no', alpha3: 'nor', numeric: 578},
    {name: 'Oman', alpha2: 'om', alpha3: 'omn', numeric: 512},
    {name: 'Pakistan', alpha2: 'pk', alpha3: 'pak', numeric: 586},
    {name: 'Palau', alpha2: 'pw', alpha3: 'plw', numeric: 585},
    {name: 'Palestine, State of', alpha2: 'ps', alpha3: 'pse', numeric: 275},
    {name: 'Panama', alpha2: 'pa', alpha3: 'pan', numeric: 591},
    {name: 'Papua New Guinea', alpha2: 'pg', alpha3: 'png', numeric: 598},
    {name: 'Paraguay', alpha2: 'py', alpha3: 'pry', numeric: 600},
    {name: 'Peru', alpha2: 'pe', alpha3: 'per', numeric: 604},
    {name: 'Philippines (the)', alpha2: 'ph', alpha3: 'phl', numeric: 608},
    {name: 'Pitcairn', alpha2: 'pn', alpha3: 'pcn', numeric: 612},
    {name: 'Poland', alpha2: 'pl', alpha3: 'pol', numeric: 616},
    {name: 'Portugal', alpha2: 'pt', alpha3: 'prt', numeric: 620},
    {name: 'Puerto Rico', alpha2: 'pr', alpha3: 'pri', numeric: 630},
    {name: 'Qatar', alpha2: 'qa', alpha3: 'qat', numeric: 634},
    {name: 'Republic of North Macedonia', alpha2: 'mk', alpha3: 'mkd', numeric: 807},
    {name: 'Romania', alpha2: 'ro', alpha3: 'rou', numeric: 642},
    {name: 'Russian Federation (the)', alpha2: 'ru', alpha3: 'rus', numeric: 643},
    {name: 'Rwanda', alpha2: 'rw', alpha3: 'rwa', numeric: 646},
    {name: 'Réunion', alpha2: 're', alpha3: 'reu', numeric: 638},
    {name: 'Saint Barthélemy', alpha2: 'bl', alpha3: 'blm', numeric: 652},
    {name: 'Saint Helena, Ascension and Tristan da Cunha', alpha2: 'sh', alpha3: 'shn', numeric: 654},
    {name: 'Saint Kitts and Nevis', alpha2: 'kn', alpha3: 'kna', numeric: 659},
    {name: 'Saint Lucia', alpha2: 'lc', alpha3: 'lca', numeric: 662},
    {name: 'Saint Martin (French part)', alpha2: 'mf', alpha3: 'maf', numeric: 663},
    {name: 'Saint Pierre and Miquelon', alpha2: 'pm', alpha3: 'spm', numeric: 666},
    {name: 'Saint Vincent and the Grenadines', alpha2: 'vc', alpha3: 'vct', numeric: 670},
    {name: 'Samoa', alpha2: 'ws', alpha3: 'wsm', numeric: 882},
    {name: 'San Marino', alpha2: 'sm', alpha3: 'smr', numeric: 674},
    {name: 'Sao Tome and Principe', alpha2: 'st', alpha3: 'stp', numeric: 678},
    {name: 'Saudi Arabia', alpha2: 'sa', alpha3: 'sau', numeric: 682},
    {name: 'Senegal', alpha2: 'sn', alpha3: 'sen', numeric: 686},
    {name: 'Serbia', alpha2: 'rs', alpha3: 'srb', numeric: 688},
    {name: 'Seychelles', alpha2: 'sc', alpha3: 'syc', numeric: 690},
    {name: 'Sierra Leone', alpha2: 'sl', alpha3: 'sle', numeric: 694},
    {name: 'Singapore', alpha2: 'sg', alpha3: 'sgp', numeric: 702},
    {name: 'Sint Maarten (Dutch part)', alpha2: 'sx', alpha3: 'sxm', numeric: 534},
    {name: 'Slovakia', alpha2: 'sk', alpha3: 'svk', numeric: 703},
    {name: 'Slovenia', alpha2: 'si', alpha3: 'svn', numeric: 705},
    {name: 'Solomon Islands', alpha2: 'sb', alpha3: 'slb', numeric: 90},
    {name: 'Somalia', alpha2: 'so', alpha3: 'som', numeric: 706},
    {name: 'South Africa', alpha2: 'za', alpha3: 'zaf', numeric: 710},
    {name: 'South Georgia and the South Sandwich Islands', alpha2: 'gs', alpha3: 'sgs', numeric: 239},
    {name: 'South Sudan', alpha2: 'ss', alpha3: 'ssd', numeric: 728},
    {name: 'Spain', alpha2: 'es', alpha3: 'esp', numeric: 724},
    {name: 'Sri Lanka', alpha2: 'lk', alpha3: 'lka', numeric: 144},
    {name: 'Sudan (the)', alpha2: 'sd', alpha3: 'sdn', numeric: 729},
    {name: 'Suriname', alpha2: 'sr', alpha3: 'sur', numeric: 740},
    {name: 'Svalbard and Jan Mayen', alpha2: 'sj', alpha3: 'sjm', numeric: 744},
    {name: 'Sweden', alpha2: 'se', alpha3: 'swe', numeric: 752},
    {name: 'Switzerland', alpha2: 'ch', alpha3: 'che', numeric: 756},
    {name: 'Syrian Arab Republic', alpha2: 'sy', alpha3: 'syr', numeric: 760},
    {name: 'Taiwan (Province of China)', alpha2: 'tw', alpha3: 'twn', numeric: 158},
    {name: 'Tajikistan', alpha2: 'tj', alpha3: 'tjk', numeric: 762},
    {name: 'Tanzania, United Republic of', alpha2: 'tz', alpha3: 'tza', numeric: 834},
    {name: 'Thailand', alpha2: 'th', alpha3: 'tha', numeric: 764},
    {name: 'Timor-Leste', alpha2: 'tl', alpha3: 'tls', numeric: 626},
    {name: 'Togo', alpha2: 'tg', alpha3: 'tgo', numeric: 768},
    {name: 'Tokelau', alpha2: 'tk', alpha3: 'tkl', numeric: 772},
    {name: 'Tonga', alpha2: 'to', alpha3: 'ton', numeric: 776},
    {name: 'Trinidad and Tobago', alpha2: 'tt', alpha3: 'tto', numeric: 780},
    {name: 'Tunisia', alpha2: 'tn', alpha3: 'tun', numeric: 788},
    {name: 'Turkey', alpha2: 'tr', alpha3: 'tur', numeric: 792},
    {name: 'Turkmenistan', alpha2: 'tm', alpha3: 'tkm', numeric: 795},
    {name: 'Turks and Caicos Islands (the)', alpha2: 'tc', alpha3: 'tca', numeric: 796},
    {name: 'Tuvalu', alpha2: 'tv', alpha3: 'tuv', numeric: 798},
    {name: 'Uganda', alpha2: 'ug', alpha3: 'uga', numeric: 800},
    {name: 'Ukraine', alpha2: 'ua', alpha3: 'ukr', numeric: 804},
    {name: 'United Arab Emirates (the)', alpha2: 'ae', alpha3: 'are', numeric: 784},
    {name: 'United Kingdom of Great Britain and Northern Ireland (the)', alpha2: 'gb', alpha3: 'gbr', numeric: 826},
    {name: 'United States Minor Outlying Islands (the)', alpha2: 'um', alpha3: 'umi', numeric: 581},
    {name: 'United States of America (the)', alpha2: 'us', alpha3: 'usa', numeric: 840},
    {name: 'Uruguay', alpha2: 'uy', alpha3: 'ury', numeric: 858},
    {name: 'Uzbekistan', alpha2: 'uz', alpha3: 'uzb', numeric: 860},
    {name: 'Vanuatu', alpha2: 'vu', alpha3: 'vut', numeric: 548},
    {name: 'Venezuela (Bolivarian Republic of)', alpha2: 've', alpha3: 'ven', numeric: 862},
    {name: 'Viet Nam', alpha2: 'vn', alpha3: 'vnm', numeric: 704},
    {name: 'Virgin Islands (British)', alpha2: 'vg', alpha3: 'vgb', numeric: 92},
    {name: 'Virgin Islands (U.S.)', alpha2: 'vi', alpha3: 'vir', numeric: 850},
    {name: 'Wallis and Futuna', alpha2: 'wf', alpha3: 'wlf', numeric: 876},
    {name: 'Western Sahara', alpha2: 'eh', alpha3: 'esh', numeric: 732},
    {name: 'Yemen', alpha2: 'ye', alpha3: 'yem', numeric: 887},
    {name: 'Zambia', alpha2: 'zm', alpha3: 'zmb', numeric: 894},
    {name: 'Zimbabwe', alpha2: 'zw', alpha3: 'zwe', numeric: 716},
    {name: 'Åland Islands', alpha2: 'ax', alpha3: 'ala', numeric: 248},
];


function addAliases(key, aliases)
{
    if(!key || !aliases)
        return;
    if(typeof aliases === 'string')
        aliases = [aliases];
    if(!Array.isArray(aliases))
        return;

    let idx = 0;
    let entry = null;
    while (idx<COUNTRY_CODES.length && entry === null)
    {
        const current = COUNTRY_CODES[idx];
        if(current.name === key)
            entry = current;
        idx++;
    }
    if(entry)
    {
        aliases.forEach(alias =>
        {
            COUNTRY_CODES.push({...entry, name:alias});
        });
    }
}

// aliases
// NOTE: that this is probably a "bad idea", and all countries should
//       have a canonical name rather than a bunch of options
// NOTE: Because the aliases are pushed on at the end of the original array,
//       the subsequently generated alpha2/alpha3 etc lookups will return
//       the *aliased* entry rather than the original, so bear this in mind.
addAliases('United States of America (the)', 'USA');
addAliases('United Kingdom of Great Britain and Northern Ireland (the)', 'UK');
addAliases('United Arab Emirates (the)', 'UAE');
addAliases('Russian Federation (the)', 'Russia');
addAliases('Iran (Islamic Republic of)', 'Iran');
addAliases('Micronesia (Federated States of)', 'Micronesia');
addAliases('Moldova (the Republic of)', 'Moldova');
addAliases('Bolivia (Plurinational State of)', 'Bolivia');
addAliases('Cocos (Keeling) Islands (the)', ['Keeling Islands', 'Cocos Islands']);

// add a way to do case insensitive name lookups
COUNTRY_CODES.forEach(x => x.lcasename = x.name.toLowerCase() );

export const COUNTRY = {
    ALPHA2: DataUtils.objArrayToLookup(COUNTRY_CODES, 'alpha2'),       // generated lookups by Alpha2 code
    ALPHA3: DataUtils.objArrayToLookup(COUNTRY_CODES, 'alpha3'),       // generated lookups by Alpha3 code
    NUMERIC: DataUtils.objArrayToLookup(COUNTRY_CODES, 'numeric'),     // generated lookups by numeric code
    LCASENAME: DataUtils.objArrayToLookup(COUNTRY_CODES, 'lcasename'), // generated lookups by lowercase name
    NAME: DataUtils.objArrayToLookup(COUNTRY_CODES, 'name'),           // generated lookups by original name
};
