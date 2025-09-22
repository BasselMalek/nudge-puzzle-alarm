import { useState, useCallback, useEffect } from "react";
import ExpoAlarmManagerModule, {
    AlarmPlayer,
} from "./src/ExpoAlarmManagerModule";

/**
 * Configure the base deep linking scheme for alarms.
 * @param scheme Base URL scheme (e.g. "myapp://alarm")
 * @returns Promise<boolean> indicating success
 */
export const setLinkingScheme = (scheme: string) => {
    ExpoAlarmManagerModule.setLinkingScheme(scheme);
};

/**
 * Schedule a new alarm.
 * @param alarmId A stable string ID (converted to int internally)
 * @param timestamp Unix timestamp in milliseconds
 * @param vibrate Whether the alarm notification should vibrate
 * @param ringtone URI of audio file to play as a ringtone
 * @returns Promise<boolean> indicating success
 */
export const scheduleAlarm = (
    alarmId: string,
    timestamp: number,
    vibrate: boolean
): Promise<boolean> => {
    return ExpoAlarmManagerModule.scheduleAlarm(alarmId, timestamp, vibrate);
};

/**
 * Modify an existing alarm's time.
 * @param alarmId The alarm ID
 * @param newTimestamp New Unix timestamp in milliseconds
 * @returns Promise<boolean> indicating success
 */
export const modifyAlarm = (
    alarmId: string,
    newTimestamp: number,
    vibrate: boolean
): Promise<boolean> => {
    return ExpoAlarmManagerModule.modifyAlarm(alarmId, newTimestamp, vibrate);
};

/**
 * Delete a scheduled alarm.
 * @param alarmId The alarm ID
 * @param vibrate Whether the alarm notification should vibrate.
 * @returns Promise<boolean> indicating success
 */
export const deleteAlarm = (
    alarmId: string,
    vibrate: boolean
): Promise<boolean> => {
    return ExpoAlarmManagerModule.deleteAlarm(alarmId, vibrate);
};

/**
 * Open native alarm tone picker.
 * @param existingUri optional: previously uri selected.
 * @returns selected URI. Will be null if called with no existing URI and the user cancels.
 */
export const pickAlarmTone = async (
    existingUri?: string
): Promise<{ name: string; uri: string } | null> => {
    const a = await ExpoAlarmManagerModule.pickAlarmTone(existingUri);
    return a !== null ? { name: a.at(1)!, uri: a.at(0)! } : null;
};

export const addListener = ExpoAlarmManagerModule.addListener;

/**
 * Hook that creates and returns an AlarmPlayer instance once mounted.
 * The returned object exposes all of AlarmPlayer's own methods.
 */
export function useAlarmPlayer(): AlarmPlayer | null {
    const [player, setPlayer] = useState<AlarmPlayer | null>(null);

    useEffect(() => {
        AlarmPlayer.create().then((p) => {
            if (p) setPlayer(p);
        });
        return () => {
            setPlayer((prev) => {
                prev?.release();
                return null;
            });
        };
    }, []);

    return player;
}

export const nativeModule = ExpoAlarmManagerModule;
// Re-export types for convenience
export * from "./src/ExpoAlarmManager.types";
