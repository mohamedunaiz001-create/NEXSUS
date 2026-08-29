import React, { useState, useRef, useEffect } from 'react';
import { CEONode } from '../../types';
import { Hexagon, Sparkles, Cpu, ChevronDown, Check, Search, Shield, Zap, Lock, Sliders, Database } from 'lucide-react';
import archonBg from '../../assets/images/archon_throne_bg_1786987761102.jpg';

export interface ModelOption {
  id: string;
  name: string;
  provider: string;
  category: 'Frontier' | 'Reasoning' | 'High-Speed' | 'Local / Air-Gapped';
  contextWindow: string;
  temperature: number;
  badge?: string;
  color: string;
}

export const ARCHON_MODELS: ModelOption[] = [
  // Frontier & Multimodal
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet (Hybrid Reasoning)', provider: 'Anthropic', category: 'Reasoning', contextWindow: '200K', temperature: 0.1, badge: 'FRONTIER', color: '#c084fc' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', category: 'Frontier', contextWindow: '200K', temperature: 0.2, badge: 'DEFAULT', color: '#a855f7' },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', category: 'High-Speed', contextWindow: '200K', temperature: 0.2, badge: 'FAST', color: '#9333ea' },
  
  // OpenAI & Reasoning
  { id: 'gpt-4o', name: 'GPT-4o (Omni Frontier)', provider: 'OpenAI', category: 'Frontier', contextWindow: '128K', temperature: 0.2, color: '#10b981' },
  { id: 'o1', name: 'OpenAI o1 (Deep Deliberation)', provider: 'OpenAI', category: 'Reasoning', contextWindow: '200K', temperature: 0.1, badge: 'REASONING', color: '#059669' },
  { id: 'o3-mini', name: 'OpenAI o3-mini (Cyber Security)', provider: 'OpenAI', category: 'Reasoning', contextWindow: '200K', temperature: 0.1, badge: 'NEW', color: '#34d399' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'OpenAI', category: 'High-Speed', contextWindow: '128K', temperature: 0.2, color: '#6ee7b7' },
  
  // Google Gemini
  { id: 'gemini-2-0-flash', name: 'Gemini 2.0 Flash (1M Context)', provider: 'Google', category: 'High-Speed', contextWindow: '1M', temperature: 0.2, badge: '1M TOKENS', color: '#60a5fa' },
  { id: 'gemini-2-0-pro', name: 'Gemini 2.0 Pro Experimental', provider: 'Google', category: 'Frontier', contextWindow: '2M', temperature: 0.2, badge: '2M TOKENS', color: '#3b82f6' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', provider: 'Google', category: 'Frontier', contextWindow: '2M', temperature: 0.2, color: '#2563eb' },
  
  // DeepSeek
  { id: 'deepseek-r1', name: 'DeepSeek-R1 (Open Reasoning)', provider: 'DeepSeek', category: 'Reasoning', contextWindow: '128K', temperature: 0.1, badge: 'REASONING', color: '#f59e0b' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3 671B MoE', provider: 'DeepSeek', category: 'Frontier', contextWindow: '128K', temperature: 0.2, color: '#d97706' },
  
  // xAI & Mistral
  { id: 'grok-2', name: 'Grok 2 (1212 Frontier)', provider: 'xAI', category: 'Frontier', contextWindow: '128K', temperature: 0.2, color: '#e2e8f0' },
  { id: 'mistral-large', name: 'Mistral Large 2407', provider: 'Mistral AI', category: 'Frontier', contextWindow: '128K', temperature: 0.2, color: '#fb923c' },
  { id: 'codestral-2501', name: 'Codestral 2501 (Cyber Auditing)', provider: 'Mistral AI', category: 'High-Speed', contextWindow: '256K', temperature: 0.1, color: '#f97316' },

  // Open Weights & Air-Gapped Local
  { id: 'llama-3-3-70b', name: 'Llama 3.3 70B Instruct', provider: 'Meta / Groq', category: 'High-Speed', contextWindow: '128K', temperature: 0.2, badge: 'LPU ACCELERATED', color: '#ec4899' },
  { id: 'ollama-llama-3-2', name: 'Ollama: Llama-3.2 (Air-Gapped)', provider: 'Local Ollama', category: 'Local / Air-Gapped', contextWindow: '32K', temperature: 0.0, badge: 'ZERO-EGRESS', color: '#cbd5e1' },
  { id: 'ollama-deepseek-r1', name: 'Ollama: DeepSeek-R1:14B', provider: 'Local Ollama', category: 'Local / Air-Gapped', contextWindow: '32K', temperature: 0.1, badge: 'AIR-GAPPED', color: '#94a3b8' }
];

interface CEOCommanderProps {
  ceo: CEONode;
  onOpenChat: () => void;
  onUpdateCeo?: (updates: Partial<CEONode>) => void;
}

// Ornate Cyber-Gothic Corner Filigree SVGs
const CornerFiligreeTL: React.FC = () => (
  <svg 
    className="absolute top-1.5 left-1.5 w-10 h-10 text-purple-400/80 pointer-events-none z-20" 
    viewBox="0 0 40 40" 
    fill="none"
  >
    <path d="M2 38V12C2 6.47715 6.47715 2 12 2H38" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 38V14C6 9.58172 9.58172 6 14 6H38" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
    <path d="M2 2L12 12" stroke="currentColor" strokeWidth="1" />
    <circle cx="2" cy="2" r="1.5" fill="currentColor" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <path d="M16 2L2 16" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
    <path d="M8 2V8H2" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const CornerFiligreeTR: React.FC = () => (
  <svg 
    className="absolute top-1.5 right-1.5 w-10 h-10 text-purple-400/80 pointer-events-none z-20" 
    viewBox="0 0 40 40" 
    fill="none"
  >
    <path d="M38 38V12C38 6.47715 33.5228 2 28 2H2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M34 38V14C34 9.58172 30.4183 6 26 6H2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
    <path d="M38 2L28 12" stroke="currentColor" strokeWidth="1" />
    <circle cx="38" cy="2" r="1.5" fill="currentColor" />
    <circle cx="28" cy="12" r="1.5" fill="currentColor" />
    <path d="M24 2L38 16" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
    <path d="M32 2V8H38" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const CornerFiligreeBL: React.FC = () => (
  <svg 
    className="absolute bottom-1.5 left-1.5 w-10 h-10 text-purple-400/80 pointer-events-none z-20" 
    viewBox="0 0 40 40" 
    fill="none"
  >
    <path d="M2 2V28C2 33.5228 6.47715 38 12 38H38" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 2V26C6 30.4183 9.58172 34 14 34H38" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
    <path d="M2 38L12 28" stroke="currentColor" strokeWidth="1" />
    <circle cx="2" cy="38" r="1.5" fill="currentColor" />
    <circle cx="12" cy="28" r="1.5" fill="currentColor" />
    <path d="M16 38L2 24" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
    <path d="M8 38V32H2" stroke="currentColor" strokeWidth="1" />
  </svg>
);

const CornerFiligreeBR: React.FC = () => (
  <svg 
    className="absolute bottom-1.5 right-1.5 w-10 h-10 text-purple-400/80 pointer-events-none z-20" 
    viewBox="0 0 40 40" 
    fill="none"
  >
    <path d="M38 2V28C38 33.5228 33.5228 38 28 38H2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M34 2V26C34 30.4183 30.4183 34 26 34H2" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.6" />
    <path d="M38 38L28 28" stroke="currentColor" strokeWidth="1" />
    <circle cx="38" cy="38" r="1.5" fill="currentColor" />
    <circle cx="28" cy="28" r="1.5" fill="currentColor" />
    <path d="M24 38L38 24" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
    <path d="M32 38V32H38" stroke="currentColor" strokeWidth="1" />
  </svg>
);

export const CEOCommander: React.FC<CEOCommanderProps> = ({ ceo, onOpenChat, onUpdateCeo }) => {
  // Dropdown states
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isTempDropdownOpen, setIsTempDropdownOpen] = useState(false);
  const [isContextDropdownOpen, setIsContextDropdownOpen] = useState(false);
  const [isMemoryDropdownOpen, setIsMemoryDropdownOpen] = useState(false);

  // Search & Filter in Model Dropdown
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const tempDropdownRef = useRef<HTMLDivElement>(null);
  const contextDropdownRef = useRef<HTMLDivElement>(null);
  const memoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
      if (tempDropdownRef.current && !tempDropdownRef.current.contains(event.target as Node)) {
        setIsTempDropdownOpen(false);
      }
      if (contextDropdownRef.current && !contextDropdownRef.current.contains(event.target as Node)) {
        setIsContextDropdownOpen(false);
      }
      if (memoryDropdownRef.current && !memoryDropdownRef.current.contains(event.target as Node)) {
        setIsMemoryDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModelDropdownOpen(false);
        setIsTempDropdownOpen(false);
        setIsContextDropdownOpen(false);
        setIsMemoryDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelectModel = (model: ModelOption) => {
    if (onUpdateCeo) {
      onUpdateCeo({
        model: model.name,
        contextWindow: model.contextWindow,
        temperature: model.temperature
      });
    }
    setIsModelDropdownOpen(false);
  };

  const handleSelectTemperature = (temp: number) => {
    if (onUpdateCeo) {
      onUpdateCeo({ temperature: temp });
    }
    setIsTempDropdownOpen(false);
  };

  const handleSelectContextWindow = (ctx: string) => {
    if (onUpdateCeo) {
      onUpdateCeo({ contextWindow: ctx });
    }
    setIsContextDropdownOpen(false);
  };

  const handleSelectMemoryMode = (mode: string) => {
    if (onUpdateCeo) {
      onUpdateCeo({ memoryMode: mode });
    }
    setIsMemoryDropdownOpen(false);
  };

  const filteredModels = ARCHON_MODELS.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'ALL') return matchesSearch;
    return matchesSearch && m.category === selectedCategory;
  });

  return (
    <div 
      id="ceo-commander-card"
      className="relative w-full rounded-2xl bg-[#070114] border border-purple-600/50 shadow-[0_0_35px_rgba(147,51,234,0.3)] select-none"
    >
      {/* 4 Ornate Cyber-Gothic Filigree Corners */}
      <CornerFiligreeTL />
      <CornerFiligreeTR />
      <CornerFiligreeBL />
      <CornerFiligreeBR />

      {/* Panoramic Throne & Hooded Sovereign Background Image */}
      <img
        src={archonBg}
        alt="Archon Sovereign on Gothic Throne"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-0 rounded-2xl"
      />

      {/* Atmospheric Vignette & Gradients for High Legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070114] via-[#070114]/65 to-transparent w-full md:w-3/5 z-0 pointer-events-none rounded-2xl" />
      <div className="absolute inset-0 bg-gradient-to-l from-[#070114] via-[#070114]/65 to-transparent w-full md:w-3/5 ml-auto z-0 pointer-events-none rounded-2xl" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#070114]/30 to-[#070114]/90 z-0 pointer-events-none rounded-2xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(7,1,20,0.65)_100%)] z-0 pointer-events-none rounded-2xl" />

      {/* Mystic Violet Ambient Glow Pulses */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-purple-600/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute -top-10 left-10 w-60 h-32 bg-fuchsia-600/15 rounded-full blur-2xl pointer-events-none z-0" />

      {/* Foreground Content Layout */}
      <div className="relative z-10 p-5 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center">
        {/* Left Column: Commander Title, Seraphic Name & Model Specs */}
        <div className="lg:col-span-6 space-y-3.5">
          <div>
            <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-mono text-purple-300 font-bold mb-1">
              CEO AGENT (COMMANDER)
            </div>
            
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-gothic tracking-[0.16em] font-bold text-white leading-tight drop-shadow-[0_0_25px_rgba(192,132,252,0.6)]">
                ARCHON
              </h1>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-fuchsia-300 px-2.5 py-0.5 rounded-full bg-purple-950/70 border border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.45)]">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
                SOVEREIGN ACTIVE
              </span>
            </div>

            <p className="text-xs sm:text-[13px] font-mono text-purple-200 mt-1 font-medium tracking-wide">
              The Strategist. The Orchestrator. The Decision Maker.
            </p>
            <p className="text-xs text-purple-300/80 font-sans mt-0.5 leading-relaxed max-w-lg">
              I delegate, analyze, and bring the best minds together to uncover the truth.
            </p>
          </div>

          {/* Model Specification Badges with Interactive Drag-down / Dropdown Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 relative">
            
            {/* 1. Interactive MODEL Badge & Dropdown */}
            <div ref={modelDropdownRef} className="relative">
              <button
                id="ceo-model-selector-btn"
                type="button"
                onClick={() => {
                  setIsModelDropdownOpen(!isModelDropdownOpen);
                  setIsTempDropdownOpen(false);
                  setIsContextDropdownOpen(false);
                  setIsMemoryDropdownOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg bg-[#0d041e]/90 border transition-all text-left shadow-sm cursor-pointer group ${
                  isModelDropdownOpen 
                    ? 'border-purple-400 ring-2 ring-purple-500/40 bg-[#160731]' 
                    : 'border-purple-500/35 hover:border-purple-400/80 hover:bg-[#120626]'
                }`}
                title="Click or drag down to switch primary model"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] sm:text-[8.5px] text-purple-400 font-mono uppercase block font-semibold tracking-wider group-hover:text-purple-300">
                    MODEL
                  </span>
                  <ChevronDown className={`w-3 h-3 text-purple-400 transition-transform duration-200 ${isModelDropdownOpen ? 'rotate-180 text-purple-200' : ''}`} />
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <Hexagon className="w-3 h-3 text-purple-400 shrink-0 fill-purple-400/20 group-hover:text-fuchsia-400" />
                  <span className="text-[11px] font-mono font-bold text-white tracking-tight truncate block group-hover:text-purple-100">
                    {ceo.model || 'Claude 3.5 Sonnet'}
                  </span>
                </div>
              </button>

              {/* Model Dropdown Menu (Old Ruin Gothic Relic Popover) */}
              {isModelDropdownOpen && (
                <div 
                  id="ceo-model-dropdown-menu"
                  className="absolute left-0 top-full mt-2 w-72 sm:w-84 max-w-[90vw] z-50 rounded-xl bg-[#090317]/98 border border-purple-500/60 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(168,85,247,0.35)] backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Dropdown Header & Search */}
                  <div className="p-2.5 bg-[#12052b] border-b border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-gothic font-bold text-purple-200 tracking-wider">
                        <Cpu className="w-3.5 h-3.5 text-purple-400" />
                        <span>SELECT ARCHON NEURAL ENGINE</span>
                      </div>
                      <span className="text-[9px] font-mono text-purple-400/80 font-bold px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/30">
                        {filteredModels.length} Models
                      </span>
                    </div>

                    {/* Quick Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-purple-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models (e.g. Claude, GPT-4o, DeepSeek)..."
                        className="w-full pl-8 pr-3 py-1.5 text-[11px] font-mono bg-[#070114] border border-purple-500/40 rounded-lg text-purple-100 placeholder:text-purple-400/50 focus:outline-none focus:border-purple-300 focus:ring-1 focus:ring-purple-400"
                        autoFocus
                      />
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[9px] font-mono">
                      {['ALL', 'Reasoning', 'Frontier', 'High-Speed', 'Local / Air-Gapped'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`px-2 py-0.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
                            selectedCategory === cat
                              ? 'bg-purple-600 text-white font-bold shadow-sm'
                              : 'bg-[#1a0b38] text-purple-300 hover:text-white hover:bg-purple-900/60'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Models List */}
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1 divide-y divide-purple-900/30">
                    {filteredModels.length === 0 ? (
                      <div className="py-6 text-center text-xs font-mono text-purple-400/70">
                        No neural models matched &quot;{searchQuery}&quot;
                      </div>
                    ) : (
                      filteredModels.map((model) => {
                        const isSelected = ceo.model === model.name || ceo.model?.includes(model.name);
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => handleSelectModel(model)}
                            className={`w-full p-2 rounded-lg text-left transition-all flex items-start justify-between gap-2 cursor-pointer group ${
                              isSelected
                                ? 'bg-purple-900/40 border border-purple-500/60 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                                : 'hover:bg-[#19093b]/70 hover:border-purple-500/30 border border-transparent'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-xs text-white group-hover:text-purple-200">
                                  {model.name}
                                </span>
                                {model.badge && (
                                  <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-950 border border-purple-500/40 text-purple-300">
                                    {model.badge}
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 text-[9.5px] font-mono text-purple-300/80">
                                <span className="text-purple-400 font-semibold">{model.provider}</span>
                                <span>•</span>
                                <span>Ctx: <strong className="text-white">{model.contextWindow}</strong></span>
                                <span>•</span>
                                <span>Temp: {model.temperature}</span>
                              </div>
                            </div>

                            {isSelected ? (
                              <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <span className="text-[10px] font-mono text-purple-400/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                Select
                              </span>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="p-2 bg-[#0d041e] border-t border-purple-500/30 flex items-center justify-between text-[9px] font-mono text-purple-400">
                    <span className="flex items-center gap-1">
                      <Shield className="w-3 h-3 text-purple-400" />
                      <span>Zero Egress Data Protection</span>
                    </span>
                    <span className="text-purple-300">Auto-syncs Context</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Interactive CONTEXT WINDOW Badge */}
            <div ref={contextDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsContextDropdownOpen(!isContextDropdownOpen);
                  setIsModelDropdownOpen(false);
                  setIsTempDropdownOpen(false);
                  setIsMemoryDropdownOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg bg-[#0d041e]/90 border transition-all text-left shadow-sm cursor-pointer group ${
                  isContextDropdownOpen 
                    ? 'border-purple-400 ring-2 ring-purple-500/40 bg-[#160731]' 
                    : 'border-purple-500/35 hover:border-purple-400/80 hover:bg-[#120626]'
                }`}
                title="Click to adjust context window size"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] sm:text-[8.5px] text-purple-400 font-mono uppercase block font-semibold tracking-wider group-hover:text-purple-300">
                    CONTEXT WINDOW
                  </span>
                  <ChevronDown className={`w-3 h-3 text-purple-400 transition-transform duration-200 ${isContextDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[11px] font-mono font-bold text-white tracking-tight block mt-0.5 group-hover:text-purple-100">
                  {ceo.contextWindow || '200K'}
                </span>
              </button>

              {/* Context Window Selector Popover */}
              {isContextDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-48 z-50 rounded-xl bg-[#090317]/98 border border-purple-500/60 shadow-2xl backdrop-blur-xl p-2 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="text-[9px] font-mono font-bold text-purple-300 px-1 py-0.5 border-b border-purple-500/20 mb-1">
                    MAX CONTEXT LIMIT
                  </div>
                  {['32K', '64K', '128K', '200K', '1M', '2M'].map((ctx) => (
                    <button
                      key={ctx}
                      type="button"
                      onClick={() => handleSelectContextWindow(ctx)}
                      className={`w-full px-2 py-1 rounded text-xs font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        ceo.contextWindow === ctx ? 'bg-purple-600 text-white font-bold' : 'text-purple-200 hover:bg-purple-900/50'
                      }`}
                    >
                      <span>{ctx} Tokens</span>
                      {ceo.contextWindow === ctx && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Interactive TEMPERATURE Badge */}
            <div ref={tempDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsTempDropdownOpen(!isTempDropdownOpen);
                  setIsModelDropdownOpen(false);
                  setIsContextDropdownOpen(false);
                  setIsMemoryDropdownOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg bg-[#0d041e]/90 border transition-all text-left shadow-sm cursor-pointer group ${
                  isTempDropdownOpen 
                    ? 'border-purple-400 ring-2 ring-purple-500/40 bg-[#160731]' 
                    : 'border-purple-500/35 hover:border-purple-400/80 hover:bg-[#120626]'
                }`}
                title="Click to adjust model temperature"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] sm:text-[8.5px] text-purple-400 font-mono uppercase block font-semibold tracking-wider group-hover:text-purple-300">
                    TEMPERATURE
                  </span>
                  <ChevronDown className={`w-3 h-3 text-purple-400 transition-transform duration-200 ${isTempDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[11px] font-mono font-bold text-white tracking-tight block mt-0.5 group-hover:text-purple-100">
                  {ceo.temperature ?? '0.2'}
                </span>
              </button>

              {/* Temperature Selector Popover */}
              {isTempDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-52 z-50 rounded-xl bg-[#090317]/98 border border-purple-500/60 shadow-2xl backdrop-blur-xl p-2 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="text-[9px] font-mono font-bold text-purple-300 px-1 py-0.5 border-b border-purple-500/20 mb-1">
                    INFERENCE TEMPERATURE
                  </div>
                  {[
                    { val: 0.0, label: '0.0 (Deterministic / Air-Gap)' },
                    { val: 0.1, label: '0.1 (Strict Reasoning)' },
                    { val: 0.2, label: '0.2 (Strategic Default)' },
                    { val: 0.5, label: '0.5 (Balanced Analysis)' },
                    { val: 0.7, label: '0.7 (Heuristic Search)' }
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => handleSelectTemperature(t.val)}
                      className={`w-full px-2 py-1 rounded text-[11px] font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        ceo.temperature === t.val ? 'bg-purple-600 text-white font-bold' : 'text-purple-200 hover:bg-purple-900/50'
                      }`}
                    >
                      <span>{t.label}</span>
                      {ceo.temperature === t.val && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Interactive MEMORY Badge */}
            <div ref={memoryDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsMemoryDropdownOpen(!isMemoryDropdownOpen);
                  setIsModelDropdownOpen(false);
                  setIsTempDropdownOpen(false);
                  setIsContextDropdownOpen(false);
                }}
                className={`w-full px-2.5 py-1.5 rounded-lg bg-[#0d041e]/90 border transition-all text-left shadow-sm cursor-pointer group ${
                  isMemoryDropdownOpen 
                    ? 'border-purple-400 ring-2 ring-purple-500/40 bg-[#160731]' 
                    : 'border-purple-500/35 hover:border-purple-400/80 hover:bg-[#120626]'
                }`}
                title="Click to adjust memory retention mode"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] sm:text-[8.5px] text-purple-400 font-mono uppercase block font-semibold tracking-wider group-hover:text-purple-300">
                    MEMORY
                  </span>
                  <ChevronDown className={`w-3 h-3 text-purple-400 transition-transform duration-200 ${isMemoryDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[11px] font-mono font-bold text-white tracking-tight block mt-0.5 group-hover:text-purple-100">
                  {ceo.memoryMode || 'Long-Term'}
                </span>
              </button>

              {/* Memory Mode Selector Popover */}
              {isMemoryDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 z-50 rounded-xl bg-[#090317]/98 border border-purple-500/60 shadow-2xl backdrop-blur-xl p-2 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="text-[9px] font-mono font-bold text-purple-300 px-1 py-0.5 border-b border-purple-500/20 mb-1">
                    MEMORY RETENTION
                  </div>
                  {[
                    { id: 'Long-Term', label: 'Long-Term (Qdrant Vector)' },
                    { id: 'Episodic RAG', label: 'Episodic RAG Vault' },
                    { id: 'Session-Only', label: 'Session-Only Ephemeral' },
                    { id: 'Full Sovereign Recall', label: 'Full Sovereign Recall' }
                  ].map((mem) => (
                    <button
                      key={mem.id}
                      type="button"
                      onClick={() => handleSelectMemoryMode(mem.id)}
                      className={`w-full px-2 py-1 rounded text-[11px] font-mono flex items-center justify-between transition-colors cursor-pointer ${
                        ceo.memoryMode === mem.id ? 'bg-purple-600 text-white font-bold' : 'text-purple-200 hover:bg-purple-900/50'
                      }`}
                    >
                      <span>{mem.label}</span>
                      {ceo.memoryMode === mem.id && <Check className="w-3 h-3" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Center Space: Allows the majestic hooded figure on throne to be seen clearly */}
        <div className="hidden lg:block lg:col-span-1" />

        {/* Right Column: CEO Mandate Box with Ornate Quotes & Action Button */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-[#0e0422]/85 border border-purple-500/40 rounded-xl p-4 sm:p-5 backdrop-blur-md shadow-[0_0_25px_rgba(168,85,247,0.2)] relative">
          {/* Ornate Quote Marks */}
          <span className="text-purple-400/60 text-3xl font-serif leading-none absolute top-2.5 left-3 pointer-events-none">
            “
          </span>
          <span className="text-purple-400/60 text-3xl font-serif leading-none absolute bottom-1.5 right-3 pointer-events-none">
            ”
          </span>

          <div className="pl-4 pr-2">
            <div className="text-[10.5px] sm:text-[11px] font-mono font-bold text-purple-300 uppercase tracking-widest mb-1.5">
              CEO MANDATE
            </div>
            <p className="text-xs sm:text-[12.5px] text-purple-100 font-sans leading-relaxed">
              &quot;{ceo.mandateQuote || 'Analyze the objective, break it down, assign to the right experts, validate findings, and deliver truth with precision.'}&quot;
            </p>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              id="open-ceo-chat-btn"
              type="button"
              onClick={onOpenChat}
              className="px-4 py-2 rounded-xl bg-[#180938]/90 hover:bg-[#281057] border border-purple-500/45 hover:border-purple-300 text-purple-100 hover:text-white font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-[0_0_16px_rgba(168,85,247,0.35)] active:scale-95 cursor-pointer"
            >
              <Hexagon className="w-3.5 h-3.5 text-purple-300 fill-purple-400/20" />
              <span>Open CEO Chat</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



