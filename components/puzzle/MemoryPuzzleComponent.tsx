import { MemoryPuzzle } from "@/types/Puzzles";
import { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
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

export default function MemoryPuzzleComponent(props: {
    puzzle: MemoryPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const [inputValue, setInputValue] = useState("");
    const { colors, roundness } = useTheme();
    const solveTarget = useMemo(() => generateSequence(7), []);
    const firstButtonRef = useRef<GamePadButtonRef | null>(null);
    const secondButtonRef = useRef<GamePadButtonRef | null>(null);
    const thirdButtonRef = useRef<GamePadButtonRef | null>(null);
    const fourthButtonRef = useRef<GamePadButtonRef | null>(null);

    const revealPattern = (pattern: string) => {
        console.log(pattern);

        const refs = [
            firstButtonRef,
            secondButtonRef,
            thirdButtonRef,
            fourthButtonRef,
        ];
        const time = 1000;
        refs.at(parseInt(pattern.at(0)!))?.current?.triggerPress();
        [...pattern.slice(1)].map((v, k) => {
            setTimeout(() => {
                refs.at(parseInt(v))?.current?.triggerPress();
            }, time * (k + 1));
        });
    };

    useEffect(() => {
        console.log(solveTarget);

        if (
            firstButtonRef &&
            secondButtonRef &&
            thirdButtonRef &&
            fourthButtonRef
        ) {
            revealPattern(solveTarget);
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
        }
    }, [inputValue, onSuccess, solveTarget]);

    return (
        <View
            style={{
                paddingTop: 20,
                justifyContent: "center",
                alignItems: "center",
                transform: [{ rotate: "45deg" }],
                gap: 25,
            }}
        >
            <View style={{ flexDirection: "row", gap: 25 }}>
                <GamePadButton
                    ref={firstButtonRef}
                    icon={"triangle-outline"}
                    onPress={() => {
                        setInputValue(inputValue + "0");
                        console.log(inputValue);
                    }}
                />
                <GamePadButton
                    ref={secondButtonRef}
                    icon={"circle-outline"}
                    onPress={() => {
                        setInputValue(inputValue + "1");
                        console.log(inputValue);
                    }}
                />
            </View>
            <View style={{ flexDirection: "row", gap: 25 }}>
                <GamePadButton
                    ref={fourthButtonRef}
                    icon={"square-outline"}
                    onPress={() => {
                        setInputValue(inputValue + "2");
                        console.log(inputValue);
                    }}
                />
                <GamePadButton
                    ref={thirdButtonRef}
                    icon={"window-close"}
                    onPress={() => {
                        setInputValue(inputValue + "3");
                        console.log(inputValue);
                    }}
                />
            </View>
            <View
                style={{
                    backgroundColor: colors.primaryContainer,
                    borderRadius: 100,
                    position: "absolute",
                    transform: [{ rotate: "-45deg" }],
                    elevation: 5,
                }}
            >
                <IconButton
                    icon={"restore"}
                    onPress={() => {
                        setInputValue("");
                        revealPattern(solveTarget);
                    }}
                />
            </View>
        </View>
    );
}
