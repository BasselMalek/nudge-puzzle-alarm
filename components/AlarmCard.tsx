import { View } from "react-native";
import { Card, Text, Switch, useTheme } from "react-native-paper";
import Tag from "./Tag";
import { DayKey, WeekdayRepeat } from "./WeekdayRepeat";

const unixIntToString = (unixMS: number) => {
    if (unixMS >= 86400000) {
        return "24h+";
    } else {
        const totalMins = Math.floor(unixMS / 1000 / 60);
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        if (hrs > 0) {
            return `${hrs}h ${mins}m`;
        } else {
            return `${mins}m`;
        }
    }
};

export default function AlarmCard(props: {
    enabled: boolean;
    alarmName?: string;
    ringTime: string;
    repeated: boolean;
    repeat: Array<DayKey>;
    onPress: () => void;
    onToggle: (enabled: boolean) => void;
}) {
    const palette = useTheme().colors;
    return (
        <Card
            style={{
                marginVertical: 5,
            }}
            onPress={props.onPress}
        >
            <Card.Content
                style={{
                    padding: 8,
                    gap: 4,
                }}
            >
                <View>
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Text variant="headlineLarge">
                            {new Date(props.ringTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                hour12: true,
                                minute: "2-digit",
                            })}
                        </Text>
                        <Switch
                            value={props.enabled}
                            onValueChange={props.onToggle}
                        />
                    </View>
                </View>
                <Text variant="titleMedium" style={{ paddingBottom: 5 }}>
                    {props.alarmName}
                </Text>
                <WeekdayRepeat
                    onSelectionChange={(selectedDays: DayKey[]) => {}}
                    startDay={"sunday"}
                    selectedDays={props.repeat}
                    onEnableChange={function (enabled: boolean): void {
                        throw new Error("Function not implemented.");
                    }}
                />
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "nowrap",
                        columnGap: 8,
                    }}
                >
                    <Tag
                        name={"barcode"}
                        size="small"
                        tagColor={palette.secondaryContainer}
                        iconColor={palette.onSecondaryContainer}
                    />
                    <Tag
                        name={"nfc"}
                        size="small"
                        tagColor={palette.secondaryContainer}
                        iconColor={palette.onSecondaryContainer}
                    />
                    <Tag
                        name={"puzzle"}
                        size="small"
                        tagColor={palette.secondaryContainer}
                        iconColor={palette.onSecondaryContainer}
                    />
                </View>
            </Card.Content>
        </Card>
    );
}
