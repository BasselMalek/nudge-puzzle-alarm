import { View } from "react-native";
import { Text } from "react-native-paper";

export default function WeekdayRepeat(props: { days: string[7] }) {
    return (
        <View>
            <Text variant="labelSmall">{"S S M T W T F"}</Text>
        </View>
    );
}
