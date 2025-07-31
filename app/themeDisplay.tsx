import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "react-native-paper";

const ColorSquare = ({ colorName, colorValue }) => {
    // Handle nested elevation object
    if (typeof colorValue === "object" && colorValue !== null) {
        return null; // Skip objects for individual color squares
    }

    return (
        <View style={styles.colorSquareContainer}>
            <View
                style={[styles.colorSquare, { backgroundColor: colorValue }]}
            />
            <Text style={styles.colorName}>{colorName}</Text>
            <Text style={styles.colorValue}>{colorValue}</Text>
        </View>
    );
};

const ColorGroup = ({ title, colors }) => {
    if (Object.keys(colors).length === 0) return null;

    return (
        <View style={styles.colorGroup}>
            <Text style={styles.groupTitle}>{title}</Text>
            <View style={styles.colorGrid}>
                {Object.entries(colors).map(([colorName, colorValue]) => (
                    <ColorSquare
                        key={colorName}
                        colorName={colorName}
                        colorValue={colorValue}
                    />
                ))}
            </View>
        </View>
    );
};

const ElevationSection = ({ elevationColors }) => (
    <View style={styles.colorGroup}>
        <Text style={styles.groupTitle}>Elevation Levels</Text>
        <View style={styles.colorGrid}>
            {Object.entries(elevationColors).map(([level, color]) => (
                <ColorSquare key={level} colorName={level} colorValue={color} />
            ))}
        </View>
    </View>
);

const ThemePalette = () => {
    const theme = useTheme();
    const colors = theme?.colors || {};

    // Separate elevation colors from regular colors
    const { elevation, ...regularColors } = colors;

    // Group colors by category for better organization
    const colorGroups = {
        "Primary Colors": Object.fromEntries(
            Object.entries(regularColors).filter(([key]) =>
                key.toLowerCase().includes("primary")
            )
        ),
        "Secondary Colors": Object.fromEntries(
            Object.entries(regularColors).filter(([key]) =>
                key.toLowerCase().includes("secondary")
            )
        ),
        "Tertiary Colors": Object.fromEntries(
            Object.entries(regularColors).filter(([key]) =>
                key.toLowerCase().includes("tertiary")
            )
        ),
        "Error Colors": Object.fromEntries(
            Object.entries(regularColors).filter(([key]) =>
                key.toLowerCase().includes("error")
            )
        ),
        "Surface & Background": Object.fromEntries(
            Object.entries(regularColors).filter(
                ([key]) =>
                    key.toLowerCase().includes("background") ||
                    key.toLowerCase().includes("surface")
            )
        ),
        "Other Colors": Object.fromEntries(
            Object.entries(regularColors).filter(
                ([key]) =>
                    !key.toLowerCase().includes("primary") &&
                    !key.toLowerCase().includes("secondary") &&
                    !key.toLowerCase().includes("tertiary") &&
                    !key.toLowerCase().includes("error") &&
                    !key.toLowerCase().includes("background") &&
                    !key.toLowerCase().includes("surface")
            )
        ),
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            <Text style={styles.mainTitle}>
                React Native Paper Theme Colors
            </Text>

            {Object.entries(colorGroups).map(([groupName, groupColors]) => (
                <ColorGroup
                    key={groupName}
                    title={groupName}
                    colors={groupColors}
                />
            ))}

            {elevation && <ElevationSection elevationColors={elevation} />}

            {Object.keys(colors).length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                        No colors found in theme.
                    </Text>
                    <Text style={styles.emptySubtext}>
                        Make sure your useTheme() hook returns a colors object.
                    </Text>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    contentContainer: {
        padding: 16,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 24,
        textAlign: "center",
    },
    colorGroup: {
        marginBottom: 24,
    },
    groupTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 12,
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    colorSquareContainer: {
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        width: "48%", // Two columns on mobile
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    colorSquare: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    colorName: {
        fontSize: 12,
        fontWeight: "500",
        color: "#333",
        textAlign: "center",
        marginBottom: 4,
    },
    colorValue: {
        fontSize: 10,
        color: "#666",
        fontFamily: "monospace",
        textAlign: "center",
    },
    emptyState: {
        alignItems: "center",
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#666",
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
    },
});

export default ThemePalette;
