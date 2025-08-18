import React, { useState } from "react";
import { View } from "react-native";
import { TouchableRipple, Text, useTheme, Checkbox } from "react-native-paper";
import { DayKey } from "@/types/DayKey";
import Tag from "./Tag";

function WeekdayRepeat(props: {
    changeable?: boolean;
    enabled: boolean;
    onEnableChange: (enabled: boolean) => void;
    selectedDays: DayKey[];
    onSelectionChange: (selectedDays: DayKey[]) => void;
    startDay: "sunday" | "monday" | "saturday";
}) {
    const { colors } = useTheme();
    const [selected, setSelected] = useState<DayKey[]>(props.selectedDays);

    const dayConfigs: Record<DayKey, { letter: string; full: string }> = {
        sunday: { letter: "S", full: "Sunday" },
        monday: { letter: "M", full: "Monday" },
        tuesday: { letter: "T", full: "Tuesday" },
        wednesday: { letter: "W", full: "Wednesday" },
        thursday: { letter: "T", full: "Thursday" },
        friday: { letter: "F", full: "Friday" },
        saturday: { letter: "S", full: "Saturday" },
    };

    const weekOrders: Record<"sunday" | "monday" | "saturday", DayKey[]> = {
        sunday: [
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
        ],
        monday: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
        ],
        saturday: [
            "saturday",
            "sunday",
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
        ],
    };

    const toggleDay = (day: DayKey) => {
        const updated = selected.includes(day)
            ? selected.filter((d) => d !== day)
            : [...selected, day];
        setSelected(updated);
        props.onSelectionChange(updated);
    };
    if (props.changeable) {
        return (
            <View>
                <Checkbox.Item
                    labelVariant="labelLarge"
                    label="Repeat"
                    labelStyle={{ textAlign: "left" }}
                    status={props.enabled === true ? "checked" : "unchecked"}
                    onPress={() => {
                        props.onEnableChange(!props.enabled);
                    }}
                />
                {(() => {
                    if (props.enabled) {
                        return (
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-around",
                                    alignItems: "center",
                                }}
                            >
                                {(
                                    weekOrders[props.startDay] ||
                                    weekOrders.saturday
                                ).map((day: DayKey) => {
                                    const isSelected = selected.includes(day);
                                    const { letter, full } = dayConfigs[day];

                                    return (
                                        <TouchableRipple
                                            key={day}
                                            onPress={() => toggleDay(day)}
                                            style={{
                                                width: 32,
                                                height: 32,
                                                borderRadius: 6,
                                                backgroundColor: isSelected
                                                    ? colors.primaryContainer
                                                    : colors.surface,
                                                justifyContent: "center",
                                                alignItems: "center",
                                                marginHorizontal: 2,
                                                elevation: 5,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: "500",
                                                    color: isSelected
                                                        ? colors.onPrimaryContainer
                                                        : colors.onSurface,
                                                }}
                                            >
                                                {letter}
                                            </Text>
                                        </TouchableRipple>
                                    );
                                })}
                            </View>
                        );
                    }
                })()}
            </View>
        );
    } else {
        return (
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    columnGap: 8,
                }}
            >
                {(weekOrders[props.startDay] || weekOrders.saturday).map(
                    (day: DayKey) => {
                        const isSelected =
                            selected.includes(day) && props.enabled;
                        const { letter, full } = dayConfigs[day];

                        return (
                            <Tag
                                key={full}
                                size="small"
                                name={letter}
                                tagColor={
                                    isSelected
                                        ? colors.secondaryContainer
                                        : colors.surfaceDisabled
                                }
                                iconColor={
                                    isSelected
                                        ? colors.onSecondaryContainer
                                        : colors.onSurfaceDisabled
                                }
                            />
                        );
                    }
                )}
            </View>
        );
    }
}

export { WeekdayRepeat, DayKey };
