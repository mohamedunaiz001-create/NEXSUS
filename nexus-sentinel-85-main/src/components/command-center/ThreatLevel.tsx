import React, { useMemo, useState } from 'react';
import { 
  ArrowUpRight, 
  AlertTriangle, 
  ShieldAlert, 
  Sliders, 
  Flame, 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import * as d3 from 'd3';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface ThreatLevelProps {
  score?: number;
  level?: string;
  threshold?: number;
  isEmergencyOverride?: boolean;
  onToggleEmergencyOverride?: () => void;
  onSetScore?: (score: number) => void;
  onSetThreshold?: (threshold: number) => void;
  onViewDetails?: () => void;
  onDeployCountermeasures?: () => void;
}

export const ThreatLevel: React.FC<ThreatLevelProps> = ({
  score = 7.8,
  level = 'HIGH',
  threshold = 80,
  isEmergencyOverride = false,
  onToggleEmergencyOverride,
  onSetScore,
  onSetThreshold,
  onViewDetails,
  onDeployCountermeasures
}) => {
  const [showControls, setShowControls] = useState(false);

  // Normalize score to 0-100 scale
  const normalizedScore = useMemo(() => {
    const raw = score <= 10 ? score * 10 : score;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }, [score]);

  const isAboveThreshold = normalizedScore >= threshold;
  const isEmergencyActive = isEmergencyOverride || isAboveThreshold;

  // Gauge geometry configuration (Old Ruin Gothic Relic Meter)
  const width = 124;
  const height = 64;
  const cx = width / 2;
  const cy = 45;
  const radius = 35;
  const strokeWidth = 5.5;

  // Upper gothic arch sweep (-99 deg to +99 deg)
  const startAngle = -Math.PI * 0.55; 
  const endAngle = Math.PI * 0.55;    
  const totalAngle = endAngle - startAngle;

  // D3 arc generator for background & value arcs
  const bgArcPath = useMemo(() => {
    const arcGen = d3.arc()
      .innerRadius(radius - strokeWidth / 2)
      .outerRadius(radius + strokeWidth / 2)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(3);
    return arcGen({} as any) || '';
  }, [radius, strokeWidth, startAngle, endAngle]);

  const valueAngle = startAngle + (normalizedScore / 100) * totalAngle;
  const thresholdAngle = startAngle + (threshold / 100) * totalAngle;

  const activeArcPath = useMemo(() => {
    const arcGen = d3.arc()
      .innerRadius(radius - strokeWidth / 2)
      .outerRadius(radius + strokeWidth / 2)
      .startAngle(startAngle)
      .endAngle(valueAngle)
      .cornerRadius(3);
    return arcGen({} as any) || '';
  }, [radius, strokeWidth, startAngle, valueAngle]);

  // Needle indicator coords
  const needleLength = radius - 5;
  const needleX = cx + Math.sin(valueAngle) * needleLength;
  const needleY = cy - Math.cos(valueAngle) * needleLength;

  // Threshold marker coords
  const threshInnerR = radius - strokeWidth / 2 - 2;
  const threshOuterR = radius + strokeWidth / 2 + 2;
  const threshX1 = cx + Math.sin(thresholdAngle) * threshInnerR;
  const threshY1 = cy - Math.cos(thresholdAngle) * threshInnerR;
  const threshX2 = cx + Math.sin(thresholdAngle) * threshOuterR;
  const threshY2 = cy - Math.cos(thresholdAngle) * threshOuterR;

  // Minor & Major Tick Marks
  const ticks = useMemo(() => {
    return [0, 25, 50, 75, 100].map((t) => {
      const angle = startAngle + (t / 100) * totalAngle;
      const innerR = radius - 9;
      const outerR = radius - 4;
      return {
        val: t,
        x1: cx + Math.sin(angle) * innerR,
        y1: cy - Math.cos(angle) * innerR,
        x2: cx + Math.sin(angle) * outerR,
        y2: cy - Math.cos(angle) * outerR,
      };
    });
  }, [startAngle, totalAngle, cx, cy, radius]);

  // Waveform heights
  const waveformBars = useMemo(() => {
    if (isEmergencyActive) {
      return [95, 100, 85, 90, 100, 95, 90, 100, 85, 95, 100, 90, 85, 95, 100, 90];
    }
    return [30, 55, 75, 95, 80, 60, 100, 85, 45, 90, 70, 65, 85, 40, 75, 90];
  }, [isEmergencyActive]);

  return (
    <div 
      id="threat-level-widget"
      className={`rounded-xl p-3 flex flex-col justify-between transition-all duration-500 relative overflow-hidden ${
        isEmergencyActive 
          ? 'bg-rose-950/80 border-2 border-rose-500 emergency-strobe-glow shadow-[0_0_30px_rgba(244,63,94,0.5)]' 
          : 'bg-[#090317]/95 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
      }`}
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      {/* Top Hazard Alert Stripe in Emergency Mode */}
      {isEmergencyActive && (
        <div className="absolute top-0 left-0 right-0 h-1 emergency-hazard-bar" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5 gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`text-[11px] sm:text-xs font-cyber font-bold tracking-wider truncate ${isEmergencyActive ? 'text-rose-200' : 'text-white'}`}>
            THREAT TELEMETRY
          </span>
          <span 
            className={`px-1.5 py-0.5 rounded text-[7.5px] sm:text-[8px] font-mono font-bold uppercase whitespace-nowrap shrink-0 transition-colors ${
              isEmergencyActive 
                ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_10px_rgba(225,29,72,0.9)]'
                : 'bg-rose-950/70 border border-rose-500/50 text-rose-400 glow-red'
            }`}
          >
            {isEmergencyActive ? '🚨 DEFCON 1' : 'ACTIVE CRITICAL'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Controls Toggle */}
          <button
            type="button"
            onClick={() => setShowControls(prev => !prev)}
            className={`p-1 rounded text-[10px] font-mono transition-colors flex items-center gap-1 ${
              showControls 
                ? 'bg-purple-600 text-white' 
                : 'text-purple-400 hover:text-purple-200 bg-purple-950/40 border border-purple-500/20'
            }`}
            title="Configure Threshold & Threat Simulation"
          >
            <Sliders className="w-3 h-3" />
          </button>

          {onViewDetails && (
            <button 
              onClick={onViewDetails}
              className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-0.5 whitespace-nowrap"
            >
              <span>Details</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Controls Drawer (When toggled open) */}
      {showControls && (
        <div className="mb-2 p-2 rounded-lg bg-black/60 border border-purple-500/30 space-y-2 text-xs font-mono animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Surge Score: <b className="text-white">{normalizedScore}/100</b></span>
            <span className="text-slate-400">Trigger Threshold: <b className="text-rose-400">{threshold}/100</b></span>
          </div>

          {/* Sliders */}
          <div className="space-y-1.5">
            <div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Threat Score:</span>
                <span>{normalizedScore}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={normalizedScore}
                onChange={(e) => onSetScore && onSetScore(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Emergency Threshold:</span>
                <span>{threshold}%</span>
              </div>
              <input 
                type="range" 
                min="30" 
                max="95" 
                value={threshold}
                onChange={(e) => onSetThreshold && onSetThreshold(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => onSetScore && onSetScore(45)}
              className="py-1 px-1.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold hover:bg-emerald-900 transition-colors"
            >
              Nominal (45)
            </button>
            <button
              onClick={() => onSetScore && onSetScore(78)}
              className="py-1 px-1.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 text-[10px] font-bold hover:bg-amber-900 transition-colors"
            >
              Elevated (78)
            </button>
            <button
              onClick={() => onSetScore && onSetScore(96)}
              className="py-1 px-1.5 rounded bg-rose-950/70 border border-rose-500/40 text-rose-300 text-[10px] font-bold hover:bg-rose-900 transition-colors flex items-center justify-center gap-1"
            >
              <Flame className="w-3 h-3 text-rose-400 animate-pulse" />
              <span>Surge (96)</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Gauge & Spectral Waveform Row */}
      <div className="flex items-center justify-between gap-3 px-1 py-1">
        {/* Left: D3-Styled SVG Gauge Meter */}
        <div className="shrink-0 flex items-center justify-center">
          <svg 
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
            className="overflow-visible select-none"
          >
            <defs>
              {/* Purple-to-Red or Red-Flash Status Gradient */}
              <linearGradient id="threat-gauge-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={isEmergencyActive ? "#e11d48" : "#8b5cf6"} />
                <stop offset="40%" stopColor={isEmergencyActive ? "#f43f5e" : "#d946ef"} />
                <stop offset="75%" stopColor={isEmergencyActive ? "#ff0055" : "#f43f5e"} />
                <stop offset="100%" stopColor="#ffffff" />
              </linearGradient>

              {/* Soft Red/Purple Backlight Glow */}
              <filter id="gauge-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ambient Circular Glow Background */}
            <circle cx={cx} cy={cy} r={radius} fill={isEmergencyActive ? "#240409" : "#140628"} opacity={0.7} />

            {/* Gauge Arc Group centered at (cx, cy) */}
            <g transform={`translate(${cx}, ${cy})`}>
              {/* Background Inactive Arc Track */}
              <path 
                d={bgArcPath} 
                fill={isEmergencyActive ? "#360610" : "#24103f"} 
                stroke={isEmergencyActive ? "#881337" : "#3b156b"} 
                strokeWidth={0.5} 
              />
              
              {/* Active Score Arc with Gradient & Glow */}
              <path 
                d={activeArcPath} 
                fill="url(#threat-gauge-gradient)" 
                filter="url(#gauge-glow)"
              />
            </g>

            {/* Threshold Marker Indicator */}
            <line
              x1={threshX1}
              y1={threshY1}
              x2={threshX2}
              y2={threshY2}
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="2 1"
              filter="url(#gauge-glow)"
            />

            {/* Ticks */}
            {ticks.map((t, idx) => (
              <line
                key={idx}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke={isEmergencyActive ? "#f43f5e" : "#a855f7"}
                strokeOpacity={0.6}
                strokeWidth={1}
              />
            ))}

            {/* Pivot Indicator & Dynamic Needle Line */}
            <line
              x1={cx}
              y1={cy}
              x2={needleX}
              y2={needleY}
              stroke={isEmergencyActive ? "#ffffff" : "#f43f5e"}
              strokeWidth={isEmergencyActive ? 2.2 : 1.75}
              strokeLinecap="round"
              filter="url(#gauge-glow)"
            />
            <circle cx={cx} cy={cy} r={2.5} fill={isEmergencyActive ? "#ffffff" : "#f43f5e"} stroke="#1b0824" strokeWidth={1} />
            <circle cx={needleX} cy={needleY} r={2} fill="#ffffff" />

            {/* Scale Labels: 0 and 100 */}
            <text 
              x={cx - radius + 2} 
              y={cy + 12} 
              fill={isEmergencyActive ? "#f87171" : "#c084fc"} 
              fontSize="7.5" 
              fontFamily="monospace" 
              fontWeight="bold" 
              textAnchor="middle"
            >
              0
            </text>
            <text 
              x={cx + radius - 2} 
              y={cy + 12} 
              fill="#f43f5e" 
              fontSize="7.5" 
              fontFamily="monospace" 
              fontWeight="bold" 
              textAnchor="middle"
            >
              100
            </text>

            {/* Central Dynamic Threat Value (0-100) */}
            <text
              x={cx}
              y={cy - 13}
              fill="#ffffff"
              fontSize="14"
              fontFamily="monospace"
              fontWeight="900"
              textAnchor="middle"
              className={isEmergencyActive ? "drop-shadow-[0_0_12px_rgba(255,255,255,1)]" : "drop-shadow-[0_0_8px_rgba(244,63,94,0.9)]"}
            >
              {normalizedScore}
            </text>
            <text
              x={cx}
              y={cy - 2}
              fill={isEmergencyActive ? "#fecdd3" : "#f43f5e"}
              fontSize="7.5"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              letterSpacing="0.8"
            >
              {isEmergencyActive ? 'DEFCON 1' : level}
            </text>
          </svg>
        </div>

        {/* Right: Audio-like Threat Spectrum Equalizer */}
        <div className="flex-1 flex flex-col justify-center pl-3 border-l border-purple-500/25">
          <div className="flex items-center justify-between text-[8.5px] font-mono text-purple-300/80 mb-1.5">
            <span className="tracking-wider">ANOMALY SPECTRUM</span>
            <span className="text-rose-400 font-bold">{normalizedScore}%</span>
          </div>
          <div className="flex items-end justify-between gap-1 h-11 w-full">
            {waveformBars.map((h, i) => (
              <div
                key={i}
                className={`flex-1 min-w-[3px] rounded-t transition-all duration-300 ${
                  isEmergencyActive 
                    ? 'bg-gradient-to-t from-rose-700 via-rose-500 to-white animate-pulse' 
                    : 'bg-gradient-to-t from-purple-700 via-fuchsia-500 to-rose-400'
                }`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Clean Full-Width Non-overlapping Threat Risk Sub-bar */}
      <div className="flex items-center justify-center gap-1.5 mt-2 px-2.5 py-1 rounded-md bg-[#13072b]/90 border border-purple-500/35 text-[9.5px] font-mono font-semibold shadow-inner">
        {isEmergencyActive ? (
          <span className="text-rose-300 animate-pulse flex items-center gap-1 font-bold">
            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
            <span>OVERRIDE ENGAGED ({normalizedScore} &ge; {threshold})</span>
          </span>
        ) : (
          <span className="text-slate-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Risk <strong className="text-purple-300 font-bold">{normalizedScore}/100</strong> (Threshold {threshold})</span>
          </span>
        )}
      </div>

      {/* Emergency Mode Bottom Trigger / Countermeasures Button */}
      <div className="mt-1.5 pt-1.5 border-t border-purple-500/20 flex items-center justify-between gap-1.5">
        <button
          type="button"
          onClick={onToggleEmergencyOverride}
          className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1.5 transition-all ${
            isEmergencyActive 
              ? 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-[0_0_12px_rgba(225,29,72,0.8)] animate-pulse' 
              : 'bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/35 text-rose-300 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{isEmergencyActive ? 'DISENGAGE OVERRIDE' : 'EMERGENCY OVERRIDE'}</span>
        </button>

        {isEmergencyActive && onDeployCountermeasures && (
          <button
            type="button"
            onClick={onDeployCountermeasures}
            className="py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all shrink-0"
            title="Deploy automated countermeasures to suppress threat surge"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>MITIGATE</span>
          </button>
        )}
      </div>
    </div>
  );
};
