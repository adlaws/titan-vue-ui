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
            type: [String, Array],
            default: '',
        },
        loading:
        {
            type: String,
            default: null,
        }
    },
    data()
    {
        return {
            theWidth: '64px',
            theHeight: '64px',
            imgStyle: null,
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
        this.imgStyle = this.$refs.image.style;
        this._doImage();
    },
    methods:
    {
        _doImage()
        {
            this._updateSize();

            if(this.loading)
            {
                this.imgStyle.backgroundUrl = this.loading;
            }

            this._tryNextImage();
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
        },
        _tryNextImage(fallbackIdx=-1)
        {
            let imgSrc = this.src;
            if(fallbackIdx>=0)
            {
                const isArray = Array.isArray(this.fallback);
                const hasMoreFallbacks = (isArray && fallbackIdx < this.fallback.length) || fallbackIdx === 0;
                if(!hasMoreFallbacks)
                    return;
                imgSrc = isArray ? this.fallback[fallbackIdx] : this.fallback;
            }

            if(fallbackIdx<0)
                console.log(imgSrc);

            const img = new Image();
            img.onload = () =>
            {
                this.imgStyle.backgroundImage = `url(${imgSrc})`;
            };
            img.onerror = () =>
            {
                this._tryNextImage(fallbackIdx+1);
            };
            img.src = imgSrc;
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