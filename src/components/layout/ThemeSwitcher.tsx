import React from 'react';
import { ThemeMode } from '../../types';
import { Palette, ShieldAlert, Sparkles, Terminal, Zap, Flame, Radio, Ghost } from 'lucide-react';

interface ThemeSwitcherProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

interface ThemeOption {
  id: ThemeMode;
  name: string;
  shortCode: string;
  tag: string;
  icon: React.ElementType;
  colors: {
    primary: string;
    accent: string;
    bg: string;
  };
  description: string;
}

export const THEMES: ThemeOption[] = [
  {
    id: 'cyber-purple',
    name: 'Cyber-Purple',
    shortCode: 'PURPLE',
    tag: 'DEFAULT',
    icon: Sparkles,
    colors: {
      primary: '#a855f7', // Purple-500
      accent: '#d946ef',  // Fuchsia-500
      bg: '#090517'
    },
    description: 'Synthwave neon violet & fuchsia'
  },
  {
    id: 'deep-emerald',
    name: 'Deep-Emerald',
    shortCode: 'EMERALD',
    tag: 'STEALTH',
    icon: Terminal,
    colors: {
      primary: '#10b981', // Emerald-500
      accent: '#06b6d4',  // Cyan-500
      bg: '#04120c'
    },
    description: 'Matrix green terminal & cyber cyan'
  },
  {
    id: 'crimson-alert',
    name: 'Crimson-Alert',
    shortCode: 'CRIMSON',
    tag: 'DEFCON-1',
    icon: ShieldAlert,
    colors: {
      primary: '#f43f5e', // Rose-500
      accent: '#f59e0b',  // Amber-500
      bg: '#130307'
    },
    description: 'High-alert threat response crimson'
  },
  {
    id: 'electric-cyan',
    name: 'Electric-Cyan',
    shortCode: 'QUANTUM',
    tag: 'ICE SOC',
    icon: Zap,
    colors: {
      primary: '#06b6d4', // Cyan-500
      accent: '#38bdf8',  // Sky-400
      bg: '#041021'
    },
    description: 'Quantum SOC electric ice blue'
  },
  {
    id: 'amber-overdrive',
    name: 'Amber-Overdrive',
    shortCode: 'AMBER',
    tag: 'CRT 80s',
    icon: Radio,
    colors: {
      primary: '#f59e0b', // Amber-500
      accent: '#f97316',  // Orange-500
      bg: '#120e03'
    },
    description: 'Phosphor monochrome terminal amber'
  },
  {
    id: 'tokyo-neon',
    name: 'Tokyo-Neon',
    shortCode: 'TOKYO',
    tag: 'CYBERPUNK',
    icon: Flame,
    colors: {
      primary: '#ec4899', // Pink-500
      accent: '#06b6d4',  // Cyan-500
      bg: '#0f0521'
    },
    description: 'Tokyo midnight pink & neon aqua'
  },
  {
    id: 'stealth-monochrome',
    name: 'Stealth-Onyx',
    shortCode: 'TITANIUM',
    tag: 'GHOST OPS',
    icon: Ghost,
    colors: {
      primary: '#e2e8f0', // Slate-200
      accent: '#38bdf8',  // Sky-400
      bg: '#0c0d10'
    },
    description: 'High-contrast titanium & void onyx'
  }
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ currentTheme, onSelectTheme }) => {
  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];

  return (
    <div className="px-3 py-2.5 border-t border-purple-500/20 bg-[#0a0519]/90 space-y-2 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
          <Palette className="w-3.5 h-3.5" style={{ color: 'var(--color-primary-light)' }} />
          <span>THEME PALETTE</span>
        </div>
        <span 
          className="text-[8.5px] font-mono px-1.5 py-0.2 rounded font-bold uppercase border transition-colors"
          style={{
            backgroundColor: 'rgba(var(--color-primary-rgb), 0.2)',
            borderColor: 'rgba(var(--color-primary-rgb), 0.4)',
            color: 'var(--color-primary-light)'
          }}
        >
          {activeThemeObj.tag}
        </span>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
        {THEMES.map((theme) => {
          const isSelected = currentTheme === theme.id;
          const Icon = theme.icon;

          return (
            <button
              key={theme.id}
              id={`theme-btn-${theme.id}`}
              onClick={() => onSelectTheme(theme.id)}
              title={`${theme.name} • ${theme.description}`}
              className={`relative flex flex-col items-center justify-center p-1 rounded-lg border text-center transition-all duration-200 group ${
                isSelected
                  ? 'border-opacity-100 text-white ring-1'
                  : 'bg-[#0e0724]/60 border-purple-500/15 text-slate-400 hover:text-slate-200 hover:border-purple-500/40 hover:bg-[#150a36]/70'
              }`}
              style={isSelected ? {
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.25)',
                borderColor: theme.colors.primary,
                boxShadow: `0 0 10px ${theme.colors.primary}55`,
                color: '#ffffff'
              } : undefined}
            >
              {/* Color Swatch Pill */}
              <div className="flex items-center gap-0.5 mb-1">
                <span 
                  className="w-2 h-2 rounded-full border border-black/40 shadow-sm"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span 
                  className="w-1.5 h-1.5 rounded-full border border-black/40 shadow-sm"
                  style={{ backgroundColor: theme.colors.accent }}
                />
              </div>

              {/* Short Code Label */}
              <span className={`text-[8.5px] font-mono font-bold uppercase tracking-tight truncate w-full ${
                isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
              }`}>
                {theme.shortCode}
              </span>

              {/* Active Glow Dot */}
              {isSelected && (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: theme.colors.primary,
                    boxShadow: `0 0 6px ${theme.colors.primary}`
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Theme Subtitle */}
      <div className="text-[8.5px] font-mono text-slate-400 text-center truncate px-1">
        <span style={{ color: 'var(--color-primary-light)' }}>●</span> {activeThemeObj.name}: {activeThemeObj.description}
      </div>
    </div>
  );
};

