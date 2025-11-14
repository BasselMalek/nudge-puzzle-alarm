import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
export default function RootLayout() {
    const safeInsets = useSafeAreaInsets();
    const { colors } = useTheme();
    return (
        <SafeAreaProvider>
            <Stack>
                <Stack.Screen
                    name="barcodeSettings"
                    options={{
                        headerTitle: "Barcode Settings",
                        headerStyle: {
                            backgroundColor: colors.background,
                        },
                        headerTintColor: colors.onBackground,
                        contentStyle: {
                            display: "flex",
                            flex: 1,
                            backgroundColor: colors.background,
                            paddingTop: 10,
                            paddingLeft: safeInsets.left + 10,
                            paddingRight: safeInsets.right + 10,
                            paddingBottom: safeInsets.bottom + 10,
                            gap: 10,
                        },
                    }}
                />
                <Stack.Screen
                    name="nfcSettings"
                    options={{
                        headerTitle: "NFC Settings",
                        headerStyle: {
                            backgroundColor: colors.background,
                        },
                        headerTintColor: colors.onBackground,
                        contentStyle: {
                            display: "flex",
                            flex: 1,
                            backgroundColor: colors.background,
                            paddingTop: 10,
                            paddingLeft: safeInsets.left + 10,
                            paddingRight: safeInsets.right + 10,
                            paddingBottom: safeInsets.bottom + 10,
                            gap: 10,
                        },
                    }}
                />
                <Stack.Screen
                    name="miscSettings"
                    options={{
                        headerTitle: "App Settings",
                        headerStyle: {
                            backgroundColor: colors.background,
                        },
                        headerTintColor: colors.onBackground,
                        contentStyle: {
                            display: "flex",
                            flex: 1,
                            backgroundColor: colors.background,
                            paddingTop: 10,
                            paddingLeft: safeInsets.left + 10,
                            paddingRight: safeInsets.right + 10,
                            paddingBottom: safeInsets.bottom + 10,
                            gap: 10,
                        },
                    }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
