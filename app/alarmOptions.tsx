import {
    useTheme,
    Text,
    Card,
    Icon,
    TextInput,
    FAB,
    TouchableRipple,
    Switch,
    Button,
    IconButton,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import WeekdayRepeat from "@/components/WeekdayRepeat";
import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { TimePickerModal } from "react-native-paper-dates";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { createAlarm, parseAlarm, saveAlarmDirect } from "@/hooks/useAlarms";
import { useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { FlatList, TouchableOpacity, View } from "react-native";
import { DaySet } from "@/types/DaySet";
import { scheduleNextInstance } from "@/utils/alarmSchedulingHelpers";
import SoundOptionsModal from "@/components/SoundOptionsModal";
import CarouselCard from "@/components/ListItem";
import ListItem from "@/components/ListItem";
import PuzzleSelectionModal from "@/components/PuzzleSelectionModal";

const blankRepeat = {
    0: {
        dayName: "Sunday",
        letter: "S",
        enabled: false,
    },
    1: {
        dayName: "Monday",
        letter: "M",
        enabled: false,
    },
    2: {
        dayName: "Tuesday",
        letter: "T",
        enabled: false,
    },
    3: {
        dayName: "Wednesday",
        letter: "W",
        enabled: false,
    },
    4: {
        dayName: "Thursday",
        letter: "T",
        enabled: false,
    },
    5: {
        dayName: "Friday",
        letter: "F",
        enabled: false,
    },
    6: {
        dayName: "Saturday",
        letter: "S",
        enabled: false,
    },
};

export default function AlarmOptions() {
    const insets = useSafeAreaInsets();
    const { colors, roundness } = useTheme();
    const { id } = useLocalSearchParams();
    const db = useSQLiteContext();
    const [timePickerModalVisible, setTimePickerModalVisible] = useState(false);
    const [soundsModalVisible, setSoundsModalVisible] = useState(false);
    const [puzzlesModalVisible, setPuzzlesModalVisible] = useState(false);
    const [alarm, setAlarm] = useState<Alarm>(createAlarm({ name: "" }));

    useFocusEffect(
        useCallback(() => {
            if (id !== "new") {
                const initial = db.getFirstSync<AlarmDto>(
                    "SELECT * FROM alarms WHERE id = ?",
                    [id as string]
                );
                if (!initial) {
                    router.back();
                } else {
                    setAlarm(parseAlarm(initial));
                }
            }
        }, [id])
    );

    return (
        <>
            <StatusBar translucent />
            <Card
                style={{
                    borderRadius: roundness + 15,
                    overflow: "hidden",
                }}
                elevation={4}
            >
                <LinearGradient
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ y: 0.0, x: 1.0 }}
                    colors={
                        alarm.isEnabled
                            ? [colors.primary, colors.inversePrimary]
                            : [colors.onSecondary, colors.onPrimary]
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
                        onPress={() => setTimePickerModalVisible(true)}
                    >
                        <>
                            <TimePickerModal
                                visible={timePickerModalVisible}
                                onDismiss={() =>
                                    setTimePickerModalVisible(false)
                                }
                                onConfirm={({ hours, minutes }) => {
                                    setTimePickerModalVisible(false);
                                    setAlarm({
                                        ...alarm,
                                        ringHours: hours,
                                        ringMins: minutes,
                                    });
                                }}
                                hours={alarm.ringHours}
                                minutes={alarm.ringMins}
                            />
                            <Icon source="clock" size={42} />
                            <Text
                                variant="displayMedium"
                                style={{ textAlign: "center" }}
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
            <Card style={{ borderRadius: 20 }} elevation={3}>
                <Card.Content
                    style={{
                        padding: 20,
                        gap: 15,
                        justifyContent: "center",
                        alignContent: "center",
                    }}
                >
                    <TextInput
                        mode="outlined"
                        label="Alarm Name"
                        value={alarm.name}
                        style={{ backgroundColor: colors.elevation.level3 }}
                        outlineColor={colors.onSecondaryContainer}
                        outlineStyle={{ borderRadius: roundness + 5 }}
                        onChange={(e) =>
                            setAlarm({ ...alarm, name: e.nativeEvent.text })
                        }
                    />
                    <View
                        style={{
                            paddingLeft: 5,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text variant="labelLarge">Sound & Vibration</Text>
                        <SoundOptionsModal
                            alarm={alarm}
                            setAlarm={setAlarm}
                            isVisible={soundsModalVisible}
                            setIsVisible={setSoundsModalVisible}
                        />
                        <Button
                            icon={alarm.vibrate ? "vibrate" : "vibrate-off"}
                            mode="contained"
                            style={{
                                borderRadius: roundness,
                            }}
                            contentStyle={{
                                maxWidth: 200,
                            }}
                            onPress={() => setSoundsModalVisible(true)}
                        >
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                    color: colors.onPrimary,
                                }}
                            >
                                {alarm.ringtone.name}
                            </Text>
                        </Button>
                    </View>
                    <WeekdayRepeat
                        changeable
                        repeatEnabled={alarm?.repeat}
                        onRepeatEnableChange={(enabled: boolean) =>
                            setAlarm({ ...alarm, repeat: enabled })
                        }
                        dayMap={alarm.repeatDays}
                        onDayMapChange={(selected: DaySet) =>
                            setAlarm({ ...alarm, repeatDays: selected })
                        }
                        startDay={0}
                    />
                </Card.Content>
            </Card>
            <Card style={{ flex: 1, borderRadius: 20 }} elevation={3}>
                <Card.Content
                    style={{ paddingVertical: 15, gap: 10, height: "100%" }}
                >
                    <Text variant="titleMedium">{"Puzzles"}</Text>
                    <PuzzleSelectionModal
                        alarm={alarm}
                        setAlarm={setAlarm}
                        isVisible={puzzlesModalVisible}
                        setIsVisible={setPuzzlesModalVisible}
                    />
                    <FlatList
                        contentContainerStyle={{ gap: 10 }}
                        data={alarm.puzzles}
                        renderItem={({ item }) => (
                            <ListItem
                                title={item.title}
                                icon={item.icon}
                                buttons
                            />
                        )}
                        ListFooterComponent={() => {
                            return (
                                <Card
                                    style={{ flex: 1 }}
                                    onPress={() => {
                                        setPuzzlesModalVisible(true);
                                    }}
                                >
                                    <Card.Content
                                        style={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Icon source={"plus"} size={24} />
                                    </Card.Content>
                                </Card>
                            );
                        }}
                    />
                </Card.Content>
            </Card>
            <FAB
                icon="check"
                style={{
                    position: "absolute",
                    bottom: insets.bottom + 20,
                    right: insets.right + 20,
                }}
                onPress={() => {
                    setAlarm({ ...alarm, isEnabled: true });
                    if (!alarm.repeat) {
                        setAlarm({
                            ...alarm,
                            repeatDays: blankRepeat,
                        });
                    }
                    saveAlarmDirect(id as string, db, alarm).then(() => {
                        scheduleNextInstance(alarm);
                        router.navigate("/?update=true");
                    });
                }}
                onLongPress={() => console.log(alarm)}
            />
        </>
    );
}
