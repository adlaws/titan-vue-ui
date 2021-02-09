<template>
    <div
        style="position:absolute;width:100%;height:100%;display:block;top:0;left:0;bottom:0;right:0;"
        :style="error.style"
    >
        <div class="screen-centered">
            <h1>
                <slot name="error-code" />
            </h1>
            <h2>
                <slot name="error-heading" />
            </h2>
            <p>
                <slot name="error-message" />
            </p>
            <p>
                <router-link
                    :to="{ name: 'cse', params: {}}"
                    style="color:white;text-decoration:none;"
                >
                    Back to Home
                </router-link>
            </p>
        </div>
        <div class="screen-centered-icon">
            <slot name="icon">
                <cse-icon icon="alert" />
            </slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'error-base',
    props: {
        error: {
            type: Object,
            default: function()
            {
                const color1 = '#000';
                const color2 = '#08f';

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
.screen-centered {
    z-index:2;
    // color, size
    color: black !important;
    // font-size:90vh !important;
    // centering
    position: fixed !important;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    h1{
        font-size:800%;
        text-align: center;
    }
    h2{
        font-size:200%;
        text-align: center;
    }
    p{
        text-align: center;
    }
}
.screen-centered-icon {
    // appear behind everything else
    z-index:1;
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
