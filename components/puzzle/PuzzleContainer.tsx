import { View, ViewProps } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";
import { ReactNode, useEffect, useState } from "react";
import IndicatorDots from "@/components/IndicatorDots";
import { Puzzle } from "@/types/Puzzles";

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function PuzzleContainer(
    props: {
        isVisible: boolean;
        children: ReactNode;
        puzzles?: Puzzle[];
    } & ViewProps
) {
    const { isVisible, children } = props;
    const { colors, roundness } = useTheme();
    const scale = useSharedValue(0);
    const borderRadius = useSharedValue(1000);
    const [shouldDisplay, setShouldDisplay] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShouldDisplay(true);
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
        } else {
            setShouldDisplay(false);
        }
    }, [isVisible, roundness]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
            borderRadius: borderRadius.value,
        };
    });

    if (!shouldDisplay) {
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
                    <Text>{"Text"}</Text>
                    <IndicatorDots
                        style={{ justifyContent: "flex-end" }}
                        total={5}
                        enabled={3}
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
                    }}
                >
                    {children}
                </View>
            </Card.Content>
        </AnimatedCard>
    );
}
