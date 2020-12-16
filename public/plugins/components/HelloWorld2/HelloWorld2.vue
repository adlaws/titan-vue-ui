<template>
    <titan-window
        title="Hello World"
        icon="hand-okay"
        :x="300"
        :y="100"
        :width="275"
        :height="160"
    >
        <template #default="context">
            <titan-window-content :titan-window="context.titanWindow">
                <h1>
                    {{ greetings[greetingIdx] }}
                </h1>
                <v-btn
                    @click="changeGreeting"
                >
                    Change Language
                    <v-icon
                        right
                    >
                        mdi-earth
                    </v-icon>
                </v-btn>
            </titan-window-content>
        </template>
    </titan-window>
</template>

<script>
export default {
    name: 'hello-world-2',
    data()
    {
        return {
            greetings: [
                'Hello!', 'Bonjour!', 'Hola!', 'Zdravstvuyte!', 'Salve!', 'こんにちは！',
                'Guten Tag!', '안녕하세요!', '你好!', 'ٱلسَّلَامُ عَلَيْكُمْ‎', 'Goedendag', 'Yassas',
                'Selamat siang'
            ],
            greetingIdx: 0,
        };
    },
    methods:
    {
        changeGreeting()
        {
            this.greetingIdx = Math.floor(Math.random()*this.greetings.length);
        }
    }
};
</script>