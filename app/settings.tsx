import { View, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import ListItem from "@/components/ListItem";
import { router } from "expo-router";

export default function Settings() {
    return (
        <>
            <StatusBar translucent />
            <View style={{ flex: 2 }}>
                <FlatList
                    scrollEnabled
                    contentContainerStyle={{
                        // height: "100%",
                        gap: 10,
                        paddingVertical: 10,
                    }}
                    data={[
                        {
                            title: "App settings",
                            desc: "Modify general settings",
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
                            onPress: () => {
                                router.push("/settingsScreens/about");
                            },
                        },
                    ]}
                    renderItem={({ item }) => {
                        return (
                            <ListItem
                                style={{ minHeight: 80 }}
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
