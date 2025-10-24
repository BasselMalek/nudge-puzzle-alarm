import { View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import IndicatorDots from "@/components/IndicatorDots";
import { router } from "expo-router";
import { useState } from "react";
import { startActivityAsync, ActivityAction } from "expo-intent-launcher";

export default function BatteryOptimization() {
    const [requestSent, setRequestSent] = useState(false);
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
                    paddingHorizontal: 20,
                }}
            >
                <Icon
                    source={"battery-heart-variant"}
                    size={120}
                    color={colors.primary}
                />
                <Text
                    variant="displaySmall"
                    style={{ textAlign: "center", marginTop: 30 }}
                >
                    {"Disable Battery Optimization"}
                </Text>
                <Text
                    variant="bodyLarge"
                    style={{ textAlign: "center", marginTop: 10 }}
                >
                    {
                        "To ensure alarms and notifications are delivered on time, our app needs to run in the background. Please disable battery optimization."
                    }
                </Text>
                <Button
                    style={{ marginTop: 50 }}
                    contentStyle={{
                        flexDirection: "row-reverse",
                        minHeight: 50,
                        minWidth: 150,
                    }}
                    icon={"arrow-right"}
                    mode="elevated"
                    onPress={() => {
                        if (requestSent) {
                            router.dismissTo("/");
                        } else {
                            void startActivityAsync(
                                ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
                            );
                            setRequestSent(true);
                        }
                    }}
                >
                    {requestSent ? "Continue" : "Open Settings"}
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
                    total={6}
                    enabled={6}
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
