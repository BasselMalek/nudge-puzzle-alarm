import { NFCTag } from "@/types/Puzzles";
import NfcManager, { NfcEvents, TagEvent } from "react-native-nfc-manager";

export const useNFCScanner = (onValidScan: (tagData: NFCTag) => void) => {
    const startNFCScanning = () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
            if (tag.id) {
                const tagData: NFCTag = {
                    id: tag.id,
                };
                onValidScan(tagData);
            }
            NfcManager.unregisterTagEvent();
            NfcManager.registerTagEvent();
        });
        NfcManager.registerTagEvent();
    };

    const stopNFCScanning = async () => {
        await NfcManager.unregisterTagEvent();
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        NfcManager.setEventListener(NfcEvents.SessionClosed, null);
        await NfcManager.close();
    };

    return { startNFCScanning, stopNFCScanning };
};
