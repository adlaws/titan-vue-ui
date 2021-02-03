import Vue from 'vue';
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/arya-blue/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

const primeVueOptions = {
    ripple: true
};

Vue.use(PrimeVue, primeVueOptions);
