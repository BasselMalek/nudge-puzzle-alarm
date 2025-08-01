import { View, ScrollView } from "react-native";
import { useTheme, Text, Card, Icon, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { WeekdayRepeat, DayKey } from "@/components/WeekdayRepeat";

export default function AlarmModal() {
    const { id } = useLocalSearchParams();
    const palette = useTheme().colors;

    return (
        <View style={{ paddingHorizontal: 5, gap: 15 }}>
            <StatusBar translucent />

            <Card
                style={{
                    borderRadius: 20,
                    overflow: "hidden",
                }}
                elevation={4}
            >
                <LinearGradient
                    style={{
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "row",
                        gap: 15,
                        minHeight: 100,
                    }}
                    start={{ x: 0.0, y: 1.0 }}
                    end={{ y: 0.0, x: 1.0 }}
                    colors={
                        false
                            ? [palette.primary, palette.inversePrimary]
                            : [palette.onSecondary, palette.onPrimary]
                    }
                    dither
                >
                    <Icon source={"clock"} size={42} />
                    <Text
                        variant="displayMedium"
                        style={{
                            textAlign: "center",
                        }}
                    >
                        {"06:25 PM"}
                    </Text>
                </LinearGradient>
            </Card>

            <Card
                style={{
                    borderRadius: 20,
                }}
                elevation={4}
            >
                <Card.Content
                    style={{
                        gap: 20,
                        paddingVertical: 20,
                        paddingHorizontal: 20,
                    }}
                >
                    <TextInput mode="outlined" label={"Alarm Name"} />
                    <View style={{ gap: 12 }}>
                        <Text
                            variant="labelLarge"
                            style={{ textAlign: "left" }}
                        >
                            {"Repeat"}
                        </Text>
                        <WeekdayRepeat
                            enabled
                            onSelectionChange={(updated: DayKey[]) => {}}
                            startDay={"sunday"}
                            selectedDays={[]}
                        />
                    </View>
                </Card.Content>
            </Card>
        </View>
    );
}
