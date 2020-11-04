<template>
    <div
        ref="image"
        class="vue-os--img-fallback"
        :style="`width:${theWidth};height:${theHeight};`"
    />
</template>

<script>
export default {
    name:'img-fallback2',
    props:
    {
        width:{
            type: [String,Number],
            default: '64px',
        },
        height:{
            type: [String,Number],
            default: '64px',
        },
        src:
        {
            type: String,
            default: '',
        },
        fallback:
        {
            type: String,
            default: '',
        },
        loading:
        {
            type: String,
            default: '',
        }
    },
    data()
    {
        return {
            theWidth: '64px',
            theHeight: '64px',
        };
    },
    watch:
    {
        src() { this._doImage(); },
        fallback() { this._doImage(); },
        width() { this._updateSize(); },
        height() { this._updateSize(); },
    },
    mounted()
    {
        this._doImage();
    },
    methods:
    {
        _doImage()
        {
            this._updateSize();

            const imgElm = this.$refs.image;
            const imgElmStyle = imgElm.style;

            const img = new Image();

            let loading = this.loading;
            let fallback = this.fallback;
            let original = this.src;

            imgElmStyle.backgroundUrl = loading;
            img.onload = () =>
            {
                imgElmStyle.backgroundImage = `url(${original})`;
            };
            img.onerror = () =>
            {
                imgElmStyle.backgroundImage = `url(${fallback})`;
            };
            img.src = original;
        },
        _updateSize()
        {
            this.theWidth = this._safeSize(this.width);
            this.theHeight = this._safeSize(this.height);
        },
        _safeSize(val)
        {
            if(/^\d+$/.test(val))
                return `${val}px`;
            return val;
        }
    }
};
</script>

<style lang="scss">
.vue-os--img-fallback
{
    display: inline-block;
    background-size:cover;
    background-repeat:no-repeat;
    background-position:center;
}
</style>