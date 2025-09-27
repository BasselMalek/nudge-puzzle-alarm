import { NFCPuzzle, NFCTag } from "@/types/Puzzles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import AnimatedIcon, { AnimatedIconRef } from "@/components/AnimatedIcon";
import { useNFCScanner } from "@/hooks/useNFCScanner";

export default function NFCPuzzleComponent(props: {
    puzzle: NFCPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const currentTagTarget = useRef(0);
    const [currentTagName, setCurrentTagName] = useState(
        puzzle.params.sequence.at(currentTagTarget.current)?.name
    );
    const [isError, setIsError] = useState(false);
    const { colors, roundness } = useTheme();
    const iconRef = useRef<AnimatedIconRef>(null);

    const onTagRead = useCallback(
        (tagData: NFCTag) => {
            if (
                tagData.id ===
                puzzle?.params.sequence.at(currentTagTarget.current)?.id
            ) {
                currentTagTarget.current = currentTagTarget.current + 1;
                iconRef.current?.triggerAnimation();
            } else {
                setIsError(true);
                iconRef.current?.triggerAnimation();
            }
        },
        [puzzle, currentTagTarget]
    );

    const { startNFCScanning, stopNFCScanning } = useNFCScanner(onTagRead);

    useEffect(() => {
        startNFCScanning();
        return () => {
            stopNFCScanning();
        };
    }, []);

    return (
        <View
            style={{
                paddingVertical: 20,
                gap: 30,
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
                    if (currentTagTarget.current >= puzzle!.params.tagCount) {
                        onSuccess();
                    } else {
                        setCurrentTagName(
                            puzzle.params.sequence.at(currentTagTarget.current)
                                ?.name
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
