// utils/pickAudioFile.js
import * as DocumentPicker from "expo-document-picker";

/**
 * Opens the system file picker limited to audio files and
 * resolves with the selected file's URI, or null if cancelled.
 */
export async function pickAudioFile() {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: "audio/*",
            copyToCacheDirectory: true,
            multiple: false,
        });

        if (result.canceled) {
            return null;
        }

        const { uri } = result.assets[0];
        return uri;
    } catch (error) {
        console.error("Error picking audio file:", error);
        return null;
    }
}
