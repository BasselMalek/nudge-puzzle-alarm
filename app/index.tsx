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
import AlarmCard from "@/components/AlarmCard";

type AlarmAction =
    | { type: "UPDATE_ALARM"; payload: Partial<Alarm> & { id: string } }
    | { type: "DELETE_ALARM"; payload: string }
    | { type: "ADD_ALARM"; payload: Alarm };

const alarmsReducer = (state: Alarm[], action: AlarmAction) => {
    switch (action.type) {
        case "UPDATE_ALARM":
            return state.map((alarm) =>
                alarm.id === action.payload.id
                    ? { ...alarm, ...action.payload }
                    : alarm
            );

        case "DELETE_ALARM":
            return state.filter((alarm) => alarm.id !== action.payload);

        case "ADD_ALARM":
            return [...state, action.payload];

        default:
            return state;
    }
};

export default function Alarms() {
    const safeInsets = useSafeAreaInsets();
    const palette = useTheme().colors;
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    const [alarmsList, dispatch] = useReducer(alarmsReducer, [
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
                data={alarmsList}
                renderItem={({ item }) => (
                    <AlarmCard
                        enabled={item.isEnabled}
                        alarmName={item.name}
                        ringTime={item.ringTime}
                        repeated={item.repeat}
                        repeat={item.repeatDays}
                        onPress={() => {
                            router.push("/alarmOptions");
                        }}
                        onToggle={(status) => {
                            dispatch({
                                type: "UPDATE_ALARM",
                                payload: { id: item.id, isEnabled: status },
                            });
                        }}
                    />
                )}
            ></FlatList>
        </>
    );
}
