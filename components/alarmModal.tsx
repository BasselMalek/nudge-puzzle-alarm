import { View } from "react-native";
import { useTheme, Text, Card, Icon, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Modal from "react-native-modal";
import { WeekdayRepeat, DayKey } from "@/components/WeekdayRepeat";

export default function AlarmModal(props: {
    visible: boolean;
    onClose: () => void;
    alarmName?: string;
    ringTime: Date;
}) {
    const palette = useTheme().colors;
    const insets = useSafeAreaInsets();

    return (
        <Modal
            isVisible={props.visible}
            style={{ justifyContent: "flex-end", margin: 0 }}
            backdropOpacity={0.7}
            onBackdropPress={props.onClose}
            onSwipeComplete={props.onClose}
            swipeDirection="down"
            propagateSwipe
        >
            <View
                style={{
                    backgroundColor: palette.surface,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    minHeight: "60%",
                    maxHeight: "85%",
                    paddingBottom: insets.bottom,
                }}
            >
                <View
                    style={{
                        width: 40,
                        height: 4,
                        backgroundColor: palette.outline,
                        borderRadius: 2,
                        alignSelf: "center",
                        marginTop: 12,
                        marginBottom: 20,
                    }}
                />

                <View style={{ flex: 1, padding: 20, gap: 15 }}>
                    <Card
                        style={{
                            borderRadius: 20,
                            overflow: "hidden",
                        }}
                        elevation={4}
                    >
                        <LinearGradient
                            style={{
                                paddingVertical: 20,
                                paddingHorizontal: 20,
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "row",
                                gap: 15,
                                minHeight: 100,
                            }}
                            start={{ x: 0.0, y: 1.0 }}
                            end={{ y: 0.0, x: 1.0 }}
                            colors={
                                false
                                    ? [palette.primary, palette.inversePrimary]
                                    : [palette.onSecondary, palette.onPrimary]
                            }
                            dither
                        >
                            <Icon source={"clock"} size={42} />
                            <Text
                                variant="displayMedium"
                                style={{
                                    textAlign: "center",
                                }}
                            >
                                {props.ringTime.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    hour12: true,
                                    minute: "2-digit",
                                })}
                            </Text>
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
                                defaultValue={props.alarmName}
                            />
                            <View style={{ gap: 12 }}>
                                <Text
                                    variant="labelLarge"
                                    style={{ textAlign: "left" }}
                                >
                                    {"Repeat"}
                                </Text>
                                <WeekdayRepeat
                                    enabled
                                    onSelectionChange={(
                                        updated: DayKey[]
                                    ) => {}}
                                    startDay={"sunday"}
                                    selectedDays={[]}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </View>
            </View>
        </Modal>
    );
}
