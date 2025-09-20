import { ViewProps, View } from "react-native";

export default function IndicatorDots(
    props: {
        total: number;
        enabled: number;
        colors: {
            primary: string;
            secondary: string;
            off: string;
        };
    } & ViewProps
) {
    const { total: balls, enabled: hot, colors, style, ...viewProps } = props;

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
}
