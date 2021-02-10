<template>
    <div
        ref="container"
        class="cse-desktop--controlled-entity-indicator"
        :style="{width:controlledEntity?'15rem':'auto'}"
    >
        <cse-icon
            :icon="`google-controller${controlledEntity?'':'-off'}`"
            size="1.5rem"
            class="clickable"
            @click="controlledEntity='V-Dagger (JTAC)'"
        />
        <span
            v-if="controlledEntity"
            class="p-ml-1 p-mr-1"
        >
            {{ controlledEntity }}
        </span>
        <cse-icon
            v-if="controlledEntity"
            icon="close"
            size="1.5rem"
            class="clickable"
            @click="controlledEntity=null"
        />
    </div>
</template>

<script>
import { $isInOuterra, /* $tWorldInterface */} from '@/assets/js/titan/titan-utils.js';

// import UiUtils from '@/assets/js/utils/ui-utils.js';

export default {
    name:'controlled-entity-indicator',
    props:
    {
        dock: {
            type: String,
            default: 'nw'
        },
        padding: {
            type: Object,
            default: () => { return {x:16, y:16}; },
        },
    },
    data()
    {
        return {
            controlledEntity: 'V-Dagger (JTAC)',
            container: null,
            resizeObserver: null,
        };
    },
    computed:
    {
        desktopBounds() { return this.$store.getters.desktopBounds; },
        lcasedock() { return this.dock.toLowerCase(); },
        dockedLeft() { return this.lcasedock.indexOf('w') !== -1; },
        dockedRight() { return this.lcasedock.indexOf('e') !== -1; },
        dockedCenterX() { return !this.dockedLeft && !this.dockedRight; },
        dockedTop() { return this.lcasedock.indexOf('n') !== -1; },
        dockedBottom() { return this.lcasedock.indexOf('s') !== -1; },
        dockedCenterY() { return !this.dockedTop && !this.dockedBottom; },
    },
    watch:
    {
        desktopBounds() { this.updatePosition(); },
    },
    mounted()
    {
        if($isInOuterra)
        {
            // const activeScenario = $tWorldInterface.getActiveScenario();
        }
        this.container = this.$refs.container;
        this.resizeObserver = new ResizeObserver(this.updatePosition).observe(this.container);
        this.updatePosition();
    },
    methods:
    {
        updatePosition()
        {
            if(!this.container)
                return;

            const bounds = this.container.getBoundingClientRect();

            const style = this.container.style;
            if(this.dockedLeft)
                style.left = this.desktopBounds.left + this.padding.x + 'px';
            else if(this.dockedRight)
                style.left = this.desktopBounds.right - bounds.width - this.padding.x + 'px';
            else
                style.left = this.desktopBounds.left + ((this.desktopBounds.w - bounds.width) / 2) + 'px';

            if(this.dockedTop)
                style.top = this.desktopBounds.top + this.padding.y + 'px';
            else if(this.dockedBottom)
                style.top = this.desktopBounds.bottom - bounds.height - this.padding.y + 'px';
            else
                style.top = this.desktopBounds.top + ((this.desktopBounds.h - bounds.height) / 2) + 'px';

        },
    }
};
</script>

<style lang="scss">
.cse-desktop--controlled-entity-indicator
{
    display:flex;
    align-items: center;
    justify-content: space-between;

    position:absolute;
    top: 0px;
    left:0px;

    font-size:0.9rem;

    padding: 4px;

    height: 1.8rem;
    background: rgba(0,64,128,1);
    color: white;

    box-shadow: 0 0 8px rgba(0,0,0,0.5);
}
</style>