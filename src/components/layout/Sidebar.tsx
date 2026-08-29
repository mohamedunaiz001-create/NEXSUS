import React from 'react';
import { ThemeMode } from '../../types';
import { ThemeSwitcher } from './ThemeSwitcher';
import cyberShieldCrystal from '../../assets/images/cyber_shield_crystal_1786988349819.jpg';
import { 
  LayoutDashboard, 
  MessageSquare, 
  PlaySquare, 
  Swords, 
  FolderArchive, 
  FileSearch, 
  FileText, 
  Clock, 
  Globe, 
  Crosshair, 
  ShieldAlert, 
  Network, 
  Bot, 
  Cpu, 
  GitFork, 
  Terminal, 
  Brain, 
  Workflow, 
  BarChart3, 
  Activity, 
  Settings,
  ChevronDown,
  Mic,
  Shield,
  Zap,
  Hexagon,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  activeNav: string;
  onSelectNav: (id: string) => void;
  onOpenCEOChat: () => void;
  onOpenVoiceCommand?: () => void;
  onOpenEvidenceModal?: () => void;
  onOpenProvidersModal?: () => void;
  onOpenAgentsFleet?: () => void;
  onOpenIOCExplorer?: () => void;
  evidenceCount?: number;
  currentTheme?: ThemeMode;
  onSelectTheme?: (theme: ThemeMode) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeNav, 
  onSelectNav, 
  onOpenCEOChat,
  onOpenVoiceCommand,
  onOpenEvidenceModal,
  onOpenProvidersModal,
  onOpenAgentsFleet,
  onOpenIOCExplorer,
  evidenceCount = 0,
  currentTheme = 'cyber-purple',
  onSelectTheme = () => {}
}) => {
  const navSections = [
    {
      title: 'AI COMMAND',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'voice-command', label: 'Voice Command', icon: Mic, action: onOpenVoiceCommand, badge: 'SPEECH' },
        { id: 'ceo-chat', label: 'CEO AI Chat', icon: MessageSquare, action: onOpenCEOChat },
        { id: 'playground', label: 'AI Playground', icon: PlaySquare },
        { id: 'battle-mode', label: 'AI Battle Mode', icon: Swords, badge: 'PRO' },
      ]
    },
    {
      title: 'INVESTIGATIONS',
      items: [
        { id: 'cases', label: 'Cases', icon: FolderArchive, count: '12' },
        { id: 'evidence', label: 'Evidence & Uploads', icon: FileSearch, action: onOpenEvidenceModal, count: `${evidenceCount}` },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'timeline', label: 'Timeline', icon: Clock },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'threat-intel', label: 'Threat Intel', icon: Globe },
        { id: 'ioc-explorer', label: 'IOC Explorer', icon: Crosshair, count: '148' },
        { id: 'mitre-browser', label: 'MITRE Browser', icon: ShieldAlert },
        { id: 'knowledge-graph', label: 'Knowledge Graph', icon: Network },
      ]
    },
    {
      title: 'AI OPERATIONS',
      items: [
        { id: 'agents', label: 'Agents', icon: Bot, action: onOpenAgentsFleet, count: '8' },
        { id: 'provider-hub', label: 'Provider Hub', icon: Cpu, action: onOpenProvidersModal },
        { id: 'model-routing', label: 'Model Routing', icon: GitFork, action: onOpenProvidersModal },
        { id: 'prompt-library', label: 'Prompt Library', icon: Terminal },
        { id: 'memory-center', label: 'Memory Center', icon: Brain },
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { id: 'workflows', label: 'Workflows', icon: Workflow },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'system-monitor', label: 'System Monitor', icon: Activity },
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside 
      id="main-cyber-sidebar"
      className="w-60 h-screen border-r flex flex-col justify-between select-none z-30 shrink-0 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--color-bg-sidebar)',
        borderColor: 'var(--color-panel-border)'
      }}
    >
      {/* Brand Header */}
      <div 
        className="p-3.5 lg:p-4 border-b border-purple-500/20 bg-[#090317] flex items-center gap-3"
      >
        {/* Cyber Logo Crest */}
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-purple-400/50 bg-[#0c0520] flex items-center justify-center p-0.5 shadow-[0_0_12px_rgba(168,85,247,0.6)] shrink-0">
          <img 
            src={cyberShieldCrystal} 
            alt="CyberResearch-X Crest" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="font-gothic font-bold text-[14px] tracking-widest text-white flex items-center gap-1">
            <span>CYBERRESEARCH</span>
            <span className="text-purple-400 font-black">-X</span>
          </div>
          <div className="text-[9px] font-mono tracking-widest text-purple-300/80 font-bold flex items-center gap-1">
            <span>❖</span>
            <span>SANCTUM OS</span>
            <span>❖</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2 text-[10px] font-mono uppercase tracking-widest text-purple-400/90 font-bold">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        onSelectNav(item.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-mono transition-all group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-900/90 via-purple-800/80 to-purple-950/90 text-white font-semibold border border-purple-400/60 shadow-[0_0_18px_rgba(168,85,247,0.5)]'
                        : 'text-slate-300/90 hover:text-white hover:bg-purple-950/40 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon 
                        className={`w-4 h-4 transition-colors ${isActive ? 'text-purple-200' : 'text-slate-400 group-hover:text-purple-300'}`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {/* Active sparkle dot */}
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-300 shadow-[0_0_6px_#c084fc]" />
                    )}

                    {/* Badges / Counts */}
                    {!isActive && item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-950/80 text-purple-300 border border-purple-500/30">
                        {item.badge}
                      </span>
                    )}
                    {!isActive && item.count && (
                      <span className="text-[10.5px] font-mono text-purple-400/80">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Brand Footer Artwork Card */}
      <div className="p-3 border-t border-purple-500/20 bg-[#06020e] flex flex-col items-center justify-center text-center space-y-2">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.5)] bg-[#0c0520] group cursor-pointer hover:border-purple-400 transition-all">
          <img 
            src={cyberShieldCrystal} 
            alt="CyberResearch-X Crystal Shield" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06020e]/60 via-transparent to-transparent" />
        </div>

        <div className="space-y-0.5">
          <div className="font-serif font-bold text-[12px] tracking-wider text-white">
            CYBERRESEARCH-X
          </div>
          <div className="text-[8.5px] font-mono text-purple-300/80 uppercase tracking-wider leading-tight">
            EVERY BYTE TELLS A STORY<br />
            <span className="text-purple-200 font-bold">LET&apos;S UNCOVER IT</span>
          </div>
        </div>

        {/* 4 Bottom Hex Badges from Screenshot */}
        <div className="flex items-center justify-center gap-1.5 pt-1 w-full border-t border-purple-500/10">
          <button 
            type="button"
            onClick={onOpenProvidersModal}
            className="p-1.5 rounded-md bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/30 text-purple-300 hover:text-white transition-all text-xs"
            title="Active Defenses"
          >
            <Shield className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={onOpenAgentsFleet}
            className="p-1.5 rounded-md bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/30 text-purple-300 hover:text-white transition-all text-xs"
            title="Agent Fleet"
          >
            <Bot className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={onOpenVoiceCommand}
            className="p-1.5 rounded-md bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/30 text-purple-300 hover:text-white transition-all text-xs"
            title="Voice Terminal"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
          <button 
            type="button"
            onClick={onOpenEvidenceModal}
            className="p-1.5 rounded-md bg-purple-950/50 hover:bg-purple-900/70 border border-purple-500/30 text-purple-300 hover:text-white transition-all text-xs"
            title="Evidence Vault"
          >
            <Zap className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
