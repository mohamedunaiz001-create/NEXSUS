import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  RotateCcw, 
  Check, 
  GripVertical, 
  Eye, 
  EyeOff, 
  ChevronUp, 
  ChevronDown, 
  ArrowLeftRight, 
  LayoutGrid, 
  Sparkles, 
  Layers,
  Crown,
  Users,
  Target,
  FolderArchive,
  Globe,
  Share2,
  BarChart2,
  Cpu,
  Activity,
  ShieldAlert,
  ShieldCheck,
  FileWarning,
  Server
} from 'lucide-react';
import { 
  DashboardWidgetConfig, 
  DashboardPreset, 
  DASHBOARD_PRESETS, 
  WidgetWidth,
  WidgetSection 
} from '../../types/dashboardLayout';

interface DashboardLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: DashboardWidgetConfig[];
  onUpdateWidgets: (newWidgets: DashboardWidgetConfig[]) => void;
  onResetLayout: () => void;
  onApplyPreset: (preset: DashboardPreset) => void;
}

export const DashboardLayoutModal: React.FC<DashboardLayoutModalProps> = ({
  isOpen,
  onClose,
  widgets,
  onUpdateWidgets,
  onResetLayout,
  onApplyPreset
}) => {
  const [activeTab, setActiveTab] = useState<'widgets' | 'presets'>('widgets');
  const [selectedSection, setSelectedSection] = useState<'all' | 'main' | 'sidebar'>('all');
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  if (!isOpen) return null;

  const getWidgetIcon = (iconName: string) => {
    switch (iconName) {
      case 'crown': return <Crown className="w-4 h-4 text-purple-400" />;
      case 'users': return <Users className="w-4 h-4 text-cyan-400" />;
      case 'target': return <Target className="w-4 h-4 text-rose-400" />;
      case 'folder-archive': return <FolderArchive className="w-4 h-4 text-amber-400" />;
      case 'globe': return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'share-2': return <Share2 className="w-4 h-4 text-indigo-400" />;
      case 'bar-chart-2': return <BarChart2 className="w-4 h-4 text-fuchsia-400" />;
      case 'cpu': return <Cpu className="w-4 h-4 text-teal-400" />;
      case 'activity': return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'shield-alert': return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'shield-check': return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case 'file-warning': return <FileWarning className="w-4 h-4 text-amber-400" />;
      case 'server': return <Server className="w-4 h-4 text-blue-400" />;
      default: return <Sliders className="w-4 h-4 text-purple-400" />;
    }
  };

  const handleToggleVisibility = (id: string) => {
    const next = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    onUpdateWidgets(next);
  };

  const handleMove = (id: string, direction: 'up' | 'down') => {
    const target = widgets.find(w => w.id === id);
    if (!target) return;

    const sectionWidgets = widgets.filter(w => w.section === target.section).sort((a, b) => a.order - b.order);
    const currIndex = sectionWidgets.findIndex(w => w.id === id);
    if (currIndex === -1) return;

    const swapIndex = direction === 'up' ? currIndex - 1 : currIndex + 1;
    if (swapIndex < 0 || swapIndex >= sectionWidgets.length) return;

    const swapTarget = sectionWidgets[swapIndex];

    const next = widgets.map(w => {
      if (w.id === target.id) return { ...w, order: swapTarget.order };
      if (w.id === swapTarget.id) return { ...w, order: target.order };
      return w;
    });

    onUpdateWidgets(next);
  };

  const handleSwitchSection = (id: string) => {
    const target = widgets.find(w => w.id === id);
    if (!target) return;

    const nextSection: WidgetSection = target.section === 'main' ? 'sidebar' : 'main';
    const targetSectionWidgets = widgets.filter(w => w.section === nextSection);
    const maxOrder = targetSectionWidgets.length > 0 
      ? Math.max(...targetSectionWidgets.map(w => w.order)) + 1 
      : 0;

    const next = widgets.map(w => {
      if (w.id === id) {
        return {
          ...w,
          section: nextSection,
          order: maxOrder,
          width: nextSection === 'main' ? 'half' : 'full'
        };
      }
      return w;
    });

    onUpdateWidgets(next);
  };

  const handleChangeWidth = (id: string, width: WidgetWidth) => {
    const next = widgets.map(w => w.id === id ? { ...w, width } : w);
    onUpdateWidgets(next);
  };

  // Reorder via Drag-and-Drop in list
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedWidgetId(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    const source = widgets.find(w => w.id === draggedWidgetId);
    const target = widgets.find(w => w.id === targetId);

    if (!source || !target) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    // If dragging across sections or same section
    const next = [...widgets];
    const sourceSection = source.section;
    const targetSection = target.section;

    // Filter widgets by target section
    const targetList = next.filter(w => w.section === targetSection && w.id !== source.id).sort((a, b) => a.order - b.order);
    const targetIdx = targetList.findIndex(w => w.id === target.id);

    // Insert source into target list at targetIdx
    targetList.splice(targetIdx, 0, { ...source, section: targetSection });

    // Re-index target section orders
    targetList.forEach((w, idx) => {
      w.order = idx;
    });

    // If moved from another section, re-index source section too
    if (sourceSection !== targetSection) {
      const sourceList = next.filter(w => w.section === sourceSection && w.id !== source.id).sort((a, b) => a.order - b.order);
      sourceList.forEach((w, idx) => {
        w.order = idx;
      });
    }

    // Merge updated
    const finalWidgets = next.map(w => {
      const inTarget = targetList.find(t => t.id === w.id);
      if (inTarget) return inTarget;
      return w;
    });

    onUpdateWidgets(finalWidgets);
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  };

  // Filtered widgets list
  const filteredWidgets = widgets.filter(w => {
    if (selectedSection === 'all') return true;
    return w.section === selectedSection;
  }).sort((a, b) => {
    if (a.section !== b.section) {
      return a.section === 'main' ? -1 : 1;
    }
    return a.order - b.order;
  });

  const visibleCount = widgets.filter(w => w.visible).length;
  const hiddenCount = widgets.filter(w => !w.visible).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0e0720] border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.3)] overflow-hidden font-mono text-slate-200"
      >
        {/* Header */}
        <div className="p-4 border-b border-purple-500/20 bg-purple-950/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-300">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-cyber font-bold text-base text-white tracking-wider">
                  DASHBOARD LAYOUT &amp; WIDGET MANAGER
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-900/80 border border-purple-400/40 text-purple-300">
                  {visibleCount} ACTIVE / {widgets.length} TOTAL
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Drag-and-drop to reorder widgets, toggle visibility, and customize operational decks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onResetLayout}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-purple-950/80 border border-purple-500/30 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Reset to Factory Default Layout"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900/80 hover:bg-purple-950 border border-purple-500/30 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs: Widgets vs Presets */}
        <div className="px-4 pt-3 border-b border-purple-500/20 bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('widgets')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'widgets'
                  ? 'border-purple-400 text-purple-200 shadow-[0_2px_10px_rgba(168,85,247,0.5)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Widget Customizer ({widgets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('presets')}
              className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'presets'
                  ? 'border-purple-400 text-purple-200 shadow-[0_2px_10px_rgba(168,85,247,0.5)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Operational Presets ({DASHBOARD_PRESETS.length})</span>
            </button>
          </div>

          {activeTab === 'widgets' && (
            <div className="flex items-center gap-1 text-[11px] pb-2">
              <span className="text-slate-500 text-[10px] hidden sm:inline mr-1">Filter:</span>
              <button
                type="button"
                onClick={() => setSelectedSection('all')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedSection === 'all' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Decks
              </button>
              <button
                type="button"
                onClick={() => setSelectedSection('main')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedSection === 'main' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Main Deck ({widgets.filter(w => w.section === 'main').length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedSection('sidebar')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedSection === 'sidebar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side Deck ({widgets.filter(w => w.section === 'sidebar').length})
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeTab === 'widgets' ? (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400 flex items-center justify-between pb-1">
                <span>💡 Tip: Grab the handle icon on the left to drag and reorder widgets freely.</span>
                <span className="text-purple-300 font-bold">{visibleCount} Visible • {hiddenCount} Hidden</span>
              </div>

              {filteredWidgets.map((widget) => {
                const isDragging = draggedWidgetId === widget.id;
                const isDragOver = dragOverWidgetId === widget.id;

                return (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, widget.id)}
                    onDragOver={(e) => handleDragOver(e, widget.id)}
                    onDrop={(e) => handleDrop(e, widget.id)}
                    className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
                      isDragging 
                        ? 'opacity-30 border-purple-400 bg-purple-950/60 scale-95' 
                        : isDragOver
                        ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.5)] scale-[1.01]'
                        : widget.visible 
                        ? 'bg-purple-950/20 border-purple-500/30 hover:border-purple-500/60' 
                        : 'bg-black/40 border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Left: Drag Handle & Icon & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div 
                        className="p-1 rounded text-purple-400 hover:text-white hover:bg-purple-900/60 cursor-grab active:cursor-grabbing transition-colors"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-black/50 border border-purple-500/30 flex items-center justify-center shrink-0">
                        {getWidgetIcon(widget.iconName)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-xs truncate ${widget.visible ? 'text-white' : 'text-slate-400 line-through'}`}>
                            {widget.title}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                            widget.section === 'main' 
                              ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30' 
                              : 'bg-teal-950/80 text-teal-300 border border-teal-500/30'
                          }`}>
                            {widget.section === 'main' ? 'Main Deck' : 'Side Deck'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate max-w-md">
                          {widget.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Controls & Visibility */}
                    <div className="flex items-center gap-2 shrink-0 text-xs">
                      {/* Section Switch Button */}
                      <button
                        type="button"
                        onClick={() => handleSwitchSection(widget.id)}
                        className="p-1.5 px-2 rounded-lg bg-slate-900/90 hover:bg-purple-900/80 border border-purple-500/30 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[10px]"
                        title={widget.section === 'main' ? 'Move to Sidebar Column' : 'Move to Main Column'}
                      >
                        <ArrowLeftRight className="w-3 h-3 text-purple-400" />
                        <span className="hidden sm:inline">To {widget.section === 'main' ? 'Side' : 'Main'}</span>
                      </button>

                      {/* Width Selector for Main Deck */}
                      {widget.section === 'main' && (
                        <div className="flex items-center rounded-lg bg-slate-900/90 border border-purple-500/30 p-0.5 gap-0.5 hidden sm:flex">
                          <button
                            type="button"
                            onClick={() => handleChangeWidth(widget.id, 'third')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              widget.width === 'third' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                            title="1/3 Width (3-column grid)"
                          >
                            1/3
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWidth(widget.id, 'half')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              widget.width === 'half' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                            title="1/2 Width (2-column grid)"
                          >
                            1/2
                          </button>
                          <button
                            type="button"
                            onClick={() => handleChangeWidth(widget.id, 'full')}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              widget.width === 'full' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                            }`}
                            title="Full Row Width"
                          >
                            Full
                          </button>
                        </div>
                      )}

                      {/* Move Up/Down Nudge */}
                      <div className="flex items-center rounded-lg bg-slate-900/90 border border-purple-500/30 p-0.5">
                        <button
                          type="button"
                          onClick={() => handleMove(widget.id, 'up')}
                          className="p-1 hover:bg-purple-800 rounded text-slate-300 hover:text-white transition-colors"
                          title="Move Up"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(widget.id, 'down')}
                          className="p-1 hover:bg-purple-800 rounded text-slate-300 hover:text-white transition-colors"
                          title="Move Down"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Visibility Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(widget.id)}
                        className={`p-1.5 px-2.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs ${
                          widget.visible 
                            ? 'bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300' 
                            : 'bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300'
                        }`}
                        title={widget.visible ? "Hide Widget" : "Show Widget"}
                      >
                        {widget.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        <span>{widget.visible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DASHBOARD_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 hover:border-purple-400 transition-all flex flex-col justify-between gap-3 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-cyber font-bold text-sm text-white group-hover:text-purple-300 transition-colors">
                        {preset.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {preset.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-purple-500/20 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {preset.layout.filter(w => w.visible).length} widgets active
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onApplyPreset(preset);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Apply Preset</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 px-4 border-t border-purple-500/20 bg-purple-950/40 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            ⚡ Layout configuration is stored permanently in browser storage.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.7)] transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Apply &amp; Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
