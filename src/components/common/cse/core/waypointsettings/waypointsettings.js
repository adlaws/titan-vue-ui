export const WAYPOINT =
{
    TYPE:
    {
        MOVE: {id: 'MOVE', label: 'Move', icon:'chevron-double-right'},
        ATTACK: {id: 'ATTACK', label: 'Attack', icon:'octagram-outline'},
        LOITER: {id: 'LOITER', label: 'Loiter', icon:'orbit-variant'},
        CYCLE: {id: 'CYCLE', label: 'Cycle', icon:'redo-variant'},
        BEHAVIOUR: {id: 'BEHAVIOUR', label: 'Behaviour', icon:'script-text-outline'},
        CITY_ROAM_PATH: {id: 'CITY_ROAM_PATH', label: 'City Roam Path', icon:'city-variant-outline'},
        FOLLOW_ROAD: {id: 'FOLLOW_ROAD', label: 'Follow Road', icon:'road'},
    },
    ROE:
    {
        UNIT_DEFAULT:{id: 'UNIT_DEFAULT', label:'Unit Default', icon: 'book'},
        NEVER:{id: 'NEVER', label:'Never', icon: 'cancel'},
        ON_SIGHT:{id: 'ON_SIGHT', label:'On Sight', icon: 'eye'},
        ON_SIGHT_IN_RANGE:{id: 'ON_SIGHT_IN_RANGE', label:'On Sight In Range', icon: 'eye-circle-outline'},
        ON_SIGHT_ON_PATH:{id: 'ON_SIGHT_ON_PATH', label:'On Sight On Path', icon: 'eye-settings'},
        ON_ATTACKED:{id: 'ON_ATTACKED', label:'On Attacked', icon: 'alert-octagram-outline'},
        FALL_BACK_ON_FIRE:{id: 'FALL_BACK_ON_FIRE', label:'Fall Back On Fire', icon: 'vanish'},
        SELECT_POSITION_FROM_WAYPOINTS:{id: 'SELECT_POSITION_FROM_WAYPOINTS', label:'Select Position From Waypoints', icon: 'vector-point'},
    },
};
WAYPOINT.TYPE_OPTIONS = Object.getOwnPropertyNames(WAYPOINT.TYPE).map(x => WAYPOINT.TYPE[x].id);
WAYPOINT.ROE_OPTIONS = Object.getOwnPropertyNames(WAYPOINT.ROE).map(x => WAYPOINT.ROE[x].id);

export const DUMMY_WAYPOINT = {
    uid: 'dummy',
    name:'',
    type: WAYPOINT.TYPE.MOVE.id,
    lla: { latitude: 0, longitude: 0, altitude: 0},
    speed: 0,
    wait: 0,
    roe: WAYPOINT.ROE.NEVER.id,
};