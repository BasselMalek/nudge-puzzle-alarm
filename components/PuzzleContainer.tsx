import { View, ViewProps } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    Easing,
    runOnJS,
} from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import IndicatorDots from "@/components/IndicatorDots";
import { Puzzle } from "@/types/Puzzles";
import LottieView from "lottie-react-native";
import TextPuzzleComponent from "./puzzle/TextPuzzleComponent";
import NFCPuzzleComponent from "./puzzle/NFCPuzzleComponent";
import BarcodePuzzleComponent from "./puzzle/ScannerPuzzleComponent";
import MathPuzzleComponent from "./puzzle/MathPuzzleComponent";
import MemoryPuzzleComponent from "./puzzle/MemoryPuzzleComponent";

const checkMarkAnimation = require("@/assets/animations/Success.json");
const xMarkAnimation = require("@/assets/animations/failure.json");
const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function PuzzleContainer(
    props: {
        isVisible: boolean;
        puzzles: Puzzle[];
        onSucessAll: () => void;
        onPuzzleFailure: () => void;
    } & ViewProps
) {
    const { isVisible, puzzles, onSucessAll, onPuzzleFailure } = props;
    const { colors, roundness } = useTheme();
    const scale = useSharedValue(0);
    const borderRadius = useSharedValue(1000);
    const animationRef = useRef<LottieView>(null);
    const errorAnimationRef = useRef<LottieView>(null);
    const [showAnimation, setShowAnimation] = useState(false);
    const [showErrorAnimation, setShowErrorAnimation] = useState(false);
    const [indicatorDotProgress, setIndicatorDotProgress] = useState(0);
    const [currentPuzzle, setCurrentPuzzle] = useState<{
        index: number;
        puzzle: Puzzle;
    }>();

    useEffect(() => {
        if (isVisible) {
            scale.value = 0;
            borderRadius.value = 1000;
            scale.value = withSpring(1, {
                damping: 20,
                stiffness: 150,
                mass: 1,
            });
            borderRadius.value = withSpring(roundness, {
                damping: 15,
                stiffness: 150,
                mass: 1,
            });
        }
    }, [borderRadius, isVisible, roundness, scale]);

    useEffect(() => {
        if (puzzles && puzzles.length > 0) {
            setCurrentPuzzle({
                index: 0,
                puzzle: puzzles.at(0)!,
            });
        }
    }, [puzzles]);

    const handleNextPuzzle = () => {
        const newIndex = currentPuzzle!.index + 1;
        setIndicatorDotProgress(newIndex);
        if (newIndex >= puzzles.length) {
            scale.value = withTiming(
                0,
                {
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                },
                (finished) => {
                    if (finished) runOnJS(onSucessAll)();
                }
            );
            return;
        } else {
            setCurrentPuzzle({
                index: newIndex,
                puzzle: puzzles!.at(newIndex)!,
            });
        }
    };

    const onSuccess = () => {
        setShowAnimation(true);
        if (animationRef.current) {
            animationRef.current.play();
        }
    };

    const onFailure = () => {
        setShowErrorAnimation(true);
        if (errorAnimationRef.current) {
            errorAnimationRef.current.play();
        }
    };

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            borderRadius: borderRadius.value,
        };
    });

    if (!isVisible) {
        return null;
    }

    return (
        <AnimatedCard elevation={1} style={[animatedStyle, props.style]}>
            <Card.Content
                style={{
                    padding: 10,
                    flexDirection: "column",
                    height: "100%",
                    gap: 20,
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text>
                        {currentPuzzle!.puzzle.type === "nfc"
                            ? "NFC"
                            : currentPuzzle!.puzzle.type
                                  .charAt(0)
                                  .toUpperCase() +
                              currentPuzzle!.puzzle.type.slice(1)}
                    </Text>
                    <IndicatorDots
                        style={{ justifyContent: "flex-end" }}
                        total={puzzles.length}
                        size={14}
                        enabled={indicatorDotProgress}
                        colors={{
                            off: colors.elevation.level5,
                            primary: colors.primary,
                            secondary: colors.secondary,
                        }}
                    />
                </View>
                <View
                    style={{
                        flex: 1,
                        borderWidth: 2,
                        borderColor: colors.primary,
                        borderRadius: roundness + 5,
                        overflow: "hidden",
                    }}
                >
                    <LottieView
                        source={checkMarkAnimation}
                        loop={false}
                        onAnimationFinish={() => {
                            handleNextPuzzle();
                            setShowAnimation(false);
                        }}
                        ref={animationRef}
                        style={{
                            flex: 1,
                            display: showAnimation ? "flex" : "none",
                        }}
                        colorFilters={[
                            {
                                keypath: "check",
                                color: colors.primary,
                            },
                            {
                                keypath: "circle",
                                color: colors.primary,
                            },
                        ]}
                    />
                    <LottieView
                        source={xMarkAnimation}
                        loop={false}
                        onAnimationFinish={() => {
                            setShowErrorAnimation(false);
                            scale.value = withTiming(
                                0,
                                {
                                    duration: 300,
                                    easing: Easing.out(Easing.quad),
                                },
                                (finished) => {
                                    if (finished) runOnJS(onPuzzleFailure)();
                                }
                            );
                        }}
                        ref={errorAnimationRef}
                        style={{
                            margin: 10,
                            flex: 1,
                            display: showErrorAnimation ? "flex" : "none",
                        }}
                        colorFilters={[
                            {
                                keypath: "Linha 384",
                                color: colors.error,
                            },
                            {
                                keypath: "Linha 383",
                                color: colors.error,
                            },
                            {
                                keypath: "Elipse 98",
                                color: colors.error,
                            },
                        ]}
                    />
                    {puzzles.map((puzzle, k) => {
                        const isCurrentPuzzle = currentPuzzle!.index === k;
                        const shouldShow =
                            !showAnimation &&
                            !showErrorAnimation &&
                            isCurrentPuzzle;
                        switch (puzzle.type) {
                            case "text":
                                return (
                                    shouldShow && (
                                        <TextPuzzleComponent
                                            key={k}
                                            puzzle={puzzle}
                                            onSuccess={onSuccess}
                                            onFailure={onFailure}
                                        />
                                    )
                                );
                            case "nfc":
                                return (
                                    shouldShow && (
                                        <NFCPuzzleComponent
                                            key={k}
                                            puzzle={puzzle}
                                            onSuccess={onSuccess}
                                            onFailure={onFailure}
                                        />
                                    )
                                );
                            case "math":
                                return (
                                    shouldShow && (
                                        <MathPuzzleComponent
                                            key={k}
                                            puzzle={puzzle}
                                            onSuccess={onSuccess}
                                            onFailure={onFailure}
                                        />
                                    )
                                );
                            case "scanner":
                                return (
                                    shouldShow && (
                                        <BarcodePuzzleComponent
                                            key={k}
                                            puzzle={puzzle}
                                            onSuccess={onSuccess}
                                            onFailure={onFailure}
                                        />
                                    )
                                );
                            case "memory":
                                return (
                                    shouldShow && (
                                        <MemoryPuzzleComponent
                                            key={k}
                                            puzzle={puzzle}
                                            onSuccess={onSuccess}
                                            onFailure={onFailure}
                                        />
                                    )
                                );
                            default:
                                return;
                        }
                    })}
                </View>
            </Card.Content>
        </AnimatedCard>
    );
}
