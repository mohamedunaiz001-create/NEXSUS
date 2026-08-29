import React from 'react';
import { ArrowUpRight, Globe, Shield, Radio, Activity } from 'lucide-react';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface ThreatMapProps {
  onViewMap?: () => void;
}

export const ThreatMap: React.FC<ThreatMapProps> = ({ onViewMap }) => {
  return (
    <div id="threat-map-card" className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col justify-between relative overflow-hidden">
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-purple-400" /><span className="text-xs font-cyber font-bold text-white tracking-wider">THREAT MAP (LIVE)</span></div>
        {onViewMap && <button onClick={onViewMap} className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"><span>View Map</span><ArrowUpRight className="w-3.5 h-3.5" /></button>}
      </div>
      <div className="relative h-44 rounded-lg bg-[#080414] border border-purple-500/20 flex items-center justify-center text-center px-4">
        <div><Radio className="mx-auto mb-2 h-5 w-5 text-purple-400/60" /><p className="font-mono text-[10px] uppercase tracking-wider text-purple-300/50">Awaiting live telemetry</p><p className="mt-1 font-mono text-[9px] text-slate-500">No threat signals have been ingested.</p></div>
      </div>
      <div id="threat-map-legend" className="mt-1.5 pt-1.5 border-t border-purple-500/20 bg-[#070312]/80 rounded-lg p-1.5 font-mono text-[9px] text-slate-400">No active signals</div>
    </div>
  );
};
