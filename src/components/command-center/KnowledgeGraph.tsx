import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';

interface KnowledgeGraphProps {
  onExplore?: () => void;
}

export const KnowledgeGraph: React.FC<KnowledgeGraphProps> = ({ onExplore }) => {
  return (
    <div
      id="knowledge-graph-card"
      className="rounded-xl bg-[#090317]/95 border border-purple-500/30 p-3 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex flex-col justify-between relative overflow-hidden"
    >
      <GothicCornerFiligree size="sm" opacity="text-purple-400/50" />
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <span className="text-xs font-cyber font-bold text-white tracking-wider">KNOWLEDGE GRAPH</span>
        {onExplore && <button onClick={onExplore} className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"><span>Explore</span><ArrowUpRight className="w-3.5 h-3.5" /></button>}
      </div>
      <div className="h-44 rounded-lg bg-[#080414] border border-purple-500/20 flex items-center justify-center text-center px-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-purple-300/50">No relationships indexed yet</p>
      </div>
    </div>
  );
};
