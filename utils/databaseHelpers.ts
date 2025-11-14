import { SQLiteDatabase } from "expo-sqlite";
import Storage from "expo-sqlite/kv-store";

export const initDatabaseTableIfFirstBoot = (db: SQLiteDatabase) => {
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
            vibrate BOOLEAN NOT NULL DEFAULT 0,
            ringtone TEXT,
            puzzles TEXT,
            booster_set TEXT,
            is_enabled BOOLEAN NOT NULL DEFAULT 1,
            last_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);

            db.runSync(
                `CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON alarms(is_enabled)`
            );

            db.runSync(`
          CREATE TABLE IF NOT EXISTS physical (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL
          )
        `);

            Storage.setItemSync("isFirstBoot", "true");
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
};
