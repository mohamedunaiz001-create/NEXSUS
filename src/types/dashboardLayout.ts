export type WidgetId =
  | 'ceo-commander'
  | 'agent-hierarchy'
  | 'system-integrity'
  | 'current-mission'
  | 'recent-cases'
  | 'threat-map'
  | 'knowledge-graph'
  | 'agent-performance'
  | 'provider-status'
  | 'live-activity'
  | 'threat-level'
  | 'top-iocs'
  | 'system-overview';

export type WidgetSection = 'main' | 'sidebar';
export type WidgetWidth = 'full' | 'half' | 'third' | 'two-thirds';
export type WidgetCategory = 'command' | 'intelligence' | 'analytics' | 'telemetry';

export interface DashboardWidgetConfig {
  id: WidgetId;
  title: string;
  subtitle: string;
  category: WidgetCategory;
  section: WidgetSection;
  order: number;
  visible: boolean;
  width?: WidgetWidth; // For main grid items: third (col-span-1 of 3), half (col-span-1 of 2), full (full row)
  minHeight?: string;
  description: string;
  iconName: string;
}

export interface DashboardPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  iconName: string;
  layout: DashboardWidgetConfig[];
}

export const DEFAULT_WIDGET_CONFIGS: DashboardWidgetConfig[] = [
  // MAIN COLUMN (Section: main)
  {
    id: 'ceo-commander',
    title: 'CEO Commander Node (ARCHON-01)',
    subtitle: 'Strategic Intent, Autonomous Directives & Memory',
    category: 'command',
    section: 'main',
    order: 0,
    visible: true,
    width: 'full',
    description: 'Central executive AI intelligence node providing global strategic directives and team orchestrations.',
    iconName: 'crown'
  },
  {
    id: 'agent-hierarchy',
    title: 'Specialist Agent Fleet',
    subtitle: '8 Active Sub-Orchestrators & Neural Pods',
    category: 'command',
    section: 'main',
    order: 1,
    visible: true,
    width: 'full',
    description: 'Horizontal operational overview of all 8 autonomous specialist cybersecurity agents.',
    iconName: 'users'
  },
  {
    id: 'system-integrity',
    title: 'Specialist System Integrity',
    subtitle: 'D3 Polar Diagnostic Health & Alignment Radar',
    category: 'analytics',
    section: 'main',
    order: 2,
    visible: true,
    width: 'full',
    description: 'Multi-axis polar radar chart measuring neural alignment, velocity, context integrity, and sanitization across agents.',
    iconName: 'shield-check'
  },
  {
    id: 'current-mission',
    title: 'Active Mission Operations',
    subtitle: 'Tactical Playbook Execution & Evidence Triage',
    category: 'command',
    section: 'main',
    order: 3,
    visible: true,
    width: 'full',
    description: 'Real-time incident response mission progress, phased workflows, and forensic delegation pipeline.',
    iconName: 'target'
  },
  {
    id: 'recent-cases',
    title: 'Active Investigation Cases',
    subtitle: 'Prioritized Incidents & Forensic Dossiers',
    category: 'intelligence',
    section: 'main',
    order: 4,
    visible: true,
    width: 'third',
    description: 'High-priority security cases, triage states, MITRE mappings, and associated IOCs.',
    iconName: 'folder-archive'
  },
  {
    id: 'threat-map',
    title: 'Global Geo-Threat Radar',
    subtitle: 'Live Ingress/Egress Attack Vectors',
    category: 'intelligence',
    section: 'main',
    order: 5,
    visible: true,
    width: 'third',
    description: 'Real-time D3-powered geographic threat telemetry visualizing coordinated global cyber assaults.',
    iconName: 'globe'
  },
  {
    id: 'knowledge-graph',
    title: 'Threat Knowledge Graph',
    subtitle: 'Entity Relationships & Kill-Chain Links',
    category: 'intelligence',
    section: 'main',
    order: 6,
    visible: true,
    width: 'third',
    description: 'Interactive topological graph connecting actors, malware, compromised hosts, and indicators.',
    iconName: 'share-2'
  },
  {
    id: 'agent-performance',
    title: 'Specialist Performance Metrics',
    subtitle: 'Accuracy, Velocity & Workload Distribution',
    category: 'analytics',
    section: 'main',
    order: 7,
    visible: true,
    width: 'half',
    description: 'Comprehensive workload charts and telemetry analytics across all autonomous agents.',
    iconName: 'bar-chart-2'
  },
  {
    id: 'provider-status',
    title: 'AI Intelligence Engines',
    subtitle: 'Flagship LLMs & Inference Endpoints',
    category: 'analytics',
    section: 'main',
    order: 8,
    visible: true,
    width: 'half',
    description: 'Model routing matrix, latency metrics, and API engine health for Gemini, OpenAI, Claude, and local models.',
    iconName: 'cpu'
  },

  // SIDEBAR COLUMN (Section: sidebar)
  {
    id: 'live-activity',
    title: 'Live Incident Telemetry',
    subtitle: 'Real-Time Operational Event Feed',
    category: 'telemetry',
    section: 'sidebar',
    order: 0,
    visible: true,
    width: 'full',
    description: 'Chronological timeline of real-time actions taken by agents, threat detections, and automated triggers.',
    iconName: 'activity'
  },
  {
    id: 'threat-level',
    title: 'Threat Telemetry & DEFCON Gauge',
    subtitle: 'Real-Time Surge Score & Emergency Override',
    category: 'telemetry',
    section: 'sidebar',
    order: 1,
    visible: true,
    width: 'full',
    description: 'D3 dynamic gauge measuring operational threat score, threshold triggers, and emergency lockdown controls.',
    iconName: 'shield-alert'
  },
  {
    id: 'top-iocs',
    title: 'High-Priority IOC Stream',
    subtitle: 'Compromise Indicators & Blacklist Feeds',
    category: 'telemetry',
    section: 'sidebar',
    order: 2,
    visible: true,
    width: 'full',
    description: 'Validated malicious IPs, domains, hashes, and signatures detected across active operations.',
    iconName: 'file-warning'
  },
  {
    id: 'system-overview',
    title: 'Hardware & Cluster Telemetry',
    subtitle: 'Compute, Memory & Node Allocation',
    category: 'telemetry',
    section: 'sidebar',
    order: 3,
    visible: true,
    width: 'full',
    description: 'Server cluster health, CPU loads, memory utilization, and active neural worker threads.',
    iconName: 'server'
  }
];

export const DASHBOARD_PRESETS: DashboardPreset[] = [
  {
    id: 'preset-standard',
    name: 'Full Command Center',
    description: 'Complete balanced 13-widget view with all command, intelligence, diagnostics, and telemetry decks.',
    badge: 'DEFAULT',
    iconName: 'layout-grid',
    layout: DEFAULT_WIDGET_CONFIGS
  },
  {
    id: 'preset-threat-hunter',
    name: 'Threat Hunter Focus',
    description: 'Prioritizes threat map, knowledge graph, live IOCs, cases, and DEFCON telemetry.',
    badge: 'FORENSICS',
    iconName: 'shield-check',
    layout: DEFAULT_WIDGET_CONFIGS.map(w => {
      if (['threat-map', 'knowledge-graph', 'recent-cases', 'top-iocs', 'threat-level', 'current-mission', 'live-activity'].includes(w.id)) {
        return { ...w, visible: true };
      }
      return { ...w, visible: false };
    })
  },
  {
    id: 'preset-executive',
    name: 'Executive & SOC Lead',
    description: 'High-level strategic view focused on CEO directives, agent fleet health, integrity diagnostics, and performance.',
    badge: 'EXECUTIVE',
    iconName: 'crown',
    layout: DEFAULT_WIDGET_CONFIGS.map(w => {
      if (['ceo-commander', 'agent-hierarchy', 'system-integrity', 'current-mission', 'agent-performance', 'provider-status', 'threat-level', 'system-overview'].includes(w.id)) {
        return { ...w, visible: true };
      }
      return { ...w, visible: false };
    })
  },
  {
    id: 'preset-minimal',
    name: 'Minimal Incident Stream',
    description: 'Streamlined low-distraction telemetry monitoring with essential feeds only.',
    badge: 'COMPACT',
    iconName: 'eye',
    layout: DEFAULT_WIDGET_CONFIGS.map(w => {
      if (['agent-hierarchy', 'current-mission', 'threat-level', 'live-activity'].includes(w.id)) {
        return { ...w, visible: true };
      }
      return { ...w, visible: false };
    })
  }
];
