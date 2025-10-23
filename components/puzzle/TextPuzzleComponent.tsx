import { TextPuzzle } from "@/types/Puzzles";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import CountdownTimerBadge from "./CountdownTimerBadge";

const charsets = {
    easy: "abcdefghijklmnopqrstuvwxyz0123456789",
    medium: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    hard: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>/?",
};

const generateString = (length: number, charset: string) => {
    const chars = [];
    const charsetLength = charset.length;
    for (let i = 0; i < length; i++) {
        chars.push(charset[Math.floor(Math.random() * charsetLength)]);
    }
    return chars.join("");
};

export default function TextPuzzleComponent(props: {
    puzzle: TextPuzzle;
    onSuccess: () => void;
    onFailure: () => void;
}) {
    const { onSuccess, puzzle, onFailure } = props;
    const { difficulty } = puzzle;
    const timeLimit = difficulty === 1 ? 60 : difficulty === 2 ? 45 : 30;

    const [inputValue, setInputValue] = useState("");
    const [isErrored, setIsErrored] = useState(false);
    const [solveTarget, setSolveTarget] = useState(
        generateString(
            difficulty === 1 ? 5 : difficulty === 2 ? 8 : 12,
            difficulty === 1
                ? charsets.easy
                : difficulty === 2
                ? charsets.medium
                : charsets.hard
        )
    );
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [isRunning, setIsRunning] = useState(true);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { colors, roundness } = useTheme();

    const [failedSubs, setFailedSubs] = useState(0);
    useEffect(() => {
        if (failedSubs >= 3) {
            setIsRunning(false);
            onFailure();
        }
    }, [failedSubs, onFailure]);

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsRunning(false);
            onFailure();
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isRunning, onFailure, timeRemaining]);

    useEffect(() => {
        if (isSubmitted && inputValue === solveTarget) {
            setIsRunning(false);
            onSuccess();
        } else if (
            isSubmitted &&
            inputValue.length > 0 &&
            inputValue !== solveTarget
        ) {
            setIsErrored(true);
            setTimeout(() => {
                setFailedSubs((prev) => prev + 1);
                setIsSubmitted(false);
                setIsErrored(false);
                setInputValue("");
                setSolveTarget(
                    generateString(
                        difficulty === 1 ? 5 : difficulty === 2 ? 8 : 12,
                        difficulty === 1
                            ? charsets.easy
                            : difficulty === 2
                            ? charsets.medium
                            : charsets.hard
                    )
                );
            }, 500);
        }
    }, [inputValue, onSuccess, solveTarget, difficulty, isSubmitted]);

    return (
        <View
            style={{
                flex: 1,
                paddingTop: 20,
                gap: 15,
                padding: 20,
                overflow: "hidden",
                justifyContent: "center",
            }}
        >
            <Text variant="displayMedium" style={{ textAlign: "center" }}>
                {solveTarget}
            </Text>
            <TextInput
                mode="outlined"
                label="Enter the displayed text"
                autoCapitalize={"none"}
                autoCorrect={false}
                autoComplete="off"
                // disabled={timeRemaining === 0}
                error={isErrored}
                value={inputValue}
                style={{ backgroundColor: colors.elevation.level1 }}
                outlineColor={colors.onSecondaryContainer}
                outlineStyle={{ borderRadius: roundness + 5 }}
                onChangeText={setInputValue}
                onSubmitEditing={(e) => setIsSubmitted(true)}
            />
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
                    size={35}
                />
            </View>
        </View>
    );
}
