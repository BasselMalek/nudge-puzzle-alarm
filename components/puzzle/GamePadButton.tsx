import React, { useImperativeHandle, forwardRef } from "react";
import { Pressable, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
    interpolateColor,
} from "react-native-reanimated";
// import {} from "expo-ha";
export interface GamePadButtonRef {
    triggerPress: () => void;
}

interface GamePadButtonProps {
    icon: string;
    onPress: () => void;
    activationColor: string;
    disabled: boolean;
}

const GamePadButton = forwardRef<GamePadButtonRef, GamePadButtonProps>(
    (props, ref) => {
        const { icon, onPress, activationColor, disabled } = props;
        const { colors } = useTheme();

        const scale = useSharedValue(1);
        const opacity = useSharedValue(1);
        const color = useSharedValue(0);

        const triggerPressIn = () => {
            scale.value = withTiming(0.85, { duration: 100 });
            opacity.value = withTiming(0.6, { duration: 100 });
            color.value = withTiming(1, { duration: 100 });
        };

        const triggerPressOut = () => {
            scale.value = withSpring(1, { damping: 50, stiffness: 2400 });
            opacity.value = withTiming(1, { duration: 100 });
            color.value = withTiming(0, { duration: 750 });
            onPress();
        };

        const triggerPress = () => {
            scale.value = withSequence(
                withTiming(0.85, { duration: 100 }),
                withSpring(1, { damping: 50, stiffness: 2400 })
            );
            color.value = withSequence(
                withTiming(1, { duration: 100 }),
                withTiming(0, { duration: 750 })
            );
            opacity.value = withSequence(
                withTiming(0.6, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );
        };

        useImperativeHandle(ref, () => ({
            triggerPress,
        }));
        const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
            opacity: opacity.value,
            backgroundColor: interpolateColor(
                color.value,
                [0, 1],
                [colors.surfaceVariant, activationColor]
            ),
        }));
        return (
            <View style={{ transform: [{ rotate: "-45deg" }] }}>
                <Pressable
                    disabled={disabled}
                    onPressIn={triggerPressIn}
                    onPressOut={triggerPressOut}
                >
                    <Animated.View
                        style={[
                            {
                                width: 70,
                                height: 70,
                                borderRadius: 40,
                                justifyContent: "center",
                                alignItems: "center",
                                elevation: 4,
                                position: "relative",
                            },
                            animatedStyle,
                        ]}
                    >
                        <Icon source={icon} size={36} color={colors.primary} />
                    </Animated.View>
                </Pressable>
            </View>
        );
    }
);
GamePadButton.displayName = "GamePadButton";

export default GamePadButton;
