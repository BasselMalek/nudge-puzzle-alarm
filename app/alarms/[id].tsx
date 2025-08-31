import { View, ScrollView } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";

export default function Settings() {
    const { id } = useLocalSearchParams();
    return (
        <>
            <StatusBar translucent />
            <Text>{id}</Text>
        </>
    );
}
