import { parseAlarm } from "@/hooks/useAlarms";
import { AlarmDto } from "@/types/Alarm";
import * as s from "expo-sqlite";
import { rescheduleAllForOnBoot } from "./alarmSchedulingHelpers";
import { setLinkingScheme } from "@/modules/expo-alarm-manager";

const BootTask = async () => {
    let db;
    try {
        setLinkingScheme("nudge://alarmScreen");
        db = await s.openDatabaseAsync("nudge_alarms.db");
        const rows = await db.getAllAsync<AlarmDto>(
            "SELECT * FROM alarms WHERE is_enabled = 1"
        );
        const result = await rescheduleAllForOnBoot(rows.map(parseAlarm));
        console.log(
            `NUDGE_DEBUG: HeadlessJS scheduling done ${
                result ? "successfully" : "unsuccessfully"
            }`
        );
    } catch (e) {
        console.log(e);
    } finally {
        await db?.closeAsync();
    }
    return;
};

export { BootTask };
