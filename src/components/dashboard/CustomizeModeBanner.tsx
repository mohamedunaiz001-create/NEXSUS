import React from 'react';
import { 
  Sliders, 
  RotateCcw, 
  Check, 
  PlusCircle, 
  Sparkles, 
  GripVertical, 
  Eye,
  LayoutGrid
} from 'lucide-react';
import { DashboardWidgetConfig } from '../../types/dashboardLayout';

interface CustomizeModeBannerProps {
  widgets: DashboardWidgetConfig[];
  onOpenManagerModal: () => void;
  onResetLayout: () => void;
  onExitCustomize: () => void;
}

export const CustomizeModeBanner: React.FC<CustomizeModeBannerProps> = ({
  widgets,
  onOpenManagerModal,
  onResetLayout,
  onExitCustomize
}) => {
  const visibleCount = widgets.filter(w => w.visible).length;
  const hiddenCount = widgets.filter(w => !w.visible).length;

  return (
    <div 
      id="customize-mode-banner"
      className="relative z-30 w-full bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-950 border-b border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.4)] px-3 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2.5 animate-in slide-in-from-top duration-300 font-mono text-xs text-white select-none"
    >
      {/* Left Title & Status */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-purple-600 border border-purple-300 flex items-center justify-center text-white animate-pulse shrink-0">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-cyber font-bold tracking-wider text-purple-200">
              DASHBOARD LAYOUT CUSTOMIZER ACTIVE
            </span>
            <span className="px-1.5 py-0.2 rounded bg-purple-900/80 border border-purple-400/40 text-[10px] text-purple-300 font-bold">
              {visibleCount} ACTIVE • {hiddenCount} HIDDEN
            </span>
          </div>
          <p className="text-[10.5px] text-slate-300 hidden md:block">
            Drag any widget to reorder, adjust widths, toggle visibility, or move between Main &amp; Side decks.
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Open Full Layout Manager Modal */}
        <button
          type="button"
          onClick={onOpenManagerModal}
          className="px-3 py-1.5 rounded-lg bg-purple-900/80 hover:bg-purple-800 border border-purple-400/50 text-purple-200 hover:text-white font-bold flex items-center gap-1.5 transition-colors"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Layout Manager</span>
          {hiddenCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-cyan-500 text-black text-[9px] font-black flex items-center justify-center">
              +{hiddenCount}
            </span>
          )}
        </button>

        {/* Reset to Factory Defaults */}
        <button
          type="button"
          onClick={onResetLayout}
          className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition-colors"
          title="Reset Dashboard to Default Layout"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Defaults</span>
        </button>

        {/* Done / Save Customization */}
        <button
          type="button"
          onClick={onExitCustomize}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.7)] transition-all active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>Save &amp; Exit</span>
        </button>
      </div>
    </div>
  );
};
