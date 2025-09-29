import { View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import IndicatorDots from "@/components/IndicatorDots";
import { router } from "expo-router";
import { useState } from "react";
import {
    requestFullScreenAlertsPerm,
    requestOverlayPerm,
    requestScheduleExactPerm,
} from "@/modules/expo-alarm-manager";

export default function ExactAlarm() {
    const [permsGranted, setPermsGranted] = useState(false);
    const { colors } = useTheme();
    return (
        <>
            <StatusBar translucent />
            <View
                style={{
                    flex: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                }}
            >
                <Icon source={"alarm"} size={120} color={colors.primary} />
                <Text
                    variant="displaySmall"
                    style={{ textAlign: "center", marginTop: 30 }}
                >
                    {"Exact Alarm Permission"}
                </Text>
                <Text
                    variant="labelLarge"
                    style={{ textAlign: "center", flexWrap: "wrap" }}
                >
                    {
                        "Needed to send alarms on time. Depending on OEM this might be enabled already."
                    }
                </Text>
                <Button
                    style={{ marginTop: 50 }}
                    contentStyle={{
                        flexDirection: "row-reverse",
                        minHeight: 50,
                        minWidth: 100,
                    }}
                    icon={"arrow-right"}
                    mode="elevated"
                    onPress={() => {
                        if (permsGranted) {
                            router.dismissTo("/");
                        } else {
                            requestScheduleExactPerm();
                            setPermsGranted(true);
                        }
                    }}
                >
                    {permsGranted ? "Done" : "Request"}
                </Button>
            </View>
            <View
                style={{
                    flex: 2,
                    alignItems: "center",
                    justifyContent: "flex-end",
                    paddingBottom: 20,
                }}
            >
                <IndicatorDots
                    total={5}
                    enabled={5}
                    size={10}
                    colors={{
                        primary: colors.primary,
                        secondary: colors.secondary,
                        off: colors.onSurfaceDisabled,
                    }}
                />
            </View>
        </>
    );
}
