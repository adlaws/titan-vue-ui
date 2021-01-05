<template>
    <v-text-field
        v-model="displayValue"
        reverse
        :rules="[validation,]"
        :prefix="displayUnits.abbr"
    />
</template>

<script>
import Convert, { SPEED_UNITS } from '@/assets/js/utils/convert-utils.js';

const CONVERTER = Convert.speed;
const SI_UNITS = SPEED_UNITS.METERS_PER_SECOND;

const FLOAT_REGEX = /^[+-]?\d+(\.\d+)?$/;

export default {
    name: 'speed-field',
    props:
    {
        value:
        {
            type: [Number, String,],
            default: 0.0
        },
        displayUnits:
        {
            type: Object,
            default: () => SI_UNITS
        }
    },
    data()
    {
        return {
            displayValue: 0.0,
            validation: (value) =>
            {
                const isValid = FLOAT_REGEX.test(value);
                if(!isValid)
                    return 'A number is required';

                const siValue = CONVERTER(value, this.displayUnits.id, SI_UNITS.id);
                this.$emit('input', parseFloat(siValue));

                return true;
            }
        };
    },
    mounted()
    {
        let value = parseFloat(this.value);
        value = isNaN(value) ? 0 : value;
        this.displayValue = CONVERTER(value, SI_UNITS.id, this.displayUnits.id);
    },
};

</script>