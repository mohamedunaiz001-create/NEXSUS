import React from 'react';

interface AgentIconProps {
  type: string;
  className?: string;
  glow?: boolean;
}

export const CustomAgentIcon: React.FC<AgentIconProps> = ({ type, className = "w-6 h-6", glow = true }) => {
  const glowFilter = glow ? "drop-shadow(0 0 6px rgba(192, 132, 252, 0.8))" : undefined;

  switch (type) {
    case 'malware-analysis':
    case 'bug':
      // Glowing Neon Cyber Bug / Malware Spider
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          {/* Cyber Body */}
          <circle cx="24" cy="24" r="8" fill="#241442" stroke="#c084fc" strokeWidth="2" />
          <circle cx="24" cy="24" r="3.5" fill="#f43f5e" />
          {/* Antennae */}
          <path d="M21 16L16 10M27 16L32 10" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
          <circle cx="15" cy="9" r="1.5" fill="#a855f7" />
          <circle cx="33" cy="9" r="1.5" fill="#a855f7" />
          {/* Angular Spider Legs */}
          <path d="M16 22L8 18M16 26L7 28M17 30L9 36" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M32 22L40 18M32 26L41 28M31 30L39 36" stroke="#c084fc" strokeWidth="1.8" strokeLinecap="round" />
          {/* Target Reticle Crosshairs */}
          <path d="M24 10V13M24 35V38M10 24H13M35 24H38" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        </svg>
      );

    case 'ioc-extraction':
    case 'crosshair':
      // Glowing Crosshair / Reticle with Center Diamond
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          <circle cx="24" cy="24" r="15" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
          <circle cx="24" cy="24" r="9" fill="#1f103d" stroke="#c084fc" strokeWidth="2" />
          <rect x="21" y="21" width="6" height="6" transform="rotate(45 24 24)" fill="#38bdf8" />
          {/* Cross lines */}
          <path d="M24 4V12M24 36V44M4 24H12M36 24H44" stroke="#c084fc" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="24" r="2" fill="#ffffff" />
        </svg>
      );

    case 'threat-intel':
    case 'globe':
      // Wireframe Holographic Globe with Latitude/Longitude & Orbital Rings
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          <circle cx="24" cy="24" r="14" stroke="#c084fc" strokeWidth="2" fill="#1b0f38" />
          {/* Latitude Lines */}
          <ellipse cx="24" cy="24" rx="14" ry="6" stroke="#a855f7" strokeWidth="1.5" />
          <ellipse cx="24" cy="24" rx="7" ry="14" stroke="#a855f7" strokeWidth="1.5" />
          <path d="M10 24H38" stroke="#c084fc" strokeWidth="1.5" />
          {/* Hotspot Blip */}
          <circle cx="29" cy="19" r="2" fill="#f43f5e" />
          <circle cx="29" cy="19" r="4" stroke="#f43f5e" strokeWidth="1" opacity="0.6" />
        </svg>
      );

    case 'network-analysis':
    case 'network':
      // Distributed Mesh Constellation Nodes
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          {/* Node Connections */}
          <path d="M24 10L12 24L24 38L36 24Z" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.6" />
          <path d="M12 24L36 24M24 10L24 38" stroke="#c084fc" strokeWidth="1.2" strokeOpacity="0.8" />
          {/* Glowing Nodes */}
          <circle cx="24" cy="10" r="3.5" fill="#38bdf8" stroke="#c084fc" strokeWidth="1" />
          <circle cx="12" cy="24" r="3.5" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
          <circle cx="36" cy="24" r="3.5" fill="#a855f7" stroke="#c084fc" strokeWidth="1" />
          <circle cx="24" cy="38" r="3.5" fill="#38bdf8" stroke="#c084fc" strokeWidth="1" />
          <circle cx="24" cy="24" r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="1" />
        </svg>
      );

    case 'code-review':
    case 'code':
      // Futuristic Code Brackets with Slash: < / >
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          <rect x="6" y="8" width="36" height="32" rx="6" fill="#190e33" stroke="#a855f7" strokeWidth="1.5" />
          <path d="M16 18L10 24L16 30" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 18L38 24L32 30" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M27 15L21 33" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'report-generator':
    case 'file-text':
      // Technical Document with Data Lines and Cyber Badge
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          <path d="M12 8C12 6.89543 12.8954 6 14 6H28L36 14V40C36 41.1046 35.1046 42 34 42H14C12.8954 42 12 41.1046 12 40V8Z" fill="#1b0f38" stroke="#c084fc" strokeWidth="2" />
          <path d="M28 6V14H36" stroke="#c084fc" strokeWidth="2" strokeLinejoin="round" />
          {/* Document Content Bars */}
          <path d="M18 20H30M18 26H30M18 32H25" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
          <circle cx="30" cy="33" r="3" fill="#38bdf8" />
        </svg>
      );

    case 'memory-agent':
    case 'brain':
      // Neon Neural Synapse Brain Matrix
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          {/* Brain Lobes */}
          <path d="M24 10C17 10 12 15 12 21C12 24 13.5 26.5 15 28C13 31 15 36 19 37C21 37.5 23 36 24 35C25 36 27 37.5 29 37C33 36 35 31 33 28C34.5 26.5 36 24 36 21C36 15 31 10 24 10Z" fill="#1b0f38" stroke="#c084fc" strokeWidth="2" />
          {/* Synaptic nodes */}
          <circle cx="20" cy="18" r="2" fill="#c084fc" />
          <circle cx="28" cy="18" r="2" fill="#c084fc" />
          <circle cx="18" cy="27" r="2" fill="#38bdf8" />
          <circle cx="30" cy="27" r="2" fill="#38bdf8" />
          <circle cx="24" cy="25" r="2.5" fill="#f43f5e" />
          {/* Synaptic Connectors */}
          <path d="M20 18L24 25L28 18M18 27L24 25L30 27" stroke="#a855f7" strokeWidth="1.2" />
          <path d="M24 10V35" stroke="#c084fc" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );

    case 'verification-agent':
    case 'shield-check':
      // Cyber Defense Shield with Verified Check
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} style={{ filter: glowFilter }}>
          <path d="M24 6L38 12V22C38 31.5 32 39.5 24 42C16 39.5 10 31.5 10 22V12L24 6Z" fill="#1b0f38" stroke="#c084fc" strokeWidth="2" />
          <path d="M18 23L22 27L30 19" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Outer glow ring */}
          <circle cx="24" cy="24" r="16" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
        </svg>
      );

    default:
      return (
        <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center text-purple-300 font-bold">
          ⚡
        </div>
      );
  }
};
