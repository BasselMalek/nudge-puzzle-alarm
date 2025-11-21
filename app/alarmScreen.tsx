import { BackHandler, View } from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { parseAlarm, saveAlarmDirect } from "@/hooks/useAlarms";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { useSQLiteContext } from "expo-sqlite";
import * as AlarmManager from "@/modules/expo-alarm-manager";
import ClockText from "@/components/ClockText";
import PuzzleContainer from "@/components/PuzzleContainer";
import {
    handleDaisyChainAfterRing,
    scheduleSnoozedAlarm,
} from "@/utils/alarmSchedulingHelpers";
import * as AsyncStorage from "expo-sqlite/kv-store";
import { handleDismiss, handleSnooze } from "@/utils/boosterHelpers";
import { usePreventRemove } from "@react-navigation/native";

type SnoozeState = {
    uses: number;
    decay: number;
    duration: number;
};

AlarmManager.setShowWhenLocked(true);

export default function AlarmScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const [alarm, setAlarm] = useState<Alarm>();
    const db = useSQLiteContext();
    const alarmPlayer = AlarmManager.useAlarmPlayer();

    const [isPuzzleVisible, setIsPuzzleVisible] = useState(false);
    const [puzzlesComplete, setPuzzlesComplete] = useState(false);
    const [snoozeDuration, setSnoozeDuration] = useState(5);
    const [snoozeAvailable, setSnoozeAvailable] = useState(true);
    const [dismissable, setDismissable] = useState(false);

    useEffect(() => {
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            () => {
                return true;
            }
        );
        return () => backHandler.remove();
    }, []);

    usePreventRemove(!dismissable, () => {
        console.log("Oh, the eternity we shall spend together.");
    });

    useEffect(() => {
        const initial = db.getFirstSync<AlarmDto>(
            "SELECT * FROM alarms WHERE id = ?",
            [id as string]
        );
        if (initial) {
            const innitAlarm = parseAlarm(initial);
            setAlarm(innitAlarm);
            setPuzzlesComplete(innitAlarm.puzzles.length === 0);
        }
    }, [db, id]);

    useEffect(() => {
        if (!alarm?.id) return;
        const checkSnoozeState = () => {
            const unparsedSnoozeState = AsyncStorage.Storage.getItemSync(
                alarm.id
            );
            if (!unparsedSnoozeState || unparsedSnoozeState === "disabled") {
                if (alarm.boosterSet.snoozeMods.enabled) {
                    const config = alarm.boosterSet.snoozeMods.config;
                    setSnoozeAvailable(
                        config.snoozeUses > 0 && config.snoozeStartingTime > 0
                    );
                    setSnoozeDuration(config.snoozeStartingTime);
                } else {
                    setSnoozeAvailable(true);
                }
            } else {
                const snoozeState = JSON.parse(
                    unparsedSnoozeState
                ) as SnoozeState;
                setSnoozeAvailable(
                    snoozeState.uses > 0 && snoozeState.duration > 0
                );
                setSnoozeDuration(snoozeState.duration);
            }
        };

        checkSnoozeState();
    }, [alarm]);

    const dismissAlarm = async () => {
        if (!alarm) return;
        setDismissable(true);
        try {
            const newAlarm = await handleDaisyChainAfterRing(alarm);
            await saveAlarmDirect(newAlarm.id, db, newAlarm);
            await alarmPlayer?.stop();
            await alarmPlayer?.release();
            AlarmManager.setShowWhenLocked(false, alarm.id);
            await handleDismiss({
                id: alarm.id,
                doubleChecked: alarm.boosterSet.postDismissCheck.enabled,
                delayPeriod:
                    alarm.boosterSet.postDismissCheck.config.postDismissDelay,
                gracePeriod:
                    alarm.boosterSet.postDismissCheck.config.checkerGraceTime,
                launch_package: alarm.boosterSet.postDismissLaunch.enabled
                    ? alarm.boosterSet.postDismissLaunch.config.packageName
                    : undefined,
            });
        } catch (error) {
            console.error("Failed to dismiss alarm:", error);
            setDismissable(false);
        }
    };

    const snoozeAlarm = async () => {
        setDismissable(true);
        AlarmManager.setShowWhenLocked(false, alarm?.id);
        await scheduleSnoozedAlarm(alarm!, snoozeDuration);
        await alarmPlayer?.stop();
        await alarmPlayer?.release();
        handleSnooze({
            id: alarm!.id,
            boosterInfo: JSON.stringify(alarm!.boosterSet),
        });
    };

    useEffect(() => {
        void (async () => {
            if (alarmPlayer && alarm?.ringtone) {
                if (alarm.ringtone.uri) {
                    await alarmPlayer.setSource(alarm.ringtone.uri);
                }
                console.log("test");
                await alarmPlayer.setVibration(alarm.vibrate);
                await alarmPlayer.play();
            }
        })();
    }, [alarmPlayer, alarm]);

    return (
        <View
            style={{
                flex: 1,
                padding: 5,
                experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
            }}
        >
            <StatusBar translucent hidden />
            <View
                style={{
                    display: "flex",
                    flex: 1,
                    alignContent: "center",
                    padding: 20,
                    gap: 20,
                    backgroundColor: colors.background,
                    borderRadius: 35,
                }}
            >
                <View
                    style={{
                        flex: 4,
                        gap: 15,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <ClockText
                        variant="displayLarge"
                        style={{
                            textAlign: "center",
                        }}
                        localeOptions={{
                            locales: [],
                            options: {
                                hour: "2-digit",
                                hour12: true,
                                minute: "2-digit",
                            },
                        }}
                    />
                    <Text
                        variant="headlineMedium"
                        style={{ textAlign: "center" }}
                    >
                        {alarm?.name}
                    </Text>
                </View>
                <View
                    style={{
                        flex: 5,
                        justifyContent: "center",
                    }}
                >
                    <IconButton
                        icon="alarm-off"
                        size={42}
                        mode="outlined"
                        containerColor={colors.background}
                        iconColor={colors.onBackground}
                        style={{
                            alignSelf: "center",
                            width: 68,
                            height: 68,
                            borderRadius: 42,
                            borderColor: colors.primary,
                            borderWidth: 2,
                            display: isPuzzleVisible ? "none" : "flex",
                        }}
                        onPress={() => {
                            if (puzzlesComplete) {
                                try {
                                    void dismissAlarm();
                                } catch (error) {
                                    console.error(error);
                                }
                            } else {
                                if (
                                    alarm?.puzzles.some(
                                        (val) => val.type === "nfc"
                                    )
                                ) {
                                    AlarmManager.requestKeyguardDismiss();
                                }
                                setIsPuzzleVisible(true);
                            }
                        }}
                    />
                    <PuzzleContainer
                        style={{ flex: 1 }}
                        isVisible={isPuzzleVisible}
                        onSucessAll={() => {
                            setIsPuzzleVisible(false);
                            setPuzzlesComplete(true);
                        }}
                        onPuzzleFailure={() => {
                            setIsPuzzleVisible(false);
                        }}
                        puzzles={alarm?.puzzles!}
                    />
                </View>
                <View
                    style={{
                        flex: 4,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {snoozeAvailable && (
                        <Button
                            mode="outlined"
                            icon="sleep"
                            buttonColor={colors.background}
                            textColor={colors.onBackground}
                            contentStyle={{
                                paddingVertical: 8,
                                paddingHorizontal: 16,
                            }}
                            labelStyle={{
                                fontSize: 24,
                                lineHeight: 24,
                            }}
                            style={{
                                borderWidth: 2,
                                borderColor: colors.primary,
                            }}
                            onPress={() => {
                                void snoozeAlarm();
                            }}
                        >
                            {"Snooze"}
                        </Button>
                    )}
                </View>
            </View>
        </View>
    );
}
