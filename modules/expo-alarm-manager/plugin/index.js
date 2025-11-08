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

/**
 * Injects onNewIntent override to MainActivity to cache the intent.
 * This fixes a race condition with deep linking (e.g., with Expo Router)
 * where the intent is received before the JS context is ready.
 */
const withDeepLinkPatch = (config) => {
    return withMainActivity(config, (config) => {
        let contents = config.modResults.contents;
        const packageMatch = contents.match(/^package .*/m);
        if (!packageMatch) {
            console.warn(
                "withDeepLinkPatch: Failed to find package declaration in MainActivity"
            );
            return config;
        }
        const packageLine = packageMatch[0];
        if (config.modResults.language === "kt") {
            contents = contents.replace(
                packageLine,
                `${packageLine}\n\nimport android.content.Intent`
            );
        } else if (config.modResults.language === "java") {
            contents = contents.replace(
                packageLine,
                `${packageLine}\n\nimport android.content.Intent;`
            );
        }
        let onNewIntentOverrideCode;
        if (config.modResults.language === "kt") {
            onNewIntentOverrideCode = `
    override fun onNewIntent(intent: Intent) {
        setIntent(intent)
        super.onNewIntent(intent)
    }
`;
        } else if (config.modResults.language === "java") {
            onNewIntentOverrideCode = `
    @Override
    public void onNewIntent(Intent intent) {
        setIntent(intent);
        super.onNewIntent(intent);
    }
`;
        }
        const lastBraceIndex = contents.lastIndexOf("}");
        if (lastBraceIndex === -1) {
            console.warn(
                "withDeepLinkPatch: Failed to find closing brace in MainActivity"
            );
            return config;
        }
        contents =
            contents.substring(0, lastBraceIndex) +
            onNewIntentOverrideCode +
            contents.substring(lastBraceIndex);

        config.modResults.contents = contents;
        return config;
    });
};

const withQueryFilter = (config) => {
    return withAndroidManifest(config, async (config) => {
        const androidManifest = config.modResults;
        const mainApplication = androidManifest.manifest;
        if (!mainApplication.queries) {
            mainApplication.queries = [];
        }
        const hasLauncherQuery = mainApplication.queries.some((query) => {
            return query.intent?.some((intent) => {
                const hasMainAction = intent.action?.some(
                    (action) =>
                        action.$["android:name"] ===
                        "android.intent.action.MAIN"
                );
                const hasLauncherCategory = intent.category?.some(
                    (category) =>
                        category.$["android:name"] ===
                        "android.intent.category.LAUNCHER"
                );
                return hasMainAction && hasLauncherCategory;
            });
        });
        if (!hasLauncherQuery) {
            mainApplication.queries.push({
                intent: [
                    {
                        action: [
                            {
                                $: {
                                    "android:name":
                                        "android.intent.action.MAIN",
                                },
                            },
                        ],
                        category: [
                            {
                                $: {
                                    "android:name":
                                        "android.intent.category.LAUNCHER",
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

const withAlarmReceiverAndScreenWake = (config) => {
    config = withAlarmReceiver(config);
    config = withDeepLinkPatch(config);
    config = withQueryFilter(config);
    return config;
};

module.exports = withAlarmReceiverAndScreenWake;
