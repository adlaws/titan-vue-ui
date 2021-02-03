<template>
    <div>
        {{ crewDescriptor.role }}: {{ crewEntry.name }}
        <cse-icon
            :icon="crewEntry.locked === false ? '-open-outline' : ''"
            :color="crewEntry.locked?'warning':'secondary'"
            @click="$emit('toggle-lock', crewEntry)"
        />
        <cse-icon
            :icon="crewEntry.cameraLocked ? 'mdi-camera' : 'mdi-camera-outline'"
            :color="crewEntry.cameraLocked?'primary':'secondary'"
            @click="$emit('toggle-camera', crewEntry)"
        />
        <cse-icon
            :icon="crewEntry.controlledBy === 'player' ? 'mdi-google-controller' : 'mdi-robot-outline'"
            :color="crewEntry.controlledBy === 'player'?'error':'secondary'"
            @click="$emit('toggle-control', crewEntry)"
        />
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