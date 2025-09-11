import { SQLiteDatabase } from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";

export function initDatabaseTablesIfFirstBoot(db: SQLiteDatabase) {
    try {
        const first = Storage.getItemSync("isFirstBoot");

        if (first === null) {
            db.runSync(`
          CREATE TABLE IF NOT EXISTS alarms (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            ring_hours INTEGER NOT NULL CHECK (ring_hours >= 0 AND ring_hours <= 23),
            ring_mins INTEGER NOT NULL CHECK (ring_mins >= 0 AND ring_mins <= 59),
            repeat BOOLEAN NOT NULL DEFAULT 0,
            repeat_days TEXT,
            puzzles TEXT,
            power_ups TEXT,
            is_enabled BOOLEAN NOT NULL DEFAULT 1,
            last_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);

            //* this is for the AlarmManager intents. Will be useful when i get around to coding the BOOT_COMPLETED receiver so i can ensure alarms stay consistent on boot.
            db.runSync(`
          CREATE TABLE IF NOT EXISTS internal_enabled (
            id TEXT PRIMARY KEY,
            ring_time DATETIME NOT NULL,
            last_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);

            Storage.setItemSync("isFirstBoot", "true");
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
}
