import React from 'react';
import { ActivityItem } from '../../types';
import { ArrowUpRight } from 'lucide-react';
import { CustomAgentIcon } from '../common/CustomAgentIcon';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface LiveActivityProps {
  activities?: ActivityItem[];
  onViewAll?: () => void;
}

export const LiveActivity: React.FC<LiveActivityProps> = ({ activities = [], onViewAll }) => {
  return (
    <div 
      id="live-activity-widget"
      className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3.5 shadow-[0_0_15px_rgba(168,85,247,0.2)] space-y-2.5 relative overflow-hidden"
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-cyber font-bold text-white tracking-wider">
            LIVE ACTIVITY
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse glow-green" />
        </div>
        {onViewAll && (
          <button 
            onClick={onViewAll}
            className="text-[10.5px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-2">
        {(activities || []).slice(0, 5).map((act) => (
          <div 
            key={act.id}
            className="flex items-start gap-2.5 text-xs font-mono group p-1.5 rounded-lg hover:bg-[#160d33] transition-colors"
          >
            {/* Timestamp */}
            <span className="text-[11px] text-purple-400/80 shrink-0 pt-0.5 font-medium">
              {act.timestamp}
            </span>

            {/* Custom Icon Badge */}
            <div className="w-6 h-6 rounded-md bg-[#1f1142] border border-purple-500/40 flex items-center justify-center shrink-0 p-0.5 glow-purple-sm">
              <CustomAgentIcon type={act.agentType || 'malware-analysis'} className="w-4 h-4" glow={false} />
            </div>

            {/* Action Text */}
            <div className="flex-1 min-w-0 leading-snug">
              <span className="font-bold text-purple-200 text-xs">
                {act.agentName}:
              </span>{' '}
              <span className="text-slate-200 text-xs font-sans">
                {act.action}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
