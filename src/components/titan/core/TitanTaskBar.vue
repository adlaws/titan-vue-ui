<template>
    <div
        class="titan--task-bar"
    >
        <div
            class="start"
            @click="showStartMenu=!showStartMenu"
        >
            <div class="startitan-button">
                <titan-icon style="font-size:200%;" icon="camera-iris" />
                <span class="ml-1">Start</span>
            </div>
            <div
                v-if="showStartMenu"
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
                        <titan-icon style="font-size:200%;" icon="logout" />
                        <span class="ml-1">Quit</span>
                    </li>
                </ul>
            </div>
        </div>
        <div class="spacer" style="max-width:24px;" />
        <div
            v-for="(window, idx) in windows"
            :key="`win-${idx}`"
            class="window-tile"
            :class="{active:window.active}"
            :title="window.title"
            @click="focusWindow(window)"
            @dblclick="toggleWindow(window)"
        >
            <titan-icon
                v-if="window.icon"
                :icon="window.icon"
            />
            <div v-else>
                {{ window.title.charAt(0).toUpperCase() }}
            </div>
        </div>
        <div class="spacer" />
        <div class="clock">
            {{ theTime }}
        </div>
    </div>
</template>

<script>
import {STORE_MUTATION} from '@/assets/js/store/store.js';

import TitanUtils, { SIM_MODE } from '@/assets/js/titan/titan-utils.js';

import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name: 'titan-task-bar',
    components: {
        TitanIcon
    },
    props: {},
    data()
    {
        return {
            showStartMenu: false,
            theTime: '00:00am',
        };
    },
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
        windows() { return this.$store.getters.windows; },
    },
    mounted()
    {
        this.updateTheTime();
    },
    methods:
    {
        updateTheTime()
        {
            const now = new Date();
            let hours = now.getHours();
            const ampm = hours > 12 ? 'PM' : 'AM';
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
            this.$store.commit(STORE_MUTATION.CHANGE_SIM_MODE, SIM_MODE.EDITOR);
        },
        startLobby()
        {
            this.$store.commit(STORE_MUTATION.CHANGE_SIM_MODE, SIM_MODE.ADMIN);
        },
        quitApplication()
        {
            TitanUtils.quitApplication();
        },
        focusWindow(window)
        {
            if(window.instance.isMaximized())
                window.instance.maximize();
            if(window.instance.isMinimized())
                window.instance.restore();
            this.$store.commit(STORE_MUTATION.WINDOW_TO_FRONT, {id: window.id});
        },
        toggleWindow(window)
        {
            if(window.instance.isMinimized())
                this.focusWindow(window);
            else
                window.instance.minimize();
        },
    },
};
</script>

<style lang="scss">
.titan--task-bar
{
    width:100vw;
    height:64px;
    background-color: rgba(0,16,32,0.9);
    backdrop-filter: blur(10px);
    color:#CCC;
    box-shadow: 0 0 16px rgba(0,0,0,0.8);

    z-index: 1024;
    user-select: none;

    position: absolute;
    bottom:0;
    left:0;
    right:0;

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
    .window-tile
    {
        width: 48px;
        height: 48px;
        font-size:40px;
        line-height:40px;

        margin: 0;
        padding: 0;

        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
        align-items: center;

        background-color: rgba(0,16,32,1.0);
        border:1px solid rgba(0,32,64,1.0);
        border-radius:4px;
        margin-right:8px;
        cursor: pointer;
        &:hover
        {
            border:1px solid rgba(0,32,64,1.0);
            background-color: rgba(0,32,64,1.0);
            box-shadow: 0 0 8px rgba(0,16,32,1.0);
        }
        &.active
        {
            border:1px solid rgba(0,48,96,1.0);
            background-color: rgba(0,48,96,1.0);
            box-shadow: 0 0 8px rgba(0,32,64,1.0);
            &:hover
            {
                border:1px solid rgba(0,64,128,1.0);
                background-color: rgba(0,64,128,1.0);
                box-shadow: 0 0 8px rgba(0,48,96,1.0);
            }
        }
    }
    .spacer
    {
        flex-grow: 1;
    }
    .clock
    {
        margin-right: 24px;
    }
}
</style>
