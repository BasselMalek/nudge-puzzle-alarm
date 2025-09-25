import { Puzzle } from "@/types/Puzzles";
import { randomUUID } from "expo-crypto";

export const createPuzzle = (
    type: Puzzle["type"],
    difficulty: 1 | 2 | 3
): Puzzle => {
    switch (type) {
        case "text":
            return {
                id: randomUUID(),

                type: "text",
                title: "Text",
                icon: "text-box",
                difficulty,
                params: {
                    length: difficulty * 4,
                },
            };

        case "nfc":
            const tagCount = difficulty + 1;
            return {
                id: randomUUID(),

                type: "nfc",
                title: "NFC",
                icon: "nfc",
                difficulty,
                params: {
                    tagCount,
                    sequence: [],
                    timeLimit: 40 * tagCount - difficulty * 10,
                },
            };

        case "math":
            return {
                id: randomUUID(),

                type: "math",
                title: "Math",
                icon: "calculator",
                difficulty,
                params: {},
            };

        case "scanner":
            const scannedTagCount = difficulty + 1;
            return {
                id: randomUUID(),

                type: "scanner",
                title: "Scanner",
                icon: "line-scan",
                difficulty,
                params: {
                    tagCount: scannedTagCount,
                    sequence: [],
                    codeType: "qr",
                    timeLimit: 40 * scannedTagCount - difficulty * 10,
                },
            };

        case "memory":
            return {
                id: randomUUID(),

                type: "memory",
                title: "Memory",
                icon: "brain",
                difficulty,
                params: {
                    speed: 1,
                    timeLimit: 5,
                },
            };
    }
};
