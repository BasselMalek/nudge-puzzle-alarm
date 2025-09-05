import { useCallback, useEffect, useState, useMemo } from "react";
import { FlatList, View } from "react-native";
import { Text, Card, useTheme, FAB, IconButton } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useAlarms } from "@/hooks/useAlarms";
import AlarmCard from "@/components/AlarmCard";
import * as SQL from "expo-sqlite";
import { Alarm } from "@/types/Alarm";
import { preventAutoHideAsync, hide } from "expo-splash-screen";
import expoAlarmManager from "@/modules/expo-alarm-manager";
import MaskedView from "@react-native-masked-view/masked-view";
import Storage from "expo-sqlite/kv-store";

const unixIntToString = (unixMS: number) => {
    if (unixMS >= 86400000) {
        return "24h+";
    } else {
        const totalMins = Math.floor(unixMS / 1000 / 60);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hrs != 0) {
            return `${hrs}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }
};

preventAutoHideAsync();
export default function Alarms() {
    const db = SQL.useSQLiteContext();

    try {
        const first = Storage.getItemSync("isFirstBoot");

        if (first === null) {
            db.runSync(`
      CREATE TABLE IF NOT EXISTS alarms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        ring_hours INTEGER NOT NULL CHECK (ring_hours >= 0 AND ring_hours <= 23),
        ring_mins INTEGER NOT NULL CHECK (ring_mins >= 0 AND ring_mins <= 59),
        repeat BOOLEAN NOT NULL DEFAULT 0,
        repeat_days TEXT,
        puzzles TEXT,
        power_ups TEXT,
        is_enabled BOOLEAN NOT NULL DEFAULT 1,
        last_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

            //* this is for the AlarmManager intents. Will be useful when i get around to coding the BOOT_COMPLETED receiver so i can ensure alarms stay consistent on boot.
            db.runSync(`
      CREATE TABLE IF NOT EXISTS internal_enabled (
        id TEXT PRIMARY KEY,
        ring_time DATETIME NOT NULL
        last_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

            Storage.setItemSync("isFirstBoot", "true");
        }
    } catch (error) {
        console.error("Database initialization failed:", error);
    }
    const safeInsets = useSafeAreaInsets();
    const palette = useTheme().colors;
    const [alarmGradientDim, setAlarmGradientDim] = useState(false);
    const [soonestRingTime, setSoonestRingTime] = useState("");
    const { alarms, updateAlarm, deleteAlarm, loadAlarms, saveAlarms } =
        useAlarms(db);
    const { update } = useLocalSearchParams();
    const [loadStale, setLoadStale] = useState(true);

    useFocusEffect(
        useCallback(() => {
            expoAlarmManager.setLinkingScheme("nudge://alarms");
            setLoadStale(update === "true" ? true : false);
            return () => {};
        }, [update])
    );
    useEffect(() => {
        loadAlarms();
        return () => {
            setLoadStale(false);
            hide();
        };
    }, [loadStale, loadAlarms]);

    useEffect(() => {
        saveAlarms();
        setLoadStale(true);
    }, [alarms, saveAlarms]);

    const soonestAlarm = useMemo(() => {
        return alarms
            .filter((v, k) => v.isEnabled === true)
            .sort((a, b) => {
                return (
                    new Date(
                        new Date().setHours(a.ringHours, a.ringMins)
                    ).getTime() -
                    Date.now() -
                    (new Date(
                        new Date().setHours(b.ringHours, b.ringMins)
                    ).getTime() -
                        Date.now())
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
                        new Date().setHours(
                            soonestAlarm.ringHours,
                            soonestAlarm.ringMins
                        ) - Date.now()
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
        ({ item }: { item: Alarm }) => (
            <AlarmCard
                alarm={item}
                onDelete={() => {
                    deleteAlarm(item.id);
                }}
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
            <FAB
                icon={"pin"}
                style={{
                    position: "absolute",
                    zIndex: 1,
                    bottom: safeInsets.bottom + 120,
                    right: safeInsets.right + 20,
                }}
                onPress={() => {
                    router.navigate(`./alarms/${alarms.at(0)?.id}`);
                }}
                onLongPress={() => {
                    expoAlarmManager
                        .scheduleAlarm(alarms.at(0)!.id, Date.now() + 10000)
                        .then(() => {
                            console.log(
                                "set" + new Date().toLocaleTimeString()
                            );
                        })
                        .catch((e) => {
                            console.log(e);
                        });
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
