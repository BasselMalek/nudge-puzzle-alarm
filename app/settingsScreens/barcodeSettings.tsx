import ListItem from "@/components/ListItem";
import { Barcode } from "@/types/Puzzles";
import { useFocusEffect } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useState } from "react";
import { View, FlatList } from "react-native";
import { Text, TextInput, Button, Card, useTheme } from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function barcodeSettings() {
    const [scannedCode, setScannedCode] = useState<Barcode | null>(null);
    const [registeredCodes, setRegisteredCodes] = useState<Barcode[]>([]);
    const [error, setError] = useState(false);
    const [customName, setCustomName] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const db = useSQLiteContext();
    const { colors, roundness } = useTheme();

    const checkifRegistered = useCallback(
        (id: string) => registeredCodes.map((val) => val.id).includes(id),
        [registeredCodes]
    );

    const saveTag = async () => {
        if (checkifRegistered(scannedCode!.id)) {
            db.runAsync("UPDATE physical SET name = ? WHERE id = ?", [
                customName,
                scannedCode!.id,
            ]);
        } else {
            db.runAsync(
                "INSERT INTO physical (id, type, name) VALUES (?,?,?)",
                [scannedCode!.id, "BAR", customName]
            );
            setRegisteredCodes([
                ...registeredCodes,
                { ...scannedCode!, name: customName },
            ]);
        }
        setScannedCode(null);
    };

    const handleStartScanning = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                setError(true);
                return;
            }
        }
        setError(false);
        setIsScanning(true);
    };

    useFocusEffect(
        useCallback(() => {
            const rows = db
                .getAllAsync<Barcode>("SELECT * FROM physical WHERE type = ?", [
                    "BAR",
                ])
                .then((items) => {
                    console.log(items);
                    setRegisteredCodes(items);
                });
        }, [db])
    );

    const handleDelete = useCallback(
        (id: string) => {
            setRegisteredCodes(registeredCodes.filter((val) => val.id !== id));
            db.runAsync("DELETE FROM physical where id = ?", [id]);
        },
        [db]
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background, gap: 15 }}>
            <Card style={{ display: isScanning ? "none" : "flex", flex: 1 }}>
                <Card.Content
                    style={{
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 15,
                        height: "100%",
                    }}
                >
                    <Text
                        variant="headlineSmall"
                        style={{ textAlign: "center" }}
                    >
                        {error
                            ? permission?.granted
                                ? "Code unreadable or already registered"
                                : "Camera permission required to scan codes"
                            : "Press the button to open viewfinder."}
                    </Text>
                    <Button
                        mode="contained"
                        onPress={handleStartScanning}
                        icon="line-scan"
                    >
                        {isScanning ? "Stop Scanning" : "Start Scanning"}
                    </Button>
                </Card.Content>
            </Card>
            {isScanning && (
                <>
                    <CameraView
                        active={isScanning}
                        style={{
                            flex: 1,
                            borderRadius: roundness + 10,
                        }}
                        onBarcodeScanned={({ type, data }) => {
                            console.log(data);
                            setIsScanning(false);
                            if (checkifRegistered(data)) {
                                setError(true);
                            } else {
                                setScannedCode({
                                    name: "",
                                    id: data,
                                    tech: type as Barcode["tech"],
                                });
                            }
                        }}
                    />
                    <Button
                        mode="contained"
                        onPress={() => {
                            setIsScanning(false);
                        }}
                        icon="stop"
                        style={{ alignSelf: "center" }}
                    >
                        {"Stop Scanning"}
                    </Button>
                </>
            )}

            {scannedCode && (
                <Card>
                    <Card.Content style={{ gap: 15 }}>
                        <Text variant="headlineSmall">Scanned Tag Details</Text>
                        <Text variant="bodyMedium">
                            <Text style={{ fontWeight: "bold" }}>ID: </Text>
                            {scannedCode.id}
                        </Text>
                        <TextInput
                            label="Custom Name"
                            value={customName}
                            onChangeText={setCustomName}
                            mode="outlined"
                            placeholder="Enter a custom name"
                        />
                        <Button mode="contained" onPress={saveTag}>
                            {"Save Tag"}
                        </Button>
                    </Card.Content>
                </Card>
            )}
            <View style={{ flex: 3, gap: 15 }}>
                <Text variant="titleMedium">{"Registered Codes"}</Text>
                <FlatList
                    fadingEdgeLength={40}
                    data={registeredCodes}
                    renderItem={({ item }) => (
                        <ListItem
                            title={item.name!}
                            desc={item.id}
                            buttons
                            buttonOneAction={() => {
                                setCustomName(item.name);
                                setScannedCode(item);
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
