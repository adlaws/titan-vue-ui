<template>
    <cse-desktop-window
        title="Map Overlay"
        icon="map"
        :x="150"
        :y="150"
        :width="350"
        :height="200"
        :start-minimized="true"
        @window-resized="forceMapRedraw"
    >
        <template #default="context">
            <div style="overflow:hidden;height:100%;display:flex;flex-direction:column;">
                <!--
                    NOTE: For some reason in Outerra the `height:100%` style is required in both the div containing
                          the leaflet map and* the leaflet map element itself, otherwise the map doesn't appear.
                          The `height:100%` styling is *not* required in a browser.
                -->
                <div
                    :class="{'pass-through':!isFullscreen}"
                    style="flex-grow:1;height:100%;"
                >
                    <l-map
                        ref="leafletmap"
                        style="height:100%;z-index:0;background-color:rgba(0,0,0,0);"
                        :zoom-animation="false"
                        :zoom="map.zoom"
                        :center="map.center"
                        :options="map.options"
                    >
                        <l-tile-layer
                            ref="tileLayer"
                            :url="map.url"
                            :attribution="map.attribution"
                            :opacity="mapOpacity"
                        />

                        <l-control>
                            <button
                                style="width:32px;height:32px;padding:3px;background-color:white;"
                                @click="toggleFullscreen(context.cseDesktopWindow)"
                            >
                                <cse-icon size="24px" :icon="`fullscreen${isFullscreen?'-exit':''}`" />
                            </button>
                        </l-control>

                        <l-control>
                            <input
                                v-model="map.opacity"
                                type="range"
                                :min="0"
                                :max="100"
                                class="slider vertical"
                                style="height:128px;width:24px;padding:3px;"
                            >
                        </l-control>
                    </l-map>
                </div>
            </div>
        </template>
    </cse-desktop-window>
</template>

<script>
import 'leaflet/dist/leaflet.css';

import { $otWorld, $tWorldInterface, $isInOuterra } from '@/assets/js/titan/titan-utils.js';
import UiUtils from '@/assets/js/utils/ui-utils.js';

import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';

import { latLng } from "leaflet";
// Workaround for Leaflet default pin icons not showing up ------------------------------------------------------------
// Ref: https://vue2-leaflet.netlify.app/quickstart/#marker-icons-are-missing
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
// --------------------------------------------------------------------------------------------------------------------
import { LMap, LTileLayer, LControl } from "vue2-leaflet";

// Outerra Map Project Modes for Geographic Camera
// ref: titan-git\api\ot\projection.h
const OT_MAP_PROJECTION = {
    OFF:0,
    GEOGRAPHIC:1,
    MERCATOR:2,
};

export default {
    name: 'map-overlay',
    components:
    {
        LMap, LTileLayer, LControl,
    },
    data()
    {
        return {
            isFullscreen:false,
            scenarioCamera:null,
            leafletMapInstance: null,
            // mouse drag interaction state
            drag:
            {
                mightDrag: false,
                isDraggingMap: false,
                lastWinXY: null,
                lastECEF: null,
            },
            // storage for camera state snapshot when toggling
            // in/out of full screen view
            cameraState:{
                mode: null,
                position: null,
                orientation: null,
            },
            map:
            {
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                attribution:
                '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                zoom: 13,
                opacity: 50,
                center: latLng(47.41322, -1.219482),
                currentCenter: latLng(47.41322, -1.219482),
                mapOptions: {
                    zoomSnap: 0.5,
                },
            }
        };
    },
    computed:
    {
        mapOpacity() {return parseFloat(this.map.opacity) / 100.0;}
    },
    watch:
    {
        mapOpacity: UiUtils.throttle(
            function()
            {
                if($isInOuterra)
                {
                    // NOTE: needed in Outerra/Titan as the opacity changes doesn't seem to auto-update
                    // the map as it does in a browser when the slider is moved. A redraw needs to be
                    // triggered with a drag or resize for the opacity to change, and ye olde forceRedraw()
                    // trick doesn't work for this. Without this, the area around the slider will update,
                    // but the rest doesn't re-render, so possibly this is due to some sort of rendering
                    // optimsation in Chromium...?
                    // In any case, here we just trick the component into updating by setting the name
                    // to the same value as it already is, which is harmless. Unfortunatley it also
                    // causes a slight flicker, but... it's better than the alternative until a 'real'
                    // solution can be found.
                    const tileLayer = this.$refs.tileLayer;
                    tileLayer.setName(tileLayer.name);
                }
            }, false)
    },
    mounted()
    {
        if($isInOuterra)
        {
            const activeScenario = $tWorldInterface.getActiveScenario();
            this.scenarioCamera = activeScenario ? activeScenario.getActiveCamera() : null;
        }

        // need to wait until next tick for the map component to be ready
        this.$nextTick(function()
        {
            // obtain reference to the 'native' leaflet map instance
            this.leafletMapInstance = this.$refs.leafletmap.mapObject;
            // ensure that the map fills the contianer
            this.forceMapRedraw();
            // we have to rely on the 'native' leaflet map move event because vue2leafflet
            // doesn't seem to expose the event for us. NOTE: we remove this handler
            // during the `beforeDestroy()` Vue component lifecycle callback
            this.leafletMapInstance.on('move', this.updateCamera);
        });
    },
    beforeDestroy()
    {
        // remove the leaflet map move event handler registered during the `mounted()`
        // Vue component lifecycle callback
        this.leafletMapInstance.off('move', this.updateCamera);
    },
    methods:
    {
        updateCamera()
        {
            if(!this.isFullscreen)
                return;

            const bounds = this.leafletMapInstance.getBounds();
            const center = bounds.getCenter();

            const lon = center.lng;
            const lat = center.lat;
            const ne = bounds.getNorthWest();
            const sw = bounds.getSouthEast();

            const lonspan = Math.abs(ne.lng - sw.lng);
            const latspan = Math.abs(ne.lat - sw.lat);

            if($isInOuterra)
            {
                $otWorld.set_geographic_camera(OT_MAP_PROJECTION.MERCATOR, lon, lat, lonspan, latspan);
            }
        },
        toggleFullscreen(window)
        {
            if(this.isFullscreen)
            {
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_EXIT);
                if($isInOuterra)
                {
                    this.restoreCameraState();
                }
            }
            else
            {
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_ENTER, {id: window.id});
                if($isInOuterra)
                {
                    this.cameraStateSnapshot();
                    this.updateCamera();
                }
            }
            this.forceMapRedraw();
            this.isFullscreen = !this.isFullscreen;
        },
        cameraStateSnapshot()
        {
            this.cameraState.mode = this.scenarioCamera.getFreeCameraMode();
            this.cameraState.position = this.scenarioCamera.getPosition();
            this.cameraState.orientation = this.scenarioCamera.getRotation();
        },
        restoreCameraState()
        {
            // turn off geographic camer
            $otWorld.set_geographic_camera(OT_MAP_PROJECTION.OFF, 0, 0, 0, 0);
            // put the 'normal' camera back where it was
            this.scenarioCamera.setFreeCameraMode(this.cameraState.mode);
            this.scenarioCamera.setPosition(this.cameraState.position);
            this.scenarioCamera.setRotation(this.cameraState.orientation);
        },
        /**
         * Zoom the global terrain pack map to the specified terrain pack
         *
         * @param terrainPack the terrain pack details
         */
        zoomToBounds()
        {
            if(this.bounds)
            {
                this.leafletMapInstance.invalidateSize();
                this.leafletMapInstance.fitBounds(this.bounds);
                this.forceMapRedraw();
            }
        },
        forceMapRedraw()
        {
            // forces map to repaint
            if(this.leafletMapInstance)
            {
                this.leafletMapInstance.invalidateSize();
                this.$nextTick(function()
                {
                    setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 100);
                });
            }
        },
    }
};
</script>

<style lang="scss">
input.slider.vertical
{
    cursor: pointer;
    &.vertical
    {
        writing-mode: bt-lr; /* IE */
        -webkit-appearance: slider-vertical; /* WebKit */
    }
}
</style>
