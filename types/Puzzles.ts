export type RegisteredTag = {
    tech: "mifare" | "ndef" | "ultralight";
    name: string;
    id: string;
};

export type TextPuzzle = {
    type: "text";
    difficulty: 1 | 2 | 3;
    params: {
        length: number;
    };
};

export type NFCPuzzle = {
    type: "nfc";
    difficulty: 1 | 2 | 3;
    params: {
        tagCount: number;
        sequence: RegisteredTag[];
        timeLimit: number;
    };
};

export type PatternPuzzle = {
    type: "pattern";
    difficulty: 1 | 2 | 3;
    params: {
        //? WIP
    };
};

export type BarcodePuzzle = {
    type: "barcode";
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
    | PatternPuzzle
    | BarcodePuzzle
    | MemoryPuzzle;
