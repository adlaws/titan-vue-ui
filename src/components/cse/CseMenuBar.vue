<template>
    <div
        ref="container"
        class="cse-desktop--menu-bar"
        :class="{vertical}"
    >
        <Button
            class="p-button-text p-button-xsm p-button-plain no-outline ml-1"
            icon="mdi mdi-menu mdi-24px"
            @click="toggleMenu"
        />

        <label
            class="ml-1 mr-1"
            :style="running?'color:#0F0;text-shadow: 0 0 4px #0F0;':'color:#DFD'"
        >
            Running
        </label>
        <InputSwitch
            v-model="running"
            class="p-inputswitch-sm"
        />

        <div class="spacer" />

        <label
            class="mr-1"
            :style="isAAR?'color:#F00;text-shadow: 0 0 4px #F00;':'color:#FDD'"
        >
            AAR
        </label>
        <InputSwitch
            v-model="isAAR"
            class="p-inputswitch-sm"
        />

        <cse-icon
            icon="account"
            size="1.5rem"
            class="ml-1"
        />
        <cse-icon
            icon="network-off-outline"
            size="1.5rem"
            class="ml-1"
        />
        <cse-icon
            icon="cog"
            size="1.5rem"
            class="ml-1"
        />

        <cse-locale
            class="ml-1 mr-1"
        />

        <cse-context-menu
            v-if="contextMenu.show"
            :items="contextMenu.items"
            :x="contextMenu.x"
            :y="contextMenu.y"
            @selected="contextMenuSelection"
            @cancelled="contextMenu.show=false"
        />
    </div>
</template>

<script>
import { TITAN_MUTATION } from '@/assets/js/store/titan-manager.js';

import TitanUtils, { SIM_MODE } from '@/assets/js/titan/titan-utils.js';

import Button from 'primevue/button';
import Ripple from 'primevue/ripple';
import InputSwitch from 'primevue/inputswitch';

export default {
    name: 'cse-menu-bar',
    components:{
        InputSwitch, Button,
    },
    directives:{
        'ripple': Ripple
    },
    props: {},
    data()
    {
        return {
            showStartMenu: false,
            vertical: false,

            running: false,
            isAAR:false,

            contextMenu:{
                show: false,
                x:0,
                y:0,
                items: []
            }
        };
    },
    computed:
    {
        windows() { return this.$store.getters.windows; },
        menubarBounds() { return this.$store.getters.menubarBounds; },
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

            container.style.top = this.menubarBounds.top;
            container.style.bottom = this.menubarBounds.bottom;
            container.style.left = this.menubarBounds.left;
            container.style.right = this.menubarBounds.right;
            container.style.width = this.menubarBounds.width;
            container.style.height = this.menubarBounds.height;

            this.vertical = this.menubarBounds.vertical || false;
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
        toggleMenu(evt)
        {
            if(!this.contextMenu.show)
            {
                const bounds = evt.target.getBoundingClientRect();
                this.contextMenu.x = bounds.x;
                this.contextMenu.y = bounds.bottom-4;
                // there must be a better way to do this and still support internationalization [adlaws]...
                this.contextMenu.items = [];
                this.contextMenu.items.push({id:'scenario-constructor', text:this.$t('Scenario Constructor', this.language.id), icon:'map-marker-path 24px'});
                this.contextMenu.items.push({id:'scenario-lobby', text:this.$t('Scenario Lobby', this.language.id), icon:'account-group-outline 24px'});
                this.contextMenu.items.push({id:'scenario-aar', text:this.$t('After Action Review', this.language.id), icon:'clipboard-edit-outline 24px'});
                this.contextMenu.items.push({separator:true});
                this.contextMenu.items.push({id:'quit',text:this.$t('Quit', this.language.id),icon:'power 24px'});
            }
            this.contextMenu.show = !this.contextMenu.show;
        },
        contextMenuSelection(selection)
        {
            this.contextMenu.show = false;
            const actions = {
                'scenario-constructor': this.startScenarioConstructor,
                'scenario-lobby': this.startLobby,
                'scenario-aar': () => {},
            };
            const action = actions[selection.id];
            if(action)
                action();
            else
                console.log(action);
        },
    },
};
</script>
