import { View, ViewProps } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    withTiming,
    Easing,
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
const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function PuzzleContainer(
    props: {
        isVisible: boolean;
        puzzles: Puzzle[];
        onSucessAll: () => void;
    } & ViewProps
) {
    const { isVisible, puzzles, onSucessAll } = props;
    const { colors, roundness } = useTheme();
    const scale = useSharedValue(0);
    const animationRef = useRef<LottieView>(null);
    const borderRadius = useSharedValue(1000);
    const [isDone, setIsDone] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);
    const [indicatorDotProgress, setIndicatorDotProgress] = useState(0);
    const [currentPuzzle, setCurrentPuzzle] = useState<{
        index: number;
        puzzle: Puzzle;
    }>();

    useEffect(() => {
        if (!isDone && isVisible) {
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
        } else if (isDone && isVisible) {
            scale.value = withTiming(
                0,
                {
                    duration: 300,
                    easing: Easing.out(Easing.quad),
                },
                (finished) => {
                    if (finished) {
                        runOnJS(onSucessAll)();
                    }
                }
            );
        }
    }, [isVisible, roundness, isDone, scale, borderRadius, onSucessAll]);

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
            setIsDone(true);
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
            {
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
                            borderRadius: roundness,
                        }}
                    >
                        {
                            <LottieView
                                source={checkMarkAnimation}
                                loop={false}
                                onAnimationFinish={() => {
                                    handleNextPuzzle();
                                    setShowAnimation(false);
                                }}
                                ref={animationRef}
                                style={
                                    showAnimation && {
                                        flex: 1,
                                    }
                                }
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
                        }
                        {puzzles.map((puzzle, k) => {
                            switch (puzzle.type) {
                                case "text":
                                    return (
                                        !showAnimation &&
                                        currentPuzzle!.index === k && (
                                            <TextPuzzleComponent
                                                key={k}
                                                puzzle={puzzle}
                                                onSuccess={onSuccess}
                                            />
                                        )
                                    );
                                case "nfc":
                                    return (
                                        !showAnimation &&
                                        currentPuzzle!.index === k && (
                                            <NFCPuzzleComponent
                                                key={k}
                                                puzzle={puzzle}
                                                onSuccess={onSuccess}
                                            />
                                        )
                                    );
                                case "math":
                                    return (
                                        !showAnimation &&
                                        currentPuzzle!.index === k && (
                                            <MathPuzzleComponent
                                                key={k}
                                                puzzle={puzzle}
                                                onSuccess={onSuccess}
                                            />
                                        )
                                    );
                                case "scanner":
                                    return (
                                        !showAnimation &&
                                        currentPuzzle!.index === k && (
                                            <BarcodePuzzleComponent
                                                key={k}
                                                puzzle={puzzle}
                                                onSuccess={onSuccess}
                                            />
                                        )
                                    );
                                case "memory":
                                    return (
                                        !showAnimation &&
                                        currentPuzzle!.index === k && (
                                            <MemoryPuzzleComponent
                                                key={k}
                                                puzzle={puzzle}
                                                onSuccess={onSuccess}
                                            />
                                        )
                                    );
                                default:
                                    return;
                            }
                        })}
                    </View>
                </Card.Content>
            }
        </AnimatedCard>
    );
}
