import ListItem from "@/components/ListItem";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "expo-sqlite/kv-store";
import { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { useTheme, Switch } from "react-native-paper";

export default function MiscSettings() {
    useTheme();
    const [colorsM3, setColorsM3] = useState(false);
    useFocusEffect(
        useCallback(() => {
            void (async () => {
                const value = await AsyncStorage.getItemAsync("systemColors");
                setColorsM3(value === "true" ? true : false);
            })();
        }, [])
    );
    return (
        <>
            <ScrollView>
                <ListItem
                    title={"Toggle M3 Colors"}
                    desc={"Requires restarting"}
                    icon="palette"
                    rightContent={
                        <Switch
                            value={colorsM3}
                            onValueChange={(newVal) => {
                                setColorsM3(newVal);
                                void AsyncStorage.setItemAsync(
                                    "systemColors",
                                    newVal ? "true" : "false"
                                );
                            }}
                        />
                    }
                />
            </ScrollView>
        </>
    );
}
