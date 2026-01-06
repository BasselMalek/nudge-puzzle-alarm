import ListItem from "@/components/ListItem";
import { useTheme, Text } from "react-native-paper";
import { ReactNativeLegal } from "react-native-legal";
import { View, Image } from "react-native";
import * as App from "expo-application";
const imgSrc = require("@/assets/images/hourglass.png");

export default function About() {
    const { colors } = useTheme();
    return (
        <View
            style={{
                flex: 1,
                gap: 8,
            }}
        >
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    marginTop: 50,
                    marginBottom: 30,
                }}
            >
                <Image
                    source={imgSrc}
                    style={{
                        height: 150,
                        width: 150,
                    }}
                    tintColor={colors.primary}
                />
                <Text variant="displaySmall" style={{ textAlign: "center" }}>
                    {"Nudge"}
                </Text>
                <Text variant="labelLarge" style={{ textAlign: "center" }}>
                    {"v" + App.nativeApplicationVersion}
                </Text>
                <Text
                    variant="labelLarge"
                    style={{
                        marginTop: 20,
                        textAlign: "center",
                        maxWidth: 200,
                        flexWrap: "wrap",
                    }}
                >
                    {"Made by Basel, with tons of ❤ and tons more ☕"}
                </Text>
            </View>
            <ListItem
                title={"Open source licenses"}
                style={{ minHeight: 72 }}
                onPress={() =>
                    ReactNativeLegal.launchLicenseListScreen("OSS Notice")
                }
            />
        </View>
    );
}
