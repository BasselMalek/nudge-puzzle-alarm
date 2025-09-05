package expo.modules.alarmmanager

import android.app.Activity
import android.app.KeyguardManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.WindowManager

class AlarmTrampolineActivity : Activity() {

    private fun wakeAndUnlock() {
        // Keep the screen on
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Modern APIs (O_MR1+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }

        // Attempt to dismiss keyguard
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val kg = getSystemService(KeyguardManager::class.java)
            kg?.requestDismissKeyguard(this, null)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        wakeAndUnlock()

        val deepLinkData = intent?.data

        val deepLinkIntent = Intent(Intent.ACTION_VIEW).apply {
            data = deepLinkData
            flags = (Intent.FLAG_ACTIVITY_NEW_TASK
                    or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    or Intent.FLAG_ACTIVITY_SINGLE_TOP
                    or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
        }

        // Post to ensure wake flags are applied before launch
        window.decorView.post {
            startActivity(deepLinkIntent)
            finish()
        }
    }
}
