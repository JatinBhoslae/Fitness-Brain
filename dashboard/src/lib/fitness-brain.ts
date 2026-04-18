/**
 * Fitness Brain AI Engine
 * Implements Steps 1-8: Scoring, Trend Detection, and Adaptive Planning.
 */

export interface HealthMetrics {
  heart_rate?: number;
  resting_heart_rate?: number;
  hrv?: number;
  sleep_hours?: number;
  deep_sleep_percentage?: number;
  spo2?: number;
  steps?: number;
  energy_level?: number;
  soreness?: number;
  stress_level?: number;
}

export interface TrainingHistory {
  day: string;
  sleep_hours: number;
  hrv: number;
  resting_heart_rate: number;
  steps: number;
  workout_intensity: 'low' | 'medium' | 'high';
}

export const analyzeFitnessState = (
  inputSource: string,
  today: HealthMetrics,
  history: TrainingHistory[],
  goal: string = 'general_fitness'
) => {
  // STEP 1: DATA CONFIDENCE
  let confidence_score = 50;
  if (inputSource === 'synced') confidence_score = 92;
  else if (inputSource === 'screenshot') confidence_score = 75;
  else if (inputSource === 'manual') confidence_score = 55;

  // STEP 2: BODY STATE ANALYSIS (Simplified logic)
  const hrv = today.hrv || 50;
  const rhr = today.resting_heart_rate || 65;
  const sleep = today.sleep_hours || 7;
  const soreness = today.soreness || 1;

  let body_state = 'MODERATE';
  if (hrv > 65 && sleep > 7.5 && rhr < 62) {
    body_state = 'RECOVERED';
  } else if (hrv < 40 || sleep < 5.5 || soreness > 7) {
    body_state = 'FATIGUED';
  }

  // STEP 3: TREND ANALYSIS
  const avgHistoryHRV = history.length ? history.reduce((acc, h) => acc + h.hrv, 0) / history.length : hrv;
  const hrv_trend = hrv > avgHistoryHRV ? "Improving" : "Declining";
  const sleep_trend = "Stable"; // Simplified
  const overtraining_risk = (body_state === 'FATIGUED' && history.slice(-2).some(h => h.workout_intensity === 'high')) ? "HIGH" : "Low";

  // STEP 4: SCORING (0-100)
  const recovery_score = Math.min(100, Math.max(0, (sleep / 8) * 60 + (hrv / 70) * 40));
  const fatigue_score = Math.min(100, Math.max(0, (soreness * 10) + (rhr > 70 ? 20 : 0)));
  const readiness_score = Math.round((recovery_score + (100 - fatigue_score)) / 2);

  // STEP 5 & 6: ADAPTIVE TRAINING DECISION & WORKOUT PLAN
  let workout = {
    type: "Moderate Load Training",
    duration: "45 mins",
    intensity: "Medium",
    target: goal === 'fat_loss' ? 'Cardio' : 'Strength/Hypertrophy',
    plan: ["10m Dynamic Warmup", "3 sets of Compound lift @ 70%", "15m stretching"]
  };

  if (body_state === 'RECOVERED') {
    workout = {
      type: goal === 'muscle_gain' ? "Heavy Strength Session" : "High Intensity Interval",
      duration: "75 mins",
      intensity: "High (Progressive Overload)",
      target: "Peak Performance",
      plan: ["15m Warmup", "5x5 Main Compound Lift", "Auxiliary sets to failure", "Cooldown"]
    };
  } else if (body_state === 'FATIGUED') {
    workout = {
      type: "Active Recovery",
      duration: "20-30 mins",
      intensity: "Very Low",
      target: "Mobility & Blood Flow",
      plan: ["Full body foam rolling", "Static stretching", "Low effort walk"]
    };
  }

  // STEP 7: RISK ALERTS
  const alerts = [];
  if (overtraining_risk === 'HIGH') alerts.push("⚠️ High Overtraining Risk: Recovery prioritized.");
  if (sleep < 6) alerts.push("💤 Sleep Debt Detected: Performance may be compromised.");

  // STEP 8: COACH INSIGHT
  let insight = `Your HRV is ${hrv_trend.toLowerCase()} today. Because you are ${body_state.toLowerCase()}, we recommend a ${workout.intensity.toLowerCase()} intensity session focusing on ${workout.target.toLowerCase()}. Watch your energy levels mid-set.`;

  return {
    body_state,
    recovery_score: Math.round(recovery_score),
    fatigue_score: Math.round(fatigue_score),
    readiness_score,
    confidence_score,
    trend_analysis: {
      recovery_trend: body_state === 'RECOVERED' ? "Positive" : "Stable",
      sleep_trend,
      hrv_trend,
      overtraining_risk,
      plateau_detected: "None"
    },
    workout,
    alerts,
    insight
  };
};
