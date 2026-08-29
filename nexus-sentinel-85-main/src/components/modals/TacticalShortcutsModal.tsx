import React, { useState } from 'react';
import { 
  Keyboard, 
  X, 
  Mic, 
  MessageSquare, 
  Sparkles, 
  Sliders, 
  Upload, 
  Cpu, 
  ShieldAlert, 
  Search, 
  Download, 
  Command, 
  Zap, 
  Terminal, 
  CheckCircle2, 
  BookOpen, 
  Activity,
  Layers
} from 'lucide-react';

interface TacticalShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenVoiceCommand: () => void;
  onOpenCEOChat: () => void;
  onOpenNewCase: () => void;
  onOpenEvidence: () => void;
  onOpenProviders: () => void;
  onToggleCustomize: () => void;
  onToggleEmergency: () => void;
  onOpenSearch: () => void;
  onExportLogs: () => void;
}

export const TacticalShortcutsModal: React.FC<TacticalShortcutsModalProps> = ({
  isOpen,
  onClose,
  onOpenVoiceCommand,
  onOpenCEOChat,
  onOpenNewCase,
  onOpenEvidence,
  onOpenProviders,
  onToggleCustomize,
  onToggleEmergency,
  onOpenSearch,
  onExportLogs
}) => {
  const [activeTab, setActiveTab] = useState<'shortcuts' | 'voice' | 'playbook'>('shortcuts');

  if (!isOpen) return null;

  const SHORTCUT_ITEMS = [
    {
      keys: ['⌘', 'K'],
      label: 'Global Command Palette & Search',
      description: 'Search cases, IOCs, forensic telemetry, and specialist agents.',
      action: onOpenSearch,
      icon: Search,
      category: 'Navigation'
    },
    {
      keys: ['Shift', 'V'],
      label: 'Voice Command Mode (Web Speech)',
      description: 'Trigger natural speech hands-free controls and tactical vocalizer.',
      action: onOpenVoiceCommand,
      icon: Mic,
      category: 'AI & Voice'
    },
    {
      keys: ['Shift', 'C'],
      label: 'CEO Commander ARCHON Comms',
      description: 'Open direct tactical AI orchestration drawer with multi-model intelligence.',
      action: onOpenCEOChat,
      icon: MessageSquare,
      category: 'AI & Voice'
    },
    {
      keys: ['Shift', 'N'],
      label: 'New Incident & Auto-Assign',
      description: 'Intake security incident and auto-route to qualified specialist agent.',
      action: onOpenNewCase,
      icon: Sparkles,
      category: 'Operations'
    },
    {
      keys: ['Shift', 'L'],
      label: 'Customize Dashboard Layout',
      description: 'Toggle drag-and-drop widget arrangement and responsive resizing.',
      action: onToggleCustomize,
      icon: Sliders,
      category: 'Workspace'
    },
    {
      keys: ['Shift', 'E'],
      label: 'Evidence & Artifact Repository',
      description: 'Upload memory captures, PCAPs, logs, and link intelligence URLs.',
      action: onOpenEvidence,
      icon: Upload,
      category: 'Forensics'
    },
    {
      keys: ['Shift', 'P'],
      label: 'AI Engines & Provider Matrix',
      description: 'Configure Gemini, OpenAI, Anthropic, Groq, and Ollama credentials.',
      action: onOpenProviders,
      icon: Cpu,
      category: 'AI & Voice'
    },
    {
      keys: ['Shift', 'D'],
      label: 'DEFCON 1 Emergency Override',
      description: 'Engage or disengage full-spectrum emergency threat containment.',
      action: onToggleEmergency,
      icon: ShieldAlert,
      category: 'Operations'
    },
    {
      keys: ['Shift', 'X'],
      label: 'Export Forensic Diagnostic Logs',
      description: 'Extract forensic telemetry in SIEM-ready JSON or CSV format.',
      action: onExportLogs,
      icon: Download,
      category: 'Forensics'
    },
    {
      keys: ['?'],
      label: 'Tactical Playbook & Help',
      description: 'Display this operator keyboard and workflow reference guide.',
      action: () => {},
      icon: BookOpen,
      category: 'Navigation'
    },
    {
      keys: ['Esc'],
      label: 'Close Active Modal / HUD',
      description: 'Dismiss any open dialog, modal, drawer, or palette.',
      action: onClose,
      icon: X,
      category: 'Navigation'
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={onClose}
    >
      <div 
        id="tactical-shortcuts-modal"
        className="w-full max-w-3xl max-h-[85vh] bg-[#070314] border border-cyan-500/40 rounded-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-xs font-mono"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--color-bg-sidebar)',
          borderColor: 'var(--color-primary)'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-transparent shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-cyber text-slate-100 tracking-wide">
                  TACTICAL OPERATOR GUIDE & SHORTCUTS
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  SYSTEM ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                Rapid keyboard workflows, Web Speech voice commands, and SOC incident escalation playbooks.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-black/40 border-b border-slate-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('shortcuts')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'shortcuts'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Command className="w-3.5 h-3.5" />
            <span>Keyboard Hotkeys</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'voice'
                ? 'bg-purple-950/80 border-purple-400 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Voice Command Taxonomies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('playbook')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              activeTab === 'playbook'
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SOC Defense Protocols</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[58vh] no-scrollbar">
          {activeTab === 'shortcuts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SHORTCUT_ITEMS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-black/40 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-cyan-950/15 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-200 flex items-center gap-2 text-xs">
                          <IconComponent className="w-3.5 h-3.5 text-cyan-400" />
                          {item.label}
                        </span>
                        <div className="flex items-center gap-1">
                          {item.keys.map((k, kIdx) => (
                            <kbd
                              key={kIdx}
                              className="px-2 py-0.5 rounded bg-[#120826] border border-cyan-500/30 text-cyan-300 text-[11px] font-mono shadow-sm font-bold"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
                        {item.category}
                      </span>
                      {item.keys[0] !== '?' && item.keys[0] !== 'Esc' && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            item.action();
                          }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-200 hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Zap className="w-2.5 h-2.5" />
                          Test Trigger
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs">
                <div className="flex items-center gap-2 font-bold font-cyber mb-1">
                  <Mic className="w-4 h-4 text-purple-400" />
                  <span>Hands-Free Web Speech Recognition Engine</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans">
                  Operators can speak natural language phrases into their microphone to trigger system-level SOC actions with real-time acoustic feedback and spoken confirmations from CEO ARCHON.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                  <h4 className="font-bold text-rose-300 text-xs mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Lockdown & Emergency Defense
                  </h4>
                  <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <li>• <span className="text-cyan-300">&quot;Engage lockdown&quot;</span> → DEFCON 1 Override</li>
                    <li>• <span className="text-cyan-300">&quot;Release lockdown&quot;</span> → Stand Down Baseline</li>
                    <li>• <span className="text-cyan-300">&quot;Deploy countermeasures&quot;</span> → Neutralize Vectors</li>
                    <li>• <span className="text-cyan-300">&quot;Isolate network&quot;</span> → Port 443/8080 Blackout</li>
                  </ul>
                </div>

                <div className="p-3 rounded-lg bg-black/40 border border-slate-800">
                  <h4 className="font-bold text-cyan-300 text-xs mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Incident Intake & Fleet Control
                  </h4>
                  <ul className="text-[11px] text-slate-300 space-y-1 font-mono">
                    <li>• <span className="text-purple-300">&quot;Open case&quot;</span> → Auto-Assign Intake</li>
                    <li>• <span className="text-purple-300">&quot;Download logs&quot;</span> → Forensic SIEM Export</li>
                    <li>• <span className="text-purple-300">&quot;Upload evidence&quot;</span> → Artifact Ingest</li>
                    <li>• <span className="text-purple-300">&quot;Inspect Malware Analyst&quot;</span> → Target Node</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenVoiceCommand();
                  }}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all flex items-center gap-2"
                >
                  <Mic className="w-3.5 h-3.5" />
                  Launch Voice Command HUD
                </button>
              </div>
            </div>
          )}

          {activeTab === 'playbook' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Protocol 1: Threat Intake & Automated Dispatch</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  When a new breach indicator arrives, press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300">Shift+N</kbd> to open the New Case Intake. The AI triage engine evaluates indicator types (ransomware, C2 beacon, memory injection) and auto-assigns the highest-confidence specialist node while allocating threat telemetry.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Protocol 2: High Threat & DEFCON 1 Escalation</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  If threat score exceeds the safety threshold (default 75%), the system automatically enters DEFCON 1 lockdown. Operators can deploy synchronized multi-agent countermeasures or engage full network port blackouts to suppress unauthorized egress channels.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-black/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span>Protocol 3: SIEM Export & Forensic Hand-off</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Use the Download Logs action or press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-purple-300">Shift+X</kbd> to generate cryptographic SHA-256 verifiable JSON or RFC 4180 CSV exports for external forensic audits, legal chain-of-custody, and Splunk/Elastic ingestion.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-black/60 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[10px] text-slate-400">
            Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300">?</kbd> anytime to bring up this guide.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
