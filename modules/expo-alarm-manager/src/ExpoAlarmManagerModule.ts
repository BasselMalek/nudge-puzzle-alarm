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
    setPlayerSource(src: string): Promise<void>;

    /**
     * Enable or disable vibration for a player.
     * @param enabled Whether vibration should be enabled.
     */
    setPlayerVibration(enabled: boolean): Promise<void>;

    /**
     * Start playback for a player.
     */
    playPlayer(): Promise<void>;

    /**
     * Stop playback for a player.
     */
    stopPlayer(): Promise<void>;

    /**
     * Release a player and free resources.
     */
    releasePlayer(): Promise<void>;

    /**
     * Check if player has finished playing.
     */
    isPlayerFinished(): Promise<boolean>;

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
}

// This call loads the native module object from the JSI.
const ExpoAlarmManagerNative =
    requireNativeModule<ExpoAlarmManagerModule>("ExpoAlarmManager");

export class AlarmPlayer implements IAlarmPlayer {
    private playerId: string;
    private _isFinished: boolean = false;

    constructor(playerId: string) {
        this.playerId = playerId;

        ExpoAlarmManagerNative.addListener("onPlaybackFinished", (event) => {
            if (event.playerId === this.playerId) {
                this._isFinished = true;
            }
        });
    }

    /**
     * Create a new AlarmPlayer instance.
     */
    static async create(): Promise<AlarmPlayer | null> {
        const res = await ExpoAlarmManagerNative.createPlayer();
        if (res) {
            return new AlarmPlayer(res);
        } else {
            return null;
        }
    }

    async setSource(src: string): Promise<void> {
        await ExpoAlarmManagerNative.setPlayerSource(src);
        this._isFinished = false;
    }

    async setVibration(enabled: boolean): Promise<void> {
        return ExpoAlarmManagerNative.setPlayerVibration(enabled);
    }

    async play(): Promise<void> {
        this._isFinished = false;
        return ExpoAlarmManagerNative.playPlayer();
    }

    async stop(): Promise<void> {
        this._isFinished = true;
        return ExpoAlarmManagerNative.stopPlayer();
    }

    async release(): Promise<void> {
        return ExpoAlarmManagerNative.releasePlayer();
    }

    async isFinished(): Promise<boolean> {
        return ExpoAlarmManagerNative.isPlayerFinished();
    }
}

export default ExpoAlarmManagerNative;
