import AlarmModal from "./alarmModal";
import AlarmCard from "@/components/AlarmCard";
import { useState } from "react";
import { DayKey } from "./WeekdayRepeat";
import { router } from "expo-router";

export default function AlarmWrapper(props: {
    enabled: boolean;
    alarmName?: string;
    ringTime: Date;
    repeat: Array<DayKey>;
    onToggle: (enabled: boolean) => void;
}) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleCardPress = () => {
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    return (
        <>
            <AlarmCard
                enabled={props.enabled}
                alarmName={props.alarmName}
                ringTime={props.ringTime}
                repeat={props.repeat}
                onPress={() => {
                    router.push("/alarmOptions");
                }}
                onToggle={props.onToggle}
            />

            <AlarmModal
                visible={isModalVisible}
                onClose={handleModalClose}
                alarmName={props.alarmName}
                ringTime={props.ringTime}
            />
        </>
    );
}
