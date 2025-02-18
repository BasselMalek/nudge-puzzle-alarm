import { Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function Tag(props: {
    name: any;
    tagColor: string;
    iconColor: string;
}) {
    return (
        <View
            style={{
                borderRadius: 5,
                maxWidth: 21,
                backgroundColor: props.tagColor,
                flex: 1,
                flexBasis: 1,
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                elevation: 5,
            }}
        >
            {props.name.length === 1 ? (
                <Text
                    style={{
                        fontWeight: "bold",
                        color: props.iconColor,
                        lineHeight: 19,
                    }}
                >
                    {props.name}
                </Text>
            ) : (
                <MaterialCommunityIcons
                    name={props.name}
                    size={16}
                    color={props.iconColor}
                />
            )}
        </View>
    );
}
