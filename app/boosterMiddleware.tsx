import { openApplication } from "expo-intent-launcher";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler } from "react-native";
import { AsyncStorage } from "expo-sqlite/kv-store";
import { BoosterSet } from "@/types/Boosters";

type SnoozeState = {
    uses: number;
    decay: number;
    duration: number;
};

export default function BoosterMiddleware() {
    const { boosterInfo, id, dismiss, snooze, launch_package } =
        useLocalSearchParams();
    const [processed, setProcessed] = useState(false);
    useFocusEffect(
        useCallback(() => {
            if (processed) {
                router.replace("/");
                return;
            }
            const handleDismiss = () => {
                console.log("dismissing");
                setProcessed(true);
                void AsyncStorage.removeItemAsync(id as string);
                if (launch_package && typeof launch_package === "string") {
                    openApplication(launch_package);
                } else {
                    BackHandler.exitApp();
                }
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
                handleDismiss();
            } else if (snooze === "true") {
                handleSnooze();
            } else {
                router.replace("/");
            }
        }, [processed, dismiss, snooze, id, launch_package, boosterInfo])
    );
    return null;
}
