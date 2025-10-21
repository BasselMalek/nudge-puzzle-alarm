import { MathPuzzle } from "@/types/Puzzles";
import { getMathExpression } from "@/utils/getMathExpression";
import { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

export default function MathPuzzleComponent(props: {
    puzzle: MathPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const solveTarget = useMemo(
        () => getMathExpression(puzzle.difficulty),
        [puzzle]
    );
    const [inputValue, setInputValue] = useState("");
    const { colors, roundness } = useTheme();

    useEffect(() => {
        if (parseInt(inputValue) === solveTarget.result) {
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
                {`${solveTarget.exp} = ?`}
            </Text>
            <TextInput
                mode="outlined"
                label="Solve the equation"
                autoCapitalize={"none"}
                autoCorrect={false}
                autoComplete="off"
                keyboardType="numeric"
                style={{ backgroundColor: colors.elevation.level1 }}
                outlineColor={colors.onSecondaryContainer}
                outlineStyle={{ borderRadius: roundness + 5 }}
                onSubmitEditing={(e) => setInputValue(e.nativeEvent.text)}
            />
        </View>
    );
}
