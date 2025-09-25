import { StyleProp, View, ViewProps, ViewStyle } from "react-native";
import { Text, Card, Icon, useTheme, IconButton } from "react-native-paper";

export default function ListItem(
    props: {
        title: String;
        icon: String;
        desc?: String;
        buttons?: boolean;
        buttonOneAction?: () => void;
        buttonTwoAction?: () => void;
    } & ViewProps
) {
    const { colors, roundness } = useTheme();
    const { title, icon, desc, buttons, buttonOneAction, buttonTwoAction } =
        props;
    return (
        <Card style={props.style}>
            <Card.Content
                style={{
                    paddingVertical: 10,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <View
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 15,
                    }}
                >
                    <Icon source={icon} size={24} />
                    <Text>{title}</Text>
                </View>
                <View
                    style={{
                        flexDirection: "row",
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
