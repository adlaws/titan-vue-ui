export const WAYPOINT =
{
    TYPE:
    {
        MOVE: {id: 'MOVE', label: 'Move', icon:'mdi-chevron-double-right'},
        ATTACK: {id: 'ATTACK', label: 'Attack', icon:'mdi-octagram-outline'},
        LOITER: {id: 'LOITER', label: 'Loiter', icon:'mdi-orbit-variant'},
        CYCLE: {id: 'CYCLE', label: 'Cycle', icon:'mdi-redo-variant'},
        BEHAVIOUR: {id: 'BEHAVIOUR', label: 'Behaviour', icon:'mdi-script-text-outline'},
        CITY_ROAM_PATH: {id: 'CITY_ROAM_PATH', label: 'City Roam Path', icon:'mdi-city-variant-outline'},
        FOLLOW_ROAD: {id: 'FOLLOW_ROAD', label: 'Follow Road', icon:'mdi-road'},
    },
    ROE:
    {
        UNIT_DEFAULT:{id: 'UNIT_DEFAULT', label:'Unit Default', icon: 'mdi-book'},
        NEVER:{id: 'NEVER', label:'Never', icon: 'mdi-cancel'},
        ON_SIGHT:{id: 'ON_SIGHT', label:'On Sight', icon: 'mdi-eye'},
        ON_SIGHT_IN_RANGE:{id: 'ON_SIGHT_IN_RANGE', label:'On Sight In Range', icon: 'mdi-eye-circle-outline'},
        ON_SIGHT_ON_PATH:{id: 'ON_SIGHT_ON_PATH', label:'On Sight On Path', icon: 'mdi-eye-settings'},
        ON_ATTACKED:{id: 'ON_ATTACKED', label:'On Attacked', icon: 'mdi-alert-octagram-outline'},
        FALL_BACK_ON_FIRE:{id: 'FALL_BACK_ON_FIRE', label:'Fall Back On Fire', icon: 'mdi-vanish'},
        SELECT_POSITION_FROM_WAYPOINTS:{id: 'SELECT_POSITION_FROM_WAYPOINTS', label:'Select Position From Waypoints', icon: 'mdi-vector-point'},
    },
};
WAYPOINT.TYPE_OPTIONS = Object.getOwnPropertyNames(WAYPOINT.TYPE).map(x => WAYPOINT.TYPE[x]);
WAYPOINT.ROE_OPTIONS = Object.getOwnPropertyNames(WAYPOINT.ROE).map(x => WAYPOINT.ROE[x]);

export const DUMMY_WAYPOINT = {
    uid: 'dummy',
    name:'',
    type: WAYPOINT.TYPE.MOVE.id,
    lla: { latitude: 0, longitude: 0, altitude: 0},
    speed: 0,
    wait: 0,
    roe: WAYPOINT.ROE.NEVER.id,
};