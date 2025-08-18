import { useReducer, useState } from "react";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { SQLiteDatabase } from "expo-sqlite";
import { DayKey } from "@/types/DayKey";
import { PowerUp } from "@/types/PowerUp";
import { Puzzle } from "@/types/Puzzle";
import { randomUUID } from "expo-crypto";

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
                    ? { ...alarm, ...action.payload, lastModified: new Date() }
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

export const parseAlarm = (result: AlarmDto): Alarm => ({
    id: result.id,
    name: result.name,
    isEnabled: result.is_enabled === 1 ? true : false,
    repeat: result.repeat === 1 ? true : false,
    repeatDays:
        result.repeat_days === null ? [] : JSON.parse(result.repeat_days),
    puzzles: result.puzzles === null ? [] : JSON.parse(result.puzzles),
    powerUps: result.power_ups === null ? [] : JSON.parse(result.power_ups),
    ringTime: result.ring_time,
    lastModified: new Date(result.last_modified),
});

export const createAlarm = (params: {
    name: string;
    ringTime?: string;
    repeat?: boolean;
    repeatDays?: DayKey[];
    puzzles?: Puzzle[];
    powerUps?: PowerUp[];
}): Alarm => ({
    id: randomUUID(),
    name: params.name,
    ringTime: params.ringTime ?? new Date().toISOString(),
    repeat: params.repeat ?? false,
    repeatDays: params.repeatDays ?? [],
    puzzles: params.puzzles ?? [],
    powerUps: params.powerUps ?? [],
    isEnabled: true,
    lastModified: new Date(),
});

export const useAlarms = (db: SQLiteDatabase) => {
    const [alarms, dispatch] = useReducer(alarmsReducer, []);
    const [diff, setDiff] = useState<Map<string, Alarm>>();
    const loadAlarms = async () => {
        const inital = await db.getAllAsync<AlarmDto>("SELECT * FROM alarms");
        dispatch({
            type: "SET_ALARMS",
            payload: inital.map((v, k) => parseAlarm(v)),
        });
        setDiff(
            new Map(
                inital.map((v, k) => {
                    const a = parseAlarm(v);
                    return [a.id, a];
                })
            )
        );
    };
    const saveAlarms = async () => {
        alarms.forEach((v) => {
            if (
                v.lastModified.getTime() >
                diff!.get(v.id)!.lastModified.getTime()
            ) {
                console.log("updated");

                db.runAsync(
                    "UPDATE alarms SET name = ?, ring_time = ?, repeat = ?, repeat_days = ?, puzzles = ?, power_ups = ?, is_enabled = ?, last_modified = ? WHERE id = ?;",
                    [
                        v!.name,
                        v!.ringTime,
                        v!.repeat ? 1 : 0,
                        JSON.stringify(v!.repeatDays),
                        JSON.stringify(v!.puzzles),
                        JSON.stringify(v!.powerUps),
                        v!.isEnabled ? 1 : 0,
                        v!.lastModified.toISOString(),
                        v.id,
                    ]
                );
            }
        });
    };

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
        db.runAsync("DELETE FROM alarms WHERE id = ?;", [id]);
    };

    return {
        alarms,
        loadAlarms,
        updateAlarm,
        deleteAlarm,
        saveAlarms,
        parseAlarm,
        createAlarm,
    };
};
