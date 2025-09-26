import { ReactNode } from "react";
import { StyleProp, View, ViewProps, ViewStyle } from "react-native";
import {
    Text,
    Card,
    Icon,
    useTheme,
    IconButton,
    CardProps,
} from "react-native-paper";
import { useReorderableDrag } from "react-native-reorderable-list";

export default function ListItem(
    props: {
        title: String;
        icon: String;
        desc?: String;
        buttons?: boolean;
        buttonOneAction?: () => void;
        buttonTwoAction?: () => void;
    } & Omit<CardProps, "children">
) {
    const { colors, roundness } = useTheme();
    const { title, icon, desc, buttons, buttonOneAction, buttonTwoAction } =
        props;
    const drag = useReorderableDrag();

    return (
        <Card onPressIn={drag}>
            <Card.Content
                style={{
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
                    <Icon source={icon} size={24} />
                    <View
                        style={{
                            width: 1,
                            height: 24,
                            backgroundColor: colors.onSurface,
                            opacity: 0.2,
                        }}
                    />
                    <Text>{title}</Text>
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
