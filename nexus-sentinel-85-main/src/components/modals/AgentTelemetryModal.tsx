import React from 'react';
import { SpecialistAgent } from '../../types';
import { X, Terminal, Cpu, CheckCircle2, Shield, Activity, Radio, Clock, Code, Copy } from 'lucide-react';

interface AgentTelemetryModalProps {
  agent: SpecialistAgent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AgentTelemetryModal: React.FC<AgentTelemetryModalProps> = ({ agent, isOpen, onClose }) => {
  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="agent-telemetry-modal"
        className="w-full max-w-2xl bg-[#0e0722] border border-purple-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-200 font-mono text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#140b2e] border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Terminal className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-cyber font-bold text-white tracking-wider">
                  {agent.name.toUpperCase()} // LIVE TELEMETRY
                </h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  agent.status === 'ACTIVE'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                }`}>
                  {agent.status}
                </span>
              </div>
              <p className="text-[11px] text-purple-300/80">{agent.role} &bull; Model: {agent.model}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick Metrics */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="p-2.5 rounded-xl bg-[#090317] border border-purple-500/20">
              <span className="text-slate-400 text-[10px] block uppercase">Current Cycle</span>
              <span className="text-white font-bold text-sm">{agent.progress}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090317] border border-purple-500/20">
              <span className="text-slate-400 text-[10px] block uppercase">Tasks Done</span>
              <span className="text-purple-300 font-bold text-sm">{agent.tasksCompleted}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090317] border border-purple-500/20">
              <span className="text-slate-400 text-[10px] block uppercase">Success Rate</span>
              <span className="text-emerald-400 font-bold text-sm">{agent.successRate}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090317] border border-purple-500/20">
              <span className="text-slate-400 text-[10px] block uppercase">Avg Exec</span>
              <span className="text-cyan-300 font-bold text-sm">{agent.avgTime}</span>
            </div>
          </div>

          {/* Current Active Task */}
          <div className="p-3 rounded-xl bg-[#090317] border border-purple-500/30 space-y-1">
            <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Current Operational Task</span>
            </div>
            <p className="text-slate-200 text-xs font-bold leading-relaxed">{agent.currentTask}</p>
          </div>

          {/* Live MicroVM Telemetry Logs Console */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Terminal Execution Logs</span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Stream
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#070212] border border-purple-500/40 font-mono text-[11px] space-y-2 max-h-56 overflow-y-auto">
              {agent.systemLogs && agent.systemLogs.length > 0 ? (
                agent.systemLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px] shrink-0">[{log.timestamp}]</span>
                    <span className={`px-1 rounded text-[9px] font-bold shrink-0 ${
                      log.level === 'EXEC' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' :
                      log.level === 'WARN' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                      'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {log.level}
                    </span>
                    <span className="text-slate-300 break-all">{log.message}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px]">[10:24:48]</span>
                    <span className="px-1 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">INFO</span>
                    <span className="text-slate-300">Initialized sandbox microVM container with cgroup v2 isolates.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px]">[10:24:50]</span>
                    <span className="px-1 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-500/30">EXEC</span>
                    <span className="text-emerald-300">Disassembling target subroutine blocks at base 0x00401000.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-slate-500 text-[10px]">[10:24:54]</span>
                    <span className="px-1 rounded text-[9px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/30">INFO</span>
                    <span className="text-slate-300">Synchronized findings with ARCHON master telemetry pipeline.</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#140b2e] border-t border-purple-500/20 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-500/40 text-white text-xs font-bold transition-colors"
          >
            Close Telemetry Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
