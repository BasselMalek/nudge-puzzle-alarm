import { View } from "react-native";
import { Text, Card, Icon, useTheme, CardProps } from "react-native-paper";
import { ReactNode } from "react";

export default function ListItem(
    props: {
        title: string;
        size?: number;
        icon?: string;
        desc?: string;
        rightContent?: ReactNode;
    } & Omit<CardProps, "children">
) {
    const { colors } = useTheme();
    const { title, icon, desc, rightContent, size = 24 } = props;

    return (
        <Card
            onPress={props.onPress}
            style={[
                props.style,
                {
                    justifyContent: "center",
                },
            ]}
        >
            <Card.Content
                style={{
                    flex: 1,
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
                        flex: 1,
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
                    <View style={{ flex: 1 }}>
                        <Text variant="labelLarge">{title}</Text>
                        {desc !== undefined && (
                            <Text variant="bodySmall" style={{ opacity: 0.85 }}>
                                {desc}
                            </Text>
                        )}
                    </View>
                </View>
                {rightContent && (
                    <View style={{ flexShrink: 0 }}>{rightContent}</View>
                )}
            </Card.Content>
        </Card>
    );
}
