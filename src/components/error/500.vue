<template>
    <error-base :error="error">
        <template #error-code>
            500
        </template>
        <template #error-heading>
            SORRY!
        </template>
        <template #error-message>
            Internal server error!
        </template>
        <template #icon>
            <titan-icon icon="alert-octagram" />
        </template>
    </error-base>
</template>

<script>
import TitanIcon from '@/components/titan/core/TitanIcon.vue';
import ErrorBase from './ErrorBase.vue';

export default {
    name: 'http500',
    components: {
        ErrorBase, TitanIcon
    },
    data()
    {
        const color1 = '#000';
        const color2 = 'red';

        const _makeGrey = function(level, opacity) { return `rgba(${level},${level},${level},${opacity})`; };
        const grey1 = _makeGrey(40, 0.04);
        const grey2 = _makeGrey(111, 0.04);
        const grey3 = _makeGrey(141, 0.04);
        const grey4 = _makeGrey(248, 0.04);
        const css = 'background-image:' +
                    `linear-gradient(229deg, ${grey4} 0%, ${grey4} 54%,${grey2} 54%, ${grey2} 100%),` +
                    `linear-gradient(239deg, ${grey4} 0%, ${grey4} 66%,${grey2} 66%,${grey2} 100%),` +
                    `linear-gradient(141deg, ${grey1} 0%, ${grey1} 44%,${grey3} 44%, ${grey3} 100%),` +
                    `linear-gradient(287deg, ${grey1} 0%, ${grey1} 78%,${grey3} 78%,${grey3} 100%),` +
                    `linear-gradient(90deg, ${color1},${color2});`;

        return {
            error: { style: css }
        };
    },
};
</script>
