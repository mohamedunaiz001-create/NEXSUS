import React, { useState, useMemo } from 'react';
import { CaseItem, SpecialistAgent } from '../../types';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  FileText, 
  User, 
  Sparkles, 
  Cpu, 
  Activity, 
  RefreshCw,
  Zap,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { calculateAutoAssignment } from '../../utils/autoAssignAgent';

interface CaseDetailModalProps {
  caseData: CaseItem | null;
  onClose: () => void;
  agents?: SpecialistAgent[];
  existingCases?: CaseItem[];
  onReassignAgent?: (caseId: string, agentName: string) => void;
  onUpdateStatus?: (caseId: string, status: string) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({ 
  caseData, 
  onClose,
  agents = [],
  existingCases = [],
  onReassignAgent,
  onUpdateStatus
}) => {
  if (!caseData) return null;

  const [isReassigning, setIsReassigning] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState(caseData.assignedAgent);

  // Calculate qualification recommendation
  const autoAssignResult = useMemo(() => {
    if (agents.length === 0) return null;
    return calculateAutoAssignment(
      {
        title: caseData.title,
        severity: caseData.severity,
        iocCount: caseData.iocCount,
        category: caseData.title
      },
      agents,
      existingCases
    );
  }, [caseData, agents, existingCases]);

  const handleApplyAutoAssign = () => {
    if (autoAssignResult && onReassignAgent) {
      onReassignAgent(caseData.id || caseData.caseNumber, autoAssignResult.suggestedAgent.name.toUpperCase());
      setSelectedAgentName(autoAssignResult.suggestedAgent.name.toUpperCase());
      setIsReassigning(false);
    }
  };

  const handleManualReassign = (agentName: string) => {
    if (onReassignAgent) {
      onReassignAgent(caseData.id || caseData.caseNumber, agentName.toUpperCase());
      setSelectedAgentName(agentName.toUpperCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 font-mono">
      <div 
        id="case-detail-modal"
        className="w-full max-w-2xl bg-[#0e0a22] border border-purple-500/40 rounded-xl p-5 shadow-2xl space-y-4 text-slate-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400 font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-cyber font-bold text-white tracking-wider">
                  {caseData.caseNumber}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                  ● {caseData.status}
                </span>
              </div>
              <p className="text-xs text-purple-300 font-mono">{caseData.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-purple-950/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
          <div className="p-2 rounded bg-[#160e2e] border border-purple-500/20">
            <span className="text-slate-400 text-[10px] block">SEVERITY</span>
            <span className="text-rose-400 font-bold">{caseData.severity}</span>
          </div>
          <div className="p-2 rounded bg-[#160e2e] border border-purple-500/20">
            <span className="text-slate-400 text-[10px] block">DETECTED IOCS</span>
            <span className="text-purple-300 font-bold">{caseData.iocCount}</span>
          </div>
          <div className="p-2 rounded bg-[#160e2e] border border-purple-500/20">
            <span className="text-slate-400 text-[10px] block">CONFIDENCE</span>
            <span className="text-emerald-400 font-bold">{caseData.confidence}%</span>
          </div>
          <div className="p-2 rounded bg-[#160e2e] border border-purple-500/20">
            <span className="text-slate-400 text-[10px] block">OPENED DATE</span>
            <span className="text-slate-300 font-bold">{caseData.timestamp}</span>
          </div>
        </div>

        {/* Specialist Assignment & Auto-Assign Section */}
        <div className="p-3 rounded-lg bg-[#140c2a] border border-purple-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">ASSIGNED SPECIALIST</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold text-xs">
              {selectedAgentName}
            </span>
          </div>

          {/* Auto-Assign Suggestion Pill */}
          {autoAssignResult && (
            <div className="p-2.5 rounded bg-black/50 border border-cyan-500/30 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Workload Recommendation: {autoAssignResult.suggestedAgent.name} ({autoAssignResult.confidence}%)</span>
                </div>
                {onReassignAgent && selectedAgentName !== autoAssignResult.suggestedAgent.name.toUpperCase() && (
                  <button
                    type="button"
                    onClick={handleApplyAutoAssign}
                    className="px-2 py-0.5 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-[10px] flex items-center gap-1 transition-all"
                  >
                    <span>Auto-Assign</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed">
                {autoAssignResult.rationale}
              </p>
            </div>
          )}
        </div>

        {/* Case Narrative */}
        <div className="space-y-1.5 p-3 rounded-lg bg-[#140c2a] border border-purple-500/20 font-mono text-xs text-slate-300 leading-relaxed">
          <span className="text-[10px] text-purple-400 uppercase font-bold block">Investigation Brief</span>
          <p>
            No incident narrative has been supplied for this case yet. Add evidence and investigation findings to populate the case record.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
          <div className="flex items-center gap-2">
            {onUpdateStatus && (
              <select
                value={caseData.status}
                onChange={(e) => onUpdateStatus(caseData.id || caseData.caseNumber, e.target.value)}
                className="px-2.5 py-1 rounded bg-black/60 border border-purple-500/30 text-xs text-purple-300 font-mono focus:outline-none"
              >
                <option value="In Progress">In Progress</option>
                <option value="Investigating">Investigating</option>
                <option value="Completed">Completed</option>
                <option value="Resolved">Resolved</option>
              </select>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
