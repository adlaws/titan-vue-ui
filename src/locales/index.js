import en_US from './en-US.json';
import ja_JP from './ja-JP.json';

export const defaultLocale = 'en-US';

export const languages = {
    'en-US':en_US,
    'ja-JP':ja_JP,
};

// ref: https://kazupon.github.io/vue-i18n/guide/datetime.html
export const dateTimeFormats = {
    'en-US': {
        short: {
            year: 'numeric', month: 'short', day: 'numeric'
        },
        long: {
            year: 'numeric', month: 'short', day: 'numeric',
            weekday: 'short', hour: 'numeric', minute: 'numeric'
        }
    },
    'ja-JP': {
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
    'en-US': {
        currency: {
            style: 'currency', currency: 'USD'
        }
    },
    'ja-JP': {
        currency: {
            style: 'currency', currency: 'JPY', currencyDisplay: 'symbol'
        }
    }
};
