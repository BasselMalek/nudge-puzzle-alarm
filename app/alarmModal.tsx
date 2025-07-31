import { View, ScrollView } from "react-native";
import { useTheme, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";

export default function AlarmModal() {
    const { id } = useLocalSearchParams();
    return (
        <>
            <StatusBar translucent />
            <View
                style={{
                    flex: 1,
                    display: "flex",
                    gap: 10,
                }}
            >
                <Text>{"id: " + id}</Text>
            </View>
        </>
    );
}
