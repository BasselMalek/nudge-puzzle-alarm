import { View, BackHandler, TouchableOpacity } from "react-native";
import {
    Button,
    Card,
    Icon,
    IconButton,
    Text,
    TouchableRipple,
    useTheme,
} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { parseAlarm } from "@/hooks/useAlarms";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { useSQLiteContext } from "expo-sqlite";
import * as AlarmManager from "@/modules/expo-alarm-manager";
import ClockText from "@/components/ClockText";
import TextPuzzleCard from "@/components/puzzle/TextPuzzle";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PuzzleContainer from "@/components/puzzle/PuzzleContainer";
import { format } from "date-fns";
import TextPuzzle from "@/components/puzzle/TextPuzzle";

export default function AlarmScreen() {
    const { id } = useLocalSearchParams();
    const { colors, roundness } = useTheme();
    const [alarm, setAlarm] = useState<Alarm>();
    const db = useSQLiteContext();
    const alarmAud = AlarmManager.useAlarmPlayer();
    const insets = useSafeAreaInsets();
    const [isPuzzleVisible, setIsPuzzleVisible] = useState(false);

    useEffect(() => {
        const initial = db.getFirstSync<AlarmDto>(
            "SELECT * FROM alarms WHERE id = ?",
            [id as string]
        );
        if (initial) setAlarm(parseAlarm(initial));
    }, [db, id]);

    const nav = useNavigation();

    useEffect(() => {
        const listener = nav.addListener("beforeRemove", (e) =>
            e.preventDefault()
        );
        return () => listener();
    }, [nav]);

    useEffect(() => {
        if (alarmAud && alarm?.ringtone) {
            //TODO: make it so it plays on all audio outputs. i.e if earbuds are connected it plays on both speaker/earbuds
            alarmAud.setSource(alarm.ringtone);
            // alarmAud.play();
        }
    }, [alarmAud, alarm]);

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
                    {/* <Text variant="titleLarge" style={{ textAlign: "center" }}>
                        {format(new Date(), "E, LLL d")}
                    </Text> */}
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
                        onPress={() => setIsPuzzleVisible(true)}
                    />
                    //TODO: a ScrollView with scrollTo on puzzle success will
                    probably suffice for now.
                    <PuzzleContainer
                        style={{ flex: 1 }}
                        isVisible={isPuzzleVisible}
                    >
                        <TextPuzzle />
                    </PuzzleContainer>
                </View>
                <View
                    style={{
                        flex: 4,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
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
                            setIsPuzzleVisible(false);
                        }}
                    >
                        Snooze
                    </Button>
                </View>
            </View>
        </View>
    );
}
