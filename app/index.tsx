import { useCallback, useEffect, useState, useMemo } from "react";
import { BackHandler, FlatList, View } from "react-native";
import { Text, Card, useTheme, FAB, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useRouter, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAlarms, getNextRingTimeString } from "@/hooks/useAlarms";
import { useSQLiteContext } from "expo-sqlite";
import { Alarm } from "@/types/Alarm";
import { preventAutoHideAsync, hide } from "expo-splash-screen";
import AlarmCard from "@/components/AlarmCard";
import Storage from "expo-sqlite/kv-store";
import { usePreventRemove } from "@react-navigation/native";
import { compareAsc } from "date-fns";
import { getNextInstanceTimeStamp } from "@/utils/alarmSchedulingHelpers";
void preventAutoHideAsync();

export default function Alarms() {
    const db = useSQLiteContext();
    const safeInsets = useSafeAreaInsets();
    const { colors } = useTheme();
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    const [soonestRingTime, setSoonestRingTime] = useState("");
    const { alarms, deleteAlarm, loadAlarms, saveAlarms, toggleAlarm } =
        useAlarms(db, "nudge://alarms");
    const { update } = useLocalSearchParams();
    const [loadStale, setLoadStale] = useState(true);
    const router = useRouter();
    const first = Storage.getItemSync("isFirstBoot");

    useFocusEffect(
        useCallback(() => {
            if (first === null) {
                router.replace("/onboardingScreens/welcome");
            }
        }, [first, router])
    );

    usePreventRemove(router.canGoBack(), () => {
        BackHandler.exitApp();
    });

    useFocusEffect(
        useCallback(() => {
            setLoadStale(
                first !== null && first === "true" && update === "true"
            );
        }, [first, update])
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

    useEffect(() => {
        let interval: NodeJS.Timeout;

        const updateSoonest = () => {
            const soonestAlarmData = alarms
                .filter((alarm) => alarm.isEnabled)
                .map((alarm) => ({
                    alarm,
                    nextRingTime: new Date(getNextInstanceTimeStamp(alarm)),
                }))
                .sort((a, b) => compareAsc(a.nextRingTime, b.nextRingTime))
                .at(0);

            if (soonestAlarmData !== undefined) {
                setAlarmGradientDim(true);
                setSoonestRingTime(
                    "Next alarm in " +
                        getNextRingTimeString(
                            new Date(soonestAlarmData.nextRingTime)
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
    }, [alarms]);

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
    }, [router]);

    const handleFABPress = useCallback(() => {
        router.navigate("./alarmOptions?id=new");
    }, [router]);

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
        [deleteAlarm, router, toggleAlarm]
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
                onLongPress={() => console.log(alarms)}
            />
            {/* <FAB
                icon={"alarm"}
                style={{
                    position: "absolute",
                    zIndex: 1,
                    bottom: safeInsets.bottom + 120,
                    right: safeInsets.right + 20,
                }}
                onPress={() => {
                    void scheduleAlarm(alarms.at(0)!.id, Date.now() + 5000);
                }}
                onLongPress={() => {
                    router.push("/onboardingScreens/welcome");
                }}
            /> */}
            <FlatList
                style={{
                    display: "flex",
                    flex: 1,
                    // marginTop: 5,
                    paddingVertical: 10,
                }}
                data={alarms}
                renderItem={renderAlarmItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                fadingEdgeLength={{ start: 10, end: 10 }}
                ItemSeparatorComponent={() => (
                    <View style={{ height: 10 }}></View>
                )}
            />
        </>
    );
}
