import { NativeModule, requireNativeModule } from "expo";
import {
    ExpoAlarmManagerModuleEvents,
    IAlarmPlayer,
} from "./ExpoAlarmManager.types";

declare class ExpoAlarmManagerModule extends NativeModule<ExpoAlarmManagerModuleEvents> {
    /**
     * Configure the base deep linking scheme for alarms.
     * @param scheme (e.g. "myapp://alarm").
     */
    setLinkingScheme(scheme: string): void;

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
     *
     */
    modifyAlarm(alarmId: string, newTimestamp: number): Promise<boolean>;

    /**
     * Delete a scheduled alarm.
     * @param alarmId The alarm ID.
     */
    deleteAlarm(alarmId: string): Promise<boolean>;

    /**
     * Open native alarm tone picker.
     * @param existingUri optional: previously uri selected.
     * @returns selected URI. Will be null if called with no existing URI and the user cancels.
     */
    pickAlarmTone(existingUri?: string): Promise<string[] | null>;

    // AlarmPlayer native methods
    /**
     * Create a new alarm player instance.
     * @returns playerId for the created player
     */
    createPlayer(): Promise<string>;

    /**
     * Set audio source for a player.
     * @param src Audio source URI.
     */
    setPlayerSource(playerId: string, src: string | null): Promise<void>;

    /**
     * Enable or disable vibration for a player.
     * @param enabled Whether vibration should be enabled.
     */
    setPlayerVibration(playerId: string, enabled: boolean): Promise<void>;

    /**
     * Start playback for a player.
     */
    playPlayer(playerId: string): Promise<void>;

    /**
     * Stop playback for a player.
     */
    stopPlayer(playerId: string): Promise<void>;

    /**
     * Release a player and free resources.
     */
    releasePlayer(playerId: string): Promise<void>;

    /**
     * Schedule a post-wake double check notification & alarm.
     * @param alarmId A stable string ID (converted to int internally)
     * @param dismissHandler A URL to an activity that will handle dismissing the check
     * @param delayPeriod Delay between main alarm dismissal and notification post
     * @param graacePeriod Grace timing after notification is posted and before alarm triggers
     * @returns Promise<void>
     */
    scheduleDoubleCheck(
        alarmId: string,
        dismissHandler: string,
        delayPeriod: number,
        gracePeriod: number
    ): Promise<void>;

    /**
     * Check if player has finished playing.
     */
    isPlayerFinished(playerId: string): Promise<boolean>;

    /**
     * Opens the "Draw over other apps" options screen.
     * @Platform android
     */
    requestOverlayPerm(): void;

    /**
     * Opens the "Full screen alerts" options screen.
     * @Platform android
     */
    requestFullScreenAlertsPerm(): void;

    /**
     * Sets the activity's showWhenLocked for managing alarm visibilty.
     * @Platform android
     */
    setShowWhenLocked(show: boolean, id: string | null): void;

    /**
     * Opens the "Alarms & Reminders" options screen.
     * @Platform android
     */
    requestScheduleExactPerm(): void;

    /**
     * Requests dismissal of keyguard. Useful for launching apps post alarm or using NFC.
     * @Platform android
     */
    requestKeyguardDismiss(): void;

    /**
     * Returns launchable installed packages with a android.intent.category.LAUNCHER filter
     * @Platform android
     */
    getLaunchableApps(): Promise<{
        packageName: string;
        className: string;
        label: string;
    }>;

    checkAndNullifyActiveAlarm(): Promise<{ type: string; alarmId: string }>;
}

// This call loads the native module object from the JSI.
const ExpoAlarmManagerNative =
    requireNativeModule<ExpoAlarmManagerModule>("ExpoAlarmManager");

export class AlarmPlayer {
    private playerId: string;
    private released: boolean = false;

    private constructor(playerId: string) {
        this.playerId = playerId;
    }

    static async create(): Promise<AlarmPlayer> {
        const playerId = await ExpoAlarmManagerNative.createPlayer();
        return new AlarmPlayer(playerId);
    }

    async setSource(uri: string): Promise<void> {
        if (this.released) {
            throw new Error("AlarmPlayer has been released");
        }
        return ExpoAlarmManagerNative.setPlayerSource(this.playerId, uri);
    }

    async setVibration(enabled: boolean): Promise<void> {
        if (this.released) {
            throw new Error("AlarmPlayer has been released");
        }
        return ExpoAlarmManagerNative.setPlayerVibration(
            this.playerId,
            enabled
        );
    }

    async play(): Promise<void> {
        if (this.released) {
            throw new Error("AlarmPlayer has been released");
        }
        return ExpoAlarmManagerNative.playPlayer(this.playerId);
    }

    async stop(): Promise<void> {
        if (this.released) {
            throw new Error("AlarmPlayer has been released");
        }
        return ExpoAlarmManagerNative.stopPlayer(this.playerId);
    }

    async release(): Promise<void> {
        if (this.released) {
            console.log("AlarmPlayer already released, skipping.");
            return;
        }
        this.released = true;
        return ExpoAlarmManagerNative.releasePlayer(this.playerId);
    }

    async isFinished(): Promise<boolean> {
        if (this.released) {
            throw new Error("AlarmPlayer has been released");
        }
        return ExpoAlarmManagerNative.isPlayerFinished(this.playerId);
    }

    getId(): string {
        return this.playerId;
    }
}

export default ExpoAlarmManagerNative;
