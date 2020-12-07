import en_US from './en-US.json';
import ja_JP from './ja-JP.json';

export const LOCALE = {
    ENGLISH_US: 'en-US',
    JAPANESE: 'ja-JP',
};

export const LANGUAGE = {
    [LOCALE.ENGLISH_US]:en_US,
    [LOCALE.JAPANESE]:ja_JP,
};

export const DEFAULT_LOCALE = LOCALE.ENGLISH_US;

// ref: https://kazupon.github.io/vue-i18n/guide/datetime.html
export const dateTimeFormats = {
    [LOCALE.ENGLISH_US]: {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        }
    },
    [LOCALE.JAPANESE]: {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: true
        }
    }
};

// ref: https://kazupon.github.io/vue-i18n/guide/number.html#custom-formatting
export const numberFormats = {
    [LOCALE.ENGLISH_US]: {
        currency: {
            style: 'currency', currency: 'USD'
        }
    },
    [LOCALE.JAPANESE]: {
        currency: {
            style: 'currency', currency: 'JPY', currencyDisplay: 'symbol'
        }
    }
};
