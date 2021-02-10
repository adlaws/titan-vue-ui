<template>
    <div
        ref="container"
        class="cse-desktop--task-bar"
        :class="{vertical}"
    >
        <cse-location class="ml-1" />

        <div
            class="spacer"
            :style="`max-${vertical?'height':'width'}:${taskbarSize*0.25}px;`"
        />

        <cse-taskbar-window-tile
            v-for="(window, idx) in windows"
            :key="`win-${idx}`"
            :window="window"
            @click.native="focusWindow(window)"
            @dblclick.native="toggleWindow(window)"
        />

        <div class="spacer" />

        <div
            v-ripple
            class="clickable p-ripple"
        >
            <cse-icon
                :icon="is3D?'axis-arrow':'map'"
            />
            <span class="mr-1">
                {{ is3D?'3':'2' }}D
            </span>
        </div>
    </div>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';

import Ripple from 'primevue/ripple';

export default {
    name: 'cse-task-bar',
    directives: {
        'ripple': Ripple
    },
    props: {},
    data()
    {
        return {
            showStartMenu: false,
            vertical: false,
            is3D:true,
        };
    },
    computed:
    {
        windows() { return this.$store.getters.windows; },
        taskbarSize() { return this.$store.getters.taskbarSize; },
        taskbarBounds() { return this.$store.getters.taskbarBounds; },
        language() {return this.$store.getters.language; },
    },
    mounted()
    {
        this.updateAlignment();
    },
    methods:
    {
        updateAlignment()
        {
            const container = this.$refs.container;

            container.style.top = this.taskbarBounds.top;
            container.style.bottom = this.taskbarBounds.bottom;
            container.style.left = this.taskbarBounds.left;
            container.style.right = this.taskbarBounds.right;
            container.style.width = this.taskbarBounds.width;
            container.style.height = this.taskbarBounds.height;

            this.vertical = this.taskbarBounds.vertical || false;
        },
        focusWindow(window)
        {
            const winInstance = window.managed.instance;

            if(winInstance.isMaximized())
                winInstance.maximize();
            else if(winInstance.isMinimized())
                winInstance.restore();

            this.$store.commit(DESKTOP_MUTATION.WINDOW_TO_FRONT, {id: window.id});
        },
        toggleWindow(window)
        {
            const winInstance = window.managed.instance;

            if(winInstance.isMinimized())
                this.focusWindow(window);
            else
                winInstance.minimize();
        },
    },
};
</script>
