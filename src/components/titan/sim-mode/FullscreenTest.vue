<template>
    <titan-window
        title="Full Screen Test"
        :icon="`fullscreen${isFullscreen?'-exit':''}`"
        :x="150"
        :y="150"
        :width="350"
        :height="200"
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
                    @mousewheel="/*handleZoom*/"
                    @mousedown="/*_handleMouse*/"
                    @mousemove="/*_handleMouse*/"
                    @mouseup="/*_handleMouse*/"
                >
                    <l-map
                        ref="leafletmap"
                        style="height:100%;z-index:0;background-color:rgba(0,0,0,0);"
                        :zoom="map.zoom"
                        :center="map.center"
                        :options="map.options"
                    >
                        <l-tile-layer
                            :url="map.url"
                            :attribution="map.attribution"
                            :opacity="0.5"
                        />
                        <button
                            style="position:absolute;top:16px;right:16px;width:32px;height:32px;z-index:1;padding:3px;background-color:white;"
                            @click="toggleFullscreen(context.titanWindow)"
                        >
                            <titan-icon style="font-size:24px;line-height:24px;" :icon="`fullscreen${isFullscreen?'-exit':''}`" />
                        </button>
                    </l-map>
                </div>
            </div>
        </template>
    </titan-window>
</template>

<script>
import 'leaflet/dist/leaflet.css';

import TitanUtils, { $otWorld, $tWorldInterface, $isInsideTitan, $tLogger } from '@/assets/js/titan/titan-utils.js';
import MathUtils, { Vec2, Vec3 } from '@/assets/js/utils/math-utils.js';
import GeoUtils from '@/assets/js/utils/geo-utils.js';

import { DESKTOP_MUTATION } from '@/assets/js/store/desktop-manager.js';

import { latLng } from "leaflet";
import { Icon } from 'leaflet';
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});
import { LMap, LTileLayer } from "vue2-leaflet";


import TitanIcon from '@/components/titan/core/TitanIcon.vue';

export default {
    name: 'editor-ui',
    components:
    {
        TitanIcon,
        LMap, LTileLayer
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
                center: latLng(47.41322, -1.219482),
                currentCenter: latLng(47.41322, -1.219482),
                mapOptions: {
                    zoomSnap: 0.5,
                },
            }
        };
    },
    mounted()
    {
        if($isInsideTitan)
        {
            const activeScenario = $tWorldInterface.getActiveScenario();
            this.scenarioCamera = activeScenario ? activeScenario.getActiveCamera() : null;
        }

        // need to wait until next tick for the map component to be ready
        this.$nextTick(function()
        {
            this.leafletMapInstance = this.$refs.leafletmap.mapObject;
            this.forceMapRedraw();
            this.leafletMapInstance.on('move', this.updateCamera);
        });
    },
    beforeDestroy()
    {
        this.leafletMapInstance.off('move', this.updateCamera);
    },
    methods:
    {
        zoomUpdate(/*zoom*/)
        {
            this.updateCamera();
        },
        centerUpdate(/*center*/)
        {
            this.updateCamera();
        },
        boundsUpdate(/*center*/)
        {
            this.updateCamera();
        },
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

            if($isInsideTitan)
            {
                // $tWorldInterface.set_geographic_camera(2, lon, lat, lonspan, latspan);
                $tLogger.info('UPDATING CAMERA');
                // $tWorldInterface.setGeographicCamera(lon, lat, lonspan, latspan);
                $otWorld.set_geographic_camera(2, lon, lat, lonspan, latspan);
            }
        },
        innerClick()
        {
            alert("Click!");
        },
        toggleFullscreen(window)
        {
            if(this.isFullscreen)
            {
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_EXIT);
                if($isInsideTitan)
                {
                    this.restoreCameraState();
                }
            }
            else
            {
                this.$store.commit(DESKTOP_MUTATION.FULLSCREEN_ENTER, {id: window.id});
                if($isInsideTitan)
                {
                    this.cameraStateSnapshot();
                    this.scenarioCamera.setFreeCameraMode('FreeCamMode_ManualRoll');
                    this.scenarioCamera.switchToEditorCamera(4096);
                }
            }
            this.forceMapRedraw();
            this.isFullscreen = !this.isFullscreen;
        },
        handleZoom(evt)
        {
            if(!this.isFullscreen)
                return;

            // NOTE: in Outerra mousewheel events are doubled, and pair with a
            //       mousewheel event with a deltaY of zero, regardless of which
            //       direction the wheel is rolled - we need to ignore these
            //       spurious deltaY = 0 events and handle the rest
            //       See: https://calytrixtechnologies.atlassian.net/browse/TITAN-1275
            if(evt.deltaY === 0)
                return; // ignore

            if($isInsideTitan)
            {
                const screenBounds = this.$store.getters.screenSize;
                const worldPos = TitanUtils.worldPosForWindowCoords({x:screenBounds.midX, y:screenBounds.midY});
                if(worldPos)
                {
                    // invert the delatY to get mousewheel-up zoom in, as is
                    // the case for Google Maps, Open Street Maps, Leaflet etc
                    this.scenarioCamera.zoomEditorCamera(-evt.deltaY, worldPos);

                    const nw = TitanUtils.worldPosForWindowCoords({x:0, y:0});
                    const sw = TitanUtils.worldPosForWindowCoords({x:0, y:screenBounds.h});
                    const ne = TitanUtils.worldPosForWindowCoords({x:screenBounds.w, y:0});
                    const se = TitanUtils.worldPosForWindowCoords({x:screenBounds.w, y:screenBounds.h});
                    const nwLL = GeoUtils.xyzToLatLongElevation(nw);
                    const swLL = GeoUtils.xyzToLatLongElevation(sw);
                    const neLL = GeoUtils.xyzToLatLongElevation(ne);
                    const seLL = GeoUtils.xyzToLatLongElevation(se);
                    $tLogger.info(nwLL, neLL, swLL, seLL);
                }
            }
        },
        _handleMouse(evt)
        {
            const evtType = evt.type;
            const isRightButton = evt.button === 2;

            if(!$isInsideTitan || !this.isFullscreen)
                return; // nothing to do if we are in a browser

            if(evtType === 'mousedown')
            {
                if(isRightButton)
                    this._handleMouseDown(evt);
            }
            else if(evtType === 'mousemove')
            {
                this._handleMouseMove(evt);
            }
            else if(evtType === 'mouseup')
            {
                if(isRightButton)
                    this._handleMouseUp();
            }
        },
        /**
         * Handles mousedown events
         *
         * @param {object} evt the mouse event
         */
        _handleMouseDown(evt)
        {
            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = Vec3.fromObj( $tWorldInterface.getWorldPositionUnderMouse() );

            // mouse is down, so it could be just a click, or about to start
            // dragging an entity or begin a rubber band selection, so get
            // get ready for these possibilties
            this.drag.mightDrag = true;
            this.drag.lastWinXY = winXY;
            this.drag.lastECEF = worldPos;
        },
        /**
         * Handles mousemove events
         *
         * @param {object} evt the mouse event
         */
        _handleMouseMove(evt)
        {
            // do we need to do anything with the mouse movement?
            if(!this.drag.isDraggingMap && !this.drag.mightDrag)
                return;

            // initialise map drag if required
            if(this.drag.mightDrag && !this.drag.isDraggingMap)
            {
                this.drag.isDraggingMap = true;
            }

            // update object drag or rubber band selection if required
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            const ecef = Vec3.fromObj( $tWorldInterface.getWorldPosFromScreenPix(winXY) );
            if(this.drag.isDraggingMap)
            {
                // may be unable to query world position from screen (happens
                // when move above horizon) so check before proceeding
                if(TitanUtils.isValidWorldPos(ecef))
                {
                    // work out how to move the map in relation to the drag
                    const vecOffset = MathUtils.subtract(winXY, this.drag.lastWinXY);
                    // move the map/camera (invert drag direction to make the map
                    // move correctly)
                    this.scenarioCamera.moveEditorCamera(-vecOffset.x, -vecOffset.y);
                    // show the gizmo where the mouse is
                    $tWorldInterface.showGizmoAt(ecef);
                    // cache coords for next offset calculation
                    this.drag.lastWinXY = winXY;
                    this.drag.lastECEF = ecef;
                }
            }
        },
        /**
         * Handles mouseup
         *
         * NOTE: that a right mouseup doesn't also generate a click event like
         * a left mouseup does
         *
         * @param {object} evt the mouse event
         */
        _handleMouseUp(evt)
        {
            this.drag.mightDrag = false;
            this.drag.isDraggingMap = false;

            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = Vec3.fromObj( $tWorldInterface.getWorldPositionUnderMouse() );

            if(TitanUtils.isValidWorldPos(worldPos))
                $tWorldInterface.showGizmoAt(worldPos);
        },
        cameraStateSnapshot()
        {
            this.cameraState.mode = this.scenarioCamera.getFreeCameraMode();
            this.cameraState.position = this.scenarioCamera.getPosition();
            this.cameraState.orientation = this.scenarioCamera.getRotation();
        },
        restoreCameraState()
        {
            $otWorld.set_geographic_camera(0, 0, 0, 0, 0);
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
            this.leafletMapInstance.invalidateSize();
            this.$nextTick(function()
            {
                setTimeout(function() { window.dispatchEvent(new Event('resize')); }, 100);
            });
        },
    }
};
</script>
