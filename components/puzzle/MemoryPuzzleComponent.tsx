import { MemoryPuzzle } from "@/types/Puzzles";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

export default function MathPuzzleComponent(props: {
    puzzle: MemoryPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const solveTarget = useMemo(() => "hi", []);
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
                paddingVertical: 20,
                gap: 30,
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
                onChange={(e) => setInputValue(e.nativeEvent.text)}
            />
        </View>
    );
}
