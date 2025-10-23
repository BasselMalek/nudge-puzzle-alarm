import { NFCPuzzle, NFCTag } from "@/types/Puzzles";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import AnimatedIcon, { AnimatedIconRef } from "@/components/AnimatedIcon";
import { useNFCScanner } from "@/hooks/useNFCScanner";
import CountdownTimerBadge from "./CountdownTimerBadge";

export default function NFCPuzzleComponent(props: {
    puzzle: NFCPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const { difficulty } = puzzle;
    const timeLimit = difficulty === 1 ? 90 : difficulty === 2 ? 75 : 60;

    const currentTagTarget = useRef(0);
    const [currentTagName, setCurrentTagName] = useState(
        puzzle.sequence.at(0)?.name
    );
    const [isError, setIsError] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [isRunning, setIsRunning] = useState(true);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { colors } = useTheme();
    const iconRef = useRef<AnimatedIconRef>(null);
    const puzzleRef = useRef(puzzle);

    const onTimeout = () => {
        // To be defined later
    };

    useEffect(() => {
        puzzleRef.current = puzzle;
    }, [puzzle]);

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsRunning(false);
            onTimeout();
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isRunning, timeRemaining]);

    const onTagRead = useCallback(
        (tagData: NFCTag) => {
            if (timeRemaining === 0) return;

            const currentPuzzle = puzzleRef.current;
            const targetIndex = currentTagTarget.current;
            if (tagData.id === currentPuzzle?.sequence.at(targetIndex)?.id) {
                currentTagTarget.current = targetIndex + 1;
                iconRef.current?.triggerAnimation();
            } else {
                setIsError(true);
                iconRef.current?.triggerAnimation();
            }
        },
        [timeRemaining]
    );

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
                        setIsRunning(false);
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
            <View
                style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                }}
            >
                <CountdownTimerBadge
                    timeRemaining={timeRemaining}
                    warningThreshold={11}
                    size={40}
                />
            </View>
        </View>
    );
}
