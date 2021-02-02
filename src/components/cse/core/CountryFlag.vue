<template>
    <span
        class="flag-icon"
        :class="`flag-icon-${country.alpha2}`"
        :title="title||country.name"
        :style="`font-size:${size};`"
    />
</template>

<script>
import { COUNTRY } from '@/assets/js/utils/countries.js';

export default {
    name:'country-flag-icon',
    props:
    {
        alpha2:
        {
            type:String,
            default:null,
        },
        alpha3:
        {
            type:String,
            default:null,
        },
        numeric:
        {
            type:Number,
            default:-1,
        },
        name:
        {
            type:String,
            default:null,
        },
        title:
        {
            type:String,
            default:null,
        },
        size:
        {
            type: String,
            default: 'inherit'
        }
    },
    computed:
    {
        country()
        {
            let country = null;

            if(this.alpha2 !== null)
                country = COUNTRY.ALPHA2[this.alpha2];
            if(country === null && this.alpha3 !== null)
                country = COUNTRY.ALPHA3[this.alpha3];
            if(country === null && this.numeric >= 0)
                country = COUNTRY.NUMERIC[this.alpha3];
            if(country === null && this.name !== null)
                country = COUNTRY.NAME[this.name];

            if(country === null)
                country = {name: this.name||'UNKNOWN', alpha2: this.alpha2||'--', alpha3: this.alpha3||'---', numeric: this.numeric||-1};

            return country;
        }
    }
};
</script>