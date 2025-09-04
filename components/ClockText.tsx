import React, { useState, useEffect } from "react";
import { Text } from "react-native-paper";
import type { TextProps } from "react-native-paper";

interface ClockTextProps extends Omit<TextProps<any>, "children"> {
    updateInterval?: number;
    localeOptions?: {
        locales?: string | string[];
        options?: Intl.DateTimeFormatOptions;
    };
}

export default function ClockText({
    updateInterval = 1000,
    localeOptions,
    ...textProps
}: ClockTextProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const updateClock = () => {
            setTime(new Date());
        };

        const interval = setInterval(updateClock, updateInterval);

        return () => clearInterval(interval);
    }, [updateInterval]);

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString(
            localeOptions?.locales,
            localeOptions?.options
        );
    };

    return <Text {...textProps}>{formatTime(time)}</Text>;
}
