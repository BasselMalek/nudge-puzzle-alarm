package expo.modules.alarmmanager

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.AlarmManager
import android.app.NotificationManager
import android.app.KeyguardManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.provider.Settings
import android.util.Log
import android.view.WindowManager
import androidx.annotation.RequiresPermission
import androidx.core.net.toUri
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.*


@Suppress("DEPRECATION")
class ExpoAlarmManagerModule : Module() {

    companion object {
        private var LINKING_SCHEME: String? = null
        const val REQUEST_CODE_RINGTONE = 42
        const val REQUEST_CODE_APP_PICKER = 69
        private const val TAG = "NUDGE_DEBUG"
        private var instance: ExpoAlarmManagerModule? = null
        private var activeAlarm: Map<String, Any>? = null

        fun handleAlarmDeepLink(alarmId: String) {
            Log.d(TAG, "Deep link handler: alarm with id $alarmId")
            instance?.sendAlarmDeepLinkEvent(alarmId)
        }

        fun handleDismissDoubleDeepLink(id: String) {
            Log.d(TAG, "Deep link handler: dismissDouble with id $id")
            instance?.sendDismissDoubleDeepLinkEvent(id)
        }
    }

    private var uriSelectionPendingPromise: Promise? = null
    private var alarmPlayer: AlarmPlayerInstance? = null
    private var currentPlayerId: String? = null

    @SuppressLint("MissingPermission", "QueryPermissionsNeeded")
    override fun definition() = ModuleDefinition {
        Name("ExpoAlarmManager")

        Events("onPlaybackFinished", "onPlaybackError", "onAlarmDeepLink", "onDismissDoubleDeepLink")

        OnCreate {
            instance = this@ExpoAlarmManagerModule
            val initAlarm = ExpoAlarmManagerReactActivityLifecycleListener.initialAlarm;
            initAlarm?.let {
                handleAlarmDeepLink(it)
                ExpoAlarmManagerReactActivityLifecycleListener.initialAlarm = null
            }
            ExpoAlarmManagerReactActivityLifecycleListener.initialDismiss?.let {
                handleDismissDoubleDeepLink(it)
                ExpoAlarmManagerReactActivityLifecycleListener.initialDismiss = null
            }
        }

        //==============================================================================================================
        // DEEP LINK HANDLERS
        //==============================================================================================================

        AsyncFunction("checkAndNullifyActiveAlarm") { promise: Promise ->
            val alarm = activeAlarm
            activeAlarm = null
            promise.resolve(alarm)
        }

        //==============================================================================================================
        // ALARM MANAGEMENT
        //==============================================================================================================

        Function("setLinkingScheme") { scheme: String ->
            LINKING_SCHEME = scheme
        }

        AsyncFunction("scheduleAlarm") { alarmId: String, timestamp: Long, promise: Promise ->
            try {
                if (timestamp <= System.currentTimeMillis()) {
                    return@AsyncFunction promise.reject("E_INVALID_TIMESTAMP", "Timestamp must be in the future", null)
                }
                try {
                    UUID.fromString(alarmId)
                } catch (e: IllegalArgumentException) {
                    return@AsyncFunction promise.reject("E_INVALID_ALARM_ID", "Invalid alarm ID format", e)
                }

                val mgr = getAlarmManager() ?: return@AsyncFunction promise.reject(
                    "E_NO_ALARM_MANAGER", "AlarmManager not available", null
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !mgr.canScheduleExactAlarms()) {
                    return@AsyncFunction promise.reject(
                        "E_NO_EXACT_ALARM_PERMISSION", "SCHEDULE_EXACT_ALARM permission required", null
                    )
                }
                mgr.setAlarmClock(
                    AlarmManager.AlarmClockInfo(timestamp, createShowIntent()), createAlarmIntent(alarmId)
                )
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_SCHEDULE_ALARM", "Failed to schedule alarm", e)
            }
        }

        AsyncFunction("scheduleDoubleCheck") { alarmId: String, dismissHandler: String, delayPeriod: Long, gracePeriod: Long, promise: Promise ->
            try {
                try {
                    UUID.fromString(alarmId)
                } catch (e: IllegalArgumentException) {
                    return@AsyncFunction promise.reject("E_INVALID_ALARM_ID", "Invalid alarm ID format", e)
                }

                val mgr = getAlarmManager() ?: return@AsyncFunction promise.reject(
                    "E_NO_ALARM_MANAGER", "AlarmManager not available", null
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !mgr.canScheduleExactAlarms()) {
                    return@AsyncFunction promise.reject(
                        "E_NO_EXACT_ALARM_PERMISSION", "SCHEDULE_EXACT_ALARM permission required", null
                    )
                }

                val context = appContext.reactContext ?: return@AsyncFunction promise.reject(
                    "E_NO_CONTEXT", "React context is null", null
                )

                val intent = Intent(context, AlarmReceiver::class.java).apply {
                    action = "expo.modules.alarmmanager.ACTION_SHOW_DOUBLE_CHECK"
                    putExtra("alarm_id", alarmId)
                    putExtra("dismiss_handler", dismissHandler)
                    putExtra("linking_scheme", LINKING_SCHEME)
                }

                val pendingIntent = PendingIntent.getBroadcast(
                    context.applicationContext,
                    uuidToInt(alarmId),
                    intent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )

                mgr.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP, System.currentTimeMillis() + delayPeriod, pendingIntent
                )

                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_SCHEDULE_ALARM", "Failed to schedule alarm", e)
            }
        }

        AsyncFunction("modifyAlarm") { alarmId: String, newTimestamp: Long, promise: Promise ->
            try {
                if (newTimestamp <= System.currentTimeMillis()) {
                    return@AsyncFunction promise.reject("E_INVALID_TIMESTAMP", "Timestamp must be in the future", null)
                }
                try {
                    UUID.fromString(alarmId)
                } catch (e: IllegalArgumentException) {
                    return@AsyncFunction promise.reject("E_INVALID_ALARM_ID", "Invalid alarm ID format", e)
                }
                deleteScheduledAlarmInternal(alarmId)

                val mgr = getAlarmManager() ?: return@AsyncFunction promise.reject(
                    "E_NO_ALARM_MANAGER", "AlarmManager not available", null
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !mgr.canScheduleExactAlarms()) {
                    return@AsyncFunction promise.reject(
                        "E_NO_EXACT_ALARM_PERMISSION", "SCHEDULE_EXACT_ALARM permission required", null
                    )
                }
                mgr.setAlarmClock(
                    AlarmManager.AlarmClockInfo(newTimestamp, createShowIntent()), createAlarmIntent(alarmId)
                )
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_MODIFY_ALARM", "Failed to modify alarm", e)
            }
        }

        AsyncFunction("deleteAlarm") { alarmId: String, promise: Promise ->
            try {
                try {
                    UUID.fromString(alarmId)
                } catch (e: IllegalArgumentException) {
                    return@AsyncFunction promise.reject("E_INVALID_ALARM_ID", "Invalid alarm ID format", e)
                }
                deleteScheduledAlarmInternal(alarmId)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_DELETE_ALARM", "Failed to delete alarm", e)
            }
        }

        //==============================================================================================================
        // BRIDGE HELPERS
        //==============================================================================================================

        AsyncFunction("pickAlarmTone") { existingUri: String?, promise: Promise ->
            try {
                if (uriSelectionPendingPromise != null) {
                    return@AsyncFunction promise.reject("E_PICKER_IN_USE", "Ringtone picker already in use", null)
                }
                val currentActivity = appContext.currentActivity ?: return@AsyncFunction promise.reject(
                    "E_NO_ACTIVITY", "No current activity", null
                )

                val systemUiRingtonePickerIntent = Intent(RingtoneManager.ACTION_RINGTONE_PICKER).apply {
                    putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALARM)
                    putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, "Select Alarm Sound")
                    putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, true)
                    putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true)
                    existingUri?.takeIf { it.isNotEmpty() }?.let {
                        try {
                            putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, it.toUri())
                        } catch (_: Exception) {
                        }
                    }
                }
                uriSelectionPendingPromise = promise
                currentActivity.startActivityForResult(systemUiRingtonePickerIntent, REQUEST_CODE_RINGTONE)
            } catch (e: Exception) {
                uriSelectionPendingPromise = null
                promise.reject("E_PICK_ALARM_TONE", "Failed to open ringtone picker", e)
            }
        }

        AsyncFunction("getLaunchableApps") { promise: Promise ->
            try {
                if (uriSelectionPendingPromise != null) {
                    return@AsyncFunction promise.reject("E_PICKER_IN_USE", "App picker already in use", null)
                }
                val currentActivity = appContext.currentActivity ?: return@AsyncFunction promise.reject(
                    "E_NO_ACTIVITY", "No current activity", null
                )

                val mainIntent = Intent(Intent.ACTION_MAIN).apply {
                    addCategory(Intent.CATEGORY_LAUNCHER)
                }

                val pickIntent = Intent(Intent.ACTION_PICK_ACTIVITY).apply {
                    putExtra(Intent.EXTRA_INTENT, mainIntent)
                    putExtra(Intent.EXTRA_TITLE, "Select an App")
                }

                uriSelectionPendingPromise = promise
                currentActivity.startActivityForResult(pickIntent, REQUEST_CODE_APP_PICKER)
            } catch (e: Exception) {
                uriSelectionPendingPromise = null
                promise.reject("E_PICK_APP", "Failed to open app picker", e)
            }
        }

        OnActivityResult { _, payload ->
            val currentPromise = uriSelectionPendingPromise

            if (payload.requestCode == REQUEST_CODE_RINGTONE && currentPromise != null) {
                try {
                    if (payload.resultCode == Activity.RESULT_OK) {
                        val uri: Uri? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            payload.data?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI, Uri::class.java)
                        } else {
                            @Suppress("DEPRECATION") payload.data?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)
                        }
                        if (uri?.toString() == "") {
                            currentPromise.resolve(arrayOf("", ""))
                        } else {
                            val ring = RingtoneManager.getRingtone(appContext.reactContext, uri)
                            currentPromise.resolve(
                                arrayOf(
                                    uri.toString(), ring.getTitle(appContext.reactContext)
                                )
                            )
                        }
                    } else {
                        currentPromise.reject("E_CANCELED", "User canceled ringtone picker", null)
                    }
                } catch (e: Exception) {
                    currentPromise.reject("E_ACTIVITY_RESULT", "Failed to process activity result", e)
                } finally {
                    uriSelectionPendingPromise = null
                }
            } else if (payload.requestCode == REQUEST_CODE_APP_PICKER && currentPromise != null) {
                try {
                    if (payload.resultCode == Activity.RESULT_OK) {
                        val componentName = payload.data?.component
                        val packageName = componentName?.packageName ?: ""
                        val className = componentName?.className ?: ""
                        val packageManager = appContext.reactContext?.packageManager
                        val appLabel = try {
                            packageManager?.getApplicationInfo(packageName, 0)?.let { appInfo ->
                                packageManager.getApplicationLabel(appInfo).toString()
                            } ?: packageName
                        } catch (_: Exception) {
                            packageName
                        }
                        currentPromise.resolve(
                            mapOf(
                                "packageName" to packageName, "className" to className, "label" to appLabel
                            )
                        )
                    } else {
                        currentPromise.reject("E_CANCELED", "User canceled app picker", null)
                    }
                } catch (e: Exception) {
                    currentPromise.reject("E_ACTIVITY_RESULT", "Failed to process app picker result", e)
                } finally {
                    uriSelectionPendingPromise = null
                }
            }
        }

        AsyncFunction("setShowWhenLocked") { show: Boolean, id: String?, promise: Promise ->
            try {
                showWhenLockedAndTurnOn(show)
                if (!show && id != null) {
                    val notificationManager =
                        appContext.reactContext?.let { it.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager }
                    notificationManager?.cancel(id.hashCode())
                }
                promise.resolve()
            } catch (e: Exception) {
                promise.reject(TAG, "Error", e)
            }
        }

        Function("requestKeyguardDismiss") {
            val activity = appContext.currentActivity
            activity?.runOnUiThread {
                val keyguardManager = activity.getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager
                if (keyguardManager != null) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        keyguardManager.requestDismissKeyguard(activity, null)
                    } else {
                        activity.window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
                    }
                }
            }
        }

        Function("requestFullScreenAlertsPerm") {
            try {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                    return@Function null
                }
                val currentActivity = appContext.currentActivity
                val notificationManager =
                    appContext.reactContext?.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                if (!notificationManager.canUseFullScreenIntent()) {
                    val intent = Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT).apply {
                        data = "package:${appContext.reactContext!!.packageName}".toUri()
                    }
                    currentActivity?.startActivity(intent)
                }
            } catch (e: Exception) {
                e.message?.let { Log.e("NUDGE", it) }
            }
        }

        Function("requestScheduleExactPerm") {
            try {
                val currentActivity = appContext.currentActivity
                val permGranted = getAlarmManager()?.canScheduleExactAlarms()
                if (!permGranted!!) {
                    val intent = Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM).apply {
                        data = "package:${appContext.reactContext!!.packageName}".toUri()
                    }
                    currentActivity?.startActivity(intent)
                }
            } catch (e: Exception) {
                e.message?.let { Log.e("NUDGE", it) }
            }
        }

        Function("requestOverlayPerm") {
            try {
                val currentActivity = appContext.currentActivity
                if (!Settings.canDrawOverlays(currentActivity)) {
                    val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION)
                    currentActivity?.startActivity(intent)
                }
            } catch (e: Exception) {
                e.message?.let { Log.e("NUDGE", it) }
            }
        }

        //==============================================================================================================
        // PLAYER FUNCTIONS
        //==============================================================================================================
        AsyncFunction("createPlayer") { promise: Promise ->
            try {
                if (alarmPlayer != null) {
                    return@AsyncFunction promise.reject(
                        "E_PLAYER_EXISTS",
                        "Player already exists. Must release existing player before creating new one.",
                        null
                    )
                }
                val playerId = UUID.randomUUID().toString()
                val context = appContext.reactContext ?: return@AsyncFunction promise.reject(
                    "E_NO_CONTEXT", "No React context available", null
                )
                alarmPlayer = AlarmPlayerInstance(context, playerId, this@ExpoAlarmManagerModule)
                currentPlayerId = playerId
                Log.d(TAG, "Created player with ID: $playerId")
                promise.resolve(playerId)
            } catch (e: Exception) {
                alarmPlayer = null
                currentPlayerId = null
                promise.reject("E_CREATE_PLAYER", "Failed to create player: ${e.message}", e)
            }
        }

        AsyncFunction("setPlayerSource") { playerId: String, src: String, promise: Promise ->
            try {
                if (src.isEmpty()) {
                    return@AsyncFunction promise.reject("E_INVALID_SOURCE", "Source URL cannot be empty", null)
                }

                if (playerId != currentPlayerId) {
                    return@AsyncFunction promise.reject(
                        "E_PLAYER_MISMATCH",
                        "Player ID mismatch. Expected: $currentPlayerId, Got: $playerId",
                        null
                    )
                }
                val player = alarmPlayer ?: return@AsyncFunction promise.reject(
                    "E_PLAYER_NOT_FOUND", "No active player", null
                )
                player.setSource(src)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_SET_SOURCE", "Failed to set player source", e)
            }
        }

        AsyncFunction("setPlayerVibration") { playerId: String, enabled: Boolean, promise: Promise ->
            try {
                if (playerId != currentPlayerId) {
                    return@AsyncFunction promise.reject(
                        "E_PLAYER_MISMATCH",
                        "Player ID mismatch. Expected: $currentPlayerId, Got: $playerId",
                        null
                    )
                }
                val player = alarmPlayer ?: return@AsyncFunction promise.reject(
                    "E_PLAYER_NOT_FOUND", "No active player", null
                )
                player.setVibrationEnabled(enabled)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_SET_VIBRATION", "Failed to set vibration", e)
            }
        }

        AsyncFunction("playPlayer") { playerId: String, promise: Promise ->
            try {
                if (playerId != currentPlayerId) {
                    return@AsyncFunction promise.reject(
                        "E_PLAYER_MISMATCH",
                        "Player ID mismatch. Expected: $currentPlayerId, Got: $playerId",
                        null
                    )
                }
                val player = alarmPlayer ?: return@AsyncFunction promise.reject(
                    "E_PLAYER_NOT_FOUND", "No active player", null
                )
                player.play()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_PLAY_PLAYER", "Failed to play", e)
            }
        }

        AsyncFunction("stopPlayer") { playerId: String, promise: Promise ->
            try {
                if (playerId != currentPlayerId) {
                    return@AsyncFunction promise.reject(
                        "E_PLAYER_MISMATCH",
                        "Player ID mismatch. Expected: $currentPlayerId, Got: $playerId",
                        null
                    )
                }
                val player = alarmPlayer ?: return@AsyncFunction promise.reject(
                    "E_PLAYER_NOT_FOUND", "No active player to stop", null
                )
                player.stop()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_STOP_PLAYER", "Failed to stop player", e)
            }
        }

        AsyncFunction("releasePlayer") { playerId: String, promise: Promise ->
            try {
                if (playerId != currentPlayerId) {
                    return@AsyncFunction promise.reject(
                        "E_PLAYER_MISMATCH",
                        "Player ID mismatch. Expected: $currentPlayerId, Got: $playerId",
                        null
                    )
                }
                val player = alarmPlayer ?: return@AsyncFunction promise.reject(
                    "E_PLAYER_NOT_FOUND", "No active player to release", null
                )
                player.stop()
                player.release()
                alarmPlayer = null
                currentPlayerId = null
                Log.d(TAG, "Released player: $playerId")
                promise.resolve(null)
            } catch (e: Exception) {
                alarmPlayer = null
                currentPlayerId = null
                promise.reject("E_RELEASE_PLAYER", "Failed to release player", e)
            }
        }

        AsyncFunction("isPlayerFinished") { playerId: String, promise: Promise ->
            try {
                if (playerId != currentPlayerId) {
                    return@AsyncFunction promise.reject(
                        "E_PLAYER_MISMATCH",
                        "Player ID mismatch. Expected: $currentPlayerId, Got: $playerId",
                        null
                    )
                }
                val player = alarmPlayer ?: return@AsyncFunction promise.reject(
                    "E_PLAYER_NOT_FOUND", "No active player", null
                )
                promise.resolve(player.isFinished())
            } catch (e: Exception) {
                promise.reject("E_CHECK_FINISHED", "Failed to check if player is finished", e)
            }
        }

        OnDestroy {
            try {
                alarmPlayer?.release()
            } finally {
                alarmPlayer = null
                currentPlayerId = null
                uriSelectionPendingPromise = null
                instance = null
            }
        }
    }

    //==================================================================================================================
    // INTERNAL HELPERS
    //==================================================================================================================

    fun sendPlaybackFinished(playerId: String) {
        try {
            sendEvent("onPlaybackFinished", mapOf("playerId" to playerId))
        } catch (_: Exception) {
        }
    }

    fun sendPlaybackError(playerId: String, error: String) {
        try {
            sendEvent("onPlaybackError", mapOf("playerId" to playerId, "error" to error))
        } catch (_: Exception) {
        }
    }

    private fun sendAlarmDeepLinkEvent(alarmId: String) {
        try {
            Log.d(TAG, "Sending onAlarmDeepLink event with id: $alarmId")
            activeAlarm = mapOf(
                "type" to "alarm", "alarmId" to alarmId
            )
            sendEvent(
                "onAlarmDeepLink", mapOf(
                    "alarmId" to alarmId,
                )
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send alarm deep link event", e)
        }
    }

    private fun sendDismissDoubleDeepLinkEvent(alarmId: String) {
        try {
            Log.d(TAG, "Sending onDismissDoubleDeepLink event with id: $alarmId")
            activeAlarm = mapOf(
                "type" to "dismiss", "alarmId" to alarmId
            )
            sendEvent(
                "onDismissDoubleDeepLink", mapOf(
                    "alarmId" to alarmId,
                )
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send dismiss double deep link event", e)
        }
    }

    private fun createAlarmIntent(alarmId: String): PendingIntent {
        val context = appContext.reactContext ?: throw IllegalStateException("React context is null")

        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = "expo.modules.alarmmanager.ACTION_ALARM"
            putExtra("alarm_id", alarmId)
            putExtra("linking_scheme", LINKING_SCHEME)
        }

        return PendingIntent.getBroadcast(
            context.applicationContext,
            uuidToInt(alarmId),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun showWhenLockedAndTurnOn(show: Boolean) {
        val activity = appContext.currentActivity
        activity?.runOnUiThread {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
                activity.setTurnScreenOn(show)
                activity.setShowWhenLocked(show)
            } else {
                if (show) {
                    activity.window.addFlags(
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                    )
                } else {
                    activity.window.clearFlags(
                        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                    )
                }
            }
        }
    }

    private fun createShowIntent(): PendingIntent? {
        val context = appContext.reactContext ?: return null
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
        launch?.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        return launch?.let {
            PendingIntent.getActivity(
                context.applicationContext, 0, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }

    private fun getAlarmManager(): AlarmManager? =
        appContext.reactContext?.getSystemService(Context.ALARM_SERVICE) as? AlarmManager

    private fun deleteScheduledAlarmInternal(alarmId: String) {
        val ctx = appContext.reactContext ?: return
        val mgr = getAlarmManager() ?: return

        val intent = Intent(ctx, AlarmReceiver::class.java).apply {
            action = "expo.modules.alarmmanager.ACTION_ALARM"
            data = null
            putExtra("alarm_id", alarmId)
            putExtra("linking_scheme", LINKING_SCHEME)
        }

        val req = uuidToInt(alarmId)
        val existing = PendingIntent.getBroadcast(
            ctx.applicationContext, req, intent, PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        mgr.cancel(existing)
        existing.cancel()
    }

    private fun uuidToInt(id: String): Int {
        val u = UUID.fromString(id)
        return (u.mostSignificantBits xor u.leastSignificantBits).toInt()
    }
}

//======================================================================================================================
// PLAYER IMPLEMENTATION (Ringtone)
//======================================================================================================================

class AlarmPlayerInstance(
    private val context: Context, private val playerId: String, private val module: ExpoAlarmManagerModule
) {
    private var ringtone: Ringtone? = null
    private var vibrator: Vibrator? = null
    private var isReleased = false
    private var shouldVibrate = false

    init {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            vibratorManager.defaultVibrator
        } else {
            @Suppress("DEPRECATION") context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
    }

    fun setVibrationEnabled(enabled: Boolean) {
        shouldVibrate = enabled
    }

    fun setSource(src: String?) {
        if (isReleased) throw IllegalStateException("Player has been released")

        try {
            ringtone?.stop()
            ringtone = null

            if (src != null) {
                ringtone = RingtoneManager.getRingtone(context, src.toUri())
                ringtone?.audioAttributes = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
            }
        } catch (e: Exception) {
            module.sendPlaybackError(playerId, "Failed to set source: ${e.message}")
            throw e
        }
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun play() {
        if (isReleased) throw IllegalStateException("Player has been released")

        try {
            if (ringtone != null) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                    ringtone?.isLooping = true
                }
                ringtone?.play()
            }
            if (shouldVibrate && vibrator?.hasVibrator() == true) {
                startVibration()
            }
        } catch (e: Exception) {
            module.sendPlaybackError(playerId, "Failed to play: ${e.message}")
            throw e
        }
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun stop() {
        if (isReleased) return
        ringtone?.stop()
        vibrator?.cancel()
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    fun release() {
        Log.d("NUDGE_DEBUG", "alarm player released")
        if (isReleased) return
        isReleased = true
        ringtone?.stop()
        ringtone = null
        vibrator?.cancel()
        vibrator = null
    }

    fun isFinished(): Boolean {
        return isReleased || (ringtone == null || ringtone?.isPlaying == false)
    }

    @RequiresPermission(Manifest.permission.VIBRATE)
    private fun startVibration() {
        val pattern = longArrayOf(0, 1000, 500)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val effect = VibrationEffect.createWaveform(pattern, 0)
            vibrator?.vibrate(effect)
        } else {
            @Suppress("DEPRECATION") vibrator?.vibrate(pattern, 0)
        }
    }
}
