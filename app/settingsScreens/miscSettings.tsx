import ListItem from "@/components/ListItem";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "expo-sqlite/kv-store";
import { useCallback, useState } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import { useTheme, Switch, Text, Menu, Button } from "react-native-paper";

export default function MiscSettings() {
    const { colors } = useTheme();
    const [colorsM3, setColorsM3] = useState(false);
    const [weekStartDay, setWeekStartDay] = useState("Sunday");
    const [dayMenuVisible, setDayMenuVisible] = useState(false);
    const [upcomingAlarmNotif, setUpcomingAlarmNotif] = useState(false);
    const [themeMode, setThemeMode] = useState("system");
    const [themeMenuVisible, setThemeMenuVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            void (async () => {
                const value = await AsyncStorage.getItemAsync("systemColors");
                setColorsM3(value === "true" ? true : false);
                const weekStart = await AsyncStorage.getItemAsync(
                    "weekStartDay"
                );
                if (weekStart) setWeekStartDay(weekStart);
                const upcomingNotif = await AsyncStorage.getItemAsync(
                    "upcomingAlarmNotif"
                );
                setUpcomingAlarmNotif(upcomingNotif === "true" ? true : false);
                const themeValue = await AsyncStorage.getItemAsync("themeMode");
                if (themeValue)
                    setThemeMode(
                        themeValue.charAt(0).toUpperCase() + themeValue.slice(1)
                    );
            })();
        }, [])
    );

    return (
        <ScrollView>
            <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={{ color: colors.primary }}>
                    {"General"}
                </Text>
            </View>
            <ListItem
                title={"Week Start Day"}
                desc={"Choose which day starts the week"}
                icon="calendar-start"
                rightContent={
                    <Menu
                        mode="flat"
                        key={String(dayMenuVisible)}
                        onDismiss={() => setDayMenuVisible(false)}
                        anchor={
                            <Button
                                compact
                                icon={"chevron-down"}
                                contentStyle={{
                                    flexDirection: "row-reverse",
                                }}
                                onPress={() => setDayMenuVisible(true)}
                            >
                                {weekStartDay === "SAT"
                                    ? "Saturday"
                                    : weekStartDay === "SUN"
                                    ? "Sunday"
                                    : "Monday"}
                            </Button>
                        }
                        visible={dayMenuVisible}
                    >
                        <Menu.Item
                            title={"Saturday"}
                            onPress={() => {
                                setWeekStartDay("SAT");
                                setDayMenuVisible(false);
                                void AsyncStorage.setItemAsync(
                                    "weekStartDay",
                                    "SAT"
                                );
                            }}
                        />
                        <Menu.Item
                            title={"Sunday"}
                            onPress={() => {
                                setWeekStartDay("SUN");
                                setDayMenuVisible(false);
                                void AsyncStorage.setItemAsync(
                                    "weekStartDay",
                                    "SUN"
                                );
                            }}
                        />
                        <Menu.Item
                            title={"Monday"}
                            onPress={() => {
                                setWeekStartDay("MON");
                                setDayMenuVisible(false);
                                void AsyncStorage.setItemAsync(
                                    "weekStartDay",
                                    "MON"
                                );
                            }}
                        />
                    </Menu>
                }
                style={styles.listItem}
            />
            <ListItem
                title={"Upcoming Alarm Notification"}
                desc={"Show notification before alarm rings"}
                icon="bell-alert"
                style={styles.listItem}
                rightContent={
                    <Switch
                        value={upcomingAlarmNotif}
                        onValueChange={(newVal) => {
                            setUpcomingAlarmNotif(newVal);
                            void AsyncStorage.setItemAsync(
                                "upcomingAlarmNotif",
                                newVal ? "true" : "false"
                            );
                        }}
                    />
                }
            />
            <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={{ color: colors.primary }}>
                    {"Customization"}
                </Text>
            </View>
            <ListItem
                title={"Theme"}
                desc={"Light, Dark, or Follow System"}
                icon="theme-light-dark"
                rightContent={
                    <Menu
                        mode="flat"
                        key={String(themeMenuVisible)}
                        onDismiss={() => setThemeMenuVisible(false)}
                        anchor={
                            <Button
                                compact
                                icon={"chevron-down"}
                                contentStyle={{
                                    flexDirection: "row-reverse",
                                }}
                                onPress={() => setThemeMenuVisible(true)}
                            >
                                {themeMode}
                            </Button>
                        }
                        visible={themeMenuVisible}
                    >
                        <Menu.Item
                            title={"Light"}
                            onPress={() => {
                                setThemeMode("Light");
                                setThemeMenuVisible(false);
                                void AsyncStorage.setItemAsync(
                                    "themeMode",
                                    "light"
                                );
                            }}
                        />
                        <Menu.Item
                            title={"Dark"}
                            onPress={() => {
                                setThemeMode("Dark");
                                setThemeMenuVisible(false);
                                void AsyncStorage.setItemAsync(
                                    "themeMode",
                                    "dark"
                                );
                            }}
                        />
                        <Menu.Item
                            title={"System"}
                            onPress={() => {
                                setThemeMode("System");
                                setThemeMenuVisible(false);
                                void AsyncStorage.setItemAsync(
                                    "themeMode",
                                    "system"
                                );
                            }}
                        />
                    </Menu>
                }
                style={styles.listItem}
            />
            <ListItem
                title={"Toggle M3 Colors"}
                desc={"Requires restarting"}
                icon="palette"
                style={styles.listItem}
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
            <ListItem
                title={"Background Image"}
                desc={"Set a custom background"}
                icon="image"
                style={[styles.listItem, { opacity: 0.6 }]}
                rightContent={
                    <Text
                        variant="bodySmall"
                        style={{
                            color: colors.onSurface,
                            opacity: 0.6,
                        }}
                    >
                        {"Coming Soon"}
                    </Text>
                }
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    sectionHeader: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 8,
    },
    listItem: {
        height: 72,
        marginBottom: 12,
    },
});
