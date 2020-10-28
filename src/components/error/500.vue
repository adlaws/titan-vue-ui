<template>
    <error-base :error="error">
        <template #error-code>
            500
            <v-icon class="screen-centered-icon">
                mdi-alert-octagram
            </v-icon>
        </template>
        <template #error-heading>
            SORRY!
        </template>
        <template #error-message>
            Internal server error!
        </template>
    </error-base>
</template>

<script>
import ErrorBase from './ErrorBase.vue';

export default {
    name: 'Http500',
    components: {
        ErrorBase
    },
    data()
    {
        const color1 = '#000';
        const color2 = this.$vuetify.theme.currentTheme.error;

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
