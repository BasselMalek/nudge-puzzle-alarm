import { View, ViewProps } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from "react-native-reanimated";
import { ReactNode, useEffect, useState } from "react";

const MyBallsWasHot = (
    props: {
        balls: number;
        hot: number;
        colors: {
            primary: string;
            secondary: string;
            off: string;
        };
    } & ViewProps
) => {
    const { balls, hot, colors, style, ...viewProps } = props;

    return (
        <View
            style={[{ flexDirection: "row", gap: "5" }, style]}
            {...viewProps}
        >
            {Array.from({ length: balls }).map((_, index) => (
                <View
                    key={index}
                    style={{
                        elevation: 5,
                        borderRadius: 100,
                        height: 14,
                        width: 14,
                        backgroundColor: index < hot ? undefined : colors.off,
                        ...(index < hot && {
                            experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                        }),
                    }}
                />
            ))}
        </View>
    );
};

const AnimatedCard = Animated.createAnimatedComponent(Card);

export default function PuzzleContainer(
    props: {
        isVisible: boolean;
        children: ReactNode;
    } & ViewProps
) {
    const { isVisible, children } = props;
    const { colors, roundness } = useTheme();
    const scale = useSharedValue(0);
    const borderRadius = useSharedValue(1000);
    const [shouldDisplay, setShouldDisplay] = useState(isVisible);

    useEffect(() => {
        setShouldDisplay(true);
        scale.value = 0;
        borderRadius.value = 1000;
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
            mass: 1,
        });
        borderRadius.value = withSpring(roundness, {
            damping: 15,
            stiffness: 150,
            mass: 1,
        });
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
                    <Text>{"Text • Eazy"}</Text>
                    <MyBallsWasHot
                        style={{ justifyContent: "flex-end" }}
                        balls={5}
                        hot={3}
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
