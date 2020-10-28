<template>
    <v-app id="cnrserver">
        <h1 class="display-4 font-weight-black">
            <slot name="error-code" />
        </h1>
        <h2 class="display-2 font-weight-light">
            <slot name="error-heading" />
        </h2>
        <p class="display-1 font-weight-light">
            <slot name="error-message" />
        </p>
        <router-link
            :to="{ name: 'home', params: {}}"
            class="white--text font-weight-medium"
        >
            Back to Home
        </router-link>
    </v-app>
</template>

<script>
export default {
    name: 'ErrorBase',
    components:
    {
    },
    props: {
        error: {
            type: Object,
            default: function()
            {
                const color1 = '#000';
                const color2 = this.$vuetify.theme.currentTheme.primary;

                const _makeGrey = function(level, opacity) { return `rgba(${level},${level},${level},${opacity})`; };
                const grey1 = _makeGrey(17, 0.04);
                const grey2 = _makeGrey(64, 0.04);
                const grey3 = _makeGrey(177, 0.04);
                const grey4 = _makeGrey(187, 0.04);
                const grey5 = _makeGrey(197, 0.04);
                const grey6 = _makeGrey(244, 0.04);
                // return `background-image: linear-gradient(to right, ${color1}, ${color2});`;
                const css = 'background-image:' +
                            `radial-gradient(circle at 17% 77%, ${grey1} 0%, ${grey1} 50%,${grey5} 50%, ${grey5} 100%),` +
                            `radial-gradient(circle at 26% 17%, ${grey2} 0%, ${grey2} 50%,${grey6} 50%, ${grey6} 100%),` +
                            `radial-gradient(circle at 44% 60%, ${grey3} 0%, ${grey3} 50%,${grey4} 50%, ${grey4} 100%),` +
                            `linear-gradient(19deg, ${color2},${color1});`;

                return { style: css };
            }
        }
    }, // passed in from 'parent' component
    data()
    {
        return {
            copyright: {
                year: new Date().getFullYear()
            }
        };
    },
};
</script>

<style lang="scss">
.screen-centered-icon {
    // appear behind everything else
    z-index:-1;
    // color, size
    opacity:0.125;
    color: black !important;
    font-size:90vh !important;
    // centering
    position: fixed !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
