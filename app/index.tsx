import { useCallback, useEffect, useState, useMemo } from "react";
import { BackHandler, FlatList, View } from "react-native";
import { Text, Card, useTheme, FAB, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAlarms, formatDistanceStrictShortened } from "@/hooks/useAlarms";
import { useSQLiteContext } from "expo-sqlite";
import { Alarm } from "@/types/Alarm";
import { preventAutoHideAsync, hide } from "expo-splash-screen";
import AlarmCard from "@/components/AlarmCard";
import Storage from "expo-sqlite/kv-store";
import { scheduleAlarm } from "@/modules/expo-alarm-manager";

void preventAutoHideAsync();

export default function Alarms() {
    const db = useSQLiteContext();
    const safeInsets = useSafeAreaInsets();
    const { colors } = useTheme();
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    const [soonestRingTime, setSoonestRingTime] = useState("");
    const { alarms, deleteAlarm, loadAlarms, saveAlarms, toggleAlarm } =
        useAlarms(db, "nudge://alarms");
    const { update, dismiss } = useLocalSearchParams();
    const [loadStale, setLoadStale] = useState(true);
    const [shouldDismiss, setShouldDismiss] = useState(false);
    const first = Storage.getItemSync("isFirstBoot");

    useEffect(() => {
        if (first === null) {
            router.navigate("/onboardingScreens/welcome");
        }
    }, [first]);

    useEffect(() => {
        if (shouldDismiss) {
            setShouldDismiss(false);
            BackHandler.exitApp();
        }
    }, [shouldDismiss]);

    useFocusEffect(
        useCallback(() => {
            setLoadStale(first !== null && update === "true");
            setShouldDismiss(dismiss === "true");
        }, [first, update, dismiss])
    );

    useEffect(() => {
        if (loadStale) {
            void loadAlarms().finally(() => setLoadStale(false));
        }
        return () => {
            void hide();
        };
    }, [loadStale, loadAlarms]);

    useEffect(() => {
        void saveAlarms();
    }, [alarms, saveAlarms]);

    const soonestAlarm = useMemo(() => {
        return alarms
            .filter((v) => v.isEnabled === true)
            .sort(
                (a, b) =>
                    new Date().setHours(a.ringHours, a.ringMins) -
                    new Date().setHours(b.ringHours, b.ringMins)
            )
            .at(0);
    }, [alarms]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateSoonest = () => {
            if (soonestAlarm !== undefined) {
                setAlarmGradientDim(true);
                setSoonestRingTime(
                    "Next alarm in " +
                        formatDistanceStrictShortened(
                            new Date(
                                new Date().setHours(
                                    soonestAlarm.ringHours,
                                    soonestAlarm.ringMins
                                )
                            ),
                            new Date()
                        )
                );
            } else {
                setAlarmGradientDim(false);
                setSoonestRingTime("No alarms for now");
            }
        };
        updateSoonest();
        const now = new Date();
        const msToNextMinute =
            (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
        const timeout = setTimeout(() => {
            updateSoonest();
            interval = setInterval(updateSoonest, 60 * 1000);
        }, msToNextMinute);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [soonestAlarm]);

    const gradientColors = useMemo(() => {
        return alarmGradientDim
            ? ([colors.primary, colors.inversePrimary] as const)
            : ([colors.onSecondary, colors.onPrimary] as const);
    }, [
        alarmGradientDim,
        colors.primary,
        colors.inversePrimary,
        colors.onSecondary,
        colors.onPrimary,
    ]);

    const handleSettingsPress = useCallback(() => {
        router.push("/settings");
    }, []);

    const handleFABPress = useCallback(() => {
        router.navigate("./alarmOptions?id=new");
    }, []);

    const renderAlarmItem = useCallback(
        ({ item }: { item: Alarm }) => (
            <AlarmCard
                alarm={item}
                onDelete={() => {
                    deleteAlarm(item.id);
                }}
                onPress={() => {
                    router.navigate(`./alarmOptions?id=${item.id}`);
                }}
                onToggle={(nextVal: boolean) => {
                    void toggleAlarm(item.id, nextVal);
                }}
            />
        ),
        [deleteAlarm, toggleAlarm]
    );

    const keyExtractor = useCallback((item: Alarm) => item.id, []);

    return (
        <>
            <StatusBar translucent />
            <Card
                style={{
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
            <FAB
                icon={"plus"}
                style={{
                    position: "absolute",
                    zIndex: 1,
                    bottom: safeInsets.bottom + 20,
                    right: safeInsets.right + 20,
                }}
                onPress={handleFABPress}
                onLongPress={() => {
                    console.log(alarms);
                }}
            />
            <FAB
                icon={"alarm"}
                style={{
                    position: "absolute",
                    zIndex: 1,
                    bottom: safeInsets.bottom + 120,
                    right: safeInsets.right + 20,
                }}
                onPress={() => {
                    void scheduleAlarm(
                        alarms.at(0)!.id,
                        Date.now() + 5000,
                        false
                    );
                }}
                onLongPress={() => {
                    router.push("/onboardingScreens/welcome");
                }}
            />
            <FlatList
                style={{
                    display: "flex",
                    flex: 1,
                    marginTop: 5,
                }}
                data={alarms}
                renderItem={renderAlarmItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                fadingEdgeLength={{ start: 0, end: 40 }}
                ItemSeparatorComponent={() => (
                    <View style={{ height: 10 }}></View>
                )}
            />
        </>
    );
}
