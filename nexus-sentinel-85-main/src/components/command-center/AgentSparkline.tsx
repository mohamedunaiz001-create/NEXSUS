import React, { useState, useEffect, useId } from 'react';

interface AgentSparklineProps {
  agentId: string;
  isActive: boolean;
  type?: 'cpu' | 'net';
}

export const AgentSparkline: React.FC<AgentSparklineProps> = ({ agentId, isActive, type = 'cpu' }) => {
  const gradientId = useId();
  // Keep an array of 12 data points between 10% and 95%
  const [dataPoints, setDataPoints] = useState<number[]>(() => {
    // Initial seeded pseudo-random distribution based on agentId
    const seed = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 12 }, (_, i) => {
      const base = isActive ? 50 : 25;
      const variation = Math.sin(seed + i * 1.3) * 20;
      return Math.max(12, Math.min(92, Math.round(base + variation)));
    });
  });

  // Periodically flicker / fluctuate data to create real-time load telemetry
  useEffect(() => {
    const updateInterval = isActive ? 900 + (Math.random() * 600) : 2200 + (Math.random() * 1000);
    
    const interval = setInterval(() => {
      setDataPoints((prev) => {
        const last = prev[prev.length - 1] ?? 50;
        // Fluctuating jitter step
        const delta = (Math.random() - 0.48) * (isActive ? 32 : 14);
        const minVal = isActive ? 28 : 10;
        const maxVal = isActive ? 96 : 45;
        const nextVal = Math.max(minVal, Math.min(maxVal, Math.round(last + delta)));
        return [...prev.slice(1), nextVal];
      });
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isActive]);

  const currentVal = dataPoints[dataPoints.length - 1] ?? 0;
  const isNet = type === 'net';

  // SVG Geometry: width 90, height 20
  const width = 90;
  const height = 18;
  const step = width / (dataPoints.length - 1);

  // Generate SVG polyline / path coordinates
  const points = dataPoints.map((val, idx) => {
    const x = idx * step;
    // Invert Y so higher value = higher on SVG
    const y = height - (val / 100) * (height - 3) - 1.5;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  // Color scheme based on load type and active state
  const strokeColor = isActive 
    ? (isNet ? '#38bdf8' : '#e879f9')
    : '#7e22ce';

  return (
    <div className="pt-1.5 border-t border-purple-500/10 space-y-0.5">
      <div className="flex items-center justify-between text-[8px] font-mono leading-none">
        <span className="text-slate-400 font-medium uppercase flex items-center gap-1">
          <span 
            className={`w-1 h-1 rounded-full ${
              isActive ? (isNet ? 'bg-cyan-400' : 'bg-fuchsia-400') : 'bg-purple-600'
            } animate-pulse`} 
          />
          {isNet ? 'NET I/O' : 'CPU LOAD'}
        </span>
        <span className={`font-bold font-mono ${isActive ? (isNet ? 'text-cyan-300' : 'text-fuchsia-300') : 'text-purple-400'}`}>
          {currentVal}%
        </span>
      </div>

      <div className="relative w-full h-[18px] rounded bg-[#060212]/80 border border-purple-500/15 overflow-hidden flex items-center">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="none" 
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id={`grad-${gradientId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop 
                offset="0%" 
                stopColor={isActive ? (isNet ? '#0284c7' : '#c026d3') : '#581c87'} 
                stopOpacity={isActive ? 0.45 : 0.2} 
              />
              <stop 
                offset="100%" 
                stopColor="#060212" 
                stopOpacity={0.0} 
              />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaPath} fill={`url(#grad-${gradientId})`} />

          {/* Sparkline track */}
          <path 
            d={linePath} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="1.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Endpoint current pulse point */}
          {points.length > 0 && (
            <circle 
              cx={points[points.length - 1].split(',')[0]} 
              cy={points[points.length - 1].split(',')[1]} 
              r="1.8" 
              fill="#ffffff" 
              stroke={strokeColor} 
              strokeWidth="1"
            />
          )}
        </svg>
      </div>
    </div>
  );
};
