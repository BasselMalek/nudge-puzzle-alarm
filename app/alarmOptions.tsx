import {
    useTheme,
    Text,
    Card,
    Icon,
    TextInput,
    FAB,
    TouchableRipple,
    Button,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import WeekdayRepeat from "@/components/WeekdayRepeat";
import { useCallback, useRef, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { TimePickerModal } from "react-native-paper-dates";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { createAlarm, parseAlarm, saveAlarmDirect } from "@/hooks/useAlarms";
import { useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { DaySet } from "@/types/DaySet";
import { scheduleNextInstance } from "@/utils/alarmSchedulingHelpers";
import SoundOptionsModal from "@/components/SoundOptionsModal";
import PuzzleSelectionModal from "@/components/PuzzleSelectionModal";
import { Puzzle } from "@/types/Puzzles";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ReorderableList, {
    ReorderableListReorderEvent,
    reorderItems,
} from "react-native-reorderable-list";
import DraggableListItem from "@/components/DraggableListItem";
import ListItem from "@/components/ListItem";
import BoosterConfigCards from "@/components/BoosterConfigCards";
import { BoosterSet } from "@/types/Boosters";

const blankRepeat: DaySet = {
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
    const editPuzzleAtIndex = useRef<number | undefined>(undefined);
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
        }, [db, id])
    );

    const cleanUpAlarm = useCallback(() => {
        let cleanedUpAlarm = { ...alarm, isEnabled: true };
        if (!alarm.repeat) {
            cleanedUpAlarm = {
                ...cleanedUpAlarm,
                repeatDays: blankRepeat,
            };
        } else {
            cleanedUpAlarm = {
                ...cleanedUpAlarm,
                repeat:
                    cleanedUpAlarm.repeatDays[0].enabled ||
                    cleanedUpAlarm.repeatDays[1].enabled ||
                    cleanedUpAlarm.repeatDays[2].enabled ||
                    cleanedUpAlarm.repeatDays[3].enabled ||
                    cleanedUpAlarm.repeatDays[4].enabled ||
                    cleanedUpAlarm.repeatDays[5].enabled ||
                    cleanedUpAlarm.repeatDays[6].enabled,
            };
        }
        return cleanedUpAlarm;
    }, [alarm]);

    const handlePuzzleUpdate = useCallback((newPuzzles: Puzzle[]) => {
        setAlarm((prevAlarm) => ({ ...prevAlarm, puzzles: newPuzzles }));
    }, []);

    const handleModalClose = useCallback((vis: boolean) => {
        editPuzzleAtIndex.current = undefined;
        setPuzzlesModalVisible(vis);
    }, []);

    return (
        <GestureHandlerRootView
            style={{
                gap: 10,
                flex: 1,
            }}
        >
            <StatusBar translucent />
            <Card
                style={{
                    borderRadius: roundness + 15,
                    overflow: "hidden",
                }}
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
            <Card style={{ borderRadius: 20 }}>
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
                        style={{ backgroundColor: colors.elevation.level1 }}
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
            <PuzzleSelectionModal
                alarm={alarm}
                setAlarm={handlePuzzleUpdate}
                isVisible={puzzlesModalVisible}
                setIsVisible={handleModalClose}
                editIndex={editPuzzleAtIndex.current}
            />
            <View
                style={{
                    marginTop: 10,
                    maxHeight: "30%",
                    paddingHorizontal: 10,
                }}
            >
                <Text variant="titleMedium">{"Puzzles"}</Text>
                <ReorderableList
                    showsVerticalScrollIndicator={false}
                    // ItemSeparatorComponent={() => (
                    //     <View style={{ height: 10 }} />
                    // )}
                    data={alarm.puzzles}
                    // style={{
                    //     paddingVertical: 10,
                    //     paddingHorizontal: 3,
                    // }}
                    fadingEdgeLength={{ start: 10, end: 10 }}
                    onReorder={({ from, to }: ReorderableListReorderEvent) => {
                        setAlarm((prevAlarm) => ({
                            ...prevAlarm,
                            puzzles: reorderItems(prevAlarm.puzzles, from, to),
                        }));
                    }}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        gap: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 3,
                    }}
                    renderItem={({ item, index }) => {
                        return (
                            <DraggableListItem
                                title={item.title}
                                icon={item.icon}
                                desc={"Difficulty: " + item.difficulty}
                                style={{ height: 60 }}
                                buttons
                                buttonOneAction={() => {
                                    editPuzzleAtIndex.current = index;
                                    setPuzzlesModalVisible(true);
                                }}
                                buttonTwoAction={() => {
                                    setAlarm((prevAlarm) => ({
                                        ...prevAlarm,
                                        puzzles: prevAlarm.puzzles.filter(
                                            (puzzle) => puzzle.id !== item.id
                                        ),
                                    }));
                                }}
                            />
                        );
                    }}
                    ListFooterComponent={() => {
                        return (
                            <>
                                {/* <View style={{ height: 10 }} /> */}
                                {alarm.puzzles.length < 5 && (
                                    <ListItem
                                        disabled={true}
                                        icon={"plus"}
                                        style={{ height: 60 }}
                                        title={"New Puzzle"}
                                        desc={
                                            "Tip: drag your puzzles to change their order"
                                        }
                                        onPress={() => {
                                            editPuzzleAtIndex.current =
                                                undefined;
                                            setPuzzlesModalVisible(true);
                                        }}
                                    />
                                )}
                            </>
                        );
                    }}
                />
            </View>
            <View
                style={{
                    flex: 1,
                    paddingHorizontal: 10,
                    // gap: 10,
                }}
            >
                <Text variant="titleMedium">{"Boosters"}</Text>
                <BoosterConfigCards
                    boosters={alarm.boosterSet}
                    setBoosters={(newSet: BoosterSet) => {
                        setAlarm({ ...alarm, boosterSet: newSet });
                    }}
                />
            </View>
            <FAB
                icon="check"
                style={{
                    position: "absolute",
                    bottom: insets.bottom + 10,
                    right: insets.right + 20,
                }}
                onPress={() => {
                    void (async () => {
                        try {
                            const clean = cleanUpAlarm();
                            await saveAlarmDirect(id as string, db, clean);
                            await scheduleNextInstance(clean);
                            router.navigate("/?update=true");
                        } catch (err) {
                            console.error("Failed to save alarm:", err);
                        }
                    })();
                }}
                onLongPress={() => console.log(alarm)}
            />
        </GestureHandlerRootView>
    );
}
