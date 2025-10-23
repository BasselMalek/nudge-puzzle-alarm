import { TextPuzzle } from "@/types/Puzzles";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

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
}) {
    const { onSuccess, puzzle } = props;
    const solveTarget = useMemo(
        () =>
            generateString(
                puzzle.length,
                puzzle.difficulty === 1
                    ? charsets.easy
                    : puzzle.difficulty === 2
                    ? charsets.medium
                    : charsets.hard
            ),
        [puzzle.length, puzzle.difficulty]
    );
    const [inputValue, setInputValue] = useState("");
    const { colors, roundness } = useTheme();

    useEffect(() => {
        if (inputValue === solveTarget) {
            onSuccess();
        }
    }, [inputValue, onSuccess, solveTarget]);

    return (
        <View
            style={{
                flex: 1,
                paddingTop: 20,
                gap: 30,
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
                style={{ backgroundColor: colors.elevation.level1 }}
                outlineColor={colors.onSecondaryContainer}
                outlineStyle={{ borderRadius: roundness + 5 }}
                onSubmitEditing={(e) => setInputValue(e.nativeEvent.text)}
            />
        </View>
    );
}
