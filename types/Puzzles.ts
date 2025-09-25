export type RegisteredTag = {
    tech: "mifare" | "ndef" | "ultralight";
    name: string;
    id: string;
};

export type TextPuzzle = {
    id: string;
    type: "text";
    title: "Text";
    icon: "text-box";
    difficulty: 1 | 2 | 3;
    params: {
        length: number;
    };
};

export type NFCPuzzle = {
    id: string;
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
    id: string;
    type: "math";
    title: "Math";
    icon: "calculator";
    difficulty: 1 | 2 | 3;
    params: {
        //? WIP
    };
};

export type ScannerPuzzle = {
    id: string;
    type: "scanner";
    title: "Scanner";
    icon: "line-scan";
    difficulty: 1 | 2 | 3;
    params: {
        codeType: "qr" | "code128" | "ean13";
        tagCount: number;
        timeLimit: number;
        sequence: RegisteredTag[];
    };
};

export type MemoryPuzzle = {
    id: string;
    type: "memory";
    title: "Memory";
    icon: "brain";
    difficulty: 1 | 2 | 3;
    params: {
        speed: number;
        timeLimit: number;
        repetitions?: number;
    };
};

export type Puzzle =
    | TextPuzzle
    | NFCPuzzle
    | MathPuzzle
    | ScannerPuzzle
    | MemoryPuzzle;
