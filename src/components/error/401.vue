<template>
    <error-base :error="error">
        <template #error-code>
            401
        </template>
        <template #error-heading>
            SORRY!
        </template>
        <template #error-message>
            You don't have permission to view this.
        </template>
        <template #icon>
            <titan-icon icon="lock" />
        </template>
    </error-base>
</template>

<script>
import { Color } from '@/assets/js/utils/color-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';
import ErrorBase from './ErrorBase.vue';

export default {
    name: 'http401',
    components: {
        ErrorBase, TitanIcon,
    },
    data()
    {
        const g1color1 = new Color(this.$vuetify.theme.currentTheme.success).opacify(0.46);
        const g1color2 = g1color1.clone().darker(50);
        const g2color1 = new Color(this.$vuetify.theme.currentTheme.info);
        const g2color2 = g2color1.clone().darker(50);

        const _makeStripedGradientRGBA = function(rgbaA, rgbaB, steps)
        {
            const deltaR = (rgbaB.r - rgbaA.r) / steps;
            const deltaG = (rgbaB.g - rgbaA.g) / steps;
            const deltaB = (rgbaB.b - rgbaA.b) / steps;
            const deltaA = (rgbaB.a - rgbaA.a) / steps;
            const parts = [];
            for(let i = 0; i < steps; i++)
            {
                const r = Math.floor(rgbaA.r + (deltaR * i));
                const g = Math.floor(rgbaA.g + (deltaG * i));
                const b = Math.floor(rgbaA.b + (deltaB * i));
                const a = rgbaA.a + (deltaA * i);
                const pct1 = i / steps * 100;
                const pct2 = (i + 1) / steps * 100;
                parts.push(`rgba(${r},${g},${b},${a}) ${pct1}%, rgba(${r},${g},${b},${a}) ${pct2}%`);
            }
            return parts.join(',');
        };

        const gradient1 = _makeStripedGradientRGBA(g1color1, g1color2, 12);
        const gradient2 = _makeStripedGradientRGBA(g2color1, g2color2, 24);

        const css = 'background-image:' +
                    `linear-gradient(124deg, ${gradient1}),` +
                    `linear-gradient(316deg, ${gradient2})`;

        return {
            error: { style: css }
        };
    },
};
</script>
