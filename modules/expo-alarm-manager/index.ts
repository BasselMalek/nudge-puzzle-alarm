import { useState, useEffect } from "react";
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
 * @returns Promise<boolean> indicating success
 */
export const scheduleAlarm = (
    alarmId: string,
    timestamp: number
): Promise<boolean> => {
    return ExpoAlarmManagerModule.scheduleAlarm(alarmId, timestamp);
};

/**
 * Schedule a post-wake double check notification & alarm.
 * @param alarmId A stable string ID (converted to int internally)
 * @param dismissHandler A URL to an activity that will handle dismissing the check
 * @param delayPeriod Delay between main alarm dismissal and notification post
 * @param graacePeriod Grace timing after notification is posted and before alarm triggers
 * @returns Promise<boolean> indicating success
 */
export const scheduleDoubleCheck = async (
    alarmId: string,
    dismissHandler: string,
    delayPeriod: number,
    gracePeriod: number
) => {
    await ExpoAlarmManagerModule.scheduleAlarm(
        alarmId,
        Date.now() + gracePeriod + delayPeriod
    );
    return ExpoAlarmManagerModule.scheduleDoubleCheck(
        alarmId,
        dismissHandler,
        delayPeriod,
        gracePeriod
    );
};

/**
 * Modify an existing alarm's time.
 * @param alarmId The alarm ID
 * @param newTimestamp New Unix timestamp in milliseconds
 * @returns Promise<boolean> indicating success
 */
export const modifyAlarm = (
    alarmId: string,
    newTimestamp: number
): Promise<boolean> => {
    return ExpoAlarmManagerModule.modifyAlarm(alarmId, newTimestamp);
};

/**
 * Delete a scheduled alarm.
 * @param alarmId The alarm ID
 * @returns Promise<boolean> indicating success
 */
export const deleteAlarm = (alarmId: string): Promise<boolean> => {
    return ExpoAlarmManagerModule.deleteAlarm(alarmId);
};

/**
 * Open native alarm tone picker.
 * @param existingUri optional: previously uri selected.
 * @returns selected URI. Will be null if called with no existing URI and the user cancels.
 */
export const pickAlarmTone = async (
    existingUri?: string
): Promise<{ name: string; uri: string | null } | null> => {
    const a = await ExpoAlarmManagerModule.pickAlarmTone(existingUri);
    return a !== null ? { name: a.at(1)!, uri: a.at(0)! } : null;
};

/**
 * Opens the "Draw over other apps" options screen.
 * @Platform android
 */
export const requestOverlayPerm = () => {
    ExpoAlarmManagerModule.requestOverlayPerm();
};

export const addListener = ExpoAlarmManagerModule.addListener;

/**
 * Sets the activity's showWhenLocked for managing alarm visibilty.
 * @Platform android
 */
export const setShowWhenLocked = (show: boolean, id?: string) => {
    ExpoAlarmManagerModule.setShowWhenLocked(show, id ?? null);
};

/**
 * Requests dismissal of keyguard. Useful for launching apps post alarm or using NFC.
 * @Platform android
 */
export const requestKeyguardDismiss = () => {
    ExpoAlarmManagerModule.requestKeyguardDismiss();
};

/**
 * Sets the activity's showWhenLocked for managing alarm visibilty.
 * @Platform android
 */
export const requestFullScreenAlertsPerm = () => {
    ExpoAlarmManagerModule.requestFullScreenAlertsPerm();
};

/**
 * Opens the "Alarms & Reminders" options screen.
 * @Platform android
 */
export const requestScheduleExactPerm = () => {
    ExpoAlarmManagerModule.requestScheduleExactPerm();
};

/**
 * Returns launchable installed packages with a android.intent.category.LAUNCHER filter
 * @Platform android
 */
export const getLaunchableApps = () => {
    return ExpoAlarmManagerModule.getLaunchableApps();
};

export const checkAndNullifyActiveAlarm = () => {
    return ExpoAlarmManagerModule.checkAndNullifyActiveAlarm();
};

/**
 * Hook that creates and returns an AlarmPlayer instance once mounted.
 * The returned object exposes all of AlarmPlayer's own methods.
 */
export function useAlarmPlayer(): AlarmPlayer | null {
    const [player, setPlayer] = useState<AlarmPlayer | null>(null);

    useEffect(() => {
        void AlarmPlayer.create().then((p) => {
            if (p) setPlayer(p);
        });
        return () => {
            setPlayer((prev) => {
                if (prev) {
                    prev.release().catch(() => {});
                }
                return null;
            });
        };
    }, []);

    return player;
}

export const nativeModule = ExpoAlarmManagerModule;
// Re-export types for convenience
export * from "./src/ExpoAlarmManager.types";
