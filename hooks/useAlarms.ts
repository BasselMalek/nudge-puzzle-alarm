import { useReducer, useState, useCallback } from "react";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { SQLiteDatabase } from "expo-sqlite";
import { DayKey } from "@/types/DayKey";
import { PowerUp } from "@/types/PowerUp";
import { Puzzle } from "@/types/Puzzles";
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
    if (unixMs >= 86400000 || unixMs < 0) return "24h+";
    const totalMins = Math.floor(unixMs / 1000 / 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return hrs !== 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};

export const saveAlarmDirect = (
    id: string,
    db: SQLiteDatabase,
    alarm: Alarm
) => {
    if (id === "new") {
        db.runSync(
            `INSERT INTO alarms
       (id, name, ring_hours, ring_mins, repeat, repeat_days,
        ringtone, vibrate, puzzles, power_ups, is_enabled, last_modified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                alarm.id,
                alarm.name,
                alarm.ringHours,
                alarm.ringMins,
                alarm.repeat ? 1 : 0,
                JSON.stringify(alarm.repeatDays),
                alarm.ringtone,
                alarm.vibrate ? 1 : 0,
                JSON.stringify(alarm.puzzles),
                JSON.stringify(alarm.powerUps),
                alarm.isEnabled ? 1 : 0,
                new Date().toISOString(),
            ]
        );
    } else {
        db.withTransactionSync(() => {
            db.runSync(
                `UPDATE alarms
         SET name = ?, ring_hours = ?, ring_mins = ?, repeat = ?, repeat_days = ?,
             ringtone = ?, vibrate = ?, puzzles = ?, power_ups = ?,
             is_enabled = ?, last_modified = ?
         WHERE id = ?`,
                [
                    alarm.name,
                    alarm.ringHours,
                    alarm.ringMins,
                    alarm.repeat ? 1 : 0,
                    JSON.stringify(alarm.repeatDays),
                    alarm.ringtone,
                    alarm.vibrate ? 1 : 0,
                    JSON.stringify(alarm.puzzles),
                    JSON.stringify(alarm.powerUps),
                    alarm.isEnabled ? 1 : 0,
                    alarm.lastModified.toISOString(),
                    alarm.id,
                ]
            );
        });
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
    ringtone: r.ringtone,
    puzzles: r.puzzles ? JSON.parse(r.puzzles) : [],
    powerUps: r.power_ups ? JSON.parse(r.power_ups) : [],
    ringHours: r.ring_hours,
    ringMins: r.ring_mins,
    lastModified: new Date(r.last_modified),
});

export const createAlarm = (p: {
    name: string;
    ringHours?: number;
    ringMins?: number;
    repeat?: boolean;
    repeatDays?: DayKey[];
    vibrate?: boolean;
    ringtone?: string;
    puzzles?: Puzzle[];
    powerUps?: PowerUp[];
}): Alarm => ({
    id: randomUUID(),
    name: p.name,
    ringHours: p.ringHours ?? 12,
    ringMins: p.ringMins ?? 0,
    vibrate: p.vibrate ?? false,
    ringtone: p.ringtone ?? "none",
    repeat: p.repeat ?? false,
    repeatDays: p.repeatDays ?? [],
    puzzles: p.puzzles ?? [],
    powerUps: p.powerUps ?? [],
    isEnabled: true,
    lastModified: new Date(),
});

export const useAlarms = (db: SQLiteDatabase, linkingScheme: string) => {
    const [alarms, dispatch] = useReducer(alarmsReducer, []);
    const [diff, setDiff] = useState<Map<string, Alarm>>(new Map());

    AlarmBridge.setLinkingScheme(linkingScheme);

    const loadAlarms = useCallback(async () => {
        const rows = await db.getAllAsync<AlarmDto>("SELECT * FROM alarms");
        const parsed = rows.map(parseAlarm);
        dispatch({ type: "SET_ALARMS", payload: parsed });
        setDiff(new Map(parsed.map((a) => [a.id, a])));
    }, [db]);

    const saveAlarms = useCallback(async () => {
        // Transaction for batch updates
        await db.withTransactionAsync(async () => {
            for (const v of alarms) {
                const old = diff.get(v.id);
                if (
                    !old ||
                    v.lastModified.getTime() > old.lastModified.getTime()
                ) {
                    await db.runAsync(
                        `UPDATE alarms
             SET name = ?, ring_hours = ?, ring_mins = ?, repeat = ?, repeat_days = ?,
                 ringtone = ?, vibrate = ?, puzzles = ?, power_ups = ?,
                 is_enabled = ?, last_modified = ?
             WHERE id = ?`,
                        [
                            v.name,
                            v.ringHours,
                            v.ringMins,
                            v.repeat ? 1 : 0,
                            JSON.stringify(v.repeatDays),
                            v.ringtone,
                            v.vibrate ? 1 : 0,
                            JSON.stringify(v.puzzles),
                            JSON.stringify(v.powerUps),
                            v.isEnabled ? 1 : 0,
                            v.lastModified.toISOString(),
                            v.id,
                        ]
                    );
                }
            }
        });
    }, [alarms, diff, db]);

    const updateAlarm = useCallback(
        (id: string, updates: Partial<Alarm>) => {
            dispatch({ type: "UPDATE_ALARM", payload: { id, ...updates } });
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
        [dispatch]
    );

    const deleteAlarm = useCallback(
        (id: string) => {
            AlarmBridge.deleteAlarm(id);
            dispatch({ type: "DELETE_ALARM", payload: id });
            db.runAsync("DELETE FROM alarms WHERE id = ?", [id]);
        },
        [db, dispatch]
    );

    const toggleAlarm = useCallback(
        (id: string) => {
            const alarm = alarms.find((v) => v.id === id);
            if (!alarm) return;
            if (alarm.isEnabled) {
                AlarmBridge.deleteAlarm(id);
            } else {
                const ringDateToday = new Date(
                    new Date().setHours(alarm.ringHours, alarm.ringMins)
                );
                AlarmBridge.scheduleAlarm(
                    id,
                    isFuture(ringDateToday)
                        ? ringDateToday.getTime()
                        : addDays(ringDateToday, 1).getTime()
                );
            }
            updateAlarm(id, { isEnabled: !alarm.isEnabled });
        },
        [alarms, updateAlarm]
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
