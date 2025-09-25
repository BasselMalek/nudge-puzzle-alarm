import { View } from "react-native";
import { Button, Icon, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import IndicatorDots from "@/components/IndicatorDots";
import { router } from "expo-router";

export default function Settings() {
    const { colors } = useTheme();
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
                    {"This is needed to trigger the alarm."}
                </Text>
                <Button
                    style={{ marginTop: 50 }}
                    contentStyle={{
                        flexDirection: "row-reverse",
                        height: 50,
                        width: 100,
                    }}
                    icon={"arrow-right"}
                    mode="elevated"
                    onPress={() => {
                        router.push("/onboard/displayOverPerm");
                    }}
                >
                    {"Request"}
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
