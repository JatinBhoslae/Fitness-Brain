'use client';
// Deployed on: 2024-04-18 08:26 (Pulse Enabled)

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  Heart, 
  Moon, 
  RefreshCw, 
  Footprints, 
  Droplets,
  Timer,
  Zap,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Monitor,
  Clock,
  Flame,
  Activity as DistIcon
} from 'lucide-react';

export default function FitnessBrainDashboard() {
  const [state, setState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDetail, setSelectedDetail] = useState<string | null>(null);
  const [stepGoal, setStepGoal] = useState(7000);

  // FETCH LOGIC
  const fetchData = async () => {
    try {
      const res = await fetch('/api/health-sync');
      const data = await res.json();
      setState(data);
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  // DATA PROCESSING HOOKS
  const metrics = state?.rawMetrics;
  const history = state?.dailySteps || [];

  const detailData = useMemo(() => {
    if (!selectedDetail || !state) return null;
    const values = history.map((d: any) => {
      let val = 0;
      if (selectedDetail === 'Steps') val = d.steps || 0;
      else if (selectedDetail === 'Heart Rate') val = d.hr || 0;
      else if (selectedDetail === 'Sleep') val = d.sleep || 0;
      else if (selectedDetail === 'SpO2') val = d.spo2 || 0;
      else if (selectedDetail === 'Stress Level') val = d.stress || 42;
      return val;
    });
    const avg = values.reduce((a: number, b: number) => a + b, 0) / (values.length || 1);
    const max = Math.max(...values, 1);
    const min = Math.min(...values.filter((v: number) => v > 0), 0);
    const consistency = avg > 0 ? ((min / avg) * 100).toFixed(0) : '0';
    return { values, avg, max, min, consistency, history };
  }, [selectedDetail, history, state]);

  // HELPERS
  const renderHistoryGraph = (data: number[], color: string, height = 200) => {
    if (!data.length) return null;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min;
    const width = 1000;
    const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * height}`).join(' ');
    
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <path d={`M 0,${height} L ${pts} L ${width},${height} Z`} fill="url(#grad)" />
        <polyline fill="none" stroke={color} strokeWidth="6" points={pts} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((v, i) => (
           <circle key={i} cx={(i / (data.length - 1)) * width} cy={height - ((v - min) / range) * height} r="8" fill="white" stroke={color} strokeWidth="3" />
        ))}
      </svg>
    );
  };

  // CONDITIONAL RENDER
  if (loading || !state) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 600, color: '#10b981' }}>
        <RefreshCw className="animate-spin" style={{ marginRight: '12px' }} /> Restoring Trends...
      </div>
    );
  }

  // DETAIL VIEW
  if (selectedDetail) {
    const unitMap: any = { 'Steps': 'steps', 'Heart Rate': 'bpm', 'Sleep': 'hrs', 'SpO2': '%', 'Stress Level': '/ 100' };
    const unit = unitMap[selectedDetail] || '';
    const showConsistency = selectedDetail !== 'Heart Rate' && selectedDetail !== 'SpO2' && selectedDetail !== 'Stress Level';

    return (
      <div className="dashboard-container">
        <header className="header" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
          <button className="btn-premium" onClick={() => setSelectedDetail(null)} style={{ marginBottom: '1rem' }}>
            <ChevronLeft size={16} /> Back to Overview
          </button>
          <h1 className="logo-text">{selectedDetail} <span>Trends</span></h1>
          <p style={{ color: '#64748b' }}>Last 14 Days Pulse Analysis</p>
        </header>

        <div className="hero-grid" style={{ gridTemplateColumns: '1fr' }}>
           <div className="premium-card" style={{ height: '400px' }}>
              <div className="card-title"><TrendingUp size={14} /> 14-Day Movement Profile</div>
              <div style={{ padding: '20px 0', height: '240px' }}>
                {renderHistoryGraph(detailData?.values || [], '#10b981', 220)}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', fontSize: '0.7rem', color: '#64748b' }}>
                 {history.map((d: any, i: number) => <span key={i}>{d.date.split('-')[2]}</span>)}
              </div>
           </div>
        </div>

        <div className="metric-grid">
           <div className="premium-card">
              <div className="card-title">14-Day Average</div>
              <div className="card-value">{detailData?.avg.toFixed(selectedDetail === 'Steps' ? 0 : 1)} <span>{unit}</span></div>
           </div>
           <div className="premium-card" style={{ background: 'linear-gradient(135deg, white, #10b98111)' }}>
              <div className="card-title">Peak Status</div>
              <div className="card-value">{detailData?.max.toFixed(selectedDetail === 'Steps' ? 0 : 1)} <span>{unit}</span></div>
           </div>
           {showConsistency && (
             <div className="premium-card">
                <div className="card-title">Consistency</div>
                <div className="card-value">{detailData?.consistency}%</div>
             </div>
           )}
        </div>
      </div>
    );
  }

  // MAIN VIEW
  return (
    <div className="dashboard-container">
      <header className="header">
        <h1 className="logo-text">Fitness <span>Brain</span></h1>
        <div className="nav-buttons">
          <button className="btn-premium" onClick={() => fetchData()}>
            <RefreshCw size={16} /> Live Sync
          </button>
        </div>
      </header>

      <div className="hero-grid">
        <div className="premium-card" onClick={() => setSelectedDetail('Steps')} style={{ cursor: 'pointer' }}>
          <div className="card-title"><Monitor size={14} /> Today's Statistics</div>
          <div className="circle-metrics-container">
            <div className="metric-circle">
              <Moon size={18} color="#3b82f6" />
              <div className="circle-val">{metrics?.sleep_hours?.toFixed(1) || '--'}</div>
              <div className="circle-unit">hrs</div>
            </div>
            <div className="metric-circle main" style={{ borderColor: '#10b981' }}>
              <Footprints size={24} color="#10b981" />
              <div className="circle-val">{(metrics?.steps || 0).toLocaleString()}</div>
              <div className="circle-unit">Goal: {stepGoal}</div>
            </div>
            <div className="metric-circle">
              <Timer size={18} color="#f59e0b" />
              <div className="circle-val">{metrics?.active_time_minutes ?? '--'}</div>
              <div className="circle-unit">Move min</div>
            </div>
          </div>
        </div>

        <div className="premium-card" style={{ background: 'linear-gradient(135deg, #10b98111, white)' }}>
          <div className="card-title"><Zap size={14} /> Vitality Index</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 0' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', border: '8px solid #10b981', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 800, color: '#10b981',
              background: 'white'
            }}>
              {state.fastrackMetrics?.vitalityIndex}
            </div>
            <div>
              <div style={{ fontWeight: 600 }}>Status: Peak Condition</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Live trends enabled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-label">Medical Vitals (Click for Trends)</div>
      
      <div className="metric-grid">
        <div className="premium-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail('Heart Rate')}>
          <div className="card-title"><Heart size={16} color="#ef4444" className="heart-icon-pulse" /> Heart Rate</div>
          <div className="card-value">{metrics?.heart_rate || '--'} <span>bpm</span></div>
          <div style={{ marginTop: '1rem', height: '4px', background: '#ef444422', borderRadius: '2px' }}>
            <div style={{ width: '70%', height: '100%', background: '#ef4444' }}></div>
          </div>
        </div>

        <div className="premium-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail('SpO2')}>
          <div className="card-title"><Droplets size={16} color="#3b82f6" /> Blood Oxygen</div>
          <div className="card-value">{metrics?.spo2 || '--'} <span>%</span></div>
          <div style={{ marginTop: '1rem', height: '4px', background: '#3b82f622', borderRadius: '2px' }}>
            <div style={{ width: '98%', height: '100%', background: '#3b82f6' }}></div>
          </div>
        </div>

        <div className="premium-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail('Stress Level')}>
          <div className="card-title"><Zap size={16} color="#f59e0b" /> Stress Level</div>
          <div className="card-value">{metrics?.stress || '42'} <span>/ 100</span></div>
          <div style={{ marginTop: '1rem', height: '4px', background: '#f59e0b22', borderRadius: '2px' }}>
            <div style={{ width: '42%', height: '100%', background: '#f59e0b' }}></div>
          </div>
        </div>
      </div>

      <div className="section-label">Activity & Sleep</div>

      <div className="metric-grid">
        <div className="premium-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedDetail('Sleep')}>
          <div className="card-title"><Moon size={16} color="#8b5cf6" /> Sleep Record</div>
          <div className="card-value">
             {metrics?.sleep_hours > 0 ? (
                metrics.sleep_hours < 1 ? (
                  `${Math.round(metrics.sleep_hours * 60)}m`
                ) : (
                  `${Math.floor(metrics.sleep_hours)}h ${Math.round((metrics.sleep_hours % 1) * 60)}m`
                )
              ) : '--'}
          </div>
        </div>
        <div className="premium-card">
          <div className="card-title"><Flame size={16} color="#f97316" /> Active Calories</div>
          <div className="card-value">{Math.round(metrics?.active_calories || 0)} <span>kcal</span></div>
        </div>
        <div className="premium-card">
          <div className="card-title"><DistIcon size={16} color="#10b981" /> Distance</div>
          <div className="card-value">{metrics?.distance_km?.toFixed(2) || '0.00'} <span>km</span></div>
        </div>
      </div>
    </div>
  );
}
