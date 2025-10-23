import { NFCPuzzle, NFCTag } from "@/types/Puzzles";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import AnimatedIcon, { AnimatedIconRef } from "@/components/AnimatedIcon";
import { useNFCScanner } from "@/hooks/useNFCScanner";

export default function NFCPuzzleComponent(props: {
    puzzle: NFCPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const currentTagTarget = useRef(0);
    const [currentTagName, setCurrentTagName] = useState(
        puzzle.sequence.at(0)?.name
    );
    const [isError, setIsError] = useState(false);
    const { colors } = useTheme();
    const iconRef = useRef<AnimatedIconRef>(null);

    const puzzleRef = useRef(puzzle);

    useEffect(() => {
        puzzleRef.current = puzzle;
    }, [puzzle]);

    const onTagRead = useCallback((tagData: NFCTag) => {
        const currentPuzzle = puzzleRef.current;
        const targetIndex = currentTagTarget.current;
        if (tagData.id === currentPuzzle?.sequence.at(targetIndex)?.id) {
            currentTagTarget.current = targetIndex + 1;
            iconRef.current?.triggerAnimation();
        } else {
            setIsError(true);
            iconRef.current?.triggerAnimation();
        }
    }, []);

    const { startNFCScanning } = useNFCScanner(onTagRead);

    useEffect(() => {
        void startNFCScanning();
    }, [startNFCScanning]);

    return (
        <View
            style={{
                flex: 1,
                gap: 15,
                padding: 20,
                justifyContent: "center",
                overflow: "hidden",
                alignItems: "center",
            }}
        >
            <AnimatedIcon
                ref={iconRef}
                size={64}
                color1={colors.onBackground}
                color2={isError ? colors.error : colors.primary}
                source={"nfc"}
                onAnimationComplete={() => {
                    setIsError(false);
                    if (currentTagTarget.current >= puzzle!.sequence.length) {
                        onSuccess();
                    } else {
                        setCurrentTagName(
                            puzzle.sequence.at(currentTagTarget.current)?.name
                        );
                    }
                }}
            />
            <Text variant="displayMedium" style={{ textAlign: "center" }}>
                {"Scan " + currentTagName}
            </Text>
        </View>
    );
}
