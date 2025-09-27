import { ScrollView, View, ViewStyle } from "react-native";

export default function MosaicSelectors(props: {
    totalItems: any;
    renderItem: (item: any) => React.ReactNode;
    mosaicConfig: Pick<ViewStyle, "gap" | "maxWidth" | "height">;
}) {
    const { totalItems, renderItem, mosaicConfig } = props;
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
        >
            <View
                style={{
                    ...mosaicConfig,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignContent: "flex-start",
                }}
            >
                {totalItems.map((item: any) => renderItem(item))}
            </View>
        </ScrollView>
    );
}
