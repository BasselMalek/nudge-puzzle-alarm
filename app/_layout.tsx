import { Stack } from "expo-router";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { useColorScheme } from "react-native";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import * as SQL from "expo-sqlite";

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
                <SQL.SQLiteProvider
                    databaseName="nudge_alarms.db"
                    // onInit={async (db) => {
                    //     db.runAsync(
                    //         "CREATE TABLE IF NOT EXISTS alarms ( id TEXT PRIMARY KEY, name TEXT NOT NULL, ring_time TEXT NOT NULL, repeat BOOLEAN NOT NULL DEFAULT 0, repeat_days TEXT, puzzles TEXT, power_ups TEXT, is_enabled BOOLEAN NOT NULL DEFAULT 1, last_modified DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);"
                    //     );
                    // }}
                >
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
                            name="themeDisplay"
                            options={{ presentation: "modal" }}
                        />
                        <Stack.Screen
                            name="settings"
                            options={{
                                headerTitle: "",
                                title: "Settings",
                                presentation: "modal",
                                headerStyle: {
                                    backgroundColor:
                                        paperTheme.colors.background,
                                },
                                headerTintColor: paperTheme.colors.onBackground,
                                contentStyle: {
                                    display: "flex",
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
                            name="alarmOptions"
                            options={{
                                headerTitle: "",
                                headerStyle: {
                                    backgroundColor:
                                        paperTheme.colors.background,
                                },
                                presentation: "modal",
                                headerTintColor: paperTheme.colors.onBackground,
                                contentStyle: {
                                    display: "flex",
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
                    </Stack>
                </SQL.SQLiteProvider>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
