import { useFocusEffect } from "expo-router";
import AsyncStorage from "expo-sqlite/kv-store";
import { useCallback, useState } from "react";
import { View, ScrollView } from "react-native";
import { Card, useTheme, Text, Switch, Icon } from "react-native-paper";

export default function MiscSettings() {
    const { colors } = useTheme();
    const [colorsM3, setColorsM3] = useState(false);
    useFocusEffect(
        useCallback(() => {
            AsyncStorage.getItemAsync("systemColors").then((value) => {
                setColorsM3(value === "true" ? true : false);
            });
        }, [])
    );
    return (
        <>
            <ScrollView>
                <Card>
                    <Card.Content
                        style={{
                            height: "100%",
                            alignItems: "center",
                            paddingVertical: 10,
                            flexDirection: "row",
                            justifyContent: "space-between",
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <Icon source={"palette"} size={24} />
                            <View
                                style={{
                                    width: 1,
                                    height: 24,
                                    backgroundColor: colors.onSurface,
                                    opacity: 0.2,
                                }}
                            />
                            <View>
                                <Text variant="labelLarge">
                                    {"Toggle M3 Colors"}
                                </Text>
                                <Text
                                    variant="bodySmall"
                                    style={{ opacity: 0.85 }}
                                >
                                    {"Requires restarting"}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            <Switch
                                value={colorsM3}
                                onValueChange={(newVal) => {
                                    setColorsM3(newVal);
                                    AsyncStorage.setItemAsync(
                                        "systemColors",
                                        newVal ? "true" : "false"
                                    );
                                }}
                            />
                        </View>
                    </Card.Content>
                </Card>
            </ScrollView>
        </>
    );
}
