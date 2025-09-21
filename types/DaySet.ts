type DayData = {
    dayName: string;
    letter: string;
    enabled: boolean;
};

export type DaySet = Record<0 | 1 | 2 | 3 | 4 | 5 | 6, DayData>;
