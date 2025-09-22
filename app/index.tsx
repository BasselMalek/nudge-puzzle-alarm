import { AppRegistry } from "react-native";
import { BootTask } from "@/utils/BootTask";
AppRegistry.registerHeadlessTask("BootTask", () => BootTask);

import { useCallback, useEffect, useState, useMemo } from "react";
import { FlatList, View } from "react-native";
import { Text, Card, useTheme, FAB, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAlarms, formatDistanceStrictShortened } from "@/hooks/useAlarms";
import { useSQLiteContext } from "expo-sqlite";
import { Alarm } from "@/types/Alarm";
import { preventAutoHideAsync, hide } from "expo-splash-screen";
import { initDatabaseTableIfFirstBoot } from "@/utils/databaseHelpers";
import AlarmCard from "@/components/AlarmCard";
import MaskedView from "@react-native-masked-view/masked-view";

preventAutoHideAsync();

export default function Alarms() {
    const db = useSQLiteContext();
    initDatabaseTableIfFirstBoot(db);
    const safeInsets = useSafeAreaInsets();
    const palette = useTheme().colors;

    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    const [soonestRingTime, setSoonestRingTime] = useState("");
    const { alarms, deleteAlarm, loadAlarms, saveAlarms, toggleAlarm } =
        useAlarms(db, "nudge://alarms");

    const { update } = useLocalSearchParams();
    const [loadStale, setLoadStale] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setLoadStale(update === "true");
            return () => {};
        }, [update])
    );

    useEffect(() => {
        if (loadStale) {
            loadAlarms().finally(() => setLoadStale(false));
        }
        return () => {
            hide();
        };
    }, [loadStale, loadAlarms]);

    useEffect(() => {
        saveAlarms();
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
                    toggleAlarm(item.id, nextVal);
                }}
            />
        ),
        [deleteAlarm, toggleAlarm, router]
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
                    router.navigate(`./alarms/${alarms.at(0)?.id}`);
                }}
            />
            <MaskedView
                style={{ height: "100%", flex: 1 }}
                androidRenderingMode="software"
                maskElement={
                    <View
                        pointerEvents="none"
                        style={{ flex: 1, backgroundColor: "transparent" }}
                    >
                        <LinearGradient
                            pointerEvents="none"
                            start={{ x: 0.5, y: 0.9 }}
                            style={{
                                flex: 1,
                                width: "100%",
                            }}
                            colors={["#FFFFFF", "#FFFFFF00"]}
                        />
                    </View>
                }
            >
                <FlatList
                    style={{
                        display: "flex",
                        flex: 1,
                        marginTop: 5,
                    }}
                    contentContainerStyle={{
                        paddingBottom: safeInsets.bottom + 10,
                    }}
                    data={alarms}
                    renderItem={renderAlarmItem}
                    keyExtractor={keyExtractor}
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 10 }}></View>
                    )}
                />
            </MaskedView>
        </>
    );
}
