import { View, FlatList, Image } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import ListItem from "@/components/ListItem";
import { router } from "expo-router";
const imgSrc = require("@/assets/images/hourglass.png");

export default function Settings() {
    const { colors } = useTheme();
    return (
        <>
            <StatusBar translucent />
            <View
                style={{
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    gap: 5,
                    marginTop: 50,
                    marginBottom: 30,
                }}
            >
                <Image
                    source={imgSrc}
                    style={{
                        height: 100,
                        width: 100,
                    }}
                    tintColor={colors.primary}
                />
                <Text variant="displaySmall" style={{ textAlign: "center" }}>
                    {"Nudge"}
                </Text>
                <Text variant="labelSmall" style={{ textAlign: "center" }}>
                    {"Made with ❤"}
                </Text>
            </View>
            <View style={{ flex: 2 }}>
                <FlatList
                    scrollEnabled
                    contentContainerStyle={{
                        height: "100%",
                        gap: 10,
                    }}
                    data={[
                        {
                            title: "App settings",
                            desc: "Modify misc settings",
                            icon: "timer-cog-outline",
                            onPress: () => {
                                router.push("/settingsScreens/miscSettings");
                            },
                        },
                        {
                            title: "Registered NFC Tags",
                            desc: "Manage your tags",
                            icon: "nfc-search-variant",
                            onPress: () => {
                                router.push("/settingsScreens/nfcSettings");
                            },
                        },
                        {
                            title: "Registered QR/Barcodes",
                            desc: "Manage your scanned codes",
                            icon: "qrcode-edit",
                            onPress: () => {
                                router.push("/settingsScreens/barcodeSettings");
                            },
                        },
                        {
                            title: "Donate",
                            icon: "currency-usd",
                            onPress: () => {},
                        },
                        {
                            title: "About",
                            icon: "information",
                            onPress: () => {},
                        },
                    ]}
                    renderItem={({ item }) => {
                        return (
                            <ListItem
                                style={{ maxHeight: 80 }}
                                size={35}
                                icon={item.icon}
                                title={item.title}
                                desc={item.desc}
                                onPress={item.onPress}
                            />
                        );
                    }}
                />
            </View>
        </>
    );
}
