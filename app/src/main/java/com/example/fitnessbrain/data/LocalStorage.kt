package com.example.fitnessbrain.data

import android.content.Context
import android.content.SharedPreferences

/**
 * Local storage for keeping track of the last successful sync timestamp.
 */
class LocalStorage(context: Context) {
    private val prefs: SharedPreferences = context.getSharedPreferences("health_sync_prefs", Context.MODE_PRIVATE)

    fun getLastSyncTimestamp(): Long {
        return prefs.getLong("last_sync_timestamp", 0)
    }

    fun setLastSyncTimestamp(timestamp: Long) {
        prefs.edit().putLong("last_sync_timestamp", timestamp).apply()
    }

    fun getLastSyncStatus(): String {
        return prefs.getString("last_sync_status", "Never Synced") ?: "Never Synced"
    }

    fun setLastSyncStatus(status: String) {
        prefs.edit().putString("last_sync_status", status).apply()
    }
}
