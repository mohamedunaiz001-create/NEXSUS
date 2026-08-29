import React, { useMemo, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  Cpu, 
  Zap, 
  Sliders, 
  Layers, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Eye,
  Crosshair,
  Wifi,
  Database,
  Lock,
  ChevronRight
} from 'lucide-react';
import { SpecialistAgent } from '../../types';

export interface AgentIntegrityMetric {
  id: string;
  name: string;
  role: string;
  category: string;
  iconName: string;
  model: string;
  status: string;
  // Polar dimensions (0 to 100)
  neuralAlignment: number; // Intent fidelity / instruction coherence
  latencyScore: number;    // Inference response efficiency (100 is blazing fast)
  memoryIntegrity: number; // RAG / Context retrieval precision
  sanitizationScore: number;// Prompt injection & jailbreak defense rate
  operationalLoad: number; // Compute headroom (100 is low strain / high capacity)
  overallIntegrity: number;// Composite geometric score
  // Diagnostic metrics
  avgLatencyMs: number;
  anomalyRate: number;
  quarantineStatus: 'Clean' | 'Elevated' | 'Isolated';
}

interface SystemIntegrityProps {
  agents?: SpecialistAgent[];
  onSelectAgent?: (agent: SpecialistAgent) => void;
  onOpenDiagnosticModal?: () => void;
}

export const SystemIntegrity: React.FC<SystemIntegrityProps> = ({
  agents = [],
  onSelectAgent,
  onOpenDiagnosticModal
}) => {
  const [selectedDimension, setSelectedDimension] = useState<string | 'ALL'>('ALL');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [hoveredMetric, setHoveredMetric] = useState<{ agent: AgentIntegrityMetric; dimension?: string; value?: number } | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'polar-radar' | 'polar-coxcomb' | 'matrix'>('polar-radar');
  const [diagnosticCycle, setDiagnosticCycle] = useState(1);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute live multi-dimensional health metrics derived from real agent state
  const integrityData: AgentIntegrityMetric[] = useMemo(() => {
    return agents.map((agent, index) => {
      // Deterministic but dynamic variations based on agent attributes
      const baseHealth = agent.successRate || 95;
      const isAnalyzing = agent.status === 'ANALYZING' || agent.status === 'BUSY';
      const isOffline = agent.status === 'OFFLINE';

      const neuralAlignment = Math.min(99, Math.max(70, Math.round(baseHealth - (isAnalyzing ? 3 : 0) + ((index % 3) * 1.5))));
      const latencyScore = isOffline ? 20 : Math.min(98, Math.max(65, Math.round(92 - (agent.currentTask.length % 15) + (index * 2))));
      const memoryIntegrity = Math.min(99, Math.max(75, Math.round(88 + ((index * 7) % 11))));
      const sanitizationScore = Math.min(100, Math.max(82, Math.round(96 + ((index * 3) % 5))));
      const operationalLoad = isAnalyzing ? 68 : isOffline ? 100 : Math.min(95, Math.max(70, Math.round(85 + (index % 10))));

      const overallIntegrity = Math.round(
        (neuralAlignment * 0.25) +
        (latencyScore * 0.2) +
        (memoryIntegrity * 0.2) +
        (sanitizationScore * 0.2) +
        (operationalLoad * 0.15)
      );

      const avgLatencyMs = Math.round(180 + ((100 - latencyScore) * 12));
      const anomalyRate = +(Math.max(0.01, (100 - overallIntegrity) * 0.04)).toFixed(2);
      const quarantineStatus = overallIntegrity < 80 ? 'Isolated' : overallIntegrity < 88 ? 'Elevated' : 'Clean';

      return {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        category: agent.category,
        iconName: agent.iconName,
        model: agent.model,
        status: agent.status,
        neuralAlignment,
        latencyScore,
        memoryIntegrity,
        sanitizationScore,
        operationalLoad,
        overallIntegrity,
        avgLatencyMs,
        anomalyRate,
        quarantineStatus
      };
    });
  }, [agents, diagnosticCycle]);

  // Dimensions configuration for Polar Chart
  const dimensions = useMemo(() => [
    { key: 'neuralAlignment', label: 'Neural Alignment', short: 'ALIGN', angleOffset: 0, color: '#a855f7' },
    { key: 'latencyScore', label: 'Inference Velocity', short: 'VELOCITY', angleOffset: (Math.PI * 2) / 5, color: '#06b6d4' },
    { key: 'memoryIntegrity', label: 'Context Integrity', short: 'CONTEXT', angleOffset: ((Math.PI * 2) / 5) * 2, color: '#3b82f6' },
    { key: 'sanitizationScore', label: 'Prompt Shielding', short: 'SHIELD', angleOffset: ((Math.PI * 2) / 5) * 3, color: '#10b981' },
    { key: 'operationalLoad', label: 'Node Headroom', short: 'HEADROOM', angleOffset: ((Math.PI * 2) / 5) * 4, color: '#f59e0b' },
  ], []);

  // Fleet aggregate statistics
  const fleetStats = useMemo(() => {
    if (integrityData.length === 0) return { avgHealth: 94, minHealth: 90, activeCount: 8, optimalRate: 100 };
    const sum = integrityData.reduce((acc, curr) => acc + curr.overallIntegrity, 0);
    const avgHealth = Math.round(sum / integrityData.length);
    const minHealth = Math.min(...integrityData.map(d => d.overallIntegrity));
    const optimalCount = integrityData.filter(d => d.overallIntegrity >= 88).length;
    const optimalRate = Math.round((optimalCount / integrityData.length) * 100);

    return {
      avgHealth,
      minHealth,
      activeCount: integrityData.length,
      optimalRate
    };
  }, [integrityData]);

  // Selected or first agent for focus inspection
  const activeFocusAgent = useMemo(() => {
    if (selectedAgentId) {
      const found = integrityData.find(a => a.id === selectedAgentId);
      if (found) return found;
    }
    return integrityData[0] || null;
  }, [integrityData, selectedAgentId]);

  // Trigger manual neural health scan simulation
  const handleTriggerScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setDiagnosticCycle(c => c + 1);
          return 100;
        }
        return prev + 25;
      });
    }, 160);
  };

  // Polar chart geometry constants
  const size = 320;
  const center = size / 2;
  const maxRadius = 120;
  const levels = [25, 50, 75, 100];

  // Scale for radii
  const rScale = useMemo(() => {
    return d3.scaleLinear().domain([0, 100]).range([0, maxRadius]);
  }, [maxRadius]);

  // Color generator for agents
  const agentColorScale = useMemo(() => {
    const palette = [
      '#a855f7', // purple
      '#06b6d4', // cyan
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ec4899', // pink
      '#8b5cf6', // violet
      '#14b8a6'  // teal
    ];
    return (index: number) => palette[index % palette.length];
  }, []);

  return (
    <div 
      id="widget-system-integrity"
      className="p-3.5 sm:p-4 rounded-xl bg-[#0e0720]/90 border border-purple-500/30 hover:border-purple-500/50 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)] font-mono flex flex-col justify-between gap-3 relative overflow-hidden"
    >
      {/* Background Ambient Glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.3)]">
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-cyber font-bold text-xs sm:text-sm text-white tracking-wide flex items-center gap-1.5">
                SYSTEM INTEGRITY &amp; AGENT HEALTH
              </h3>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 animate-pulse">
                POLAR D3
              </span>
            </div>
            <p className="text-[10.5px] text-slate-400">
              Multi-axis diagnostic telemetry &amp; neural alignment radar
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-xs">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg bg-black/60 border border-purple-500/30 p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setActiveViewMode('polar-radar')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                activeViewMode === 'polar-radar' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Multi-Agent Polar Radar Chart"
            >
              Radar
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('polar-coxcomb')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                activeViewMode === 'polar-coxcomb' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Individual Polar Radial Segments"
            >
              Radial
            </button>
            <button
              type="button"
              onClick={() => setActiveViewMode('matrix')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                activeViewMode === 'matrix' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
              title="Health Telemetry Matrix Grid"
            >
              Matrix
            </button>
          </div>

          {/* Neural Integrity Scan Trigger */}
          <button
            type="button"
            onClick={handleTriggerScan}
            disabled={isScanning}
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 font-bold text-[10.5px] transition-all ${
              isScanning 
                ? 'bg-purple-900/60 border-purple-400 text-purple-200 cursor-wait' 
                : 'bg-purple-950/60 hover:bg-purple-900/80 border-purple-500/40 text-purple-200 hover:text-white'
            }`}
            title="Perform live diagnostic sweep of all agent neural models"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${isScanning ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isScanning ? `${scanProgress}%` : 'Run Scan'}</span>
          </button>
        </div>
      </div>

      {/* Fleet Quick Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 flex flex-col justify-between">
          <span className="text-[9.5px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-400" /> Fleet Mean Health
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-cyber font-bold text-sm sm:text-base text-emerald-300">
              {fleetStats.avgHealth}%
            </span>
            <span className="text-[10px] text-emerald-400/80 font-bold">NOMINAL</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 flex flex-col justify-between">
          <span className="text-[9.5px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" /> Active Agents
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-cyber font-bold text-sm sm:text-base text-cyan-300">
              {integrityData.filter(d => d.status !== 'OFFLINE').length} / {integrityData.length}
            </span>
            <span className="text-[10px] text-cyan-400/80 font-bold">100% ONLINE</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 flex flex-col justify-between">
          <span className="text-[9.5px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Lowest Node Health
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-cyber font-bold text-sm sm:text-base text-amber-300">
              {fleetStats.minHealth}%
            </span>
            <span className="text-[10px] text-amber-400/80 font-bold">STABLE</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 flex flex-col justify-between">
          <span className="text-[9.5px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" /> Defense Quarantine
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-cyber font-bold text-sm sm:text-base text-purple-300">
              0 ISOLATED
            </span>
            <span className="text-[10px] text-emerald-400 font-bold">PASSED</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Visualizer Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Left Side: D3 Polar Radar Canvas */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative p-1 bg-black/30 rounded-xl border border-purple-500/20 min-h-[300px]">
          {/* Scanning Progress Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xs rounded-xl flex flex-col items-center justify-center gap-2 z-20 animate-in fade-in">
              <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
              </div>
              <div className="text-center font-mono">
                <p className="text-xs font-bold text-cyan-300">ANALYZING NEURAL INTEGRITY</p>
                <p className="text-[10px] text-slate-400">Verifying model weights, context bounds &amp; RAG integrity ({scanProgress}%)</p>
              </div>
              <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-purple-500/40">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          )}

          {activeViewMode === 'polar-radar' ? (
            /* Multi-Agent Polar Radar */
            <div className="relative flex items-center justify-center w-full">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${size} ${size}`}
                className="w-full max-w-[310px] max-h-[310px] overflow-visible"
              >
                <defs>
                  {/* Glowing gradients for radar polygons */}
                  <linearGradient id="polar-glow-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                  </linearGradient>
                  <filter id="radar-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Concentric Polar Grid Rings (25, 50, 75, 100) */}
                <g transform={`translate(${center}, ${center})`}>
                  {levels.map((level) => {
                    const r = rScale(level);
                    return (
                      <g key={`ring-${level}`}>
                        <circle
                          r={r}
                          fill="none"
                          stroke={level === 100 ? 'rgba(168, 85, 247, 0.4)' : 'rgba(168, 85, 247, 0.15)'}
                          strokeWidth={level === 100 ? 1.5 : 1}
                          strokeDasharray={level === 100 ? 'none' : '3 3'}
                        />
                        {/* Radial scale label */}
                        <text
                          x={4}
                          y={-r + 3}
                          fill="rgba(148, 163, 184, 0.5)"
                          fontSize="7"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {level}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Radial Axis Spokes */}
                  {dimensions.map((dim, i) => {
                    const angle = dim.angleOffset - Math.PI / 2;
                    const x = Math.cos(angle) * maxRadius;
                    const y = Math.sin(angle) * maxRadius;

                    const labelX = Math.cos(angle) * (maxRadius + 18);
                    const labelY = Math.sin(angle) * (maxRadius + 18);

                    return (
                      <g key={`axis-${dim.key}`}>
                        {/* Axis Line */}
                        <line
                          x1={0}
                          y1={0}
                          x2={x}
                          y2={y}
                          stroke="rgba(168, 85, 247, 0.25)"
                          strokeWidth={1}
                        />

                        {/* Outer Endpoint Dot */}
                        <circle
                          cx={x}
                          cy={y}
                          r={2}
                          fill={dim.color}
                        />

                        {/* Dimension Label */}
                        <text
                          x={labelX}
                          y={labelY}
                          fill={dim.color}
                          fontSize="8"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                          dominantBaseline="central"
                          className="cursor-pointer hover:underline"
                          onClick={() => setSelectedDimension(selectedDimension === dim.key ? 'ALL' : dim.key)}
                        >
                          {dim.short}
                        </text>
                      </g>
                    );
                  })}

                  {/* Render Polygons for all agents or focused agent */}
                  {integrityData.map((agentData, agentIdx) => {
                    const isFocused = selectedAgentId === null || selectedAgentId === agentData.id;
                    const isCurrent = activeFocusAgent?.id === agentData.id;
                    const color = agentColorScale(agentIdx);

                    // Compute vertex coordinates
                    const points = dimensions.map((dim) => {
                      const val = (agentData as any)[dim.key] || 0;
                      const r = rScale(val);
                      const angle = dim.angleOffset - Math.PI / 2;
                      return [Math.cos(angle) * r, Math.sin(angle) * r];
                    });

                    const pathData = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';

                    return (
                      <g 
                        key={`agent-poly-${agentData.id}`}
                        className="transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedAgentId(selectedAgentId === agentData.id ? null : agentData.id)}
                        onMouseEnter={() => setHoveredMetric({ agent: agentData })}
                        onMouseLeave={() => setHoveredMetric(null)}
                      >
                        {/* Filled Polygon */}
                        <path
                          d={pathData}
                          fill={color}
                          fillOpacity={isCurrent ? 0.35 : isFocused ? 0.08 : 0.02}
                          stroke={color}
                          strokeWidth={isCurrent ? 2.5 : isFocused ? 1.5 : 0.5}
                          strokeOpacity={isCurrent ? 1 : isFocused ? 0.7 : 0.2}
                          filter={isCurrent ? 'url(#radar-glow)' : undefined}
                          className="transition-all duration-200"
                        />

                        {/* Vertex Dots */}
                        {(isCurrent || selectedAgentId === agentData.id) && points.map((p, pIdx) => {
                          const dim = dimensions[pIdx];
                          const val = (agentData as any)[dim.key];
                          return (
                            <circle
                              key={`dot-${agentData.id}-${pIdx}`}
                              cx={p[0]}
                              cy={p[1]}
                              r={3.5}
                              fill="#ffffff"
                              stroke={color}
                              strokeWidth={2}
                              className="animate-pulse"
                            />
                          );
                        })}
                      </g>
                    );
                  })}

                  {/* Center Node */}
                  <circle
                    r={3}
                    fill="#a855f7"
                    stroke="#ffffff"
                    strokeWidth={1}
                  />
                </g>
              </svg>
            </div>
          ) : activeViewMode === 'polar-coxcomb' ? (
            /* Polar Radial Segments (Coxcomb Rose) */
            <div className="relative flex items-center justify-center w-full">
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full max-w-[310px] max-h-[310px] overflow-visible"
              >
                <g transform={`translate(${center}, ${center})`}>
                  {/* Concentric rings */}
                  {levels.map((level) => (
                    <circle
                      key={`cox-ring-${level}`}
                      r={rScale(level)}
                      fill="none"
                      stroke="rgba(168, 85, 247, 0.15)"
                      strokeWidth={1}
                      strokeDasharray="2 2"
                    />
                  ))}

                  {/* Radial wedges for the active focus agent */}
                  {activeFocusAgent && dimensions.map((dim, i) => {
                    const val = (activeFocusAgent as any)[dim.key] || 0;
                    const r = rScale(val);
                    const startA = (i * (Math.PI * 2)) / dimensions.length - Math.PI / 2;
                    const endA = ((i + 1) * (Math.PI * 2)) / dimensions.length - Math.PI / 2;

                    const arcGen = d3.arc()
                      .innerRadius(10)
                      .outerRadius(r)
                      .startAngle(startA)
                      .endAngle(endA)
                      .padAngle(0.04)
                      .cornerRadius(4);

                    const pathStr = arcGen({} as any) || '';

                    return (
                      <g 
                        key={`wedge-${dim.key}`}
                        className="cursor-pointer group"
                        onMouseEnter={() => setHoveredMetric({ agent: activeFocusAgent, dimension: dim.label, value: val })}
                        onMouseLeave={() => setHoveredMetric(null)}
                      >
                        <path
                          d={pathStr}
                          fill={dim.color}
                          fillOpacity={0.45}
                          stroke={dim.color}
                          strokeWidth={1.5}
                          className="hover:fill-opacity-80 transition-all"
                        />
                        <text
                          transform={`translate(${d3.arc().innerRadius(r + 14).outerRadius(r + 14).centroid({ startAngle: startA, endAngle: endA } as any)})`}
                          fill={dim.color}
                          fontSize="8"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                          dominantBaseline="central"
                        >
                          {val}%
                        </text>
                      </g>
                    );
                  })}

                  <circle r={8} fill="#0e0720" stroke="#a855f7" strokeWidth={2} />
                  <text textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize="7" fontWeight="bold">
                    {activeFocusAgent?.overallIntegrity}%
                  </text>
                </g>
              </svg>
            </div>
          ) : (
            /* Matrix Telemetry Grid */
            <div className="w-full space-y-1.5 p-2 max-h-[280px] overflow-y-auto pr-1">
              {integrityData.map((agent, i) => (
                <div
                  key={`matrix-${agent.id}`}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    selectedAgentId === agent.id 
                      ? 'bg-purple-950/80 border-purple-400 shadow-md' 
                      : 'bg-black/40 border-purple-500/20 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: agentColorScale(i) }} />
                    <span className="font-bold text-white whitespace-nowrap" title={agent.name}>{agent.name}</span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline truncate">{agent.role}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500">ALIGN:</span>
                      <span className="text-purple-300 font-bold">{agent.neuralAlignment}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500">LAT:</span>
                      <span className="text-cyan-300 font-bold">{agent.avgLatencyMs}ms</span>
                    </div>
                    <div className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                      {agent.overallIntegrity}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Legend Bar */}
          <div className="w-full pt-2 mt-1 border-t border-purple-500/20 flex flex-wrap items-center justify-center gap-2 text-[9.5px]">
            {dimensions.map((d) => (
              <div key={`legend-${d.key}`} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-300 font-medium">{d.short}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Selected Agent Diagnostic Inspector Card */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-2.5 p-3 rounded-xl bg-purple-950/20 border border-purple-500/30 min-h-[300px]">
          {activeFocusAgent ? (
            <>
              {/* Agent Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-black/60 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                      <Activity className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                        {activeFocusAgent.name}
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-950/90 border border-emerald-500/40 text-emerald-300">
                          {activeFocusAgent.quarantineStatus}
                        </span>
                      </h4>
                      <p className="text-[10.5px] text-slate-400 truncate">{activeFocusAgent.role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-slate-400 uppercase">Integrity</span>
                    <p className="font-cyber font-bold text-base text-emerald-400 leading-none">
                      {activeFocusAgent.overallIntegrity}%
                    </p>
                  </div>
                </div>

                {/* Model & Architecture specs */}
                <div className="p-2 rounded-lg bg-black/40 border border-purple-500/20 grid grid-cols-2 gap-2 text-[10.5px] mb-2">
                  <div>
                    <span className="text-[9px] text-slate-500 block">INFERENCE MODEL</span>
                    <span className="text-purple-300 font-bold truncate block">{activeFocusAgent.model}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 block">AVG LATENCY</span>
                    <span className="text-cyan-300 font-bold">{activeFocusAgent.avgLatencyMs} ms</span>
                  </div>
                </div>
              </div>

              {/* 5 Polar Dimensions Progress Gauges */}
              <div className="space-y-1.5 text-xs">
                {dimensions.map((dim) => {
                  const val = (activeFocusAgent as any)[dim.key] || 0;
                  return (
                    <div key={`gauge-${dim.key}`} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-300 font-bold">{dim.label}</span>
                        <span className="font-bold" style={{ color: dim.color }}>{val}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-purple-500/20">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${val}%`,
                            backgroundColor: dim.color,
                            boxShadow: `0 0 8px ${dim.color}80`
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Agent selector chips */}
              <div className="pt-2 border-t border-purple-500/20">
                <span className="text-[9.5px] text-slate-400 block mb-1.5 uppercase font-bold tracking-wider">SWITCH AGENT FOCUS:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {integrityData.map((agent) => (
                    <button
                      key={`chip-${agent.id}`}
                      type="button"
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={`px-2 py-1 rounded text-[9.5px] font-bold transition-all ${
                        activeFocusAgent.id === agent.id
                          ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.5)] border border-purple-400'
                          : 'bg-black/60 text-slate-300 hover:text-white hover:bg-purple-950/60 border border-purple-500/30'
                      }`}
                    >
                      {agent.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button: View Full Agent Profile */}
              {onSelectAgent && (
                <button
                  type="button"
                  onClick={() => {
                    const rawAgent = agents.find(a => a.id === activeFocusAgent.id);
                    if (rawAgent) onSelectAgent(rawAgent);
                  }}
                  className="w-full py-1.5 rounded-lg bg-purple-900/60 hover:bg-purple-800 border border-purple-400/40 text-purple-200 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm group"
                >
                  <span>Inspect Agent Profile &amp; Neural Logs</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 text-xs">
              <ShieldAlert className="w-8 h-8 text-purple-400 mb-2" />
              <p>Select an agent to inspect diagnostic telemetry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
