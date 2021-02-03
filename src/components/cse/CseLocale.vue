<template>
    <div
        class="vue-os--cse-locale"
        :style="`font-size:${taskbarSize*0.25}px;`"
        @click="changeLanguage"
    >
        <span
            :title="language.label"
        >
            {{ language.abbr }}
        </span>
    </div>
</template>

<script>

import { LANGUAGE, PREFERENCE_MUTATION } from '@/assets/js/store/preference-manager.js';

export default {
    name: 'cse-locale',
    components: {

    },
    data()
    {
        return {};
    },
    computed:
    {
        taskbarSize() { return this.$store.getters.taskbarSize; },
        language() { return this.$store.getters.language; },
    },
    methods:
    {
        changeLanguage()
        {
            let nextLanguage = LANGUAGE.JAPANESE;
            if(this.language.id === LANGUAGE.JAPANESE )
                nextLanguage = LANGUAGE.ENGLISH_US;

            this.$store.commit(PREFERENCE_MUTATION.SET_LANGUAGE, nextLanguage);
        }
    }
};
</script>

<style lang="scss" scoped>
.vue-os--cse-locale
{
    max-width: 1em;
}
</style>
