import { View } from "react-native";
import { Card, Text, Switch, useTheme } from "react-native-paper";
import Tag from "./Tag";
import { DayKey, WeekdayRepeat } from "./WeekdayRepeat";

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
                            onValueChange={() => {
                                props.onToggle(!props.enabled);
                            }}
                        />
                    </View>
                </View>
                <Text variant="titleMedium" style={{ paddingBottom: 5 }}>
                    {props.alarmName}
                </Text>
                <WeekdayRepeat
                    enabled={props.repeated}
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
