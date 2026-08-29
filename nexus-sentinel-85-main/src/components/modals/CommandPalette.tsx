import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  X, 
  Bot, 
  FolderArchive, 
  Globe, 
  Cpu, 
  ArrowRight, 
  ShieldAlert, 
  Zap, 
  UploadCloud, 
  FileText, 
  Layers, 
  Clock, 
  ExternalLink,
  ChevronRight,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SpecialistAgent, CaseItem, IOCItem, EvidenceArtifact, CEONode, AIProvider } from '../../types';
import { CyberSearchIndex, SearchItemType, SearchResult } from '../../utils/searchIndex';
import { CustomAgentIcon } from '../common/CustomAgentIcon';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  initialFilter?: SearchItemType | 'all';
  initialQuery?: string;
  agents?: SpecialistAgent[];
  cases?: CaseItem[];
  iocs?: IOCItem[];
  artifacts?: EvidenceArtifact[];
  ceo?: CEONode;
  providers?: AIProvider[];
  onSelectAgent: (a: SpecialistAgent) => void;
  onSelectCase: (c: CaseItem) => void;
  onSelectIOC: (i: IOCItem) => void;
  onOpenCEOChat: (initialPrompt?: string) => void;
  onOpenNewCase?: () => void;
  onExportLogs?: () => void;
  onOpenVoiceCommand?: () => void;
  onOpenEvidenceModal?: () => void;
  onOpenProvidersModal?: () => void;
  onToggleEmergencyOverride?: () => void;
  onToggleCustomizeLayout?: () => void;
  onOpenLayoutModal?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  initialFilter = 'all',
  initialQuery = '',
  agents = [],
  cases = [],
  iocs = [],
  artifacts = [],
  ceo,
  providers = [],
  onSelectAgent,
  onSelectCase,
  onSelectIOC,
  onOpenCEOChat,
  onOpenNewCase,
  onExportLogs,
  onOpenVoiceCommand,
  onOpenEvidenceModal,
  onOpenProvidersModal,
  onToggleEmergencyOverride,
  onToggleCustomizeLayout,
  onOpenLayoutModal
}) => {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SearchItemType | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Build and maintain live Full-Text Inverted Index with all intel & AI providers
  const searchEngine = useMemo(() => {
    return new CyberSearchIndex(agents, cases, iocs, artifacts, ceo, providers);
  }, [agents, cases, iocs, artifacts, ceo, providers]);

  // 2. Query search index whenever query or filter changes
  const results = useMemo(() => {
    return searchEngine.search(query, activeFilter);
  }, [searchEngine, query, activeFilter]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeFilter]);

  // Focus input and set initial states when opened
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setActiveFilter(initialFilter);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveFilter('all');
      setSelectedIndex(0);
    }
  }, [isOpen, initialFilter, initialQuery]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
        return;
      }

      if (e.key === 'Enter' && results.length > 0 && results[selectedIndex]) {
        e.preventDefault();
        handleExecuteResult(results[selectedIndex]);
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle filters
        const filterTypes: (SearchItemType | 'all')[] = ['all', 'agent', 'case', 'ioc', 'artifact', 'provider', 'action'];
        const currentIdx = filterTypes.indexOf(activeFilter);
        const nextFilter = filterTypes[(currentIdx + 1) % filterTypes.length];
        setActiveFilter(nextFilter);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, activeFilter]);

  // Scroll selected item into view
  useEffect(() => {
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector(`[data-result-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const handleExecuteResult = (res: SearchResult) => {
    const { doc } = res;
    if (doc.type === 'action') {
      const actionObj = doc.rawObject as { action: string; label: string };
      if (actionObj.action === 'open_new_case_modal' && onOpenNewCase) {
        onOpenNewCase();
      } else if (actionObj.action === 'open_voice_command' && onOpenVoiceCommand) {
        onOpenVoiceCommand();
      } else if (actionObj.action === 'export_diagnostic_logs' && onExportLogs) {
        onExportLogs();
      } else if (actionObj.action === 'open_ceo_chat') {
        onOpenCEOChat();
      } else if (actionObj.action === 'open_evidence_modal' && onOpenEvidenceModal) {
        onOpenEvidenceModal();
      } else if (actionObj.action === 'open_providers_modal' && onOpenProvidersModal) {
        onOpenProvidersModal();
      } else if (actionObj.action === 'toggle_emergency_override' && onToggleEmergencyOverride) {
        onToggleEmergencyOverride();
      } else if (actionObj.action === 'toggle_customize_layout' && onToggleCustomizeLayout) {
        onToggleCustomizeLayout();
      } else if (actionObj.action === 'open_layout_modal' && onOpenLayoutModal) {
        onOpenLayoutModal();
      }
      onClose();
    } else if (doc.type === 'agent') {
      onSelectAgent(doc.rawObject as SpecialistAgent);
      onClose();
    } else if (doc.type === 'case') {
      onSelectCase(doc.rawObject as CaseItem);
      onClose();
    } else if (doc.type === 'ioc') {
      onSelectIOC(doc.rawObject as IOCItem);
      onClose();
    } else if (doc.type === 'artifact') {
      if (onOpenEvidenceModal) {
        onOpenEvidenceModal();
      }
      onClose();
    } else if (doc.type === 'provider') {
      if (onOpenProvidersModal) {
        onOpenProvidersModal();
      }
      onClose();
    }
  };

  const selectedItem = results[selectedIndex]?.doc;

  const filterButtons: { label: string; value: SearchItemType | 'all'; icon: any; count?: number }[] = [
    { label: 'All Intel', value: 'all', icon: Layers },
    { label: 'Agents & Tasks', value: 'agent', icon: Bot, count: agents.length + 1 },
    { label: 'Cases', value: 'case', icon: FolderArchive, count: cases.length },
    { label: 'IOCs', value: 'ioc', icon: Globe, count: iocs.length },
    { label: 'Artifacts', value: 'artifact', icon: FileText, count: artifacts.length },
    { label: 'AI Engines', value: 'provider', icon: Cpu, count: providers.length },
    { label: 'Actions', value: 'action', icon: Zap }
  ];

  const quickPills = [
    { label: 'DEFCON 1 Override', query: 'emergency override' },
    { label: 'Analyzing malware.exe', query: 'malware.exe' },
    { label: 'APT28 Campaign', query: 'APT28' },
    { label: '185.199.108.153', query: '185.199.108.153' },
    { label: 'Gemini 2.5 Flash', query: 'Gemini' }
  ];

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-14 p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="command-palette-dialog"
        className="w-full max-w-4xl bg-gradient-to-b from-[#110926] via-[#0c061d] to-[#070312] border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-200 flex flex-col max-h-[85vh] glow-purple"
      >
        {/* Header / Search Bar */}
        <div className="p-3.5 sm:p-4 border-b border-purple-500/20 flex items-center gap-3 bg-[#150b33]/90">
          <div className="w-8 h-8 rounded-lg bg-purple-900/40 border border-purple-500/40 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-purple-300" />
          </div>
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all agent tasks, cases, IOCs, artifacts, or commands... (e.g., 'malware', 'APT28', '185.199')"
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono tracking-wide"
          />

          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-1.5 shrink-0 hidden sm:flex">
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-[#1f143a] text-purple-300 border border-purple-500/30 font-mono">
              ↑↓ Navigate
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-[#1f143a] text-purple-300 border border-purple-500/30 font-mono">
              ↵ Enter
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded text-[10px] bg-[#1f143a] text-purple-300 border border-purple-500/30 font-mono">
              ESC
            </kbd>
          </div>
        </div>

        {/* Filter Toolbar & Quick Suggestions */}
        <div className="p-2 sm:px-4 py-2 border-b border-purple-500/15 bg-[#0e0722] flex flex-wrap items-center justify-between gap-2">
          {/* Category Filter Chips */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
            {filterButtons.map((btn) => {
              const Icon = btn.icon;
              const isActive = activeFilter === btn.value;
              return (
                <button
                  key={btn.value}
                  onClick={() => setActiveFilter(btn.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-purple-600/40 text-purple-200 border border-purple-400 font-semibold glow-purple-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{btn.label}</span>
                  {btn.count !== undefined && (
                    <span className="text-[10px] opacity-60 ml-0.5">({btn.count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Query Pills */}
          {!query && (
            <div className="hidden md:flex items-center gap-1.5 text-[10.5px] font-mono text-purple-300/70">
              <span className="text-slate-500">Try:</span>
              {quickPills.slice(0, 3).map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => setQuery(pill.query)}
                  className="px-1.5 py-0.5 rounded bg-[#170e30] border border-purple-500/20 hover:border-purple-400 text-purple-300 hover:text-white transition-colors"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area: Split View with Result List & Live Inspector */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-purple-500/20 overflow-hidden flex-1 min-h-[340px] max-h-[58vh]">
          {/* Left Column: Search Results List */}
          <div 
            ref={listContainerRef}
            className="md:col-span-7 overflow-y-auto p-2 sm:p-3 space-y-1.5 font-mono text-xs scrollbar-thin"
          >
            {results.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <ShieldAlert className="w-8 h-8 text-purple-400/60 mb-2 animate-pulse" />
                <p className="text-sm font-semibold text-slate-200">No matching threat intelligence or tasks found</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Try searching by specialist agent name, active task (e.g. &quot;disassembly&quot;), case number, IOC IP/hash, or quick command.
                </p>
                <button
                  onClick={() => {
                    onOpenCEOChat(query ? `Commander ARCHON, investigate: ${query}` : undefined);
                    onClose();
                  }}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Dispatch Query to CEO ARCHON</span>
                </button>
              </div>
            ) : (
              results.map((res, index) => {
                const { doc } = res;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={doc.id}
                    data-result-index={index}
                    onClick={() => handleExecuteResult(res)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`group cursor-pointer rounded-xl p-2.5 sm:p-3 transition-all duration-150 border flex items-start gap-3 ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-900/50 to-[#1e1040]/80 border-purple-400 text-white shadow-lg glow-purple-sm'
                        : 'bg-[#100824]/60 hover:bg-[#160d33] border-purple-500/15 text-slate-300'
                    }`}
                  >
                    {/* Item Icon */}
                    <div className="shrink-0 pt-0.5">
                      {doc.type === 'agent' ? (
                        <div className="w-8 h-8 rounded-lg bg-[#1a0e38] border border-purple-500/40 flex items-center justify-center">
                          <CustomAgentIcon type={doc.id.replace('agent-', '')} className="w-4 h-4" glow={isSelected} />
                        </div>
                      ) : doc.type === 'case' ? (
                        <div className="w-8 h-8 rounded-lg bg-blue-950/50 border border-blue-500/40 flex items-center justify-center text-blue-300">
                          <FolderArchive className="w-4 h-4" />
                        </div>
                      ) : doc.type === 'ioc' ? (
                        <div className="w-8 h-8 rounded-lg bg-rose-950/50 border border-rose-500/40 flex items-center justify-center text-rose-300">
                          <Globe className="w-4 h-4" />
                        </div>
                      ) : doc.type === 'artifact' ? (
                        <div className="w-8 h-8 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                          <FileText className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-amber-300">
                          <Zap className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`font-semibold truncate text-xs sm:text-sm ${isSelected ? 'text-purple-100' : 'text-slate-200'}`}>
                          {doc.title}
                        </span>
                        
                        {doc.badge && (
                          <span className={`shrink-0 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            doc.badgeColor === 'rose'
                              ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                              : doc.badgeColor === 'emerald'
                              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                              : doc.badgeColor === 'amber'
                              ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                              : doc.badgeColor === 'cyan'
                              ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300'
                              : 'bg-purple-950/60 border border-purple-500/40 text-purple-300'
                          }`}>
                            {doc.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {doc.subtitle}
                      </p>

                      {/* Match Snippet / Match Field Tag */}
                      <div className="flex items-center gap-2 pt-0.5 text-[10px]">
                        <span className="px-1.5 py-0.2 bg-purple-950/70 border border-purple-500/30 text-purple-300/90 rounded">
                          {res.matchedField}
                        </span>
                        {res.snippet && res.snippet !== doc.subtitle && (
                          <span className="text-slate-400 truncate italic">
                            {res.snippet}
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 self-center transition-transform ${
                      isSelected ? 'text-purple-300 translate-x-0.5' : 'text-slate-600'
                    }`} />
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Tactical Inspector Preview */}
          <div className="hidden md:flex md:col-span-5 flex-col bg-[#0b051a]/95 p-4 overflow-y-auto space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-purple-500/20 text-purple-300 font-bold uppercase tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" />
                <span>Tactical Inspector</span>
              </span>
              <span className="text-[10px] text-slate-500 font-normal">
                {results.length} Indexed Results
              </span>
            </div>

            {selectedItem ? (
              <div className="space-y-3.5 animate-in fade-in duration-200">
                {/* Header Profile */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-purple-400/80">
                    {selectedItem.type.toUpperCase()} PREVIEW
                  </span>
                  <h4 className="text-sm font-bold text-white font-mono break-words">
                    {selectedItem.title}
                  </h4>
                  <p className="text-xs text-purple-300/80">
                    {selectedItem.subtitle}
                  </p>
                </div>

                {/* Structured Metadata Badges */}
                <div className="p-3 rounded-xl bg-[#140a2d] border border-purple-500/25 space-y-2">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold border-b border-purple-500/15 pb-1">
                    System Parameters
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(selectedItem.metadata).map(([key, val]) => {
                      if (!val) return null;
                      return (
                        <div key={key} className="space-y-0.5">
                          <span className="text-slate-500 capitalize text-[10px] block">{key}</span>
                          <span className="text-slate-200 font-semibold truncate block" title={String(val)}>
                            {String(val)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Extended Details / Task / System Logs */}
                {selectedItem.fields.body && (
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold">Indexed Intelligence Details</span>
                    <div className="p-2.5 rounded-lg bg-[#080314] border border-purple-500/20 text-[10.5px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                      {selectedItem.fields.body}
                    </div>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  onClick={() => handleExecuteResult(results[selectedIndex])}
                  className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-purple-500/30"
                >
                  <span>Open & Inspect {selectedItem.fields.primary}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
                <Bot className="w-8 h-8 text-purple-500/40 mb-2" />
                <p>Select any search result to inspect tactical telemetry and dispatch tasks.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Quick Actions Bar */}
        <div className="p-2.5 sm:p-3 border-t border-purple-500/20 bg-[#12092c] flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onOpenCEOChat(query ? `Commander ARCHON, analyze search query: "${query}"` : undefined);
                onClose();
              }}
              className="flex items-center gap-1.5 text-purple-300 hover:text-white transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Ask CEO ARCHON about {query ? `"${query}"` : 'Active Threats'}</span>
            </button>

            {onOpenEvidenceModal && (
              <button
                onClick={() => {
                  onOpenEvidenceModal();
                  onClose();
                }}
                className="flex items-center gap-1.5 text-cyan-300 hover:text-white transition-colors hidden sm:flex"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload PCAP/Binary</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-purple-400/80">
            <span>Powered by Cyber-X Full-Text Index</span>
          </div>
        </div>
      </div>
    </div>
  );
};
