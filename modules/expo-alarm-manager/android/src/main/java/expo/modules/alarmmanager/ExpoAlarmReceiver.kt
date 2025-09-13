package expo.modules.alarmmanager

import android.Manifest
import android.annotation.SuppressLint
import android.app.ActivityOptions
import android.app.KeyguardManager
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.annotation.RequiresPermission
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.net.toUri

@Suppress("UsePropertyAccessSyntax")
class AlarmReceiver : BroadcastReceiver() {
    @SuppressLint("NewApi")
    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    override fun onReceive(context: Context, intent: Intent) {
        val alarmId = intent.getStringExtra("alarm_id") ?: return
        val linkingScheme = intent.getStringExtra("linking_scheme") ?: return
        
        createNotificationChannel(context)
        showFullScreenNotification(context, alarmId, linkingScheme)
    }
    
    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "alarm_channel",
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
            
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    @RequiresPermission(Manifest.permission.POST_NOTIFICATIONS)
    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    private fun showFullScreenNotification(context: Context, alarmId: String, linkingScheme: String) {
        // Create deep link intent
        val deepLinkIntent = Intent(Intent.ACTION_VIEW).apply {
            data = "${linkingScheme}/${alarmId}".toUri()
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or 
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("alarm_triggered", true)
            putExtra("alarm_id", alarmId)
        }

        val options = ActivityOptions.makeBasic()
            (if (Build.VERSION.SDK_INT == 34) {
                options.pendingIntentBackgroundActivityStartMode =
                    ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED
            } else {
                options.setPendingIntentCreatorBackgroundActivityStartMode(ActivityOptions.MODE_BACKGROUND_ACTIVITY_START_ALLOWED)
            })

        val fullScreenPendingIntent =
            PendingIntent.getActivity(
                context,
                alarmId.hashCode(),
                deepLinkIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
                options.toBundle()
            )

        // Check if device is locked
        val keyguardManager = context.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
        val isLocked = keyguardManager.isKeyguardLocked
        

        if (isLocked) {
            // For locked device: Use full-screen intent (this should work)
            val notification = NotificationCompat.Builder(context, "alarm_channel")
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle("Puzzle Alarm")
                .setContentText("Time to solve your puzzle!")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setFullScreenIntent(fullScreenPendingIntent, true)
                .setAutoCancel(true)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)// Make it sticky so it doesn't disappear
                .build()
            
            // Add flags to ensure it shows over lock screen
            notification.flags = notification.flags or 
                               Notification.FLAG_INSISTENT
            
            NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)

        } else {
            // For unlocked device: Launch directly (bypass notification)
            try {
                context.startActivity(deepLinkIntent)
            } catch (e: Exception) {
                val notification = NotificationCompat.Builder(context, "alarm_channel")
                    .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                    .setContentTitle("Puzzle Alarm")
                    .setContentText("Time to solve your puzzle!")
                    .setPriority(NotificationCompat.PRIORITY_MAX)
                    .setCategory(NotificationCompat.CATEGORY_ALARM)
                    .setContentIntent(fullScreenPendingIntent)
                    .setAutoCancel(true)
                    .build()
                
                NotificationManagerCompat.from(context).notify(alarmId.hashCode(), notification)
            }
        }
    }
}
