type PostDismissLauncherConfig = {
    packageName: string;
    label: string;
};

type SnoozeLimiterConfig = {
    snoozeStartingTime: number;
    snoozeUses: number;
    snoozeDimishing: number;
};

type PostdismissCheckerConfig = {
    postDismissDelay: number;
    checkerGraceTime: number;
};

export type BoosterSet = {
    postDismissLaunch: { enabled: boolean; config: PostDismissLauncherConfig };
    postDismissCheck: { enabled: boolean; config: PostdismissCheckerConfig };
    snoozeMods: { enabled: boolean; config: SnoozeLimiterConfig };
};
