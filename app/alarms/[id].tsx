import { View, BackHandler } from "react-native";
import { Button, IconButton, Text, useTheme } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { parseAlarm } from "@/hooks/useAlarms";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { useSQLiteContext } from "expo-sqlite";
import ClockText from "@/components/ClockText";
export default function AlarmScreen() {
    const { id } = useLocalSearchParams();
    const { colors } = useTheme();
    const [alarm, setAlarm] = useState<Alarm>();
    const db = useSQLiteContext();
    useEffect(() => {
        const inital = db.getFirstSync<AlarmDto>(
            "SELECT * FROM alarms WHERE id = ?",
            [id as string]
        );
        setAlarm(parseAlarm(inital!));
    }, []);
    const nav = useNavigation();
    useEffect(() => {
        const listener = nav.addListener("beforeRemove", (e) => {
            e.preventDefault();
        });
        return () => {
            nav.removeListener("beforeRemove", listener);
        };
    }, []);
    return (
        <>
            <StatusBar translucent />
            <LinearGradient
                style={{
                    display: "flex",
                    height: "100%",
                    alignContent: "center",
                    justifyContent: "flex-start",
                    paddingVertical: 150,
                    paddingHorizontal: 10,
                    gap: 230,
                }}
                colors={[colors.primary, colors.secondaryContainer]}
            >
                <View style={{ gap: 15 }}>
                    <ClockText
                        variant="displayLarge"
                        style={{ textAlign: "center" }}
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
                    <Text variant="labelLarge" style={{ textAlign: "center" }}>
                        {id}
                    </Text>
                </View>
                <View
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 150,
                    }}
                >
                    <IconButton
                        size={52}
                        icon={"close"}
                        mode="outlined"
                        onPress={() => {}}
                        // containerColor={colors.elevation.level1}
                    />
                    <Button
                        mode="outlined"
                        icon={"sleep"}
                        onPress={() => {
                            BackHandler.exitApp();
                        }}
                        textColor={colors.onSurface}
                        labelStyle={{
                            fontSize: 24,
                            lineHeight: 24,
                        }}
                        contentStyle={{
                            paddingVertical: 8,
                            paddingHorizontal: 12,
                            borderColor: "red",
                        }}
                    >
                        {"Snooze"}
                    </Button>
                </View>
            </LinearGradient>
        </>
    );
}
