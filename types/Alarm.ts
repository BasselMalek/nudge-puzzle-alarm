import { DayKey } from "@/types/DayKey";
import { Puzzle } from "@/types/Puzzle";
import { PowerUp } from "@/types/PowerUp";
import { randomUUID } from "expo-crypto";

export interface Alarm {
    id: string;
    name: string;
    ringTime: string;
    repeat: boolean;
    repeatDays: DayKey[];
    puzzles: Puzzle[];
    powerUps: PowerUp[];
    isEnabled: boolean;
}

export const createAlarm = (params: {
    name: string;
    ringTime: string;
    repeat?: boolean;
    repeatDays?: DayKey[];
    puzzles?: Puzzle[];
    powerUps?: PowerUp[];
}): Alarm => ({
    id: randomUUID(),
    name: params.name,
    ringTime: params.ringTime,
    repeat: params.repeat ?? false,
    repeatDays: params.repeatDays ?? [],
    puzzles: params.puzzles ?? [],
    powerUps: params.powerUps ?? [],
    isEnabled: true,
});

// export const loadAlarm = (params: {id:})
