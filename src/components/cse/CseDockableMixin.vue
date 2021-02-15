<!--
    A mixin which provides the basics for 'dockable' functionality in the context
    of the desktop area.

    Example component definition using the mixin:

        <template>
            <div>
                DOCKED CONTENT
            </div>
        </template>

        <script>
            import CseDockableMixin from '@/components/cse/CseDockableMixin.vue';
            export default {
                name: 'my-dockable',
                mixins: [CseDockableMixin],
            };
        </script>

    Example use of component:

        <my-dockable dock="nw" :padding-x="16" :padding-y="16" />

    Properties:
        dock {String}
            Accepts 'n', 's', 'e', 'w' (case insensitive) and 'sensible' combinations
            thereof ('nw', for example). Defaults to 'nw' (top left)
        paddingX {Number}
            The number of pixels to offset the dockable from its "normal" position
            along the x-axis. For example, if the dockable is docked to the west/left,
            and paddingX is 8, the dockable will be offset from the left edge by
            8 pixels.
        paddingY {Number}
            The number of pixels to offset the dockable from its "normal" position
            along the x-axis. For example, if the dockable is docked to the north/top,
            and paddingY is 8, the dockable will be offset from the top edge by
            8 pixels.
        useScreenBounds {Boolean}
            When positioning the dockable, use the *entire* available screen space,
            ignoring the fact that the taskbar/menubar may be occupying the top
            and/or bottom of the desktop
-->

<script>
export default {
    props:
    {
        dock: {
            type: String,
            default: 'nw'
        },
        paddingX: {
            type: Number,
            default: 0,
        },
        paddingY: {
            type: Number,
            default: 0,
        },
        useScreenBounds: {
            type: Boolean,
            default: false,
        }
    },
    data()
    {
        return {
            container: null,
            resizeObserver: null,
        };
    },
    computed:
    {
        dockingBounds() { return this.useScreenBounds ? this.$store.getters.screenBounds : this.$store.getters.desktopBounds; },
        lcasedock() { return this.dock.toLowerCase(); },
        dockedLeft() { return this.lcasedock.indexOf('w') !== -1; },
        dockedRight() { return !this.dockedLeft && this.lcasedock.indexOf('e') !== -1; },
        dockedCenterX() { return !this.dockedLeft && !this.dockedRight; },
        dockedTop() { return this.lcasedock.indexOf('n') !== -1; },
        dockedBottom() { return !this.dockedTop && this.lcasedock.indexOf('s') !== -1; },
        dockedCenterY() { return !this.dockedTop && !this.dockedBottom; },
    },
    watch:
    {
        'dockingBounds.width':function() { this._updatePosition(); },
        'dockingBounds.height':function() { this._updatePosition(); },
        dock() { this._updatePosition(); },
        paddingX() { this._updatePosition(); },
        paddingY() { this._updatePosition(); },
    },
    mounted()
    {
        this._initialize();
    },
    destroyed()
    {
        this._tearDown();
    },
    methods:
    {
        _initialize()
        {
            this.container = this.$el;
            this.container.classList.add('cse-dockable');
            this.resizeObserver = new ResizeObserver(this._updatePosition).observe(this.container);
            this._updatePosition();
        },
        _tearDown()
        {
            delete this.resizeObserver;
        },
        _updatePosition()
        {
            const bounds = this.container.getBoundingClientRect();
            const style = this.container.style;

            let xPos = 0;
            if(this.dockedLeft)
                xPos = this.dockingBounds.left + this.paddingX;
            else if(this.dockedRight)
                xPos = this.dockingBounds.right - bounds.width - this.paddingX;
            else
                xPos = this.dockingBounds.left + ((this.dockingBounds.width - bounds.width) / 2) + this.paddingX;

            let yPos = 0;
            if(this.dockedTop)
                yPos = this.dockingBounds.top + this.paddingY;
            else if(this.dockedBottom)
                yPos = this.dockingBounds.bottom - bounds.height - this.paddingY;
            else
                yPos = this.dockingBounds.top + ((this.dockingBounds.height - bounds.height) / 2) + this.paddingY;

            style.left = xPos + 'px';
            style.top = yPos + 'px';
        },
    }
};
</script>

<style lang="scss">
.cse-dockable
{
    position:fixed;
    top: 0px;
    left:0px;
}
</style>