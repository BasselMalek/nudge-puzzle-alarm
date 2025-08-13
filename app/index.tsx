import { useReducer, useState } from "react";
import { View, ScrollView, FlatList } from "react-native";
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
import { router } from "expo-router";
import { Alarm } from "@/types/Alarm";
import { useAlarms } from "@/hooks/useAlarms";
import AlarmCard from "@/components/AlarmCard";

export default function Alarms() {
    const safeInsets = useSafeAreaInsets();
    const palette = useTheme().colors;
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    const { alarms, updateAlarm, deleteAlarm, addAlarm } = useAlarms([
        {
            id: "alarm_1",
            name: "Morning Workout",
            ringTime: "2001-01-01T06:30",
            repeat: true,
            repeatDays: ["monday", "wednesday", "friday"],
            puzzles: [],
            powerUps: [],
            isEnabled: true,
        },

        {
            id: "alarm_2",
            name: "Important Meeting",
            ringTime: "2001-01-01T14:00",
            repeat: false,
            repeatDays: [],
            puzzles: [],
            powerUps: [],
            isEnabled: true,
        },
    ]);

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
            <FlatList
                style={{
                    display: "flex",
                }}
                data={alarms}
                renderItem={({ item }) => (
                    <AlarmCard
                        enabled={item.isEnabled}
                        alarmName={item.name}
                        ringTime={item.ringTime}
                        repeated={item.repeat}
                        repeat={item.repeatDays}
                        //TODO: implement a swipe to delete thing here.
                        onPress={() => {
                            router.navigate(`./alarmOptions?id=${item.id}`);
                        }}
                        onToggle={(status) => {
                            updateAlarm(item.id, { isEnabled: status });
                        }}
                    />
                )}
            ></FlatList>
        </>
    );
}
