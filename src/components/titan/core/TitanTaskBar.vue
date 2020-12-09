<template>
    <div
        ref="container"
        class="titan-desktop--task-bar"
        :class="{vertical}"
    >
        <div
            class="start"
            @click="showStartMenu=!showStartMenu"
        >
            <div class="startitan-button">
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
                    <li @click="startScenarioConstructor()">
                        <titan-icon size="200%;" icon="map-marker-path" />
                        <span class="ml-1">{{ $t('Scenario Constructor', language.id) }}</span>
                    </li>
                    <li @click="startLobby()">
                        <titan-icon size="200%;" icon="account-group-outline" />
                        <span class="ml-1">{{ $t('Scenario Lobby', language.id) }}</span>
                    </li>
                    <li>
                        <titan-icon size="200%;" icon="clipboard-edit-outline" />
                        <span class="ml-1">{{ $t('After Action Review', language.id) }}</span>
                    </li>
                    <li>
                        <titan-icon size="200%;" icon="cogs" />
                        <span class="ml-1">{{ $t('Options', language.id) }}</span>
                    </li>
                    <li @click="quitApplication()">
                        <titan-icon
                            size="200%;"
                            icon="logout"
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
        <titan-taskbar-window-tile
            v-for="(window, idx) in windows"
            :key="`win-${idx}`"
            :window="window"
            @click.native="focusWindow(window)"
            @dblclick.native="toggleWindow(window)"
        />
        {{ uiModeState }}
        <div
            class="spacer"
        />
        <titan-location class="mr-2" />
        <titan-clock class="mr-2" />
        <titan-locale class="mr-2" />
    </div>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';
import { TITAN_MUTATION } from '@/assets/js/store/titan-manager.js';

import TitanUtils, { SIM_MODE } from '@/assets/js/titan/titan-utils.js';

import TitanTaskbarWindowTile from '@/components/titan/core/TitanTaskbarWindowTile.vue';
import TitanClock from '@/components/titan/core/TitanClock.vue';
import TitanLocation from '@/components/titan/core/TitanLocation.vue';
import TitanLocale from '@/components/titan/core/TitanLocale.vue';
import TitanIcon from '@/components/titan/core/TitanIcon.vue';
import CseLogo from '@/components/titan/core/CseLogo.vue';

export default {
    name: 'titan-task-bar',
    components: {
        TitanTaskbarWindowTile, TitanIcon, CseLogo,
        TitanClock, TitanLocation, TitanLocale,
    },
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
