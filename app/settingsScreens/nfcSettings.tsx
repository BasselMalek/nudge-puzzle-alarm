import ListItem from "@/components/ListItem";
import { useNFCScanner } from "@/hooks/useNFCScanner";
import { NFCTag } from "@/types/Puzzles";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { View, FlatList } from "react-native";
import { Text, TextInput, Button, Card, useTheme } from "react-native-paper";

export default function nfcSettings() {
    const [scannedTag, setScannedTag] = useState<NFCTag | null>(null);
    const [registeredTags, setRegisteredTags] = useState<NFCTag[]>([]);
    const [error, setError] = useState(false);
    const [customName, setCustomName] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const db = useSQLiteContext();
    const { colors } = useTheme();

    const checkifRegistered = useCallback(
        (id: string) => registeredTags.map((val) => val.id).includes(id),
        [registeredTags]
    );

    const { startNFCScanning, stopNFCScanning } = useNFCScanner((tagData) => {
        if (checkifRegistered(tagData.id)) {
            setError(true);
        } else {
            setScannedTag(tagData);
        }
        setIsScanning(false);
    });

    const handleStartScan = () => {
        setError(false);
        setIsScanning(true);
        setScannedTag(null);
        startNFCScanning();
    };

    const handleStopScan = () => {
        setIsScanning(false);
        stopNFCScanning();
    };

    const saveTag = async () => {
        if (checkifRegistered(scannedTag!.id)) {
            db.runAsync("UPDATE physical SET name = ? WHERE id = ?", [
                customName,
                scannedTag!.id,
            ]);
        } else {
            db.runAsync(
                "INSERT INTO physical (id, type, name) VALUES (?,?,?)",
                [scannedTag!.id, "NFC", customName]
            );
            setRegisteredTags([
                ...registeredTags,
                { ...scannedTag!, name: customName },
            ]);
        }
        setScannedTag(null);
    };
    const handleDelete = useCallback(
        (id: string) => {
            setRegisteredTags(registeredTags.filter((val) => val.id !== id));
            db.runAsync("DELETE FROM physical where id = ?", [id]);
        },
        [db]
    );
    useFocusEffect(
        useCallback(() => {
            const rows = db
                .getAllAsync<NFCTag>("SELECT * FROM physical WHERE type = ?", [
                    "NFC",
                ])
                .then((items) => {
                    console.log(items);
                    setRegisteredTags(items);
                });
            return () => {
                stopNFCScanning();
            };
        }, [db])
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, gap: 15 }}>
            <Card>
                <Card.Content
                    style={{ alignItems: "center", padding: 24, gap: 15 }}
                >
                    <Text
                        variant="headlineSmall"
                        style={{ textAlign: "center" }}
                    >
                        {isScanning
                            ? "Tap your tag"
                            : error
                            ? "Tag unreadable or already registered"
                            : "Press the button to start"}
                    </Text>
                    <Button
                        mode="contained"
                        onPress={isScanning ? handleStopScan : handleStartScan}
                        icon="nfc-tap"
                    >
                        {isScanning ? "Stop Scanning" : "Start Scanning"}
                    </Button>
                </Card.Content>
            </Card>
            {scannedTag && (
                <Card>
                    <Card.Content style={{ gap: 15 }}>
                        <Text variant="headlineSmall">Scanned Tag Details</Text>
                        <Text variant="bodyMedium">
                            <Text style={{ fontWeight: "bold" }}>ID: </Text>
                            {scannedTag.id}
                        </Text>
                        <TextInput
                            label="Custom Name"
                            value={customName}
                            onChangeText={setCustomName}
                            mode="outlined"
                            placeholder="Enter a custom name"
                        />
                        <Button mode="elevated" onPress={saveTag}>
                            {"Save Tag"}
                        </Button>
                    </Card.Content>
                </Card>
            )}
            <View style={{ flex: 1, gap: 15 }}>
                <Text variant="titleMedium">{"Registered Tags"}</Text>
                <FlatList
                    fadingEdgeLength={40}
                    data={registeredTags}
                    renderItem={({ item }) => (
                        <ListItem
                            title={item.name!}
                            desc={item.id}
                            buttons
                            buttonOneAction={() => {
                                setCustomName(item.name!);
                                setScannedTag(item);
                            }}
                            buttonTwoAction={() => {
                                handleDelete(item.id);
                            }}
                        />
                    )}
                />
            </View>
        </View>
    );
}
