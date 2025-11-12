import { useEffect } from "react";
import ExpoAlarmManagerNative from "@/modules/expo-alarm-manager/src/ExpoAlarmManagerModule";

type AlarmEvent = {
    type: "onAlarmDeepLink" | "onDismissDoubleDeepLink";
    alarmId: string;
};
type AlarmEventListener = (event: AlarmEvent) => void;
export function useAlarmManagerListener(listener: AlarmEventListener) {
    useEffect(() => {
        const alarmSub = ExpoAlarmManagerNative.addListener(
            "onAlarmDeepLink",
            ({ alarmId }: { alarmId: string }) => {
                console.log("NUDGE_DEBUG: got event: onAlarmDeepLink");
                listener({ type: "onAlarmDeepLink", alarmId });
            }
        );

        const dismissSub = ExpoAlarmManagerNative.addListener(
            "onDismissDoubleDeepLink",
            ({ alarmId }: { alarmId: string }) => {
                console.log("NUDGE_DEBUG: got event: onDismissDoubleDeepLink");
                listener({ type: "onDismissDoubleDeepLink", alarmId });
            }
        );

        return () => {
            alarmSub.remove();
            dismissSub.remove();
        };
    }, [listener]);
}
