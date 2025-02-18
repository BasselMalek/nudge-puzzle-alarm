import { TouchableOpacity, View, Text, Switch } from "react-native";
import { palette } from "../constants/Theme";
import Tag from "./Tag";

const unixIntToString = (unixMS: number) => {
    if (unixMS >= 8.634e7) {
        return "tm";
    } else {
        const m = Math.round(unixMS / 1000 / 60);
        const hr = Math.floor(m / 60);
        return hr + "hrs " + (m - hr * 60) + "m";
    }
};

export default function first(props: {
    enabled: boolean;
    alarmName?: string;
    ringTime: Date;
    repeat: Array<String>;
    // attachedPuzzles,
    onPress: () => void;
}) {
    return (
        <>
            <View
                style={{
                    flex: 1,
                    borderRadius: 12,
                    minHeight: 150,
                    marginVertical: 5,
                    paddingVertical: 10,
                    paddingHorizontal: 8,
                    flexDirection: "column",
                    backgroundColor: palette.accent,
                    elevation: 5,
                }}
            >
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "space-around",
                        flexDirection: "row",
                        margin: 0,
                    }}
                >
                    <Text style={{ flex: 1, fontSize: 21, fontWeight: "bold" }}>
                        {props.alarmName}
                    </Text>
                    <Switch />
                </View>
                <Text style={{ flex: 1 }}>
                    {props.ringTime.toLocaleTimeString([], {
                        hour: "2-digit",
                        hour12: true,
                        minute: "2-digit",
                    }) + "\t"}
                    <Text
                        style={{
                            fontSize: 10,
                            fontWeight: "thin",
                            fontStyle: "italic",
                        }}
                    >
                        {unixIntToString(props.ringTime.getTime() - Date.now())}
                    </Text>
                </Text>
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "nowrap",
                        paddingVertical: 5,
                        columnGap: 5,
                        flex: 2,
                    }}
                >
                    <Tag
                        name={"barcode"}
                        tagColor={palette.secondary}
                        iconColor={palette.accent}
                    />
                    <Tag
                        name={"nfc"}
                        tagColor={palette.secondary}
                        iconColor={palette.accent}
                    />
                    <Tag
                        name={"puzzle"}
                        tagColor={palette.secondary}
                        iconColor={palette.accent}
                    />
                </View>
                <View
                    style={{
                        flexDirection: "row",
                        flexWrap: "nowrap",
                        paddingVertical: 5,
                        columnGap: 5,
                        flex: 2,
                    }}
                >
                    <Tag
                        name={"S"}
                        tagColor={palette.secondary}
                        iconColor={palette.accent}
                    />
                    <Tag
                        name={"nfc"}
                        tagColor={palette.secondary}
                        iconColor={palette.accent}
                    />
                    <Tag
                        name={"puzzle"}
                        tagColor={palette.secondary}
                        iconColor={palette.accent}
                    />
                </View>
            </View>
        </>
    );
}
