import React, { useRef, useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  Bell, 
  HelpCircle, 
  Settings, 
  ShieldAlert, 
  CheckCircle2, 
  User, 
  Users, 
  Upload, 
  Image as ImageIcon, 
  Paperclip, 
  Sliders, 
  LayoutGrid, 
  Mic, 
  MicOff, 
  Radio, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Activity,
  Cpu,
  Keyboard
} from 'lucide-react';
import archonBg from '../../assets/images/archon_throne_bg_1786987761102.jpg';

interface TopBarProps {
  onOpenSearch: () => void;
  onOpenCEOChat: () => void;
  onOpenNewCase?: () => void;
  onOpenEvidenceUpload?: () => void;
  onOpenProvidersModal?: () => void;
  onOpenShortcutsModal?: () => void;
  onOpenAgentsFleet?: () => void;
  onOpenSystemStatus?: () => void;
  onToggleEmergencyOverride?: () => void;
  onToggleCustomizeMode?: () => void;
  onOpenLayoutModal?: () => void;
  onOpenVoiceCommand?: () => void;
  isVoiceListening?: boolean;
  isEmergencyOverride?: boolean;
  isCustomizeMode?: boolean;
  artifactsCount?: number;
  activeAgentsCount?: number;
  totalAgentsCount?: number;
  threatLevel?: string;
  threatScore?: number;
  activeProvidersCount?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onOpenCEOChat,
  onOpenNewCase,
  onOpenEvidenceUpload,
  onOpenProvidersModal,
  onOpenShortcutsModal,
  onOpenAgentsFleet,
  onOpenSystemStatus,
  onToggleEmergencyOverride,
  onToggleCustomizeMode,
  onOpenLayoutModal,
  onOpenVoiceCommand,
  isVoiceListening = false,
  isEmergencyOverride = false,
  isCustomizeMode = false,
  artifactsCount = 6,
  activeAgentsCount = 7,
  totalAgentsCount = 8,
  threatLevel = "HIGH",
  threatScore = 78,
  activeProvidersCount = 12
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();
    window.addEventListener('resize', checkScroll);
    el.addEventListener('scroll', checkScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', checkScroll);
      el.removeEventListener('scroll', checkScroll);
    };
  }, []);

  // Close More menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollContainerRef.current && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      scrollContainerRef.current.scrollLeft += e.deltaY;
    }
  };

  const scrollByAmount = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <header 
      id="top-cyber-bar"
      className={`relative h-14 border-b z-30 shrink-0 select-none transition-colors duration-300 ${
        isEmergencyOverride ? 'bg-[#1a0207] border-rose-600/70 shadow-[0_0_20px_rgba(225,29,72,0.4)]' : ''
      }`}
      style={{
        backgroundColor: isEmergencyOverride ? undefined : 'var(--color-bg-sidebar)',
        borderColor: isEmergencyOverride ? undefined : 'var(--color-panel-border)'
      }}
    >
      {/* Scroll Left Button (Appears when scrolled to right, offset so it never obscures controls) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollByAmount(-220)}
          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-40 p-1 rounded-full bg-purple-950/95 hover:bg-purple-800 text-cyan-300 border border-purple-500/50 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all cursor-pointer backdrop-blur-md"
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Scroll Right Button (Appears when more items exist to the right, offset so it never obscures controls) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollByAmount(220)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-40 p-1 rounded-full bg-purple-950/95 hover:bg-purple-800 text-cyan-300 border border-purple-500/50 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all cursor-pointer backdrop-blur-md animate-pulse"
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Main Horizontally Scrollable Container with padded ends */}
      <div 
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="w-full h-full px-3 sm:px-4 lg:px-6 flex items-center justify-start gap-2 sm:gap-2.5 lg:gap-3 overflow-x-auto overflow-y-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#3b1e6e_transparent]"
      >
        {/* 1. Left Search Bar Trigger */}
        <div className="w-36 sm:w-44 md:w-52 lg:w-60 shrink-0">
          <button
            id="global-search-trigger"
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-2 sm:px-2.5 py-1.5 rounded-lg border text-slate-300 hover:text-white text-xs font-mono transition-all group overflow-hidden whitespace-nowrap"
            style={{
              backgroundColor: 'rgba(var(--color-primary-rgb), 0.08)',
              borderColor: 'var(--color-panel-border)'
            }}
          >
            <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
              <Search className="w-3.5 h-3.5 shrink-0 transition-colors" style={{ color: 'var(--color-primary-light)' }} />
              <span className="text-slate-400 group-hover:text-slate-200 truncate text-[11px] sm:text-xs">
                Search cases, IOCs...
              </span>
            </div>
            <kbd 
              className="hidden sm:inline-block px-1.5 py-0.2 rounded text-[9.5px] font-mono shadow-sm shrink-0 border ml-1"
              style={{
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.15)',
                borderColor: 'var(--color-panel-border)',
                color: 'var(--color-primary-light)'
              }}
            >
              ⌘K
            </kbd>
          </button>
        </div>

        {/* 2. Primary Quick Action Buttons (Always front-and-center) */}
        <div className="flex items-center gap-1.5 lg:gap-2 shrink-0 flex-nowrap">
          {/* New Case Intake & Auto-Assign Button */}
          {onOpenNewCase && (
            <button
              type="button"
              id="topbar-new-case-btn"
              onClick={onOpenNewCase}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/80 via-indigo-950/80 to-cyan-950/80 hover:from-purple-800 hover:to-cyan-900 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0 whitespace-nowrap group"
              title="Create new security incident case & auto-assign qualified specialist"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-12 transition-transform shrink-0" />
              <span className="hidden sm:inline">+ Auto-Assign Case</span>
              <span className="sm:hidden">+ Case</span>
            </button>
          )}

          {/* Quick Evidence & Artifact Upload Button */}
          {onOpenEvidenceUpload && (
            <button
              type="button"
              id="topbar-upload-evidence-btn"
              onClick={onOpenEvidenceUpload}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0 whitespace-nowrap group"
              title="Upload files, photos, link threat captures and intelligence URLs"
            >
              <Upload className="w-3.5 h-3.5 shrink-0 text-purple-300 group-hover:scale-110 transition-transform" />
              <span>Evidence</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-900/90 text-purple-300 text-[10px] border border-purple-500/30">
                {artifactsCount}
              </span>
            </button>
          )}

          {/* Voice Command Mode Trigger (Visible on xl+ or accessible in More dropdown) */}
          {onOpenVoiceCommand && (
            <button
              type="button"
              id="topbar-voice-command-btn"
              onClick={onOpenVoiceCommand}
              className={`hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap ${
                isVoiceListening
                  ? 'bg-rose-950/90 border-rose-500 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse'
                  : 'bg-[#100726] hover:bg-cyan-950/60 border-cyan-500/35 hover:border-cyan-400 text-cyan-200 hover:text-white shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              }`}
              title="Open Natural Language Voice Command Mode (Web Speech API)"
            >
              {isVoiceListening ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-spin shrink-0" />
                  <span>Voice Active</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Voice Command</span>
                </>
              )}
            </button>
          )}

          {/* Customize Dashboard Layout Button (Visible on xl+ or accessible in More dropdown) */}
          {onToggleCustomizeMode && (
            <button
              type="button"
              id="topbar-customize-layout-btn"
              onClick={onToggleCustomizeMode}
              className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap ${
                isCustomizeMode 
                  ? 'bg-purple-600 border-white text-white shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-pulse' 
                  : 'bg-[#140a2d] hover:bg-purple-900/60 border-purple-500/35 hover:border-purple-400 text-purple-200'
              }`}
              title={isCustomizeMode ? "Layout Customization Active (Click to Exit)" : "Customize & Reorder Dashboard Widgets (Drag & Drop)"}
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>{isCustomizeMode ? 'Editing Layout' : 'Customize'}</span>
            </button>
          )}

          {/* AI Engines Matrix Button (Visible on xl+ or accessible in More dropdown) */}
          {onOpenProvidersModal && (
            <button
              type="button"
              id="topbar-providers-btn"
              onClick={onOpenProvidersModal}
              className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#140a2d] hover:bg-purple-900/60 border border-purple-500/35 hover:border-purple-400 text-purple-200 text-xs font-mono font-bold transition-all shrink-0 whitespace-nowrap"
              title="Configure AI Providers, API Keys, and Custom Endpoints"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse glow-green shrink-0" />
              <span>AI Engines</span>
              <span className="text-[10px] text-purple-300 font-bold px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-500/30">
                {activeProvidersCount}
              </span>
            </button>
          )}
        </div>

        {/* 3. Right Telemetry & Status Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono shrink-0 flex-nowrap ml-auto">
          {/* System Status Button */}
          <button
            type="button"
            id="topbar-system-status-btn"
            onClick={onOpenSystemStatus || onOpenAgentsFleet}
            className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#130b2b] hover:bg-[#1f1145] border border-purple-500/30 hover:border-emerald-400/50 glow-purple-sm text-xs shrink-0 whitespace-nowrap transition-all cursor-pointer group"
            title="System Status: Operational (Click to View Fleet & System Health)"
          >
            <span className="text-slate-400 text-[11px] group-hover:text-slate-300 hidden 2xl:inline">System Status:</span>
            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse glow-green" />
              Operational
            </span>
          </button>

          {/* Active Agents Count Button */}
          <button
            type="button"
            id="topbar-active-agents-btn"
            onClick={onOpenAgentsFleet}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#130b2b] hover:bg-[#1f1145] border border-purple-500/30 hover:border-cyan-400/60 glow-purple-sm text-xs shrink-0 whitespace-nowrap transition-all cursor-pointer group shadow-sm"
            title="Active Specialists: 7/8 Online (Click to Open Fleet Overview & Health Matrix)"
          >
            <Users className="w-3.5 h-3.5 text-purple-400 group-hover:text-cyan-400 transition-colors shrink-0" />
            <span className="text-slate-400 text-[11px] group-hover:text-slate-200 hidden lg:inline">Agents:</span>
            <span className="text-purple-200 group-hover:text-white font-bold">{activeAgentsCount}/{totalAgentsCount}</span>
          </button>

          {/* Threat Level & Emergency Override Trigger */}
          <button
            type="button"
            id="topbar-threat-level-btn"
            onClick={onToggleEmergencyOverride}
            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md text-xs transition-all shrink-0 whitespace-nowrap cursor-pointer ${
              isEmergencyOverride 
                ? 'bg-rose-600 border border-white text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse' 
                : 'bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 glow-red'
            }`}
            title={isEmergencyOverride ? "Emergency Override Active (Click to Disengage)" : "Threat Level (Click to Trigger Emergency Override)"}
          >
            <ShieldAlert className={`w-3.5 h-3.5 shrink-0 ${isEmergencyOverride ? 'text-white' : 'text-rose-400'}`} />
            <span className="text-slate-300 text-[11px] hidden sm:inline">{isEmergencyOverride ? 'DEFCON 1' : 'Threat:'}</span>
            <span className="inline-flex items-center gap-1 font-bold">
              <span className={`w-2 h-2 rounded-full ${isEmergencyOverride ? 'bg-white animate-ping' : 'bg-rose-500 animate-ping'}`} />
              <span className={isEmergencyOverride ? 'text-white' : 'text-rose-400'}>
                {isEmergencyOverride ? `${threatScore}% OVERRIDE` : threatLevel}
              </span>
            </span>
          </button>

          {/* More ▾ Responsive Dropdown for Smaller Screens */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              id="topbar-more-actions-btn"
              onClick={() => setIsMoreMenuOpen(prev => !prev)}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#160b33] hover:bg-[#22104d] border border-purple-500/30 text-purple-200 hover:text-white text-xs font-mono transition-all"
              title="More actions and system options"
            >
              <span>More</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-[#0c051f] border border-purple-500/40 shadow-2xl p-1.5 z-50 space-y-1 font-mono text-xs backdrop-blur-xl animate-in fade-in"
                onClick={() => setIsMoreMenuOpen(false)}
              >
                <div className="px-2.5 py-1 text-[10px] text-purple-400 font-bold uppercase border-b border-purple-500/20 flex items-center justify-between">
                  <span>System Options</span>
                  <span className="text-slate-500 text-[9px]">v2.5</span>
                </div>

                {onOpenVoiceCommand && (
                  <button
                    type="button"
                    onClick={onOpenVoiceCommand}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-slate-200 hover:text-cyan-200 transition-colors text-left"
                  >
                    <Mic className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-[11.5px]">Voice Command HUD</div>
                      <div className="text-[9.5px] text-slate-400">Natural language voice operations</div>
                    </div>
                  </button>
                )}

                {onToggleCustomizeMode && (
                  <button
                    type="button"
                    onClick={onToggleCustomizeMode}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-slate-200 hover:text-purple-200 transition-colors text-left"
                  >
                    <Sliders className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-[11.5px]">{isCustomizeMode ? 'Exit Customizer' : 'Customize Dashboard'}</div>
                      <div className="text-[9.5px] text-slate-400">Rearrange and resize widgets</div>
                    </div>
                  </button>
                )}

                {onOpenProvidersModal && (
                  <button
                    type="button"
                    onClick={onOpenProvidersModal}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-slate-200 hover:text-emerald-200 transition-colors text-left"
                  >
                    <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-[11.5px]">AI Engines &amp; Keys</div>
                      <div className="text-[9.5px] text-slate-400">{activeProvidersCount} active intelligence engines</div>
                    </div>
                  </button>
                )}

                {onOpenAgentsFleet && (
                  <button
                    type="button"
                    onClick={onOpenAgentsFleet}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-slate-200 hover:text-purple-200 transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-[11.5px]">Specialist Fleet Matrix</div>
                      <div className="text-[9.5px] text-slate-400">{activeAgentsCount}/{totalAgentsCount} agents active</div>
                    </div>
                  </button>
                )}

                {onOpenShortcutsModal && (
                  <button
                    type="button"
                    onClick={onOpenShortcutsModal}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-purple-900/40 text-slate-200 hover:text-purple-200 transition-colors text-left"
                  >
                    <Keyboard className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="flex-1">
                      <div className="font-bold text-[11.5px]">Tactical Shortcuts (?)</div>
                      <div className="text-[9.5px] text-slate-400">Keyboard bindings &amp; guide</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Action Icons (Shortcuts, Help, Settings) */}
          <div className="hidden sm:inline-flex items-center gap-0.5 text-slate-300 shrink-0 flex-nowrap">
            <button 
              type="button"
              onClick={onOpenCEOChat}
              className="p-1.5 rounded-md hover:text-purple-300 hover:bg-[#180e38] transition-colors relative cursor-pointer" 
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </button>
            <button 
              type="button"
              onClick={onOpenShortcutsModal}
              className="p-1.5 rounded-md hover:text-purple-300 hover:bg-[#180e38] transition-colors cursor-pointer" 
              title="Tactical Guide & Keyboard Shortcuts (?)"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={onOpenProvidersModal}
              className="p-1.5 rounded-md hover:text-purple-300 hover:bg-[#180e38] transition-colors cursor-pointer" 
              title="Configure AI Providers & Keys"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* CEO Agent Archon Profile Badge */}
          <button
            type="button"
            onClick={onOpenCEOChat}
            className="inline-flex items-center gap-1.5 pl-2 border-l border-purple-500/20 hover:opacity-90 transition-opacity shrink-0 cursor-pointer"
            title="ARCHON CEO Agent (Click to open AI Comms)"
          >
            <div className="w-7 h-7 rounded-lg border border-purple-400/60 overflow-hidden relative shadow-[0_0_10px_rgba(168,85,247,0.6)] bg-[#070114] shrink-0">
              <img
                src={archonBg}
                alt="CEO Archon"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="text-left shrink-0 hidden sm:block">
              <div className="text-[10.5px] font-mono font-bold text-white leading-none whitespace-nowrap">CEO AGENT</div>
              <div className="text-[9.5px] font-mono text-purple-300 leading-none mt-0.5 whitespace-nowrap">ARCHON</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
