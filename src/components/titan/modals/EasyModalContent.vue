<template>
    <div ref="container" class="easy-modal-content">
        <div class="header">
            <slot name="header" />
            <div
                v-if="!isNoClose"
                class="closeIcon"
                @click="_doCancel"
            />
        </div>
        <div class="body">
            <slot name="body" />
        </div>
        <div class="footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<script>
export default {
    name: 'easy-modal-content',
    props:
    {
        width:{type:String, default:'50%'},
        height:{type:String, default:'50%'},
        noClose:{type:[String, Boolean], default:false},
    },
    computed:
    {
        isNoClose()
        {
            // determine no-close state
            if(this.noClose === null)
                return false;
            if(typeof(this.noClose)==='string')
                return this.noClose.toLowerCase()!=='false';
            // must be boolean (by nature of the `noClose` prop's `type` requirements)
            return this.noClose === true;
        }
    },
    mounted()
    {
        let container = this.$refs.container;
        container.style.width = this.width;
        container.style.height = this.height;
    },
    methods:
    {
        _doCancel()
        {
            this.$emit('cancel');
        }
    },
};
</script>

<style lang="scss">
.easy-modal-content {
    /* Flexbox layout */
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-content: stretch;
    align-items: stretch;
    /* general appearance */
    border-radius: 2px;
    border: 2px solid #111;
    box-shadow: 0px 0px 48px rgba(0, 0, 0, 1);
    background-color: rgba(32, 32, 32, 0.9);
    width: 50%;
    height: 30%;
    .header {
        /* Flexbox layout */
        order: 0;
        flex: 0 1 auto;
        align-self: auto;
        /* general appearance */
        background-color: rgba(0, 0, 0, 1);
        margin: 2px;
        padding: 2px;
        border-radius: 2px;
        text-align: center;
        font-size: 1.2em;
        font-weight: bold;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        min-height: 1.5em;
    }
    .body {
        order: 0;
        flex: 1 1 auto;
        align-self: stretch;
        overflow-y: auto;
    }
    .footer {
        order: 0;
        flex: 0 1 auto;
        align-self: auto;
    }
}
</style>
