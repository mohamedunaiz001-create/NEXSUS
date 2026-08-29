import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  ShieldAlert, 
  Cpu, 
  Network, 
  Layers, 
  Hash, 
  ExternalLink,
  Copy,
  Check,
  Code,
  FileCode,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Download,
  FileSpreadsheet,
  FileJson,
  FileText,
  Printer,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MissionData, SpecialistAgent, ActivityEvent } from '../../types';
import { MissionCompleteBurst } from '../common/MissionCompleteBurst';
import { exportMissionToPDF, exportMissionToWord } from '../../utils/reportExporter';
import { GothicCornerFiligree } from '../common/GothicCornerFiligree';
import crystalNexusPortal from '../../assets/images/crystal_nexus_portal_1786988333150.jpg';

interface CurrentMissionProps {
  mission: MissionData;
  onOpenCase: (caseId: string) => void;
  onUpdateCaseStatus?: (caseId: string, status: string) => void;
  onOpenEvidenceModal?: () => void;
  agents?: SpecialistAgent[];
  activities?: ActivityEvent[];
}

export const CurrentMission: React.FC<CurrentMissionProps> = ({ 
  mission, 
  onOpenCase,
  onUpdateCaseStatus,
  onOpenEvidenceModal,
  agents = [],
  activities = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'meta' | 'mitre' | 'telemetry' | 'network'>('meta');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [bottomMenuOpen, setBottomMenuOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<{ format: 'json' | 'csv' | 'pdf' | 'word'; filename: string; logCount: number } | null>(null);
  const headerExportMenuRef = useRef<HTMLDivElement | null>(null);
  const bottomExportMenuRef = useRef<HTMLDivElement | null>(null);

  // Mission & Case Resolution State
  const [status, setStatus] = useState<string>(mission.status || mission.caseStatus || 'Orchestrating');
  const [showBurst, setShowBurst] = useState(false);

  const isResolved = status === 'Resolved' || status === 'Completed';

  // Close export menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (headerExportMenuRef.current && !headerExportMenuRef.current.contains(target)) {
        setHeaderMenuOpen(false);
      }
      if (bottomExportMenuRef.current && !bottomExportMenuRef.current.contains(target)) {
        setBottomMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (newStatus: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStatus(newStatus);
    if (onUpdateCaseStatus) {
      onUpdateCaseStatus(mission.caseId, newStatus);
    }
    if (newStatus === 'Resolved') {
      setShowBurst(true);
    }
  };

  const handleToggleResolve = (e?: React.MouseEvent) => {
    handleStatusChange(isResolved ? 'Investigating' : 'Resolved', e);
  };

  const handleCopy = (text: string, key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const effectiveProgress = isResolved ? 100 : mission.progress;

  // 1. Generate JSON Report
  const handleDownloadJSON = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeaderMenuOpen(false);
    setBottomMenuOpen(false);

    // Collect all active logs from agents
    const allAgentLogs = agents.flatMap(a => (a.systemLogs || []).map(l => ({
      agentId: a.id,
      agentName: a.name,
      role: a.role,
      level: l.level,
      message: l.message,
      timestamp: l.timestamp
    })));

    const logCount = allAgentLogs.length + (activities.length || 0);
    const safeCaseId = (mission.caseId || 'MISSION-REPORT').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `CYBER_MISSION_${safeCaseId}_REPORT_${Date.now()}.json`;

    const fullReport = {
      reportType: "CYBER_SECURITY_MISSION_REPORT",
      version: "2.5.0-ENTERPRISE",
      generatedAt: new Date().toISOString(),
      systemEnvironment: "CYBER-X ORCHESTRATION PLATFORM (CGROUP V2 MICROVM)",
      classification: "CONFIDENTIAL // TLP:AMBER+STRICT",
      missionSummary: {
        id: mission.id,
        caseId: mission.caseId,
        title: mission.title,
        priority: mission.priority,
        status: isResolved ? 'Resolved' : status,
        progressPercent: effectiveProgress,
        startedAt: mission.startedAt,
        estimatedCompletion: isResolved ? 'Completed' : mission.estimatedCompletion,
        delegatedBy: mission.delegatedBy,
        incidentObjective: mission.description,
        totalStages: mission.stages?.length || 4,
        completedStages: (mission.stages || []).filter(s => isResolved || s.status === 'Completed').length
      },
      pipelineStages: (mission.stages || []).map((stage, idx) => ({
        step: idx + 1,
        name: stage.name,
        status: isResolved ? 'Completed' : stage.status,
        executionState: isResolved ? 'FINISHED' : (stage.status === 'In Progress' ? 'ACTIVE' : 'QUEUED')
      })),
      forensicTargetMetadata: {
        targetArtifact: "malware.exe",
        fileSize: "1.42 MB (1,489,920 bytes)",
        sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        entropy: "7.94 (High Entropy / Packed)",
        subsystemFormat: "PE32+ Executable (GUI) x86-64",
        ingressEndpoint: "WS-PROD-FIN-09.corp.internal",
        ingressIP: "10.142.88.45",
        yaraDetection: "RULE_APT28_GOST_LOADER",
        yaraConfidence: "99.4%"
      },
      mitreAttackFrameworkMapping: [
        { tactic: "Execution", techniqueId: "T1059.001", name: "PowerShell Scripting", detail: "Obfuscated Base64 download cradles" },
        { tactic: "Defense Evasion", techniqueId: "T1027", name: "Obfuscated / Packed Payload", detail: "Custom XOR key routines and AMSI memory patch injection" },
        { tactic: "Command & Control", techniqueId: "T1071.001", name: "Web Protocols (HTTPS)", detail: "Periodic jittered beacons to cloud fronted endpoints" },
        { tactic: "Initial Access", techniqueId: "T1566.001", name: "Spearphishing Attachment", detail: "ISO image with LNK payload via invoice lure" }
      ],
      specialistAgentsTelemetry: agents.map(a => ({
        agentId: a.id,
        name: a.name,
        role: a.role,
        currentTask: a.currentTask,
        progress: `${a.progress}%`,
        status: a.status,
        lastLog: a.lastLog,
        activeSystemLogs: a.systemLogs || []
      })),
      activeLogsAndTelemetryStream: {
        totalLogRecords: logCount,
        agentLogs: allAgentLogs,
        recentActivityAuditTrail: activities
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess({ format: 'json', filename, logCount });
    setTimeout(() => setDownloadSuccess(null), 4500);
  };

  // 2. Generate CSV Report
  const handleDownloadCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeaderMenuOpen(false);
    setBottomMenuOpen(false);

    const safeCaseId = (mission.caseId || 'MISSION-REPORT').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `CYBER_MISSION_${safeCaseId}_REPORT_${Date.now()}.csv`;

    const rows: string[][] = [
      ["REPORT_SECTION", "CATEGORY_OR_ACTOR", "IDENTIFIER_OR_STEP", "STATUS_OR_LEVEL", "DESCRIPTION_OR_DETAILS", "TIMESTAMP"],
      ["MISSION_HEADER", "Case Information", "Case ID", mission.caseId, `Priority: ${mission.priority}`, mission.startedAt],
      ["MISSION_HEADER", "Case Information", "Title", `"${mission.title.replace(/"/g, '""')}"`, `Delegated By: ${mission.delegatedBy}`, mission.startedAt],
      ["MISSION_HEADER", "Case Information", "Progress", `${effectiveProgress}%`, `Current Status: ${isResolved ? 'Resolved' : status}`, new Date().toISOString()],
      ["MISSION_HEADER", "Case Information", "Objective", `"${mission.description.replace(/"/g, '""')}"`, `Est. Completion: ${isResolved ? 'Completed' : mission.estimatedCompletion}`, mission.startedAt],
      ["FORENSIC_ARTIFACT", "Malware Analysis", "Target File", "malware.exe", "Size: 1.42 MB, Format: PE32+ GUI", mission.startedAt],
      ["FORENSIC_ARTIFACT", "Cryptographic Hash", "SHA-256", "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "Entropy: 7.94 (Packed)", mission.startedAt],
      ["FORENSIC_ARTIFACT", "Network Ingress", "Host & IP", "WS-PROD-FIN-09 (10.142.88.45)", "Telemetry: EDR Agent #084-SEC", mission.startedAt],
      ["FORENSIC_ARTIFACT", "Signature Match", "YARA Rule", "RULE_APT28_GOST_LOADER", "Confidence Score: 99.4%", mission.startedAt],
    ];

    // Pipeline Stages
    (mission.stages || []).forEach((stage, idx) => {
      rows.push([
        "PIPELINE_STAGE",
        "Remediation Workflow",
        `Step ${idx + 1}: ${stage.name}`,
        isResolved ? 'Completed' : stage.status,
        `Stage ${idx + 1} of ${mission.stages?.length || 4}`,
        new Date().toISOString()
      ]);
    });

    // MITRE ATT&CK
    const mitreItems = [
      ["Execution", "T1059.001", "PowerShell Scripting", "Obfuscated Base64 download cradles"],
      ["Defense Evasion", "T1027", "Obfuscated / Packed Payload", "Custom XOR key routines & AMSI memory patch"],
      ["Command & Control", "T1071.001", "Web Protocols (HTTPS)", "Periodic jittered beacons to cloud fronted endpoints"],
      ["Initial Access", "T1566.001", "Spearphishing Attachment", "ISO image with LNK payload via invoice lure"]
    ];
    mitreItems.forEach(([tactic, id, name, detail]) => {
      rows.push(["MITRE_ATTACK", tactic, `${id} - ${name}`, "Mapped Technique", `"${detail.replace(/"/g, '""')}"`, new Date().toISOString()]);
    });

    // Agent Telemetry & Logs
    let totalLogs = 0;
    if (agents.length > 0) {
      agents.forEach(agent => {
        rows.push([
          "AGENT_TELEMETRY",
          agent.name,
          agent.role,
          agent.status,
          `Progress: ${agent.progress}%, Task: "${agent.currentTask.replace(/"/g, '""')}"`,
          new Date().toISOString()
        ]);

        (agent.systemLogs || []).forEach(log => {
          totalLogs++;
          rows.push([
            "ACTIVE_LOG",
            agent.name,
            agent.role,
            log.level,
            `"${log.message.replace(/"/g, '""')}"`,
            log.timestamp
          ]);
        });
      });
    }

    // Live Activity Stream
    if (activities.length > 0) {
      activities.forEach(act => {
        totalLogs++;
        rows.push([
          "ACTIVITY_STREAM",
          act.agent || "SYSTEM",
          "Audit Event",
          "LOG",
          `"${act.action.replace(/"/g, '""')}"`,
          act.timestamp
        ]);
      });
    }

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setDownloadSuccess({ format: 'csv', filename, logCount: totalLogs });
    setTimeout(() => setDownloadSuccess(null), 4500);
  };

  // 3. Generate PDF Report via Formatted Print Engine
  const handleDownloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeaderMenuOpen(false);
    setBottomMenuOpen(false);
    exportMissionToPDF({
      mission,
      status: isResolved ? 'Resolved' : status,
      effectiveProgress,
      isResolved,
      agents,
      activities
    });
    setDownloadSuccess({ format: 'pdf', filename: `MISSION_BRIEF_${mission.caseId}.pdf`, logCount: agents.length * 4 });
    setTimeout(() => setDownloadSuccess(null), 4500);
  };

  // 4. Generate Microsoft Word (.doc) Report
  const handleDownloadWord = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeaderMenuOpen(false);
    setBottomMenuOpen(false);
    exportMissionToWord({
      mission,
      status: isResolved ? 'Resolved' : status,
      effectiveProgress,
      isResolved,
      agents,
      activities
    });
    setDownloadSuccess({ format: 'word', filename: `MISSION_DOSSIER_${mission.caseId}.doc`, logCount: agents.length * 4 });
    setTimeout(() => setDownloadSuccess(null), 4500);
  };

  return (
    <div 
      id="current-mission-panel"
      className={`w-full rounded-2xl bg-[#090317]/95 border transition-all duration-300 ${
        isResolved 
          ? 'border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.2)]' 
          : 'border-purple-500/35 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:border-purple-400/60'
      } text-slate-200 overflow-hidden select-none relative`}
    >
      {/* Ornate Cyber-Gothic Corner Filigrees */}
      <GothicCornerFiligree size="md" opacity="text-purple-400/70" />

      {/* Download Success Confirmation Toast Bar */}
      <AnimatePresence>
        {downloadSuccess && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-gradient-to-r from-emerald-950 via-cyan-950 to-purple-950 border-b border-emerald-500/50 px-3.5 py-2 flex items-center justify-between gap-2 text-xs font-mono z-20"
          >
            <div className="flex items-center gap-2 text-emerald-300 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
              <span className="font-bold text-white uppercase text-[11px] shrink-0">
                {downloadSuccess.format.toUpperCase()} Report Generated:
              </span>
              <span className="text-emerald-200 text-[11px] truncate font-mono">
                {downloadSuccess.filename}
              </span>
              <span className="text-[10px] bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 px-1.5 py-0.5 rounded shrink-0 hidden sm:inline">
                {downloadSuccess.logCount} records captured
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDownloadSuccess(null)}
              className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-white/10 shrink-0"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panoramic Mission Main Banner matching Screenshot 2 */}
      <div 
        onClick={() => setIsExpanded(prev => !prev)}
        className="p-4 sm:p-5 lg:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5 lg:gap-6 items-center cursor-pointer hover:bg-purple-950/20 transition-colors border-b border-purple-500/20 relative"
      >
        {/* Col 1: Mission Title & Priority Details (xl:col-span-4) */}
        <div className="xl:col-span-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-purple-400 uppercase font-bold">
              CURRENT MISSION
            </span>
            <span className={`w-2 h-2 rounded-full ${isResolved ? 'bg-emerald-400' : 'bg-fuchsia-400 animate-pulse'}`} />
          </div>

          <h2 className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
            {mission.title}
          </h2>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-slate-300">
              Case ID: <strong className="text-purple-300">{mission.caseId}</strong>
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1 text-slate-300">
              Priority: <span className="text-red-400 font-bold flex items-center gap-0.5">❖ {mission.priority}</span>
            </span>
          </div>

          <p className="text-xs text-slate-400/90 leading-relaxed line-clamp-2 max-w-md">
            {mission.description}
          </p>
        </div>

        {/* Col 2: Progress & Timestamps (xl:col-span-3) */}
        <div className="xl:col-span-3 space-y-3 font-mono text-xs border-t md:border-t-0 md:border-l border-purple-500/20 md:pl-5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Progress</span>
              <span className="text-purple-300 font-bold">{effectiveProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#120629] border border-purple-500/40 overflow-hidden p-0.5">
              <div 
                className={`h-full rounded-full transition-all duration-700 shadow-[0_0_10px_#a855f7] ${
                  isResolved 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-400'
                }`}
                style={{ width: `${effectiveProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Started At</span>
              <span className="text-slate-200">May 20, 2024 • 10:21:31</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Estimated Completion</span>
              <span className="text-slate-200">May 20, 2024 • 10:45:00</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delegated By</span>
              <span className="text-purple-300 font-semibold">{mission.delegatedBy}</span>
            </div>
          </div>
        </div>

        {/* Col 3: MISSION OUTPUT (LIVE) Checklist (xl:col-span-3) */}
        <div className="xl:col-span-3 space-y-1.5 font-mono text-xs border-t md:border-t-0 xl:border-l border-purple-500/20 xl:pl-5">
          <div className="text-[11px] text-purple-400 font-bold uppercase tracking-wider mb-2">
            MISSION OUTPUT (LIVE)
          </div>
          <div className="space-y-1 text-[11.5px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Malware Analysis</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10.5px]">
                ● Completed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">IOC Extraction</span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[10.5px]">
                ● Completed
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Threat Intelligence</span>
              <span className="text-purple-300 flex items-center gap-1 font-semibold text-[10.5px]">
                ● In Progress
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Network Analysis</span>
              <span className="text-purple-300 flex items-center gap-1 font-semibold text-[10.5px]">
                ● In Progress
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Code Review</span>
              <span className="text-slate-500 text-[10.5px]">Pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Report Generation</span>
              <span className="text-slate-500 text-[10.5px]">Pending</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Verification</span>
              <span className="text-slate-500 text-[10.5px]">Pending</span>
            </div>
          </div>
        </div>

        {/* Col 4: Crystal Hologram Portal Visual (xl:col-span-2) */}
        <div className="xl:col-span-2 flex items-center justify-center relative min-h-[140px]">
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.4)] bg-[#070114]">
            <img 
              src={crystalNexusPortal} 
              alt="Mission Crystal Portal Nexus" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#090317]/80 pointer-events-none" />
          </div>

          {/* Quick Action Overlay Buttons */}
          <div className="absolute bottom-1 right-1 flex items-center gap-1 z-20" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleToggleResolve}
              className={`p-1.5 rounded-lg border text-xs font-mono transition-all ${
                isResolved 
                  ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300' 
                  : 'bg-purple-950/90 border-purple-500/50 text-purple-300 hover:text-white'
              }`}
              title={isResolved ? "Reopen Mission" : "Resolve Mission"}
            >
              {isResolved ? <RotateCcw className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
            <div className="relative" ref={headerExportMenuRef}>
              <button
                type="button"
                onClick={() => setHeaderMenuOpen(prev => !prev)}
                className="p-1.5 rounded-lg bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 hover:text-white transition-all text-xs"
                title="Download Mission Dossier"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details Drawer */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="p-3.5 sm:p-4 space-y-4 font-mono text-xs">
              {/* Mission Description Box */}
              <div className="p-3 rounded-xl bg-[#090317] border border-purple-500/25 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-purple-300 font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-purple-400" />
                    <span>Mission Objective & Incident Scope</span>
                  </span>
                  <span className="text-slate-400 text-[10px]">Case Start: {mission.startedAt}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {mission.description}
                </p>
              </div>

              {/* Investigation Pipeline Stages */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-purple-300 font-bold uppercase tracking-wider flex items-center justify-between">
                  <span>Remediation & Analysis Pipeline Stages</span>
                  <span className="text-slate-400 text-[10px]">
                    {mission.stages?.filter(s => s.status === 'Completed' || isResolved).length || 0} of {mission.stages?.length || 0} Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {(mission.stages || []).map((stage, idx) => {
                    const isStageDone = isResolved || stage.status === 'Completed';
                    const isStageCurrent = !isResolved && stage.status === 'In Progress';

                    return (
                      <div 
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                          isStageDone 
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300' 
                            : isStageCurrent
                            ? 'bg-purple-950/40 border-purple-500/60 text-purple-200 ring-1 ring-purple-500/40'
                            : 'bg-[#090317] border-purple-500/20 text-slate-400'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                          isStageDone
                            ? 'bg-emerald-500 text-black'
                            : isStageCurrent
                            ? 'bg-purple-500 text-white animate-pulse'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isStageDone ? '✓' : idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-bold truncate">{stage.name}</div>
                          <div className="text-[9.5px] opacity-75">{isStageDone ? 'Completed' : stage.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Tab Forensic Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-1 border-b border-purple-500/20 pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('meta')}
                    className={`px-3 py-1 rounded-t-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'meta'
                        ? 'bg-purple-900/60 border-b-2 border-purple-400 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Forensic Target</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('mitre')}
                    className={`px-3 py-1 rounded-t-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'mitre'
                        ? 'bg-purple-900/60 border-b-2 border-purple-400 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Hash className="w-3.5 h-3.5" />
                    <span>MITRE ATT&CK</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('telemetry')}
                    className={`px-3 py-1 rounded-t-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      activeTab === 'telemetry'
                        ? 'bg-purple-900/60 border-b-2 border-purple-400 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Assigned Agents ({agents.length})</span>
                  </button>
                </div>

                {/* Tab 1: Forensic Target Meta */}
                {activeTab === 'meta' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 bg-[#090317] p-3 rounded-xl border border-purple-500/20">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Target Artifact</span>
                      <span className="text-white font-bold text-xs">malware.exe</span>
                      <span className="text-[10px] text-purple-300 block">PE32+ (1.42 MB)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">SHA-256 Hash</span>
                      <span className="text-purple-300 text-[11px] truncate block font-mono">e3b0c44298fc1c14...</span>
                      <button 
                        type="button"
                        onClick={(e) => handleCopy('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'sha256', e)}
                        className="text-[10px] text-cyan-400 hover:underline mt-0.5 flex items-center gap-1"
                      >
                        {copiedKey === 'sha256' ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedKey === 'sha256' ? 'Copied' : 'Copy Full Hash'}</span>
                      </button>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Ingress Source</span>
                      <span className="text-slate-200 text-xs block">WS-PROD-FIN-09</span>
                      <span className="text-[10px] text-slate-400">10.142.88.45</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">YARA Signature</span>
                      <span className="text-amber-400 font-bold text-[11px] block">RULE_APT28_GOST</span>
                      <span className="text-[10px] text-emerald-400">99.4% Match Score</span>
                    </div>
                  </div>
                )}

                {/* Tab 2: MITRE ATT&CK Mapping */}
                {activeTab === 'mitre' && (
                  <div className="space-y-1.5 bg-[#090317] p-3 rounded-xl border border-purple-500/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-[#0e0722] border border-purple-500/20 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 text-[9px] font-bold">EXECUTION</span>
                        <div>
                          <div className="font-bold text-white text-[11px]">T1059.001 - PowerShell Scripting</div>
                          <div className="text-[10px] text-slate-400">Obfuscated Base64 download cradles</div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0e0722] border border-purple-500/20 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[9px] font-bold">DEFENSE EVASION</span>
                        <div>
                          <div className="font-bold text-white text-[11px]">T1027 - Obfuscated Payload</div>
                          <div className="text-[10px] text-slate-400">Custom XOR routines & AMSI patching</div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0e0722] border border-purple-500/20 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[9px] font-bold">C2 PROTOCOL</span>
                        <div>
                          <div className="font-bold text-white text-[11px]">T1071.001 - Web Protocols</div>
                          <div className="text-[10px] text-slate-400">Jittered beacons to cloud endpoints</div>
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-[#0e0722] border border-purple-500/20 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 text-[9px] font-bold">INITIAL ACCESS</span>
                        <div>
                          <div className="font-bold text-white text-[11px]">T1566.001 - Spearphishing</div>
                          <div className="text-[10px] text-slate-400">ISO image with LNK payload via lure</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Specialist Agent Telemetry */}
                {activeTab === 'telemetry' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 bg-[#090317] p-3 rounded-xl border border-purple-500/20">
                    {agents.slice(0, 4).map(agent => (
                      <div key={agent.id} className="p-2 rounded-lg bg-[#0e0722] border border-purple-500/20">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-white">{agent.name}</span>
                          <span className="text-emerald-400 font-bold">{agent.progress}%</span>
                        </div>
                        <div className="text-[9.5px] text-purple-300 truncate mt-0.5">{agent.role}</div>
                        <div className="text-[9px] text-slate-400 truncate mt-1">{agent.currentTask}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Action Tray */}
              <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-purple-500/20 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Telemetry Audit: <strong className="text-cyan-300 font-bold">{agents.length} Agents</strong> Active</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Quick One-Click JSON Export */}
                  <button
                    type="button"
                    id="quick-download-json-bottom-btn"
                    onClick={handleDownloadJSON}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold transition-all shadow-[0_0_8px_rgba(6,182,212,0.2)] hover:border-cyan-400"
                    title="Quick download mission report as JSON file"
                  >
                    <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                    <span>JSON</span>
                  </button>

                  {/* Quick One-Click CSV Export */}
                  <button
                    type="button"
                    id="quick-download-csv-bottom-btn"
                    onClick={handleDownloadCSV}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono font-bold transition-all shadow-[0_0_8px_rgba(16,185,129,0.2)] hover:border-emerald-400"
                    title="Quick download mission report as CSV file"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CSV</span>
                  </button>

                  {/* Download Reports Button */}
                  <div className="relative" ref={bottomExportMenuRef}>
                    <button
                      type="button"
                      id="export-report-bottom-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBottomMenuOpen(prev => !prev);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 text-[11px] font-bold transition-all shadow-[0_0_10px_rgba(6,182,212,0.25)] hover:border-cyan-400"
                      title="Download mission report in JSON, CSV, PDF or Word format"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download Report</span>
                      <ChevronDown className={`w-3 h-3 text-cyan-300 transition-transform ${bottomMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Options */}
                    <AnimatePresence>
                      {bottomMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 bottom-full mb-1.5 w-72 rounded-xl bg-[#0f0724] border border-cyan-500/40 shadow-2xl p-1.5 z-30 space-y-1 font-mono text-xs backdrop-blur-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="px-2 py-1 text-[10px] text-cyan-400 font-bold uppercase border-b border-purple-500/20 flex items-center justify-between">
                            <span>Export Mission Report</span>
                            <span className="text-slate-400 text-[9px]">v2.5</span>
                          </div>

                          {/* JSON Option */}
                          <button
                            type="button"
                            id="export-json-btn"
                            onClick={handleDownloadJSON}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-200 transition-colors text-left group"
                          >
                            <div className="w-7 h-7 rounded bg-cyan-900/40 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                              <FileJson className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[11px] group-hover:text-cyan-300 flex items-center justify-between">
                                <span>JSON Data Report (.json)</span>
                                <span className="text-[8px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-1 py-0.2 rounded font-mono">ALL LOGS</span>
                              </div>
                              <div className="text-[9.5px] text-slate-400 truncate">Structured telemetry, payload, & logs</div>
                            </div>
                          </button>

                          {/* CSV Option */}
                          <button
                            type="button"
                            id="export-csv-btn"
                            onClick={handleDownloadCSV}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-emerald-950/60 text-slate-200 hover:text-emerald-200 transition-colors text-left group"
                          >
                            <div className="w-7 h-7 rounded bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                              <FileSpreadsheet className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[11px] group-hover:text-emerald-300 flex items-center justify-between">
                                <span>CSV Spreadsheet (.csv)</span>
                                <span className="text-[8px] bg-emerald-950 border border-emerald-500/40 text-emerald-300 px-1 py-0.2 rounded font-mono">EXCEL / SIEM</span>
                              </div>
                              <div className="text-[9.5px] text-slate-400 truncate">Excel / SIEM ingest table format</div>
                            </div>
                          </button>

                          {/* PDF Report Option */}
                          <button
                            type="button"
                            id="export-pdf-bottom-btn"
                            onClick={handleDownloadPDF}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-rose-950/60 text-slate-200 hover:text-rose-200 transition-colors text-left group"
                          >
                            <div className="w-7 h-7 rounded bg-rose-900/40 border border-rose-500/30 flex items-center justify-center text-rose-300 shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[11px] group-hover:text-rose-300 flex items-center gap-1.5">
                                <span>PDF Report (.pdf)</span>
                                <span className="text-[8px] bg-rose-950 border border-rose-500/40 text-rose-300 px-1 py-0.2 rounded font-mono">PRINT READY</span>
                              </div>
                              <div className="text-[9.5px] text-slate-400 truncate">Formal executive dossier & forensic charts</div>
                            </div>
                          </button>

                          {/* Word Report Option */}
                          <button
                            type="button"
                            id="export-word-bottom-btn"
                            onClick={handleDownloadWord}
                            className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-blue-950/60 text-slate-200 hover:text-blue-200 transition-colors text-left group"
                          >
                            <div className="w-7 h-7 rounded bg-blue-900/40 border border-blue-500/30 flex items-center justify-center text-blue-300 shrink-0">
                              <FileCode className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[11px] group-hover:text-blue-300 flex items-center gap-1.5">
                                <span>Word Document (.doc)</span>
                                <span className="text-[8px] bg-blue-950 border border-blue-500/40 text-blue-300 px-1 py-0.2 rounded font-mono">EDITABLE</span>
                              </div>
                              <div className="text-[9.5px] text-slate-400 truncate">Microsoft Word & Docs compliance format</div>
                            </div>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                {onOpenEvidenceModal && (
                  <button
                    type="button"
                    onClick={onOpenEvidenceModal}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#180a33] hover:bg-[#251052] border border-purple-500/40 text-purple-200 text-[11px] font-semibold transition-colors"
                    title="Upload files, photos, PCAPs or threat links"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-purple-400" />
                    <span>Upload Evidence / Photos</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => handleCopy(JSON.stringify(mission, null, 2), 'raw-json', e)}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#160a2b] hover:bg-[#220f44] border border-purple-500/30 text-purple-200 text-[11px] transition-colors"
                >
                  <Code className="w-3.5 h-3.5 text-purple-400" />
                  <span>{copiedKey === 'raw-json' ? 'Copied JSON!' : 'Copy Raw JSON'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenCase(mission.caseId)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-purple-900/50 hover:bg-purple-800/60 border border-purple-500/50 text-white text-[11px] font-bold transition-all glow-purple-sm"
                >
                  <FileCode className="w-3.5 h-3.5 text-purple-300" />
                  <span>Open Full Investigation Case</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Subtle 'Mission Complete' Particle Burst Overlay */}
      <MissionCompleteBurst 
        isOpen={showBurst}
        onClose={() => setShowBurst(false)}
        caseId={mission.caseId}
        missionTitle={mission.title}
      />
    </div>
  );
};
