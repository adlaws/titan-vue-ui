import EventUtils from '@/assets/js/utils/event-utils.js';
import TitanUtils, { OBJECT_TYPE, $tWorldInterface, $tCrewInterface, $tRenderToolbox, $tMathInterface } from '@/assets/js/titan/titan-utils.js';
import MathUtils from '@/assets/js/utils/math-utils.js';

export default class TitanEditorThing
{
    constructor()
    {
        this.isMouseDown = false;

        this.isMouseDragging = false;
        this.dragToMoveStarted = false;
        this.dragSelectStarted = false;

        this.waypointGroupSelected = false;
        this.waypointGroupSelection = [];

        this.isMountingVehicle = false;

        this.freePanningMode = false;

        this.currentDrawingTool = null;

        this.allowRotation = false;
    }

    handleMouseEvent(evt)
    {
        if(EventUtils.isMouseDown(evt))
            this.handleLeftMouseDown(evt);
    }

    handleLeftMouseDown(e)
    {
        this.isMouseDown = true;

        const eventWinXY = {x:e.clientX||e.winX, y:e.clientY||e.winY};

        const withShiftKey = EventUtils.hasShiftKey(e);
        const withCtrlKey = EventUtils.hasCtrlKey(e);
        const withAltKey = EventUtils.hasAltKey(e);
        const noModifierKeys = !(withShiftKey || withCtrlKey || withAltKey);

        const activeScenario = $tWorldInterface.getActiveScenario();

        const isEntitySelected = activeScenario.isEntitySelected();
        const isObjectSelected = activeScenario.isObjectSelected();

        let shiftAndEntitySelected = false;
        if((isEntitySelected || isObjectSelected) && withShiftKey)
        {
            shiftAndEntitySelected = true;
            $tWorldInterface.injectMousePosition({x:e.winX,y:e.winY}, 15000);
        }

        const isSelectableObjectUnderMouse = $tWorldInterface.isSelectableObjectUnderMouse();
        const isSelectableWaypointUnderMouse = $tWorldInterface.isSelectableWaypointUnderMouse();

        //if we are dragging an entity from the units menu lets ignore this event
        if ($global.utils.isEntityDragDropReady())
        {
            $global.utils.entityDragPlacementSetOff();
        }

        if(!$global.eventHandlers.drawingWidgetActive)
        {
            this.currentDrawingTool = null;
        }

        if(this.currentDrawingTool)
        {
            if(this.currentDrawingTool == "tactic" )
            {
                if (withShiftKey)
                {
                    $tRenderToolbox.setPenPosition(eventWinXY);
                    $tRenderToolbox.penDown();
                    activeScenario.getEventSystem().sendEventArgs('penDown', {cursorPos: eventWinXY});
                    return true;
                }
                $tRenderToolbox.setPenPosition(eventWinXY);
                $tRenderToolbox.penDown();
                $global.tacticalTools.isActivated = true;
                if ($tRenderToolbox.getTacticalSymbolControllerInterface().isTacticalSymbolSelected())
                    return true;
            }
            else if(this.currentDrawingTool !== "none" &&
                this.currentDrawingTool !== "tactic" &&
                !isSelectableObjectUnderMouse &&
                !shiftAndEntitySelected)
            {
                $tWorldInterface.injectMousePosition(eventWinXY, 15000);
                $tWorldInterface.clearSelection();
                if(this.currentDrawingTool === "polyline")
                {
                    $tRenderToolbox.setDefaultStartHeight(50);
                }
                if(this.currentDrawingTool === "phaseline" )
                {
                    $global.phaseLine.start = $tWorldInterface.getWorldPosFromScreenPix(eventWinXY);
                    $global.phaseLine.startScreen = eventWinXY;
                }
                else
                    $tRenderToolbox.setDefaultStartHeight(0.5);

                $tRenderToolbox.setPenPosition(eventWinXY);
                $tRenderToolbox.penDown();
                if(this.currentDrawingTool.indexOf("_") !== -1)
                {
                    // is specific symbol i.e. WAR.AIRTRK_FRIEND
                    let id = $tRenderToolbox.getLastCreatedCanvasID();
                    $global.sendEventArgs("symbolPlaced", {symbolID: id});
                }
                return true;
            }
        }

        const worldPos = TitanUtils.worldPosForWindowCoords(eventWinXY);

        // if the waypoint settings menu is opened and we clicked on something else - close the waypoint menu
        if(isSelectableObjectUnderMouse &&
            !isSelectableWaypointUnderMouse)
        {
            if($global.titan_widgets.waypointSettingsMenu.isOpened)
            {
                $global.closeWidget('waypointSettingsMenu');
            }
        }

        if(isSelectableWaypointUnderMouse)
        {
            let wpUuid = $tWorldInterface.getObjectUUIDUnderMouse();
            $global.sendEventArgs('WaypointSelected', {'guid': wpUuid});
        }

        /*
        * If a selection was made to mount from the rmb context menu the next click
        * will check for a mountable vehicle and return
         */
        if(this.isMountingVehicle)
        {
            $tWorldInterface.endRubberbandingToCursor();
            $global.eventHandlers.selectedMountEntityList = activeScenario.getSelectedObjectsList();
            if(isSelectableObjectUnderMouse)
            {
                let mountEntityGUID;
                let uid = $tWorldInterface.getEntityUUIDUnderMouse();

                $global.eventHandlers.selectedMountEntityList.forEach(function(entityDesc)
                {
                    let availableCrewRoles = $tCrewInterface.getEmptyDevicesFromUnitID(uid);
                    mountEntityGUID = entityDesc.GUID;
                    if(availableCrewRoles.length > 0)
                    {
                        $tCrewInterface.assignResourceIDToDevice( mountEntityGUID, availableCrewRoles[0] );
                    }
                });
                $tWorldInterface.clearSelection();
            }
            this.isMountingVehicle = false;
            return true;
        }

        if ($global.eventHandlers.isWaypointAttachingInProgress)
        {
            $tWorldInterface.endRubberbandingToCursor();
            $global.eventHandlers.selectedWaypointAttachList = activeScenario.getSelectedObjectsList();
            if (isSelectableObjectUnderMouse)
            {
                let uid = $tWorldInterface.getEntityUUIDUnderMouse();
                let target = activeScenario.getEntityByGUID(uid);

                $global.eventHandlers.selectedWaypointAttachList.forEach((entityDesc) =>
                {
                    let waypoint = activeScenario.getWaypointByGUID(entityDesc.GUID);
                    if (waypoint !== null)
                        waypoint.attach(target);
                });
                $tWorldInterface.clearSelection();
                return true;
            }
            $global.eventHandlers.isWaypointAttachingInProgress = false;
            return true;
        }

        if(!isSelectableObjectUnderMouse &&
            noModifierKeys &&
            this.freePanningMode &&
            $global.utils.entityDragPlacementActive() === false)
        {
            $tWorldInterface.showGizmoAt(worldPos);
            $tWorldInterface.clearSelection();
            return $global.eventHandlers.despatchToDesktop.call(this, e);
        }

        // if there is a entity under the mouse and the ctrl key is down
        // return here and let mouse up handle the logic further down
        if(isSelectableObjectUnderMouse && withCtrlKey )
        {
            return true;
        }

        if(!isSelectableObjectUnderMouse &&
            withCtrlKey &&
           $global.utils.entityDragPlacementActive() === false)
        {

            $tWorldInterface.showGizmoAt(worldPos);
            $tWorldInterface.select();
            this.allowRotation = false;
            this.dragSelectStarted = true;
            $tWorldInterface.beginAreaDragSelect();
            return true;
        }

        $tWorldInterface.setOffsetStartPoint(worldPos);
        $tWorldInterface.getOffsetStartPoint ();
        $global.eventHandlers.allowObjectMove = true;

        if ($global.attachingTrigger)
        {
            // We are attaching a trigger
            let entity = activeScenario.getEntityByGUID($tWorldInterface.getEntityUUIDUnderMouse());
            if(entity)
            {
                $global.attachingTrigger.attachToEntity(entity);
            }
            delete $global.attachingTrigger;
            return true;
        }
        else if( withShiftKey && !$tWorldInterface.isClientSession())
        {
            //.. On left click. If shift key is detected and entities are selected, create a waypoint path
            $global.eventHandlers.lastSelectedObjectList = activeScenario.getSelectedObjectsList();
            let selectedObjects = activeScenario.getSelectedObjectsList();

            //.. If there is no entity at the clicked position set it to the new world position
            $tWorldInterface.showGizmoAt(worldPos);
            $tWorldInterface.select();

            let isValidSelection = (selectedObjects.length > 0) && (typeof selectedObjects[0] !== 'undefined');

            if (isValidSelection &&
                selectedObjects[0].typeName === OBJECT_TYPE.WAYPOINT &&
                isSelectableWaypointUnderMouse &&
                selectedObjects.length === 1)
            {
                // Should we create a cycle waypoint?

                let newSelectedWpUUID = $tWorldInterface.getObjectUUIDUnderMouse();
                let $newSelectedWp = activeScenario.getWaypointByGUID(newSelectedWpUUID);
                let $path = $newSelectedWp.getPath();
                let newWaypointIndex = $path.getWaypointIndex($newSelectedWp);
                let $existingSelectedWp = activeScenario.getWaypointByGUID(selectedObjects[0].GUID);
                let existingWaypointIndex = $path.getWaypointIndex($existingSelectedWp);
                let lastIndexInPath = activeScenario.getSelectedWaypointPath().getWaypointCount() - 1;

                if( existingWaypointIndex === lastIndexInPath && newWaypointIndex === 0 && $path.getWaypointCount() > 1)
                {
                    $existingSelectedWp.setWaypointType('WT_Cycle');
                    return true;
                }
            }

            /**
             * If nothing is selected or selection is not last waypoint index
             * Insert a waypoint between two existing waypoints
             */
            if(typeof selectedObjects[0] === "undefined" ||
                selectedObjects[0].typeName === OBJECT_TYPE.WAYPOINT &&
                activeScenario.getSelectedWaypointIndex() !== activeScenario.getSelectedWaypointPath().getWaypointCount()-1)
            {
                let waypoint = activeScenario.createWaypointBeneathMouseOnExistingPath(worldPos, 5.0, 1.0);
                // for some reason selecting the waypoint here does not work
                if(waypoint)
                    waypoint.select(true, true);

                $global.eventHandlers.addingWaypoint = true;
            }
            else if( isValidSelection )
            {
                //.. If a waypoint is at the position assign any selected entities and exit
                if( isSelectableWaypointUnderMouse )
                {
                    let waypointPath = activeScenario.getSelectedWaypointPath();
                    for(let idx=0; idx<selectedObjects.length; idx++)
                    {
                        if (selectedObjects[idx].typeName !== OBJECT_TYPE.WAYPOINT)
                        {
                            const entity = activeScenario.getEntity(selectedObjects[idx]);

                            if (entity.getTypeName() === OBJECT_TYPE.AEROPLANE)
                                entity.assignPath( waypointPath.getGUID() );
                            else
                                entity.assignWaypointPathInterface( waypointPath );

                            entity.setLineVisible(true);
                        }
                    }

                    return true;
                }

                //.. If a entity has a follow waypoint assigned hide the waypoint
                selectedObjects
                    .filter((obj) => obj.typeName === OBJECT_TYPE.ENTITY)
                    .forEach((obj)=>
                    {
                        const waypointPath = activeScenario.getEntityByName(obj.name).getAssignedWaypointPath();
                        if(waypointPath.getWaypointCount() > 0)
                        {
                            let waypoint = waypointPath.getWaypoint(0);

                            if(waypoint.getWaypointType() == "WT_FollowEntity")
                                waypoint.removeFromScene();
                        }
                    });

                let entitiesInGroupSelection = false;
                let waypointFoundInGroupSelection = false;
                let entityArr = [];
                let pathArr = [];

                selectedObjects.forEach((candidate)=>
                {
                    const type = candidate.typeName;
                    if(type === OBJECT_TYPE.WAYPOINT)
                    {
                        // it's a waypoint
                        waypointFoundInGroupSelection = true;

                        let pathExistsInArray = false;
                        const waypointPathForCandidateGUID = activeScenario.getWaypointPath(candidate).getGUID();
                        for(let j=0; j<pathArr.length; j++)
                        {
                            const item = pathArr[j].path;
                            let waypointPathGUID = activeScenario.getWaypointPath(item).getGUID();
                            pathExistsInArray = ( waypointPathForCandidateGUID === waypointPathGUID );
                            if( pathExistsInArray )
                                break;
                        }

                        if( !pathExistsInArray )
                        {
                            const pathData = {path: candidate};
                            pathArr.push(pathData);
                        }
                    }
                    else if(type === OBJECT_TYPE.ENTITY || type === OBJECT_TYPE.GROUP_ENTITY)
                    {
                        // it's an entity
                        let entityData = {entity: candidate};
                        entityArr.push(entityData);
                        entitiesInGroupSelection = true;

                    }
                });

                // Disabled to prevent midpoint waypoint being created while attempting to create waypoint inside of a large entity
                /**** Breaks in this code block - INVESTIGATE CAUSE (ADD Mathermatics) */
                if( entitiesInGroupSelection && !waypointFoundInGroupSelection || entitiesInGroupSelection && waypointFoundInGroupSelection)
                {
                    this.waypointGroupSelected = true;
                    let centerPos = activeScenario.getSelectionGroupCenter();

                    for(let i=0; i<entityArr.length; i++)
                    {
                        let thisEntity = activeScenario.getEntity(entityArr[i].entity);
                        let offset = MathUtils.vecSub(thisEntity.getPosition (), centerPos);
                        let finalPos = MathUtils.vecAdd(worldPos, offset);

                        let waypointPath = activeScenario.createWaypointPath();

                        let waypoint = waypointPath.createWaypointECEF(finalPos);

                        if (waypoint != null)
                        {
                            waypointPath.setVisible(true);

                            let entityToWaypointV = MathUtils.vecSub(finalPos, thisEntity.getPosition());
                            let initialRot = $tMathInterface.generateHorizonAlignedLookAt(thisEntity.getPosition(), entityToWaypointV);
                            waypoint.setRotation(initialRot);

                            if($global && $global.updateWidget)
                            {
                                $global.updateWidget();
                            }
                            waypoint.translateAltitude(1.0);
                            waypoint.setName(waypoint.GUID);
                            this.waypointGroupSelection.push(waypoint);
                            waypoint.select(true,true);

                            let ent = activeScenario.getEntity(entityArr[i].entity);

                            //if creating waypoint on a group, we want to set desired alt if the leader is an aircraft
                            let groupLeaderIsAircraft = false;
                            if ( ent.isGroup())
                            {
                                let $tempGroup = ent.getGroupInterface();
                                let $tempLeader = $tempGroup.getGroupLeader();
                                if ($tempLeader.getTypeName() === OBJECT_TYPE.AEROPLANE || $tempLeader.getTypeName() === OBJECT_TYPE.HELICOPTER )
                                {
                                    groupLeaderIsAircraft = true;
                                }
                            }

                            if (ent.getTypeName() === OBJECT_TYPE.AEROPLANE || ent.getTypeName() === OBJECT_TYPE.HELICOPTER || groupLeaderIsAircraft )
                            {
                                ent.assignPath(waypointPath.getGUID());
                                let pathAir = ent.getAssignedWaypointPath();
                                let airWpCount = pathAir.getWaypointCount();
                                for(let w=0; w<airWpCount; w++)
                                {
                                    let entAlt = ent.getAltitudeAGL();
                                    let entASL = ent.getPositionASL().z;
                                    let desiredAltitude = Math.min(entAlt, entASL);

                                    pathAir.getWaypoint(w).setDesiredAltitude( desiredAltitude );
                                }
                            }
                            else
                            {
                                ent.assignWaypointPathInterface(waypointPath);
                            }
                        }
                    }
                }
                /**
                 * Extending the selected waypoint path with a new waypoint
                 */
                else if( waypointFoundInGroupSelection && !entitiesInGroupSelection)
                {
                    this.waypointGroupSelected = true;
                    let centerPos = activeScenario.getSelectionGroupCenter();

                    for(let i=0; i<pathArr.length; i++)
                    {
                        let thisWp = activeScenario.getWaypoint(pathArr[i].path);
                        let offset = MathUtils.vecSub (thisWp.getPosition (), centerPos);
                        let finalPos = MathUtils.vecAdd (worldPos, offset);
                        let selPath = activeScenario.getWaypointPath(pathArr[i].path);
                        let waypoint = activeScenario.getWaypointPath(pathArr[i].path).createWaypointECEF (finalPos);
                        let lastWaypoint = null;
                        let previousIndex = selPath.getWaypointCount()-2;

                        previousIndex = (previousIndex >= 0)? previousIndex : 0;
                        lastWaypoint = selPath.getWaypoint(previousIndex);

                        selPath.setVisible(true);

                        if(waypoint)
                        {
                            waypoint.translateAltitude(1.0);
                            waypoint.setDesiredAltitude(lastWaypoint.getDesiredAltitude());
                            $global.updateWidget();
                            waypoint.setName( waypoint.GUID );
                            this.waypointGroupSelection.push(waypoint);

                            waypoint.select(true,true);

                            $global.eventHandlers.addingWaypoint = true;
                        }
                    }
                }
                return true;
            }
        }

        //.. If no entity or waypoint is selected, set the new world position
        $tWorldInterface.injectMousePosition(eventWinXY, 15000);
        $tWorldInterface.showGizmoAt(worldPos);

        if( isSelectableObjectUnderMouse )
        {
            let clear = true;
            let objList = activeScenario.getSelectedObjectsList();

            for(let i=0; i<objList.length; i++)
            {
                if (objList[i].GUID === $tWorldInterface.getObjectUUIDUnderMouse())
                {
                    clear = false;
                    break;
                }
            }

            if(clear)
                $tWorldInterface.clearSelection();

            $tWorldInterface.select();

            this.isMouseDragging = true;

            // This check is for assurance since isSelectableObjectUnderMouse should have returned true.
            // Use the first object in the list since it's unlikely that two objects will be selected at the same time
            // for a mouse down event. Either way, they should have very similar positions.

            // Set up entity drag letiables in case this left-click is initiating a drag operation.
            $tWorldInterface.setMouseDragLocation(eventWinXY);
            let selectableScreenPos = $tWorldInterface.getScreenPositionOfSelectableUnderMouse();
            selectableScreenPos.y = screen.availHeight - selectableScreenPos.y; // ot::world::get_screen_pix() returns height in the opposite direction.
            $tWorldInterface.setDraggedEntityScreenLocation(selectableScreenPos);

            let selectableWorldPos = $tWorldInterface.getWorldPosFromScreenPix(selectableScreenPos);
            $tWorldInterface.setOffsetStartPoint(selectableWorldPos);
            this.dragToMoveStarted = true;

        }
        else if ($global.utils.entityDragPlacementActive() === false)
        {
            $tWorldInterface.clearSelection();
            $tWorldInterface.beginAreaDragSelect();
            this.dragSelectStarted = true;
        }

        return false;
    }
















    handleLeftMouseUp(e)
    {
        this.isMouseDown = false;

        const withShiftKey = EventUtils.hasShiftKey(e);
        const withCtrlKey = EventUtils.hasCtrlKey(e);
        const eventWinXY = {x:e.clientX||e.winX, y:e.clientY||e.winY};

        //if we are dragging an entity from the units menu lets ignore this event
        // - DRAGANDDROP_FIX
        if ($global.utils.entityDragPlacementActive())
        {
            $global.utils.entityDragPlacementSetOff();
            return true;
        }

        const activeScenario = $tWorldInterface.getActiveScenario();
        const selectedObjects = activeScenario.getSelectedObjectsList();
        const isSelectableObjectUnderMouse = $tWorldInterface.isSelectableObjectUnderMouse();

        //hiding  of right click context menu is required here as well as hyp_rightClickSettingsMenu.js to handle different conditions such as overlapping transparent windows etc.
        if ($global.utils.isRightClickOptionsMenuOpen())
        {
            $global.sendEventArgs('hideRightClickSettingsMenu', {});
        }

        $global.sendEventArgs('hideRightClickGroupSettingsMenu', {});


        // closing of right click context menu is required here as well as
        // hyp_rightClickRTSMenu.js to handle different conditions such as overlapping transparent windows etc.
        if ($global.windows.rightClickRTSMenu &&
            $global.windows.rightClickRTSMenu.isOpened)
        {
            $global.closeWindow('rightClickRTSMenu');
            delete $global.windows.rightClickRTSMenu;
            return true;
        }

        if ($global.windows.popUpTacticMenu &&
            $global.windows.popUpTacticMenu.isOpened)
        {
            $global.tacticalTools.ismoving = false;
            $global.closeWindow('rightClickTacticMenu');
            delete $global.windows.popUpTacticMenu;
        }

        if(isSelectableObjectUnderMouse && withCtrlKey )
        {
            const selectedObjectCount = selectedObjects.length;
            if(selectedObjectCount === 1 &&
                $tWorldInterface.getEntityUUIDUnderMouse() === selectedObjects[0].GUID)
            {
                return true;
            }
            else
            {
                $tWorldInterface.toggleSelect();
            }

            return true;
        }

        // this is already done about a page or so down, not sure why it's done twice
        selectedObjects.filter(desc => desc.typeName === OBJECT_TYPE.ENTITY || desc.typeName === OBJECT_TYPE.GROUP_ENTITY )
            .forEach((desc) =>
            {
                let entity = activeScenario.getEntity(desc);
                if(entity)
                    entity.setEditDragActive(false);
            });

        $global.sendEventArgs("worldPosChanged", $tWorldInterface.getWorldPositionUnderMouse());

        this.allowRotation = true;
        $global.eventHandlers.dragToMoveStarted = false;

        if($global.eventHandlers.entityWasCreatedOnDblClick || (!isSelectableObjectUnderMouse && e.modifiers === 0))
        {
            $global.eventHandlers.entityWasCreatedOnDblClick = false;
            if (typeof $global.freePanningMode !== "undefined")
            {
                if($global.freePanningMode && $global.utils.entityDragPlacementActive() === false)
                {
                    return $global.eventHandlers.despatchToDesktop.call(this, e);
                }
            }
        }

        let shiftAndEntitySelected = false;
        if(activeScenario.isEntitySelected() && withShiftKey)
        {
            shiftAndEntitySelected = true;
        }

        if(!$global.eventHandlers.drawingWidgetActive)
        {
            $global.selectedDrawindTool = null;
        }

        if($global.selectedDrawindTool && $global.selectedDrawindTool !== "none" && $global.selectedDrawindTool !== "tactic" && !shiftAndEntitySelected)
        {
            if($global.selectedDrawindTool == 'phaseline')
            {
                // phase line - STE imle TODO: Clean up!
                let phaseStartPos = $global.phaseLine.start;//$tRenderToolbox.getPhaseLineStartPosition();
                let phaseFinishPos = $tWorldInterface.getWorldPosFromScreenPix(eventWinXY);

                if(phaseFinishPos.x != 0)
                {
                    $tWorldInterface.commit_editor_changes();
                    $global.drawingToolsPhaseLineFunction(phaseStartPos, phaseFinishPos);
                    $tRenderToolbox.setPenPosition($global.phaseLine.startScreen);
                }
            }
            $tRenderToolbox.penUp();
            $tWorldInterface.refreshRenderToolboxCaptureData();
            return true;
        }

        if($global.selectedDrawindTool && $global.selectedDrawindTool == "tactic" && $global.tacticalTools.isActivated)
        {
            $tRenderToolbox.penUp();
            let obj = {
                screenPosWindow: { x: eventWinXY.x - 83, y: window.innerHeight - (eventWinXY.y + 90)},
                cursorPos: eventWinXY
            };
            if($global.tacticalTools.ismoving)
                activeScenario.getEventSystem().sendEventArgs('penUp', obj);

            $global.tacticalTools.ismoving = false;
            $tWorldInterface.refreshRenderToolboxCaptureData();
            $global.tacticalTools.isActivated = false;
            if ($tRenderToolbox.getTacticalSymbolControllerInterface().isTacticalSymbolSelected())
                return true;
        }

        if( this.isMouseDragging )
        {
            this.isMouseDragging = false;

            //If we were dragging vehicles re-enable physics
            if ($global.eventHandlers.selectedObjectsPhysicsDisabled)
            {
                // must flush pending uncommitted changes before snapToGround calls
                $tWorldInterface.commit_editor_changes();

                for(let i=0; i<selectedObjects.length; i++)
                {
                    let object = selectedObjects[i];
                    let objType = object.typeName;
                    if( objType === OBJECT_TYPE.ENTITY )
                    {
                        // it's an entity
                        let entity = activeScenario.getEntity(object);

                        let entityType = entity.getTypeName();

                        if( entityType === OBJECT_TYPE.GROUND_VEHICLE ||
                            entityType === OBJECT_TYPE.TURRET ||
                            entityType === OBJECT_TYPE.CHARACTER)
                        {
                            if(shouldSnapToTerrain[i])
                            {
                                // normal when dragging to dip slightly underground, so silence the error
                                entity.smartPopAboveGround(0.2,false);
                                entity.snapToGround();
                            }
                            if(entityType !== OBJECT_TYPE.TURRET)
                                entity.setEditDragActive(false);
                        }
                        else if(entityType == OBJECT_TYPE.HELICOPTER || entityType == OBJECT_TYPE.AEROPLANE)
                        {
                            entity.setEditDragActive(false);
                            entity.setPosition( entity.getPosition() );
                        }
                    }
                }
                $global.eventHandlers.selectedObjectsPhysicsDisabled = false;
            }
        }
        else
        {
            // End of drag selection
            if(this.dragSelectStarted)
            {
                //$global.infoLog("Ending drag select");
                $tWorldInterface.endAreaDragSelect();
            }
        }

        //.. On left mouse up, get the mouse offset starting point. If an entity is selected remove it's waypoint line
        if(withShiftKey)
        {
            // If they let go of the shift key stop rubber banding.
            if ($tWorldInterface.isRubberbandingToCursor("RO_WaypointLine"))
            {
                $tWorldInterface.endRubberbandingToCursor();
            }

            if( this.waypointGroupSelected )
            {
                $tWorldInterface.clearSelection();
                for(let i=0; i<this.waypointGroupSelection.length; i++)
                {
                    const waypoint = this.waypointGroupSelection[i];
                    if(waypoint)
                    {
                        waypoint.select(true,true);
                    }
                }

                this.waypointGroupSelection = [];
                this.waypointGroupSelected = false;

                //must return early because we dont want to clear the selections when placing group of waypoints.
                return true;
            }

            if($tWorldInterface.isSelectableObjectUnderMouse())
            {
                $tWorldInterface.clearSelection();
                $tWorldInterface.select();
            }

            /**
             * If we added a new waypoint on mouse down send a global event that can be used to update
             * other windows
             */
            if($global.eventHandlers.addingWaypoint)
            {
                $global.eventHandlers.addingWaypoint = false;
            }
            return true;
        }

        if(activeScenario.getSelectedWaypointPath())
        {
            $global.updateWidget();
        }

        $tWorldInterface.commit_editor_changes();

        $tWorldInterface.resetTranslateAnchorPoint();

        if(selectedObjects.length>0 && selectedObjects[0] !== undefined)
        {
            let selectedObject = selectedObjects[0];
            let pathLines = activeScenario.getSelectedWaypointPath();
            if(selectedObject.typeName === OBJECT_TYPE.ENTITY)
            {
                $global.eventHandlers.removeBlueLine();
            }

            //.. If a waypoint path was selected on mouse down, remove the waypoint lines
            //.. Should set this to only happen in preview mode
            if(window.isPreviewMode && selectedObject.typeName === OBJECT_TYPE.WAYPOINT)
            {
                window.setTimeout(function()
                {
                    pathLines.setVisible(false);
                }, 5000);
            }

            $tWorldInterface.getOffsetStartPoint();
            return true;
        }

        return false;
    } // end handleLeftMouseUp()
}
