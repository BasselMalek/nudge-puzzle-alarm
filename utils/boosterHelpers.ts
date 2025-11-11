import { openApplication } from "expo-intent-launcher";
import { BackHandler } from "react-native";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { BoosterSet } from "@/types/Boosters";
import { scheduleDoubleCheck } from "@/modules/expo-alarm-manager";

type SnoozeState = {
    uses: number;
    decay: number;
    duration: number;
};

export async function handleDismiss(params: {
    id: string;
    doubleChecked?: boolean;
    delayPeriod?: number;
    gracePeriod?: number;
    launch_package?: string;
}) {
    const { id, doubleChecked, delayPeriod, gracePeriod, launch_package } =
        params;
    await AsyncStorage.removeItemAsync(id);

    if (doubleChecked) {
        await scheduleDoubleCheck(
            id,
            `nudge://dismissDouble/${id}?doubleChecked=true`,
            delayPeriod! * 1000,
            gracePeriod! * 1000
        );
    }

    if (launch_package) {
        openApplication(launch_package);
    } else {
        BackHandler.exitApp();
    }
}

export function handleSnooze(params: { id: string; boosterInfo?: string }) {
    const { id, boosterInfo } = params;
    const unparsed = AsyncStorage.getItemSync(id);

    if (unparsed && unparsed !== "disabled") {
        const parsed = JSON.parse(unparsed) as SnoozeState;
        parsed.uses = Math.max(0, parsed.uses - 1);
        parsed.duration = Math.max(0, parsed.duration - parsed.decay);
        AsyncStorage.setItemSync(id, JSON.stringify(parsed));
    } else {
        const boosterSet = JSON.parse(boosterInfo!) as BoosterSet;
        const cfg = boosterSet.snoozeMods;
        if (cfg.enabled) {
            const snoozeState: SnoozeState = {
                uses: cfg.config.snoozeUses - 1,
                decay: cfg.config.snoozeDimishing,
                duration: Math.max(
                    cfg.config.snoozeStartingTime - cfg.config.snoozeDimishing,
                    0
                ),
            };
            AsyncStorage.setItemSync(id, JSON.stringify(snoozeState));
        } else {
            AsyncStorage.setItemSync(id, "disabled");
        }
    }

    BackHandler.exitApp();
}
