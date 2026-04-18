package com.example.fitnessbrain.worker

import android.content.Context
import android.util.Log
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.example.fitnessbrain.api.ApiClient
import com.example.fitnessbrain.data.HealthSyncData
import com.example.fitnessbrain.data.LocalStorage
import com.example.fitnessbrain.health.HealthRepository
import java.time.Instant

class SyncWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        Log.d("SyncWorker", "=== SYNC STARTED ===")

        val context = applicationContext
        val localStorage = LocalStorage(context)
        val currentTime = System.currentTimeMillis()

        var steps = 0
        var heartRate = 0
        var sleepHours = 0.0
        var activeTimeMinutes = 0
        var activeCalories = 0.0
        var totalCalories = 0.0
        var distanceKm = 0.0
        var spo2 = 0.0
        var stressValue = 42
        var dailyStepsList = emptyList<com.example.fitnessbrain.data.DailySteps>()
        var foundSources = "None"

        try {
            val client = HealthConnectClient.getOrCreate(context)
            val repository = HealthRepository(context)

            val endTime = Instant.ofEpochMilli(currentTime)
            val startTime = endTime.minusSeconds(604800) // 7 days for vitals
            
            val calendar = java.util.Calendar.getInstance()
            calendar.timeInMillis = currentTime
            calendar.set(java.util.Calendar.HOUR_OF_DAY, 0)
            calendar.set(java.util.Calendar.MINUTE, 0)
            calendar.set(java.util.Calendar.SECOND, 0)
            calendar.set(java.util.Calendar.MILLISECOND, 0)
            val todayStart = Instant.ofEpochMilli(calendar.timeInMillis)

            steps = repository.getSteps(todayStart, endTime) ?: 0
            heartRate = repository.getLatestHeartRate(startTime, endTime) ?: 0
            sleepHours = repository.getLastSleepDurationHours(todayStart, endTime) ?: 0.0
            
            activeTimeMinutes = repository.getActiveTimeMinutes(todayStart, endTime) ?: 0
            activeCalories = repository.getActiveCalories(todayStart, endTime) ?: 0.0
            totalCalories = repository.getTotalCalories(todayStart, endTime) ?: 0.0
            distanceKm = repository.getDistance(todayStart, endTime) ?: 0.0
            spo2 = repository.getLatestSpO2(startTime, endTime) ?: 0.0
            stressValue = repository.getLatestStress(startTime, endTime)

            dailyStepsList = repository.getDailyHistory(14)
            
            val stepRecords = client.readRecords(ReadRecordsRequest(StepsRecord::class, TimeRangeFilter.between(todayStart, endTime)))
            val hrRecords = client.readRecords(ReadRecordsRequest(HeartRateRecord::class, TimeRangeFilter.between(startTime, endTime)))
            foundSources = (stepRecords.records.map { it.metadata.dataOrigin.packageName } + 
                            hrRecords.records.map { it.metadata.dataOrigin.packageName }).distinct().joinToString(", ")

            Log.d("SyncWorker", "Data: Steps=$steps HR=$heartRate Sources=$foundSources")

        } catch (e: Exception) {
            Log.e("SyncWorker", "Health fetch failed: ${e.message}")
        }

        try {
            val data = HealthSyncData(
                userId = "123",
                heartRate = heartRate,
                steps = steps,
                sleepHours = sleepHours,
                activeTimeMinutes = activeTimeMinutes,
                activeCalories = activeCalories,
                totalCalories = totalCalories,
                distanceKm = distanceKm,
                spo2 = spo2,
                stress = stressValue,
                breatheMinutes = 5, 
                timestamp = currentTime,
                dataSources = foundSources,
                dailySteps = dailyStepsList
            )

            val api = ApiClient.apiService
            val response = api.syncHealthData("Bearer sample_token", data)

            if (response.isSuccessful) {
                localStorage.setLastSyncTimestamp(currentTime)
                localStorage.setLastSyncStatus("Success")
                return Result.success()
            } else {
                localStorage.setLastSyncStatus("Failed: ${response.code()}")
                return Result.retry()
            }
        } catch (e: Exception) {
            localStorage.setLastSyncStatus("Error: ${e.message}")
            return Result.retry()
        }
    }
}