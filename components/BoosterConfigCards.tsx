import { ScrollView, View } from "react-native";
import { useTheme, Switch, IconButton, Text } from "react-native-paper";
import { useCallback } from "react";
import ListItem from "./ListItem";
import { BoosterSet } from "@/types/Boosters";
import { getLaunchableApps } from "@/modules/expo-alarm-manager";

type BoosterType = keyof BoosterSet;

export default function BoosterConfiguration(props: {
    boosters: BoosterSet;
    setBoosters: (boosters: BoosterSet) => void;
}) {
    const { colors, roundness } = useTheme();
    const { boosters, setBoosters } = props;

    const updateBooster = useCallback(
        <T extends BoosterType>(type: T, updates: Partial<BoosterSet[T]>) => {
            setBoosters({
                ...boosters,
                [type]: { ...boosters[type], ...updates },
            });
        },
        [boosters, setBoosters]
    );

    const updateConfig = useCallback(
        <T extends BoosterType>(
            type: T,
            configUpdates: Partial<BoosterSet[T]["config"]>
        ) => {
            setBoosters({
                ...boosters,
                [type]: {
                    ...boosters[type],
                    config: { ...boosters[type].config, ...configUpdates },
                },
            });
        },
        [boosters, setBoosters]
    );

    const incrementValue = (
        type: BoosterType,
        field: string,
        currentValue: number | undefined,
        step: number = 1
    ) => {
        updateConfig(type, {
            [field]: (currentValue || 0) + step,
        } as any);
    };

    const decrementValue = (
        type: BoosterType,
        field: string,
        currentValue: number | undefined,
        step: number = 1,
        min: number = 0
    ) => {
        updateConfig(type, {
            [field]: Math.max(min, (currentValue || 0) - step),
        } as any);
    };

    return (
        <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
                gap: 10,
                paddingVertical: 10,
                paddingHorizontal: 3,
            }}
            fadingEdgeLength={{ start: 10, end: 10 }}
            showsVerticalScrollIndicator={false}
        >
            <ListItem
                style={{ height: 80 }}
                title="Launch App After Dismiss"
                desc="Opens an app after dismissing alarm"
                icon="launch"
                rightContent={
                    <Switch
                        value={boosters.postDismissLaunch.enabled}
                        onValueChange={(enabled) =>
                            updateBooster("postDismissLaunch", { enabled })
                        }
                    />
                }
            />
            {boosters.postDismissLaunch.enabled && (
                <View style={{ paddingHorizontal: 10 }}>
                    <ListItem
                        style={{ height: 80 }}
                        title="App"
                        desc={
                            boosters.postDismissLaunch.config.label ||
                            "Not selected"
                        }
                        rightContent={
                            <IconButton
                                icon="package-variant"
                                mode="contained"
                                size={20}
                                containerColor={colors.surfaceVariant}
                                iconColor={colors.onPrimaryContainer}
                                onPress={() => {
                                    void (async () => {
                                        const app = await getLaunchableApps();
                                        updateBooster("postDismissLaunch", {
                                            config: {
                                                label: app.label,
                                                packageName: app.packageName,
                                            },
                                        });
                                    })();
                                }}
                            />
                        }
                    />
                </View>
            )}
            <ListItem
                style={{ height: 80, opacity: 0.5 }}
                title="Post-Dismiss Check Up"
                desc="Confirms you are awake with a notification"
                icon="alarm-multiple"
                disabled
                rightContent={
                    // <Switch
                    //     value={boosters.postDismissCheck.enabled}
                    //     onValueChange={(enabled) =>
                    //         updateBooster("postDismissCheck", { enabled })
                    //     }
                    // />
                    <Text
                        style={{
                            paddingHorizontal: 5,
                            textAlignVertical: "center",
                        }}
                        variant="labelSmall"
                    >
                        {"Coming Soon"}
                    </Text>
                }
            />

            {boosters.postDismissCheck.enabled && (
                <View style={{ paddingHorizontal: 10, gap: 8 }}>
                    <ListItem
                        style={{ height: 80 }}
                        title="Post Dismiss Delay"
                        desc="Seconds"
                        rightContent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <IconButton
                                    icon="minus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        decrementValue(
                                            "postDismissCheck",
                                            "postDismissDelay",
                                            boosters.postDismissCheck.config
                                                .postDismissDelay,
                                            30
                                        )
                                    }
                                />
                                <Text
                                    variant="labelLarge"
                                    style={{
                                        minWidth: 40,
                                        textAlign: "center",
                                    }}
                                >
                                    {
                                        boosters.postDismissCheck.config
                                            .postDismissDelay
                                    }
                                </Text>
                                <IconButton
                                    icon="plus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        incrementValue(
                                            "postDismissCheck",
                                            "postDismissDelay",
                                            boosters.postDismissCheck.config
                                                .postDismissDelay,
                                            30
                                        )
                                    }
                                />
                            </View>
                        }
                    />

                    <ListItem
                        style={{ height: 80 }}
                        title="Grace Time"
                        desc="Seconds"
                        rightContent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <IconButton
                                    icon="minus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        decrementValue(
                                            "postDismissCheck",
                                            "checkerGraceTime",
                                            boosters.postDismissCheck.config
                                                .checkerGraceTime,
                                            15
                                        )
                                    }
                                />
                                <Text
                                    variant="labelLarge"
                                    style={{
                                        minWidth: 40,
                                        textAlign: "center",
                                    }}
                                >
                                    {
                                        boosters.postDismissCheck.config
                                            .checkerGraceTime
                                    }
                                </Text>
                                <IconButton
                                    icon="plus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        incrementValue(
                                            "postDismissCheck",
                                            "checkerGraceTime",
                                            boosters.postDismissCheck.config
                                                .checkerGraceTime,
                                            15
                                        )
                                    }
                                />
                            </View>
                        }
                    />
                </View>
            )}

            {/* Snooze Mods */}
            <ListItem
                style={{ height: 80, opacity: 0.5 }}
                title="Snooze Limitations"
                desc="Modifies snooze behavior"
                icon="timer-sand"
                rightContent={
                    // <Switch
                    //     value={boosters.snoozeMods.enabled}
                    //     onValueChange={(enabled) =>
                    //         updateBooster("snoozeMods", { enabled })
                    //     }
                    // />
                    <Text
                        style={{
                            paddingHorizontal: 5,
                            textAlignVertical: "center",
                        }}
                        variant="labelSmall"
                    >
                        {"Coming Soon"}
                    </Text>
                }
            />

            {boosters.snoozeMods.enabled && (
                <View style={{ paddingHorizontal: 10, gap: 8 }}>
                    <ListItem
                        style={{ height: 80 }}
                        title="Starting Time"
                        desc="Minutes"
                        rightContent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <IconButton
                                    icon="minus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        decrementValue(
                                            "snoozeMods",
                                            "snoozeStartingTime",
                                            boosters.snoozeMods.config
                                                .snoozeStartingTime,
                                            1,
                                            1
                                        )
                                    }
                                />
                                <Text
                                    variant="labelLarge"
                                    style={{
                                        minWidth: 40,
                                        textAlign: "center",
                                    }}
                                >
                                    {boosters.snoozeMods.config
                                        .snoozeStartingTime || 0}
                                </Text>
                                <IconButton
                                    icon="plus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        incrementValue(
                                            "snoozeMods",
                                            "snoozeStartingTime",
                                            boosters.snoozeMods.config
                                                .snoozeStartingTime
                                        )
                                    }
                                />
                            </View>
                        }
                    />

                    <ListItem
                        style={{ height: 80 }}
                        title="Max Uses"
                        desc="Maximum snooze count"
                        rightContent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <IconButton
                                    icon="minus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        decrementValue(
                                            "snoozeMods",
                                            "snoozeUses",
                                            boosters.snoozeMods.config
                                                .snoozeUses,
                                            1,
                                            1
                                        )
                                    }
                                />
                                <Text
                                    variant="labelLarge"
                                    style={{
                                        minWidth: 40,
                                        textAlign: "center",
                                    }}
                                >
                                    {boosters.snoozeMods.config.snoozeUses || 0}
                                </Text>
                                <IconButton
                                    icon="plus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        incrementValue(
                                            "snoozeMods",
                                            "snoozeUses",
                                            boosters.snoozeMods.config
                                                .snoozeUses
                                        )
                                    }
                                />
                            </View>
                        }
                    />

                    <ListItem
                        style={{ height: 80 }}
                        title="Diminishing Time"
                        desc="Minutes reduced per snooze"
                        rightContent={
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 8,
                                }}
                            >
                                <IconButton
                                    icon="minus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        decrementValue(
                                            "snoozeMods",
                                            "snoozeDimishing",
                                            boosters.snoozeMods.config
                                                .snoozeDimishing
                                        )
                                    }
                                />
                                <Text
                                    variant="labelLarge"
                                    style={{
                                        minWidth: 40,
                                        textAlign: "center",
                                    }}
                                >
                                    {boosters.snoozeMods.config
                                        .snoozeDimishing || 0}
                                </Text>
                                <IconButton
                                    icon="plus"
                                    mode="contained"
                                    size={16}
                                    containerColor={colors.elevation.level3}
                                    style={{ borderRadius: roundness }}
                                    onPress={() =>
                                        incrementValue(
                                            "snoozeMods",
                                            "snoozeDimishing",
                                            boosters.snoozeMods.config
                                                .snoozeDimishing
                                        )
                                    }
                                />
                            </View>
                        }
                    />
                </View>
            )}
        </ScrollView>
    );
}
