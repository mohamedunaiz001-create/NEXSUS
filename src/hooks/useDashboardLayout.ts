import React, { useState, useEffect, useCallback } from 'react';
import { 
  DashboardWidgetConfig, 
  DEFAULT_WIDGET_CONFIGS, 
  DashboardPreset, 
  WidgetWidth,
  WidgetSection 
} from '../types/dashboardLayout';

const STORAGE_KEY = 'cyber_command_dashboard_layout_v2';

export function useDashboardLayout() {
  const [isCustomizeMode, setIsCustomizeMode] = useState<boolean>(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState<boolean>(false);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [dragOverWidgetId, setDragOverWidgetId] = useState<string | null>(null);

  // Load initial layout from localStorage or fallback to defaults
  const [widgets, setWidgets] = useState<DashboardWidgetConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge with any missing defaults if schema updated
          const savedIds = new Set(parsed.map((p: any) => p.id));
          const missingDefaults = DEFAULT_WIDGET_CONFIGS.filter(d => !savedIds.has(d.id));
          return [...parsed, ...missingDefaults];
        }
      }
    } catch (e) {
      console.warn('Failed to load saved dashboard layout:', e);
    }
    return DEFAULT_WIDGET_CONFIGS;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    } catch (e) {
      console.warn('Failed to save dashboard layout to localStorage:', e);
    }
  }, [widgets]);

  const toggleCustomizeMode = useCallback(() => {
    setIsCustomizeMode(prev => !prev);
  }, []);

  const openLayoutModal = useCallback(() => {
    setIsLayoutModalOpen(true);
  }, []);

  const closeLayoutModal = useCallback(() => {
    setIsLayoutModalOpen(false);
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  }, []);

  const updateWidgetWidth = useCallback((id: string, width: WidgetWidth) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, width } : w));
  }, []);

  const switchWidgetSection = useCallback((id: string) => {
    setWidgets(prev => {
      const target = prev.find(w => w.id === id);
      if (!target) return prev;

      const nextSection: WidgetSection = target.section === 'main' ? 'sidebar' : 'main';
      const targetSectionWidgets = prev.filter(w => w.section === nextSection);
      const maxOrder = targetSectionWidgets.length > 0 
        ? Math.max(...targetSectionWidgets.map(w => w.order)) + 1 
        : 0;

      return prev.map(w => {
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
    });
  }, []);

  const moveWidget = useCallback((id: string, direction: 'up' | 'down') => {
    setWidgets(prev => {
      const target = prev.find(w => w.id === id);
      if (!target) return prev;

      const sectionWidgets = prev.filter(w => w.section === target.section).sort((a, b) => a.order - b.order);
      const currIndex = sectionWidgets.findIndex(w => w.id === id);
      if (currIndex === -1) return prev;

      const swapIndex = direction === 'up' ? currIndex - 1 : currIndex + 1;
      if (swapIndex < 0 || swapIndex >= sectionWidgets.length) return prev;

      const swapTarget = sectionWidgets[swapIndex];

      return prev.map(w => {
        if (w.id === target.id) return { ...w, order: swapTarget.order };
        if (w.id === swapTarget.id) return { ...w, order: target.order };
        return w;
      });
    });
  }, []);

  // HTML5 Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedWidgetId(id);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedWidgetId !== id) {
      setDragOverWidgetId(id);
    }
  }, [draggedWidgetId]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId) {
      setDraggedWidgetId(null);
      setDragOverWidgetId(null);
      return;
    }

    setWidgets(prev => {
      const source = prev.find(w => w.id === draggedWidgetId);
      const target = prev.find(w => w.id === targetId);

      if (!source || !target) return prev;

      const next = [...prev];
      const sourceSection = source.section;
      const targetSection = target.section;

      // Extract items in target section without source
      const targetList = next
        .filter(w => w.section === targetSection && w.id !== source.id)
        .sort((a, b) => a.order - b.order);
      
      const targetIdx = targetList.findIndex(w => w.id === target.id);
      const insertAt = targetIdx === -1 ? targetList.length : targetIdx;

      // Insert source into target list
      targetList.splice(insertAt, 0, { ...source, section: targetSection });

      // Re-index target section
      targetList.forEach((w, idx) => {
        w.order = idx;
      });

      // If moved across sections, re-index source section too
      if (sourceSection !== targetSection) {
        const sourceList = next
          .filter(w => w.section === sourceSection && w.id !== source.id)
          .sort((a, b) => a.order - b.order);
        sourceList.forEach((w, idx) => {
          w.order = idx;
        });
      }

      // Merge results
      return next.map(w => {
        const inTarget = targetList.find(t => t.id === w.id);
        if (inTarget) return inTarget;
        return w;
      });
    });

    setDraggedWidgetId(null);
    setDragOverWidgetId(null);
  }, [draggedWidgetId]);

  const resetLayout = useCallback(() => {
    setWidgets(DEFAULT_WIDGET_CONFIGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WIDGET_CONFIGS));
    } catch (e) {
      console.warn('Failed to reset dashboard layout in localStorage:', e);
    }
  }, []);

  const applyPreset = useCallback((preset: DashboardPreset) => {
    setWidgets(preset.layout);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preset.layout));
    } catch (e) {
      console.warn('Failed to save preset to localStorage:', e);
    }
  }, []);

  // Compute sorted and visible lists for Main Deck and Sidebar Deck
  const mainWidgets = widgets
    .filter(w => w.section === 'main' && (isCustomizeMode || w.visible))
    .sort((a, b) => a.order - b.order);

  const sidebarWidgets = widgets
    .filter(w => w.section === 'sidebar' && (isCustomizeMode || w.visible))
    .sort((a, b) => a.order - b.order);

  return {
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
  };
}
