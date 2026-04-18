package com.example.fitnessbrain.data

import com.google.gson.annotations.SerializedName

data class DailySteps(
    @SerializedName("date") val date: String,
    @SerializedName("steps") val steps: Int,
    @SerializedName("hr") val hr: Int? = null,
    @SerializedName("sleep") val sleep: Double? = null,
    @SerializedName("spo2") val spo2: Double? = null,
    @SerializedName("stress") val stress: Int? = null
)

data class HealthSyncData(
    @SerializedName("userId") val userId: String,
    @SerializedName("heartRate") val heartRate: Int?,
    @SerializedName("steps") val steps: Int?,
    @SerializedName("sleepHours") val sleepHours: Double?,
    @SerializedName("activeTimeMinutes") val activeTimeMinutes: Int?,
    @SerializedName("activeCalories") val activeCalories: Double?,
    @SerializedName("totalCalories") val totalCalories: Double?,
    @SerializedName("distanceKm") val distanceKm: Double?,
    @SerializedName("spo2") val spo2: Double?,
    @SerializedName("stress") val stress: Int?,
    @SerializedName("breatheMinutes") val breatheMinutes: Int?,
    @SerializedName("timestamp") val timestamp: Long,
    @SerializedName("dataSources") val dataSources: String? = null,
    @SerializedName("dailySteps") val dailySteps: List<DailySteps>? = null
)
