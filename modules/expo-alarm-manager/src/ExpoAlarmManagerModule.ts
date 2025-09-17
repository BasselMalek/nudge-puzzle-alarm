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
    setLinkingScheme(scheme: string): Promise<boolean>;

    /**
     * Schedule a new alarm.
     * @param alarmId A stable string ID (converted to int internally).
     * @param timestamp Unix timestamp in ms.
     * @param vibrate Whether the alarm notification should vibrate.
     */
    scheduleAlarm(
        alarmId: string,
        timestamp: number,
        vibrate: boolean
    ): Promise<boolean>;

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

    pickAlarmTone(): Promise<string | null>;

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
     * Set volume for a player.
     * @param volume Volume level (0.0 to 1.0).
     */
    setPlayerVolume(volume: number): Promise<void>;

    /**
     * Check if player has finished playing.
     */
    isPlayerFinished(): Promise<boolean>;
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

    async play(): Promise<void> {
        this._isFinished = false;
        return ExpoAlarmManagerNative.playPlayer();
    }

    stop(): void {
        ExpoAlarmManagerNative.stopPlayer();
        this._isFinished = true;
    }

    release(): void {
        ExpoAlarmManagerNative.releasePlayer();
    }

    setVolume(vol: number): void {
        ExpoAlarmManagerNative.setPlayerVolume(vol);
    }

    get isFinished(): boolean {
        return this._isFinished;
    }
}

export default ExpoAlarmManagerNative;
