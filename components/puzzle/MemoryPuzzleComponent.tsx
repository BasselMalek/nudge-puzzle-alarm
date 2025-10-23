import { MemoryPuzzle } from "@/types/Puzzles";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { IconButton, useTheme, Text } from "react-native-paper";
import GamePadButton, { GamePadButtonRef } from "./GamePadButton";

const generateSequence = (length: number) => {
    const charset = "0123";
    const chars = [];
    const charsetLength = charset.length;
    for (let i = 0; i < length; i++) {
        chars.push(charset[Math.floor(Math.random() * charsetLength)]);
    }
    return chars.join("");
};

const POP_DELAY = 750;
export default function MemoryPuzzleComponent(props: {
    puzzle: MemoryPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const { difficulty } = puzzle;
    const timeLimit = difficulty === 1 ? 80 : difficulty === 2 ? 60 : 45;
    const pops = difficulty === 1 ? 5 : difficulty === 2 ? 6 : 7;
    const [inputValue, setInputValue] = useState("");
    const { colors } = useTheme();
    const [isErrored, setIsErrored] = useState(false);
    const [solveTarget, setSolveTarget] = useState(generateSequence(pops));
    const firstButtonRef = useRef<GamePadButtonRef | null>(null);
    const secondButtonRef = useRef<GamePadButtonRef | null>(null);
    const thirdButtonRef = useRef<GamePadButtonRef | null>(null);
    const fourthButtonRef = useRef<GamePadButtonRef | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isDisabled, setIsDisabled] = useState(true);

    const revealPattern = (pattern: string, start?: boolean) => {
        const refs = [
            firstButtonRef,
            secondButtonRef,
            thirdButtonRef,
            fourthButtonRef,
        ];
        setIsDisabled(true);
        setTimeout(
            () => {
                refs.at(parseInt(pattern.at(0)!))?.current?.triggerPress();
                [...pattern.slice(1)].map((v, k) => {
                    setTimeout(() => {
                        refs.at(parseInt(v))?.current?.triggerPress();
                    }, POP_DELAY * (k + 1));
                });
                setTimeout(() => {
                    setIsDisabled(false);
                }, POP_DELAY * pattern.length + 10);
            },
            start ? 1000 : 10
        );
        if (start) {
            setTimeout(() => {
                setIsRunning(true);
            }, POP_DELAY * pattern.length);
        }
    };

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (isRunning && timeRemaining === 0) {
            setIsRunning(false);
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isRunning, timeRemaining]);

    useEffect(() => {
        if (
            firstButtonRef &&
            secondButtonRef &&
            thirdButtonRef &&
            fourthButtonRef
        ) {
            revealPattern(solveTarget, true);
        }
    }, [
        firstButtonRef,
        secondButtonRef,
        thirdButtonRef,
        fourthButtonRef,
        solveTarget,
    ]);

    useEffect(() => {
        if (inputValue === solveTarget) {
            onSuccess();
        } else if (
            inputValue.length > 0 &&
            inputValue !== solveTarget.slice(0, inputValue.length)
        ) {
            console.log("ERROR");
            setIsErrored(true);
            firstButtonRef.current?.triggerPress();
            secondButtonRef.current?.triggerPress();
            thirdButtonRef.current?.triggerPress();
            fourthButtonRef.current?.triggerPress();

            setTimeout(() => {
                setIsErrored(false);
                setInputValue("");
                setSolveTarget(generateSequence(pops));
                // revealPattern(solveTarget);
            }, 1000);
        }
    }, [inputValue, onSuccess, pops, solveTarget]);

    useEffect(() => {
        if (timeRemaining === 0) {
            setIsDisabled(true);
        }
    }, [timeRemaining]);

    return (
        <View
            style={{
                paddingTop: 20,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ rotate: "45deg" }],
                gap: 15,
            }}
        >
            <View style={{ flexDirection: "row", gap: 15 }}>
                <GamePadButton
                    disabled={isDisabled}
                    ref={firstButtonRef}
                    icon={"triangle-outline"}
                    activationColor={
                        isErrored ? colors.errorContainer : "#42d742"
                    }
                    onPress={() => {
                        setInputValue(inputValue + "0");
                        console.log(inputValue);
                    }}
                />
                <GamePadButton
                    disabled={isDisabled}
                    ref={secondButtonRef}
                    icon={"circle-outline"}
                    activationColor={
                        isErrored ? colors.errorContainer : "#d74242"
                    }
                    onPress={() => {
                        setInputValue(inputValue + "1");
                        console.log(inputValue);
                    }}
                />
            </View>
            <View style={{ flexDirection: "row", gap: 15 }}>
                <GamePadButton
                    disabled={isDisabled}
                    ref={fourthButtonRef}
                    icon={"square-outline"}
                    activationColor={
                        isErrored ? colors.errorContainer : "#d7d742"
                    }
                    onPress={() => {
                        setInputValue(inputValue + "3");
                        console.log(inputValue);
                    }}
                />
                <GamePadButton
                    disabled={isDisabled}
                    ref={thirdButtonRef}
                    icon={"window-close"}
                    activationColor={
                        isErrored ? colors.errorContainer : "#4242d7"
                    }
                    onPress={() => {
                        setInputValue(inputValue + "2");
                        console.log(inputValue);
                    }}
                />
            </View>
            <View style={{ position: "absolute", gap: 15, right: 5 }}>
                <View
                    style={{
                        borderRadius: 100,
                        transform: [{ rotate: "-45deg" }],
                        elevation: 5,
                        height: 50,
                        width: 50,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <IconButton
                        style={{
                            height: 50,
                            width: 50,
                            borderRadius: 100,
                        }}
                        disabled={isDisabled}
                        icon={"restore"}
                        mode="contained"
                        onPress={() => {
                            setInputValue("");
                            revealPattern(solveTarget);
                        }}
                    />
                </View>
                <View
                    style={{
                        backgroundColor: colors.surfaceVariant,
                        borderRadius: 100,
                        transform: [{ rotate: "-45deg" }],
                        elevation: 5,
                        height: 50,
                        width: 50,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <View
                        style={{
                            borderRadius: 100,
                            borderWidth: 2,
                            borderColor:
                                timeRemaining < 11 ? "#d74242" : colors.primary,
                            height: 40,
                            width: 40,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text
                            style={{
                                color:
                                    timeRemaining < 11
                                        ? "#d74242"
                                        : colors.primary,
                            }}
                        >
                            {timeRemaining}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
