<template>
    <div>
        {{ crewDescriptor.role }}: {{ crewEntry.name }}
        <b-icon
            :icon="`lock${ crewEntry.locked === false ? '-open-outline' : '' }`"
            :color="crewEntry.locked?'warning':'secondary'"
            @click="$emit('toggle-lock', crewEntry)"
        />
        <b-icon
            :icon="crewEntry.cameraLocked ? 'camera' : 'camera-outline'"
            :color="crewEntry.cameraLocked?'primary':'secondary'"
            @click="$emit('toggle-camera', crewEntry)"
        />
        <b-icon
            :icon="crewEntry.controlledBy === 'player' ? 'google-controller' : 'robot-outline'"
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