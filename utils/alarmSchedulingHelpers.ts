import { Alarm } from "@/types/Alarm";
import {
    scheduleAlarm,
    modifyAlarm,
    deleteAlarm,
} from "@/modules/expo-alarm-manager";
import { add, isPast, set } from "date-fns";
import { DaySet } from "@/types/DaySet";

const findNextDay = (startingDate: Date, repeatDays: DaySet) => {
    let candidateDate = startingDate;
    let daysToAdd = 1;
    while (daysToAdd <= 6) {
        const nextDate = add(candidateDate, { days: daysToAdd });
        const nextDayIndex = nextDate.getDay() as keyof DaySet;
        if (repeatDays[nextDayIndex].enabled) {
            candidateDate = nextDate;
            break;
        }
        daysToAdd++;
    }
    return candidateDate;
};

const getNextInstanceTimeStamp = (alarm: Alarm) => {
    let candidateDate = set(new Date(), {
        hours: alarm.ringHours,
        minutes: alarm.ringMins,
        seconds: 0,
        milliseconds: 0,
    });

    if (alarm.repeat) {
        if (alarm.repeatDays[candidateDate.getDay() as keyof DaySet].enabled) {
            if (isPast(candidateDate)) {
                candidateDate = add(candidateDate, { days: 7 });
            }
        } else {
            candidateDate = findNextDay(candidateDate, alarm.repeatDays);
        }
    } else {
        if (isPast(candidateDate)) {
            candidateDate = add(candidateDate, { days: 1 });
        }
    }
    return candidateDate.getTime();
};

const disableNextInstance = async (alarm: Alarm) => {
    return deleteAlarm(alarm.id, alarm.vibrate);
};

const modifyNextInstance = async (alarm: Alarm) => {
    return modifyAlarm(
        alarm.id,
        getNextInstanceTimeStamp(alarm),
        alarm.vibrate
    );
};

const handleDaisyChainAfterRing = async (alarm: Alarm) => {
    if (!alarm.repeat) {
        return { ...alarm, isEnabled: false };
    }
    return alarm;
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
    return scheduleAlarm(
        alarm.id,
        getNextInstanceTimeStamp(alarm),
        alarm.vibrate
    );
};

const scheduleSnoozedAlarm = async (alarm: Alarm, snoozeDuration: number) => {
    const snoozedRing = add(new Date(), { minutes: snoozeDuration });
    return scheduleAlarm(alarm.id, snoozedRing.getTime(), alarm.vibrate);
};

export {
    disableNextInstance,
    scheduleNextInstance,
    modifyNextInstance,
    handleDaisyChainAfterRing,
    rescheduleAllForOnBoot,
    scheduleSnoozedAlarm,
};
