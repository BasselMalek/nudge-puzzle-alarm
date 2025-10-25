type PostDismissLauncherConfig = {
    packageName: string;
};

type SnoozeLimiterConfig = {
    snoozeStartingTime?: number;
    snoozeUses?: number;
    snoozeDimishing?: number;
};

type PostDimissCheckerConfig = {
    postDismissDelay: number;
    checkerGraceTime: number;
};

export type BoosterSet = {
    postDismissLaunch: { enabled: boolean; config: PostDismissLauncherConfig };
    postDismissCheck: { enabled: boolean; config: PostDimissCheckerConfig };
    snoozeMods: { enabled: boolean; config: SnoozeLimiterConfig };
};
