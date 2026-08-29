import React, { useState } from 'react';
import { 
  Radio, 
  Terminal, 
  Activity, 
  ChevronRight, 
  Cpu, 
  Zap, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  BarChart2,
  X,
  FileCode,
  Eye,
  Crosshair,
  Sparkles
} from 'lucide-react';
import { SpecialistAgent } from '../../types';
import { CustomAgentIcon } from '../common/CustomAgentIcon';
import { AgentTelemetryModal } from '../modals/AgentTelemetryModal';

interface AgentHierarchyProps {
  agents: SpecialistAgent[];
  selectedAgent: SpecialistAgent | null;
  onSelectAgent: (agent: SpecialistAgent) => void;
}

export const AgentHierarchy: React.FC<AgentHierarchyProps> = ({
  agents,
  selectedAgent,
  onSelectAgent,
}) => {
  const [telemetryAgent, setTelemetryAgent] = useState<SpecialistAgent | null>(null);

  return (
    <div id="agent-hierarchy-section" className="space-y-2">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
        <div>
          <h3 className="text-xs sm:text-sm font-cyber font-bold uppercase tracking-widest text-white flex items-center gap-2">
            <span>AGENT ORCHESTRATION HIERARCHY</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40">
              8 SPECIALISTS
            </span>
          </h3>
          <p className="text-[10.5px] font-mono text-purple-300/80 mt-0.5">
            CEO ARCHON delegating live multi-threaded security operations
          </p>
        </div>

        {/* Patrol Mode Status Legend */}
        <div className="flex items-center gap-3 text-[10px] font-mono bg-[#0c051a] px-2.5 py-1 rounded-lg border border-purple-500/30">
          <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Active Patrol (Scanning)</span>
          </span>
          <span className="text-purple-500/50">|</span>
          <span className="flex items-center gap-1.5 text-cyan-300/90 font-semibold">
            <span className="inline-flex h-2 w-2 rounded-full bg-cyan-400 opacity-70"></span>
            <span>Standby / Ready</span>
          </span>
        </div>
      </div>

      {/* Simple, Crisp Straight Line Connectors linking CEO Commander to Agent Cards */}
      <div className="relative w-full h-6 sm:h-7 hidden sm:block overflow-visible -my-0.5">
        <svg 
          viewBox="0 0 800 28" 
          preserveAspectRatio="none" 
          className="w-full h-full overflow-visible pointer-events-none select-none"
        >
          {/* Central Stem from Commander */}
          <line 
            x1="400" 
            y1="0" 
            x2="400" 
            y2="12" 
            stroke="#a855f7" 
            strokeWidth="1.5" 
            strokeOpacity="0.8"
          />

          {/* Central Junction Dot */}
          <circle cx="400" cy="12" r="2.5" fill="#c084fc" />

          {/* Main Straight Horizontal Bus Bar */}
          <line 
            x1="50" 
            y1="12" 
            x2="750" 
            y2="12" 
            stroke="#6b21a8" 
            strokeWidth="1.5" 
            strokeOpacity="0.5"
          />

          {/* Straight Line Connections to Each Specialist Agent */}
          {agents.map((agent, index) => {
            const isActive = agent.status === 'ACTIVE';
            const targetX = 50 + index * 100;

            return (
              <g key={agent.id}>
                {/* Horizontal Segment from Center to Agent Column (active highlight) */}
                {isActive && (
                  <line
                    x1="400"
                    y1="12"
                    x2={targetX}
                    y2="12"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeOpacity="0.9"
                  />
                )}

                {/* Vertical Straight Drop Line to Agent Card */}
                <line
                  x1={targetX}
                  y1="12"
                  x2={targetX}
                  y2="28"
                  stroke={isActive ? '#10b981' : '#6b21a8'}
                  strokeWidth={isActive ? '1.5' : '1'}
                  strokeOpacity={isActive ? 1 : 0.4}
                  strokeDasharray={isActive ? undefined : '2 2'}
                />

                {/* Corner Joint Dot */}
                <circle 
                  cx={targetX} 
                  cy="12" 
                  r="1.5" 
                  fill={isActive ? '#34d399' : '#a855f7'} 
                  opacity={isActive ? 1 : 0.6}
                />

                {/* Terminal Connection Node at Card Top */}
                <circle 
                  cx={targetX} 
                  cy="28" 
                  r={isActive ? 2.5 : 1.5} 
                  fill={isActive ? '#10b981' : '#9333ea'} 
                  stroke={isActive ? '#ffffff' : '#38126b'}
                  strokeWidth="0.8"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* 8 Agent Cards in Strict 8-Column Grid Layout with Fixed Width Ratio */}
      <div 
        className="grid gap-1.5 sm:gap-2 xl:gap-2.5 w-full overflow-x-auto pb-1 custom-scrollbar"
        style={{ gridTemplateColumns: 'repeat(8, minmax(100px, 1fr))' }}
      >
        {agents.map((agent) => {
          const isActive = agent.status === 'ACTIVE';

          return (
            <div
              key={agent.id}
              id={`agent-node-${agent.id}`}
              onClick={() => onSelectAgent(agent)}
              className={`group cursor-pointer rounded-xl bg-gradient-to-b from-[#140b2e] via-[#0e0622] to-[#090418] border ${
                isActive ? 'border-purple-500/50 glow-purple' : 'border-purple-500/25'
              } hover:border-purple-300 hover:glow-purple-lg p-2 sm:p-2.5 xl:p-3 flex flex-col justify-between transition-all duration-200 hover:-translate-y-1 min-w-0 relative overflow-hidden`}
            >
              {/* Top Accent Gradient Bar */}
              <div 
                className={`absolute top-0 left-0 right-0 h-[2px] ${
                  isActive ? 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500' : 'bg-purple-500/30'
                }`}
              />

              {/* Card Top: Name & Role/Category */}
              <div className="text-center pb-1 sm:pb-1.5 border-b border-purple-500/15 w-full">
                <div 
                  className={`w-full font-mono font-bold text-white tracking-tight leading-tight group-hover:text-purple-200 min-h-[2.6em] sm:min-h-[2.8em] flex flex-wrap items-center justify-center text-center px-0.5 whitespace-normal break-words hyphens-auto overflow-visible [text-overflow:unset] ${
                    agent.name.length > 17
                      ? 'text-[7.5px] sm:text-[8px] md:text-[8.5px] xl:text-[9.5px]'
                      : agent.name.length > 12
                      ? 'text-[8.5px] sm:text-[9px] md:text-[9.5px] xl:text-[10.5px]'
                      : 'text-[9px] sm:text-[9.5px] md:text-[10px] xl:text-[11px]'
                  }`}
                  title={agent.name}
                >
                  <span className="w-full break-words leading-tight">{agent.name.toUpperCase()}</span>
                </div>
                <div className="text-[7.5px] sm:text-[8px] xl:text-[8.5px] font-mono text-purple-300/80 truncate mt-0.5" title={agent.category}>
                  {agent.category}
                </div>
              </div>

              {/* Card Center: Icon with Patrol-Path Scanning / Standby Fading Rings */}
              <div className="py-1.5 sm:py-2 xl:py-2.5 flex flex-col items-center justify-center space-y-1.5 sm:space-y-2">
                <div className="relative flex items-center justify-center">
                  {/* Fading Ring Patrol Radar Animations */}
                  {isActive ? (
                    <>
                      <span 
                        className="absolute inset-0 rounded-xl border border-emerald-400/50 animate-patrol-ring-1 pointer-events-none"
                        aria-hidden="true" 
                      />
                      <span 
                        className="absolute inset-0 rounded-xl border border-emerald-500/40 animate-patrol-ring-2 pointer-events-none" 
                        aria-hidden="true" 
                      />
                    </>
                  ) : (
                    <span 
                      className="absolute -inset-0.5 rounded-xl border border-cyan-500/30 animate-patrol-idle pointer-events-none" 
                      aria-hidden="true" 
                    />
                  )}

                  {/* Icon Box */}
                  <div className={`relative w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 rounded-xl bg-[#1d0f3c] border ${
                    isActive 
                      ? 'border-emerald-400/70 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                      : 'border-purple-500/40 glow-purple-sm'
                  } flex items-center justify-center shadow-inner group-hover:border-purple-300 group-hover:scale-105 transition-all shrink-0 z-10`}>
                    <CustomAgentIcon type={agent.id} className="w-4 h-4 sm:w-4.5 sm:h-4.5 xl:w-5 xl:h-5" glow={true} />
                    
                    {/* Corner Radar Signal Dot */}
                    <span 
                      className={`absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex items-center justify-center border text-[7px] ${
                        isActive 
                          ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_6px_#10b981]' 
                          : 'bg-[#150a2d] border-cyan-500/50 text-cyan-300/80'
                      }`}
                    >
                      {isActive ? (
                        <Radio className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-emerald-300 animate-pulse" />
                      ) : (
                        <Eye className="w-1.5 h-1.5 text-cyan-400/70" />
                      )}
                    </span>
                  </div>
                </div>

                {/* Status Indicator Chip */}
                <div className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400 opacity-60'
                  }`} />
                  <span className={`text-[8.5px] sm:text-[9px] xl:text-[9.5px] font-mono font-bold ${
                    isActive ? 'text-emerald-300' : 'text-cyan-300/80'
                  }`}>
                    {isActive ? 'PATROL' : 'STANDBY'}
                  </span>
                </div>
              </div>

              {/* Card Bottom: Progress Bar & Telemetry Modal Trigger */}
              <div className="space-y-1 sm:space-y-1.5 pt-1 sm:pt-1.5 border-t border-purple-500/15">
                <div className="flex items-center justify-between text-[8px] sm:text-[8.5px] xl:text-[9px] font-mono text-purple-300/80">
                  <span>Cycle</span>
                  <span className="font-bold text-white">{agent.progress}%</span>
                </div>
                
                <div className="w-full h-1 sm:h-1.5 rounded-full bg-[#1b0d38] border border-purple-500/30 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_6px_#34d399]' 
                        : 'bg-gradient-to-r from-purple-500 to-indigo-400'
                    }`}
                    style={{ width: `${agent.progress}%` }}
                  />
                </div>

                {/* On-Demand Telemetry Popover Button */}
                <button
                  type="button"
                  id={`view-logs-btn-${agent.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTelemetryAgent(agent);
                  }}
                  className="w-full mt-0.5 py-0.5 sm:py-1 px-1 rounded-lg bg-[#180c33] hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-400/60 text-[8px] sm:text-[8.5px] font-mono text-purple-200 hover:text-white flex items-center justify-center gap-0.5 sm:gap-1 transition-all group/btn"
                  title="View live terminal logs and system diagnostics"
                >
                  <Terminal className="w-2.5 h-2.5 text-purple-400 group-hover/btn:text-cyan-300 shrink-0" />
                  <span className="truncate">Logs</span>
                  <ChevronRight className="w-2 h-2 text-purple-400 group-hover/btn:translate-x-0.5 transition-transform shrink-0" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry Logs Modal */}
      {telemetryAgent && (
        <AgentTelemetryModal
          agent={telemetryAgent}
          isOpen={!!telemetryAgent}
          onClose={() => setTelemetryAgent(null)}
        />
      )}
    </div>
  );
};
