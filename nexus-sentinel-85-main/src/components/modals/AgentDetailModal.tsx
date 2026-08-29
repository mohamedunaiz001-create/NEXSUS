import React, { useState } from 'react';
import { SpecialistAgent } from '../../types';
import { RadialHealthGauge } from '../common/RadialHealthGauge';
import { 
  X, 
  Play, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  Shield, 
  Terminal, 
  Zap, 
  Activity, 
  Sparkles,
  Layers,
  Flame,
  Radio,
  FileCode
} from 'lucide-react';

interface AgentDetailModalProps {
  agent: SpecialistAgent | null;
  onClose: () => void;
  onRunTask?: (agentId: string, task: string) => void;
}

export const AgentDetailModal: React.FC<AgentDetailModalProps> = ({ agent, onClose, onRunTask }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'directive'>('overview');

  if (!agent) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      <div 
        id="agent-detail-modal"
        className="w-full max-w-4xl bg-[#0b061c] border border-purple-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(168,85,247,0.2)] space-y-4 text-slate-200 font-sans max-h-[90vh] overflow-y-auto no-scrollbar"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-primary)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#221342] border border-purple-500/50 flex items-center justify-center text-purple-300 font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-cyber font-bold text-white tracking-wider">
                  {agent.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  agent.status === 'ACTIVE'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : agent.status === 'ANALYZING' || agent.status === 'BUSY'
                    ? 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                    : 'bg-purple-950/80 border-purple-500/40 text-purple-300'
                }`}>
                  ● {agent.status}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-500/20">
                  {agent.category.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-purple-400 font-mono mt-0.5 flex items-center gap-1.5">
                <span>{agent.role}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-slate-400">Node ID: {agent.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950/60 transition-colors border border-transparent hover:border-purple-500/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Left Health Snapshot & Right Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column: Radial Health, Integrity & Stress Gauge (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-4 rounded-xl bg-gradient-to-b from-[#140b2e] to-[#0d0722] border border-cyan-500/30 shadow-inner">
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-cyber font-bold text-cyan-300">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>SYSTEM HEALTH GAUGE</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE HUD
              </span>
            </div>

            {/* Radial Gauge Visualizer */}
            <div className="py-2 flex justify-center">
              <RadialHealthGauge 
                agent={agent} 
                size={200}
                showDetailedCards={true}
              />
            </div>
          </div>

          {/* Right Column: Execution Metrics, Active Task, Capabilities & Directive (7 Cols) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Core Metrics Row */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-[#140b2e] border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <span className="text-slate-400 text-[10px] block uppercase">MODEL</span>
                <span className="text-purple-300 font-bold text-xs truncate block" title={agent.model}>
                  {agent.model}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#140b2e] border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <span className="text-slate-400 text-[10px] block uppercase">SUCCESS RATE</span>
                <span className="text-emerald-400 font-bold text-sm">{agent.successRate}%</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#140b2e] border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <span className="text-slate-400 text-[10px] block uppercase">TASKS RUN</span>
                <span className="text-purple-200 font-bold text-sm">{agent.tasksCompleted}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#140b2e] border border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <span className="text-slate-400 text-[10px] block uppercase">AVG RUNTIME</span>
                <span className="text-cyan-300 font-bold text-sm">{agent.avgTime}</span>
              </div>
            </div>

            {/* Current Task Progress */}
            <div className="p-3.5 rounded-xl bg-[#120928] border border-purple-500/25 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-purple-300 font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Active Mission Directive
                </span>
                <span className="text-emerald-400 font-bold">{agent.progress}% Complete</span>
              </div>
              <div className="text-xs text-slate-200 font-mono bg-[#090416] p-2.5 rounded-lg border border-purple-500/20 leading-relaxed">
                {agent.currentTask}
              </div>
              <div className="w-full bg-[#1e1338] h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-600 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" 
                  style={{ width: `${agent.progress}%` }} 
                />
              </div>
            </div>

            {/* Specializations / Tooling Tags */}
            <div className="p-3 rounded-xl bg-[#100724] border border-purple-500/20">
              <span className="text-[11px] font-mono uppercase text-purple-300 font-bold block mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Specialized Tooling & Capabilities
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(agent.specialization || []).map((spec, i) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-lg bg-[#1a0e36] border border-purple-500/30 text-purple-200 text-xs font-mono font-medium hover:border-purple-400 transition-colors"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* System Prompt Context */}
            {agent.systemPrompt && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block font-bold flex items-center gap-1">
                  <FileCode className="w-3 h-3 text-slate-400" />
                  Autonomous Behavioral Directives
                </span>
                <p className="text-[11px] text-slate-400 bg-[#070312] p-2.5 rounded-lg border border-purple-500/10 leading-relaxed font-mono italic">
                  &quot;{agent.systemPrompt}&quot;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-500/20">
          <div className="text-[11px] text-slate-400 font-mono">
            Specialist Status: <strong className="text-emerald-400">ONLINE &amp; SYNCHRONIZED</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-[#180e32] hover:bg-[#221346] text-slate-300 hover:text-white text-xs font-mono font-semibold transition-colors border border-purple-500/20"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                if (onRunTask) onRunTask(agent.id, 'Trigger deep system diagnostic scan & memory health flush');
                onClose();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Delegate Directive</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
