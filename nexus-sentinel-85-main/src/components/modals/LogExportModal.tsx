import React, { useState, useMemo } from 'react';
import { StreamEvent, SpecialistAgent, CaseItem } from '../../types';
import { 
  X, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  ShieldCheck, 
  Filter, 
  Database, 
  Copy, 
  Check, 
  Terminal, 
  Activity,
  Layers,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { 
  ExportFormat, 
  ExportScope, 
  exportLogsToFile, 
  generateForensicAuditHash 
} from '../../utils/logExporter';

interface LogExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: StreamEvent[];
  activeFilter?: string;
  filteredEvents?: StreamEvent[];
  agents?: SpecialistAgent[];
  cases?: CaseItem[];
  threatScore?: number;
}

export const LogExportModal: React.FC<LogExportModalProps> = ({
  isOpen,
  onClose,
  events = [],
  activeFilter = 'All',
  filteredEvents = [],
  agents = [],
  cases = [],
  threatScore = 84
}) => {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [scope, setScope] = useState<ExportScope>('all');
  const [includeAuditHash, setIncludeAuditHash] = useState(true);
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Determine active dataset to export
  const selectedEvents = useMemo(() => {
    if (scope === 'current') {
      return filteredEvents.length > 0 ? filteredEvents : events;
    }
    return events;
  }, [scope, filteredEvents, events]);

  // Preview snippet calculation
  const previewContent = useMemo(() => {
    const previewDataset = selectedEvents.slice(0, 3);
    const now = new Date();

    if (format === 'json') {
      const previewObj: Record<string, unknown> = {
        audit_header: {
          system: 'ARCHON AI SOC DEFENSE GRID',
          classification: 'TLP:AMBER - FORENSIC AUDIT',
          generated_at_utc: now.toISOString(),
          export_scope: scope,
          filter_applied: scope === 'current' ? activeFilter : 'All',
          total_records: selectedEvents.length,
          audit_hash: includeAuditHash ? generateForensicAuditHash(JSON.stringify(previewDataset)) : undefined
        }
      };

      if (includeDiagnostics && scope === 'diagnostic_bundle') {
        previewObj.system_diagnostics = {
          threat_level_score: threatScore,
          active_specialists_count: agents.length,
          active_cases_count: cases.length
        };
      }

      previewObj.sample_logs = previewDataset.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        type: e.type,
        category: e.category,
        source: e.source,
        message: e.message
      }));

      return JSON.stringify(previewObj, null, 2);
    } else {
      const rows = [
        'Record_Index,Event_ID,Timestamp,Severity,Category,Source,Message',
        ...previewDataset.map((e, idx) => 
          `${idx + 1},"${e.id}","${e.timestamp}","${(e.type || 'INFO').toUpperCase()}","${e.category || 'general'}","${e.source || 'ARCHON'}","${e.message.replace(/"/g, '""')}"`
        )
      ];
      if (selectedEvents.length > 3) {
        rows.push(`... (+ ${selectedEvents.length - 3} more records)`);
      }
      return rows.join('\n');
    }
  }, [format, scope, selectedEvents, activeFilter, includeAuditHash, includeDiagnostics, threatScore, agents.length, cases.length]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const res = exportLogsToFile(
      selectedEvents,
      {
        format,
        scope,
        includeAuditHash,
        includeDiagnostics,
        filterName: activeFilter,
        threatScore
      },
      {
        agents,
        cases,
        threatScore
      }
    );

    if (res.success) {
      setDownloadSuccess(res.filename);
      setTimeout(() => setDownloadSuccess(null), 4000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        id="log-export-modal-dialog"
        className="w-full max-w-2xl bg-[#090514] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-primary)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-purple-950/20 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-cyber text-slate-100 tracking-wide">
                  Export Forensic Diagnostic & Threat Logs
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  TLP:AMBER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Export telemetry, threat alerts, and agent diagnostics for external SIEM or offline forensic investigation.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          
          {/* Format Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>1. Choose Export Format</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="format-json-btn"
                onClick={() => setFormat('json')}
                className={`p-3 rounded-lg border flex items-start gap-3 text-left transition-all ${
                  format === 'json'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-md ${format === 'json' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-slate-400'}`}>
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold font-cyber text-xs">JSON (Forensic SIEM)</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Hierarchical structure with audit header, diagnostics, and ISO signatures.</div>
                </div>
              </button>

              <button
                type="button"
                id="format-csv-btn"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border flex items-start gap-3 text-left transition-all ${
                  format === 'csv'
                    ? 'bg-purple-950/60 border-purple-400 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className={`p-2 rounded-md ${format === 'csv' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-slate-400'}`}>
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold font-cyber text-xs">CSV (RFC 4180 Audit)</div>
                  <div className="text-[11px] opacity-80 mt-0.5">Tabular spreadsheet ready for Excel, Splunk, Pandas, or Elastic ingest.</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-purple-400" />
              <span>2. Select Log Scope</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="scope-current-btn"
                onClick={() => setScope('current')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  scope === 'current'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                    : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">Filtered View</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {activeFilter} ({filteredEvents.length} items)
                </div>
              </button>

              <button
                type="button"
                id="scope-all-btn"
                onClick={() => setScope('all')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  scope === 'all'
                    ? 'bg-purple-950/60 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                    : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">Full Stream History</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  All ({events.length} events)
                </div>
              </button>

              <button
                type="button"
                id="scope-diagnostic-btn"
                onClick={() => setScope('diagnostic_bundle')}
                className={`p-2.5 rounded-lg border text-center transition-all ${
                  scope === 'diagnostic_bundle'
                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">Diagnostic Bundle</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Stream + Agent Diagnostics
                </div>
              </button>
            </div>
          </div>

          {/* Forensic Integrity Toggles */}
          <div className="p-3 bg-black/40 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input 
                  type="checkbox" 
                  checked={includeAuditHash} 
                  onChange={(e) => setIncludeAuditHash(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-[11px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Include SHA-256 Cryptographic Audit Hash for Tamper-Evidence
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input 
                  type="checkbox" 
                  checked={includeDiagnostics} 
                  onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-[11px] flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-purple-400" />
                  Embed Threat Level Telemetry & Active Specialist Fleet State
                </span>
              </label>
            </div>
          </div>

          {/* Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Database className="w-3 h-3 text-cyan-400" />
                Payload Preview ({selectedEvents.length} total records selected)
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Sample'}</span>
              </button>
            </div>

            <div className="p-3 bg-[#04010a] border border-slate-800 rounded-lg text-[10px] text-slate-300 font-mono max-h-36 overflow-y-auto whitespace-pre no-scrollbar leading-relaxed">
              {previewContent}
            </div>
          </div>

          {/* Download Success Notice */}
          {downloadSuccess && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Successfully generated and downloaded <strong>{downloadSuccess}</strong></span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-800 bg-black/40 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Ready to export {selectedEvents.length} events in <strong>{format.toUpperCase()}</strong> format</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-white/5 text-xs font-mono"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-download-logs-btn"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Logs ({format.toUpperCase()})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
