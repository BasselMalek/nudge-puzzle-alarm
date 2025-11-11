import { Stack } from "expo-router";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
    Button,
    MD3DarkTheme,
    MD3LightTheme,
    PaperProvider,
    Text,
} from "react-native-paper";
import { useColorScheme } from "react-native";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { lightPalette, darkPalette } from "@/constants/customTheme";
import { SQLiteProvider } from "expo-sqlite";
import AsyncStorage from "expo-sqlite/kv-store";

export const unstable_settings = {
    initialRouteName: "index",
};

console.log("NUDGE_DEBUG: Main layout launching...");

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const safeInsets = useSafeAreaInsets();
    const { theme } = useMaterial3Theme();

    let paperTheme;
    const colorSettings = AsyncStorage.getItemSync("systemColors");
    if (colorSettings === null || colorSettings === "false") {
        void AsyncStorage.setItemAsync("systemColors", "false");
        paperTheme =
            colorScheme === "dark"
                ? { ...MD3DarkTheme, colors: darkPalette.colors }
                : { ...MD3LightTheme, colors: lightPalette.colors };
    } else {
        paperTheme =
            colorScheme === "dark"
                ? { ...MD3DarkTheme, colors: theme.dark }
                : { ...MD3LightTheme, colors: theme.light };
    }

    return (
        <SafeAreaProvider>
            <PaperProvider theme={paperTheme}>
                <SQLiteProvider databaseName="nudge_alarms.db">
                    <Stack>
                        <Stack.Screen
                            name="index"
                            options={{
                                title: "Alarms",
                                contentStyle: {
                                    display: "flex",
                                    backgroundColor:
                                        paperTheme.colors.background,
                                    paddingTop: safeInsets.top + 10,
                                    paddingLeft: safeInsets.left + 15,
                                    paddingRight: safeInsets.right + 15,
                                    paddingBottom: safeInsets.bottom + 10,
                                    gap: 10,
                                },
                                headerShown: false,
                            }}
                        />
                        <Stack.Screen
                            name="alarms/[id]"
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="settings"
                            options={{
                                headerTitle: "Settings",
                                presentation: "modal",
                                headerStyle: {
                                    backgroundColor:
                                        paperTheme.colors.background,
                                },
                                headerTintColor: paperTheme.colors.onBackground,
                                contentStyle: {
                                    display: "flex",
                                    flex: 1,
                                    backgroundColor:
                                        paperTheme.colors.background,
                                    paddingLeft: safeInsets.left + 10,
                                    paddingRight: safeInsets.right + 10,
                                    paddingBottom: safeInsets.bottom + 10,
                                    gap: 10,
                                },
                            }}
                        />
                        <Stack.Screen
                            name="settingsScreens"
                            options={{
                                headerShown: false,
                                presentation: "modal",
                                headerStyle: {
                                    backgroundColor:
                                        paperTheme.colors.background,
                                },
                                headerTintColor: paperTheme.colors.onBackground,
                                contentStyle: {
                                    display: "flex",
                                    flex: 1,
                                    backgroundColor:
                                        paperTheme.colors.background,
                                    paddingLeft: safeInsets.left + 10,
                                    paddingRight: safeInsets.right + 10,
                                    paddingBottom: safeInsets.bottom + 10,
                                    gap: 10,
                                },
                            }}
                        />
                        <Stack.Screen
                            name="alarmOptions"
                            options={{
                                headerTitle: "",
                                headerRight: () => (
                                    <Button>
                                        <Text>{"Save"}</Text>
                                    </Button>
                                ),
                                headerStyle: {
                                    backgroundColor:
                                        paperTheme.colors.background,
                                },
                                presentation: "modal",
                                headerTintColor: paperTheme.colors.onBackground,
                                contentStyle: {
                                    display: "flex",
                                    flex: 1,
                                    backgroundColor:
                                        paperTheme.colors.background,
                                    paddingTop: 10,
                                    paddingLeft: safeInsets.left + 10,
                                    paddingRight: safeInsets.right + 10,
                                    paddingBottom: safeInsets.bottom + 10,
                                    gap: 10,
                                },
                            }}
                        />
                        <Stack.Screen
                            name="boosterMiddleware"
                            options={{
                                headerShown: false,
                                contentStyle: {
                                    display: "flex",
                                    flex: 1,
                                    backgroundColor:
                                        paperTheme.colors.background,
                                    paddingTop: 10,
                                    paddingLeft: safeInsets.left + 10,
                                    paddingRight: safeInsets.right + 10,
                                    paddingBottom: safeInsets.bottom + 10,
                                    gap: 10,
                                },
                            }}
                        />
                        <Stack.Screen
                            name="onboardingScreens"
                            options={{
                                headerShown: false,
                                presentation: "modal",
                                contentStyle: {
                                    display: "flex",
                                    flex: 1,
                                    backgroundColor:
                                        paperTheme.colors.background,
                                    paddingTop: safeInsets.top + 10,
                                    paddingLeft: safeInsets.left + 10,
                                    paddingRight: safeInsets.right + 10,
                                    paddingBottom: safeInsets.bottom + 10,
                                    gap: 10,
                                },
                            }}
                        />
                    </Stack>
                </SQLiteProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
