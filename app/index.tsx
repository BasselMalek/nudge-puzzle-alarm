import { useState } from "react";
import { View, ScrollView } from "react-native";
import {
    Button,
    Text,
    Surface,
    Card,
    useTheme,
    FAB,
    IconButton,
} from "react-native-paper";
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
                        paddingVertical: 10,
                        paddingHorizontal: 15,
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
                    <IconButton
                        icon={"cog"}
                        onPress={() => {
                            router.push("/settings");
                        }}
                        style={{
                            elevation: 5,
                            padding: 0,
                            margin: 0,
                            position: "absolute",
                            top: 5,
                            right: 5,
                        }}
                    />
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
            {/* <Button
                    mode="contained"
                    onPress={() => {
                        router.navigate("/themeDisplay");
                    }}
                    style={{ marginBottom: 16 }}
                >
                    Theme
                </Button> */}
            <FAB
                icon={"plus"}
                style={{
                    position: "absolute",
                    bottom: safeInsets.bottom + 20,
                    right: safeInsets.right + 20,
                }}
                onPress={() => {}}
            />
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
                    onPress={() => {
                        router.push("/alarmModal?id=d");
                    }}
                />
            </ScrollView>
        </>
    );
}
