package expo.modules.alarmmanager

import android.Manifest
import android.annotation.SuppressLint
import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.net.toUri
import com.facebook.react.HeadlessJsTaskService

@Suppress("UsePropertyAccessSyntax")
class AlarmReceiver : BroadcastReceiver() {
    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    @SuppressLint("NewApi")
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                handleBootCompleted(context, intent)
            }
            else -> {
                handleAlarmTrigger(context, intent)
            }
        }
    }
    private fun handleBootCompleted(context: Context, intent: Intent) {
        val rescheduleRequest = androidx.work.OneTimeWorkRequest.Builder(WorkManagerHeadlessJSWorker::class.java)
            .build()
        androidx.work.WorkManager.getInstance(context).enqueueUniqueWork(
            "RescheduleAlarmsWork",
            androidx.work.ExistingWorkPolicy.REPLACE,
            rescheduleRequest
        )
    }


    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun handleAlarmTrigger(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra("alarm_id") ?: return
        val linkingScheme = intent.getStringExtra("linking_scheme") ?: return
        val shouldVibrate = intent.getBooleanExtra("vibrate", false)

        createNotificationChannels(context)
        showFullScreenNotification(context, alarmId, linkingScheme, shouldVibrate)
    }

    private fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channelWithVibration = NotificationChannel(
                "alarm_channel_vibrate",
                "Alarm Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for alarms"
                setBypassDnd(true)
                enableLights(true)
                enableVibration(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setShowBadge(true)
            }

            val channelWithoutVibration = NotificationChannel(
                "alarm_channel_no_vibrate",
                "Alarm Notifications (Silent)",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for alarms without vibration"
                setBypassDnd(true)
                enableLights(true)
                enableVibration(false)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setShowBadge(true)
            }

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannels(listOf(channelWithVibration, channelWithoutVibration))
        }
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    private fun showFullScreenNotification(
        context: Context,
        alarmId: String,
        linkingScheme: String,
        vibrate: Boolean,
    ) {
        val deepLinkIntent = Intent(Intent.ACTION_VIEW).apply {
            data = "${linkingScheme}/${alarmId}".toUri()
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("alarm_triggered", true)
            putExtra("alarm_id", alarmId)
        }

        val options = ActivityOptions.makeBasic()
        if (Build.VERSION.SDK_INT == 34) {
            options.pendingIntentBackgroundActivityStartMode =
                ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED
        } else {
            options.setPendingIntentCreatorBackgroundActivityStartMode(
                ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED
            )
        }

        val fullScreenPendingIntent = PendingIntent.getActivity(
            context,
            alarmId.hashCode(),
            deepLinkIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            options.toBundle()
        )

        val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val isLocked = keyguardManager.isKeyguardLocked

        val channelId = if (vibrate) "alarm_channel_vibrate" else "alarm_channel_no_vibrate"

        if (isLocked) {
            val notification = NotificationCompat.Builder(context, channelId)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("Nudge")
                .setContentText("Time to wake up!")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setAutoCancel(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .build()

            notification.flags = notification.flags or Notification.FLAG_INSISTENT

            NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)
        } else {
            try {
                val notification = NotificationCompat.Builder(context, channelId)
                    .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                    .setContentTitle("Nudge")
                    .setContentText("Time to wake up!")
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setContentIntent(fullScreenPendingIntent)
                    .setAutoCancel(true)
                    .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                    .setOngoing(true)
                    .build()
                NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)

                context.startActivity(deepLinkIntent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
