import { View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface CountdownTimerBadgeProps {
    timeRemaining: number;
    warningThreshold?: number;
    size?: number;
}

export default function CountdownTimerBadge({
    timeRemaining,
    warningThreshold = 11,
    size = 50,
}: CountdownTimerBadgeProps) {
    const { colors } = useTheme();
    const isWarning = timeRemaining < warningThreshold;
    const warningColor = "#d74242";
    const innerSize = size * 0.8;

    return (
        <View
            style={{
                backgroundColor: colors.surfaceVariant,
                borderRadius: 100,
                elevation: 5,
                height: size,
                width: size,
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <View
                style={{
                    borderRadius: 100,
                    borderWidth: 2,
                    borderColor: isWarning ? warningColor : colors.primary,
                    height: innerSize,
                    width: innerSize,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text
                    style={{
                        color: isWarning ? warningColor : colors.primary,
                        fontWeight: "bold",
                    }}
                >
                    {timeRemaining}
                </Text>
            </View>
        </View>
    );
}
