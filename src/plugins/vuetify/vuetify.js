import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const opts = {
    theme: {
        options: {
            customProperties: true, // create CSS variables for theme colors
        },
        dark: true,
        themes: {
            light: {
                accent: '#024',
            },
            dark: {
                accent: '#08F',
            },
        },
    }
};

export default new Vuetify(opts);