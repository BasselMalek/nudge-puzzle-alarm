import { DaySet } from "@/types/DaySet";
import { Puzzle } from "@/types/Puzzles";
import { PowerUp } from "@/types/PowerUp";
import { randomUUID } from "expo-crypto";

export interface Alarm {
    id: string;
    name: string;
    ringHours: number;
    ringMins: number;
    repeat: boolean;
    repeatDays: DaySet;
    vibrate: boolean;
    ringtone: string;
    puzzles: Puzzle[];
    powerUps: PowerUp[];
    isEnabled: boolean;
    lastModified: Date;
}

export interface AlarmDto {
    id: string;
    name: string;
    ring_hours: number;
    ring_mins: number;
    repeat: number;
    vibrate: number;
    ringtone: string;
    power_ups: string | null; // * These are JSON strings
    repeat_days: string | null;
    puzzles: string | null;
    is_enabled: number;
    last_modified: string; // * This is an ISO string
}
