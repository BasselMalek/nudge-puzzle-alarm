import { openApplication } from "expo-intent-launcher";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { BoosterSet } from "@/types/Boosters";
import { deleteAlarm, scheduleDoubleCheck } from "@/modules/expo-alarm-manager";

type SnoozeState = {
    uses: number;
    decay: number;
    duration: number;
};

export default function BoosterMiddleware() {
    const {
        boosterInfo,
        id,
        dismiss,
        snooze,
        launch_package,
        doubleChecked,
        dismissDouble,
        gracePeriod,
        delayPeriod,
    } = useLocalSearchParams();
    const [processed, setProcessed] = useState(false);
    useFocusEffect(
        useCallback(() => {
            if (processed) {
                router.replace("/");
                return;
            }
            const handleDismiss = async () => {
                console.log("dismissing");
                setProcessed(true);
                void AsyncStorage.removeItemAsync(id as string);

                if (doubleChecked === "true") {
                    console.log("d");
                    void (async () =>
                        await scheduleDoubleCheck(
                            id as string,
                            `nudge://dismissDouble/${id}?doubleChecked=true`,
                            parseInt(delayPeriod as string) * 1000,
                            parseInt(gracePeriod as string) * 1000
                        ))();
                }
                if (launch_package && typeof launch_package === "string") {
                    openApplication(launch_package);
                } else {
                    BackHandler.exitApp();
                }
            };
            const handleDismissDouble = () => {
                void deleteAlarm((id as string).slice(1));
                BackHandler.exitApp();
            };
            const handleSnooze = () => {
                console.log("snoozing");
                const unparsedSnoozeState = AsyncStorage.getItemSync(
                    id as string
                );
                if (unparsedSnoozeState && unparsedSnoozeState !== "disabled") {
                    const parsedSnoozeState = JSON.parse(
                        unparsedSnoozeState
                    ) as SnoozeState;
                    parsedSnoozeState.uses = Math.max(
                        0,
                        parsedSnoozeState.uses - 1
                    );
                    parsedSnoozeState.duration = Math.max(
                        0,
                        parsedSnoozeState.duration - parsedSnoozeState.decay
                    );
                    AsyncStorage.setItemSync(
                        id as string,
                        JSON.stringify(parsedSnoozeState)
                    );
                } else {
                    const boosterSet = JSON.parse(
                        boosterInfo as string
                    ) as BoosterSet;
                    const snoozeConfig = boosterSet.snoozeMods;
                    if (snoozeConfig.enabled) {
                        const snoozeState: SnoozeState = {
                            uses: snoozeConfig.config.snoozeUses - 1,
                            decay: snoozeConfig.config.snoozeDimishing,
                            duration: Math.max(
                                snoozeConfig.config.snoozeStartingTime -
                                    snoozeConfig.config.snoozeDimishing,
                                0
                            ),
                        };
                        AsyncStorage.setItemSync(
                            id as string,
                            JSON.stringify(snoozeState)
                        );
                    } else {
                        AsyncStorage.setItemSync(id as string, "disabled");
                    }
                }
                setProcessed(true);
                BackHandler.exitApp();
            };
            if (dismiss === "true") {
                void handleDismiss();
            } else if (snooze === "true") {
                handleSnooze();
            } else if (dismissDouble) {
                handleDismissDouble();
            } else {
                router.replace("/");
            }
        }, [
            processed,
            dismiss,
            snooze,
            dismissDouble,
            id,
            doubleChecked,
            launch_package,
            delayPeriod,
            gracePeriod,
            boosterInfo,
        ])
    );
    return null;
}
