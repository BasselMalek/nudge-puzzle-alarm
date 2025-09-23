import { AppRegistry } from "react-native";
import { BootTask } from "./utils/BootTask"; // adjust if path differs

AppRegistry.registerHeadlessTask("BootTask", () => BootTask);
