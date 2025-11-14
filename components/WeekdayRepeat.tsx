import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { TouchableRipple, Text, useTheme, Switch } from "react-native-paper";
import Tag from "./Tag";
import { DaySet } from "@/types/DaySet";

//? while refactoring this code i remembered the time i laught at that one code base where all the type
//? annotations are :any and i understand those devs now.
type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type StartDay = 0 | 1 | 6;

export default function WeekdayRepeat(props: {
    changeable: boolean;
    repeatEnabled: boolean;
    onRepeatEnableChange?: (enabled: boolean) => void;
    dayMap: DaySet;
    onDayMapChange?: (dayMap: DaySet) => void;
    startDay: StartDay;
}) {
    const { colors } = useTheme();
    const [localDaySet, setLocalDaySet] = useState<DaySet>(props.dayMap);

    useEffect(() => {
        setLocalDaySet(props.dayMap);
    }, [props.dayMap]);

    const toggleDay = (dayIndex: DayIndex) => {
        const updated: DaySet = {
            ...localDaySet,
            [dayIndex]: {
                ...localDaySet![dayIndex],
                enabled: !localDaySet![dayIndex].enabled,
            },
        };
        setLocalDaySet(updated);
        props.onDayMapChange!(updated);
    };

    const weekOrder: DayIndex[] = Array.from(
        { length: 7 },
        (_, i) => ((props.startDay + i) % 7) as DayIndex
    );

    if (props.changeable) {
        return (
            <View>
                <View
                    style={{
                        paddingLeft: 5,
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Text variant="labelLarge">Repeat</Text>
                    <Switch
                        value={props.repeatEnabled}
                        onValueChange={() => {
                            props.onRepeatEnableChange!(!props.repeatEnabled);
                        }}
                    />
                </View>
                {props.repeatEnabled && (
                    <View
                        style={{
                            paddingHorizontal: 5,
                            paddingTop: 15,
                            flexDirection: "row",
                            justifyContent: "space-around",
                            alignItems: "center",
                        }}
                    >
                        {weekOrder.map((dayIndex) => {
                            const dayData = localDaySet[dayIndex];
                            const isSelected = dayData.enabled;

                            return (
                                <TouchableRipple
                                    key={`${dayIndex}-${localDaySet[dayIndex].enabled}`}
                                    onPress={() => toggleDay(dayIndex)}
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
                                        {dayData.letter}
                                    </Text>
                                </TouchableRipple>
                            );
                        })}
                    </View>
                )}
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
                {weekOrder.map((dayIndex) => {
                    const dayData = localDaySet[dayIndex];
                    const isSelected = dayData.enabled && props.repeatEnabled;
                    return (
                        <Tag
                            key={dayIndex}
                            size="small"
                            name={dayData.letter}
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
                })}
            </View>
        );
    }
}
