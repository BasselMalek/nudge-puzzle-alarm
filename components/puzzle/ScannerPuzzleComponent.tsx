import { ScannerPuzzle } from "@/types/Puzzles";
import { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Text, useTheme, Button } from "react-native-paper";
import AnimatedIcon, { AnimatedIconRef } from "@/components/AnimatedIcon";
import { CameraView, useCameraPermissions } from "expo-camera";
import CountdownTimerBadge from "./CountdownTimerBadge";

export default function ScannerPuzzleComponent(props: {
    puzzle: ScannerPuzzle;
    onSuccess: () => void;
    onFailure: () => void;
}) {
    const { onSuccess, puzzle, onFailure } = props;
    const { difficulty } = puzzle;
    const timeLimit = difficulty === 1 ? 90 : difficulty === 2 ? 75 : 60;

    const currentBarcodeTarget = useRef(0);
    const [currentBarcodeName, setCurrentBarcodeName] = useState(
        puzzle.sequence.at(currentBarcodeTarget.current)?.name
    );
    const [isError, setIsError] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [isRunning, setIsRunning] = useState(true);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const [permission, requestPermission] = useCameraPermissions();
    const { colors, roundness } = useTheme();
    const iconRef = useRef<AnimatedIconRef>(null);

    useEffect(() => {
        if (isRunning && timeRemaining > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => prev - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsRunning(false);
            setIsScanning(false);
            onFailure();
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
            }
        };
    }, [isRunning, onFailure, timeRemaining]);

    const onBarcodeScanned = useCallback(
        (scannedData: { type: string; data: string }) => {
            if (timeRemaining === 0) return;

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
        [puzzle, currentBarcodeTarget, timeRemaining]
    );

    const handleStartScanning = async () => {
        if (timeRemaining === 0) return;

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
                        borderRadius: roundness + 5,
                    }}
                    onBarcodeScanned={onBarcodeScanned}
                />
            )}
            <View
                style={{
                    padding: 20,
                    gap: 10,
                    alignItems: "center",
                    justifyContent: "center",

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
                            setIsRunning(false);
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
                    disabled={timeRemaining === 0}
                    onPress={() => {
                        void handleStartScanning();
                    }}
                    icon="line-scan"
                >
                    {"Start Scanning"}
                </Button>
            </View>
            <View
                style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    opacity: isScanning ? 0.5 : 1,
                }}
            >
                <CountdownTimerBadge
                    timeRemaining={timeRemaining}
                    warningThreshold={11}
                    size={40}
                />
            </View>
        </>
    );
}
