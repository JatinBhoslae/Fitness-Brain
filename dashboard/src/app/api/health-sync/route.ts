import { NextResponse } from 'next/server';

const SUPABASE_URL = "https://shlyqfxppovzntpvfbzn.supabase.co";
const SUPABASE_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobHlxZnhwcG92em50cHZmYnpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ1MjUwNiwiZXhwIjoyMDkyMDI4NTA2fQ.t1S3PVyR46SYouQZu-_LHgxcbfG7ur_qiZbYk3Hd30g"; 

// Helper to interact with Supabase via REST
async function getCloudStore() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/health_sync?user_id=eq.jatin&select=data`, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
    },
    cache: 'no-store'
  });
  const data = await res.json();
  return data?.[0]?.data || {};
}

async function updateCloudStore(newData: any) {
  await fetch(`${SUPABASE_URL}/rest/v1/health_sync?user_id=eq.jatin`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify({ data: newData, updated_at: new Date().toISOString() })
  });
}

function generateFakeHistory() {
  const history: Record<string, any> = {};
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    history[dateStr] = {
      steps: Math.floor(Math.random() * 2000) + 1000,
      heartRate: Math.floor(Math.random() * 20) + 65,
      sleepHours: Math.floor(Math.random() * 3) + 5,
      spo2: Math.floor(Math.random() * 2) + 97,
      stress: Math.floor(Math.random() * 20) + 30
    };
  }
  return history;
}

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    const currentStore = await getCloudStore();
    
    // Maintain history memory
    let dailyHistory = currentStore.dailyHistory || generateFakeHistory();
    
    const metrics = {
      steps: rawData.steps || 0,
      heart_rate: rawData.heartRate || 0,
      sleep_hours: rawData.sleepHours || 0,
      active_time_minutes: rawData.activeTimeMinutes || 0,
      active_calories: rawData.activeCalories || 0.0,
      distance_km: rawData.distanceKm || 0.0,
      spo2: rawData.spo2 || 98,
      stress: rawData.stress || 42,
    };

    const today = new Date().toISOString().split('T')[0];
    
    // Merge phone history if available
    if (rawData.dailySteps && Array.isArray(rawData.dailySteps)) {
      rawData.dailySteps.forEach((item: any) => {
        dailyHistory[item.date] = {
          steps: item.steps,
          heartRate: item.hr,
          sleepHours: item.sleep,
          spo2: item.spo2,
          stress: item.stress || 42
        };
      });
    }

    // Force update today
    dailyHistory[today] = {
      steps: metrics.steps,
      heartRate: metrics.heart_rate,
      sleepHours: metrics.sleep_hours,
      spo2: metrics.spo2,
      stress: metrics.stress
    };

    const newStore = {
      lastSync: new Date().toISOString(),
      rawMetrics: metrics,
      dailyHistory: dailyHistory,
      fastrackMetrics: {
        vitalityIndex: Math.round(Math.min(100, (metrics.steps/8000)*40 + (metrics.sleep_hours/7)*40 + 20)),
        sources: rawData.dataSources || 'Google Fit'
      }
    };

    await updateCloudStore(newStore);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Cloud Sync Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const store = await getCloudStore();
    
    // Transform history object back to the array format the UI expects
    const dailyStepsArray = Object.entries(store.dailyHistory || {})
      .map(([date, data]: [string, any]) => ({
        date,
        steps: data.steps,
        hr: data.heartRate,
        sleep: data.sleepHours,
        spo2: data.spo2,
        stress: data.stress
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);

    return NextResponse.json({
      ...store,
      dailySteps: dailyStepsArray
    });
  } catch (error) {
    return NextResponse.json({ error: 'Cloud Fetch Failed' }, { status: 500 });
  }
}

export async function DELETE() {
  const resetStore = {
    dailyHistory: generateFakeHistory(),
    rawMetrics: { steps: 0, heart_rate: 0, sleep_hours: 0 }
  };
  await updateCloudStore(resetStore);
  return NextResponse.json({ success: true });
}
