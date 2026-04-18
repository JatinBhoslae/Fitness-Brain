package com.example.fitnessbrain.api

import com.example.fitnessbrain.data.HealthSyncData
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface ApiService {
    /**
     * Endpoint to sync health data.
     */
    @POST("/api/health-sync")
    suspend fun syncHealthData(
        @Header("Authorization") token: String,
        @Body data: HealthSyncData
    ): Response<Unit>
}
