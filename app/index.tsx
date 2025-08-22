import { useCallback, useEffect, useState, useMemo } from "react";
import { FlatList, ListRenderItem } from "react-native";
import { Text, Card, useTheme, FAB, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAlarms } from "@/hooks/useAlarms";
import AlarmCard from "@/components/AlarmCard";
import * as SQL from "expo-sqlite";
import { Alarm } from "@/types/Alarm";

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
        }, [update])
    );

    useEffect(() => {
        saveAlarms();
        setLoadStale(true);
    }, [alarms, saveAlarms]);

    useEffect(() => {
        loadAlarms();
        return () => setLoadStale(false);
    }, [loadStale, loadAlarms]);

    const soonestAlarm = useMemo(() => {
        return alarms
            .filter((v, k) => v.isEnabled === true)
            .sort((a, b) => {
                return (
                    new Date(a.ringTime).getTime() -
                    Date.now() -
                    (new Date(b.ringTime).getTime() - Date.now())
                );
            })
            .at(0);
    }, [alarms]);

    useEffect(() => {
        if (soonestAlarm != undefined) {
            setAlarmGradientDim(true);
            setSoonestRingTime(
                "Next alarm in " +
                    unixIntToString(
                        new Date(soonestAlarm.ringTime).getTime() - Date.now()
                    )
            );
        } else {
            setAlarmGradientDim(false);
            setSoonestRingTime("No alarms for now");
        }
    }, [soonestAlarm]);

    const gradientColors = useMemo(() => {
        return alarmGradientDim
            ? ([palette.primary, palette.inversePrimary] as const)
            : ([palette.onSecondary, palette.onPrimary] as const);
    }, [
        alarmGradientDim,
        palette.primary,
        palette.inversePrimary,
        palette.onSecondary,
        palette.onPrimary,
    ]);

    const handleSettingsPress = useCallback(() => {
        router.push("/settings");
    }, []);

    const handleFABPress = useCallback(() => {
        router.navigate("./alarmOptions?id=new");
    }, []);

    const handleFABLongPress = useCallback(() => {
        console.log(alarms);
    }, [alarms]);

    const renderAlarmItem = useCallback(
        ({ item }: any) => (
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
        ),
        [updateAlarm]
    );

    const keyExtractor = useCallback((item: Alarm) => item.id, []);

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
                    colors={gradientColors}
                    dither
                >
                    <IconButton
                        icon={"cog"}
                        onPress={handleSettingsPress}
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
                onPress={handleFABPress}
                onLongPress={handleFABLongPress}
            />
            <FlatList
                style={{
                    display: "flex",
                }}
                data={alarms}
                renderItem={renderAlarmItem}
                keyExtractor={keyExtractor}
            />
        </>
    );
}
