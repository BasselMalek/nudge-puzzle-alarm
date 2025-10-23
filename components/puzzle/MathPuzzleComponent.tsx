import { MathPuzzle } from "@/types/Puzzles";
import { getMathExpression } from "@/utils/getMathExpression";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import CountdownTimerBadge from "./CountdownTimerBadge";

export default function MathPuzzleComponent(props: {
    puzzle: MathPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const { difficulty } = puzzle;
    const timeLimit = difficulty === 1 ? 60 : difficulty === 2 ? 45 : 30;

    const [solveTarget, setSolveTarget] = useState(
        getMathExpression(puzzle.difficulty)
    );
    const [inputValue, setInputValue] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isErrored, setIsErrored] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [isRunning, setIsRunning] = useState(true);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const { colors, roundness } = useTheme();

    const onTimeout = () => {
        // To be defined later
    };

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

    useEffect(() => {
        if (isSubmitted && parseInt(inputValue) === solveTarget.result) {
            setIsRunning(false);
            onSuccess();
        } else if (
            isSubmitted &&
            inputValue.length > 0 &&
            parseInt(inputValue) !== solveTarget.result
        ) {
            setIsErrored(true);
            setTimeout(() => {
                setIsSubmitted(false);
                setIsErrored(false);
                setInputValue("");
                setSolveTarget(getMathExpression(puzzle.difficulty));
            }, 500);
        }
    }, [inputValue, onSuccess, solveTarget, puzzle.difficulty, isSubmitted]);

    return (
        <View
            style={{
                flex: 1,
                gap: 10,
                padding: 20,
                overflow: "hidden",
                justifyContent: "center",
            }}
        >
            <Text variant="displayMedium" style={{ textAlign: "center" }}>
                {`${solveTarget.exp} = ?`}
            </Text>
            <TextInput
                mode="outlined"
                label="Solve the equation"
                autoCapitalize={"none"}
                autoCorrect={false}
                autoComplete="off"
                keyboardType="numeric"
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
                    // opacity: 0.5,
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
