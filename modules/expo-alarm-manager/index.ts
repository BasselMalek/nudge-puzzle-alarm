// Reexport the native module. On web, it will be resolved to ExpoAlarmManagerModule.web.ts
// and on native platforms to ExpoAlarmManagerModule.ts
export { default } from "./src/ExpoAlarmManagerModule";
export * from "./src/ExpoAlarmManager.types";
