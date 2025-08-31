import {
    useTheme,
    Text,
    Card,
    Icon,
    TextInput,
    FAB,
    TouchableRipple,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { WeekdayRepeat, DayKey } from "@/components/WeekdayRepeat";
import CarouselCard from "@/components/CarouselCard";
import { Suspense, useCallback, useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { TimePickerModal } from "react-native-paper-dates";
import { Puzzle } from "@/types/Puzzle";
import { PowerUp } from "@/types/PowerUp";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { createAlarm, parseAlarm } from "@/hooks/useAlarms";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";

const saveAlarm = (id: string, db: SQLiteDatabase, alarm: Alarm) => {
    if (id === "new") {
        db.runSync(
            "INSERT INTO alarms (id, name, ring_hours, ring_mins, repeat, repeat_days, puzzles, power_ups, is_enabled, last_modified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                alarm.id,
                alarm.name,
                alarm.ringHours,
                alarm.ringMins,
                alarm.repeat ? 1 : 0,
                JSON.stringify(alarm.repeatDays),
                JSON.stringify(alarm.puzzles),
                JSON.stringify(alarm.powerUps),
                alarm.isEnabled ? 1 : 0,
                new Date().toISOString(),
            ]
        );
    } else {
        db.runSync(
            "UPDATE alarms SET name = ?, ring_hours = ?, ring_mins = ?, repeat = ?, repeat_days = ?, puzzles = ?, power_ups = ?, is_enabled = ?, last_modified = ? WHERE id = ?;",
            [
                alarm!.name,
                alarm!.ringHours,
                alarm!.ringMins,
                alarm!.repeat ? 1 : 0,
                JSON.stringify(alarm!.repeatDays),
                JSON.stringify(alarm!.puzzles),
                JSON.stringify(alarm!.powerUps),
                alarm!.isEnabled ? 1 : 0,
                alarm!.lastModified.toISOString(),
                alarm.id,
            ]
        );
    }
};

export default function AlarmOptions() {
    const insets = useSafeAreaInsets();
    const palette = useTheme().colors;
    const { id } = useLocalSearchParams();
    const db = useSQLiteContext();
    const [visible, setVisible] = useState(false);
    const onDismiss = useCallback(() => {
        setVisible(false);
    }, [setVisible]);

    const onConfirm = useCallback(
        ({ hours, minutes }: { hours: number; minutes: number }) => {
            setVisible(false);
            setAlarm({
                ...alarm,
                ringHours: hours,
                ringMins: minutes,
            });
        },
        [setVisible]
    );
    const [alarm, setAlarm] = useState<Alarm>(createAlarm({ name: "" }));
    useEffect(() => {
        if (id != "new") {
            const inital = db.getFirstSync<AlarmDto>(
                "SELECT * FROM alarms WHERE id = ?",
                [id as string]
            );
            if (inital === undefined) {
                router.back();
                console.log("not loaded");
            } else {
                setAlarm(parseAlarm(inital!));
            }
        }
    }, []);
    const updateText = useCallback(() => {
        return alarm.name;
    }, [alarm]);
    const updateHours = useCallback(() => {
        return alarm.ringHours;
    }, [alarm]);
    const updateMins = useCallback(() => {
        return alarm.ringMins;
    }, [alarm]);

    return (
        <>
            <StatusBar translucent />
            <Card
                style={{
                    borderRadius: 20,
                    overflow: "hidden",
                }}
                elevation={4}
            >
                <LinearGradient
                    style={{}}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ y: 0.0, x: 1.0 }}
                    colors={
                        alarm.isEnabled
                            ? [palette.primary, palette.inversePrimary]
                            : [palette.onSecondary, palette.onPrimary]
                    }
                    dither
                >
                    <TouchableRipple
                        style={{
                            paddingVertical: 20,
                            paddingHorizontal: 20,
                            alignItems: "center",
                            justifyContent: "center",
                            flexDirection: "row",
                            gap: 15,
                            minHeight: 100,
                        }}
                        onPress={() => {
                            setVisible(true);
                        }}
                    >
                        <>
                            <TimePickerModal
                                visible={visible}
                                onDismiss={onDismiss}
                                onConfirm={onConfirm}
                                hours={updateHours()}
                                minutes={updateMins()}
                            />
                            <Icon source={"clock"} size={42} />
                            <Text
                                variant="displayMedium"
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                {new Date(
                                    new Date().setHours(
                                        alarm.ringHours,
                                        alarm.ringMins
                                    )
                                ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    hour12: true,
                                    minute: "2-digit",
                                })}
                            </Text>
                        </>
                    </TouchableRipple>
                </LinearGradient>
            </Card>
            <Card
                style={{
                    borderRadius: 20,
                }}
                elevation={4}
            >
                <Card.Content
                    style={{
                        gap: 20,
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                    }}
                >
                    <TextInput
                        mode="outlined"
                        label={"Alarm Name"}
                        value={updateText()}
                        onChange={(e) => {
                            setAlarm({ ...alarm, name: e.nativeEvent.text });
                        }}
                    />

                    <WeekdayRepeat
                        changeable
                        enabled={alarm?.repeat}
                        onEnableChange={(enabled) => {
                            setAlarm({ ...alarm, repeat: enabled });
                        }}
                        selectedDays={alarm.repeatDays}
                        onSelectionChange={(selected) => {
                            setAlarm({ ...alarm, repeatDays: selected });
                        }}
                        startDay={"sunday"}
                    />
                </Card.Content>
            </Card>
            {/* <Card
                style={{
                    borderRadius: 20,
                    flex: 1,
                }}
                elevation={4}
            >
                <Card.Content
                    style={{
                        gap: 20,
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                    }}
                >
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={{ width: 10 }} />
                        )}
                        style={{ height: "100%", marginHorizontal: 0 }}
                        data={alarm.puzzles}
                        renderItem={({ item }) => (
                            <CarouselCard
                                title={item.title}
                                icon={item.icon}
                                desc={item.desc}
                                style={{
                                    borderRadius: 20,
                                    backgroundColor: palette.surface,
                                    flex: 1,
                                }}
                            />
                        )}
                    />
                </Card.Content>
            </Card> */}
            {/* <Card
                style={{
                    borderRadius: 20,
                    flex: 1,
                }}
                elevation={4}
            >
                <Card.Content
                    style={{
                        gap: 20,
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                    }}
                >
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={{ width: 10 }} />
                        )}
                        style={{ gap: 10, height: "100%" }}
                        data={alarm.powerUps}
                                title={item.title}
                                icon={item.icon}
                                desc={item.desc}
                                style={{
                                    borderRadius: 20,
                                    backgroundColor: palette.surface,
                                    flex: 1,
                                }}
                            />
                        )}
                    />
                </Card.Content>
            </Card> */}
            <FAB
                icon={"check"}
                style={{
                    position: "absolute",
                    bottom: insets.bottom + 20,
                    right: insets.right + 20,
                }}
                onPress={() => {
                    saveAlarm(id as string, db, alarm);
                    router.navigate("/?update=true");
                }}
                onLongPress={() => {
                    console.log(alarm);
                }}
            />
        </>
    );
}
