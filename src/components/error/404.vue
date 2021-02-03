<template>
    <error-base :error="error">
        <template #error-code>
            404
        </template>
        <template #error-heading>
            SORRY!
        </template>
        <template #error-message>
            The part of the application you were looking for cannot be found.
        </template>
        <template #icon>
            <cse-icon icon="map-marker-question" />
        </template>
    </error-base>
</template>

<script>
import { Color } from '@/assets/js/utils/color-utils.js';

import ErrorBase from './ErrorBase.vue';

export default {
    name: 'http404',
    components: {
        ErrorBase,
    },
    data()
    {
        const color1 = new Color('#F40').toRgbString();
        const color2 = new Color(color1).adjustHue(30).toRgbString();

        const _makeGrey = function(level, opacity) { return `rgba(${level},${level},${level},${opacity})`; };
        const grey1 = _makeGrey(17, 0.08);
        const grey2 = _makeGrey(21, 0.08);
        const grey3 = _makeGrey(60, 0.08);
        const grey4 = _makeGrey(74, 0.08);
        const grey5 = _makeGrey(89, 0.08);
        const grey6 = _makeGrey(95, 0.08);
        const grey7 = _makeGrey(130, 0.08);
        const grey8 = _makeGrey(156, 0.08);

        const css = 'background-image:' +
                    `radial-gradient(circle at 52% 33%, ${grey1} 0%, ${grey1} 33.333%,${grey4} 33.333%, ${grey4} 66.666%,${grey7} 66.666%, ${grey7} 99.999%),` +
                    `radial-gradient(circle at 70% 65%, ${grey7} 0%, ${grey7} 33.333%,${grey6} 33.333%, ${grey6} 66.666%,${grey3} 66.666%, ${grey3} 99.999%),` +
                    `radial-gradient(circle at 97% 89%, ${grey2} 0%, ${grey2} 33.333%,${grey5} 33.333%, ${grey5} 66.666%,${grey8} 66.666%, ${grey8} 99.999%),` +
                    `linear-gradient(15deg,${color1},${color2});`;

        return {
            error: { style: css }
        };
    },
};
</script>
