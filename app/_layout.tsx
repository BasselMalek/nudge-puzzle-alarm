import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        title: "Alarms",
                        contentStyle: {
                            backgroundColor: "#040406",
                            display: "flex",
                            padding: 0,
                            margin: 0,
                        },
                        headerShown: false,
                    }}
                />
            </Stack>
        </SafeAreaProvider>
    );
}
