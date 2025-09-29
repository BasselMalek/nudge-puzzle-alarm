const {
    withAndroidManifest,
    withMainActivity,
} = require("@expo/config-plugins");

const withAlarmReceiver = (config) => {
    return withAndroidManifest(config, (config) => {
        const app = config.modResults.manifest.application?.[0];
        if (app) {
            app.receiver = app.receiver || [];
            app.service = app.service || [];
            app.service.push({
                $: {
                    "android:name":
                        "expo.modules.alarmmanager.BootHeadlessTaskService",
                    "android:enabled": "true",
                    "android:exported": "true",
                    // "android:foregroundServiceType": "shortService",
                },
            });
            app.receiver.push({
                $: {
                    "android:name": "expo.modules.alarmmanager.AlarmReceiver",
                    "android:enabled": "true",
                    "android:exported": "true",
                },
                "intent-filter": [
                    {
                        $: {
                            "android:priority": "1000",
                        },
                        action: [
                            {
                                $: {
                                    "android:name":
                                        "android.intent.action.BOOT_COMPLETED",
                                },
                            },
                        ],
                        category: [
                            {
                                $: {
                                    "android:name":
                                        "android.intent.category.DEFAULT",
                                },
                            },
                        ],
                    },
                ],
            });
        }
        return config;
    });
};

const withScreenWake = (config) => {
    return withMainActivity(config, (config) => {
        if (config.modResults.language === "kt") {
            // Add imports at the top of the file
            const imports = [
                "import android.os.Build",
                "import android.view.WindowManager",
            ];
            imports.forEach((importStatement) => {
                if (!config.modResults.contents.includes(importStatement)) {
                    const lastImportMatch = config.modResults.contents.match(
                        /import\s+.*\n(?=\s*\n|\s*class)/
                    );
                    if (lastImportMatch) {
                        const insertIndex =
                            lastImportMatch.index + lastImportMatch[0].length;
                        config.modResults.contents =
                            config.modResults.contents.slice(0, insertIndex) +
                            importStatement +
                            "\n" +
                            config.modResults.contents.slice(insertIndex);
                    }
                }
            });
            const screenWakeCode = `
        val reactNativeHost = getReactNativeHost();
        val reactInstanceManager = reactNativeHost.reactInstanceManager;`;
            const superOnCreateRegex = /(super\.onCreate\(null\))/;
            if (superOnCreateRegex.test(config.modResults.contents)) {
                config.modResults.contents = config.modResults.contents.replace(
                    superOnCreateRegex,
                    `$1${screenWakeCode}`
                );
            }
        }
        return config;
    });
};

const withAlarmReceiverAndScreenWake = (config) => {
    config = withAlarmReceiver(config);
    config = withScreenWake(config);
    return config;
};

module.exports = withAlarmReceiverAndScreenWake;
