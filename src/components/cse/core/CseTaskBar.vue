<template>
    <div
        ref="container"
        class="cse-desktop--task-bar"
        :class="{vertical}"
    >
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
                        <b-icon
                            size="is-large"
                            icon="map-marker-path"
                        />
                        <span class="ml-1">{{ $t('Scenario Constructor', language.id) }}</span>
                    </li>
                    <li @click="startLobby">
                        <b-icon
                            size="is-large"
                            icon="account-group-outline"
                        />
                        <span class="ml-1">{{ $t('Scenario Lobby', language.id) }}</span>
                    </li>
                    <li @click="$router.push({name:'fps'})">
                        <b-icon
                            size="is-large"
                            icon="clipboard-edit-outline"
                        />
                        <span class="ml-1">{{ $t('After Action Review', language.id) }}</span>
                    </li>
                    <li>
                        <b-icon
                            size="is-large"
                            icon="cogs"
                        />
                        <span class="ml-1">{{ $t('Options', language.id) }}</span>
                    </li>
                    <li @click="quitApplication">
                        <b-icon
                            size="is-large"
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
        <cse-location class="mr-2" />
        <cse-clock class="mr-2" />
        <cse-locale class="mr-2" />
    </div>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';
import { TITAN_MUTATION } from '@/assets/js/store/titan-manager.js';

import TitanUtils, { SIM_MODE } from '@/assets/js/titan/titan-utils.js';

import CseTaskbarWindowTile from '@/components/cse/core/CseTaskbarWindowTile.vue';
import CseClock from '@/components/cse/core/clock/CseClock.vue';
import CseLocation from '@/components/cse/core/CseLocation.vue';
import CseLocale from '@/components/cse/core/CseLocale.vue';
import CseLogo from '@/components/cse/core/CseLogo.vue';

export default {
    name: 'cse-task-bar',
    components: {
        CseTaskbarWindowTile, CseLogo,
        CseClock, CseLocation, CseLocale,
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
