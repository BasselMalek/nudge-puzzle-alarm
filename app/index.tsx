import { useState } from "react";
import { View, ScrollView } from "react-native";
import { Button, Text, Surface, Card, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import AlarmCard from "../components/AlarmCard";
import { router } from "expo-router";

export default function Alarms() {
    const safeInsets = useSafeAreaInsets();
    const palette = useTheme().colors;
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);

    return (
        <>
            <StatusBar translucent />
            <View
                style={{
                    flex: 1,
                    display: "flex",
                    paddingTop: safeInsets.top + 10,
                    paddingLeft: safeInsets.left + 10,
                    paddingRight: safeInsets.right + 10,
                    paddingBottom: safeInsets.bottom + 10,
                    backgroundColor: palette.background,
                    gap: 10,
                }}
            >
                <Card
                    style={{
                        borderRadius: 20,
                        overflow: "hidden",
                        height: "25%",
                    }}
                    elevation={4}
                >
                    <LinearGradient
                        style={{
                            height: "100%",
                            padding: 20,
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                        }}
                        start={{ x: 0.0, y: 1.0 }}
                        end={{ y: 0.0, x: 1.0 }}
                        colors={
                            alarmGradientDim
                                ? [palette.primary, palette.inversePrimary]
                                : [palette.onSecondary, palette.onPrimary]
                        }
                        dither
                    >
                        <Text
                            variant="headlineSmall"
                            style={{
                                textAlign: "right",
                            }}
                        >
                            {"Next alarm in 2h 35m"}
                        </Text>
                    </LinearGradient>
                </Card>
                <Button
                    mode="contained"
                    onPress={() => {
                        router.navigate("/themeDisplay");
                    }}
                    style={{ marginBottom: 16 }}
                >
                    Theme
                </Button>
                <ScrollView
                    style={{
                        display: "flex",
                    }}
                >
                    <AlarmCard
                        alarmName="Test1"
                        ringTime={new Date("2025-07-31T18:24:00")}
                        repeat={[]}
                        enabled
                        onToggle={() => {}}
                    />
                </ScrollView>
            </View>
        </>
    );
}
