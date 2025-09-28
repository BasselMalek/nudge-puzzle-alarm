import { Stack } from "expo-router";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useColorScheme } from "react-native";
import { useTheme } from "react-native-paper";
export default function RootLayout() {
    const safeInsets = useSafeAreaInsets();
    const { colors } = useTheme();

    return (
        <SafeAreaProvider>
            <Stack
                screenOptions={{
                    headerShown: false,
                    presentation: "modal",
                    contentStyle: {
                        display: "flex",
                        flex: 1,
                        backgroundColor: colors.background,
                        paddingTop: safeInsets.top + 10,
                        paddingLeft: safeInsets.left + 10,
                        paddingRight: safeInsets.right + 10,
                        paddingBottom: safeInsets.bottom + 10,
                        gap: 10,
                    },
                }}
            />
        </SafeAreaProvider>
    );
}
