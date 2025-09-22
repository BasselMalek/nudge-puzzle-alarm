package expo.modules.alarmmanager
import android.content.Context
import android.content.Intent
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.facebook.react.HeadlessJsTaskService

class WorkManagerHeadlessJSWorker(
    context: Context,
    workerParams: WorkerParameters
) : Worker(context, workerParams) {
    override fun doWork(): Result {
        val serviceIntent = Intent(applicationContext, BootHeadlessTaskService::class.java)
        serviceIntent.putExtra("Good_Morning", 1)
        applicationContext.startService(serviceIntent)
        HeadlessJsTaskService.acquireWakeLockNow(applicationContext)
        return Result.success()
    }
}
