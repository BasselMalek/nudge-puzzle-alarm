package expo.modules.alarmmanager

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.WindowManager
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class ExpoAlarmManagerReactActivityLifecycleListener : ReactActivityLifecycleListener {
    private var isReady = false
    private var pendingIntent: Intent? = null

    companion object {
        private const val TAG = "NUDGE_DEBUG"
    }

    override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
        Log.d(TAG, "onCreate called, waiting for onResume")
    }

    override fun onResume(activity: Activity) {
        Log.d(TAG, "onResume called, module should be ready")
        if (!isReady) {
            isReady = true
            pendingIntent?.let {
                Log.d(TAG, "Processing pending intent from onNewIntent")
                scanIntent(it)
                pendingIntent = null
            } ?: run {
                Log.d(TAG, "Processing launch intent from onCreate")
                scanIntent(activity.intent)
            }
        }
    }

    override fun onNewIntent(intent: Intent): Boolean {
        Log.d(TAG, "onNewIntent called, isReady=$isReady")
        if (isReady) {
            scanIntent(intent)
            return true
        } else {
            Log.d(TAG, "Module not ready, queuing intent")
            pendingIntent = intent
            return true
        }
    }

    private fun scanIntent(intent: Intent) {
        val action = intent.getStringExtra("signal")
        val alarmId = intent.getStringExtra("alarm_id") ?: ""

        when (action) {
            "ALARM" -> {
                Log.d(TAG, "Received alarm with id: $alarmId")
                handleAlarmIntent(alarmId)
            }
            else -> {
                Log.d(TAG, "Unknown action received")
            }
        }
    }

    private fun handleAlarmIntent(alarmId: String) {
        ExpoAlarmManagerModule.handleAlarmDeepLink(alarmId)
        Log.d(TAG, "Handling alarm intent with id: $alarmId")
    }
}
