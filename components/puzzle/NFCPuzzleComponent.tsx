import { NFCPuzzle } from "@/types/Puzzles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";
import NfcManager, { NfcEvents, TagEvent } from "react-native-nfc-manager";
import AnimatedIcon, { AnimatedIconRef } from "../AnimatedIcon";

export default function NFCPuzzleComponent(props: {
    puzzle: NFCPuzzle;
    onSuccess: () => void;
}) {
    const { onSuccess, puzzle } = props;
    const currentTagTarget = useRef(0);
    const [currentTagName, setCurrentTagName] = useState(
        puzzle.params.sequence.at(currentTagTarget.current)?.name
    );
    const [isError, setIsError] = useState(false);
    const { colors, roundness } = useTheme();
    const iconRef = useRef<AnimatedIconRef>(null);

    const onTagRead = useCallback(
        (tagId: string) => {
            if (
                tagId ===
                puzzle?.params.sequence.at(currentTagTarget.current)?.id
            ) {
                currentTagTarget.current = currentTagTarget.current + 1;
                iconRef.current?.triggerAnimation();
            } else {
                setIsError(true);
                iconRef.current?.triggerAnimation();
            }
        },
        [puzzle, currentTagTarget]
    );

    useEffect(() => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
            if (tag.id) {
                onTagRead(tag.id);
            }
            NfcManager.unregisterTagEvent();
            NfcManager.registerTagEvent();
        });
        NfcManager.registerTagEvent();
        return () => {
            NfcManager.unregisterTagEvent();
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            NfcManager.setEventListener(NfcEvents.SessionClosed, null);
            NfcManager.close();
        };
    }, []);

    return (
        <View
            style={{
                paddingVertical: 20,
                gap: 30,
                alignItems: "center",
            }}
        >
            <AnimatedIcon
                ref={iconRef}
                size={64}
                color1={colors.onBackground}
                color2={isError ? colors.error : colors.primary}
                source={"nfc"}
                //? I'm not sure there's another way of somehow reseting this that does not envolve interval
                //? if there is it's gonna look bad exposing a whole ass thread from there just to set a state var.
                //? this is 5am code tho i'm sure its fine.
                onAnimationComplete={() => {
                    setIsError(false);
                    if (currentTagTarget.current >= puzzle!.params.tagCount) {
                        onSuccess();
                    } else {
                        setCurrentTagName(
                            puzzle.params.sequence.at(currentTagTarget.current)
                                ?.name
                        );
                    }
                }}
            />
            <Text variant="displayMedium" style={{ textAlign: "center" }}>
                {"Scan " + currentTagName}
            </Text>
        </View>
    );
}
