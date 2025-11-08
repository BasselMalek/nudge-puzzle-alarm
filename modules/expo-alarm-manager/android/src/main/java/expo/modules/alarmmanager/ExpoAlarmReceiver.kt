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

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
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
            data = "${linkingScheme}/${alarmId}".toUri()
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_RESET_TASK_IF_NEEDED
            putExtra("alarm_triggered", true)
            putExtra("alarm_id", alarmId)
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
}