import { NextResponse } from 'next/server';

let dailyHistory: Record<string, any> = {};

function generateFakeHistory() {
  const history: Record<string, any> = {};
  const today = new Date();
  
  // Create 14 days of history, but STOP at yesterday.
  // Today MUST be reserved for real phone data only.
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    history[dateStr] = {
      steps: Math.floor(Math.random() * 2000) + 1000,
      heartRate: Math.floor(Math.random() * 20) + 65,
      sleepHours: Math.floor(Math.random() * 3) + 5,
      activeTime: Math.floor(Math.random() * 30) + 15,
      calories: Math.floor(Math.random() * 100) + 50,
      spo2: Math.floor(Math.random() * 3) + 96,
      stress: Math.floor(Math.random() * 20) + 30,
      breathe: 5
    };
  }
  return history;
}

// Initialize history
dailyHistory = generateFakeHistory();

let globalState: any = {
  lastSync: null,
  rawMetrics: {
    steps: 0,
    heart_rate: 0,
    resting_heart_rate: 65,
    sleep_hours: 0,
    active_time_minutes: 0,
    active_calories: 0.0,
    total_calories: 0.0,
    distance_km: 0.0,
    spo2: 0,
    stress: 42,
    hydration_ml: 1200,
    breathe_minutes: 0,
    weather: { temp: 30, condition: 'Cloudy', location: 'Dashboard' }
  },
  analysis: null,
  dailySteps: [],
  fastrackMetrics: {
    vitalityIndex: 0,
    zPoints: 0,
    sources: 'None'
  }
};

export async function POST(request: Request) {
  try {
    const rawData = await request.json();
    console.log("CRITICAL SYNC RECEIVED:", JSON.stringify(rawData));

    const metrics = {
      steps: rawData.steps || 0,
      heart_rate: rawData.heartRate || 0,
      resting_heart_rate: 65,
      sleep_hours: rawData.sleepHours || 0,
      active_time_minutes: rawData.activeTimeMinutes || 0,
      active_calories: rawData.activeCalories || 0.0,
      total_calories: rawData.totalCalories || 0.0,
      distance_km: rawData.distanceKm || 0.0,
      spo2: rawData.spo2 || 0,
      stress: rawData.stress || 42,
      hydration_ml: 1200,
      breathe_minutes: 5,
      weather: { temp: 30, condition: 'Cloudy', location: 'Dashboard' },
      hrv: 50,
      soreness: 1,
      energy_level: 7,
      sleep_breakdown: {
        deep: ((rawData.sleepHours || 0) * 0.25).toFixed(1),
        light: ((rawData.sleepHours || 0) * 0.6).toFixed(1),
        rem: ((rawData.sleepHours || 0) * 0.15).toFixed(1)
      }
    };

    const today = new Date().toISOString().split('T')[0];
    
    // MERGE PHONE HISTORY: If the phone sent a history list, save it!
    if (rawData.dailySteps && Array.isArray(rawData.dailySteps)) {
      rawData.dailySteps.forEach((item: any) => {
        dailyHistory[item.date] = {
          steps: item.steps,
          heartRate: item.hr,
          sleepHours: item.sleep,
          spo2: item.spo2,
          activeTime: item.active || 0,
          stress: item.stress || 42
        };
      });
    }

    // FORCE UPDATE TODAY (highest priority)
    dailyHistory[today] = {
      steps: metrics.steps,
      heartRate: metrics.heart_rate,
      sleepHours: metrics.sleep_hours,
      activeTime: metrics.active_time_minutes,
      calories: metrics.active_calories,
      spo2: metrics.spo2,
      stress: metrics.stress,
      breathe: metrics.breathe_minutes
    };

    // Recalculate vitality
    const movementScore = Math.min(40, (metrics.steps / 8000) * 40);
    const restScore = Math.min(30, (metrics.sleep_hours / 7.5) * 30);
    const exertionScore = Math.min(30, (metrics.active_calories / 400) * 30);
    const vitalityIndex = Math.round(movementScore + restScore + exertionScore);

    globalState = {
      lastSync: new Date().toISOString(),
      rawMetrics: metrics,
      lastRawData: rawData,
      dailySteps: Object.entries(dailyHistory)
        .map(([date, data]: [string, any]) => ({
          date,
          steps: data.steps,
          hr: data.heartRate,
          spo2: data.spo2,
          sleep: data.sleepHours,
          active: data.activeTime
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-15),
      fastrackMetrics: {
        vitalityIndex: vitalityIndex,
        zPoints: 10,
        sources: rawData.dataSources || 'Unknown'
      }
    };

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(globalState);
}

export async function DELETE() {
  globalState.rawMetrics.steps = 0;
  dailyHistory = generateFakeHistory();
  return NextResponse.json({ success: true });
}
