import { View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import IndicatorDots from "@/components/IndicatorDots";
import { router } from "expo-router";
import { requestPermissionsAsync } from "expo-notifications";
import { useState } from "react";

export default function Notification() {
    const { colors } = useTheme();
    const [permsGranted, setPermsGranted] = useState(false);
    return (
        <View
            style={{
                flex: 1,
            }}
        >
            <StatusBar translucent />
            <View
                style={{
                    flex: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                }}
            >
                <Icon
                    source={"bell-ring-outline"}
                    size={125}
                    color={colors.primary}
                />
                <Text
                    variant="displaySmall"
                    style={{ textAlign: "center", marginTop: 30 }}
                >
                    {"Notfication Permission"}
                </Text>
                <Text variant="labelLarge" style={{ textAlign: "center" }}>
                    {"Needed to trigger alarms."}
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
                    onPress={async () => {
                        if (permsGranted) {
                            router.push("/onboard/displayOverPerm");
                        } else {
                            const result = await requestPermissionsAsync({
                                ios: {
                                    allowAlert: true,
                                    allowBadge: true,
                                    allowCriticalAlerts: true,
                                    allowSound: true,
                                },
                            });
                            if (result) {
                                setPermsGranted(true);
                            }
                        }
                    }}
                >
                    {permsGranted ? "Continue" : "Request"}
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
                    total={3}
                    enabled={2}
                    size={10}
                    colors={{
                        primary: colors.primary,
                        secondary: colors.secondary,
                        off: colors.onSurfaceDisabled,
                    }}
                />
            </View>
        </View>
    );
}
