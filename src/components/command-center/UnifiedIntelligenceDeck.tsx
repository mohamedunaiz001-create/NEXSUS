import React from 'react';
import { CaseItem, SpecialistAgent, AIProvider } from '../../types';
import { BarChart3, Cpu, FolderArchive, ShieldAlert } from 'lucide-react';

interface UnifiedIntelligenceDeckProps {
  cases?: CaseItem[];
  agents?: SpecialistAgent[];
  providers?: AIProvider[];
  onSelectCase: (c: CaseItem) => void;
  onSelectAgent: (a: SpecialistAgent) => void;
  onOpenSearch: () => void;
  onOpenCEOChat: () => void;
}

export const UnifiedIntelligenceDeck: React.FC<UnifiedIntelligenceDeckProps> = ({ cases = [], agents = [], providers = [], onSelectCase, onSelectAgent, onOpenSearch, onOpenCEOChat }) => {
  const connectedProviders = providers.filter((p) => p.enabled).length;
  const activeAgents = agents.filter((a) => !['IDLE', 'OFFLINE'].includes(a.status)).length;
  return (
    <div id="unified-intelligence-deck" className="w-full rounded-xl border border-purple-500/30 bg-[#090317]/95 p-3 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
      <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
        <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-purple-300" /><span className="font-mono text-xs font-bold tracking-wider text-white">UNIFIED INTELLIGENCE</span></div>
        <button onClick={onOpenSearch} className="font-mono text-[10px] text-purple-300 hover:text-white">Search</button>
      </div>
      <div className="grid grid-cols-2 gap-2 py-3 lg:grid-cols-4">
        {[['Cases', cases.length, FolderArchive], ['Active Agents', activeAgents, BarChart3], ['Providers Connected', connectedProviders, Cpu], ['Indexed Signals', 0, ShieldAlert]].map(([label, value, Icon]) => {
          const I = Icon as React.ElementType;
          return <div key={String(label)} className="rounded-lg border border-purple-500/20 bg-purple-950/15 p-2"><div className="flex items-center gap-1.5 text-purple-300/70"><I className="h-3.5 w-3.5" /><span className="font-mono text-[9px] uppercase">{label}</span></div><div className="mt-1 font-mono text-lg text-white">{value as React.ReactNode}</div></div>;
        })}
      </div>
      <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
        {cases.length === 0 ? <><p className="font-mono text-[10px] uppercase tracking-wider text-purple-300/60">No investigation data</p><p className="mt-1 font-mono text-[9px] text-slate-500">Create a case or ingest evidence to populate the intelligence deck.</p></> : <div className="space-y-1 text-left">{cases.slice(0, 5).map(c => <button key={c.id} onClick={() => onSelectCase(c)} className="block w-full rounded border border-purple-500/15 p-2 text-left hover:bg-purple-500/10"><span className="font-mono text-[10px] text-white">{c.caseNumber}</span><span className="ml-2 font-mono text-[10px] text-purple-300/70">{c.title}</span></button>)}</div>}
      </div>
      <div className="mt-2 flex gap-2">
        <button onClick={onOpenCEOChat} className="rounded border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 font-mono text-[10px] text-purple-200 hover:bg-purple-500/20">Open ARCHON</button>
        {agents[0] && <button onClick={() => onSelectAgent(agents[0])} className="rounded border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 font-mono text-[10px] text-purple-200 hover:bg-purple-500/20">View Fleet</button>}
      </div>
    </div>
  );
};
