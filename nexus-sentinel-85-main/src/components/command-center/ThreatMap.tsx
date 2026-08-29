import React from 'react';
import { ArrowUpRight, Globe, Shield, Radio, Activity } from 'lucide-react';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface ThreatMapProps {
  onViewMap?: () => void;
}

export const ThreatMap: React.FC<ThreatMapProps> = ({ onViewMap }) => {
  return (
    <div 
      id="threat-map-card"
      className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col justify-between relative overflow-hidden"
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-xs font-cyber font-bold text-white tracking-wider">
            THREAT MAP (LIVE)
          </span>
        </div>
        {onViewMap && (
          <button 
            onClick={onViewMap}
            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View Map</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cyber Vector World Map Canvas */}
      <div className="relative h-44 rounded-lg bg-[#080414] border border-purple-500/20 overflow-hidden flex items-center justify-center">
        {/* Vector World Grid */}
        <svg viewBox="0 0 400 200" className="w-full h-full opacity-70">
          {/* Cyber Latitude / Longitude lines */}
          <path d="M0 50 H400 M0 100 H400 M0 150 H400" stroke="#4c1d95" strokeWidth="0.5" strokeDasharray="3 3" />
          <path d="M100 0 V200 M200 0 V200 M300 0 V200" stroke="#4c1d95" strokeWidth="0.5" strokeDasharray="3 3" />

          {/* Continents Simplified Geometric Polygons */}
          {/* North America */}
          <path d="M50 40 L90 35 L120 60 L100 95 L65 90 L40 60 Z" fill="#1b1038" stroke="#7e22ce" strokeWidth="1" />
          {/* South America */}
          <path d="M95 105 L130 115 L115 170 L95 180 L80 135 Z" fill="#1b1038" stroke="#7e22ce" strokeWidth="1" />
          {/* Europe */}
          <path d="M190 35 L240 30 L235 65 L180 60 Z" fill="#1b1038" stroke="#7e22ce" strokeWidth="1" />
          {/* Africa */}
          <path d="M180 75 L235 75 L245 130 L210 160 L175 110 Z" fill="#1b1038" stroke="#7e22ce" strokeWidth="1" />
          {/* Asia */}
          <path d="M245 35 L350 40 L340 100 L270 95 L245 65 Z" fill="#1b1038" stroke="#7e22ce" strokeWidth="1" />
          {/* Australia */}
          <path d="M300 130 L360 135 L345 175 L295 165 Z" fill="#1b1038" stroke="#7e22ce" strokeWidth="1" />

          {/* Glowing Attack Trajectory Arcs */}
          <path d="M75 55 Q 160 20 220 50" fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 2" className="animate-pulse" />
          <path d="M300 65 Q 220 10 90 70" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
          <path d="M220 50 Q 260 100 320 145" fill="none" stroke="#38bdf8" strokeWidth="1.2" />
          <path d="M110 140 Q 150 90 195 95" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" />

          {/* Active Threat Node (Pulsing Red) */}
          <circle cx="75" cy="55" r="4" fill="#f43f5e" />
          <circle cx="75" cy="55" r="8" stroke="#f43f5e" strokeWidth="1" opacity="0.6" className="animate-ping" />
          
          {/* Suspicious Relay Node (Pulsing Amber) */}
          <circle cx="300" cy="65" r="3.5" fill="#f59e0b" />
          <circle cx="300" cy="65" r="7" stroke="#f59e0b" strokeWidth="0.8" opacity="0.5" className="animate-pulse" />

          {/* Known Benign / Internal Sensor Nodes (Static Purple) */}
          <circle cx="220" cy="50" r="3.5" fill="#a855f7" stroke="#d8b4fe" strokeWidth="0.5" />
          <circle cx="110" cy="140" r="3" fill="#a855f7" stroke="#d8b4fe" strokeWidth="0.5" />

          {/* Active Sensor / Telemetry Relay (Cyan) */}
          <circle cx="320" cy="145" r="3.5" fill="#38bdf8" stroke="#bae6fd" strokeWidth="0.5" />
        </svg>

        {/* Live Vector Overlay Telemetry */}
        <div className="absolute top-1 left-1.5 text-[8.5px] font-mono text-purple-200 bg-black/80 px-1.5 py-0.5 rounded border border-purple-500/30 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
          <span>LIVE TELEMETRY: C2 INGRESS DETECTED</span>
        </div>
      </div>

      {/* Clear Compact Legend */}
      <div 
        id="threat-map-legend"
        className="mt-1.5 pt-1.5 border-t border-purple-500/20 bg-[#070312]/80 rounded-lg p-1.5 font-mono text-[9px] text-slate-300"
      >
        <div className="flex items-center justify-between text-[8.5px] text-slate-400 font-semibold mb-1 uppercase tracking-wider">
          <span>Map Node Legend</span>
          <span className="text-purple-300">4 Signals Active</span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          {/* Active Threat */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span className="truncate">
              <strong className="text-rose-300 font-semibold">Active Threat:</strong> Critical C2
            </span>
          </div>

          {/* Suspicious Relay */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="truncate">
              <strong className="text-amber-300 font-semibold">Suspicious:</strong> Anomaly Ingress
            </span>
          </div>

          {/* Known Benign */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-purple-500 border border-purple-300 shrink-0"></span>
            <span className="truncate">
              <strong className="text-purple-300 font-semibold">Benign:</strong> Internal Node
            </span>
          </div>

          {/* Sensor Probe */}
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-sky-400 border border-sky-200 shrink-0"></span>
            <span className="truncate">
              <strong className="text-sky-300 font-semibold">Sensor:</strong> Telemetry Probe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
