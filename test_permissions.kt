import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*

fun main() {
    println(HealthPermission.getReadPermission(DistanceRecord::class))
    println(HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class))
    println(HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class))
    println(HealthPermission.getReadPermission(ExerciseSessionRecord::class))
}
