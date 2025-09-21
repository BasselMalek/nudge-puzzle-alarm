package expo.modules.alarmmanager

import android.annotation.SuppressLint
import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.net.toUri
import androidx.media3.common.AudioAttributes
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.ExoPlayer
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.util.*

@UnstableApi
class ExpoAlarmManagerModule : Module() {

    companion object {
        private var LINKING_SCHEME: String? = null
        const val REQUEST_CODE_RINGTONE = 42
    }

    private var uriSelectionPendingPromise: Promise? = null
    private var alarmPlayer: AlarmPlayerInstance? = null

    @SuppressLint("MissingPermission")
    override fun definition() = ModuleDefinition {
        Name("ExpoAlarmManager")
        Events("onPlaybackFinished", "onPlaybackError")

        AsyncFunction("setLinkingScheme") { scheme: String, promise: Promise ->
            try {
                LINKING_SCHEME = scheme
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_SET_LINKING_SCHEME", "Failed to set linking scheme", e)
            }
        }

        //--------------------------------------------------------------------------------------------------------------
        //Alarm Management


        AsyncFunction("scheduleAlarm") { alarmId: String, timestamp: Long, vibrate: Boolean, promise: Promise ->
            try {
                if (timestamp <= System.currentTimeMillis()) {
                    return@AsyncFunction promise.reject("E_INVALID_TIMESTAMP", "Timestamp must be in the future", null)
                }
                try {
                    UUID.fromString(alarmId)
                } catch (e: IllegalArgumentException) {
                    return@AsyncFunction promise.reject("E_INVALID_ALARM_ID", "Invalid alarm ID format", e)
                }

                val mgr = getAlarmManager()
                    ?: return@AsyncFunction promise.reject("E_NO_ALARM_MANAGER", "AlarmManager not available", null)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !mgr.canScheduleExactAlarms()) {
                    return@AsyncFunction promise.reject(
                        "E_NO_EXACT_ALARM_PERMISSION",
                        "SCHEDULE_EXACT_ALARM permission required",
                        null
                    )
                }
                mgr.setAlarmClock(
                    AlarmManager.AlarmClockInfo(timestamp, createShowIntent()),
                    createAlarmIntent(alarmId, vibrate)
                )
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_SCHEDULE_ALARM", "Failed to schedule alarm", e)
            }
        }

        AsyncFunction("pickAlarmTone") { existingUri: String?, promise: Promise ->
            try {
                if (uriSelectionPendingPromise != null) {
                    return@AsyncFunction promise.reject("E_PICKER_IN_USE", "Ringtone picker already in use", null)
                }
                val currentActivity = appContext.currentActivity
                    ?: return@AsyncFunction promise.reject("E_NO_ACTIVITY", "No current activity", null)

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

        OnActivityResult { _, payload ->
            val currentPromise = uriSelectionPendingPromise
            if (payload.requestCode == REQUEST_CODE_RINGTONE && currentPromise != null) {
                try {
                    if (payload.resultCode == android.app.Activity.RESULT_OK) {
                        val uri: Uri? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                            payload.data?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI, Uri::class.java)
                        } else {
                            @Suppress("DEPRECATION")
                            payload.data?.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI)
                        }
                        currentPromise.resolve(uri?.toString() ?: "")
                    } else {
                        currentPromise.reject("E_CANCELED", "User canceled ringtone picker", null)
                    }
                } catch (e: Exception) {
                    currentPromise.reject("E_ACTIVITY_RESULT", "Failed to process activity result", e)
                } finally {
                    uriSelectionPendingPromise = null
                }
            }
        }

        AsyncFunction("modifyAlarm") { alarmId: String, newTimestamp: Long, vibrate: Boolean, promise: Promise ->
            try {
                if (newTimestamp <= System.currentTimeMillis()) {
                    return@AsyncFunction promise.reject("E_INVALID_TIMESTAMP", "Timestamp must be in the future", null)
                }
                try {
                    UUID.fromString(alarmId)
                } catch (e: IllegalArgumentException) {
                    return@AsyncFunction promise.reject("E_INVALID_ALARM_ID", "Invalid alarm ID format", e)
                }
                deleteScheduledAlarmInternal(alarmId, vibrate)

                val mgr = getAlarmManager()
                    ?: return@AsyncFunction promise.reject("E_NO_ALARM_MANAGER", "AlarmManager not available", null)

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !mgr.canScheduleExactAlarms()) {
                    return@AsyncFunction promise.reject(
                        "E_NO_EXACT_ALARM_PERMISSION",
                        "SCHEDULE_EXACT_ALARM permission required",
                        null
                    )
                }
                mgr.setAlarmClock(
                    AlarmManager.AlarmClockInfo(newTimestamp, createShowIntent()),
                    createAlarmIntent(alarmId, vibrate)
                )
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_MODIFY_ALARM", "Failed to modify alarm", e)
            }
        }

        AsyncFunction("deleteAlarm") { alarmId: String, vibrate: Boolean, promise: Promise ->
            try {
                try {
                    UUID.fromString(alarmId)
                } catch (e: IllegalArgumentException) {
                    return@AsyncFunction promise.reject("E_INVALID_ALARM_ID", "Invalid alarm ID format", e)
                }
                deleteScheduledAlarmInternal(alarmId, vibrate)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("E_DELETE_ALARM", "Failed to delete alarm", e)
            }
        }


        //--------------------------------------------------------------------------------------------------------------
        //Alarm Audio Player

        AsyncFunction("createPlayer") { promise: Promise ->
            try {
                val playerId = UUID.randomUUID().toString()
                val context = appContext.reactContext
                    ?: return@AsyncFunction promise.reject("E_NO_CONTEXT", "No React context available", null)
                alarmPlayer = AlarmPlayerInstance(context, playerId, this@ExpoAlarmManagerModule)
                promise.resolve(playerId)
            } catch (e: Exception) {
                promise.reject("E_CREATE_PLAYER", "Failed to create player: ${e.message}", e)
            }
        }

        AsyncFunction("setPlayerSource") { src: String, promise: Promise ->
            try {
                if (src.isEmpty()) {
                    return@AsyncFunction promise.reject("E_INVALID_SOURCE", "Source URL cannot be empty", null)
                }
                val player = alarmPlayer
                    ?: return@AsyncFunction promise.reject("E_PLAYER_NOT_FOUND", "No active player", null)
                player.setSource(src)
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_SET_SOURCE", "Failed to set player source", e)
            }
        }

        AsyncFunction("playPlayer") { promise: Promise ->
            try {
                val player = alarmPlayer
                    ?: return@AsyncFunction promise.reject("E_PLAYER_NOT_FOUND", "No active player", null)
                player.play()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_PLAY_PLAYER", "Failed to play", e)
            }
        }

        AsyncFunction("stopPlayer") { promise: Promise ->
            try {
                val player = alarmPlayer
                    ?: return@AsyncFunction promise.reject("E_PLAYER_NOT_FOUND", "No active player", null)
                player.stop()
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_STOP_PLAYER", "Failed to stop player", e)
            }
        }

        AsyncFunction("releasePlayer") { promise: Promise ->
            try {
                val player = alarmPlayer
                if (player != null) {
                    player.release()
                    alarmPlayer = null
                    promise.resolve(null)
                } else {
                    promise.reject("E_PLAYER_NOT_FOUND", "No active player", null)
                }
            } catch (e: Exception) {
                alarmPlayer = null
                promise.reject("E_RELEASE_PLAYER", "Failed to release player", e)
            }
        }

        AsyncFunction("setPlayerVolume") { volume: Double, promise: Promise ->
            try {
                if (volume !in 0.0..1.0) {
                    return@AsyncFunction promise.reject("E_INVALID_VOLUME", "Volume must be between 0.0 and 1.0", null)
                }
                val player = alarmPlayer
                    ?: return@AsyncFunction promise.reject("E_PLAYER_NOT_FOUND", "No active player", null)
                player.setVolume(volume.toFloat())
                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("E_SET_VOLUME", "Failed to set volume", e)
            }
        }

        AsyncFunction("isPlayerFinished") { promise: Promise ->
            try {
                val player = alarmPlayer
                    ?: return@AsyncFunction promise.reject("E_PLAYER_NOT_FOUND", "No active player", null)
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
                uriSelectionPendingPromise = null
            }
        }
    }

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

    private fun createAlarmIntent(alarmId: String, vibrate: Boolean): PendingIntent {
        val context = appContext.reactContext ?: throw IllegalStateException("React context is null")
        val intent = Intent(context, AlarmReceiver::class.java).apply {
            action = "expo.modules.alarmmanager.ACTION_ALARM"
            data = null
            putExtra("alarm_id", alarmId)
            putExtra("linking_scheme", LINKING_SCHEME)
            putExtra("vibrate", vibrate)
        }
        return PendingIntent.getBroadcast(
            context.applicationContext,
            uuidToInt(alarmId),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun createShowIntent(): PendingIntent? {
        val context = appContext.reactContext ?: return null
        val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
        launch?.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        return launch?.let {
            PendingIntent.getActivity(
                context.applicationContext,
                0,
                it,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
        }
    }

    private fun getAlarmManager(): AlarmManager? =
        appContext.reactContext?.getSystemService(Context.ALARM_SERVICE) as? AlarmManager


    private fun deleteScheduledAlarmInternal(alarmId: String, vibrate: Boolean) {
        val ctx = appContext.reactContext ?: return
        val mgr = getAlarmManager() ?: return

        val intent = Intent(ctx, AlarmReceiver::class.java).apply {
            action = "expo.modules.alarmmanager.ACTION_ALARM"
            data = null
            putExtra("alarm_id", alarmId)
            putExtra("vibrate", vibrate)
            putExtra("linking_scheme", LINKING_SCHEME)
        }

        val req = uuidToInt(alarmId)
        val existing = PendingIntent.getBroadcast(
            ctx.applicationContext,
            req,
            intent,
            PendingIntent.FLAG_NO_CREATE or PendingIntent.FLAG_IMMUTABLE
        )
        mgr.cancel(existing)
        existing.cancel()

    }


    private fun uuidToInt(id: String): Int {
        val u = UUID.fromString(id)
        return (u.mostSignificantBits xor u.leastSignificantBits).toInt()
    }
}

@UnstableApi
class AlarmPlayerInstance(
    context: Context,
    private val playerId: String,
    private val module: ExpoAlarmManagerModule
) {
    private var exoPlayer: ExoPlayer? = null
    private var finished = false
    private var isReleased = false

    init {
        try {
            val attrs = AudioAttributes.Builder()
                .setUsage(androidx.media3.common.C.USAGE_ALARM)
                .setContentType(androidx.media3.common.C.AUDIO_CONTENT_TYPE_SONIFICATION)
                .build()

            exoPlayer = ExoPlayer.Builder(context)
                .setAudioAttributes(attrs, false)
                .build()
            exoPlayer?.repeatMode = Player.REPEAT_MODE_ONE
            exoPlayer?.addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(state: Int) {
                    if (isReleased) return
                    when (state) {
                        Player.STATE_ENDED -> {
                            finished = true
                            module.sendPlaybackFinished(playerId)
                        }

                        Player.STATE_READY -> finished = false
                    }
                }

                override fun onPlayerError(error: PlaybackException) {
                    if (!isReleased) {
                        module.sendPlaybackError(playerId, error.message ?: "Unknown playback error")
                    }
                }
            })
        } catch (e: Exception) {
            isReleased = true
            module.sendPlaybackError(playerId, "Failed to initialize player: ${e.message}")
        }
    }

    fun setSource(src: String) {
        if (isReleased || exoPlayer == null) throw IllegalStateException("Player has been released")
        val item = MediaItem.fromUri(src.toUri())
        exoPlayer?.setMediaItem(item)
        exoPlayer?.prepare()
        finished = false
    }

    fun play() {
        if (isReleased || exoPlayer == null) throw IllegalStateException("Player has been released")
        exoPlayer?.play()
        finished = false
    }

    fun stop() {
        if (isReleased) return
        exoPlayer?.stop()
        finished = true
    }

    fun release() {
        if (isReleased) return
        isReleased = true
        exoPlayer?.release()
        exoPlayer = null
    }

    fun setVolume(v: Float) {
        if (isReleased || exoPlayer == null) throw IllegalStateException("Player has been released")
        exoPlayer?.volume = v.coerceIn(0f, 1f)
    }

    fun isFinished(): Boolean = finished || isReleased
}
