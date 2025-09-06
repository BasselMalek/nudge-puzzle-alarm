import { NativeModule, requireNativeModule } from "expo";

import { ExpoAlarmManagerModuleEvents } from "./ExpoAlarmManager.types";

declare class ExpoAlarmManagerModule extends NativeModule<ExpoAlarmManagerModuleEvents> {
    /**
     * Configure the base deep linking scheme for alarms.
     * @param scheme (e.g. "myapp://alarm").
     */
    setLinkingScheme(scheme: string): Promise<boolean>;

    /**
     * Schedule a new alarm.
     * @param alarmId A stable string ID (converted to int internally).
     * @param timestamp Unix timestamp in ms.
     */
    scheduleAlarm(alarmId: string, timestamp: number): Promise<boolean>;

    /**
     * Modify an existing alarm's time.
     * @param alarmId The alarm ID.
     * @param newTimestamp New Unix timestamp in ms.
     */
    modifyAlarm(alarmId: string, newTimestamp: number): Promise<boolean>;

    /**
     * Delete a scheduled alarm.
     * @param alarmId The alarm ID.
     */
    deleteAlarm(alarmId: string): Promise<boolean>;

    pickAlarmTone(): Promise<String | null>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoAlarmManagerModule>("ExpoAlarmManager");
