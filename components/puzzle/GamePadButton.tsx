import React, { useImperativeHandle, forwardRef } from "react";
import { Pressable, View } from "react-native";
import { Icon, useTheme } from "react-native-paper";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    withSequence,
} from "react-native-reanimated";
// import {} from "expo-ha";
export interface GamePadButtonRef {
    triggerPress: () => void;
}

interface GamePadButtonProps {
    icon: string;
    onPress: () => void;
}

const GamePadButton = forwardRef<GamePadButtonRef, GamePadButtonProps>(
    (props, ref) => {
        const { icon, onPress } = props;
        const theme = useTheme();

        const scale = useSharedValue(1);
        const opacity = useSharedValue(1);

        const triggerPressIn = () => {
            scale.value = withTiming(0.85, { duration: 100 });
            opacity.value = withTiming(0.6, { duration: 100 });
        };
        const triggerPressOut = () => {
            scale.value = withSpring(1, { damping: 20, stiffness: 1400 });
            opacity.value = withTiming(1, { duration: 100 });
            onPress();
        };

        const triggerPress = () => {
            scale.value = withSequence(
                withTiming(0.85, { duration: 100 }),
                withSpring(1, { damping: 10, stiffness: 300 })
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
        }));

        return (
            <View
                style={{
                    transform: [{ rotate: "-45deg" }],
                }}
            >
                <Pressable
                    onPressIn={triggerPressIn}
                    onPressOut={triggerPressOut}
                >
                    <Animated.View
                        style={[
                            {
                                width: 80,
                                height: 80,
                                borderRadius: 40,
                                justifyContent: "center",
                                alignItems: "center",
                                elevation: 4,
                                position: "relative",
                            },
                            {
                                backgroundColor: theme.colors.primaryContainer,
                            },
                            animatedStyle,
                        ]}
                    >
                        <Icon
                            source={icon}
                            size={36}
                            color={theme.colors.onPrimaryContainer}
                        />
                    </Animated.View>
                </Pressable>
            </View>
        );
    }
);

GamePadButton.displayName = "GamePadButton";

export default GamePadButton;
