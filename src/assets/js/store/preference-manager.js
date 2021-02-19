import Vue from 'vue';
import Vuex from 'vuex';

import DataUtils from '@/assets/js/utils/data-utils.js';

Vue.use(Vuex);

import { LOCALE } from '@/locales';

export const LANGUAGE = {
    ENGLISH_US: LOCALE.ENGLISH_US,
    JAPANESE: LOCALE.JAPANESE,
};
const LANGUAGE_OPTIONS = [
    {label: 'English (US)', abbr:'EN', id: LANGUAGE.ENGLISH_US},
    {label: '日本語', abbr:'あ', id: LANGUAGE.JAPANESE},
];
const LANGUAGE_OPTIONS_BY_CODE = DataUtils.objArrayToLookup(LANGUAGE_OPTIONS, 'id');
const LANGUAGE_DEFAULT = LANGUAGE_OPTIONS[0];

export const POSITION_FORMAT = {
    DECIMAL: 'decimal',
    DMS: 'dms',
    MGRS: 'mgrs',
};
export const POSITION_FORMAT_OPTIONS = [
    {label: 'MGRS', id: POSITION_FORMAT.MGRS},
    {label: 'Decimal', id: POSITION_FORMAT.DECIMAL},
    {label: 'Degrees/Minutes/Seconds', id: POSITION_FORMAT.DMS},
];
const POSITION_FORMAT_OPTIONS_BY_CODE = DataUtils.objArrayToLookup(POSITION_FORMAT_OPTIONS, 'id');
const POSITION_FORMAT_DEFAULT = POSITION_FORMAT_OPTIONS[0];
// Ref: https://en.wikipedia.org/wiki/Decimal_degrees,
//      https://en.wikipedia.org/wiki/Military_Grid_Reference_System
const POSITION_PRECISION = {
    _100KM: '100km',
    _10KM: '10km',
    _1KM: '1km',
    _100M: '100m',
    _10M: '10m',
    _1M: '1m',
    _10CM: '10cm',
    _1CM: '1cm',
    _1MM: '1mm',
};
const POSITION_PRECISION_OPTIONS =
{
    [POSITION_FORMAT.DECIMAL]: [
        // decimal places, precision in meters
        {id: POSITION_PRECISION._100KM, dp: 0, precision:100000},
        {id: POSITION_PRECISION._10KM,  dp: 1, precision:10000},
        {id: POSITION_PRECISION._1KM,   dp: 2, precision:1000},
        {id: POSITION_PRECISION._100M,  dp: 3, precision:100},
        {id: POSITION_PRECISION._10M,   dp: 4, precision:10},
        {id: POSITION_PRECISION._1M,    dp: 5, precision:1},
        // {id: POSITION_PRECISION._10CM,  dp: 6, precision:0.1},
        // {id: POSITION_PRECISION._1CM,   dp: 7, precision:0.01},
        // {id: POSITION_PRECISION._1MM,   dp: 8, precision:0.001},
    ],
    [POSITION_FORMAT.DMS]: [
        // decimal places, precision in meters
        {id: POSITION_PRECISION._100KM, dp: 0, precision:100000},
        {id: POSITION_PRECISION._10KM,  dp: 0, precision:10000},
        {id: POSITION_PRECISION._1KM,   dp: 0, precision:1000},
        {id: POSITION_PRECISION._100M,  dp: 1, precision:100},
        {id: POSITION_PRECISION._10M,   dp: 2, precision:10},
        {id: POSITION_PRECISION._1M,    dp: 3, precision:1},
        // {id: POSITION_PRECISION._10CM,  dp: 4, precision:0.1},
        // {id: POSITION_PRECISION._1CM,   dp: 5, precision:0.01},
        // {id: POSITION_PRECISION._1MM,   dp: 6, precision:0.001},
    ],
    [POSITION_FORMAT.MGRS]: [
        // MGRS places, precision in meters
        {id: POSITION_PRECISION._100KM, dp: 0, precision:100000},
        {id: POSITION_PRECISION._10KM,  dp: 1, precision:10000},
        {id: POSITION_PRECISION._1KM,   dp: 2, precision:1000},
        {id: POSITION_PRECISION._100M,  dp: 3, precision:100},
        {id: POSITION_PRECISION._10M,   dp: 4, precision:10},
        {id: POSITION_PRECISION._1M,    dp: 5, precision:1},
        // {id: POSITION_PRECISION._10CM,  dp: 6, precision:0.1},
        // {id: POSITION_PRECISION._1CM,   dp: 7, precision:0.01},
        // {id: POSITION_PRECISION._1MM,   dp: 8, precision:0.001},
    ],
};
const POSITION_PRECISION_DEFAULT = POSITION_PRECISION_OPTIONS[POSITION_FORMAT_DEFAULT.id][5]; // 1m precision by default

export const PREFERENCE_MUTATION = {
    // INPUT STATE TRACKING
    SET_LANGUAGE:'preference::language',
    SET_POSITION_FORMAT:'preference::position-format',
    SET_POSITION_PRECISION:'preference::position-precision',
};

const PreferencesManager =
{
    state: () => ({
        language: { ...LANGUAGE_DEFAULT },
        positionFormat: { ...POSITION_FORMAT_DEFAULT },
        positionPrecision: { ...POSITION_PRECISION_DEFAULT }
    }),
    getters: {
        // --------------------------------------------------------------------
        // LANGUAGE
        // --------------------------------------------------------------------
        language: (state) => state.language,
        isCurrentLanguage: (state, getters) => (language) =>
        {
            if(!language)
                return false;
            const currentCode = getters.language.id;
            return currentCode === language || currentCode === language.id;
        },
        // --------------------------------------------------------------------
        // POSITION
        // --------------------------------------------------------------------
        positionFormat: (state) => state.positionFormat,
        positionPrecision: (state) => state.positionPrecision,
        isPositionFormat: (state, getters) => (format) =>
        {
            if(!format)
                return false;
            const currentCode = getters.positionFormat.id;
            return currentCode === format || currentCode === format.id;
        },
        isPositionPrecision: (state, getters) => (precision) =>
        {
            if(!precision)
                return false;
            const currentCode = getters.positionPrecision.id;
            return currentCode === precision || currentCode === precision.id;
        },
    },
    mutations: {
        // --------------------------------------------------------------------
        // LANGUAGE
        // --------------------------------------------------------------------
        /**
         * Updates the language
         *
         * Ref: LANGUAGE, LANGUAGE_OPTIONS
         *
         * @param {object} state the store state object
         * @param {string, object} payload the language details - can be either
         *        a language code as a string, a JavaScript object with a `code`
         *        property with the value of the language code as a string
         */
        [PREFERENCE_MUTATION.SET_LANGUAGE](state, payload)
        {
            if(!payload)
                return; // nothing to set with

            let language = LANGUAGE_OPTIONS_BY_CODE[payload];
            if(!language)
                language = LANGUAGE_OPTIONS_BY_CODE[payload.id];
            if(!language)
                return; // unknown language code

            state.language.label = language.label;
            state.language.abbr = language.abbr;
            state.language.id = language.id;
        },
        // --------------------------------------------------------------------
        // FORMATS
        // --------------------------------------------------------------------
        /**
         * Updates the format used for positions (lat/long etc)
         *
         * @param {object} state the store state object
         * @param {object} payload the position format details
         */
        [PREFERENCE_MUTATION.SET_POSITION_FORMAT](state, payload)
        {
            if(!payload)
                return; // nothing to set with

            let positionFormat = POSITION_FORMAT_OPTIONS_BY_CODE[payload];
            if(!positionFormat)
                positionFormat = POSITION_FORMAT_OPTIONS_BY_CODE[payload.id];
            if(!positionFormat)
                return; // unknown format

            // maintain positional accuracy between formats
            const currentPrecision = state.positionPrecision;
            const currentPrecisionKey = currentPrecision.id;
            const newPrecisionOptions = POSITION_PRECISION_OPTIONS[positionFormat.id];
            const newPrecisionOptionsByCode = DataUtils.objArrayToLookup(newPrecisionOptions, 'id');
            const newPrecision = newPrecisionOptionsByCode[currentPrecisionKey];

            state.positionFormat.label = positionFormat.label;
            state.positionFormat.id = positionFormat.id;

            state.positionPrecision.id = newPrecision.id;
            state.positionPrecision.dp = newPrecision.dp;
            state.positionPrecision.precision = newPrecision.precision;
        },
    },
    actions: {},
};

export default PreferencesManager;