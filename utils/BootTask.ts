import { parseAlarm } from "@/hooks/useAlarms";
import { AlarmDto } from "@/types/Alarm";
import * as s from "expo-sqlite";
import { rescheduleAllForOnBoot } from "./alarmSchedulingHelpers";
import { setLinkingScheme } from "@/modules/expo-alarm-manager";

const BootTask = async () => {
    let db;
    try {
        //TODO: should i move the linking scheme to some sort of storage?
        setLinkingScheme("nudge://alarms");
        db = await s.openDatabaseAsync("nudge_alarms.db");
        const rows = await db.getAllAsync<AlarmDto>(
            "SELECT * FROM alarms WHERE is_enabled = 1"
        );
        const result = await rescheduleAllForOnBoot(rows.map(parseAlarm));
    } catch (e) {
        console.log(e);
    } finally {
        db?.closeAsync();
    }
    return;
};

export { BootTask };
