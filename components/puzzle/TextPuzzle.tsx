import { useRef, useState } from "react";
import { View } from "react-native";
import { Card, Text, TextInput, useTheme } from "react-native-paper";

const charsets = {
    easy: "abcdefghijklmnopqrstuvwxyz0123456789",
    medium: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    hard: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.<>/?",
};

const gen = (length: number, charset: string) => {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
};

export default function TextPuzzle() {
    //TODO: implement some sort of success return mechanism.
    const solveTarget = useRef(gen(5, charsets.medium));
    const [inputValue, setInputValue] = useState("");
    const { colors, roundness } = useTheme();

    return (
        <View
            style={{
                paddingVertical: 20,
                gap: 30,
            }}
        >
            <Text variant="displayMedium" style={{ textAlign: "center" }}>
                {solveTarget.current}
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
