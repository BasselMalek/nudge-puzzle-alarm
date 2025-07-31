import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { useColorScheme } from "react-native";

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { theme } = useMaterial3Theme();

    const paperTheme =
        colorScheme === "dark"
            ? { ...MD3DarkTheme, colors: theme.dark }
            : { ...MD3LightTheme, colors: theme.light };
    return (
        <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            title: "Alarms",
                            contentStyle: {
                                display: "flex",
                                backgroundColor: paperTheme.colors.background,
                                padding: 0,
                                margin: 0,
                            },
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="themeDisplay"
                        options={{ presentation: "modal" }}
                    />
                    <Stack.Screen
                        name="settings"
                        options={{
                            title: "Settings",
                            presentation: "modal",
                            headerStyle: {
                                backgroundColor:
                                    paperTheme.colors.surfaceContainer,
                            },
                            headerTintColor: paperTheme.colors.onSurfaceVariant,
                            contentStyle: {
                                display: "flex",
                                backgroundColor: paperTheme.colors.background,
                                padding: 0,
                                margin: 0,
                            },
                        }}
                    />
                </Stack>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
