import { pickAlarmTone } from "@/modules/expo-alarm-manager";
import { Alarm } from "@/types/Alarm";
import { pickAudioFile } from "@/utils/audioPickerHelpers";
import { View } from "react-native";
import { useTheme, SegmentedButtons, Card, Text } from "react-native-paper";
import Modal from "react-native-modal";
import { useCallback, useEffect, useState } from "react";
export default function PuzzleSelectionModal(props: {
    alarm: Alarm;
    setAlarm: (alarm: Alarm) => void;
    isVisible: boolean;
    setIsVisible: (visibility: boolean) => void;
}) {
    const { colors, roundness } = useTheme();
    const { alarm, setAlarm, isVisible, setIsVisible } = props;
    const [puzzleType, setPuzzleType] = useState("text");
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
                <SegmentedButtons
                    value={puzzleType}
                    onValueChange={setPuzzleType}
                    buttons={[
                        {
                            value: "text",
                            label: "Text",
                        },
                        {
                            value: "nfc",
                            label: "NFC",
                        },
                        {
                            value: "math",
                            label: "Math",
                        },
                        { value: "scanner", label: "Scanner" },
                        { value: "memory", label: "Memory" },
                    ]}
                />
                <Card style={{ flex: 1 }}>
                    <Card.Content>
                        <Text>{"Text"}</Text>
                    </Card.Content>
                </Card>
            </View>
        </Modal>
    );
}
