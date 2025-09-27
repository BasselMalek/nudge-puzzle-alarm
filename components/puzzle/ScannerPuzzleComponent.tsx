import { ScannerPuzzle, Barcode } from "@/types/Puzzles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { IconButton, Text, useTheme, Button } from "react-native-paper";
import AnimatedIcon, { AnimatedIconRef } from "@/components/AnimatedIcon";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function ScannerPuzzleComponent(props: {
    puzzle: ScannerPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const currentBarcodeTarget = useRef(0);
    const [currentBarcodeName, setCurrentBarcodeName] = useState(
        puzzle.sequence.at(currentBarcodeTarget.current)?.name
    );
    const [isError, setIsError] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const { colors, roundness } = useTheme();
    const iconRef = useRef<AnimatedIconRef>(null);

    const onBarcodeScanned = useCallback(
        (scannedData: { type: string; data: string }) => {
            const currentTarget = puzzle.sequence.at(
                currentBarcodeTarget.current
            );

            if (scannedData.data === currentTarget?.id) {
                currentBarcodeTarget.current = currentBarcodeTarget.current + 1;
                iconRef.current?.triggerAnimation();
                setIsScanning(false);
            } else {
                setIsError(true);
                iconRef.current?.triggerAnimation();
                setIsScanning(false);
            }
        },
        [puzzle, currentBarcodeTarget]
    );

    const handleStartScanning = async () => {
        if (!permission?.granted) {
            const { granted } = await requestPermission();
            if (!granted) {
                setIsError(true);
                iconRef.current?.triggerAnimation();
                return;
            }
        }
        setIsScanning(true);
    };

    return (
        <View
            style={{
                paddingVertical: 20,
                gap: 30,
                alignItems: "center",
                flex: 1,
            }}
        >
            <AnimatedIcon
                ref={iconRef}
                size={64}
                color1={colors.onBackground}
                color2={isError ? colors.error : colors.primary}
                source={"line-scan"}
                onAnimationComplete={() => {
                    setIsError(false);
                    if (
                        currentBarcodeTarget.current >= puzzle.sequence.length
                    ) {
                        onSuccess();
                    } else {
                        setCurrentBarcodeName(
                            puzzle.sequence.at(currentBarcodeTarget.current)
                                ?.name
                        );
                    }
                }}
            />

            <Text variant="displayMedium" style={{ textAlign: "center" }}>
                {isError
                    ? permission?.granted
                        ? "Wrong code! Try again"
                        : "Camera permission required"
                    : `Scan ${currentBarcodeName}`}
            </Text>

            {!isScanning ? (
                <Button
                    mode="contained"
                    onPress={handleStartScanning}
                    icon="line-scan"
                    style={{ marginTop: 20 }}
                >
                    Start Scanning
                </Button>
            ) : (
                <View style={{ flex: 1, width: "100%", gap: 20 }}>
                    <CameraView
                        active={isScanning}
                        style={{
                            flex: 1,
                            borderRadius: roundness + 10,
                            minHeight: 300,
                        }}
                        onBarcodeScanned={onBarcodeScanned}
                    />
                    <Button
                        mode="outlined"
                        onPress={() => setIsScanning(false)}
                        icon="stop"
                        style={{ alignSelf: "center" }}
                    >
                        Stop Scanning
                    </Button>
                </View>
            )}
        </View>
    );
}
