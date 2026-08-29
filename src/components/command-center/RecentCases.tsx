import React from 'react';
import { CaseItem } from '../../types';
import { ArrowUpRight, Plus, Sparkles, UserCheck } from 'lucide-react';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface RecentCasesProps {
  cases?: CaseItem[];
  onSelectCase?: (c: CaseItem) => void;
  onViewAll?: () => void;
  onNewCase?: () => void;
}

export const RecentCases: React.FC<RecentCasesProps> = ({ 
  cases = [], 
  onSelectCase, 
  onViewAll,
  onNewCase 
}) => {
  return (
    <div 
      id="recent-cases-card"
      className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col justify-between relative overflow-hidden"
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-cyber font-bold text-white tracking-wider">
            RECENT CASES
          </span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono">
            {cases.length} Total
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {onNewCase && (
            <button
              onClick={onNewCase}
              className="px-2 py-0.5 rounded bg-gradient-to-r from-purple-600/80 to-cyan-600/80 hover:from-purple-500 hover:to-cyan-500 text-white text-[10px] font-mono font-bold flex items-center gap-1 border border-cyan-400/40 shadow-sm transition-all"
              title="Intake new case and auto-assign specialist"
            >
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>+ Auto-Assign</span>
            </button>
          )}
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-purple-950/40"
            >
              <span>All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Case List */}
      <div className="space-y-1.5 overflow-y-auto max-h-48 text-[10.5px] font-mono">
        {(cases || []).slice(0, 5).map((c) => {
          const isInProgress = c.status === 'In Progress' || c.status === 'Investigating';
          const isCompleted = c.status === 'Completed' || c.status === 'Resolved';
          const isHigh = c.status === 'High' || c.severity === 'High' || c.severity === 'Critical';

          return (
            <div 
              key={c.id}
              onClick={() => onSelectCase && onSelectCase(c)}
              className="flex items-center justify-between p-1.5 px-2 rounded-lg hover:bg-[#180e38] cursor-pointer transition-colors group border border-transparent hover:border-purple-500/30"
            >
              <div className="min-w-0 pr-2 truncate flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-300 font-bold group-hover:text-purple-100 text-xs">
                    {c.caseNumber}
                  </span>
                  {c.assignedAgent && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/50 text-cyan-300 border border-cyan-500/20 truncate max-w-[110px] hidden sm:inline-block">
                      {c.assignedAgent}
                    </span>
                  )}
                </div>
                <div className="text-slate-300 truncate text-[10px] mt-0.5">
                  {c.title}
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                isInProgress 
                  ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-500/40 glow-purple-sm' 
                  : isCompleted 
                    ? 'text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 glow-green' 
                    : isHigh
                      ? 'text-rose-300 bg-rose-950/70 border border-rose-500/40 glow-red'
                      : 'text-teal-300 bg-teal-950/70 border border-teal-500/40'
              }`}>
                • {c.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
