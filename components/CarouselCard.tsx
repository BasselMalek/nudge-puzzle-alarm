import { View } from "react-native";
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
    // onPress: Function;
}) {
    const { colors } = useTheme();
    return (
        <Card
            mode="contained"
            style={{
                borderRadius: 20,
                backgroundColor: colors.surface,
                flex: 1,
            }}
            // onPress={() => {
            //     props.onPress;
            // }}
        >
            <Card.Content
                style={{
                    paddingVertical: 20,
                    paddingHorizontal: 20,
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    rowGap: 10,
                }}
            >
                <Icon size={32} source={props.icon} />
                <Text variant="titleSmall">{props.title}</Text>
                {/* <Text variant="labelSmall">{props.desc}</Text> */}
                <View style={{ flexDirection: "row", columnGap: 10 }}>
                    <IconButton
                        style={{ borderRadius: 10 }}
                        mode="contained"
                        icon={"pencil"}
                    ></IconButton>
                    <IconButton
                        style={{ borderRadius: 10 }}
                        mode="contained"
                        icon={"delete"}
                    ></IconButton>
                </View>
            </Card.Content>
        </Card>
    );
}
