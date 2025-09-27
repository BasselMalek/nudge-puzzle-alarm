export type NFCTag = {
    name?: string;
    id: string;
};

export type Barcode = {
    name: string;
    id: string;
    tech:
        | "aztec"
        | "ean13"
        | "ean8"
        | "qr"
        | "pdf417"
        | "upc_e"
        | "datamatrix"
        | "code39"
        | "code93"
        | "itf14"
        | "codabar"
        | "code128"
        | "upc_a";
};

export type TextPuzzle = {
    id: string;
    type: "text";
    title: "Text";
    icon: "text-box";
    difficulty: 1 | 2 | 3;
    length: number;
};

export type NFCPuzzle = {
    id: string;
    type: "nfc";
    title: "NFC";
    icon: "nfc";
    difficulty: 1 | 2 | 3;
    sequence: NFCTag[];
    timeLimit: number;
};

export type MathPuzzle = {
    id: string;
    type: "math";
    title: "Math";
    icon: "calculator";
    difficulty: 1 | 2 | 3;
    //? WIP - params were empty
};

export type ScannerPuzzle = {
    id: string;
    type: "scanner";
    title: "Scanner";
    icon: "line-scan";
    difficulty: 1 | 2 | 3;
    codeType: "qr" | "code128" | "ean13";
    timeLimit: number;
    sequence: Barcode[];
};

export type MemoryPuzzle = {
    id: string;
    type: "memory";
    title: "Memory";
    icon: "brain";
    difficulty: 1 | 2 | 3;
    speed: number;
    timeLimit: number;
    repetitions?: number;
};

export type Puzzle =
    | TextPuzzle
    | NFCPuzzle
    | MathPuzzle
    | ScannerPuzzle
    | MemoryPuzzle;
