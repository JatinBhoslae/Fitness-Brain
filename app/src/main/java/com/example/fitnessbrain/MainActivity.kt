package com.example.fitnessbrain

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.lifecycle.lifecycleScope
import androidx.work.*
import com.example.fitnessbrain.data.LocalStorage
import com.example.fitnessbrain.worker.SyncWorker
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : ComponentActivity() {

    private val PERMISSIONS = setOf(
        HealthPermission.getReadPermission(HeartRateRecord::class),
        HealthPermission.getReadPermission(StepsRecord::class),
        HealthPermission.getReadPermission(SleepSessionRecord::class),
        HealthPermission.getReadPermission(DistanceRecord::class),
        HealthPermission.getReadPermission(TotalCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(ActiveCaloriesBurnedRecord::class),
        HealthPermission.getReadPermission(ExerciseSessionRecord::class),
        HealthPermission.getReadPermission(OxygenSaturationRecord::class),
        HealthPermission.getReadPermission(HeartRateVariabilityRmssdRecord::class)
    )

    private val hPulse = Handler(Looper.getMainLooper())
    private val rPulse = object : Runnable {
        override fun run() {
            triggerSync()
            hPulse.postDelayed(this, 5000) // 5 SECOND PULSE
        }
    }

    private val requestPermissionLauncher = registerForActivityResult(
        PermissionController.createRequestPermissionResultContract()
    ) { granted ->
        if (granted.containsAll(PERMISSIONS)) {
            hPulse.post(rPulse)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // START THE AUTOMATIC 5s PULSE
        hPulse.post(rPulse)

        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = Color.White) {
                    val localStorage = LocalStorage(this)
                    var lastSyncTime by remember { mutableStateOf(localStorage.getLastSyncTimestamp()) }
                    var syncStatus by remember { mutableStateOf(localStorage.getLastSyncStatus()) }
                    var isSyncing by remember { mutableStateOf(false) }

                    // Status Refresh Loop (UI only)
                    LaunchedEffect(Unit) {
                        while(true) {
                            lastSyncTime = localStorage.getLastSyncTimestamp()
                            syncStatus = localStorage.getLastSyncStatus()
                            kotlinx.coroutines.delay(2000)
                        }
                    }

                    Column(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Text("Fitness Brain", fontSize = 32.sp, fontWeight = FontWeight.Bold, color = Color(0xFF10B981))
                        Text("5s Real-Time Bridge Active", fontSize = 14.sp, color = Color.Gray)
                        
                        Spacer(modifier = Modifier.height(48.dp))
                        
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF3F4F6))
                        ) {
                            Column(modifier = Modifier.padding(24.dp)) {
                                Text("Last Pulse Sync:", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                Text(
                                    if (lastSyncTime > 0) SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date(lastSyncTime)) else "Waiting for first pulse...",
                                    fontSize = 24.sp, 
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.Black
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("Status: $syncStatus", color = if (syncStatus == "Success") Color(0xFF10B981) else Color.Red)
                            }
                        }

                        Spacer(modifier = Modifier.height(48.dp))

                        Button(
                            onClick = { 
                                triggerSync() 
                                isSyncing = true
                                lifecycleScope.launch { 
                                    kotlinx.coroutines.delay(1000)
                                    isSyncing = false
                                }
                            },
                            modifier = Modifier.fillMaxWidth().height(64.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981))
                        ) {
                            Text(if (isSyncing) "SYNCING..." else "FORCE MANUAL SYNC", fontWeight = FontWeight.Bold)
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        TextButton(
                            onClick = { 
                                try {
                                    requestPermissionLauncher.launch(PERMISSIONS)
                                } catch (e: Exception) {
                                    val intent = android.content.Intent("androidx.health.connect.client.ACTION_HEALTH_CONNECT_SETTINGS")
                                    startActivity(intent)
                                }
                            }
                        ) {
                            Text("RE-CHECK PERMISSIONS", color = Color.Gray)
                        }
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        hPulse.removeCallbacks(rPulse)
    }

    private fun triggerSync() {
        val request = OneTimeWorkRequestBuilder<SyncWorker>()
            .setExpedited(OutOfQuotaPolicy.RUN_AS_NON_EXPEDITED_WORK_REQUEST)
            .build()
        WorkManager.getInstance(this).enqueueUniqueWork(
            "HealthSync",
            ExistingWorkPolicy.REPLACE,
            request
        )
    }
}