import { Surface, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Tag(props: {
    name: any;
    tagColor: string;
    iconColor: string;
    size?: "small" | "medium" | "large";
}) {
    const size = props.size || "medium";

    const sizeConfig = {
        small: {
            dimension: 22,
            iconSize: 14,
            fontSize: 12,
            borderRadius: 4,
        },
        medium: {
            dimension: 30,
            iconSize: 18,
            fontSize: 14,
            borderRadius: 6,
        },
        large: {
            dimension: 38,
            iconSize: 22,
            fontSize: 16,
            borderRadius: 8,
        },
    };

    const config = sizeConfig[size];

    return (
        <Surface
            style={{
                borderRadius: config.borderRadius,
                width: config.dimension,
                height: config.dimension,
                backgroundColor: props.tagColor,
                alignItems: "center",
                justifyContent: "center",
            }}
            elevation={2}
        >
            {props.name.length === 1 ? (
                <Text
                    variant="labelMedium"
                    style={{
                        color: props.iconColor,
                        fontSize: config.fontSize,
                        fontWeight: "bold",
                    }}
                >
                    {props.name}
                </Text>
            ) : (
                <MaterialCommunityIcons
                    name={props.name}
                    size={config.iconSize}
                    color={props.iconColor}
                />
            )}
        </Surface>
    );
}
