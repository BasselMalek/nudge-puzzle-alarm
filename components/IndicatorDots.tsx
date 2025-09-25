import { ViewProps, View } from "react-native";

export default function IndicatorDots(
    props: {
        total: number;
        enabled: number;
        size: number;
        colors: {
            primary: string;
            secondary: string;
            off: string;
        };
    } & ViewProps
) {
    const { total, enabled, colors, size, style, ...viewProps } = props;

    return (
        <View
            style={[{ flexDirection: "row", gap: "5" }, style]}
            {...viewProps}
        >
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={{
                        elevation: 5,
                        borderRadius: 100,
                        height: size,
                        width: size,
                        backgroundColor:
                            index < enabled ? undefined : colors.off,
                        ...(index < enabled && {
                            experimental_backgroundImage: `linear-gradient(${colors.primary}, ${colors.secondary})`,
                        }),
                    }}
                />
            ))}
        </View>
    );
}
