export type RegisteredTag = {
    tech: "mifare" | "ndef" | "ultralight";
    name: string;
    id: string;
};

export type TextPuzzle = {
    type: "text";
    title: "Text";
    icon: "text-box";
    difficulty: 1 | 2 | 3;
    params: {
        length: number;
    };
};

export type NFCPuzzle = {
    type: "nfc";
    title: "NFC";
    icon: "nfc";
    difficulty: 1 | 2 | 3;
    params: {
        tagCount: number;
        sequence: RegisteredTag[];
        timeLimit: number;
    };
};

export type MathPuzzle = {
    type: "math";
    title: "Math";
    icon: "abacus";
    difficulty: 1 | 2 | 3;
    params: {
        //? WIP
    };
};

export type ScannerPuzzle = {
    type: "scanner";
    title: "Scanner";
    icon: "line-scan";
    difficulty: 1 | 2 | 3;
    params: {
        codeType: "qr" | "code128" | "ean13";
        codeCount: number;
        dataLength: number;
        timeLimit: number;
    };
};

export type MemoryPuzzle = {
    type: "memory";
    title: "Memory";
    icon: "gamepad-up";
    difficulty: 1 | 2 | 3;
    params: {
        speed: number;
        recallTime: number;
        repetitions?: number;
    };
};

export type Puzzle =
    | TextPuzzle
    | NFCPuzzle
    | MathPuzzle
    | ScannerPuzzle
    | MemoryPuzzle;
