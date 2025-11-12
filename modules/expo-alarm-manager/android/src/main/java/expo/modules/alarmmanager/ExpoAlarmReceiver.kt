package expo.modules.alarmmanager

import android.Manifest
import android.annotation.SuppressLint
import android.app.*
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.net.toUri

@Suppress("UsePropertyAccessSyntax", "DEPRECATION")
class AlarmReceiver : BroadcastReceiver() {

    companion object {
        private var channelCreated = false
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    @SuppressLint("NewApi")
    override fun onReceive(context: Context, intent: Intent) {
        Log.d("NUDGE_DEBUG", "in onReceive")
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED -> {
                handleBootCompleted(context)
            }

            "expo.modules.alarmmanager.ACTION_SHOW_DOUBLE_CHECK" -> {
                handleDoubleCheckTrigger(context, intent)
            }

            "expo.modules.alarmmanager.ACTION_DISMISS_DOUBLE_CHECK"->{
                val id = intent.getStringExtra("alarm_id") ?: return
                ExpoAlarmManagerModule.handleDismissDoubleDeepLink(id)
            }

            else -> {
                handleAlarmTrigger(context, intent)
            }
        }
    }

    private fun handleBootCompleted(context: Context) {
        val rescheduleRequest =
            androidx.work.OneTimeWorkRequest.Builder(WorkManagerHeadlessJSWorker::class.java).build()
        androidx.work.WorkManager.getInstance(context).enqueueUniqueWork(
            "RescheduleAlarmsWork", androidx.work.ExistingWorkPolicy.REPLACE, rescheduleRequest
        )
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun handleAlarmTrigger(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra("alarm_id") ?: return
        val linkingScheme = intent.getStringExtra("linking_scheme") ?: return

        ensureNotificationChannelExists(context)
        showFullScreenNotification(context, alarmId, linkingScheme)
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun handleDoubleCheckTrigger(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra("alarm_id") ?: return
        val dismissHandler = intent.getStringExtra("dismiss_handler") ?: return
        val linkingScheme = intent.getStringExtra("linking_scheme") ?: return

        ensureNotificationChannelExists(context)
        showDoubleCheckNotification(context, alarmId, dismissHandler, linkingScheme)
    }

    private fun ensureNotificationChannelExists(context: Context) {
        if (!channelCreated && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "alarm_channel", "Alarm Notifications", NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for alarms"
                setBypassDnd(true)
                enableLights(true)
                enableVibration(false)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setShowBadge(true)
                setSound(null, null)
            }
            val doubleCheckChannel = NotificationChannel(
                "double_check_channel", "Double Check Notifications", NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for double checks"
                setBypassDnd(true)
                enableLights(true)
                enableVibration(true)
                lockscreenVisibility = NotificationCompat.VISIBILITY_PUBLIC
                setShowBadge(true)
                setSound(null, null)
            }

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
            notificationManager.createNotificationChannel(doubleCheckChannel)
            channelCreated = true
        }
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun showFullScreenNotification(
        context: Context,
        alarmId: String,
        linkingScheme: String,
    ) {
        val deepLinkIntent = Intent(Intent.ACTION_VIEW).apply {
            data = linkingScheme.toUri()
            flags =
                // I will probably switch to CLEAR_TASK if all else fails. I'd rather it be reliable with subpar UX over good UX but missing an alarm.
                Intent.FLAG_ACTIVITY_NEW_TASK  or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("signal", "ALARM")
            putExtra("alarm_id", alarmId)
            putExtra("alarm_triggered", true)
            putExtra("alarm_timestamp", System.currentTimeMillis())
        }

        val options = ActivityOptions.makeBasic()
        if (Build.VERSION.SDK_INT >= 34) {
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

        val channelId = "alarm_channel"

        val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val isLocked = keyguardManager.isKeyguardLocked


        if (isLocked) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                val notification =
                    NotificationCompat.Builder(context, channelId).setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                        .setContentTitle("Nudge").setContentText("Time to wake up!")
                        .setPriority(NotificationCompat.PRIORITY_MAX).setCategory(NotificationCompat.CATEGORY_ALARM)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC).setOngoing(true).setSound(null).build()

                notification.flags = notification.flags or Notification.FLAG_INSISTENT

                NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)
                context.startActivity(
                    deepLinkIntent,
                )

            } else {
                val notification =
                    NotificationCompat.Builder(context, channelId).setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                        .setContentTitle("Nudge").setContentText("Time to wake up!")
                        .setPriority(NotificationCompat.PRIORITY_MAX).setCategory(NotificationCompat.CATEGORY_ALARM)
                        .setFullScreenIntent(fullScreenPendingIntent, true).setAutoCancel(true)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC).setOngoing(true).setSound(null).build()

                NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)
            }
        } else {
            try {
                val notification =
                    NotificationCompat.Builder(context, channelId).setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                        .setContentTitle("Nudge").setContentText("Time to wake up!")
                        .setPriority(NotificationCompat.PRIORITY_MAX).setCategory(NotificationCompat.CATEGORY_ALARM)
                        .setContentIntent(fullScreenPendingIntent).setAutoCancel(true)
                        .setVisibility(NotificationCompat.VISIBILITY_PUBLIC).setOngoing(true).build()
                NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)

                context.startActivity(deepLinkIntent)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    private fun showDoubleCheckNotification(
        context: Context, alarmId: String, dismissHandler: String, linkingScheme: String
    ) {
        val dismissIntent = Intent(context, AlarmReceiver::class.java).apply {
            action = "expo.modules.alarmmanager.ACTION_DISMISS_DOUBLE_CHECK"
            putExtra("alarm_id", alarmId)
        }

        val dismissPendingIntent = PendingIntent.getActivity(
            context,
            alarmId.hashCode(),
            dismissIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, "double_check_channel")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle("Nudge")
            .setContentText("Tap to dismiss before alarm rings again!").setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM).setFullScreenIntent(dismissPendingIntent, true)
            .setAutoCancel(true).setVisibility(NotificationCompat.VISIBILITY_PUBLIC).setOngoing(true).setSound(null)
            .build()

        NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)
    }
}