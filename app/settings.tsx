import { View, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Settings() {
    return (
        <>
            <StatusBar translucent />
        </>
    );
}
