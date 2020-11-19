<template>
    <div
        class="pass-through"
        style="width:100%;height:100%;overflow:hidden;"
    >
        <entity-selector />
        <map-overlay />
        <drawing-tools />

        <div
            v-for="(pluginWindow, idx) in pluginWindows"
            :key="`pluginWindow${idx}`"
        >
            <component :is="pluginWindow" />
        </div>
    </div>
</template>

<script>
import { TITAN_MUTATION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';

import TitanUtils, { $eview, $isInsideTitan, $tWorldInterface, $tLogger } from '@/assets/js/titan/titan-utils.js';
import EventUtils, { KEY_CODE } from '@/assets/js/utils/event-utils.js';
import VueUtils from '@/assets/js/utils/vue-utils.js';
import MathUtils, { Vec3, Vec2 } from '@/assets/js/utils/math-utils.js';

import EntitySelector from '@/components/titan/sim-mode/EntitySelector.vue';
import MapOverlay from '@/components/titan/sim-mode/MapOverlay.vue';
import DrawingTools from '@/components/titan/sim-mode/DrawingTools.vue';
import TitanIcon from '@/components/titan/core/TitanIcon.vue';

const HANDLED_KEY_EVENTS = new Set([
    'keyup'
]);
const HANDLED_MOUSE_EVENTS = new Set([
    'mousedown', 'mousemove',
    'click', 'dblclick',
]);

export default {
    name: 'editor-ui',
    components:
    {
        EntitySelector, MapOverlay, DrawingTools,
        TitanIcon
    },
    data()
    {
        return {
            testOptions: [
                {id:0, text:'Option A', disabled:false, tooltip:'A is for Apple'},
                {id:1, text:'Option B', disabled:false, tooltip:'B is for Banana'},
                {id:2, text:'Option C', disabled:false, tooltip:'C is for Coconut'},
            ],
            // mouse drag interaction state
            drag:
            {
                mightDrag: false,
                isDraggingObject: false,
                isRubberBandSelecting: false,
                lastWinXY: null,
                lastECEF: null,
            },
            // plugins
            pluginWindows: [],
        };
    },
    computed:
    {
        currentSimMode() { return this.$store.getters.titanSimMode; },
        modifierKeys() { return this.$store.getters.modifierKeys; },
        mouseButtons() { return this.$store.getters.mouseButtons; },
        mousePress() { return this.$store.getters.mousePress; },
        // determine if the UI mode is currently 'Editor' for the purpose of
        // detremining how to handle mouse/keyboard interactions
        isUiModeEditor() { return this.$store.getters.isUiMode(TITAN_UI_MODE.Editor); },
        // plugins
        plugins() { return this.$store.getters.plugins; },
        editPlugins() { return this.plugins.SimMode_Edit || {}; },
        editWindowConfigs() { return this.editPlugins.windows || []; },

    },
    mounted()
    {
        // enter UI mode
        this.$store.commit(TITAN_MUTATION.ENTER_UI_MODE, TITAN_UI_MODE.Editor);

        // bind event handlers
        // NOTE: binding event handlers to `window` or `document` both
        // achieve the same thing - not sure which (if either) is a
        // better choice here
        HANDLED_KEY_EVENTS.forEach((evtType) => document.addEventListener(evtType, this.handleKeyEvent) );
        HANDLED_MOUSE_EVENTS.forEach((evtType) => document.addEventListener(evtType, this.handleMouseEvent) );

        // inject plugin windows etc
        const pluginWindows = [];
        this.editWindowConfigs.forEach((pwc) =>
        {
            const component = pwc.component;
            const type = pwc.type;
            const extension = type === 'vue' ? '.umd.min.js' : '.js';
            const componentURL = `plugins/components/${component}/${component}${extension}`;
            if(type === 'vue')
                pluginWindows.push( () => VueUtils.externalComponent(componentURL) );
            else
                VueUtils.injectScript(componentURL);
        });
        this.pluginWindows = pluginWindows;
    },
    beforeDestroy()
    {
        // clean up event handlers
        HANDLED_KEY_EVENTS.forEach((evtType) => document.removeEventListener(evtType, this.handleKeyEvent) );
        HANDLED_MOUSE_EVENTS.forEach((evtType) => document.removeEventListener(evtType, this.handleMouseEvent) );
        // since we are exiting completely, we need to clean up our UI mode - exit from
        // whatever sub-mode we were in back to the 'Editor' mode, and then exit 'Editor'
        // mode itself
        this.$store.commit(TITAN_MUTATION.EXIT_TO_UI_MODE, TITAN_UI_MODE.Editor);
        this.$store.commit(TITAN_MUTATION.EXIT_UI_MODE, TITAN_UI_MODE.Editor);
    },
    methods:
    {
        ////////////////////////////////////////////////////////////////////////////////////////////
        // KEY EVENT HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Handles key events
         *
         * Will ignore events if...
         *  - not in 'Editor' UI Mode
         *  - the event is not in HANDLED_MOUSE_EVENTS
         *  - the event target is a DOM element with the class 'pass-through'
         *
         * @param {object} evt the mouse event
         */
        handleKeyEvent(evt)
        {
            $tLogger.info(evt);

            if(!$isInsideTitan)
                return; // nothing to do if we are in a browser

            if(!this.isUiModeEditor)
                return; // wrong UI mode of operation - ignore

            const evtType = evt.type;
            if(!HANDLED_KEY_EVENTS.has(evtType))
                return; // we don't handle this type of key event

            if(EventUtils.isKey(evt, KEY_CODE.DELETE))
            {
                $tLogger.info('DELETE KEY!');
                // delete anything that's selected
                const activeScenario = $tWorldInterface.getActiveScenario();
                activeScenario.removeSelected();
            }
            else
            {
                $eview.mark_unhandled();
            }
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // MOUSE EVENT HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Handles mouse events
         *
         * Will ignore events if...
         *  - not in 'Editor' UI Mode
         *  - the event is not in HANDLED_MOUSE_EVENTS
         *  - the event target is a DOM element with the class 'pass-through'
         *
         * @param {object} evt the mouse event
         */
        handleMouseEvent(evt)
        {
            if(!$isInsideTitan)
                return; // nothing to do if we are in a browser

            if(!this.isUiModeEditor)
                return; // wrong UI mode of operation - ignore

            const evtType = evt.type;
            if(!HANDLED_MOUSE_EVENTS.has(evtType))
                return; // we don't handle this type of mouse event

            const clickedOnWorld = TitanUtils.isPassThrough(evt);
            if(!clickedOnWorld)
                return; // we only care about mouse clicks on the world for now

            const isLeftButton = evt.button === 0;
            if(!isLeftButton)
                return; // we only care about left mouse clicks at the moment

            // handler function lookup
            // NOTE: we don't check for drag or rubber band box selection ending
            // on `mouseup` events because there will also be a `click` event
            // that we want to distinguish - don't add `mouseup` event handler
            // to replace the `click` handler because there will be trouble!
            const handlers = {
                mousedown: this._handleLeftMouseDown,
                mousemove: this._handleMouseMove,
                click: this._handleLeftClick,
                dblclick: this._handleLeftDblClick,
            };
            const handler = handlers[evtType];
            if(handler)
                handler(evt);
            else
                TitanUtils.unhandledEventHandler(evt, this.$options.name);
        },
        /**
         * Handles mousedown events
         *
         * @param {object} evt the mouse event
         */
        _handleLeftMouseDown(evt)
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
            if(!this.drag.isDraggingObject && !this.drag.isRubberBandSelecting && !this.drag.mightDrag)
                return;

            // initialise object drag or rubber band selection if required
            if(this.drag.mightDrag)
            {
                // not *might* drag any more - we are *definitely* dragging something at this point
                this.drag.mightDrag = false;

                // update selection if required to ensure that the item under the mouse is selected
                $tWorldInterface.injectMousePosition(this.drag.lastWinXY, 15000);
                if($tWorldInterface.isSelectableObjectUnderMouse())
                {
                    // if there's an object under the mouse, we are dragging it
                    this.drag.isDraggingObject = true;
                    const isSelected = $tWorldInterface.isObjectUnderMouseSelected();
                    if(!isSelected)
                    {
                        this._doSelection();
                    }
                    $tWorldInterface.showGizmoAt(this.drag.lastEcef);
                }
                else
                {
                    // if there's nothing selectable under the mouse, it's the start of a
                    // rubber band box selection
                    this.drag.isRubberBandSelecting = true;
                    // clicked on nothing - clear the selection (unless CTRL is pressed)
                    this._clearSelection();
                    $tWorldInterface.showGizmoAt(this.drag.lastEcef);
                    $tWorldInterface.beginAreaDragSelect();
                }
            }

            // update object drag or rubber band selection if required
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            const ecef = Vec3.fromObj( $tWorldInterface.getWorldPosFromScreenPix(winXY) );
            if(this.drag.isDraggingObject)
            {
                // may be unable to query world position from screen (happens when move above horizon)
                // so check before proceeding
                if(TitanUtils.isValidWorldPos(ecef))
                {
                    // work out how to move the items in relation to the drag
                    const vecOffset = MathUtils.subtract(ecef, this.drag.lastECEF);
                    const activeScenario = $tWorldInterface.getActiveScenario();
                    // move the selected items accordingly
                    activeScenario.translateSelected(vecOffset, true);
                    // show the gizmo where the mouse is
                    $tWorldInterface.showGizmoAt(ecef);
                    // cache coords for next offset calculation
                    this.drag.lastWinXY = winXY;
                    this.drag.lastECEF = ecef;
                }
            }
            else if(this.drag.isRubberBandSelecting)
            {
                // we need to continually inject the current mouse position so that the blue
                // selection box renders to track with the mouse position; if we don't do this
                // the selection box doesn't render, which is a bad user experience
                $tWorldInterface.injectMousePosition(winXY, 15000);
                // show the gizmo where the mouse is
                $tWorldInterface.showGizmoAt(ecef);
                // cache coords for next offset calculation
                this.drag.lastWinXY = winXY;
                this.drag.lastECEF = ecef;
            }
        },
        /**
         * Handles left mouse single click events
         *
         * @param {object} evt the mouse event
         */
        _handleLeftClick(evt)
        {
            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = $tWorldInterface.getWorldPositionUnderMouse();

            if(TitanUtils.isValidWorldPos(worldPos))
                $tWorldInterface.showGizmoAt(worldPos);

            // NOTE: we have to clear `mightDrag` here in case there was no
            //       `mousemove` event to clear it
            this.drag.mightDrag = false;
            if(this.drag.isDraggingObject)
            {
                // end of object dragging
                this.drag.isDraggingObject = false;
            }
            else if(this.drag.isRubberBandSelecting)
            {
                // end of rubber band box selection
                this.drag.isRubberBandSelecting = false;
                $tWorldInterface.endAreaDragSelect();
            }
            else if($tWorldInterface.isSelectableObjectUnderMouse())
            {
                // clicked on an item, update the selection
                this._doSelection();
            }
            else
            {
                // clicked on nothing; clear selection (unless CTRL is pressed)
                this._clearSelection();
            }
        },
        /**
         * Handles left mouse dblclick events
         *
         * @param {object} evt the mouse event
         */
        _handleLeftDblClick(evt)
        {
            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = $tWorldInterface.getWorldPosFromScreenPix(winXY);
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            $tWorldInterface.injectMousePosition(winXY, 15000);
            const worldPos = $tWorldInterface.getWorldPositionUnderMouse();
            if(!$tWorldInterface.isSelectableObjectUnderMouse())
            {
                // force clear any selection (unless CTRL is pressed)
                this._clearSelection(true);

                const selectedEntity = this.$store.getters.getEntitySelectorSelection;
                if(selectedEntity)
                {
                    // create an entity at the location
                    TitanUtils.createEntity(selectedEntity.entityName, worldPos);
                }
            }
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // SELECTION HANDLERS
        ////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * Selects whatever is under the mouse, clearing any existing selection
         * first (unless the CTRL key is pressed)
         */
        _doSelection()
        {
            // NOTE: Outerra does not populate modifier keys on mouse events,
            //       so we currently rely on our own input state management
            //       to track their state
            // clear selection (unless CTRL is pressed)
            this._clearSelection();
            $tWorldInterface.select();
        },
        /**
         * Clears the selection, unless the CTRL key is currently held down
         *
         * @param {boolean} forced if true, clear the selection regardless of
         *        the state of the CTRL key
         */
        _clearSelection(forced=false)
        {
            const isAdditiveSelection = this.$store.getters.modifierKeys.ctrl;
            if(forced || !isAdditiveSelection)
                $tWorldInterface.clearSelection();

            $tWorldInterface.select();
        },
    }
};
</script>
