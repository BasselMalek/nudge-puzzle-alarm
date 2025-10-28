import { NFCTag } from "@/types/Puzzles";
import NfcManager, { NfcEvents, TagEvent } from "react-native-nfc-manager";

export const useNFCScanner = (onValidScan: (tagData: NFCTag) => void) => {
    const startNFCScanning = async () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag: TagEvent) => {
            if (tag.id) {
                const tagData: NFCTag = {
                    id: tag.id,
                };
                onValidScan(tagData);
            }
            NfcManager.unregisterTagEvent()
                .then(() => {
                    void NfcManager.registerTagEvent();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
        await NfcManager.registerTagEvent();
    };

    const stopNFCScanning = async () => {
        if (NfcManager) {
            await NfcManager.unregisterTagEvent();
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            NfcManager.setEventListener(NfcEvents.SessionClosed, null);
            void NfcManager.close();
        }
    };

    const getUsable = async () => {
        return NfcManager.isSupported();
    };
    return { startNFCScanning, stopNFCScanning, getUsable };
};
