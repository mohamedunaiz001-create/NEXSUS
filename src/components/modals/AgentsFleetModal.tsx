import React, { useState } from 'react';
import { SpecialistAgent } from '../../types';
import { RadialHealthGauge, computeAgentHealthMetrics } from '../common/RadialHealthGauge';
import { 
  X, 
  Users, 
  Search, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Cpu, 
  Radio, 
  ChevronRight, 
  Sparkles,
  Layers,
  Filter
} from 'lucide-react';

interface AgentsFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: SpecialistAgent[];
  onSelectAgent: (agent: SpecialistAgent) => void;
  onRunAgentTask?: (agentId: string, taskDescription: string) => void;
}

export const AgentsFleetModal: React.FC<AgentsFleetModalProps> = ({
  isOpen,
  onClose,
  agents,
  onSelectAgent,
  onRunAgentTask
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'tactical', 'forensics', 'intelligence', 'defensive', 'governance'];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.specialization.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'ALL' || agent.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const activeCount = agents.filter(a => a.status === 'ACTIVE' || a.status === 'ANALYZING' || a.status === 'BUSY').length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        id="agents-fleet-modal"
        className="w-full max-w-5xl bg-[#0c061e] border border-purple-500/40 rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col max-h-[90vh] overflow-hidden text-slate-200 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#170c36] via-[#12082c] to-[#0d0522] border-b border-purple-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-cyber font-bold text-white tracking-wider">
                  SPECIALIST AGENT FLEET
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300">
                  {activeCount} / {agents.length} ONLINE
                </span>
              </div>
              <p className="text-xs text-purple-300/80 font-mono mt-0.5">
                Autonomous Security Operations Matrix &bull; Real-time System Telemetry &amp; Health
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 transition-colors border border-transparent hover:border-purple-500/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="p-4 border-b border-purple-500/20 bg-[#0e0724] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by agent name, role, model, or capability..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#160b33] border border-purple-500/30 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
            {searchTerm && (
              <button 
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold uppercase transition-all whitespace-nowrap border ${
                  selectedCategory === cat
                    ? 'bg-purple-600 border-white text-white shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'bg-[#150a30] hover:bg-purple-950 border-purple-500/25 text-slate-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Agents Grid List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredAgents.map((agent) => {
            const health = computeAgentHealthMetrics(agent);

            return (
              <div
                key={agent.id}
                onClick={() => {
                  onSelectAgent(agent);
                  onClose();
                }}
                className="group relative p-4 rounded-xl bg-gradient-to-b from-[#130b2c] to-[#0c061f] border border-purple-500/30 hover:border-cyan-400 transition-all duration-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.2)] cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#20113f] border border-purple-500/40 flex items-center justify-center font-bold text-white shadow-inner group-hover:border-cyan-400 transition-colors">
                        <Zap className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-cyber font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                            {agent.name}
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/30 text-purple-300 uppercase">
                            {agent.category}
                          </span>
                        </div>
                        <p className="text-xs text-purple-300/80 font-mono">{agent.role}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 ${
                      agent.status === 'ACTIVE'
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                        : agent.status === 'ANALYZING' || agent.status === 'BUSY'
                        ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                        : 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                    }`}>
                      ● {agent.status}
                    </span>
                  </div>

                  {/* Health & Performance Metrics Pill Row */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-3">
                    <div className="p-2 rounded-lg bg-[#0a0418] border border-purple-500/20">
                      <span className="text-[9.5px] text-slate-400 block uppercase">Health Index</span>
                      <span className="font-bold text-cyan-300 text-xs flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        {health.compositeScore}%
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0a0418] border border-purple-500/20">
                      <span className="text-[9.5px] text-slate-400 block uppercase">Success Rate</span>
                      <span className="font-bold text-emerald-400 text-xs">
                        {agent.successRate}%
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#0a0418] border border-purple-500/20">
                      <span className="text-[9.5px] text-slate-400 block uppercase">Tasks</span>
                      <span className="font-bold text-purple-200 text-xs">
                        {agent.tasksCompleted}
                      </span>
                    </div>
                  </div>

                  {/* Current Active Task */}
                  <div className="p-2.5 rounded-lg bg-[#0a0418] border border-purple-500/25 mb-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                      <span className="flex items-center gap-1 text-purple-300 font-bold">
                        <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                        Active Mission
                      </span>
                      <span className="text-cyan-300 font-bold">{agent.progress}%</span>
                    </div>
                    <p className="text-xs text-slate-200 font-mono truncate">
                      {agent.currentTask}
                    </p>
                    <div className="w-full bg-[#180e30] h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div 
                        className="bg-gradient-to-r from-purple-500 via-indigo-400 to-cyan-400 h-full rounded-full" 
                        style={{ width: `${agent.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {(agent.specialization || []).slice(0, 3).map((spec, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1a0e36] border border-purple-500/30 text-purple-200"
                      >
                        {spec}
                      </span>
                    ))}
                    {(agent.specialization || []).length > 3 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 text-slate-400">
                        +{(agent.specialization || []).length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Action Link */}
                <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs font-mono">
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-200">
                    Model: <strong className="text-purple-300 font-bold">{agent.model}</strong>
                  </span>
                  <div className="flex items-center gap-1 text-cyan-300 group-hover:translate-x-1 transition-transform font-bold">
                    <span>Inspect Specialist</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAgents.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 font-mono">
              <Users className="w-8 h-8 text-purple-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No specialist agents matched &quot;{searchTerm}&quot;</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('ALL');
                }}
                className="mt-2 text-xs text-cyan-400 hover:underline"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#12082a] border-t border-purple-500/20 flex items-center justify-between text-xs font-mono shrink-0">
          <div className="text-slate-400 hidden sm:block">
            Click any specialist card to launch their full <strong className="text-cyan-300">Radial Health Gauge HUD</strong> &amp; telemetry controls.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-4 py-2 rounded-lg bg-[#1a0e36] hover:bg-[#25144c] border border-purple-500/30 text-white font-semibold transition-colors"
          >
            Close Fleet Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
