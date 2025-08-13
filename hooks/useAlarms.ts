import { useReducer } from "react";
import { Alarm } from "@/types/Alarm";

type AlarmAction =
    | { type: "UPDATE_ALARM"; payload: Partial<Alarm> & { id: string } }
    | { type: "DELETE_ALARM"; payload: string }
    | { type: "ADD_ALARM"; payload: Alarm }
    | { type: "SET_ALARMS"; payload: Alarm[] };

const alarmsReducer = (state: Alarm[], action: AlarmAction): Alarm[] => {
    switch (action.type) {
        case "UPDATE_ALARM":
            return state.map((alarm) =>
                alarm.id === action.payload.id
                    ? { ...alarm, ...action.payload, updatedAt: new Date() }
                    : alarm
            );

        case "DELETE_ALARM":
            return state.filter((alarm) => alarm.id !== action.payload);

        case "ADD_ALARM":
            return [...state, action.payload];

        case "SET_ALARMS":
            return action.payload;

        default:
            return state;
    }
};

export const useAlarms = (initialAlarms: Alarm[] = []) => {
    const [alarms, dispatch] = useReducer(alarmsReducer, initialAlarms);

    const updateAlarm = (id: string, updates: Partial<Alarm>) => {
        dispatch({
            type: "UPDATE_ALARM",
            payload: { id, ...updates },
        });
    };

    const deleteAlarm = (id: string) => {
        dispatch({
            type: "DELETE_ALARM",
            payload: id,
        });
    };

    const addAlarm = (newAlarm: Alarm) => {
        dispatch({
            type: "ADD_ALARM",
            payload: newAlarm,
        });
    };
    return {
        alarms,
        updateAlarm,
        deleteAlarm,
        addAlarm,
    };
};
