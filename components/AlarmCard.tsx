import { TouchableOpacity, View } from "react-native";
import {
    Card,
    Text,
    Switch,
    useTheme,
    Button,
    FAB,
    IconButton,
    Icon,
    Surface,
} from "react-native-paper";
import Tag from "./Tag";
import { DayKey, WeekdayRepeat } from "./WeekdayRepeat";
import {
    GestureDetector,
    Gesture,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    interpolate,
} from "react-native-reanimated";
import { Alarm } from "@/types/Alarm";

export default function AlarmCard(props: {
    alarm: Alarm;
    onPress: () => void;
    onToggle: (enabled: boolean) => void;
    onDelete?: () => void;
}) {
    const { colors, roundness } = useTheme();
    const translateX = useSharedValue(0);
    const DELETE_BUTTON_WIDTH = 100;
    const SWIPE_THRESHOLD = 70;

    const panGesture = Gesture.Pan()
        .activeOffsetX([-5, 5])
        .failOffsetY([-5, 5])
        .onUpdate((event) => {
            translateX.value =
                event.translationX < 0 ? event.translationX : withSpring(0);
        })
        .onEnd((event) => {
            const shouldRevealDelete = event.translationX < -SWIPE_THRESHOLD;

            if (shouldRevealDelete) {
                translateX.value = withSpring(-DELETE_BUTTON_WIDTH);
            } else {
                translateX.value = withSpring(0);
            }
        });

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const deleteButtonAnimatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [-DELETE_BUTTON_WIDTH, -20, 0],
            [1, 0.7, 0]
        );
        return {
            opacity,
            transform: [{ translateX: translateX.value + DELETE_BUTTON_WIDTH }],
        };
    });

    const handleCardPress = () => {
        if (translateX.value < -10) {
            translateX.value = withSpring(0);
        } else {
            props.onPress();
        }
    };

    const handleDelete = () => {
        if (props.onDelete) {
            props.onDelete();
        }
        translateX.value = withSpring(0);
    };

    return (
        <GestureHandlerRootView>
            <View style={{ position: "relative" }}>
                <Animated.View
                    style={[
                        {
                            position: "absolute",
                            right: 0,
                            top: 0,
                            bottom: 0,
                            width: DELETE_BUTTON_WIDTH,
                            paddingHorizontal: 10,
                        },
                        deleteButtonAnimatedStyle,
                    ]}
                >
                    <Surface
                        style={{
                            backgroundColor: colors.error,
                            height: "100%",
                            width: "100%",
                            borderRadius: roundness + 10,
                            overflow: "hidden",
                        }}
                        elevation={4}
                    >
                        <TouchableOpacity
                            style={{
                                height: "100%",
                                width: "100%",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                            onPress={handleDelete}
                            activeOpacity={0.7}
                        >
                            <Icon
                                source="delete"
                                color={colors.onError}
                                size={24}
                            />
                        </TouchableOpacity>
                    </Surface>
                </Animated.View>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={cardAnimatedStyle}>
                        <Card
                            style={{ elevation: 4 }}
                            onPress={handleCardPress}
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
                                            {new Date(
                                                new Date().setHours(
                                                    props.alarm.ringHours,
                                                    props.alarm.ringMins
                                                )
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                hour12: true,
                                                minute: "2-digit",
                                            })}
                                        </Text>
                                        <Switch
                                            value={props.alarm.isEnabled}
                                            onValueChange={() => {
                                                props.onToggle(
                                                    !props.alarm.isEnabled
                                                );
                                            }}
                                        />
                                    </View>
                                </View>
                                <Text
                                    variant="titleMedium"
                                    style={{ paddingBottom: 5 }}
                                >
                                    {props.alarm.name}
                                </Text>
                                <WeekdayRepeat
                                    enabled={props.alarm.repeat}
                                    onSelectionChange={(
                                        selectedDays: DayKey[]
                                    ) => {}}
                                    startDay={"sunday"}
                                    selectedDays={props.alarm.repeatDays}
                                    onEnableChange={function (
                                        enabled: boolean
                                    ): void {
                                        throw new Error(
                                            "Function not implemented."
                                        );
                                    }}
                                />
                                <View
                                    style={{
                                        flexDirection: "row",
                                        flexWrap: "nowrap",
                                        columnGap: 8,
                                    }}
                                >
                                    {props.alarm.puzzles.map((puzz) => {
                                        return (
                                            <Tag
                                                name={puzz.icon}
                                                size="small"
                                                tagColor={
                                                    colors.secondaryContainer
                                                }
                                                iconColor={
                                                    colors.onSecondaryContainer
                                                }
                                            />
                                        );
                                    })}
                                </View>
                            </Card.Content>
                        </Card>
                    </Animated.View>
                </GestureDetector>
            </View>
        </GestureHandlerRootView>
    );
}
