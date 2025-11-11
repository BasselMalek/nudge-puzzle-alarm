import { useEffect, useState } from "react";
import ExpoAlarmManagerNative from "@/modules/expo-alarm-manager/src/ExpoAlarmManagerModule";

type AlarmEvent = {
    type: "onAlarmDeepLink" | "onDismissDoubleDeepLink";
    alarmId: string;
};

export function useAlarmManagerEvents() {
    const [event, setEvent] = useState<AlarmEvent | null>(null);
    useEffect(() => {
        console.log("test");
        const alarmSub = ExpoAlarmManagerNative.addListener(
            "onAlarmDeepLink",
            ({ alarmId }: { alarmId: string }) => {
                console.log("got event");
                setEvent({ type: "onAlarmDeepLink", alarmId });
            }
        );
        const dismissSub = ExpoAlarmManagerNative.addListener(
            "onDismissDoubleDeepLink",
            ({ alarmId }: { alarmId: string }) => {
                console.log("got event");
                setEvent({ type: "onDismissDoubleDeepLink", alarmId });
            }
        );
        return () => {
            alarmSub.remove();
            dismissSub.remove();
        };
    }, []);
    return { event };
}
