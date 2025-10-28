import { Alarm } from "@/types/Alarm";
import {
    scheduleAlarm,
    modifyAlarm,
    deleteAlarm,
} from "@/modules/expo-alarm-manager";
import { add, isPast, set } from "date-fns";
import { DaySet } from "@/types/DaySet";

const findNextDay = (startingDate: Date, repeatDays: DaySet) => {
    for (let daysToAdd = 1; daysToAdd <= 7; daysToAdd++) {
        const nextDate = add(startingDate, { days: daysToAdd });
        const nextDayIndex = nextDate.getDay() as keyof DaySet;
        if (repeatDays[nextDayIndex]?.enabled) {
            return nextDate;
        }
    }
    return startingDate;
};

const getNextInstanceTimeStamp = (alarm: Alarm) => {
    const now = new Date();
    let candidateDate = set(now, {
        hours: alarm.ringHours,
        minutes: alarm.ringMins,
        seconds: 0,
        milliseconds: 0,
    });
    if (alarm.repeat) {
        const todayIndex = candidateDate.getDay() as keyof DaySet;
        const isTodayEnabled = alarm.repeatDays[todayIndex]?.enabled;
        const hasTimePassed = isPast(candidateDate);
        if (isTodayEnabled && !hasTimePassed) {
            return candidateDate.getTime();
        }
        candidateDate = findNextDay(candidateDate, alarm.repeatDays);
    } else {
        if (isPast(candidateDate)) {
            candidateDate = add(candidateDate, { days: 1 });
        }
    }

    return candidateDate.getTime();
};

const disableNextInstance = async (alarm: Alarm) => {
    return deleteAlarm(alarm.id);
};

const modifyNextInstance = async (alarm: Alarm) => {
    return modifyAlarm(alarm.id, getNextInstanceTimeStamp(alarm));
};

const handleDaisyChainAfterRing = async (alarm: Alarm): Promise<Alarm> => {
    if (!alarm.repeat) {
        return { ...alarm, isEnabled: false };
    }
    try {
        await scheduleNextInstance(alarm);
        return alarm;
    } catch (error) {
        console.error("Failed to schedule next alarm instance:", error);
        return { ...alarm, isEnabled: false };
    }
};

const rescheduleAllForOnBoot = async (alarms: Alarm[]): Promise<boolean> => {
    const results = await Promise.all(
        alarms.map(async (alarm) => {
            return scheduleNextInstance(alarm);
        })
    );
    return results.every((bool) => bool === true);
};
const scheduleNextInstance = async (alarm: Alarm) => {
    return scheduleAlarm(alarm.id, getNextInstanceTimeStamp(alarm));
};

const scheduleSnoozedAlarm = async (alarm: Alarm, snoozeDuration: number) => {
    const snoozedRing = add(new Date(), { minutes: snoozeDuration });
    return scheduleAlarm(alarm.id, snoozedRing.getTime());
};

export {
    disableNextInstance,
    scheduleNextInstance,
    modifyNextInstance,
    handleDaisyChainAfterRing,
    rescheduleAllForOnBoot,
    scheduleSnoozedAlarm,
};
