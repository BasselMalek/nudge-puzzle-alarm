import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useImperativeHandle, forwardRef } from "react";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    interpolateColor,
    runOnJS,
} from "react-native-reanimated";

interface AnimatedIconProps {
    source: any;
    size?: number;
    color1: string;
    color2: string;
    onAnimationComplete?: () => void;
}

export interface AnimatedIconRef {
    triggerAnimation: () => void;
}

const AnimatedMaterialIcon = Animated.createAnimatedComponent(
    MaterialCommunityIcons
);

const AnimatedIcon = forwardRef<AnimatedIconRef, AnimatedIconProps>(
    ({ source, size = 24, color1, color2, onAnimationComplete }, ref) => {
        const animationProgress = useSharedValue(0);
        const scaleProgress = useSharedValue(1);

        const triggerAnimation = () => {
            animationProgress.value = 0;
            scaleProgress.value = 1;

            animationProgress.value = withSequence(
                withTiming(1, { duration: 450 }),
                withTiming(0, { duration: 450 }, (finished) => {
                    if (finished && onAnimationComplete) {
                        runOnJS(onAnimationComplete)();
                    }
                })
            );

            scaleProgress.value = withSequence(
                withTiming(1.3, { duration: 450 }),
                withTiming(1, { duration: 450 })
            );
        };

        useImperativeHandle(ref, () => ({
            triggerAnimation,
        }));

        const animatedViewStyle = useAnimatedStyle(() => {
            return {
                transform: [{ scale: scaleProgress.value }],
            };
        });

        const animatedIconStyle = useAnimatedStyle(() => {
            const currentColor = interpolateColor(
                animationProgress.value,
                [0, 1],
                [color1, color2]
            );

            return {
                color: currentColor,
            };
        });

        return (
            <Animated.View style={animatedViewStyle}>
                <AnimatedMaterialIcon
                    name={source}
                    size={size}
                    color={color1}
                    style={animatedIconStyle}
                />
            </Animated.View>
        );
    }
);

AnimatedIcon.displayName = "AnimatedIcon";

export default AnimatedIcon;
