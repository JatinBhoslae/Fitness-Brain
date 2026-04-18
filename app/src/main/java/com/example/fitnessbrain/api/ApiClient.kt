package com.example.fitnessbrain.api

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {
    // Updated with your latest laptop IP address
    // IMPORTANT: Change '3000' to the port your web app is running on (e.g., 5000, 8000)
    private const val BASE_URL = "https://fitness-brain.vercel.app"

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
