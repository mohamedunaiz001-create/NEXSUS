import React, { useState } from 'react';
import { SpecialistAgent } from '../../types';
import { ShieldCheck, Activity, Zap, Cpu, AlertTriangle, CheckCircle2, Flame, Gauge, Info } from 'lucide-react';

interface RadialHealthGaugeProps {
  agent: SpecialistAgent;
  size?: number;
  className?: string;
  showDetailedCards?: boolean;
}

export interface HealthMetrics {
  integrity: number;       // 0 - 100%
  stress: number;          // 0 - 100% (lower is calmer, higher is elevated)
  readiness: number;       // 0 - 100%
  compositeScore: number;  // 0 - 100%
  statusLabel: 'PEAK' | 'NOMINAL' | 'ELEVATED' | 'CRITICAL' | 'DEGRADED';
  statusColor: string;
  heartbeatMs: number;
  memoryLoad: number;
  cpuThermal: number;
}

export function computeAgentHealthMetrics(agent: SpecialistAgent): HealthMetrics {
  // Integrity is derived from baseline success rate and status
  let integrity = Math.min(100, Math.max(20, agent.successRate || 95));
  if (agent.status === 'OFFLINE') integrity = 25;

  // Stress is derived from active workload, execution progress, and status
  let baseStress = 20;
  if (agent.status === 'ANALYZING' || agent.status === 'BUSY') {
    baseStress = 55 + Math.round((agent.progress % 40));
  } else if (agent.status === 'ACTIVE') {
    baseStress = 35 + Math.round((agent.progress % 25));
  } else if (agent.status === 'IDLE') {
    baseStress = 12 + ((agent.tasksCompleted * 3) % 15);
  } else if (agent.status === 'OFFLINE') {
    baseStress = 0;
  }
  const stress = Math.min(100, Math.max(5, baseStress));

  // Operational readiness evaluates node availability and latency capability
  let readiness = 95;
  if (agent.status === 'ACTIVE') readiness = 98;
  else if (agent.status === 'BUSY' || agent.status === 'ANALYZING') readiness = 88;
  else if (agent.status === 'IDLE') readiness = 92;
  else if (agent.status === 'OFFLINE') readiness = 15;

  // Composite overall score
  const compositeScore = Math.round(
    (integrity * 0.45) + (readiness * 0.35) + ((100 - stress) * 0.20)
  );

  let statusLabel: HealthMetrics['statusLabel'] = 'NOMINAL';
  let statusColor = '#10b981'; // emerald

  if (compositeScore >= 92) {
    statusLabel = 'PEAK';
    statusColor = '#06b6d4'; // cyan
  } else if (compositeScore >= 80) {
    statusLabel = 'NOMINAL';
    statusColor = '#10b981'; // emerald
  } else if (compositeScore >= 65) {
    statusLabel = 'ELEVATED';
    statusColor = '#f59e0b'; // amber
  } else if (compositeScore >= 40) {
    statusLabel = 'DEGRADED';
    statusColor = '#f97316'; // orange
  } else {
    statusLabel = 'CRITICAL';
    statusColor = '#ef4444'; // rose
  }

  // Hardware telemetry estimations
  const heartbeatMs = 45 + ((agent.tasksCompleted * 7) % 30);
  const memoryLoad = Math.min(96, Math.max(18, 24 + Math.round(stress * 0.65)));
  const cpuThermal = Math.min(85, Math.max(32, 38 + Math.round(stress * 0.42)));

  return {
    integrity,
    stress,
    readiness,
    compositeScore,
    statusLabel,
    statusColor,
    heartbeatMs,
    memoryLoad,
    cpuThermal
  };
}

export const RadialHealthGauge: React.FC<RadialHealthGaugeProps> = ({
  agent,
  size = 190,
  className = '',
  showDetailedCards = true
}) => {
  const [activeHoverRing, setActiveHoverRing] = useState<'integrity' | 'readiness' | 'stress' | null>(null);

  const metrics = computeAgentHealthMetrics(agent);

  // SVG Geometry Constants
  const center = size / 2;
  const strokeWidth = 8;

  // Concentric ring radii
  const rIntegrity = size * 0.42; // Outer Ring
  const rReadiness = size * 0.32; // Middle Ring
  const rStress    = size * 0.22; // Inner Ring

  // Circumferences
  const cIntegrity = 2 * Math.PI * rIntegrity;
  const cReadiness = 2 * Math.PI * rReadiness;
  const cStress    = 2 * Math.PI * rStress;

  // Ring arc offsets (0 to 100% mapped to circumference)
  const offsetIntegrity = cIntegrity - (metrics.integrity / 100) * cIntegrity;
  const offsetReadiness = cReadiness - (metrics.readiness / 100) * cReadiness;
  const offsetStress    = cStress - (metrics.stress / 100) * cStress;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Visual Radial Gauge SVG & Center Display */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Glow backdrop behind SVG */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-20 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: metrics.statusColor }}
        />

        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 origin-center drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id={`grad-integrity-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <linearGradient id={`grad-readiness-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>

            <linearGradient id={`grad-stress-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor={metrics.stress > 65 ? '#ef4444' : '#f97316'} />
            </linearGradient>

            {/* Glowing filter */}
            <filter id={`glow-${agent.id}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Compass / Gauge Ticks (Subtle Cyberpunk HUD Hash Marks) */}
          {Array.from({ length: 24 }).map((_, i) => {
            const angle = (i * 360) / 24;
            const rad = (angle * Math.PI) / 180;
            const r1 = size * 0.48;
            const r2 = i % 6 === 0 ? size * 0.44 : size * 0.46;
            const x1 = center + r1 * Math.cos(rad);
            const y1 = center + r1 * Math.sin(rad);
            const x2 = center + r2 * Math.cos(rad);
            const y2 = center + r2 * Math.sin(rad);
            return (
              <line
                key={`tick-${i}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={i % 6 === 0 ? 'rgba(6, 182, 212, 0.45)' : 'rgba(148, 163, 184, 0.15)'}
                strokeWidth={i % 6 === 0 ? 1.5 : 1}
              />
            );
          })}

          {/* ================= 1. INTEGRITY RING (OUTER) ================= */}
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={rIntegrity}
            fill="none"
            stroke="#1e1338"
            strokeWidth={strokeWidth}
            className="opacity-40"
          />
          {/* Active Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={rIntegrity}
            fill="none"
            stroke={`url(#grad-integrity-${agent.id})`}
            strokeWidth={activeHoverRing === 'integrity' ? strokeWidth + 2 : strokeWidth}
            strokeDasharray={cIntegrity}
            strokeDashoffset={offsetIntegrity}
            strokeLinecap="round"
            filter={`url(#glow-${agent.id})`}
            className="transition-all duration-700 cursor-pointer"
            onMouseEnter={() => setActiveHoverRing('integrity')}
            onMouseLeave={() => setActiveHoverRing(null)}
          />

          {/* ================= 2. OPERATIONAL READINESS RING (MIDDLE) ================= */}
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={rReadiness}
            fill="none"
            stroke="#150e2e"
            strokeWidth={strokeWidth}
            className="opacity-40"
          />
          {/* Active Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={rReadiness}
            fill="none"
            stroke={`url(#grad-readiness-${agent.id})`}
            strokeWidth={activeHoverRing === 'readiness' ? strokeWidth + 2 : strokeWidth}
            strokeDasharray={cReadiness}
            strokeDashoffset={offsetReadiness}
            strokeLinecap="round"
            filter={`url(#glow-${agent.id})`}
            className="transition-all duration-700 cursor-pointer"
            onMouseEnter={() => setActiveHoverRing('readiness')}
            onMouseLeave={() => setActiveHoverRing(null)}
          />

          {/* ================= 3. STRESS / WORKLOAD RING (INNER) ================= */}
          {/* Background Track */}
          <circle
            cx={center}
            cy={center}
            r={rStress}
            fill="none"
            stroke="#180b26"
            strokeWidth={strokeWidth}
            className="opacity-40"
          />
          {/* Active Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={rStress}
            fill="none"
            stroke={`url(#grad-stress-${agent.id})`}
            strokeWidth={activeHoverRing === 'stress' ? strokeWidth + 2 : strokeWidth}
            strokeDasharray={cStress}
            strokeDashoffset={offsetStress}
            strokeLinecap="round"
            filter={`url(#glow-${agent.id})`}
            className="transition-all duration-700 cursor-pointer"
            onMouseEnter={() => setActiveHoverRing('stress')}
            onMouseLeave={() => setActiveHoverRing(null)}
          />
        </svg>

        {/* Center Digital Core Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <div className="flex items-center gap-1">
            <span className="text-2xl font-cyber font-extrabold text-white tracking-tighter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              {metrics.compositeScore}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono font-bold">%</span>
          </div>

          <div 
            className="px-1.5 py-0.2 mt-0.5 rounded text-[8.5px] font-mono font-bold uppercase tracking-wider border shadow-sm"
            style={{
              backgroundColor: `${metrics.statusColor}20`,
              borderColor: `${metrics.statusColor}60`,
              color: metrics.statusColor
            }}
          >
            {metrics.statusLabel}
          </div>

          <div className="text-[8px] text-slate-400 font-mono mt-0.5">
            READY INDEX
          </div>
        </div>
      </div>

      {/* Interactive Legend / Metric Snapshots */}
      {showDetailedCards && (
        <div className="w-full mt-3 grid grid-cols-3 gap-2 text-xs font-mono">
          {/* Integrity Metric Card */}
          <div 
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              activeHoverRing === 'integrity'
                ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-[#100924] border-cyan-500/25 hover:border-cyan-500/50'
            }`}
            onMouseEnter={() => setActiveHoverRing('integrity')}
            onMouseLeave={() => setActiveHoverRing(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9.5px] text-cyan-300 font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                Integrity
              </span>
              <span className="text-[11px] font-bold text-white">
                {metrics.integrity}%
              </span>
            </div>
            <div className="w-full bg-[#180e34] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.integrity}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[8.5px] text-slate-400 mt-1">
              <span>Fault-free</span>
              <span className="text-cyan-300">Nominal</span>
            </div>
          </div>

          {/* Readiness Metric Card */}
          <div 
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              activeHoverRing === 'readiness'
                ? 'bg-purple-950/60 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-[#100924] border-purple-500/25 hover:border-purple-500/50'
            }`}
            onMouseEnter={() => setActiveHoverRing('readiness')}
            onMouseLeave={() => setActiveHoverRing(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9.5px] text-purple-300 font-bold uppercase flex items-center gap-1">
                <Zap className="w-3 h-3 text-purple-400" />
                Readiness
              </span>
              <span className="text-[11px] font-bold text-white">
                {metrics.readiness}%
              </span>
            </div>
            <div className="w-full bg-[#180e34] h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.readiness}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[8.5px] text-slate-400 mt-1">
              <span>Sync</span>
              <span className="text-purple-300">Standby</span>
            </div>
          </div>

          {/* Stress Level Card */}
          <div 
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              activeHoverRing === 'stress'
                ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-[#100924] border-amber-500/25 hover:border-amber-500/50'
            }`}
            onMouseEnter={() => setActiveHoverRing('stress')}
            onMouseLeave={() => setActiveHoverRing(null)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9.5px] text-amber-300 font-bold uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                Stress
              </span>
              <span className={`text-[11px] font-bold ${metrics.stress > 65 ? 'text-rose-400' : 'text-amber-300'}`}>
                {metrics.stress}%
              </span>
            </div>
            <div className="w-full bg-[#180e34] h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  metrics.stress > 65
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                }`}
                style={{ width: `${metrics.stress}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[8.5px] text-slate-400 mt-1">
              <span>Load</span>
              <span className={metrics.stress > 65 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                {metrics.stress > 65 ? 'Heavy' : 'Calm'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Auxiliary Node Diagnostics Ticker */}
      <div className="w-full mt-2 pt-2 border-t border-purple-500/15 flex items-center justify-between text-[10px] text-slate-400 font-mono px-1">
        <span className="flex items-center gap-1">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          Heartbeat: <strong className="text-slate-200">{metrics.heartbeatMs}ms</strong>
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="w-3 h-3 text-cyan-400" />
          Mem Pressure: <strong className="text-slate-200">{metrics.memoryLoad}%</strong>
        </span>
        <span className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-amber-400" />
          Thermal: <strong className="text-slate-200">{metrics.cpuThermal}&deg;C</strong>
        </span>
      </div>
    </div>
  );
};
