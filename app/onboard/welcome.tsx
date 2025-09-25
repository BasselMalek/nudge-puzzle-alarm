import { Image, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import IndicatorDots from "@/components/IndicatorDots";
import { router } from "expo-router";
const imgSrc = require("@/assets/images/hourglass.png");

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
                <Image
                    source={imgSrc}
                    style={{
                        height: 150,
                        width: 150,
                        marginBottom: 30,
                    }}
                    tintColor={colors.primary}
                />
                <Text variant="displaySmall" style={{ textAlign: "center" }}>
                    {"Welcome to Nudge!"}
                </Text>
                <Text variant="labelLarge" style={{ textAlign: "center" }}>
                    {"Never miss an alarm again"}
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
                        router.push("/onboard/notificationPerm");
                    }}
                >
                    {"Start"}
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
                    enabled={1}
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
