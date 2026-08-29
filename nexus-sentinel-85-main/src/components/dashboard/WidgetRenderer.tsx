import React from 'react';
import { DashboardWidgetConfig, WidgetWidth } from '../../types/dashboardLayout';
import { WidgetContainer } from './WidgetContainer';

// Command Center Components
import { CEOCommander } from '../command-center/CEOCommander';
import { AgentHierarchy } from '../command-center/AgentHierarchy';
import { SystemIntegrity } from '../command-center/SystemIntegrity';
import { CurrentMission } from '../command-center/CurrentMission';
import { RecentCases } from '../command-center/RecentCases';
import { ThreatMap } from '../command-center/ThreatMap';
import { KnowledgeGraph } from '../command-center/KnowledgeGraph';
import { AgentPerformance } from '../command-center/AgentPerformance';
import { ProviderStatus } from '../command-center/ProviderStatus';
import { LiveActivity } from '../command-center/LiveActivity';
import { ThreatLevel } from '../command-center/ThreatLevel';
import { TopIOCs } from '../command-center/TopIOCs';
import { SystemOverview } from '../command-center/SystemOverview';

import { 
  CEONode, 
  SpecialistAgent, 
  MissionData, 
  CaseItem, 
  IOCItem, 
  ActivityEvent, 
  AIProvider 
} from '../../types';

interface WidgetRendererProps {
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

  // Data Context Props
  ceo: CEONode;
  agents: SpecialistAgent[];
  mission: MissionData;
  cases: CaseItem[];
  iocs: IOCItem[];
  activities: ActivityEvent[];
  providers: AIProvider[];
  threatScore: number;
  threatLevelLabel: string;
  threatThreshold: number;
  isEmergencyActive: boolean;

  // Actions
  onOpenCEOChat: (prompt?: string) => void;
  onSelectAgent: (agent: SpecialistAgent) => void;
  onSelectCase: (caseItem: CaseItem) => void;
  onSelectIOC: (ioc: IOCItem) => void;
  onOpenCaseById: (caseId: string) => void;
  onUpdateCaseStatus: (caseId: string, status: any) => void;
  onOpenEvidenceModal: () => void;
  onOpenProvidersModal: () => void;
  onToggleEmergencyOverride: () => void;
  onSetThreatScore: (score: number) => void;
  onSetThreatThreshold: (threshold: number) => void;
  onDeployCountermeasures: () => void;
  onOpenSearch: () => void;
  onOpenIOCExplorer?: () => void;
  onOpenNewCase?: () => void;
  onUpdateCeo?: (updates: Partial<CEONode>) => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  config,
  isCustomizeMode,
  isDragging,
  isDragOver,
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

  ceo,
  agents,
  mission,
  cases,
  iocs,
  activities,
  providers,
  threatScore,
  threatLevelLabel,
  threatThreshold,
  isEmergencyActive,

  onOpenCEOChat,
  onSelectAgent,
  onSelectCase,
  onSelectIOC,
  onOpenCaseById,
  onUpdateCaseStatus,
  onOpenEvidenceModal,
  onOpenProvidersModal,
  onToggleEmergencyOverride,
  onSetThreatScore,
  onSetThreatThreshold,
  onDeployCountermeasures,
  onOpenSearch,
  onOpenIOCExplorer,
  onOpenNewCase,
  onUpdateCeo
}) => {
  // If hidden and not in customize mode, do not render
  if (!config.visible && !isCustomizeMode) {
    return null;
  }

  const renderWidgetContent = () => {
    switch (config.id) {
      case 'ceo-commander':
        return (
          <CEOCommander 
            ceo={ceo}
            onOpenChat={() => onOpenCEOChat()}
            onUpdateCeo={onUpdateCeo}
          />
        );

      case 'agent-hierarchy':
        return (
          <AgentHierarchy 
            agents={agents}
            onSelectAgent={onSelectAgent}
          />
        );

      case 'system-integrity':
        return (
          <SystemIntegrity 
            agents={agents}
            onSelectAgent={onSelectAgent}
          />
        );

      case 'current-mission':
        return (
          <CurrentMission 
            mission={mission}
            agents={agents}
            activities={activities}
            onOpenCase={onOpenCaseById}
            onUpdateCaseStatus={onUpdateCaseStatus}
            onOpenEvidenceModal={onOpenEvidenceModal}
          />
        );

      case 'recent-cases':
        return (
          <RecentCases 
            cases={cases}
            onSelectCase={onSelectCase}
            onViewAll={() => onSelectCase(cases[0])}
            onNewCase={onOpenNewCase}
          />
        );

      case 'threat-map':
        return (
          <ThreatMap 
            onViewMap={() => onOpenCEOChat()}
          />
        );

      case 'knowledge-graph':
        return (
          <KnowledgeGraph 
            onExplore={() => onSelectCase(cases[0])}
          />
        );

      case 'agent-performance':
        return (
          <AgentPerformance 
            agents={agents}
            onViewAnalytics={() => onSelectAgent(agents[0])}
          />
        );

      case 'provider-status':
        return (
          <ProviderStatus 
            providers={providers}
            onManage={onOpenProvidersModal}
            onSelectProvider={onOpenProvidersModal}
          />
        );

      case 'live-activity':
        return (
          <LiveActivity 
            activities={activities}
            onViewAll={() => onOpenCEOChat()}
          />
        );

      case 'threat-level':
        return (
          <ThreatLevel 
            score={threatScore}
            level={threatLevelLabel}
            threshold={threatThreshold}
            isEmergencyOverride={isEmergencyActive}
            onToggleEmergencyOverride={onToggleEmergencyOverride}
            onSetScore={onSetThreatScore}
            onSetThreshold={onSetThreatThreshold}
            onDeployCountermeasures={onDeployCountermeasures}
            onViewDetails={() => onSelectCase(cases[0])}
          />
        );

      case 'top-iocs':
        return (
          <TopIOCs 
            iocs={iocs}
            onSelectIOC={onSelectIOC}
            onViewAll={onOpenIOCExplorer ? onOpenIOCExplorer : () => onSelectIOC(iocs[0])}
          />
        );

      case 'system-overview':
        return (
          <SystemOverview 
            cpu={isEmergencyActive ? 89 : 23}
            memoryUsed={isEmergencyActive ? 14.2 : 7.3}
            memoryTotal={16}
            disk={62}
            activeAgents={8}
            totalAgents={8}
            onViewAll={onOpenSearch}
          />
        );

      default:
        return (
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs font-mono text-slate-400">
            Unknown widget: {config.id}
          </div>
        );
    }
  };

  return (
    <WidgetContainer
      config={config}
      isCustomizeMode={isCustomizeMode}
      isDragging={isDragging}
      isDragOver={isDragOver}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onToggleVisibility={onToggleVisibility}
      onMoveUp={onMoveUp}
      onMoveDown={onMoveDown}
      onSwitchSection={onSwitchSection}
      onChangeWidth={onChangeWidth}
    >
      {renderWidgetContent()}
    </WidgetContainer>
  );
};
