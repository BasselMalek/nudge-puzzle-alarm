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
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { WeekdayRepeat } from "@/components/WeekdayRepeat";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { TimePickerModal } from "react-native-paper-dates";
import { Alarm, AlarmDto } from "@/types/Alarm";
import { createAlarm, parseAlarm, saveAlarmDirect } from "@/hooks/useAlarms";
import { useSQLiteContext } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import Modal from "react-native-modal";
import { pickAlarmTone } from "@/modules/expo-alarm-manager";
import { pickAudioFile } from "@/utils/audioPickerHelpers";

export default function AlarmOptions() {
    const insets = useSafeAreaInsets();
    const { colors, roundness } = useTheme();
    const { id } = useLocalSearchParams();
    const db = useSQLiteContext();
    const [timePickerModalVisible, setTimePickerModalVisible] = useState(false);
    const [soundsModalVisible, setSoundsModalVisible] = useState(false);
    const [alarm, setAlarm] = useState<Alarm>(createAlarm({ name: "" }));

    useEffect(() => {
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
    }, []);

    return (
        <>
            <StatusBar translucent />
            <Card
                style={{ borderRadius: roundness + 15, overflow: "hidden" }}
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
                        gap: 10,
                        justifyContent: "center",
                        alignContent: "center",
                    }}
                >
                    <Modal
                        onBackdropPress={() => setSoundsModalVisible(false)}
                        onBackButtonPress={() => setSoundsModalVisible(false)}
                        isVisible={soundsModalVisible}
                        style={{
                            padding: 0,
                            flex: 1,
                            marginBottom: 0,
                            marginHorizontal: 0,
                            marginTop: "120%",
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                backgroundColor: colors.background,
                                borderTopLeftRadius: roundness + 10,
                                borderTopRightRadius: roundness + 10,
                                paddingVertical: 20,
                                paddingHorizontal: 10,
                                gap: 10,
                            }}
                        >
                            <View
                                style={{
                                    alignSelf: "center",
                                    width: 40,
                                    height: 4,
                                    backgroundColor: colors.onSurface,
                                    borderRadius: 2,
                                    opacity: 0.3,
                                    marginBottom: 10,
                                }}
                            />
                            <Card
                                style={{
                                    borderRadius: roundness + 10,
                                    justifyContent: "center",
                                }}
                                elevation={3}
                            >
                                <Card.Content style={{ gap: 20, padding: 20 }}>
                                    <View
                                        style={{
                                            paddingLeft: 10,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 15,
                                            }}
                                        >
                                            <Icon
                                                source="vibrate"
                                                size={24}
                                                color={colors.onSurface}
                                            />
                                            <View
                                                style={{
                                                    width: 1,
                                                    height: 24,
                                                    backgroundColor:
                                                        colors.onSurface,
                                                    opacity: 0.2,
                                                }}
                                            />
                                            <Text variant="labelLarge">
                                                Vibration
                                            </Text>
                                        </View>
                                        <Switch
                                            value={alarm.vibrate}
                                            onValueChange={(val) =>
                                                setAlarm({
                                                    ...alarm,
                                                    vibrate: val,
                                                })
                                            }
                                        />
                                    </View>
                                </Card.Content>
                            </Card>
                            <Card
                                onPress={async () => {
                                    const uri = await pickAlarmTone();
                                    if (uri)
                                        setAlarm({ ...alarm, ringtone: uri });
                                }}
                                style={{
                                    borderRadius: roundness + 10,
                                    flex: 1,
                                    justifyContent: "center",
                                }}
                                elevation={3}
                            >
                                <Card.Content style={{ gap: 20, padding: 20 }}>
                                    <View
                                        style={{
                                            paddingLeft: 10,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 15,
                                            }}
                                        >
                                            <Icon
                                                source="volume-high"
                                                size={24}
                                                color={colors.onSurface}
                                            />
                                            <View
                                                style={{
                                                    width: 1,
                                                    height: 24,
                                                    backgroundColor:
                                                        colors.onSurface,
                                                    opacity: 0.2,
                                                }}
                                            />
                                            <Text variant="labelLarge">
                                                System Sounds
                                            </Text>
                                        </View>
                                        <Icon
                                            source="chevron-right"
                                            size={28}
                                            color={colors.onSurface}
                                        />
                                    </View>
                                </Card.Content>
                            </Card>
                            <Card
                                onPress={async () => {
                                    const uri = await pickAudioFile();
                                    if (uri)
                                        setAlarm({ ...alarm, ringtone: uri });
                                }}
                                style={{
                                    borderRadius: roundness + 10,
                                    flex: 1,
                                    justifyContent: "center",
                                }}
                                elevation={3}
                            >
                                <Card.Content style={{ gap: 20, padding: 20 }}>
                                    <View
                                        style={{
                                            paddingLeft: 10,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 15,
                                            }}
                                        >
                                            <Icon
                                                source="file-music"
                                                size={24}
                                                color={colors.onSurface}
                                            />
                                            <View
                                                style={{
                                                    width: 1,
                                                    height: 24,
                                                    backgroundColor:
                                                        colors.onSurface,
                                                    opacity: 0.2,
                                                }}
                                            />
                                            <Text variant="labelLarge">
                                                File from Phone
                                            </Text>
                                        </View>
                                        <Icon
                                            source="chevron-right"
                                            size={28}
                                            color={colors.onSurface}
                                        />
                                    </View>
                                </Card.Content>
                            </Card>
                            <Card
                                disabled
                                style={{
                                    borderRadius: roundness + 10,
                                    flex: 1,
                                    justifyContent: "center",
                                    opacity: 0.5,
                                }}
                                elevation={3}
                            >
                                <Card.Content style={{ gap: 20, padding: 20 }}>
                                    <View
                                        style={{
                                            paddingLeft: 10,
                                            flexDirection: "row",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                        }}
                                    >
                                        <View
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 15,
                                            }}
                                        >
                                            <Icon
                                                source="spotify"
                                                size={24}
                                                color={colors.onSurface}
                                            />
                                            <View
                                                style={{
                                                    width: 1,
                                                    height: 24,
                                                    backgroundColor:
                                                        colors.onSurface,
                                                    opacity: 0.2,
                                                }}
                                            />
                                            <Text variant="labelLarge">
                                                Spotify Song
                                            </Text>
                                        </View>
                                        <Text
                                            variant="bodySmall"
                                            style={{
                                                color: colors.onSurface,
                                                opacity: 0.6,
                                            }}
                                        >
                                            Coming Soon
                                        </Text>
                                    </View>
                                </Card.Content>
                            </Card>
                        </View>
                    </Modal>
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
                            paddingLeft: 10,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <Text variant="labelLarge">Sound & Vibration</Text>
                        <Button
                            compact
                            icon="alarm-note"
                            mode="contained"
                            style={{ borderRadius: roundness }}
                            onPress={() => setSoundsModalVisible(true)}
                        >
                            Silent
                        </Button>
                    </View>
                    <WeekdayRepeat
                        changeable
                        enabled={alarm?.repeat}
                        onEnableChange={(enabled) =>
                            setAlarm({ ...alarm, repeat: enabled })
                        }
                        selectedDays={alarm.repeatDays}
                        onSelectionChange={(selected) =>
                            setAlarm({ ...alarm, repeatDays: selected })
                        }
                        startDay="sunday"
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
                    saveAlarmDirect(id as string, db, alarm);
                    router.navigate("/?update=true");
                }}
                onLongPress={() => console.log(alarm)}
            />
        </>
    );
}
