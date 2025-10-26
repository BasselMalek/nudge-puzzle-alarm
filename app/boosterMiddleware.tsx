import { openApplication } from "expo-intent-launcher";
import { useFocusEffect, router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { BackHandler } from "react-native";

export default function BoosterMiddleware() {
    const { dismiss, snooze, launch_package } = useLocalSearchParams();
    const [processed, setProcessed] = useState(false);

    useFocusEffect(
        useCallback(() => {
            if (processed) {
                router.replace("/");
            }
            if (dismiss === "true") {
                console.log("dismissing");
                setProcessed(true);
                if (launch_package && typeof launch_package === "string") {
                    openApplication(launch_package);
                } else {
                    BackHandler.exitApp();
                }
            } else if (snooze === "true") {
                console.log("snoozing");
                setProcessed(true);
                BackHandler.exitApp();
            } else {
                router.replace("/");
            }
        }, [dismiss, snooze, launch_package, processed])
    );

    return null;
}
