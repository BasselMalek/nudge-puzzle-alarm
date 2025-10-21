const templates: Record<number, string[]> = {
    1: [
        "A + B",
        "A - B",
        "A + B - C",
        "A - B + C",
        "A + B + C",
        "A - B - C",
        "A + B - C + D",
        "A + B + C - D",
        "A - B + C + D",
        "A + B - C - D",
    ],
    2: [
        "A * B + C",
        "A + B * C",
        "A * B - C",
        "A * B + C - D",
        "A + B * C - D",
    ],
    3: [
        "(A + B) * C",
        "A * (B + C)",
        "(A - B) * C",
        "A * (B - C)",
        "(A + B) * (C - D)",
        "(A - B) * (C + D)",
        "A + (B * C) - D",
    ],
};

export const getMathExpression = (difficulty: number) => {
    const pool = templates[difficulty] ?? templates[1];
    const template = pool[Math.floor(Math.random() * pool.length)];

    let min = 1,
        max = 10;
    if (difficulty === 2) {
        min = 5;
        max = 15;
    } else if (difficulty === 3) {
        min = 10;
        max = 30;
    }

    const values: Record<string, number> = {};
    const vars = ["A", "B", "C", "D"];

    for (const v of vars) {
        values[v] = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    let exp = template;
    for (const [v, num] of Object.entries(values)) {
        exp = exp.replaceAll(v, num.toString());
    }

    const result = Math.round(Function(`"use strict"; return (${exp});`)());

    return { exp, result };
};
