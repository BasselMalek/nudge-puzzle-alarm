import { View, ScrollView } from "react-native";
import {
    useTheme,
    SegmentedButtons,
    Card,
    Text,
    Button,
    Chip,
} from "react-native-paper";
import Modal from "react-native-modal";
import { useCallback, useEffect, useState } from "react";
import PuzzleTypeChips from "@/components/PuzzleSelectorChips";
import { Barcode, NFCTag, Puzzle } from "@/types/Puzzles";
import { createPuzzle } from "@/utils/puzzleFactory";
import { Alarm } from "@/types/Alarm";
import { useSQLiteContext } from "expo-sqlite";
import MosaicSelectors from "./MosaicSelectors";

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

    const [availTags, setAvailTags] = useState<NFCTag[]>([]);
    const [selectedTags, setSelectedTags] = useState<NFCTag[]>([]);
    const [availCodes, setAvailCodes] = useState<Barcode[]>([]);
    const [selectedCodes, setSelectedCodes] = useState<Barcode[]>([]);

    const db = useSQLiteContext();

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

    useEffect(() => {
        db.getAllAsync<Barcode & { type: string }>(
            "SELECT * FROM physical"
        ).then((values) => {
            setAvailTags(
                values
                    .filter((val) => val.type === "NFC")
                    .map((value) => ({
                        name: value.name,
                        id: value.id,
                    }))
            );
            setAvailCodes(
                values
                    .filter((val) => val.type === "BAR")
                    .map((value) => ({
                        name: value.name!,
                        id: value.id,
                        tech: value.tech,
                    }))
            );
        });
    }, [db]);

    const handleSave = useCallback(() => {
        let puzz = { ...puzzle };
        if (puzzle.type === "nfc") {
            puzz = { ...puzzle, sequence: selectedTags };
        }
        if (puzzle.type === "scanner") {
            puzz = { ...puzzle, sequence: selectedCodes };
        }

        if (editIndex !== undefined) {
            const newPuzzles = alarm.puzzles.map((p, i) =>
                i === editIndex ? puzz : p
            );
            setAlarm(newPuzzles);
        } else {
            const newPuzzles = [...alarm.puzzles, puzz];
            setAlarm(newPuzzles);
        }
        setVis(false);
    }, [alarm.puzzles, editIndex, puzzle, setAlarm, setVis]);
    console.log(editIndex);

    const handleTagSelection = useCallback(
        (tag: NFCTag) => {
            if (selectedTags.includes(tag)) {
                setSelectedTags(
                    selectedTags.filter((value) => {
                        value.id !== tag.id;
                    })
                );
            } else {
                setSelectedTags([...selectedTags, tag]);
            }
        },
        [selectedTags]
    );
    const handleCodeSelection = useCallback(
        (code: Barcode) => {
            if (selectedTags.includes(code)) {
                setSelectedCodes(
                    selectedCodes.filter((value) => {
                        value.id !== code.id;
                    })
                );
            } else {
                setSelectedCodes([...selectedCodes, code]);
            }
        },
        [selectedCodes]
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
                    maxHeight:
                        puzzle.type === "nfc" || puzzle.type === "scanner"
                            ? "70%"
                            : "45%",
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
                <View>
                    <PuzzleTypeChips
                        value={puzzle.type}
                        onValueChange={(newType) => {
                            setPuzzle(
                                createPuzzle(newType as Puzzle["type"], 1)
                            );
                        }}
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Card style={{ flex: 1 }}>
                        <Card.Content style={{ gap: 15 }}>
                            <View style={{ gap: 5 }}>
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
                            <View style={{ gap: 5 }}>
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
                </View>
                {puzzle.type === "nfc" && (
                    <View
                        style={{
                            flex: 1,
                            gap: 10,
                            paddingHorizontal: 10,
                        }}
                    >
                        <Text variant="titleMedium">{"Available Tags"}</Text>
                        <MosaicSelectors
                            mosaicConfig={{
                                height: 100,
                                maxWidth: 500,
                                gap: 5,
                            }}
                            totalItems={availTags}
                            renderItem={(tag) => (
                                <Chip
                                    key={tag.id}
                                    selected={selectedTags.includes(tag)}
                                    onPress={() => handleTagSelection(tag)}
                                    showSelectedOverlay={true}
                                    style={{
                                        alignSelf: "flex-start",
                                        flexShrink: 1,
                                    }}
                                >
                                    {tag.name}
                                </Chip>
                            )}
                        />
                    </View>
                )}
                {puzzle.type === "scanner" && (
                    <View
                        style={{
                            flex: 1,
                            gap: 10,
                            paddingHorizontal: 10,
                        }}
                    >
                        <Text variant="titleMedium">{"Available Codes"}</Text>
                        <MosaicSelectors
                            mosaicConfig={{
                                height: 100,
                                maxWidth: 500,
                                gap: 5,
                            }}
                            totalItems={availCodes}
                            renderItem={(tag) => (
                                <Chip
                                    key={tag.id}
                                    selected={selectedCodes.includes(tag)}
                                    onPress={() => handleCodeSelection(tag)}
                                    showSelectedOverlay={true}
                                    style={{
                                        alignSelf: "flex-start",
                                        flexShrink: 1,
                                    }}
                                >
                                    {tag.name}
                                </Chip>
                            )}
                        />
                    </View>
                )}
                <Button
                    mode="contained"
                    onPress={handleSave}
                    onLongPress={() => {
                        console.log(puzzle);
                    }}
                >
                    {"Save"}
                </Button>
            </View>
        </Modal>
    );
}
