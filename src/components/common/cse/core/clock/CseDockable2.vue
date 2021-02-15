<script>
export default {
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
.cse-dockable
{
    position:fixed;
    top: 0px;
    left:0px;
}
</style>