const { withAndroidManifest } = require("@expo/config-plugins");

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

// const withDeepLinkPatch = (config) => {
//     return withMainActivity(config, (config) => {
//         let contents = config.modResults.contents;
//         contents = contents.replace(
//             /^package .*/m,
//             `$&\n\nimport android.content.Intent\nimport com.facebook.react.bridge.ReactContext\nimport com.facebook.react.runtime.ReactHostImpl`
//         );
//         contents = contents.replace(
//             /}$/,
//             `    override fun onNewIntent(intent: Intent) {
//         val reactHost = reactHost as? ReactHostImpl ?: return
//         val reactContext = reactHost.currentReactContext

//         if (reactContext?.hasActiveReactInstance() == true) {
//             super.onNewIntent(intent)
//         } else {
//             reactHost.addReactInstanceEventListener { super.onNewIntent(intent) }
//         }
//     }
// }`
//         );
//         config.modResults.contents = contents;
//         return config;
//     });
// };

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
    // config = withDeepLinkPatch(config);
    config = withQueryFilter(config);
    return config;
};

module.exports = withAlarmReceiverAndScreenWake;
