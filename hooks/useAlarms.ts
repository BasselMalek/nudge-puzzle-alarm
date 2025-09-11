import { useReducer, useState, useCallback } from "react";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { SQLiteDatabase } from "expo-sqlite";
import { DayKey } from "@/types/DayKey";
import { PowerUp } from "@/types/PowerUp";
import { Puzzle } from "@/types/Puzzle";
import { randomUUID } from "expo-crypto";
import * as AlarmBridge from "@/modules/expo-alarm-manager";
import { addDays, isFuture } from "date-fns";

type AlarmAction =
    | { type: "UPDATE_ALARM"; payload: Partial<Alarm> & { id: string } }
    | { type: "DELETE_ALARM"; payload: string }
    | { type: "ADD_ALARM"; payload: Alarm }
    | { type: "SET_ALARMS"; payload: Alarm[] };

export const formatDistanceStrictShortend = (
    laterDate: Date,
    earlierDate: Date
) => {
    const unixMs = laterDate.getTime() - earlierDate.getTime();
    if (unixMs >= 86400000 || unixMs < 0) {
        return "24h+";
    } else {
        const totalMins = Math.floor(unixMs / 1000 / 60);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hrs != 0) {
            return `${hrs}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }
};

export const saveAlarmDirect = (
    id: string,
    db: SQLiteDatabase,
    alarm: Alarm
) => {
    if (id === "new") {
        db.runSync(
            "INSERT INTO alarms (id, name, ring_hours, ring_mins, repeat, repeat_days, puzzles, power_ups, is_enabled, last_modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                alarm.id,
                alarm.name,
                alarm.ringHours,
                alarm.ringMins,
                alarm.repeat ? 1 : 0,
                JSON.stringify(alarm.repeatDays),
                JSON.stringify(alarm.puzzles),
                JSON.stringify(alarm.powerUps),
                alarm.isEnabled ? 1 : 0,
                new Date().toISOString(),
            ]
        );
    } else {
        db.runSync(
            "UPDATE alarms SET name = ?, ring_hours = ?, ring_mins = ?, repeat = ?, repeat_days = ?, puzzles = ?, power_ups = ?, is_enabled = ?, last_modified = ? WHERE id = ?;",
            [
                alarm!.name,
                alarm!.ringHours,
                alarm!.ringMins,
                alarm!.repeat ? 1 : 0,
                JSON.stringify(alarm!.repeatDays),
                JSON.stringify(alarm!.puzzles),
                JSON.stringify(alarm!.powerUps),
                alarm!.isEnabled ? 1 : 0,
                alarm!.lastModified.toISOString(),
                alarm.id,
            ]
        );
    }
};

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
    ringHours: result.ring_hours,
    ringMins: result.ring_mins,
    lastModified: new Date(result.last_modified),
});

export const createAlarm = (params: {
    name: string;
    ringHours?: number;
    ringMins?: number;
    repeat?: boolean;
    repeatDays?: DayKey[];
    puzzles?: Puzzle[];
    powerUps?: PowerUp[];
}): Alarm => ({
    id: randomUUID(),
    name: params.name,
    ringHours: params.ringHours ?? 12,
    ringMins: params.ringMins ?? 0,
    repeat: params.repeat ?? false,
    repeatDays: params.repeatDays ?? [],
    puzzles: params.puzzles ?? [],
    powerUps: params.powerUps ?? [],
    isEnabled: true,
    lastModified: new Date(),
});

export const useAlarms = (db: SQLiteDatabase, linkingScheme: string) => {
    const [alarms, dispatch] = useReducer(alarmsReducer, []);
    const [diff, setDiff] = useState<Map<string, Alarm>>(
        new Map<string, Alarm>()
    );
    AlarmBridge.setLinkingScheme(linkingScheme);
    const loadAlarms = useCallback(async () => {
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
    }, [db]);

    const saveAlarms = useCallback(async () => {
        alarms.forEach((v) => {
            if (
                v.lastModified.getTime() >
                diff!.get(v.id)!.lastModified.getTime()
            ) {
                db.runAsync(
                    "UPDATE alarms SET name = ?, ring_hours = ?, ring_mins = ?, repeat = ?, repeat_days = ?, puzzles = ?, power_ups = ?, is_enabled = ?, last_modified = ? WHERE id = ?;",
                    [
                        v!.name,
                        v!.ringHours,
                        v!.ringMins,
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
    }, [alarms, diff, db]);

    const updateAlarm = useCallback(
        (id: string, updates: Partial<Alarm>) => {
            dispatch({
                type: "UPDATE_ALARM",
                payload: { id, ...updates },
            });
            if (
                updates.ringHours !== undefined ||
                updates.ringMins !== undefined
            ) {
                const ringDateToday = new Date(
                    new Date().setHours(updates.ringHours!, updates.ringMins!)
                );
                AlarmBridge.modifyAlarm(
                    id,
                    isFuture(ringDateToday)
                        ? ringDateToday.getTime()
                        : addDays(ringDateToday, 1).getTime()
                );
            }
        },
        [alarms]
    );

    const deleteAlarm = useCallback(
        (id: string) => {
            AlarmBridge.deleteAlarm(id);
            dispatch({
                type: "DELETE_ALARM",
                payload: id,
            });
            db.runAsync("DELETE FROM alarms WHERE id = ?;", [id]);
        },
        [db]
    );

    const toggleAlarm = useCallback(
        (id: string) => {
            const alarm = alarms.find((v) => v.id === id);
            const enableState = alarm!.isEnabled;
            if (enableState) {
                AlarmBridge.deleteAlarm(id);
            } else {
                const ringDateToday = new Date(
                    new Date().setHours(alarm!.ringHours, alarm!.ringMins)
                );
                AlarmBridge.scheduleAlarm(
                    id,
                    isFuture(ringDateToday)
                        ? ringDateToday.getTime()
                        : addDays(ringDateToday, 1).getTime()
                );
            }
            updateAlarm(id, { isEnabled: !alarm!.isEnabled });
        },
        [alarms]
    );

    return {
        alarms,
        loadAlarms,
        updateAlarm,
        deleteAlarm,
        saveAlarms,
        toggleAlarm,
        parseAlarm,
        createAlarm,
    };
};
