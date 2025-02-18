import { useState } from "react";
import { Text, View, StyleSheet, ScrollView, Button } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import AlarmCard from "../components/AlarmCard";
import { palette } from "@/constants/Theme";

export default function Alarms() {
    const safeInsets = useSafeAreaInsets();
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    return (
        <>
            <StatusBar translucent />
            <View style={styles.root}>
                <LinearGradient
                    style={{
                        ...styles.nextAlarm,
                    }}
                    colors={
                        alarmGradientDim
                            ? ["#94a8ff", "#0a28ae"]
                            : ["#3b4366", "#041046"]
                    }
                    dither
                >
                    <Text
                        style={{
                            color: "red",
                            textAlign: "center",
                            fontSize: 36,
                        }}
                    >
                        {"Hi!"}
                    </Text>
                </LinearGradient>
                <View style={styles.alarmList}>
                    <ScrollView
                        style={{
                            display: "flex",
                        }}
                    >
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                        <AlarmCard
                            alarmName="Test1"
                            ringTime={new Date("2025-02-20T03:24:00")}
                            repeat={[]}
                            enabled
                            onPress={() => {}}
                        />
                    </ScrollView>
                </View>
            </View>
        </>
    );
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
        display: "flex",
        paddingBottom: 0,
    },
    nextAlarm: {
        flex: 1,
        marginTop: 0,
        padding: 20,
        alignContent: "center",
        justifyContent: "center",
    },
    alarmList: {
        backgroundColor: palette.background,
        flex: 4,
        paddingVertical: 20,
        paddingHorizontal: 10,
        paddingBottom: 0,
    },
});
