import { View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import IndicatorDots from "@/components/IndicatorDots";
import { router } from "expo-router";
import { useState } from "react";
import { requestOverlayPerm } from "@/modules/expo-alarm-manager";

export default function DisplayOver() {
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
                <Icon
                    source={"layers-triple-outline"}
                    size={120}
                    color={colors.primary}
                />
                <Text
                    variant="displaySmall"
                    style={{ textAlign: "center", marginTop: 30 }}
                >
                    {"Overlay Permission"}
                </Text>
                <Text variant="labelLarge" style={{ textAlign: "center" }}>
                    {"Needed to show alarms when triggered."}
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
                            requestOverlayPerm();
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
                    total={3}
                    enabled={3}
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
