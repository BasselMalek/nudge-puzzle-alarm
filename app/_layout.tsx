import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <PaperProvider>
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            title: "Alarms",
                            contentStyle: {
                                display: "flex",
                                padding: 0,
                                margin: 0,
                            },
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="modal"
                        options={{ presentation: "modal" }}
                    />
                </Stack>
            </PaperProvider>
        </SafeAreaProvider>
    );
}
