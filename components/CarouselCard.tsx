import { StyleProp, View, ViewStyle } from "react-native";
import {
    Text,
    Card,
    Icon,
    useTheme,
    Button,
    IconButton,
} from "react-native-paper";

export default function CarouselCard(props: {
    title?: String;
    icon: String;
    desc?: String;
    style: StyleProp<ViewStyle>;
    // onPress: Function;
}) {
    const { colors } = useTheme();
    return (
        <Card
            style={props.style}
            mode="contained"
            // onPress={() => {
            //     props.onPress;
            // }}
        >
            <Card.Content
                style={{
                    padding: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    rowGap: 10,
                }}
            >
                <Icon size={28} source={props.icon} color={colors.onSurface} />
                <Text variant="titleSmall" style={{ color: colors.onSurface }}>
                    {props.title}
                </Text>
                {/* <Text variant="labelSmall">{props.desc}</Text> */}
                <View style={{ flexDirection: "row", columnGap: 5 }}>
                    <IconButton
                        style={{ borderRadius: 10 }}
                        mode="contained-tonal"
                        icon={"pencil"}
                        size={16}
                    ></IconButton>
                    <IconButton
                        style={{ borderRadius: 10 }}
                        mode="contained-tonal"
                        icon={"delete"}
                        size={16}
                    ></IconButton>
                </View>
            </Card.Content>
        </Card>
    );
}
