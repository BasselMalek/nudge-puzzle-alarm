import { ScannerPuzzle } from "@/types/Puzzles";
import { useCallback, useRef, useState } from "react";
import { View } from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
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
            setIsScanning(false);
            const currentTarget = puzzle.sequence.at(
                currentBarcodeTarget.current
            );
            if (scannedData.data === currentTarget?.id) {
                currentBarcodeTarget.current = currentBarcodeTarget.current + 1;
                iconRef.current?.triggerAnimation();
            } else {
                setIsError(true);
                iconRef.current?.triggerAnimation();
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
        <>
            {isScanning && (
                <CameraView
                    active={isScanning}
                    style={{
                        flex: 1,
                        borderRadius: roundness + 10,
                    }}
                    onBarcodeScanned={onBarcodeScanned}
                />
            )}
            <View
                style={{
                    paddingVertical: 20,
                    gap: 25,
                    alignItems: "center",
                    flex: 1,
                    display: isScanning ? "none" : "flex",
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
                            currentBarcodeTarget.current >=
                            puzzle.sequence.length
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
                            ? "Wrong code!"
                            : "Camera permission required"
                        : `Scan ${currentBarcodeName}`}
                </Text>
                <Button
                    mode="contained"
                    onPress={() => {
                        void handleStartScanning();
                    }}
                    icon="line-scan"
                >
                    {"Start Scanning"}
                </Button>
            </View>
        </>
    );
}
