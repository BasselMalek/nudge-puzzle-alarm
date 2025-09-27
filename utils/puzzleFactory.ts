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
                length: difficulty * 4,
            };
        case "nfc":
            return {
                id: randomUUID(),
                type: "nfc",
                title: "NFC",
                icon: "nfc",
                difficulty,
                sequence: [],
                timeLimit: 40 - difficulty * 10,
            };
        case "math":
            return {
                id: randomUUID(),
                type: "math",
                title: "Math",
                icon: "calculator",
                difficulty,
            };
        case "scanner":
            return {
                id: randomUUID(),
                type: "scanner",
                title: "Scanner",
                icon: "line-scan",
                difficulty,
                sequence: [],
                codeType: "qr",
                timeLimit: 40 - difficulty * 10,
            };
        case "memory":
            return {
                id: randomUUID(),
                type: "memory",
                title: "Memory",
                icon: "brain",
                difficulty,
                speed: 1,
                timeLimit: 5,
            };
    }
};
