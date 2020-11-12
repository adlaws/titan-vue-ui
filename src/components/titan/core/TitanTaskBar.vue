<template>
    <div
        ref="container"
        class="titan--task-bar"
        :class="{vertical}"
    >
        <div
            class="start"
            @click="showStartMenu=!showStartMenu"
        >
            <div class="startitan-button">
                <titan-icon
                    :style="`font-size:${taskbarSize*0.666}px;`"
                    icon="camera-iris"
                />
            </div>
            <div
                v-show="showStartMenu"
                :style="`bottom:${taskbarSize}px;`"
                class="menu"
            >
                <ul>
                    <li @click="startScenarioConstructor()">
                        <titan-icon style="font-size:200%;" icon="map-marker-path" />
                        <span class="ml-1">Scenario Constructor</span>
                    </li>
                    <li @click="startLobby()">
                        <titan-icon style="font-size:200%;" icon="account-group-outline" />
                        <span class="ml-1">Scenario Lobby</span>
                    </li>
                    <li>
                        <titan-icon style="font-size:200%;" icon="clipboard-edit-outline" />
                        <span class="ml-1">Scenario Debrief</span>
                    </li>
                    <li>
                        <titan-icon style="font-size:200%;" icon="cogs" />
                        <span class="ml-1">Options</span>
                    </li>
                    <li @click="quitApplication()">
                        <titan-icon
                            style="font-size:200%;"
                            icon="logout"
                        />
                        <span class="ml-1">Quit</span>
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
        <div
            class="spacer"
        />
        <titan-clock />
    </div>
</template>

<script>
import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';
import { TITAN_MUTATION } from '@/assets/js/store/titan-manager.js';

import TitanUtils, { SIM_MODE } from '@/assets/js/titan/titan-utils.js';

import TitanTaskbarWindowTile from '@/components/titan/core/TitanTaskbarWindowTile.vue';
import TitanClock from '@/components/titan/core/TitanClock.vue';
import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name: 'titan-task-bar',
    components: {
        TitanTaskbarWindowTile, TitanClock, TitanIcon
    },
    props: {},
    data()
    {
        return {
            showStartMenu: false,
            vertical: false,
            theTime: '00:00am',
        };
    },
    computed:
    {
        windows() { return this.$store.getters.windows; },
        taskbarSize() { return this.$store.getters.taskbarSize; },
        taskbarBounds() { return this.$store.getters.taskbarBounds; },
        desktopBounds() { return this.$store.getters.desktopBounds; },
        screenSize() { return this.$store.getters.screenSize; },
    },
    mounted()
    {
        this.updateTheTime();
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
        updateTheTime()
        {
            const now = new Date();
            let hours = now.getHours();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours > 12 ? hours - 12 : hours;
            hours = (hours < 10 ? '0' : '') + hours;
            let minutes = now.getMinutes();
            minutes = (minutes < 10 ? '0' : '') + minutes;
            this.theTime = `${hours}:${minutes}${ampm}`;
            const nextRefresh = ((60 - now.getSeconds()) * 1000) + 500;
            setTimeout(this.updateTheTime, nextRefresh);
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

<style lang="scss">
.titan--task-bar
{
    position: absolute;
    bottom:0;
    left:0;
    right:0;
    width:100vw;
    height:64px;

    background-color: rgba(0,16,32,0.9);
    backdrop-filter: blur(10px);
    color:#CCC;
    box-shadow: 0 0 16px rgba(0,0,0,0.8);

    z-index: 1024;
    user-select: none;

    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;

    .start
    {
        margin-left: 24px;

        .startitan-button
        {
            display: flex;
            flex-wrap: nowrap;
            justify-content: flex-start;
            align-items: center;
            &:hover
            {
                cursor: pointer;
                color: white;
                text-shadow:0 0 10px rgba(255,255,255,0.25);
            }
        }

        .menu
        {
            z-index: 1025;
            box-shadow: 0 0 16px rgba(0,0,0,0.8);
            background-color: rgba(0,32,64,0.9);
            padding: 0;
            margin: 0;
            position: absolute;
            bottom: 64px;
            left: 0px;
            ul
            {
                margin:0;
                padding:0;
                list-style: none;
                li
                {
                    display: flex;
                    flex-wrap: nowrap;
                    justify-content: flex-start;
                    align-items: center;

                    margin:0px;
                    padding: 12px 24px;
                    &:hover
                    {
                        cursor: pointer;
                        color: white;
                        background-color: rgba(0,64,128,0.9);
                    }
                }
            }
        }
    }


    .spacer
    {
        flex-grow: 1;
    }
}
</style>
