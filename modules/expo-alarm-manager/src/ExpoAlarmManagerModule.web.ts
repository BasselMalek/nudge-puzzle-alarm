import { registerWebModule, NativeModule } from 'expo';

import { ChangeEventPayload } from './ExpoAlarmManager.types';

type ExpoAlarmManagerModuleEvents = {
  onChange: (params: ChangeEventPayload) => void;
}

class ExpoAlarmManagerModule extends NativeModule<ExpoAlarmManagerModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
};

export default registerWebModule(ExpoAlarmManagerModule, 'ExpoAlarmManagerModule');
