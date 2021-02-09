<template>
    <span>{{ elevationText }}</span>
</template>

<script>
import Convert, { LENGTH_UNITS } from '@/assets/js/utils/convert-utils.js';

const CONVERTER = Convert.length;
const SI_UNITS = LENGTH_UNITS.METERS;

export default {
    name: 'elevation',
    props:
    {
        elevation:{
            type: Number,
            default: 0.0,
        },
        units:
        {
            type: Object,
            default: () => SI_UNITS
        },
        precision:{
            type: Number,
            default: 2,
        },
    },
    computed:
    {
        elevationText()
        {
            const unitsValue = CONVERTER(this.elevation, SI_UNITS.id, this.units.id);
            return unitsValue.toFixed(this.precision) + this.units.abbr;
        },
    },
};
</script>
