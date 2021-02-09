<template>
    <div
        ref="container"
        class="cse-desktop--task-bar"
        :class="{vertical}"
    >
        <cse-location class="ml-1" />
        <div
            class="start"
            @click="showStartMenu=!showStartMenu"
        >
            <div class="start-cse-button">
                <cse-logo
                    :size="taskbarSize*0.666"
                />
            </div>
            <div
                v-show="showStartMenu"
                :style="`bottom:${taskbarSize}px;`"
                class="menu"
            >
                <ul>
                    <li @click="startScenarioConstructor">
                        <cse-icon
                            icon="map-marker-path"
                            size="200%"
                        />
                        <span class="ml-1">{{ $t('Scenario Constructor', language.id) }}</span>
                    </li>
                    <li @click="startLobby">
                        <cse-icon
                            icon="account-group-outline"
                            size="200%"
                        />
                        <span class="ml-1">{{ $t('Scenario Lobby', language.id) }}</span>
                    </li>
                    <li @click="$router.push({name:'fps'})">
                        <cse-icon
                            icon="clipboard-edit-outline"
                            size="200%"
                        />
                        <span class="ml-1">{{ $t('After Action Review', language.id) }}</span>
                    </li>
                    <li>
                        <cse-icon
                            icon="cogs"
                            size="200%"
                        />
                        <span class="ml-1">{{ $t('Options', language.id) }}</span>
                    </li>
                    <li @click="quitApplication">
                        <cse-icon
                            icon="logout"
                            size="200%"
                        />
                        <span class="ml-1">{{ $t('Quit', language.id) }}</span>
                    </li>
                </ul>
            </div>
        </div>
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
        <!-- {{ uiModeState }} -->
        <div
            class="spacer"
        />
        Calytrix CSE <sup>&copy;2021</sup>
        <div
            class="spacer"
        />
        <div>
            <cse-icon
                :icon="false?'map':'earth'"
                class="clickable mr-1"
            />
        </div>
    </div>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';
import { TITAN_MUTATION } from '@/assets/js/store/titan-manager.js';

import TitanUtils, { SIM_MODE } from '@/assets/js/titan/titan-utils.js';

export default {
    name: 'cse-task-bar',
    props: {},
    data()
    {
        return {
            showStartMenu: false,
            vertical: false,
        };
    },
    computed:
    {
        windows() { return this.$store.getters.windows; },
        taskbarSize() { return this.$store.getters.taskbarSize; },
        taskbarBounds() { return this.$store.getters.taskbarBounds; },
        desktopBounds() { return this.$store.getters.desktopBounds; },
        screenSize() { return this.$store.getters.screenSize; },
        uiModeState() { return this.$store.getters.uiModeState; },
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
        startScenarioConstructor()
        {
            this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.EDITOR);
        },
        startLobby()
        {
            this.$store.commit(TITAN_MUTATION.CHANGE_SIM_MODE, SIM_MODE.ADMIN);
        },
        quitApplication()
        {
            TitanUtils.quitApplication();
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
