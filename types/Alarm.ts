import { DaySet } from "@/types/DaySet";
import { Puzzle } from "@/types/Puzzles";
import { BoosterSet } from "@/types//Boosters";

export interface Alarm {
    id: string;
    name: string;
    ringHours: number;
    ringMins: number;
    repeat: boolean;
    repeatDays: DaySet;
    vibrate: boolean;
    ringtone: { name: string; uri: string | null };
    puzzles: Puzzle[];
    boosterSet: BoosterSet;
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
    booster_set: string | null; // * These are JSON strings
    repeat_days: string | null;
    puzzles: string | null;
    is_enabled: number;
    last_modified: string; // * This is an ISO string
}
