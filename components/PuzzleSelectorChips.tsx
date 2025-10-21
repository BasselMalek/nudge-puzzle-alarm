import { Puzzle } from "@/types/Puzzles";
import { FlatList } from "react-native";
import { Chip, useTheme } from "react-native-paper";

export default function PuzzleTypeChips(props: {
    value: Puzzle["type"];
    onValueChange: (puzzleType: Puzzle["type"]) => void;
}) {
    const { colors } = useTheme();
    const { value, onValueChange } = props;

    return (
        <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                gap: 10,
                paddingHorizontal: 2,
                paddingVertical: 4,
            }}
            data={[
                { type: "text", title: "Text", icon: "text-box" },
                { type: "nfc", title: "NFC", icon: "nfc" },
                { type: "math", title: "Math", icon: "calculator" },
                { type: "scanner", title: "Scanner", icon: "line-scan" },
                // { type: "memory", title: "Memory", icon: "brain" },
            ]}
            renderItem={({ item }) => (
                <Chip
                    key={item.type}
                    selected={value === item.type}
                    onPress={() => onValueChange(item.type as Puzzle["type"])}
                    icon={item.icon}
                    mode="flat"
                    showSelectedCheck={false}
                    style={{
                        backgroundColor:
                            value === item.type
                                ? colors.primaryContainer
                                : colors.elevation.level3,
                    }}
                    textStyle={{
                        color:
                            value === item.type
                                ? colors.onPrimaryContainer
                                : colors.onSurfaceVariant,
                    }}
                >
                    {item.title}
                </Chip>
            )}
        />
    );
}
