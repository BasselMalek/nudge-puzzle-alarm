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

export default function AlarmScreen() {
    const { id } = useLocalSearchParams();
    const { colors, roundness } = useTheme();
    const [alarm, setAlarm] = useState<Alarm>();
    const db = useSQLiteContext();
    const alarmAud = AlarmManager.useAlarmPlayer();
    const insets = useSafeAreaInsets();

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
        <>
            <StatusBar translucent hidden />
            <View
                style={{
                    padding: 5,
                    backgroundColor: "transparent",
                    experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                }}
            >
                <View
                    style={{
                        display: "flex",
                        height: "100%",
                        alignContent: "center",
                        justifyContent: "flex-start",
                        paddingVertical: 150,
                        paddingHorizontal: 20,
                        gap: 230,
                        backgroundColor: colors.background,
                        borderRadius: 35,
                    }}
                >
                    <View style={{ gap: 15 }}>
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
                            variant="displaySmall"
                            style={{ textAlign: "center" }}
                        >
                            {alarm?.name}
                        </Text>
                    </View>
                    <View
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 150,
                        }}
                    >
                        {/* <IconButton
                            size={52}
                            icon={"close"}
                            iconColor={colors.background}
                            mode="contained"
                            contentStyle={{
                                experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                            }}
                        /> */}
                        <View
                            style={{
                                padding: 3,
                                borderRadius: roundness + 50,
                                experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    borderRadius: roundness + 50,
                                    padding: 10,
                                    backgroundColor: colors.background,
                                }}
                                onPress={() => {
                                    // alarmAud?.stop();
                                    // router.navigate("/");
                                }}
                                onPressOut={() => {}}
                            >
                                <Icon size={52} source="close" />
                            </TouchableOpacity>
                        </View>
                        {/* <Button
                            icon="sleep"
                            // onPress={() => BackHandler.exitApp()}
                            mode="outlined"
                            onPress={() => console.log("l")}
                            textColor={colors.background}
                            labelStyle={{ fontSize: 24, lineHeight: 24 }}
                            contentStyle={{
                                paddingVertical: 8,
                                paddingHorizontal: 12,
                                outlineColor: colors.primary,
                                experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                            }}
                        >
                            {"Snooze"}
                        </Button> */}
                        <View
                            style={{
                                padding: 3,
                                borderRadius: roundness + 20,
                                experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <TouchableOpacity
                                style={{
                                    borderRadius: roundness + 20,
                                    padding: 16,
                                    backgroundColor: colors.background,
                                    flexDirection: "row",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onPress={() => console.log("l")}
                            >
                                <Icon
                                    size={24}
                                    source="sleep"
                                    color={colors.onBackground}
                                />
                                <Text
                                    style={{
                                        fontSize: 24,
                                        lineHeight: 24,
                                        color: colors.onBackground,
                                        marginLeft: 8,
                                    }}
                                >
                                    Snooze
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </>
    );
}
