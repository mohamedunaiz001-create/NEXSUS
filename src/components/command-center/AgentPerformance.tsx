import React from 'react';
import { SpecialistAgent } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import { CustomAgentIcon } from '../common/CustomAgentIcon';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface AgentPerformanceProps {
  agents: SpecialistAgent[];
  onViewAnalytics?: () => void;
}

export const AgentPerformance: React.FC<AgentPerformanceProps> = ({ agents, onViewAnalytics }) => {
  return (
    <div 
      id="agent-performance-card"
      className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col justify-between relative overflow-hidden"
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <span className="text-xs font-cyber font-bold text-white tracking-wider">
          AGENT PERFORMANCE
        </span>
        {onViewAnalytics && (
          <button 
            onClick={onViewAnalytics}
            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View Analytics</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-1 text-[9px] font-mono uppercase text-purple-400/90 font-bold px-1 pb-1 border-b border-purple-500/10">
        <span className="col-span-6">Agent Name</span>
        <span className="col-span-2 text-center">Tasks</span>
        <span className="col-span-2 text-center">Success</span>
        <span className="col-span-2 text-right">Avg. Time</span>
      </div>

      {/* Table Rows */}
      <div className="space-y-1 overflow-y-auto max-h-48 text-[10px] font-mono custom-scrollbar">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className="grid grid-cols-12 gap-1 items-center p-1 px-1.5 rounded hover:bg-[#180e38] transition-colors"
          >
            <div className="col-span-6 flex items-center gap-1.5 min-w-0">
              <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                <CustomAgentIcon type={agent.id} className="w-4 h-4" glow={false} />
              </div>
              <span className="text-slate-200 font-semibold text-[10px] leading-tight truncate" title={agent.name}>{agent.name}</span>
            </div>
            <div className="col-span-2 text-center text-slate-300 text-[10px] font-medium">{agent.tasksCompleted}</div>
            <div className="col-span-2 text-center text-emerald-400 font-bold text-[10px]">{agent.successRate}%</div>
            <div className="col-span-2 text-right text-purple-300 text-[10px] font-medium">{agent.avgTime || '2m 10s'}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
