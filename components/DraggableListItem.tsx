import { View } from "react-native";
import {
    Text,
    Card,
    Icon,
    useTheme,
    IconButton,
    CardProps,
} from "react-native-paper";
import { useReorderableDrag } from "react-native-reorderable-list";

export default function DraggableListItem(
    props: {
        title: string;
        size?: number;
        icon?: string;
        desc?: string;
        buttons?: boolean;
        buttonOneAction?: () => void;
        buttonTwoAction?: () => void;
    } & Omit<CardProps, "children">
) {
    const { colors, roundness } = useTheme();
    const {
        title,
        icon,
        desc,
        buttons,
        buttonOneAction,
        buttonTwoAction,
        size = 24,
    } = props;
    const drag = useReorderableDrag();

    return (
        <Card onLongPress={drag} onPress={props.onPress} style={props.style}>
            <Card.Content
                style={{
                    height: "100%",
                    alignItems: "center",
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                    }}
                >
                    {icon !== undefined && (
                        <>
                            <Icon source={icon} size={size} />
                            <View
                                style={{
                                    width: 1,
                                    height: size,
                                    backgroundColor: colors.onSurface,
                                    opacity: 0.2,
                                }}
                            />
                        </>
                    )}
                    <View>
                        <Text variant="labelLarge">{title}</Text>
                        {desc !== undefined && (
                            <Text variant="bodySmall" style={{ opacity: 0.85 }}>
                                {desc}
                            </Text>
                        )}
                    </View>
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        display: buttons ? "flex" : "none",
                    }}
                >
                    <IconButton
                        icon={"pencil"}
                        mode="contained"
                        style={{
                            borderRadius: roundness,
                        }}
                        size={14}
                        contentStyle={{
                            padding: 0,
                        }}
                        containerColor={colors.elevation.level5}
                        onPress={buttonOneAction}
                    />
                    <IconButton
                        icon={"delete"}
                        mode="contained"
                        style={{
                            borderRadius: roundness,
                        }}
                        size={14}
                        contentStyle={{
                            padding: 0,
                        }}
                        containerColor={colors.elevation.level5}
                        onPress={buttonTwoAction}
                    />
                </View>
            </Card.Content>
        </Card>
    );
}
