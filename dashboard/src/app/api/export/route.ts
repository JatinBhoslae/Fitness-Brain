import { NextResponse } from 'next/server';

const SUPABASE_URL = "https://shlyqfxppovzntpvfbzn.supabase.co";
const SUPABASE_SERVICE_ROLE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNobHlxZnhwcG92em50cHZmYnpuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ1MjUwNiwiZXhwIjoyMDkyMDI4NTA2fQ.t1S3PVyR46SYouQZu-_LHgxcbfG7ur_qiZbYk3Hd30g";

export const dynamic = 'force-dynamic';

async function getCloudStore() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/health_sync?user_id=eq.jatin&select=data`, {
    headers: {
      'apikey': SUPABASE_SERVICE_ROLE,
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`
    },
    next: { revalidate: 0 }
  });
  const result = await res.json();
  return result?.[0]?.data || {};
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookUrl = searchParams.get('webhookUrl');
    
    const store = await getCloudStore();
    const metrics = store.rawMetrics || {};

    const exportData = {
      status: "success",
      timestamp: new Date().toISOString(),
      user_id: "jatin",
      heart_rate: metrics.heart_rate || 0,
      spo2: metrics.spo2 || 0,
      stress: metrics.stress || 0,
      steps: metrics.steps || 0,
      sleep_hours: metrics.sleep_hours || 0,
      active_calories: metrics.active_calories || 0,
      source: store.fastrackMetrics?.sources || "Google Fit Bridge"
    };

    // Trigger Webhook if provided
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(exportData)
        });
        console.log(">>> WEBHOOK TRIGGERED:", webhookUrl);
      } catch (e) {
        console.error(">>> WEBHOOK FAILED:", e);
      }
    }

    return NextResponse.json(exportData);
  } catch (error) {
    return NextResponse.json({ status: "error", message: "Failed to export vitals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  // Allow POSTing a webhookUrl to trigger export
  try {
    const body = await request.json();
    const webhookUrl = body.webhookUrl;
    
    // Reuse GET logic logic or redirect
    const url = new URL(request.url);
    if (webhookUrl) url.searchParams.set('webhookUrl', webhookUrl);
    
    return GET(new Request(url.toString()));
  } catch (e) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
