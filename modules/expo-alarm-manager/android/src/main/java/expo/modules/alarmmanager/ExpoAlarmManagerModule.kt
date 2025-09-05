package expo.modules.alarmmanager

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.*

class ExpoAlarmManagerModule : Module() {
    companion object {
        private var LINKING_SCHEME: String? = null
        private const val REQUEST_CODE_ALARM_ROLE = 1337
    }

    @SuppressLint("MissingPermission")
    override fun definition() = ModuleDefinition {
        Name("ExpoAlarmManager")

        // Function to set the linking scheme
        AsyncFunction("setLinkingScheme") { scheme: String, promise: Promise ->
            try {
                LINKING_SCHEME = scheme
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_SET_LINKING_SCHEME", e.message, e)
            }
        }

        // Function to schedule an alarm
        AsyncFunction("scheduleAlarm") { alarmId: String, timestamp: Long, promise: Promise ->
            try {
                val alarmManager = getAlarmManager()
                if (alarmManager == null) {
                    promise.reject("E_NO_ALARM_MANAGER", "AlarmManager not available", null)
                    return@AsyncFunction
                }

                val operation = createAlarmIntent(alarmId)
                val showIntent = createShowIntent()

                val alarmClockInfo = AlarmManager.AlarmClockInfo(timestamp, showIntent)
                alarmManager.setAlarmClock(alarmClockInfo, operation)

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_SCHEDULE_ALARM", e.message, e)
            }
        }

        // Function to modify an existing alarm
        AsyncFunction("modifyAlarm") { alarmId: String, newTimestamp: Long, promise: Promise ->
            try {
                deleteScheduledAlarmInternal(alarmId)

                val alarmManager = getAlarmManager()
                if (alarmManager == null) {
                    promise.reject("E_NO_ALARM_MANAGER", "AlarmManager not available", null)
                    return@AsyncFunction
                }

                val operation = createAlarmIntent(alarmId)
                val showIntent = createShowIntent()

                val alarmClockInfo = AlarmManager.AlarmClockInfo(newTimestamp, showIntent)
                alarmManager.setAlarmClock(alarmClockInfo, operation)

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_MODIFY_ALARM", e.message, e)
            }
        }

        // Function to delete an alarm
        AsyncFunction("deleteAlarm") { alarmId: String, promise: Promise ->
            try {
                deleteScheduledAlarmInternal(alarmId)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_DELETE_ALARM", e.message, e)
            }
        }
    }

    private fun createAlarmIntent(alarmId: String): PendingIntent {
        val intent = Intent(appContext.reactContext, AlarmReceiver::class.java).apply {
            putExtra("alarm_id", alarmId)
            putExtra("linking_scheme", LINKING_SCHEME)
        }
        return PendingIntent.getBroadcast(
            appContext.reactContext?.applicationContext,
            uuidToInt(alarmId),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun createShowIntent(): PendingIntent? {
        val packageManager = appContext.reactContext?.packageManager
        val packageName = appContext.reactContext?.packageName

        val showIntentRaw = packageManager?.getLaunchIntentForPackage(packageName ?: "")
        showIntentRaw?.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP

        return showIntentRaw?.let { intent ->
            PendingIntent.getActivity(
                appContext.reactContext?.applicationContext,
                0,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }

    private fun getAlarmManager(): AlarmManager? {
        return appContext.reactContext?.getSystemService(Context.ALARM_SERVICE) as? AlarmManager
    }

    private fun deleteScheduledAlarmInternal(alarmId: String) {
        val alarmManager = getAlarmManager()
        val pendingIntent = createAlarmIntent(alarmId)
        alarmManager?.cancel(pendingIntent)
    }

    private fun uuidToInt(stringUuid: String): Int {
        val uuid = UUID.fromString(stringUuid)
        val mostSigBits = uuid.mostSignificantBits
        val leastSigBits = uuid.leastSignificantBits

        // XOR the high and low 64-bit parts, then take the lower 32 bits
        return (mostSigBits xor leastSigBits).toInt()
    }
}
