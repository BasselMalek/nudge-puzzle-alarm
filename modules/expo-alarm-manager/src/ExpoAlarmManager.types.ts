export type ExpoAlarmManagerModuleEvents = {
    onPlaybackFinished: (event: { playerId: string }) => void;
    onPlaybackError: (event: { playerId: string; error: string }) => void;
};
export type IAlarmPlayer = {
    setSource(src: string): void;
    play(): Promise<void>;
    stop(): void;
    release(): void;
    setVolume(vol: number): void;
    isFinished: boolean;
};
