package expo.modules.alarmmanager

import android.content.Intent
import android.util.Log
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class BootHeadlessTaskService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        Log.d("NUDGE_DEBUG","Ran the native service")
        return intent?.extras?.let {
            HeadlessJsTaskConfig(
                "BootTask",
                Arguments.fromBundle(it),
                5000,
                true
            )
        }
    }
}
