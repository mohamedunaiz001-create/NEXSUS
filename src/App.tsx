import React, { useState, useEffect } from 'react';
import { 
  INITIAL_CEO, 
  INITIAL_AGENTS, 
  INITIAL_MISSION, 
  INITIAL_ACTIVITIES, 
  INITIAL_IOCS, 
  INITIAL_CASES, 
  INITIAL_PROVIDERS, 
  INITIAL_STREAM_EVENTS,
  INITIAL_ARTIFACTS
} from './data/mockData';
import { SpecialistAgent, CaseItem, IOCItem, CEONode, MissionData, ThemeMode, EvidenceArtifact, AIProvider } from './types';
import { SearchItemType } from './utils/searchIndex';
import { stripApiKeys } from './utils/security';
import { initializeSession } from './utils/apiClient';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { EmergencyBanner } from './components/layout/EmergencyBanner';

// Dashboard Layout Customization & Widgets
import { useDashboardLayout } from './hooks/useDashboardLayout';
import { WidgetRenderer } from './components/dashboard/WidgetRenderer';
import { CustomizeModeBanner } from './components/dashboard/CustomizeModeBanner';
import { DashboardLayoutModal } from './components/dashboard/DashboardLayoutModal';
import { EventStream } from './components/command-center/EventStream';

// Interactive Modals & Drawers
import { AgentDetailModal } from './components/modals/AgentDetailModal';
import { CEOChatDrawer } from './components/modals/CEOChatDrawer';
import { CaseDetailModal } from './components/modals/CaseDetailModal';
import { IOCDetailModal } from './components/modals/IOCDetailModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { EvidenceUploadModal } from './components/modals/EvidenceUploadModal';
import { AIProvidersModal } from './components/modals/AIProvidersModal';
import { NewCaseModal } from './components/modals/NewCaseModal';
import { VoiceCommandHUD } from './components/voice/VoiceCommandHUD';
import { TacticalShortcutsModal } from './components/modals/TacticalShortcutsModal';
import { AgentsFleetModal } from './components/modals/AgentsFleetModal';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { exportLogsToFile } from './utils/logExporter';
import {
  PlaygroundPage, BattleModePage, PromptLibraryPage, MemoryCenterPage,
} from './components/pages/AIPages';
import { CasesPage, ReportsPage, TimelinePage } from './components/pages/InvestigationPages';
import { ThreatIntelPage, IOCExplorerPage, MitreBrowserPage, KnowledgeGraphPage } from './components/pages/IntelPages';
import { WorkflowsPage, AnalyticsPage, SystemMonitorPage, SettingsPage } from './components/pages/OperationsPages';

export default function App() {
  // Theme State with persistence
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('nexsus_clean_theme');
    if (saved === 'deep-emerald' || saved === 'crimson-alert' || saved === 'cyber-purple') {
      return saved;
    }
    return 'cyber-purple';
  });

  // Threat & Emergency Override State with LocalStorage persistence
  const [threatScore, setThreatScore] = useState<number>(() => {
    const saved = localStorage.getItem('nexsus_clean_threat_score');
    return saved ? Number(saved) : 0;
  });
  const [threatThreshold, setThreatThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('nexsus_clean_threat_threshold');
    return saved ? Number(saved) : 80;
  });
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  // Compute if Emergency Mode is Active
  const isEmergencyActive = isManualOverride || threatScore >= threatThreshold;
  const threatLevelLabel = threatScore >= 90 ? 'CRITICAL' : threatScore >= 75 ? 'HIGH' : threatScore >= 50 ? 'ELEVATED' : 'NOMINAL';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('nexsus_clean_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-emergency', isEmergencyActive ? 'true' : 'false');
    document.body.setAttribute('data-emergency', isEmergencyActive ? 'true' : 'false');
  }, [isEmergencyActive]);

  useEffect(() => {
    localStorage.setItem('nexsus_clean_threat_score', String(threatScore));
  }, [threatScore]);

  useEffect(() => {
    localStorage.setItem('nexsus_clean_threat_threshold', String(threatThreshold));
  }, [threatThreshold]);

  // Navigation & Modal State
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInitialFilter, setSearchInitialFilter] = useState<SearchItemType | 'all'>('all');
  const [isCEOChatOpen, setIsCEOChatOpen] = useState(false);
  const [ceoChatPrompt, setCeoChatPrompt] = useState<string | undefined>(undefined);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [isProvidersModalOpen, setIsProvidersModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isVoiceHUDOpen, setIsVoiceHUDOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAgentsFleetModalOpen, setIsAgentsFleetModalOpen] = useState(false);

  const handleOpenSearchWithFilter = (filter: SearchItemType | 'all' = 'all') => {
    setSearchInitialFilter(filter);
    setIsSearchOpen(true);
  };

  // Dashboard Layout Management with Drag-and-Drop & LocalStorage persistence
  const {
    widgets,
    mainWidgets,
    sidebarWidgets,
    isCustomizeMode,
    isLayoutModalOpen,
    draggedWidgetId,
    dragOverWidgetId,
    toggleCustomizeMode,
    setIsCustomizeMode,
    openLayoutModal,
    closeLayoutModal,
    toggleWidgetVisibility,
    updateWidgetWidth,
    switchWidgetSection,
    moveWidget,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDragEnd,
    handleDrop,
    resetLayout,
    applyPreset,
    setWidgets
  } = useDashboardLayout();
  
  // Selected items for modal inspection
  const [selectedAgent, setSelectedAgent] = useState<SpecialistAgent | null>(null);
  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(null);
  const [selectedIOC, setSelectedIOC] = useState<IOCItem | null>(null);

  // Core Dynamic Data with LocalStorage Persistence
  const [ceo, setCeo] = useState<CEONode>(() => {
    try {
      const saved = localStorage.getItem('nexsus_clean_ceo_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_CEO, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved CEO state', e);
    }
    return INITIAL_CEO;
  });
  const [agents, setAgents] = useState<SpecialistAgent[]>(INITIAL_AGENTS);
  const [mission, setMission] = useState<MissionData>(INITIAL_MISSION);
  const [activities] = useState(INITIAL_ACTIVITIES);
  const [iocs] = useState(INITIAL_IOCS);
  const [cases, setCases] = useState(INITIAL_CASES);
  
  // AI Providers with LocalStorage persistence (Secrets strictly stripped)
  const [providers, setProviders] = useState<AIProvider[]>(() => {
    try {
      const saved = localStorage.getItem('nexsus_clean_ai_providers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = stripApiKeys(parsed);
          localStorage.setItem('nexsus_clean_ai_providers', JSON.stringify(sanitized));
          return sanitized;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved AI providers', e);
    }
    return stripApiKeys(INITIAL_PROVIDERS);
  });

  const [streamEvents, setStreamEvents] = useState(INITIAL_STREAM_EVENTS);
  const [artifacts, setArtifacts] = useState<EvidenceArtifact[]>(INITIAL_ARTIFACTS);

  // Update CEO state and persist
  const handleUpdateCeo = (updates: Partial<CEONode>) => {
    setCeo(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('nexsus_clean_ceo_state', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist CEO state', e);
      }
      return updated;
    });

    if (updates.model) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStreamEvents(prev => [
        {
          id: `st-${Date.now()}`,
          timestamp: timeStr,
          message: `Commander ARCHON primary neural engine shifted to ${updates.model} [Context: ${updates.contextWindow || '200K'}]`,
          type: 'info',
          category: 'system',
          source: 'CEO ARCHON'
        },
        ...prev
      ]);
    }
  };

  // Update AI Providers and persist without sensitive keys
  const handleUpdateProviders = (updated: AIProvider[]) => {
    const sanitized = stripApiKeys(updated);
    setProviders(sanitized);
    try {
      localStorage.setItem('nexsus_clean_ai_providers', JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to persist AI providers', e);
    }
  };

  const handleSelectPrimaryModel = (providerName: string, modelName: string) => {
    setCeo(prev => ({
      ...prev,
      model: `${providerName} (${modelName})`
    }));

    // Add stream event notification
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setStreamEvents(prev => [
      {
        id: `st-${Date.now()}`,
        timestamp: timeStr,
        message: `Commander ARCHON primary AI engine shifted to ${providerName} [${modelName}]`,
        type: 'info',
        category: 'system',
        source: 'CEO ARCHON'
      },
      ...prev
    ]);
  };

  // Bootstrap operator session on mount
  useEffect(() => {
    initializeSession();
  }, []);

  // Global Keyboard Shortcuts (⌘K, Shift+V, Shift+C, Shift+N, Shift+L, Shift+E, Shift+P, Shift+D, Shift+X, ?, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut triggers if the user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
        return;
      }

      // If user presses Escape, dismiss any open modals
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsCEOChatOpen(false);
        setIsEvidenceModalOpen(false);
        setIsProvidersModalOpen(false);
        setIsNewCaseModalOpen(false);
        setIsVoiceHUDOpen(false);
        setIsShortcutsModalOpen(false);
        setIsAgentsFleetModalOpen(false);
        setSelectedAgent(null);
        setSelectedCase(null);
        setSelectedIOC(null);
        return;
      }

      if (isInput) return;

      // Question mark (?) for Tactical Shortcuts Help
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
        return;
      }

      // Shift key shortcuts
      if (e.shiftKey) {
        if (e.key === 'V' || e.key === 'v') {
          e.preventDefault();
          setIsVoiceHUDOpen(prev => !prev);
        } else if (e.key === 'C' || e.key === 'c') {
          e.preventDefault();
          setIsCEOChatOpen(prev => !prev);
        } else if (e.key === 'N' || e.key === 'n') {
          e.preventDefault();
          setIsNewCaseModalOpen(prev => !prev);
        } else if (e.key === 'L' || e.key === 'l') {
          e.preventDefault();
          toggleCustomizeMode();
        } else if (e.key === 'E' || e.key === 'e') {
          e.preventDefault();
          setIsEvidenceModalOpen(prev => !prev);
        } else if (e.key === 'P' || e.key === 'p') {
          e.preventDefault();
          setIsProvidersModalOpen(prev => !prev);
        } else if (e.key === 'D' || e.key === 'd') {
          e.preventDefault();
          handleToggleEmergencyOverride();
        } else if (e.key === 'X' || e.key === 'x') {
          e.preventDefault();
          handleExportLogs('json');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleCustomizeMode, isEmergencyActive]);

  const handleToggleEmergencyOverride = () => {
    if (isEmergencyActive) {
      setIsManualOverride(false);
      setThreatScore(prev => Math.min(prev, 65));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStreamEvents(prev => [
        {
          id: `st-${Date.now()}`,
          timestamp: timeStr,
          message: `OPERATOR ACTION: Emergency Override manually DISENGAGED. Threat telemetry returned to baseline.`,
          type: 'info',
          category: 'system',
          source: 'OPERATOR'
        },
        ...prev
      ]);
    } else {
      setIsManualOverride(true);
      setThreatScore(prev => Math.max(prev, 96));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setStreamEvents(prev => [
        {
          id: `st-${Date.now()}`,
          timestamp: timeStr,
          message: `🚨 DEFCON 1 EMERGENCY OVERRIDE TRIGGERED: Full spectrum lockdown initialized across all SOC nodes.`,
          type: 'alert',
          category: 'threat',
          source: 'DEFCON-1'
        },
        ...prev
      ]);
    }
  };

  const handleDeployCountermeasures = () => {
    setIsManualOverride(false);
    setThreatScore(38);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setStreamEvents(prev => [
      {
        id: `st-${Date.now()}`,
        timestamp: timeStr,
        message: `🛡️ AUTOMATED COUNTERMEASURES EXECUTED: 8 Specialist Agents deployed synchronized containment routines. Threat suppressed (96% -> 38%).`,
        type: 'action',
        category: 'forensics',
        source: 'ARCHON & AGENTS'
      },
      ...prev
    ]);
  };

  const handleLockdownPorts = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setStreamEvents(prev => [
      {
        id: `st-${Date.now()}`,
        timestamp: timeStr,
        message: `🔒 NETWORK BLACKOUT ENGAGED: Ingress/egress ports 443, 8080, 22, 3389 isolated. All C2 beacons blocked.`,
        type: 'alert',
        category: 'network',
        source: 'CIPHER-NET'
      },
      ...prev
    ]);
  };

  const handleRunAgentTask = (agentId: string, task: string) => {
    setAgents(prev => prev.map(a => {
      if (a.id === agentId) {
        return {
          ...a,
          currentTask: task,
          progress: Math.min(100, a.progress + 15),
          tasksCompleted: a.tasksCompleted + 1
        };
      }
      return a;
    }));
  };

  const handleOpenCaseById = (caseId: string) => {
    const found = cases.find(c => c.caseNumber === caseId) || cases[0];
    setSelectedCase(found);
  };

  const handleCreateCase = (newCase: CaseItem, assignedAgent: SpecialistAgent) => {
    setCases(prev => [newCase, ...prev]);

    // Update assigned specialist agent task and execution log
    setAgents(prev => prev.map(a => {
      if (a.id === assignedAgent.id) {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return {
          ...a,
          currentTask: `Investigating ${newCase.caseNumber}: ${newCase.title.slice(0, 32)}...`,
          progress: 15,
          status: 'ANALYZING' as const,
          tasksCompleted: a.tasksCompleted + 1,
          lastActive: nowStr,
          lastLog: {
            timestamp: nowStr,
            action: `Dispatched to ${newCase.caseNumber} - ${newCase.title}`
          },
          systemLogs: [
            {
              id: `log-${Date.now()}`,
              timestamp: nowStr,
              level: 'EXEC' as const,
              message: `Auto-Assigned incident ${newCase.caseNumber} [${newCase.severity}] (${newCase.iocCount} IOCs)`
            },
            ...(a.systemLogs || [])
          ]
        };
      }
      return a;
    }));

    // Stream real-time dispatch event
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setStreamEvents(prev => [
      {
        id: `st-${Date.now()}`,
        timestamp: timeStr,
        message: `🎯 AUTO-ASSIGN DISPATCH: ${newCase.caseNumber} ("${newCase.title}") allocated to ${assignedAgent.name} [Confidence: ${newCase.confidence}%]`,
        type: 'action',
        category: 'forensics',
        source: 'AI WORKLOAD ROUTER'
      },
      ...prev
    ]);
  };

  const handleReassignCaseAgent = (caseId: string, agentName: string) => {
    setCases(prev => prev.map(c => {
      if (c.caseNumber === caseId || c.id === caseId) {
        return { ...c, assignedAgent: agentName };
      }
      return c;
    }));

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setStreamEvents(prev => [
      {
        id: `st-${Date.now()}`,
        timestamp: timeStr,
        message: `🔄 CASE REASSIGNED: ${caseId} transferred to specialist ${agentName}`,
        type: 'info',
        category: 'system',
        source: 'WORKLOAD ENGINE'
      },
      ...prev
    ]);
  };

  const handleUpdateCaseStatus = (caseId: string, newStatus: string) => {
    setCases(prev => prev.map(c => {
      if (c.caseNumber === caseId || c.id === caseId) {
        return { ...c, status: newStatus };
      }
      return c;
    }));
  };

  const handleAddArtifact = (newArtifact: EvidenceArtifact) => {
    setArtifacts(prev => [newArtifact, ...prev]);
  };

  const handleDeleteArtifact = (artifactId: string) => {
    setArtifacts(prev => prev.filter(a => a.id !== artifactId));
  };

  const handleExportLogs = (format: 'json' | 'csv' = 'json') => {
    exportLogsToFile(
      streamEvents,
      {
        format,
        scope: 'all',
        filterName: 'All',
        includeAuditHash: true,
        includeDiagnostics: true,
        threatScore
      },
      {
        agents,
        cases,
        threatScore
      }
    );
  };

  const handleSelectAgentByName = (rawName: string): boolean => {
    const clean = rawName.toLowerCase().replace(/agent/g, '').trim();
    const found = agents.find(a => 
      a.name.toLowerCase().includes(clean) || 
      a.role.toLowerCase().includes(clean) ||
      a.id.toLowerCase().includes(clean) ||
      (clean.includes('malware') && a.role.toLowerCase().includes('malware')) ||
      (clean.includes('ioc') && a.role.toLowerCase().includes('ioc')) ||
      (clean.includes('threat') && a.role.toLowerCase().includes('threat')) ||
      (clean.includes('network') && a.role.toLowerCase().includes('network')) ||
      (clean.includes('code') && a.role.toLowerCase().includes('code')) ||
      (clean.includes('report') && a.role.toLowerCase().includes('report')) ||
      (clean.includes('memory') && a.role.toLowerCase().includes('memory')) ||
      (clean.includes('verification') && a.role.toLowerCase().includes('verification'))
    );
    if (found) {
      setSelectedAgent(found);
      return true;
    }
    return false;
  };

  const handleSelectCaseByNumber = (caseNum: string): boolean => {
    const clean = caseNum.toLowerCase().replace(/case|incident|#/g, '').trim();
    const found = cases.find(c => c.caseNumber.toLowerCase().includes(clean) || c.id.toLowerCase().includes(clean));
    if (found) {
      setSelectedCase(found);
      return true;
    }
    return false;
  };

  const handleAddStreamLog = (message: string, type: 'info' | 'alert' | 'action' | 'threat' = 'info') => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setStreamEvents(prev => [
      {
        id: `st-${Date.now()}`,
        timestamp: timeStr,
        message,
        type,
        category: type === 'alert' ? 'threat' : type === 'action' ? 'forensics' : 'system',
        source: 'VOICE COMMAND'
      },
      ...prev
    ]);
  };

  // Web Speech API Voice Recognition Hook
  const voice = useVoiceRecognition({
    toggleEmergencyOverride: handleToggleEmergencyOverride,
    isEmergencyOverride: isEmergencyActive,
    deployCountermeasures: handleDeployCountermeasures,
    lockdownPorts: handleLockdownPorts,
    openNewCase: () => setIsNewCaseModalOpen(true),
    openCEOChat: (prompt) => {
      if (prompt) setCeoChatPrompt(prompt);
      setIsCEOChatOpen(true);
    },
    openEvidenceModal: () => setIsEvidenceModalOpen(true),
    openProvidersModal: () => setIsProvidersModalOpen(true),
    openSearch: (_initialQuery) => {
      setIsSearchOpen(true);
    },
    exportLogs: (format) => handleExportLogs(format || 'json'),
    toggleCustomizeMode: toggleCustomizeMode,
    resetLayout: resetLayout,
    selectAgentByName: handleSelectAgentByName,
    selectCaseByNumber: handleSelectCaseByNumber,
    setThreatThreshold: (val) => setThreatThreshold(val),
    addStreamLog: handleAddStreamLog
  });

  return (
    <div 
      id="app-root"
      data-theme={theme}
      className="relative flex h-screen w-screen overflow-hidden text-slate-100 font-sans transition-colors duration-500"
      style={{ backgroundColor: 'var(--color-bg-base)' }}
    >
      {/* Background Visual Layer */}
      <div className="absolute inset-0 cyber-grid opacity-75 pointer-events-none z-0" />
      
      {/* Emergency Mode Red Strobe Vignette */}
      {isEmergencyActive && (
        <div 
          id="emergency-vignette-layer"
          className="fixed inset-0 pointer-events-none z-20 emergency-vignette opacity-80 mix-blend-screen"
        />
      )}

      <div 
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0 transition-all duration-700" 
        style={{
          backgroundColor: isEmergencyActive
            ? 'rgba(244, 63, 94, 0.25)'
            : theme === 'deep-emerald' 
            ? 'rgba(16, 185, 129, 0.12)' 
            : theme === 'crimson-alert' 
            ? 'rgba(244, 63, 94, 0.14)' 
            : 'rgba(147, 51, 234, 0.18)'
        }}
      />
      {/* Central Gothic Purple Atmospheric Ambient Pulse */}
      <div 
        className="absolute top-1/4 left-1/3 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none z-0 transition-all duration-1000"
        style={{
          backgroundColor: isEmergencyActive
            ? 'rgba(225, 29, 72, 0.15)'
            : 'rgba(126, 34, 206, 0.12)'
        }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none z-0 transition-all duration-700" 
        style={{
          backgroundColor: isEmergencyActive
            ? 'rgba(225, 29, 72, 0.25)'
            : theme === 'deep-emerald' 
            ? 'rgba(6, 182, 212, 0.12)' 
            : theme === 'crimson-alert' 
            ? 'rgba(245, 158, 11, 0.12)' 
            : 'rgba(109, 40, 217, 0.16)'
        }}
      />

      {/* Global CRT Animated Scanline Overlay */}
      <div 
        id="global-crt-scanline-overlay"
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-[1] scanline-overlay opacity-60 mix-blend-overlay"
      />

      {/* 1. Left Sidebar with Theme Switcher & Provider Hub Trigger */}
      <Sidebar 
        activeNav={activeNav}
        onSelectNav={(navId) => {
          if (navId === 'evidence') {
            setIsEvidenceModalOpen(true);
          } else if (navId === 'provider-hub' || navId === 'model-routing') {
            setIsProvidersModalOpen(true);
          } else {
            setActiveNav(navId);
          }
        }}
        onOpenCEOChat={() => setIsCEOChatOpen(true)}
        onOpenVoiceCommand={() => setIsVoiceHUDOpen(true)}
        onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
        onOpenProvidersModal={() => setIsProvidersModalOpen(true)}
        onOpenAgentsFleet={() => setIsAgentsFleetModalOpen(true)}
        onOpenIOCExplorer={() => handleOpenSearchWithFilter('ioc')}
        evidenceCount={artifacts.length}
        currentTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* 2. Main Application Frame */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <TopBar 
          onOpenSearch={() => handleOpenSearchWithFilter('all')}
          onOpenCEOChat={() => setIsCEOChatOpen(true)}
          onOpenEvidenceUpload={() => setIsEvidenceModalOpen(true)}
          onOpenProvidersModal={() => setIsProvidersModalOpen(true)}
          onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
          onOpenNewCase={() => setIsNewCaseModalOpen(true)}
          onOpenVoiceCommand={() => setIsVoiceHUDOpen(true)}
          onOpenAgentsFleet={() => setIsAgentsFleetModalOpen(true)}
          onOpenSystemStatus={() => setIsAgentsFleetModalOpen(true)}
          isVoiceListening={voice.isListening}
          onToggleEmergencyOverride={handleToggleEmergencyOverride}
          onToggleCustomizeMode={toggleCustomizeMode}
          onOpenLayoutModal={openLayoutModal}
          isEmergencyOverride={isEmergencyActive}
          isCustomizeMode={isCustomizeMode}
          artifactsCount={artifacts.length}
          activeAgentsCount={agents.filter((a) => a.status !== 'OFFLINE' && a.status !== 'IDLE').length}
          totalAgentsCount={agents.length}
          threatLevel={threatLevelLabel}
          threatScore={threatScore}
          activeProvidersCount={providers.filter(p => p.enabled !== false).length}
        />

        {/* Global Emergency Override DEFCON-1 Banner */}
        {isEmergencyActive && (
          <EmergencyBanner 
            threatScore={threatScore}
            threatThreshold={threatThreshold}
            onDeployCountermeasures={handleDeployCountermeasures}
            onLockdownPorts={handleLockdownPorts}
            onDisengageOverride={handleToggleEmergencyOverride}
          />
        )}

        {/* Dashboard Layout Customizer Active Sticky Banner */}
        {isCustomizeMode && (
          <CustomizeModeBanner 
            widgets={widgets}
            onOpenManagerModal={openLayoutModal}
            onResetLayout={resetLayout}
            onExitCustomize={() => setIsCustomizeMode(false)}
          />
        )}

        {/* Center + Right Intelligence Content Area */}
        <main className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-dynamic">
          {activeNav === 'playground' ? (
            <PlaygroundPage providers={providers} ceo={ceo} onOpenProvidersModal={() => setIsProvidersModalOpen(true)} />
          ) : activeNav === 'battle-mode' ? (
            <BattleModePage providers={providers} />
          ) : activeNav === 'prompt-library' ? (
            <PromptLibraryPage />
          ) : activeNav === 'memory-center' ? (
            <MemoryCenterPage agents={agents} ceo={ceo} />
          ) : activeNav === 'cases' ? (
            <CasesPage cases={cases} onSelectCase={setSelectedCase} onNewCase={() => setIsNewCaseModalOpen(true)} />
          ) : activeNav === 'reports' ? (
            <ReportsPage cases={cases} onSelectCase={setSelectedCase} onExportLogs={() => handleExportLogs('json')} />
          ) : activeNav === 'timeline' ? (
            <TimelinePage activities={activities} streamEvents={streamEvents} />
          ) : activeNav === 'threat-intel' ? (
            <ThreatIntelPage iocs={iocs} activities={activities} />
          ) : activeNav === 'ioc-explorer' ? (
            <IOCExplorerPage iocs={iocs} onSelectIOC={setSelectedIOC} />
          ) : activeNav === 'mitre-browser' ? (
            <MitreBrowserPage />
          ) : activeNav === 'knowledge-graph' ? (
            <KnowledgeGraphPage cases={cases} iocs={iocs} />
          ) : activeNav === 'workflows' ? (
            <WorkflowsPage cases={cases} agents={agents} onOpenNewCase={() => setIsNewCaseModalOpen(true)} onSelectCase={setSelectedCase} />
          ) : activeNav === 'analytics' ? (
            <AnalyticsPage agents={agents} cases={cases} iocs={iocs} providers={providers} />
          ) : activeNav === 'system-monitor' ? (
            <SystemMonitorPage agents={agents} providers={providers} streamEvents={streamEvents} threatScore={threatScore} threatLevelLabel={threatLevelLabel} isEmergencyActive={isEmergencyActive} />
          ) : activeNav === 'settings' ? (
            <SettingsPage theme={theme} onSelectTheme={setTheme} threatThreshold={threatThreshold} onSetThreatThreshold={setThreatThreshold} isEmergencyActive={isEmergencyActive} onToggleEmergencyOverride={handleToggleEmergencyOverride} onResetLayout={resetLayout} onExportLogs={handleExportLogs} onOpenProvidersModal={() => setIsProvidersModalOpen(true)} onOpenAgentsFleet={() => setIsAgentsFleetModalOpen(true)} />
          ) : (
          <div className="grid grid-cols-1 xl:grid-cols-12 grid-gap-dynamic items-start">
            {/* Center Main Operational Column */}
            {mainWidgets.length > 0 && (
              <div className={`${sidebarWidgets.length > 0 ? 'xl:col-span-9' : 'xl:col-span-12'} space-y-3`}>
                <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3 items-start">
                  {mainWidgets.map((config) => (
                    <WidgetRenderer 
                      key={config.id}
                      config={config}
                      isCustomizeMode={isCustomizeMode}
                      isDragging={draggedWidgetId === config.id}
                      isDragOver={dragOverWidgetId === config.id}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onToggleVisibility={toggleWidgetVisibility}
                      onMoveUp={(id) => moveWidget(id, 'up')}
                      onMoveDown={(id) => moveWidget(id, 'down')}
                      onSwitchSection={switchWidgetSection}
                      onChangeWidth={updateWidgetWidth}
                      ceo={ceo}
                      agents={agents}
                      mission={mission}
                      cases={cases}
                      iocs={iocs}
                      activities={activities}
                      providers={providers}
                      threatScore={threatScore}
                      threatLevelLabel={threatLevelLabel}
                      threatThreshold={threatThreshold}
                      isEmergencyActive={isEmergencyActive}
                      onOpenCEOChat={(prompt) => {
                        setCeoChatPrompt(prompt);
                        setIsCEOChatOpen(true);
                      }}
                      onSelectAgent={(a) => setSelectedAgent(a)}
                      onSelectCase={(c) => setSelectedCase(c)}
                      onSelectIOC={(i) => setSelectedIOC(i)}
                      onOpenCaseById={handleOpenCaseById}
                      onUpdateCaseStatus={handleUpdateCaseStatus}
                      onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
                      onOpenProvidersModal={() => setIsProvidersModalOpen(true)}
                      onToggleEmergencyOverride={handleToggleEmergencyOverride}
                      onSetThreatScore={(s) => setThreatScore(s)}
                      onSetThreatThreshold={(t) => setThreatThreshold(t)}
                      onDeployCountermeasures={handleDeployCountermeasures}
                      onOpenSearch={() => handleOpenSearchWithFilter('all')}
                      onOpenIOCExplorer={() => handleOpenSearchWithFilter('ioc')}
                      onOpenNewCase={() => setIsNewCaseModalOpen(true)}
                      onUpdateCeo={handleUpdateCeo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Right-Side Persistent Intelligence Column */}
            {sidebarWidgets.length > 0 && (
              <div className={`${mainWidgets.length > 0 ? 'xl:col-span-3' : 'xl:col-span-12'} space-y-3`}>
                {sidebarWidgets.map((config) => (
                  <WidgetRenderer 
                    key={config.id}
                    config={config}
                    isCustomizeMode={isCustomizeMode}
                    isDragging={draggedWidgetId === config.id}
                    isDragOver={dragOverWidgetId === config.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onToggleVisibility={toggleWidgetVisibility}
                    onMoveUp={(id) => moveWidget(id, 'up')}
                    onMoveDown={(id) => moveWidget(id, 'down')}
                    onSwitchSection={switchWidgetSection}
                    onChangeWidth={updateWidgetWidth}
                    ceo={ceo}
                    agents={agents}
                    mission={mission}
                    cases={cases}
                    iocs={iocs}
                    activities={activities}
                    providers={providers}
                    threatScore={threatScore}
                    threatLevelLabel={threatLevelLabel}
                    threatThreshold={threatThreshold}
                    isEmergencyActive={isEmergencyActive}
                    onOpenCEOChat={(prompt) => {
                      setCeoChatPrompt(prompt);
                      setIsCEOChatOpen(true);
                    }}
                    onSelectAgent={(a) => setSelectedAgent(a)}
                    onSelectCase={(c) => setSelectedCase(c)}
                    onSelectIOC={(i) => setSelectedIOC(i)}
                    onOpenCaseById={handleOpenCaseById}
                    onUpdateCaseStatus={handleUpdateCaseStatus}
                    onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
                    onOpenProvidersModal={() => setIsProvidersModalOpen(true)}
                    onToggleEmergencyOverride={handleToggleEmergencyOverride}
                    onSetThreatScore={(s) => setThreatScore(s)}
                    onSetThreatThreshold={(t) => setThreatThreshold(t)}
                    onDeployCountermeasures={handleDeployCountermeasures}
                    onOpenSearch={() => handleOpenSearchWithFilter('all')}
                    onOpenIOCExplorer={() => handleOpenSearchWithFilter('ioc')}
                    onOpenNewCase={() => setIsNewCaseModalOpen(true)}
                    onUpdateCeo={handleUpdateCeo}
                  />
                ))}
              </div>
            )}
          </div>
          )}
        </main>

        {/* 3. Bottom Live Event Stream */}
        <EventStream 
          events={streamEvents} 
          agents={agents}
          cases={cases}
          threatScore={threatScore}
        />
      </div>

      {/* 4. Interactive Drawers & Dialog Modals */}
      <CEOChatDrawer 
        isOpen={isCEOChatOpen}
        onClose={() => {
          setIsCEOChatOpen(false);
          setCeoChatPrompt(undefined);
        }}
        ceo={ceo}
        initialPrompt={ceoChatPrompt}
        onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
        onAddArtifact={handleAddArtifact}
      />

      <AgentDetailModal 
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onRunTask={handleRunAgentTask}
      />

      <CaseDetailModal 
        caseData={selectedCase}
        onClose={() => setSelectedCase(null)}
        agents={agents}
        existingCases={cases}
        onReassignAgent={handleReassignCaseAgent}
        onUpdateStatus={handleUpdateCaseStatus}
      />

      <IOCDetailModal 
        ioc={selectedIOC}
        onClose={() => setSelectedIOC(null)}
      />

      <CommandPalette 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        initialFilter={searchInitialFilter}
        agents={agents}
        cases={cases}
        iocs={iocs}
        artifacts={artifacts}
        ceo={ceo}
        providers={providers}
        onSelectAgent={(a) => setSelectedAgent(a)}
        onSelectCase={(c) => setSelectedCase(c)}
        onSelectIOC={(i) => setSelectedIOC(i)}
        onOpenCEOChat={(prompt) => {
          setCeoChatPrompt(prompt);
          setIsCEOChatOpen(true);
        }}
        onOpenNewCase={() => setIsNewCaseModalOpen(true)}
        onExportLogs={handleExportLogs}
        onOpenVoiceCommand={() => setIsVoiceHUDOpen(true)}
        onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
        onOpenProvidersModal={() => setIsProvidersModalOpen(true)}
        onToggleEmergencyOverride={handleToggleEmergencyOverride}
        onToggleCustomizeLayout={toggleCustomizeMode}
        onOpenLayoutModal={openLayoutModal}
      />

      {/* Voice Command Natural Language Operator HUD */}
      <VoiceCommandHUD
        voice={voice}
        isOpen={isVoiceHUDOpen}
        onClose={() => setIsVoiceHUDOpen(false)}
      />

      {/* Incident Intake & Auto-Assign Specialist Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        agents={agents}
        existingCases={cases}
        onCreateCase={handleCreateCase}
      />

      {/* Evidence & Forensic Artifact Upload Modal */}
      <EvidenceUploadModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        artifacts={artifacts}
        agents={agents}
        onAddArtifact={handleAddArtifact}
        onDeleteArtifact={handleDeleteArtifact}
      />

      {/* AI Provider & API Key Integration Hub Modal */}
      <AIProvidersModal
        isOpen={isProvidersModalOpen}
        onClose={() => setIsProvidersModalOpen(false)}
        providers={providers}
        onUpdateProviders={handleUpdateProviders}
        onSelectPrimaryModel={handleSelectPrimaryModel}
      />

      {/* Dashboard Layout & Widget Manager Modal */}
      <DashboardLayoutModal
        isOpen={isLayoutModalOpen}
        onClose={closeLayoutModal}
        widgets={widgets}
        onUpdateWidgets={setWidgets}
        onResetLayout={resetLayout}
        onApplyPreset={applyPreset}
      />

      {/* Tactical Operator Playbook & Keyboard Shortcuts Guide Modal */}
      <TacticalShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onOpenVoiceCommand={() => setIsVoiceHUDOpen(true)}
        onOpenCEOChat={() => setIsCEOChatOpen(true)}
        onOpenNewCase={() => setIsNewCaseModalOpen(true)}
        onOpenEvidence={() => setIsEvidenceModalOpen(true)}
        onOpenProviders={() => setIsProvidersModalOpen(true)}
        onToggleCustomize={toggleCustomizeMode}
        onToggleEmergency={handleToggleEmergencyOverride}
        onOpenSearch={() => setIsSearchOpen(true)}
        onExportLogs={() => handleExportLogs('json')}
      />

      {/* Autonomous Specialist Fleet & Live Health Matrix Modal */}
      <AgentsFleetModal
        isOpen={isAgentsFleetModalOpen}
        onClose={() => setIsAgentsFleetModalOpen(false)}
        agents={agents}
        onSelectAgent={(agent) => setSelectedAgent(agent)}
        onRunAgentTask={handleRunAgentTask}
      />
    </div>
  );
}
