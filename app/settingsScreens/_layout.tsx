import { Stack } from "expo-router";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { useColorScheme } from "react-native";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
export default function RootLayout() {
    const colorScheme = useColorScheme();
    const safeInsets = useSafeAreaInsets();
    const { theme } = useMaterial3Theme();
    const paperTheme =
        colorScheme === "dark"
            ? { ...MD3DarkTheme, colors: theme.dark }
            : { ...MD3LightTheme, colors: theme.light };

    return (
        <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
                <Stack
                // screenOptions={{
                //     headerShown: false,
                //     presentation: "modal",
                //     contentStyle: {
                //         display: "flex",
                //         flex: 1,
                //         backgroundColor: paperTheme.colors.background,
                //         paddingTop: safeInsets.top + 10,
                //         paddingLeft: safeInsets.left + 10,
                //         paddingRight: safeInsets.right + 10,
                //         paddingBottom: safeInsets.bottom + 10,
                //         gap: 10,
                //     },
                // }}
                >
                    <Stack.Screen
                        name="barcodeSettings"
                        options={{
                            headerTitle: "Barcode Settings",
                            presentation: "modal",
                            headerStyle: {
                                backgroundColor: paperTheme.colors.background,
                            },
                            headerTintColor: paperTheme.colors.onBackground,
                            contentStyle: {
                                display: "flex",
                                flex: 1,
                                backgroundColor: paperTheme.colors.background,
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
                            presentation: "modal",
                            headerStyle: {
                                backgroundColor: paperTheme.colors.background,
                            },
                            headerTintColor: paperTheme.colors.onBackground,
                            contentStyle: {
                                display: "flex",
                                flex: 1,
                                backgroundColor: paperTheme.colors.background,
                                paddingTop: 10,
                                paddingLeft: safeInsets.left + 10,
                                paddingRight: safeInsets.right + 10,
                                paddingBottom: safeInsets.bottom + 10,
                                gap: 10,
                            },
                        }}
                    />
                </Stack>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
