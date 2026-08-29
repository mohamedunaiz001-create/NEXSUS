import React, { useState } from 'react';
import { 
  GripVertical, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  ArrowLeftRight, 
  Maximize2, 
  Minimize2,
  Sparkles
} from 'lucide-react';
import { DashboardWidgetConfig, WidgetWidth } from '../../types/dashboardLayout';

interface WidgetContainerProps {
  config: DashboardWidgetConfig;
  isCustomizeMode: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, targetId: string) => void;
  onToggleVisibility?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onSwitchSection?: (id: string) => void;
  onChangeWidth?: (id: string, width: WidgetWidth) => void;
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  config,
  isCustomizeMode,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  onSwitchSection,
  onChangeWidth,
  children
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Width class mapping for main section items
  const getWidthClasses = () => {
    if (config.section === 'sidebar') return 'w-full';
    switch (config.width) {
      case 'third':
        return 'col-span-1 md:col-span-3 lg:col-span-4';
      case 'half':
        return 'col-span-1 md:col-span-3 lg:col-span-6';
      case 'two-thirds':
        return 'col-span-1 md:col-span-4 lg:col-span-8';
      case 'full':
      default:
        return 'col-span-1 md:col-span-6 lg:col-span-12';
    }
  };

  return (
    <div
      id={`widget-wrapper-${config.id}`}
      draggable={isCustomizeMode}
      onDragStart={(e) => onDragStart && onDragStart(e, config.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => {
        if (isCustomizeMode) {
          e.preventDefault();
          onDragOver && onDragOver(e, config.id);
        }
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        if (isCustomizeMode) {
          e.preventDefault();
          onDrop && onDrop(e, config.id);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative transition-all duration-300 rounded-xl group ${getWidthClasses()} ${
        isCustomizeMode ? 'cursor-grab active:cursor-grabbing select-none' : ''
      } ${
        isDragging ? 'opacity-30 scale-95 ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : 'opacity-100'
      } ${
        isDragOver 
          ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-black shadow-[0_0_25px_rgba(6,182,212,0.6)] scale-[1.01]' 
          : ''
      } ${
        isCustomizeMode && !isDragging
          ? 'ring-1 ring-purple-500/40 hover:ring-purple-400 bg-purple-950/20 p-1'
          : ''
      }`}
    >
      {/* Visual Drop Target Highlight Bar */}
      {isDragOver && (
        <div className="absolute -top-2 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-white to-cyan-500 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.9)] animate-pulse z-40" />
      )}

      {/* Customize Mode Overlay Control Toolbar */}
      {isCustomizeMode && (
        <div className="mb-1 px-2.5 py-1.5 rounded-lg bg-black/85 border border-purple-500/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-1 text-xs font-mono z-20 shadow-lg animate-in fade-in duration-200">
          {/* Drag Handle & Info */}
          <div className="flex items-center gap-1.5 text-purple-200">
            <span className="p-0.5 rounded bg-purple-900/60 text-purple-300 hover:text-white cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3.5 h-3.5" />
            </span>
            <span className="font-bold text-[11px] truncate max-w-[140px] sm:max-w-[200px]">
              {config.title}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-purple-950/80 border border-purple-500/30 text-purple-300">
              {config.section === 'main' ? 'Main Deck' : 'Side Deck'}
            </span>
          </div>

          {/* Actions: Nudge, Switch Column, Width, Hide */}
          <div className="flex items-center gap-1 text-[10px]">
            {/* Move Up / Down */}
            <div className="flex items-center rounded bg-slate-900/90 border border-purple-500/30 p-0.5">
              <button
                type="button"
                onClick={() => onMoveUp && onMoveUp(config.id)}
                className="p-1 hover:bg-purple-800 rounded text-slate-300 hover:text-white transition-colors"
                title="Move Up"
              >
                <ChevronUp className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => onMoveDown && onMoveDown(config.id)}
                className="p-1 hover:bg-purple-800 rounded text-slate-300 hover:text-white transition-colors"
                title="Move Down"
              >
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            {/* Switch Section (Main <-> Sidebar) */}
            <button
              type="button"
              onClick={() => onSwitchSection && onSwitchSection(config.id)}
              className="p-1 px-1.5 rounded bg-slate-900/90 hover:bg-purple-900 border border-purple-500/30 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
              title={config.section === 'main' ? 'Move to Sidebar Column' : 'Move to Main Column'}
            >
              <ArrowLeftRight className="w-3 h-3" />
              <span className="hidden sm:inline text-[9px]">To {config.section === 'main' ? 'Side' : 'Main'}</span>
            </button>

            {/* Width Selector (If in main column) */}
            {config.section === 'main' && onChangeWidth && (
              <div className="flex items-center rounded bg-slate-900/90 border border-purple-500/30 p-0.5 gap-0.5 hidden md:flex">
                <button
                  type="button"
                  onClick={() => onChangeWidth(config.id, 'third')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    config.width === 'third' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="1/3 Width (3-column grid)"
                >
                  1/3
                </button>
                <button
                  type="button"
                  onClick={() => onChangeWidth(config.id, 'half')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    config.width === 'half' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="1/2 Width (2-column grid)"
                >
                  1/2
                </button>
                <button
                  type="button"
                  onClick={() => onChangeWidth(config.id, 'full')}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    config.width === 'full' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Full Row Width"
                >
                  Full
                </button>
              </div>
            )}

            {/* Hide Widget Toggle */}
            <button
              type="button"
              onClick={() => onToggleVisibility && onToggleVisibility(config.id)}
              className="p-1 px-1.5 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 hover:text-white transition-colors flex items-center gap-1"
              title="Hide Widget from Dashboard"
            >
              <EyeOff className="w-3 h-3" />
              <span className="hidden sm:inline text-[9px]">Hide</span>
            </button>
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={isCustomizeMode ? 'pointer-events-none opacity-90' : ''}>
        {children}
      </div>
    </div>
  );
};
