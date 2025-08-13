import { FlatList, View } from "react-native";
import {
    useTheme,
    Text,
    Card,
    Icon,
    TextInput,
    FAB,
    Checkbox,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { WeekdayRepeat, DayKey } from "@/components/WeekdayRepeat";
import CarouselCard from "@/components/CarouselCard";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";

export default function AlarmOptions() {
    const palette = useTheme().colors;
    const insets = useSafeAreaInsets();
    const id = useLocalSearchParams();
    //fetch(id)
    const [repeatDays, setRepeatDays] = useState<DayKey[]>([]);
    const [isRepeated, setIsRepeated] = useState(false);

    return (
        <>
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
                        {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            hour12: true,
                            minute: "2-digit",
                        })}
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
                    <TextInput
                        mode="outlined"
                        label={"Alarm Name"}
                        defaultValue={"testing"}
                    />

                    <WeekdayRepeat
                        changeable
                        enabled={isRepeated}
                        onEnableChange={setIsRepeated}
                        selectedDays={repeatDays}
                        onSelectionChange={setRepeatDays}
                        startDay={"sunday"}
                    />
                </Card.Content>
            </Card>
            <Card
                style={{
                    borderRadius: 20,
                    flex: 1,
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
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={{ width: 10 }} />
                        )}
                        style={{ height: "100%", marginHorizontal: 0 }}
                        data={[
                            {
                                title: "NFC Scan",
                                icon: "nfc",
                                desc: "Disable puzzle by scanning a linked NFC tag.",
                            },
                            {
                                title: "Barcode Scan",
                                icon: "nfc",
                                desc: "Disable puzzle by scanning a linked NFC tag.",
                            },
                            {
                                title: "Connect Puzzle",
                                icon: "nfc",
                                desc: "Disable puzzle by scanning a linked NFC tag.",
                            },
                            {
                                icon: "plus",
                            },
                        ]}
                        renderItem={({ item }) => (
                            <CarouselCard
                                title={item.title}
                                icon={item.icon}
                                desc={item.desc}
                                style={{
                                    borderRadius: 20,
                                    backgroundColor: palette.surface,
                                    flex: 1,
                                }}
                            />
                        )}
                    />
                </Card.Content>
            </Card>
            <Card
                style={{
                    borderRadius: 20,
                    flex: 1,
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
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                            <View style={{ width: 10 }} />
                        )}
                        style={{ gap: 10, height: "100%" }}
                        data={[
                            {
                                title: "NFC Scan",
                                icon: "nfc",
                                desc: "Disable puzzle by scanning a linked NFC tag.",
                            },
                            {
                                title: "Barcode Scan",
                                icon: "nfc",
                                desc: "Disable puzzle by scanning a linked NFC tag.",
                            },
                            {
                                title: "Connect Puzzle",
                                icon: "nfc",
                                desc: "Disable puzzle by scanning a linked NFC tag.",
                            },
                        ]}
                        renderItem={({ item }) => (
                            <CarouselCard
                                title={item.title}
                                icon={item.icon}
                                desc={item.desc}
                                style={{
                                    borderRadius: 20,
                                    backgroundColor: palette.surface,
                                    flex: 1,
                                }}
                            />
                        )}
                    />
                </Card.Content>
            </Card>
            <FAB
                icon={"plus"}
                style={{
                    position: "absolute",
                    bottom: insets.bottom + 20,
                    right: insets.right + 20,
                }}
                onPress={() => {}}
            />
        </>
    );
}
