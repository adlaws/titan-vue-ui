<template>
    <div
        class="titan--task-bar"
    >
        <div
            class="start"
            @click="showStartMenu=!showStartMenu"
        >
            <div class="start-button">
                <span style="font-size:200%;" class="mdi mdi-camera-iris" />
                <span class="ml-1">Start</span>
            </div>
            <div
                v-if="showStartMenu"
                class="menu"
            >
                <ul>
                    <li @click="startScenarioConstructor()">
                        <span style="font-size:200%;" class="mdi mdi-map-marker-path" />
                        <span class="ml-1">Scenario Constructor</span>
                    </li>
                    <li>
                        <span style="font-size:200%;" class="mdi mdi-account-group-outline" />
                        <span class="ml-1">Scenario Lobby</span>
                    </li>
                    <li>
                        <span style="font-size:200%;" class="mdi mdi-clipboard-edit-outline" />
                        <span class="ml-1">Scenario Debrief</span>
                    </li>
                    <li>
                        <span style="font-size:200%;" class="mdi mdi-cogs" />
                        <span class="ml-1">Options</span>
                    </li>
                    <li @click="quitApplication()">
                        <span style="font-size:200%;" class="mdi mdi-logout" />
                        <span class="ml-1">Quit</span>
                    </li>
                </ul>
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

export default {
    name: 'titan-task-bar',
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
        quitApplication()
        {
            TitanUtils.quitApplication();
        }
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

        .start-button
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
    .clock
    {
        margin-right: 24px;
    }
}
</style>
