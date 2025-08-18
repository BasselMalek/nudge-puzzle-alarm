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
    lastModified: Date;
}

export interface AlarmDto {
    id: string;
    name: string;
    ring_time: string;
    repeat: number;
    power_ups: string | null; // * These are JSON strings
    repeat_days: string | null;
    puzzles: string | null;

    is_enabled: number;
    last_modified: string; // * This is an ISO string
}
