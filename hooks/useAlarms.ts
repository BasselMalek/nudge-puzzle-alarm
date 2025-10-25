import { useReducer, useState, useCallback, useEffect } from "react";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { SQLiteDatabase } from "expo-sqlite";
import { DaySet } from "@/types/DaySet";
import { Puzzle } from "@/types/Puzzles";
import { randomUUID } from "expo-crypto";
import {
    scheduleNextInstance,
    modifyNextInstance,
    disableNextInstance,
} from "@/utils/alarmSchedulingHelpers";
import { setLinkingScheme } from "@/modules/expo-alarm-manager";
import { BoosterSet } from "@/types/Boosters";

type AlarmAction =
    | { type: "UPDATE_ALARM"; payload: Partial<Alarm> & { id: string } }
    | { type: "DELETE_ALARM"; payload: string }
    | { type: "ADD_ALARM"; payload: Alarm }
    | { type: "SET_ALARMS"; payload: Alarm[] };

export const formatDistanceStrictShortened = (
    laterDate: Date,
    earlierDate: Date
) => {
    const unixMs = laterDate.getTime() - earlierDate.getTime();
    if (unixMs >= 86400000 || unixMs < 0) return "24h+";
    const totalMins = Math.floor(unixMs / 1000 / 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return hrs !== 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

export const saveAlarmDirect = async (
    id: string,
    db: SQLiteDatabase,
    alarm: Alarm
) => {
    if (id === "new") {
        const result = await db.runAsync(
            `INSERT INTO alarms
       (id, name, ring_hours, ring_mins, repeat, repeat_days,
        ringtone, vibrate, puzzles, booster_set, is_enabled, last_modified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                alarm.id,
                alarm.name,
                alarm.ringHours,
                alarm.ringMins,
                alarm.repeat ? 1 : 0,
                JSON.stringify(alarm.repeatDays),
                JSON.stringify(alarm.ringtone),
                alarm.vibrate ? 1 : 0,
                JSON.stringify(alarm.puzzles),
                JSON.stringify(alarm.boosterSet),
                alarm.isEnabled ? 1 : 0,
                new Date().toISOString(),
            ]
        );
        return result;
    } else {
        const result = await db.runAsync(
            `UPDATE alarms
         SET name = ?, ring_hours = ?, ring_mins = ?, repeat = ?, repeat_days = ?,
             ringtone = ?, vibrate = ?, puzzles = ?, booster_set = ?,
             is_enabled = ?, last_modified = ?
         WHERE id = ?`,
            [
                alarm.name,
                alarm.ringHours,
                alarm.ringMins,
                alarm.repeat ? 1 : 0,
                JSON.stringify(alarm.repeatDays),
                JSON.stringify(alarm.ringtone),
                alarm.vibrate ? 1 : 0,
                JSON.stringify(alarm.puzzles),
                JSON.stringify(alarm.boosterSet),
                alarm.isEnabled ? 1 : 0,
                alarm.lastModified.toISOString(),
                alarm.id,
            ]
        );
        return result;
    }
};

const alarmsReducer = (state: Alarm[], action: AlarmAction): Alarm[] => {
    switch (action.type) {
        case "UPDATE_ALARM":
            return state.map((a) =>
                a.id === action.payload.id
                    ? { ...a, ...action.payload, lastModified: new Date() }
                    : a
            );
        case "DELETE_ALARM":
            return state.filter((a) => a.id !== action.payload);
        case "ADD_ALARM":
            return [...state, action.payload];
        case "SET_ALARMS":
            return action.payload;
        default:
            return state;
    }
};

export const parseAlarm = (r: AlarmDto): Alarm => ({
    id: r.id,
    name: r.name,
    isEnabled: r.is_enabled === 1,
    repeat: r.repeat === 1,
    repeatDays: r.repeat_days ? JSON.parse(r.repeat_days) : [],
    vibrate: r.vibrate === 1,
    ringtone: JSON.parse(r.ringtone),
    puzzles: r.puzzles ? JSON.parse(r.puzzles) : [],
    boosterSet: r.booster_set ? JSON.parse(r.booster_set) : [],
    ringHours: r.ring_hours,
    ringMins: r.ring_mins,
    lastModified: new Date(r.last_modified),
});

export const createAlarm = (p: {
    name: string;
    ringHours?: number;
    ringMins?: number;
    repeat?: boolean;
    repeatDays?: DaySet;
    vibrate?: boolean;
    ringtone?: { name: string; uri: string };
    puzzles?: Puzzle[];
    powerUps?: BoosterSet;
}): Alarm => ({
    id: randomUUID(),
    name: p.name,
    ringHours: p.ringHours ?? 12,
    ringMins: p.ringMins ?? 0,
    vibrate: p.vibrate ?? false,
    ringtone: p.ringtone ?? { name: "Silent", uri: "none" },
    repeat: p.repeat ?? false,
    repeatDays: p.repeatDays ?? {
        0: { dayName: "Sunday", letter: "S", enabled: false },
        1: { dayName: "Monday", letter: "M", enabled: false },
        2: { dayName: "Tuesday", letter: "T", enabled: false },
        3: { dayName: "Wednesday", letter: "W", enabled: false },
        4: { dayName: "Thursday", letter: "T", enabled: false },
        5: { dayName: "Friday", letter: "F", enabled: false },
        6: { dayName: "Saturday", letter: "S", enabled: false },
    },
    puzzles: p.puzzles ?? [],
    boosterSet: p.powerUps ?? {
        postDismissLaunch: {
            enabled: false,
            config: {
                packageName: "",
            },
        },
        postDismissCheck: {
            enabled: false,
            config: {
                postDismissDelay: 60,
                checkerGraceTime: 60,
            },
        },
        snoozeMods: {
            enabled: false,
            config: {
                snoozeStartingTime: undefined,
                snoozeUses: undefined,
                snoozeDimishing: undefined,
            },
        },
    },
    isEnabled: true,
    lastModified: new Date(),
});

export const useAlarms = (db: SQLiteDatabase, linkingScheme: string) => {
    const [alarms, dispatch] = useReducer(alarmsReducer, []);
    const [diff, setDiff] = useState<number>();

    useEffect(() => {
        setLinkingScheme(linkingScheme);
    }, [linkingScheme]);

    const loadAlarms = useCallback(async () => {
        const rows = await db.getAllAsync<AlarmDto>("SELECT * FROM alarms");
        const parsed = rows.map(parseAlarm);
        dispatch({ type: "SET_ALARMS", payload: parsed });
        setDiff(Date.now());
    }, [db]);

    const saveAlarms = useCallback(async () => {
        if (!diff) return;

        try {
            await db.withExclusiveTransactionAsync(async (tx) => {
                for (const v of alarms) {
                    if (v.lastModified.getTime() > diff) {
                        await tx.runAsync(
                            `UPDATE alarms
                         SET name = ?, ring_hours = ?, ring_mins = ?, repeat = ?, repeat_days = ?,
                             ringtone = ?, vibrate = ?, puzzles = ?, booster_set = ?,
                             is_enabled = ?, last_modified = ?
                         WHERE id = ?`,
                            [
                                v.name,
                                v.ringHours,
                                v.ringMins,
                                v.repeat ? 1 : 0,
                                JSON.stringify(v.repeatDays),
                                JSON.stringify(v.ringtone),
                                v.vibrate ? 1 : 0,
                                JSON.stringify(v.puzzles),
                                JSON.stringify(v.boosterSet),
                                v.isEnabled ? 1 : 0,
                                v.lastModified.toISOString(),
                                v.id,
                            ]
                        );
                    }
                }
            });
        } catch (e) {
            console.warn("saveAlarms transaction failed:", e);
        }
    }, [alarms, diff, db]);

    const updateAlarm = useCallback(
        (id: string, updates: Partial<Alarm>) => {
            dispatch({
                type: "UPDATE_ALARM",
                payload: { id, isEnabled: true, ...updates },
            });
            void (async () => {
                const alarm = alarms.find((v) => v.id === id);
                if (alarm) await modifyNextInstance({ ...alarm, ...updates });
            })();
        },
        [dispatch, alarms]
    );

    const deleteAlarm = useCallback(
        (id: string) => {
            void (async () => {
                const alarm = alarms.find((v) => v.id === id);
                if (!alarm) return;
                await disableNextInstance(alarm);
                dispatch({ type: "DELETE_ALARM", payload: id });
                await db.runAsync("DELETE FROM alarms WHERE id = ?", [id]);
            })();
        },
        [alarms, db]
    );

    const toggleAlarm = async (id: string, nextEnabled: boolean) => {
        const alarm = alarms.find((v) => v.id === id);
        if (!alarm) return;

        if (nextEnabled) {
            await scheduleNextInstance(alarm);
        } else {
            await disableNextInstance(alarm);
        }
        dispatch({
            type: "UPDATE_ALARM",
            payload: { id, ...{ isEnabled: nextEnabled } },
        });
    };

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
