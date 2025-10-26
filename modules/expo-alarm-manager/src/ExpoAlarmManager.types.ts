export type ExpoAlarmManagerModuleEvents = {
    onPlaybackFinished: (event: { playerId: string }) => void;
    onPlaybackError: (event: { playerId: string; error: string }) => void;
};
export type IAlarmPlayer = {
    setSource(src: string): Promise<void>;
    setVibration(enabled: boolean): Promise<void>;
    play(): Promise<void>;
    stop(): Promise<void>;
    release(): Promise<void>;
    isFinished(): Promise<boolean>;
};
