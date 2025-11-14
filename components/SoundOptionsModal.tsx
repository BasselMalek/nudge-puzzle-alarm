import { pickAlarmTone } from "@/modules/expo-alarm-manager";
import { Alarm } from "@/types/Alarm";
import { pickAudioFile } from "@/utils/audioPickerHelpers";
import { View } from "react-native";
import { Card, Icon, useTheme, Text, Switch } from "react-native-paper";
import Modal from "react-native-modal";
import { useCallback, useEffect, useState } from "react";

export default function SoundOptionsModal(props: {
    alarm: Alarm;
    setAlarm: (alarm: Alarm) => void;
    isVisible: boolean;
    setIsVisible: (visibility: boolean) => void;
}) {
    const { colors, roundness } = useTheme();
    const { alarm, setAlarm, isVisible, setIsVisible } = props;
    const [modalVisible, setModalVisible] = useState(isVisible);

    useEffect(() => {
        setModalVisible(isVisible);
    }, [isVisible]);

    const setVis = useCallback(
        (vis: boolean) => {
            setIsVisible(vis);
        },
        [setIsVisible]
    );

    return (
        <Modal
            useNativeDriver={false}
            useNativeDriverForBackdrop={false}
            onBackdropPress={() => setVis(false)}
            onBackButtonPress={() => setVis(false)}
            isVisible={modalVisible}
            style={{
                flex: 1,
                justifyContent: "flex-end",
                marginHorizontal: 0,
                marginBottom: 0,
            }}
        >
            <View
                style={{
                    flex: 1,
                    maxHeight: "45%",
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
                                        backgroundColor: colors.onSurface,
                                        opacity: 0.2,
                                    }}
                                />
                                <Text variant="labelLarge">{"Vibration"}</Text>
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
                    onPress={() => {
                        void (async () => {
                            const uri = await pickAlarmTone(
                                alarm.ringtone.uri === "none"
                                    ? undefined
                                    : alarm.ringtone.uri!
                            );
                            if (uri !== null) {
                                if (uri.name === "") {
                                    setAlarm({
                                        ...alarm,
                                        ringtone: {
                                            name: "Silent",
                                            uri: null,
                                        },
                                    });
                                } else {
                                    setAlarm({
                                        ...alarm,
                                        ringtone: {
                                            name: uri.name,
                                            uri: uri.uri,
                                        },
                                    });
                                }
                            }
                            setVis(false);
                        })();
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
                                        backgroundColor: colors.onSurface,
                                        opacity: 0.2,
                                    }}
                                />
                                <Text variant="labelLarge">System Sounds</Text>
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
                    onPress={() => {
                        void (async () => {
                            const uri = await pickAudioFile();
                            if (uri)
                                setAlarm({
                                    ...alarm,
                                    ringtone: { name: "Music", uri },
                                });
                        })();
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
                                        backgroundColor: colors.onSurface,
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
                                        backgroundColor: colors.onSurface,
                                        opacity: 0.2,
                                    }}
                                />
                                <Text variant="labelLarge">{"Spotify"}</Text>
                            </View>
                            <Text
                                variant="bodySmall"
                                style={{
                                    color: colors.onSurface,
                                    opacity: 0.6,
                                }}
                            >
                                {"Coming Soon"}
                            </Text>
                        </View>
                    </Card.Content>
                </Card>
            </View>
        </Modal>
    );
}
