import { View, ScrollView } from "react-native";
import {
    useTheme,
    SegmentedButtons,
    Card,
    Text,
    Button,
} from "react-native-paper";
import Modal from "react-native-modal";
import { useCallback, useEffect, useState } from "react";
import PuzzleTypeChips from "@/components/PuzzleSelectorChips";
import { Puzzle } from "@/types/Puzzles";
import { createPuzzle } from "@/utils/puzzleFactory";
import { Alarm } from "@/types/Alarm";

export default function PuzzleSelectionModal(props: {
    alarm: Alarm;
    setAlarm: (puzzles: Puzzle[]) => void;
    isVisible: boolean;
    setIsVisible: (visibility: boolean) => void;
    editIndex?: number;
}) {
    const { colors, roundness } = useTheme();
    const { alarm, setAlarm, isVisible, setIsVisible, editIndex } = props;
    const [puzzle, setPuzzle] = useState<Puzzle>(createPuzzle("text", 1));
    const [modalVisible, setModalVisible] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setPuzzle(
                editIndex !== undefined
                    ? alarm.puzzles.at(editIndex)!
                    : createPuzzle("text", 1)
            );
            setModalVisible(isVisible);
        } else {
            setModalVisible(isVisible);
            setPuzzle(createPuzzle("text", 1));
        }
    }, [isVisible, editIndex, alarm.puzzles]);

    const setVis = useCallback(
        (vis: boolean) => {
            setIsVisible(vis);
        },
        [setIsVisible]
    );

    const handleSave = useCallback(() => {
        if (editIndex !== undefined) {
            const newPuzzles = alarm.puzzles.map((p, i) =>
                i === editIndex ? puzzle : p
            );
            setAlarm(newPuzzles);
        } else {
            const newPuzzles = [...alarm.puzzles, puzzle];
            setAlarm(newPuzzles);
        }
        setVis(false);
    }, [alarm.puzzles, editIndex, puzzle, setAlarm, setVis]);
    console.log(editIndex);

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
                    maxHeight: "50%",
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
                <View style={{}}>
                    <PuzzleTypeChips
                        value={puzzle.type}
                        onValueChange={(newType) => {
                            setPuzzle(createPuzzle(newType as any, 1));
                        }}
                    />
                </View>
                <ScrollView style={{ flex: 5 }}>
                    <Card style={{ marginBottom: 10 }}>
                        <Card.Content style={{ gap: 15 }}>
                            <View>
                                <Text variant="titleSmall">Difficulty</Text>
                                <SegmentedButtons
                                    value={puzzle.difficulty.toString()}
                                    onValueChange={(value) => {
                                        setPuzzle((prevPuzzle) => ({
                                            ...prevPuzzle,
                                            difficulty: parseInt(
                                                value
                                            ) as Puzzle["difficulty"],
                                        }));
                                    }}
                                    buttons={[
                                        { value: "1", label: "Easy" },
                                        { value: "2", label: "Medium" },
                                        { value: "3", label: "Hard" },
                                    ]}
                                />
                            </View>
                            <View>
                                <Text variant="titleSmall">Repetitions</Text>
                                <SegmentedButtons
                                    //TODO: implement repetitions.
                                    value={"1"}
                                    onValueChange={(value) => {
                                        console.log(
                                            "Repetitions changed to:",
                                            value
                                        );
                                    }}
                                    buttons={[
                                        { value: "1", label: "1" },
                                        { value: "2", label: "2" },
                                        { value: "3", label: "3" },
                                    ]}
                                />
                            </View>
                        </Card.Content>
                    </Card>
                </ScrollView>
                <Button mode="contained" onPress={handleSave}>
                    {"Save"}
                </Button>
            </View>
        </Modal>
    );
}
