import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Activity, 
  ArrowRight, 
  Layers, 
  Sliders, 
  Bug, 
  Crosshair, 
  Globe, 
  Network, 
  Code, 
  FileText, 
  Brain, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  PlusCircle,
  TrendingUp
} from 'lucide-react';
import { SpecialistAgent, CaseItem } from '../../types';
import { calculateAutoAssignment, CaseIntakeInput, AutoAssignResult } from '../../utils/autoAssignAgent';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  agents: SpecialistAgent[];
  existingCases: CaseItem[];
  onCreateCase: (newCase: CaseItem, assignedAgent: SpecialistAgent) => void;
}

type CasePreset = {
  title: string; category: string; severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string; tags: string[]; iocCount: number;
};
const PRESET_TEMPLATES: CasePreset[] = [];

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  agents,
  existingCases,
  onCreateCase
}) => {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'Critical' | 'High' | 'Medium' | 'Low'>('High');
  const [category, setCategory] = useState('Malware & Payload Execution');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Incident-Response', 'SOC-Triage']);
  const [iocCount, setIocCount] = useState<number>(12);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showWorkloadMatrix, setShowWorkloadMatrix] = useState(false);
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Dynamic Auto-Assignment calculation
  const caseInput: CaseIntakeInput = useMemo(() => ({
    title,
    category,
    description,
    severity,
    tags,
    iocCount
  }), [title, category, description, severity, tags, iocCount]);

  const autoAssignResult: AutoAssignResult = useMemo(() => {
    return calculateAutoAssignment(caseInput, agents, existingCases);
  }, [caseInput, agents, existingCases]);

  // Set the selected agent to the recommended agent automatically unless overridden
  useEffect(() => {
    if (!isManualOverride && autoAssignResult.suggestedAgent) {
      setSelectedAgentId(autoAssignResult.suggestedAgent.id);
    }
  }, [autoAssignResult, isManualOverride]);

  if (!isOpen) return null;

  const currentSelectedAgent = agents.find(a => a.id === selectedAgentId) || autoAssignResult.suggestedAgent;
  const currentMetric = autoAssignResult.rankedCandidates.find(c => c.agentId === currentSelectedAgent.id) || autoAssignResult.rankedCandidates[0];

  const handleApplyPreset = (preset: CasePreset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setSeverity(preset.severity as any);
    setDescription(preset.description);
    setTags(preset.tags);
    setIocCount(preset.iocCount);
    setIsManualOverride(false);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTriggerAutoAssign = () => {
    setIsAutoAssigning(true);
    setTimeout(() => {
      setIsManualOverride(false);
      setSelectedAgentId(autoAssignResult.suggestedAgent.id);
      setIsAutoAssigning(false);
    }, 250);
  };

  const handleCreateAndDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const caseId = `c-${Date.now()}`;
    const caseNum = `CASE-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newCase: CaseItem = {
      id: caseId,
      caseNumber: caseNum,
      title: title.trim(),
      status: 'In Progress',
      severity,
      timestamp: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      assignedAgent: currentSelectedAgent.name.toUpperCase(),
      iocCount: Number(iocCount) || 1,
      confidence: currentMetric?.compositeScore || 94,
    };

    onCreateCase(newCase, currentSelectedAgent);
    onClose();
  };

  const getAgentIcon = (iconName: string) => {
    switch (iconName) {
      case 'bug': return <Bug className="w-4 h-4 text-rose-400" />;
      case 'crosshair': return <Crosshair className="w-4 h-4 text-cyan-400" />;
      case 'globe': return <Globe className="w-4 h-4 text-blue-400" />;
      case 'network': return <Network className="w-4 h-4 text-teal-400" />;
      case 'code': return <Code className="w-4 h-4 text-amber-400" />;
      case 'file-text': return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'brain': return <Brain className="w-4 h-4 text-purple-400" />;
      case 'shield-check': return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      default: return <Cpu className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        id="new-case-intake-modal"
        className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-[#0c071d] border border-purple-500/40 rounded-xl shadow-[0_0_40px_rgba(168,85,247,0.25)] text-slate-200 font-mono overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-purple-500/30 bg-[#12092a]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <PlusCircle className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-cyber font-bold text-white tracking-wider">
                  CASE INTAKE &amp; AUTO-ASSIGNMENT
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 animate-pulse">
                  AI WORKLOAD BALANCER
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Create new security incident &amp; dynamically route to optimal specialist based on capacity &amp; skill fit
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-900/40 border border-transparent hover:border-purple-500/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-4">
          {/* Quick Preset Incident Templates */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Quick Incident Presets
              </span>
              <span className="text-[10px] text-purple-400">Click to auto-populate fields</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={`tmpl-${idx}`}
                  type="button"
                  onClick={() => handleApplyPreset(tmpl)}
                  className="p-2 rounded-lg bg-black/40 border border-purple-500/20 hover:border-purple-400 hover:bg-purple-950/40 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="text-[10.5px] font-bold text-slate-200 group-hover:text-purple-200 line-clamp-2">
                    {tmpl.title}
                  </div>
                  <div className="flex items-center justify-between mt-1 pt-1 border-t border-purple-500/10 text-[9px]">
                    <span className="text-slate-400">{tmpl.category.split('&')[0]}</span>
                    <span className={`font-bold ${tmpl.severity === 'Critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                      {tmpl.severity}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form id="new-case-form" onSubmit={handleCreateAndDispatch} className="space-y-4">
            {/* Top Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Incident Title (8 cols) */}
              <div className="md:col-span-8 space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>INCIDENT CASE TITLE *</span>
                  <span className="text-[10px] text-slate-500">Target anomaly or alert summary</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cobalt Strike Beaconing via Obfuscated PowerShell Loader..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/30 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
                />
              </div>

              {/* Severity Selector (4 cols) */}
              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-300 block">SEVERITY LEVEL</label>
                <div className="grid grid-cols-4 gap-1">
                  {(['Critical', 'High', 'Medium', 'Low'] as const).map((sev) => {
                    const isSelected = severity === sev;
                    return (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setSeverity(sev)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border ${
                          isSelected
                            ? sev === 'Critical' 
                              ? 'bg-rose-950 text-rose-200 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                              : sev === 'High'
                                ? 'bg-amber-950 text-amber-200 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                : sev === 'Medium'
                                  ? 'bg-cyan-950 text-cyan-200 border-cyan-500'
                                  : 'bg-slate-900 text-slate-200 border-slate-600'
                            : 'bg-black/40 text-slate-400 border-purple-500/20 hover:border-purple-500/40'
                        }`}
                      >
                        {sev[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Attack Category & IOCs count */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 space-y-1">
                <label className="text-xs font-bold text-slate-300 block">ATTACK CATEGORY / PRIMARY VECTOR</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-cyan-400 transition-all font-mono"
                >
                  <option value="Malware & Payload Execution">Malware &amp; Payload Execution (PE, DLL, Ransomware)</option>
                  <option value="Network Anomaly & Exfiltration">Network Anomaly &amp; Exfiltration (PCAP, DNS, TLS)</option>
                  <option value="Code Review & Exploit Vulnerability">Code Review &amp; Exploit Vulnerability (Scripts, AST, CVEs)</option>
                  <option value="Threat Intelligence & APT Attribution">Threat Intelligence &amp; APT Attribution (Feeds, Actors)</option>
                  <option value="Indicator Harvesting & Normalization">Indicator Harvesting &amp; Normalization (IOCs, STIX)</option>
                  <option value="Executive & Forensic Synthesis">Executive &amp; Forensic Synthesis (Reports, ATT&amp;CK)</option>
                  <option value="Historical Memory & Pattern Search">Historical Memory &amp; Pattern Search (Vector Recall)</option>
                  <option value="Multi-Model Consensus Verification">Multi-Model Consensus Verification (Quality Gate)</option>
                </select>
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-slate-300 block">ESTIMATED IOCs COUNT</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={iocCount}
                  onChange={(e) => setIocCount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/30 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>
            </div>

            {/* Description / Incident Brief */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>INCIDENT BRIEF / FORENSIC NOTES</span>
                <span className="text-[10px] text-slate-500">Keywords in text dynamically trigger qualification scoring</span>
              </label>
              <textarea
                rows={3}
                placeholder="Detail the technical observables, affected endpoints, network traces, or suspicious behaviors..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-purple-500/30 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono resize-none"
              />
            </div>

            {/* Tags Manager */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">TACTICAL TAGS</label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-lg bg-black/40 border border-purple-500/20">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-purple-950/80 border border-purple-500/40 text-purple-200 flex items-center gap-1"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex items-center gap-1 min-w-[140px] flex-1">
                  <input
                    type="text"
                    placeholder="+ add tag and press Enter"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="w-full bg-transparent text-xs text-white placeholder:text-slate-600 focus:outline-none px-1"
                  />
                </div>
              </div>
            </div>

            {/* --- AUTO-ASSIGN SPECIALIST DECISION ENGINE CARD --- */}
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#130a2a]/90 border-2 border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] space-y-3">
              {/* Engine Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-300">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-cyber font-bold text-white tracking-wider flex items-center gap-2">
                      AUTO-ASSIGN SPECIALIST RECOMMENDATION
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {autoAssignResult.confidence}% MATCH
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Calculated from real-time agent capacity, domain keywords, and active case queues
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isManualOverride && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                      MANUAL OVERRIDE
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleTriggerAutoAssign}
                    className="px-2.5 py-1 rounded bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-200 text-[10.5px] font-bold flex items-center gap-1 transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 text-cyan-400 ${isAutoAssigning ? 'animate-spin' : ''}`} />
                    <span>Recalculate</span>
                  </button>
                </div>
              </div>

              {/* Recommended Agent Spotlight Card */}
              <div className="p-3 rounded-lg bg-black/60 border border-purple-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                {/* Agent Identity */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/50 flex items-center justify-center text-purple-300 shrink-0 shadow-md">
                    {getAgentIcon(currentSelectedAgent.iconName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">
                        {currentSelectedAgent.name}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase border ${
                        currentMetric?.capacityLabel === 'Optimal'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                          : currentMetric?.capacityLabel === 'Available'
                            ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                      }`}>
                        ● {currentMetric?.capacityLabel} Bandwidth
                      </span>
                    </div>
                    <p className="text-xs text-purple-300 truncate">{currentSelectedAgent.role}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>Model: <b className="text-slate-300">{currentSelectedAgent.model}</b></span>
                      <span>•</span>
                      <span>Active Task: <b className="text-slate-300 truncate max-w-[120px] inline-block align-bottom">{currentSelectedAgent.currentTask}</b></span>
                    </div>
                  </div>
                </div>

                {/* Score Meters */}
                <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 md:border-l border-purple-500/20 pt-2 md:pt-0 md:pl-4 w-full md:w-auto justify-between md:justify-start">
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 uppercase block">Skill Fit</span>
                    <span className="text-xs font-bold text-purple-300">{currentMetric?.skillFitScore}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 uppercase block">Capacity</span>
                    <span className="text-xs font-bold text-cyan-300">{currentMetric?.bandwidthScore}%</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-slate-400 uppercase block">Active Queue</span>
                    <span className="text-xs font-bold text-amber-300">{currentMetric?.activeCasesCount} Cases</span>
                  </div>
                  <div className="text-center pl-2 border-l border-purple-500/20">
                    <span className="text-[9px] text-slate-400 uppercase block">Total Index</span>
                    <span className="text-sm font-cyber font-bold text-emerald-400 leading-none">
                      {currentMetric?.compositeScore}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale explanation */}
              <div className="p-2.5 rounded-lg bg-[#0e0722] border border-purple-500/20 text-xs text-slate-300 space-y-1">
                <span className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Assignment Rationale
                </span>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  {autoAssignResult.rationale}
                </p>
                {currentMetric?.matchReasons && currentMetric.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentMetric.matchReasons.map((reason, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded text-[9.5px] bg-purple-950/60 border border-purple-500/30 text-purple-200">
                        ✓ {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle Matrix of all 8 agents */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowWorkloadMatrix(!showWorkloadMatrix)}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-bold transition-colors"
                >
                  {showWorkloadMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span>{showWorkloadMatrix ? 'Hide Full Specialist Workload Matrix' : 'View Full Agent Workload & Qualification Ranking (8 Agents)'}</span>
                </button>

                {showWorkloadMatrix && (
                  <div className="mt-2 space-y-1.5 p-2 rounded-lg bg-black/60 border border-purple-500/20 max-h-52 overflow-y-auto">
                    {autoAssignResult.rankedCandidates.map((candidate, rankIdx) => {
                      const isAssigned = candidate.agentId === currentSelectedAgent.id;
                      const rawAgent = agents.find(a => a.id === candidate.agentId);

                      return (
                        <div
                          key={`rank-${candidate.agentId}`}
                          onClick={() => {
                            setSelectedAgentId(candidate.agentId);
                            setIsManualOverride(true);
                          }}
                          className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                            isAssigned 
                              ? 'bg-purple-950/90 border-cyan-400 shadow-sm ring-1 ring-cyan-500/30' 
                              : 'bg-black/40 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-950/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] ${
                              rankIdx === 0 ? 'bg-cyan-500 text-black' : 'bg-purple-950 text-purple-300 border border-purple-500/30'
                            }`}>
                              #{rankIdx + 1}
                            </span>
                            <div className="w-6 h-6 rounded bg-black/60 border border-purple-500/30 flex items-center justify-center text-purple-300 shrink-0">
                              {getAgentIcon(candidate.iconName)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-white text-xs truncate block">{candidate.agentName}</span>
                              <span className="text-[10px] text-slate-400 truncate block">{candidate.role}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-[10.5px]">
                            <div className="hidden sm:block text-right">
                              <span className="text-[9px] text-slate-500 block">BANDWIDTH</span>
                              <span className="text-cyan-300 font-bold">{candidate.bandwidthScore}%</span>
                            </div>
                            <div className="hidden sm:block text-right">
                              <span className="text-[9px] text-slate-500 block">SKILL FIT</span>
                              <span className="text-purple-300 font-bold">{candidate.skillFitScore}%</span>
                            </div>
                            <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                              {candidate.compositeScore}%
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedAgentId(candidate.agentId);
                                setIsManualOverride(true);
                              }}
                              className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                                isAssigned 
                                  ? 'bg-cyan-500 text-black border-cyan-400' 
                                  : 'bg-purple-900/50 hover:bg-purple-800 text-purple-200 border-purple-500/30'
                              }`}
                            >
                              {isAssigned ? 'Assigned' : 'Select'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Form Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-purple-500/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-black/60 hover:bg-slate-900 border border-purple-500/30 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className={`px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 transition-all shadow-lg ${
                    title.trim()
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white hover:opacity-95 shadow-[0_0_20px_rgba(6,182,212,0.3)] cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <span>Dispatch Case to {currentSelectedAgent.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
