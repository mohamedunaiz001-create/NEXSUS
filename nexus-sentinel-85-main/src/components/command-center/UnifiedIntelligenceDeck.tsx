import React, { useState } from 'react';
import { CaseItem, SpecialistAgent, AIProvider } from '../../types';
import { 
  Globe, 
  Network, 
  FolderArchive, 
  BarChart3, 
  Cpu, 
  Maximize2, 
  Minimize2, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  Shield, 
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Filter
} from 'lucide-react';
import { CustomAgentIcon } from '../common/CustomAgentIcon';

interface UnifiedIntelligenceDeckProps {
  cases?: CaseItem[];
  agents?: SpecialistAgent[];
  providers?: AIProvider[];
  onSelectCase: (c: CaseItem) => void;
  onSelectAgent: (a: SpecialistAgent) => void;
  onOpenSearch: () => void;
  onOpenCEOChat: () => void;
}

export const UnifiedIntelligenceDeck: React.FC<UnifiedIntelligenceDeckProps> = ({
  cases = [],
  agents = [],
  providers = [],
  onSelectCase,
  onSelectAgent,
  onOpenSearch,
  onOpenCEOChat
}) => {
  // Visualizer Tab: 'threat-map' | 'knowledge-graph' | 'cases'
  const [visualizerTab, setVisualizerTab] = useState<'threat-map' | 'knowledge-graph' | 'cases'>('threat-map');
  
  // Analytics Tab: 'agent-performance' | 'ai-providers'
  const [analyticsTab, setAnalyticsTab] = useState<'agent-performance' | 'ai-providers'>('agent-performance');

  // Layout View: 'split' (side-by-side) | 'focus-viz' | 'focus-analytics'
  const [viewLayout, setViewLayout] = useState<'split' | 'focus-viz' | 'focus-analytics'>('split');

  // Filter for cases in the table
  const [caseFilter, setCaseFilter] = useState('ALL');

  const filteredCases = cases.filter(c => {
    if (caseFilter === 'ALL') return true;
    if (caseFilter === 'HIGH') return c.severity === 'High' || c.severity === 'Critical';
    if (caseFilter === 'ACTIVE') return c.status === 'In Progress';
    return true;
  });

  return (
    <div id="unified-intelligence-deck" className="w-full space-y-3">
      {/* Top Header & Layout Controls */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <span className="text-xs font-cyber font-bold text-purple-200 tracking-wider">
            COMMAND INTELLIGENCE MATRIX
          </span>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            • Spatial visualizer & operational telemetry
          </span>
        </div>

        {/* View Mode Controls */}
        <div className="flex items-center gap-1 bg-[#100726] border border-purple-500/25 p-0.5 rounded-lg text-[10px] font-mono">
          <button
            onClick={() => setViewLayout('split')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewLayout === 'split' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setViewLayout('focus-viz')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewLayout === 'focus-viz' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Spatial Map
          </button>
          <button
            onClick={() => setViewLayout('focus-analytics')}
            className={`px-2.5 py-1 rounded transition-colors ${
              viewLayout === 'focus-analytics' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Telemetry
          </button>
        </div>
      </div>

      {/* Main Grid: Responsive Split or Full Width Focus */}
      <div className={`grid gap-4 ${
        viewLayout === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
      }`}>
        
        {/* ================= PANEL 1: SPATIAL & KNOWLEDGE VISUALIZER ================= */}
        {(viewLayout === 'split' || viewLayout === 'focus-viz') && (
          <div className={`${viewLayout === 'split' ? 'lg:col-span-7' : 'w-full'} rounded-2xl bg-gradient-to-b from-[#11092a] to-[#0a0518] border border-purple-500/30 p-3.5 shadow-xl flex flex-col justify-between`}>
            
            {/* Panel Tabs Header */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-3">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setVisualizerTab('threat-map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    visualizerTab === 'threat-map' 
                      ? 'bg-purple-950/90 text-purple-200 border border-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#180e38]'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  <span>Threat Map (Live)</span>
                </button>

                <button
                  onClick={() => setVisualizerTab('knowledge-graph')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    visualizerTab === 'knowledge-graph' 
                      ? 'bg-purple-950/90 text-purple-200 border border-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#180e38]'
                  }`}
                >
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Knowledge Graph</span>
                </button>

                <button
                  onClick={() => setVisualizerTab('cases')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    visualizerTab === 'cases' 
                      ? 'bg-purple-950/90 text-purple-200 border border-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#180e38]'
                  }`}
                >
                  <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Recent Cases ({cases.length})</span>
                </button>
              </div>

              <button
                onClick={onOpenCEOChat}
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0 ml-2"
                title="Open analysis"
              >
                <span>Investigate</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* TAB CONTENT 1: Live Threat Map */}
            {visualizerTab === 'threat-map' && (
              <div className="space-y-2">
                <div className="relative h-64 lg:h-72 rounded-xl bg-[#060312] border border-purple-500/25 overflow-hidden flex items-center justify-center">
                  
                  {/* Cyber Coordinate Grid & Scanning Radar */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b076415_1px,transparent_1px),linear-gradient(to_bottom,#3b076415_1px,transparent_1px)] bg-[size:24px_24px]" />
                  <div className="absolute top-2 left-3 px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/30 text-[9.5px] font-mono text-purple-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>DEFCON INTERCEPT: 3 ACTIVE ATTACK VECTORS</span>
                  </div>

                  <svg viewBox="0 0 480 240" className="w-full h-full p-2 relative z-10">
                    {/* Lat/Long Gridlines */}
                    <path d="M0 60 H480 M0 120 H480 M0 180 H480" stroke="#3b1764" strokeWidth="0.75" strokeDasharray="3 3" />
                    <path d="M120 0 V240 M240 0 V240 M360 0 V240" stroke="#3b1764" strokeWidth="0.75" strokeDasharray="3 3" />

                    {/* Vector Continents */}
                    <path d="M60 48 L110 42 L145 72 L120 115 L80 108 L50 72 Z" fill="#1b0e38" stroke="#7e22ce" strokeWidth="1.2" />
                    <path d="M115 125 L155 138 L140 205 L115 215 L95 162 Z" fill="#1b0e38" stroke="#7e22ce" strokeWidth="1.2" />
                    <path d="M228 42 L288 36 L282 78 L216 72 Z" fill="#1b0e38" stroke="#7e22ce" strokeWidth="1.2" />
                    <path d="M216 90 L282 90 L294 156 L252 192 L210 132 Z" fill="#1b0e38" stroke="#7e22ce" strokeWidth="1.2" />
                    <path d="M294 42 L420 48 L408 120 L324 114 L294 78 Z" fill="#1b0e38" stroke="#7e22ce" strokeWidth="1.2" />
                    <path d="M360 156 L432 162 L414 210 L354 198 Z" fill="#1b0e38" stroke="#7e22ce" strokeWidth="1.2" />

                    {/* Laser Attack Trajectory Arcs */}
                    <path d="M90 65 Q 190 24 265 60" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 3" className="animate-pulse" />
                    <path d="M360 78 Q 260 12 110 85" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 3" />
                    <path d="M265 60 Q 310 120 385 175" fill="none" stroke="#38bdf8" strokeWidth="1.75" />

                    {/* Nodes & Pulse Rings */}
                    <circle cx="90" cy="65" r="5" fill="#f43f5e" />
                    <circle cx="90" cy="65" r="10" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                    <text x="90" y="85" fill="#ffffff" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">US-EAST (C2 Target)</text>

                    <circle cx="265" cy="60" r="4.5" fill="#a855f7" />
                    <circle cx="265" cy="60" r="9" stroke="#a855f7" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                    <text x="265" y="50" fill="#c084fc" fontSize="8" fontFamily="monospace" textAnchor="middle">NL (Relay Server)</text>

                    <circle cx="360" cy="78" r="4.5" fill="#f43f5e" />
                    <circle cx="360" cy="78" r="9" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" className="animate-ping" />
                    <text x="360" y="98" fill="#fca5a5" fontSize="8" fontFamily="monospace" textAnchor="middle">RU (APT28 Ingress)</text>
                  </svg>

                  <div className="absolute bottom-2 right-3 flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-[#0c061d]/90 px-2.5 py-1 rounded-md border border-purple-500/30">
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-rose-500" /> C2 Beaconing
                    </span>
                    <span className="flex items-center gap-1 text-purple-300">
                      <span className="w-2 h-2 rounded-full bg-purple-400" /> Lateral Movement
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: Knowledge Graph */}
            {visualizerTab === 'knowledge-graph' && (
              <div className="space-y-2">
                <div className="relative h-64 lg:h-72 rounded-xl bg-[#060312] border border-purple-500/25 overflow-hidden flex items-center justify-center">
                  <div className="absolute top-2 left-3 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-[9.5px] font-mono text-cyan-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span>GRAPH ONTOLOGY: CASE-2024-017 CLUSTER</span>
                  </div>

                  <svg viewBox="0 0 460 220" className="w-full h-full p-3">
                    {/* Interconnecting cyber graph lines */}
                    <line x1="230" y1="110" x2="120" y2="55" stroke="#7e22ce" strokeWidth="1.5" strokeDasharray="3 3" />
                    <line x1="230" y1="110" x2="340" y2="55" stroke="#7e22ce" strokeWidth="1.5" />
                    <line x1="230" y1="110" x2="100" y2="155" stroke="#7e22ce" strokeWidth="1.5" />
                    <line x1="230" y1="110" x2="355" y2="155" stroke="#7e22ce" strokeWidth="1.5" />
                    <line x1="230" y1="110" x2="230" y2="185" stroke="#7e22ce" strokeWidth="1.5" />
                    <line x1="120" y1="55" x2="100" y2="155" stroke="#4c1d95" strokeWidth="1" />
                    <line x1="340" y1="55" x2="355" y2="155" stroke="#4c1d95" strokeWidth="1" />

                    {/* Central Root Node */}
                    <circle cx="230" cy="110" r="28" fill="#2d1254" stroke="#c084fc" strokeWidth="2.5" />
                    <text x="230" y="106" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">CASE:</text>
                    <text x="230" y="119" fill="#c084fc" fontSize="9.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">2024-017</text>

                    {/* Node 1: APT28 Actor */}
                    <circle cx="120" cy="55" r="18" fill="#1e103d" stroke="#f43f5e" strokeWidth="2" />
                    <text x="120" y="58" fill="#f43f5e" fontSize="8" fontWeight="bold" fontFamily="monospace" textAnchor="middle">APT28</text>
                    <text x="120" y="80" fill="#fda4af" fontSize="7" fontFamily="monospace" textAnchor="middle">Threat Actor</text>

                    {/* Node 2: malware.exe */}
                    <circle cx="340" cy="55" r="18" fill="#1e103d" stroke="#38bdf8" strokeWidth="2" />
                    <text x="340" y="58" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" textAnchor="middle">malware.exe</text>
                    <text x="340" y="80" fill="#7dd3fc" fontSize="7" fontFamily="monospace" textAnchor="middle">Trojan Payload</text>

                    {/* Node 3: CVE Exploit */}
                    <circle cx="100" cy="155" r="18" fill="#1e103d" stroke="#a855f7" strokeWidth="2" />
                    <text x="100" y="157" fill="#c084fc" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle">CVE-2023</text>
                    <text x="100" y="177" fill="#d8b4fe" fontSize="7" fontFamily="monospace" textAnchor="middle">Privilege Escalation</text>

                    {/* Node 4: bad-domain */}
                    <circle cx="355" cy="155" r="18" fill="#1e103d" stroke="#fb923c" strokeWidth="2" />
                    <text x="355" y="157" fill="#fb923c" fontSize="7" fontFamily="monospace" textAnchor="middle">bad-domain</text>
                    <text x="355" y="177" fill="#fdba74" fontSize="7" fontFamily="monospace" textAnchor="middle">C2 FQDN</text>

                    {/* Node 5: Netherlands IP */}
                    <circle cx="230" cy="185" r="16" fill="#1e103d" stroke="#34d399" strokeWidth="2" />
                    <text x="230" y="188" fill="#34d399" fontSize="7" fontFamily="monospace" textAnchor="middle">185.199.x</text>
                  </svg>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: Recent Cases Dossier */}
            {visualizerTab === 'cases' && (
              <div className="space-y-2">
                {/* Filter tags */}
                <div className="flex items-center gap-1.5 pb-1 text-[10.5px] font-mono">
                  <span className="text-slate-500">Filter:</span>
                  {['ALL', 'ACTIVE', 'HIGH'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setCaseFilter(f)}
                      className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                        caseFilter === f ? 'bg-purple-600 text-white font-bold' : 'bg-[#150c30] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Case rows */}
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {filteredCases.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onSelectCase(c)}
                      className="p-2.5 rounded-xl bg-[#130b2c] hover:bg-[#1a0f3d] border border-purple-500/20 hover:border-purple-400/50 cursor-pointer transition-all flex items-center justify-between text-xs font-mono group"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-purple-300 group-hover:text-purple-100">{c.caseNumber}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            c.severity === 'Critical' || c.severity === 'High' ? 'bg-rose-950/80 text-rose-300 border border-rose-500/30' : 'bg-purple-950/80 text-purple-300 border border-purple-500/30'
                          }`}>
                            {c.severity}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px] font-sans">{c.title}</div>
                        <div className="text-[10px] text-slate-500">Assigned: {c.assignedAgent} • {c.iocCount} IOCs</div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold ${
                          c.status === 'In Progress' ? 'text-cyan-300 bg-cyan-950/60' : 'text-emerald-300 bg-emerald-950/60'
                        }`}>
                          {c.status}
                        </span>
                        <div className="text-[9.5px] text-purple-300 font-bold">{c.confidence}% Confidence</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= PANEL 2: AGENT PERFORMANCE & PROVIDER TELEMETRY ================= */}
        {(viewLayout === 'split' || viewLayout === 'focus-analytics') && (
          <div className={`${viewLayout === 'split' ? 'lg:col-span-5' : 'w-full'} rounded-2xl bg-gradient-to-b from-[#11092a] to-[#0a0518] border border-purple-500/30 p-3.5 shadow-xl flex flex-col justify-between`}>
            
            {/* Panel Tabs Header */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setAnalyticsTab('agent-performance')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    analyticsTab === 'agent-performance' 
                      ? 'bg-purple-950/90 text-purple-200 border border-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#180e38]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Agent Performance</span>
                </button>

                <button
                  onClick={() => setAnalyticsTab('ai-providers')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    analyticsTab === 'ai-providers' 
                      ? 'bg-purple-950/90 text-purple-200 border border-purple-400 font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#180e38]'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI Providers</span>
                </button>
              </div>

              <button
                onClick={onOpenSearch}
                className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 shrink-0"
              >
                <span>Manage</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {/* TAB CONTENT: Agent Performance Matrix */}
            {analyticsTab === 'agent-performance' && (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-1 text-[9px] font-mono uppercase text-purple-400/80 px-2 pb-1 border-b border-purple-500/10">
                  <span className="col-span-5">Specialist Agent</span>
                  <span className="col-span-2 text-center">Tasks</span>
                  <span className="col-span-3 text-center">Success</span>
                  <span className="col-span-2 text-right">Avg Time</span>
                </div>

                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => onSelectAgent(agent)}
                      className="grid grid-cols-12 gap-1 items-center p-2 rounded-lg bg-[#140b2e] hover:bg-[#1a0f3d] border border-purple-500/15 cursor-pointer text-xs font-mono transition-all group"
                    >
                      <div className="col-span-5 flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded bg-[#1e103f] border border-purple-500/30 flex items-center justify-center shrink-0">
                          <CustomAgentIcon type={agent.id} className="w-3.5 h-3.5" glow={false} />
                        </div>
                        <span className="text-slate-200 font-medium truncate group-hover:text-purple-200 text-[11px]" title={agent.name}>
                          {agent.name}
                        </span>
                      </div>

                      <div className="col-span-2 text-center text-slate-300 text-[10.5px]">
                        {agent.tasksCompleted}
                      </div>

                      <div className="col-span-3 px-1">
                        <div className="flex items-center justify-between text-[9.5px] text-emerald-400 font-bold mb-0.5">
                          <span>{agent.successRate}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#090515] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                            style={{ width: `${agent.successRate}%` }}
                          />
                        </div>
                      </div>

                      <div className="col-span-2 text-right text-purple-300 font-mono text-[10.5px]">
                        {agent.avgTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI Providers Status */}
            {analyticsTab === 'ai-providers' && (
              <div className="space-y-2">
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {providers.map((p) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-[#140b2e] border border-purple-500/20 hover:border-purple-400/40 transition-all flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[#1f1142] border border-purple-500/30 flex items-center justify-center font-cyber font-bold text-purple-300 text-xs">
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-[11.5px]">{p.name}</div>
                          <div className="text-[10px] text-slate-400">{p.model}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-[10px] text-purple-300 font-bold">{p.latency}</div>
                          <div className="text-[9px] text-slate-500">Latency</div>
                        </div>

                        <div className="px-2 py-1 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {p.health}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
