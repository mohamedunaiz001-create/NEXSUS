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
      {/* Header */}
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-1.5 mb-1.5">
        <span className="text-xs font-cyber font-bold text-white tracking-wider">
          KNOWLEDGE GRAPH
        </span>
        {onExplore && (
          <button 
            onClick={onExplore}
            className="text-[10px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Explore</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Cyber Graph Canvas */}
      <div className="relative h-44 rounded-lg bg-[#080414] border border-purple-500/20 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 300 200" className="w-full h-full p-2">
          {/* Connecting Links */}
          <line x1="150" y1="100" x2="80" y2="50" stroke="#7e22ce" strokeWidth="1.5" strokeDasharray="3 2" />
          <line x1="150" y1="100" x2="220" y2="50" stroke="#7e22ce" strokeWidth="1.5" />
          <line x1="150" y1="100" x2="60" y2="135" stroke="#7e22ce" strokeWidth="1.5" />
          <line x1="150" y1="100" x2="230" y2="135" stroke="#7e22ce" strokeWidth="1.5" />
          <line x1="150" y1="100" x2="150" y2="165" stroke="#7e22ce" strokeWidth="1.5" />

          {/* Center Case Node */}
          <circle cx="150" cy="100" r="24" fill="#2d1254" stroke="#c084fc" strokeWidth="2" />
          <text x="150" y="96" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">CASE:</text>
          <text x="150" y="108" fill="#c084fc" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">2024-017</text>

          {/* Node 1: APT28 */}
          <circle cx="80" cy="50" r="16" fill="#1e103d" stroke="#f43f5e" strokeWidth="1.5" />
          <text x="80" y="54" fill="#f43f5e" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">APT28</text>

          {/* Node 2: malware.exe */}
          <circle cx="220" cy="50" r="17" fill="#1e103d" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="220" y="54" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">malware.exe</text>

          {/* Node 3: CVE */}
          <circle cx="60" cy="135" r="16" fill="#1e103d" stroke="#a855f7" strokeWidth="1.5" />
          <text x="60" y="138" fill="#c084fc" fontSize="6" fontWeight="bold" fontFamily="monospace" textAnchor="middle">CVE-2023</text>

          {/* Node 4: Domain */}
          <circle cx="230" cy="135" r="16" fill="#1e103d" stroke="#fb923c" strokeWidth="1.5" />
          <text x="230" y="139" fill="#fb923c" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">bad-c2.net</text>

          {/* Node 5: Phishing Campaign */}
          <circle cx="150" cy="165" r="16" fill="#1e103d" stroke="#34d399" strokeWidth="1.5" />
          <text x="150" y="169" fill="#34d399" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">Phishing</text>
        </svg>

        <div className="absolute bottom-1 right-2 text-[9px] font-mono font-medium text-purple-300 bg-black/70 px-1.5 py-0.5 rounded border border-purple-500/20">
          6 Entities • 8 Relations
        </div>
      </div>
    </div>
  );
};
