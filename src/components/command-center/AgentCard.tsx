import React, { useState } from 'react';
import { SpecialistAgent, AgentSystemLog } from '../../types';
import { 
  Bug, 
  Crosshair, 
  Globe, 
  Network, 
  Code, 
  FileText, 
  Brain, 
  ShieldCheck,
  Terminal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AgentCardProps {
  agent: SpecialistAgent;
  onSelect: (agent: SpecialistAgent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, onSelect }) => {
  const [isLogsExpanded, setIsLogsExpanded] = useState(false);

  const getIcon = (name: string) => {
    switch (name) {
      case 'bug': return Bug;
      case 'crosshair': return Crosshair;
      case 'globe': return Globe;
      case 'network': return Network;
      case 'code': return Code;
      case 'file-text': return FileText;
      case 'brain': return Brain;
      case 'shield-check': return ShieldCheck;
      default: return Bug;
    }
  };

  const Icon = getIcon(agent.iconName);

  const logs: AgentSystemLog[] = agent.systemLogs && agent.systemLogs.length > 0
    ? agent.systemLogs.slice(-3)
    : [
        {
          id: `${agent.id}-log-1`,
          timestamp: agent.lastLog?.timestamp || agent.lastActive,
          level: 'EXEC',
          message: agent.lastLog?.action || agent.currentTask
        },
        {
          id: `${agent.id}-log-2`,
          timestamp: '10:24:00',
          level: 'INFO',
          message: `Task execution active for ${agent.name}`
        },
        {
          id: `${agent.id}-log-3`,
          timestamp: '10:23:45',
          level: 'DEBUG',
          message: 'Telemetry synchronized'
        }
      ];

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'EXEC':
        return 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/40';
      case 'WARN':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'DEBUG':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'INFO':
      default:
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
    }
  };

  return (
    <div
      id={`agent-card-${agent.id}`}
      onClick={() => onSelect(agent)}
      className="group relative cursor-pointer cyber-panel cyber-panel-hover rounded-xl p-2.5 sm:p-3 lg:p-3 xl:p-3.5 2xl:p-4 flex flex-col justify-between transition-all duration-300 border border-purple-500/20 hover:border-purple-400/60 bg-[#0d091e]/90 hover:-translate-y-1 select-none min-w-[110px]"
    >
      {/* Top Status & Role */}
      <div className="flex items-center justify-between gap-1 mb-1.5 sm:mb-2 xl:mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <span className="text-[9px] sm:text-[9.5px] xl:text-[10px] font-mono text-emerald-400 font-semibold uppercase tracking-wider">
            {agent.status}
          </span>
        </div>
        <span className="text-[8.5px] sm:text-[9px] xl:text-[9.5px] text-purple-400/80 uppercase font-mono">
          {agent.category}
        </span>
      </div>

      {/* Center Icon & Title */}
      <div className="flex flex-col items-center text-center my-1 sm:my-2 xl:my-2.5 w-full">
        <div className="w-8 h-8 sm:w-9 sm:h-9 xl:w-10 xl:h-10 2xl:w-11 2xl:h-11 rounded-xl bg-gradient-to-b from-[#241544] to-[#140b28] border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover:text-white group-hover:border-purple-400/60 group-hover:shadow-[0_0_12px_rgba(168,85,247,0.4)] transition-all mb-1 sm:mb-1.5 xl:mb-2 shrink-0">
          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 xl:w-5 xl:h-5" />
        </div>
        <div 
          className={`w-full font-cyber font-bold text-slate-100 tracking-wider group-hover:text-purple-200 transition-colors uppercase leading-snug min-h-[2.8em] sm:min-h-[3em] flex flex-wrap items-center justify-center text-center px-1 whitespace-normal break-words hyphens-auto overflow-visible [text-overflow:unset] ${
            agent.name.length > 18
              ? 'text-[8.5px] sm:text-[9px] xl:text-[10px]'
              : agent.name.length > 13
              ? 'text-[9.5px] sm:text-[10px] xl:text-[11px]'
              : 'text-[10px] sm:text-[11px] xl:text-[12px]'
          }`}
          title={agent.name}
        >
          <span className="w-full break-words hyphens-auto leading-tight">{agent.name}</span>
        </div>
        <div className="text-[8.5px] sm:text-[9px] xl:text-[9.5px] text-purple-400 font-mono mt-0.5 sm:mt-1">
          {agent.model}
        </div>
      </div>

      {/* Task & Progress Bar */}
      <div className="mt-1 sm:mt-1.5 xl:mt-2 space-y-1 sm:space-y-1.5 xl:space-y-2">
        <div className="text-[8px] sm:text-[8.5px] xl:text-[9.5px] text-slate-400 truncate font-mono text-center">
          {agent.currentTask}
        </div>
        <div className="w-full bg-[#1b1233] h-1.5 xl:h-2 rounded-full overflow-hidden border border-purple-500/20 p-0.2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-indigo-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"
            style={{ width: `${agent.progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[8px] sm:text-[8.5px] xl:text-[9.5px] text-purple-300/80 font-mono">
          <span>Progress</span>
          <span className="font-semibold text-purple-200">{agent.progress}%</span>
        </div>
      </div>

      {/* Collapsible System Logs (Last 3 entries) */}
      <div 
        className="mt-1.5 sm:mt-2 xl:mt-2.5 pt-1.5 sm:pt-2 border-t border-purple-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setIsLogsExpanded(!isLogsExpanded)}
          className="w-full flex items-center justify-between px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg bg-[#060212] hover:bg-[#120726] border border-purple-500/20 text-[8px] sm:text-[8.5px] xl:text-[9px] font-mono text-purple-300 hover:text-white transition-all"
        >
          <span className="flex items-center gap-1 font-bold">
            <Terminal className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
            <span>SYS LOGS</span>
            <span className="text-[7.5px] sm:text-[8px] px-1 py-0.2 rounded bg-purple-950 text-purple-200 border border-purple-500/30">
              {logs.length}
            </span>
          </span>
          {isLogsExpanded ? (
            <ChevronUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
          ) : (
            <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-400" />
          )}
        </button>

        {isLogsExpanded && (
          <div className="mt-1 sm:mt-1.5 space-y-1 p-1 sm:p-1.5 rounded-lg bg-[#05020c]/95 border border-purple-500/30 text-[8px] sm:text-[8.5px] font-mono animate-in fade-in duration-200">
            {logs.map((log, idx) => (
              <div key={log.id || idx} className="space-y-0.5 border-b border-purple-500/10 pb-0.5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-[7px] sm:text-[7.5px] text-slate-400">
                  <span>{log.timestamp}</span>
                  <span className={`px-1 rounded text-[6.5px] sm:text-[7px] border ${getLevelBadgeClass(log.level)}`}>
                    {log.level}
                  </span>
                </div>
                <div className="text-[7.5px] sm:text-[8px] text-slate-200 leading-tight truncate" title={log.message}>
                  {log.message}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
