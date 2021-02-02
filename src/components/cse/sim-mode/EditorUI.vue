<template>
    <div
        class="pass-through"
        style="width:100%;height:100%;overflow:hidden;"
    >
        <time-slider />

        <!--
        <cse-scenario-objects />
        <entity-selector2 />
        <dropdown-toolbar v-if="!isAnyWindowFullscreen" :y="22" />
        <linear-compass2 v-if="!isAnyWindowFullscreen" :y="-10" />
        <waypoint-settings />
        <world-state />

        <aar-statistics />
        <map-overlay />
        <drawing-tools />

        <cse-dockable
            :width="300"
            :height="300"
            offset="end"
            dock="w"
            draggable
            title="OBJECTS"
            icon="mdi-cube"
        >
            Entity list
        </cse-dockable>

        <cse-notifications-area
            dock="w"
            offset="-32"
            :width="300"
        />
        -->

        <div
            v-for="(pluginWindow, idx) in pluginWindows"
            :key="`pluginWindow${idx}`"
        >
            <component :is="pluginWindow" />
        </div>

        <transition
            name="fade"
            mode="out-in"
        >
            <entity-spotlight
                v-if="spotlight.show"
                @selected="spotlightSelection"
                @cancelled="hideSpotlight"
            />
        </transition>

        <transition
            name="fade"
            mode="out-in"
        >
            <cse-context-menu
                v-if="contextMenu.show"
                :items="contextMenu.items"
                :x="contextMenu.x"
                :y="contextMenu.y"
                @selected="contextMenuSelection"
                @cancelled="hideContextMenu"
            />
        </transition>

        <transition
            name="fade"
            mode="out-in"
        >
            <cse-radial-menu
                v-if="radialMenu.show"
                :size="300"
                :items="radialMenu.items"
                :x="radialMenu.x"
                :y="radialMenu.y"
                @selected="radialMenuSelection"
                @cancelled="hideRadialMenu"
            />
        </transition>
    </div>
</template>

<script>
import { TITAN_MUTATION, TITAN_UI_MODE } from '@/assets/js/store/titan-manager.js';

import TitanUtils, { $isInOuterra, $tWorldInterface, $tLogger } from '@/assets/js/titan/titan-utils.js';
import EventUtils, { KEY } from '@/assets/js/utils/event-utils.js';
import VueUtils from '@/assets/js/utils/vue-utils.js';
import MathUtils, { Vec3, Vec2 } from '@/assets/js/utils/math-utils.js';

import LinearCompass2 from '@/components/cse/core/display/compass/LinearCompass2.vue';
import DropdownToolbar from '@/components/cse/sim-mode/DropdownToolbar.vue';
import TimeSlider from '@/components/cse/core/clock/TimeSlider.vue';

import CseIcon from '@/components/cse/core/CseIcon.vue';
import CseContextMenu from '@/components/cse/core/CseContextMenu.vue';
import CseRadialMenu from '@/components/cse/core/CseRadialMenu.vue';
import CseDockable from '@/components/cse/core/CseDockable.vue';
import CseNotificationsArea from '../core/CseNotificationsArea.vue';

import EntitySelector2 from '@/components/cse/sim-mode/EntitySelector2.vue';
import MapOverlay from '@/components/cse/sim-mode/MapOverlay.vue';
import DrawingTools from '@/components/cse/sim-mode/DrawingTools.vue';
import WorldState from '@/components/cse/sim-mode/WorldState.vue';
import CseScenarioObjects from '@/components/cse/core/activeobjects/CseScenarioObjects.vue';
import WaypointSettings from '@/components/cse/core/waypointsettings/WaypointSettings.vue';
import AarStatistics from '@/components/cse/core/aarstatistics/AarStatistics.vue';
import EntitySpotlight from '@/components/cse/core/entityspotlight/EntitySpotlight.vue';


const HANDLED_KEY_EVENTS = new Set([
    'keyup'
]);
const HANDLED_MOUSE_EVENTS = new Set([
    'mousedown', 'mousemove',
    'click', 'dblclick', 'contextmenu',
]);

const SPOTLIGHT_TRIGGER_KEY = new Set([KEY.KEY_CODE.NUMPADDIVIDE, KEY.KEY_CODE.SLASH]);

export default {
    name: 'editor-ui',
    components:
    {
        LinearCompass2, DropdownToolbar,
        TimeSlider, EntitySpotlight,
        EntitySelector2, MapOverlay, DrawingTools, WorldState, AarStatistics,
        CseScenarioObjects, WaypointSettings,
        CseIcon,
        CseContextMenu, CseRadialMenu, CseDockable, CseNotificationsArea,
    },
    data()
    {
        return {
            contextMenu:{
                show: false,
                x: 0,
                y: 0,
                items: []
            },
            radialMenu:{
                show: false,
                x: 0,
                y: 0,
                items: []
            },
            spotlight:{
                show: false,
            },
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
        isAnyWindowFullscreen() { return this.$store.getters.isAnyWindowFullscreen; },
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
            if(!this.isUiModeEditor)
                return; // wrong UI mode of operation - ignore

            const evtType = evt.type;
            if(!HANDLED_KEY_EVENTS.has(evtType))
                return; // we don't handle this type of key event

            if(EventUtils.isKey(evt, KEY.KEY_CODE.ESCAPE))
            {
                // hide the context menu
                this.hideContextMenu();
                // hide the radial menu
                this.hideRadialMenu();
                // hide the spotlight search
                this.hideSpotlight();
            }
            else if(EventUtils.isKey(evt, SPOTLIGHT_TRIGGER_KEY))
            {
                // trigger spotlight entity search if keypress not
                // on anything in particular (i.e., the BODY element)
                if(evt.target.tagName.toLowerCase()==='body')
                    this.spotlight.show = true;
            }

            if(!$isInOuterra)
                return; // nothing else to do if we are in a browser

            if(EventUtils.isKey(evt, KEY.KEY_CODE.DELETE))
            {
                // delete anything that's selected
                const activeScenario = $tWorldInterface.getActiveScenario();
                activeScenario.removeSelected();
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
            // if(!$isInOuterra)
            //    return; // nothing to do if we are in a browser

            if(!this.isUiModeEditor)
                return; // wrong UI mode of operation - ignore

            const evtType = evt.type;
            if(!HANDLED_MOUSE_EVENTS.has(evtType))
                return; // we don't handle this type of mouse event

            const clickedOnWorld = TitanUtils.isPassThrough(evt);
            if(!clickedOnWorld)
                return; // we only care about mouse clicks on the world for now

            let handler = null;
            const isLeftButton = evt.button === 0;
            const isContextMenu = evt.type === 'contextmenu';
            if(isLeftButton)
            {
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
                handler = handlers[evtType];
            }
            else if(isContextMenu)
            {
                handler = this._handleContextMenu;
            }

            if(handler)
                handler(evt);
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
            //            const worldPos = TitanUtils.worldPosForWindowCoords()(winXY);
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            TitanUtils.injectMousePosition(winXY);
            const worldPos = Vec3.fromObj(TitanUtils.worldPosUnderMouse());

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
                TitanUtils.injectMousePosition(this.drag.lastWinXY);
                const isObject = TitanUtils.isSelectableObjectUnderMouse();
                // const isShape = !isObject && TitanUtils.isSelectableShapeObjectUnderMouse();
                // const isTrigger = !isShape && TitanUtils.isSelectableTriggerUnderMouse();
                // const isWaypoint = !isTrigger && TitanUtils.isSelectableWaypointUnderMouse();

                if(isObject)
                {
                    // if there's an object under the mouse, we are dragging it
                    this.drag.isDraggingObject = true;

                    // we have to deactivate the undo/redo monitoring otherwise every
                    // single mouse move of the drag will be recorded, and we only
                    // need the start and end of the drag for undo/redo purposes
                    TitanUtils.set_undo_redo_keypress_monitoring_active(false);

                    const isSelected = TitanUtils.isObjectUnderMouseSelected();
                    if(!isSelected)
                    {
                        this._doSelection();
                    }
                    this.updateGizmoPos(this.drag.lastEcef);
                }
                else
                {
                    // if there's nothing selectable under the mouse, it's the start of a
                    // rubber band box selection
                    this.drag.isRubberBandSelecting = true;
                    // clicked on nothing - clear the selection (unless CTRL is pressed)
                    this._clearSelection();
                    this.updateGizmoPos(this.drag.lastEcef);
                    TitanUtils.beginAreaDragSelect();
                }
            }

            // update object drag or rubber band selection if required
            const winXY = Vec2.fromObj( TitanUtils.domEventXYtoOuterraXY(evt) );
            const ecef = Vec3.fromObj( TitanUtils.worldPosForWindowCoords(winXY) );
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
                    this.updateGizmoPos(ecef);
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
                TitanUtils.injectMousePosition(winXY);
                // show the gizmo where the mouse is
                this.updateGizmoPos(ecef);
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
            this.hideContextMenu();
            this.hideRadialMenu();

            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = TitanUtils.worldPosForWindowCoords()(winXY);
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            TitanUtils.injectMousePosition(winXY);
            const worldPos = TitanUtils.worldPosUnderMouse();

            if(TitanUtils.isValidWorldPos(worldPos))
                this.updateGizmoPos(worldPos);

            // NOTE: we have to clear `mightDrag` here in case there was no
            //       `mousemove` event to clear it
            this.drag.mightDrag = false;
            if(this.drag.isDraggingObject)
            {
                // end of object dragging
                this.drag.isDraggingObject = false;
                // we can reactivate the undo/redo monitoring now
                TitanUtils.set_undo_redo_keypress_monitoring_active(true);
            }
            else if(this.drag.isRubberBandSelecting)
            {
                // end of rubber band box selection
                this.drag.isRubberBandSelecting = false;
                TitanUtils.endAreaDragSelect();
            }
            else if(TitanUtils.isSelectableObjectUnderMouse())
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
            this.hideContextMenu();
            this.hideRadialMenu();
            this.hideSpotlight();

            // NOTE: we need to inject the mouse position otherwise Outerra
            //       doesn't have any awareness of where the mouse is and can't
            //       detect whether selectable items are "under the mouse" etc.
            //       If we only wanted the world pos under the mouse we could
            //       just do:
            //            const worldPos = TitanUtils.worldPosForWindowCoords()(winXY);
            const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
            TitanUtils.injectMousePosition(winXY);
            const worldPos = TitanUtils.worldPosUnderMouse();
            if(!TitanUtils.isSelectableObjectUnderMouse())
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
        /**
         * Handles right mouse contextmenu events
         *
         * @param {object} evt the mouse event
         */
        _handleContextMenu(evt)
        {
            this.hideContextMenu();
            this.hideRadialMenu();

            if(!$isInOuterra)
            {
                evt.preventDefault();
                this.contextMenu.items = [
                    {id:0, text: 'Option A', tooltip:'A is for Apple', icon:'apple', disabled:false,},
                    {id:1, text: 'Option B', tooltip:'B is for Baguette', icon:'baguette', disabled:false,},
                    {separator:true},
                    {id:2, text: 'Option C', tooltip:'C is for Cherry', icon:'fruit-cherries', disabled:false,},
                    {
                        id:9, text:'Option D', tooltip:'D is for Dog', disabled:false,
                        items:[
                            {id:'a', text:'Sub menu 1'},
                            {id:'b', text:'Sub menu 2'},
                        ]
                    },
                    {
                        id:4, text:'Option E', tooltip:'E is for Elderberry', disabled:false,
                        items:[
                            {id:'X', text:'Sub menu X'},
                            {id:'Y', text:'Sub menu Y',
                                items:[
                                    {id:'Y-a', text:'Sub Y-A'},
                                    {id:'Y-b', text:'Sub Y-B'},
                                ]}
                        ],
                    },
                ];

                this.radialMenu.items = [
                    {id:0, text: 'A', tooltip:'A is for Apple', disabled:false,},
                    {id:1, text: 'Baguette', tooltip:'B is for Baguette', icon:'baguette', disabled:false,},
                    {
                        id:9, text:'Pencil', icon:'pencil', tooltip:'D is for Dog',
                        items:[
                            {id:'a', text:'Airplane', icon:'airplane'},
                            {id:'b', text:'Wrench', icon:'wrench'},
                        ]
                    },
                    {
                        id:4, text:'Weather', icon:'weather-partly-cloudy', disabled:false,
                        items:[
                            {id:'X', text:'Fine', icon:'weather-sunny'},
                            {id:'Y', text:'Other', icon:'weather-cloudy',
                                items: [
                                    {id: '', text: 'Fine', icon: 'weather-sunny',},
                                    {id: '', text: 'Light Cloud', icon: 'weather-partly-cloudy',},
                                    {id: '', text: 'Cloudy', icon: 'weather-cloudy',},
                                    {id: '', text: 'Rain', icon: 'weather-pouring',},
                                    {id: '', text: 'Snow', icon: 'weather-snowy-heavy',},
                                    {id: '', text: 'Hail', icon: 'weather-hail', disabled:true,},
                                    {id: '', text: 'Storm', icon: 'weather-lightning',},
                                    {id: '', text: 'Fog', icon: 'weather-fog',},
                                    {id: '', text: 'Haze', icon: 'weather-hazy',},
                                ]
                            }
                        ],
                    },
                    {id:2, text: 'Cherry', tooltip:'C is for Cherry', icon:'fruit-cherries', disabled:false,},
                ];
            }
            else
            {
                const winXY = TitanUtils.domEventXYtoOuterraXY(evt);
                TitanUtils.injectMousePosition(winXY);
                const isObject = TitanUtils.isSelectableObjectUnderMouse();
                if(!isObject)
                    return;

                const uuid = TitanUtils.getObjectUUIDUnderMouse();
                const entity = $tWorldInterface.getActiveScenario().getEntityById(uuid);
                if(!entity)
                    return;

                evt.preventDefault();
                this.contextMenu.items = [
                    {id:'raise-entity', text: 'Raise by 10m', tooltip:'Raise entity', icon:'arrow-expand-up', entity:uuid },
                    {id:'snap-to-ground', text:'Snap To Ground', icon:'arrow-collapse-down', tooltip:'Place entity on the ground', entity:uuid },
                ];
                this.radialMenu.items = [
                    {id:'move-entity', text: 'Move', tooltip:'Move entity', icon:'arrow-expand-up', entity:uuid },
                    {id:'destroy-entity', text:'Destroy', icon:'bomb', tooltip:'Destroy Entity', entity:uuid },
                    {
                        id:'repair-entity', text:'Repair', icon:'wrench', tooltip:'Repair Entity', entity:uuid,
                        items:[
                            {id:'repair-entity-full', text:'All', icon:'heart', tooltip:'Repair All', entity:uuid },
                            {id:'repair-entity-head', text:'Head', icon:'head', tooltip:'Repair Head', entity:uuid },
                            {id:'repair-entity-arms', text:'Arms', icon:'hand', tooltip:'Repair Arms', entity:uuid },
                            {id:'repair-entity-feet', text:'Feet', icon:'foot-print', tooltip:'Repair Feet', entity:uuid },
                        ]
                    },
                ];
            }

            this.$nextTick(()=>
            {
                if(this.$store.getters.modifierKeys.shift)
                {
                    this.radialMenu.x = evt.clientX - 150;
                    this.radialMenu.y = evt.clientY - 150;
                    this.radialMenu.show = true;
                }
                else
                {
                    // wait until next tick so that this.contextMenu.show = false can take effect and reset the menu
                    this.contextMenu.x = evt.clientX-32;
                    this.contextMenu.y = evt.clientY-8;
                    this.contextMenu.show = true;
                }
            });
        },
        updateGizmoPos(ecef)
        {
            TitanUtils.showGizmoAt(ecef);
            this.$store.commit(TITAN_MUTATION.GIZMO_SET_POSITION, ecef);
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
            TitanUtils.select();
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
                TitanUtils.clearSelection();

            TitanUtils.select();
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // CONTEXT MENU MANAGEMENT
        ////////////////////////////////////////////////////////////////////////////////////////////
        hideContextMenu()
        {
            this.contextMenu.show = false;
        },
        contextMenuSelection(item)
        {
            this.hideContextMenu();

            if($isInOuterra)
            {
                const entity = $tWorldInterface.getActiveScenario().getEntityById(item.entity);
                if(!entity)
                    return;

                if(item.id === 'raise-entity')
                {
                    const aglPos = entity.getPositionAGL();
                    entity.setPositionAGL({x:aglPos.x, y:aglPos.y, z:aglPos.z+10});
                }
                else if(item.id === 'snap-to-ground')
                {
                    entity.snapToGround();
                }
            }
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // RADIAL MENU MANAGEMENT
        ////////////////////////////////////////////////////////////////////////////////////////////
        hideRadialMenu()
        {
            this.radialMenu.show = false;
        },
        radialMenuSelection(item)
        {
            this.hideRadialMenu();
            $tLogger.info('RADIAL MENU SELECTED:', item);
        },
        ////////////////////////////////////////////////////////////////////////////////////////////
        // ENTITY SPOTLIGHT MANAGEMENT
        ////////////////////////////////////////////////////////////////////////////////////////////
        hideSpotlight()
        {
            this.spotlight.show = false;
        },
        spotlightSelection(payload)
        {
            this.hideSpotlight();
            const item = payload.item;
            const args = payload.args;
            $tLogger.info('SPOTLIGHT SELECTED:', item, 'with args', args);
            if($isInOuterra && this.$store.getters.hasGizmoPos)
            {
                const entity = TitanUtils.createEntity(item.entityName, this.$store.getters.gizmoPos);
                // TODO: this is a quickly hacked together parsing of an altitude argument
                //       for the purposes of prototyping, and needs work if it's to be an
                //       actual feature
                if(args.alt)
                {
                    const agl = parseFloat(args.alt);
                    if(!isNaN(agl))
                    {
                        const aglPos = entity.getPositionAGL();
                        entity.setPositionAGL({x:aglPos.x, y:aglPos.y, z:aglPos.z+agl});
                    }
                }
            }
        },
    }
};
</script>
