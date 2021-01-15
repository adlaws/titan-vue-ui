<template>
    <div>
        {{ crewDescriptor.role }}: {{ crewEntry.name }}
        <v-icon
            :color="crewEntry.locked?'warning':'secondary'"
            @click="$emit('toggle-lock', crewEntry)"
        >
            mdi-lock{{ crewEntry.locked === false ? '-open-outline' : '' }}
        </v-icon>
        <v-icon
            :color="crewEntry.cameraLocked?'primary':'secondary'"
            @click="$emit('toggle-camera', crewEntry)"
        >
            {{ crewEntry.cameraLocked ? 'mdi-camera' : 'mdi-camera-outline' }}
        </v-icon>
        <v-icon
            :color="crewEntry.controlledBy === 'player'?'error':'secondary'"
            @click="$emit('toggle-control', crewEntry)"
        >
            {{ crewEntry.controlledBy === 'player' ? 'mdi-google-controller' : 'mdi-robot-outline' }}
        </v-icon>
    </div>
</template>

<script>
export default {
    name:'crew-entry',
    props:{
        crewDescriptor:
        {
            type: Object,
            required: true,
        },
        crewEntry:
        {
            type: Object,
            required: true,
        },
    },
};
</script>