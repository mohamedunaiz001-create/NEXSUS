import React from 'react';
import { Cpu, HardDrive, Database, Users, ArrowUpRight } from 'lucide-react';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface SystemOverviewProps {
  cpu?: number;
  memoryUsed?: number;
  memoryTotal?: number;
  disk?: number;
  activeAgents?: number;
  totalAgents?: number;
  onViewAll?: () => void;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  cpu = 23,
  memoryUsed = 7.3,
  memoryTotal = 16,
  disk = 62,
  activeAgents = 7,
  totalAgents = 8,
  onViewAll
}) => {
  return (
    <div 
      id="system-overview-widget"
      className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col justify-between relative overflow-hidden"
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <span className="text-xs font-cyber font-bold text-white tracking-wider">
          SYSTEM OVERVIEW
        </span>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cyber Server Graphic */}
      <div className="relative h-14 flex items-center justify-center">
        <svg viewBox="0 0 160 50" className="w-full h-full">
          {/* Central Server Rack Hologram */}
          <rect x="65" y="6" width="30" height="38" rx="4" fill="#180a30" stroke="#a855f7" strokeWidth="1.2" />
          <line x1="68" y1="14" x2="92" y2="14" stroke="#7e22ce" strokeWidth="1" />
          <line x1="68" y1="22" x2="92" y2="22" stroke="#7e22ce" strokeWidth="1" />
          <line x1="68" y1="30" x2="92" y2="30" stroke="#7e22ce" strokeWidth="1" />
          <line x1="68" y1="38" x2="92" y2="38" stroke="#7e22ce" strokeWidth="1" />

          {/* Glowing indicator LEDs */}
          <circle cx="72" cy="10" r="1.5" fill="#34d399" />
          <circle cx="77" cy="10" r="1.5" fill="#38bdf8" />
          <circle cx="82" cy="10" r="1.5" fill="#a855f7" />

          {/* Radiating Signal Lines */}
          <path d="M55 25C40 25 30 15 20 15" stroke="#7e22ce" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M105 25C120 25 130 15 140 15" stroke="#7e22ce" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M55 25C40 25 30 35 20 35" stroke="#7e22ce" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M105 25C120 25 130 35 140 35" stroke="#7e22ce" strokeWidth="1" strokeDasharray="2 2" />
          
          <circle cx="20" cy="15" r="3" fill="#1e1038" stroke="#38bdf8" strokeWidth="1" />
          <circle cx="140" cy="15" r="3" fill="#1e1038" stroke="#a855f7" strokeWidth="1" />
          <circle cx="20" cy="35" r="3" fill="#1e1038" stroke="#34d399" strokeWidth="1" />
          <circle cx="140" cy="35" r="3" fill="#1e1038" stroke="#f43f5e" strokeWidth="1" />
        </svg>
      </div>

      {/* 4 Metric Columns */}
      <div className="grid grid-cols-4 gap-1 text-center font-mono border-t border-purple-500/15 pt-1.5">
        <div className="min-w-0">
          <div className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-semibold truncate">CPU</div>
          <div className="text-[11px] sm:text-xs font-bold text-white mt-0.5">{cpu}%</div>
        </div>
        <div className="min-w-0">
          <div className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-semibold truncate">MEMORY</div>
          <div className="text-[10px] sm:text-[11px] font-bold text-white truncate mt-0.5" title={`${memoryUsed} / ${memoryTotal} GB`}>{memoryUsed}/{memoryTotal}G</div>
        </div>
        <div className="min-w-0">
          <div className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-semibold truncate">DISK</div>
          <div className="text-[11px] sm:text-xs font-bold text-white mt-0.5">{disk}%</div>
        </div>
        <div className="min-w-0">
          <div className="text-[8px] sm:text-[8.5px] text-slate-400 uppercase font-semibold truncate">AGENTS</div>
          <div className="text-[11px] sm:text-xs font-bold text-emerald-400 mt-0.5">{activeAgents}/{totalAgents}</div>
        </div>
      </div>
    </div>
  );
};

