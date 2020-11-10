<template>
    <div>
        <h1>Howdy!!</h1>
        <h2>{{ currentSimMode }}</h2>
        <h2>{{ JSON.stringify(plugins) }}</h2>
    </div>
</template>

<script>
export default {
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
        plugins() { return this.$store.getters.plugins; },
    }
};
</script>
