import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { Text, Card, useTheme, FAB, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAlarms } from "@/hooks/useAlarms";
import AlarmCard from "@/components/AlarmCard";
import * as SQL from "expo-sqlite";
import { Alarm } from "@/types/Alarm";
import * as FileSystem from "expo-file-system";

const unixIntToString = (unixMS: number) => {
    if (unixMS >= 86400000) {
        return "24h+";
    } else {
        const totalMins = Math.floor(unixMS / 1000 / 60);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }
};

export default function Alarms() {
    const safeInsets = useSafeAreaInsets();
    const palette = useTheme().colors;
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    const [soonestRingTime, setSoonestRingTime] = useState("");
    const { alarms, updateAlarm, deleteAlarm, loadAlarms, saveAlarms } =
        useAlarms(SQL.useSQLiteContext());
    const { update } = useLocalSearchParams();
    const [loadStale, setLoadStale] = useState(true);
    useFocusEffect(
        useCallback(() => {
            setLoadStale(update === "true" ? true : false);
            return () => {};
        }, [])
    );

    useEffect(() => {
        saveAlarms();
        setLoadStale(true);
    }, [alarms]);

    useEffect(() => {
        loadAlarms();
        return () => setLoadStale(false);
    }, [loadStale]);

    useEffect(() => {
        const soonest = alarms
            .filter((v, k) => v.isEnabled === true)
            .sort((a, b) => {
                return (
                    new Date(a.ringTime).getTime() -
                    Date.now() -
                    (new Date(b.ringTime).getTime() - Date.now())
                );
            })
            .at(0);
        if (soonest != undefined) {
            setAlarmGradientDim(true);
            setSoonestRingTime(
                "Next alarm in " +
                    unixIntToString(
                        new Date(soonest.ringTime).getTime() - Date.now()
                    )
            );
        } else {
            setAlarmGradientDim(false);
            setSoonestRingTime("No alarms for now");
        }
    }, [alarms]);

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
                        {soonestRingTime}
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
                    zIndex: 1,
                    bottom: safeInsets.bottom + 20,
                    right: safeInsets.right + 20,
                }}
                onPress={() => {
                    router.navigate("./alarmOptions?id=new");
                }}
                onLongPress={() => {
                    console.log(alarms);
                }}
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
