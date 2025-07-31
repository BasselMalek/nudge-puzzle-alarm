import { View, ScrollView } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function Settings() {
    const safeInsets = useSafeAreaInsets();
    const palette = useTheme().colors;

    return (
        <>
            <StatusBar translucent />
            <View
                style={{
                    flex: 1,
                    display: "flex",
                    paddingTop: safeInsets.top + 10,
                    paddingLeft: safeInsets.left + 10,
                    paddingRight: safeInsets.right + 10,
                    paddingBottom: safeInsets.bottom + 10,
                    gap: 10,
                }}
            ></View>
        </>
    );
}
