export type ArtifactType = 'file' | 'image' | 'link' | 'pcap' | 'code' | 'log';

export interface EvidenceArtifact {
  id: string;
  name: string;
  type: ArtifactType;
  size?: string;
  url?: string;
  thumbnailUrl?: string;
  mimeType?: string;
  sha256?: string;
  uploadedAt: string;
  uploadedBy: string;
  caseId?: string;
  assignedAgent?: string;
  status: 'Ingested' | 'Analyzing' | 'Parsed' | 'Flagged' | 'Clean';
  tags: string[];
  description?: string;
  extractedIOCsCount?: number;
  previewContent?: string;
}

export type AgentStatus = 'ACTIVE' | 'IDLE' | 'BUSY' | 'OFFLINE' | 'ANALYZING';

export interface AgentSystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'DEBUG' | 'WARN' | 'EXEC';
  message: string;
}

export interface SpecialistAgent {
  id: string;
  name: string;
  category: string;
  role: string;
  model: string;
  currentTask: string;
  progress: number;
  status: AgentStatus;
  iconName: string;
  tasksCompleted: number;
  successRate: number;
  avgTime: string;
  lastActive: string;
  lastLog?: {
    timestamp: string;
    action: string;
  };
  systemLogs?: AgentSystemLog[];
  systemPrompt?: string;
  specialization: string[];
}

export interface CEONode {
  name: string;
  callsign?: string;
  status?: AgentStatus;
  title?: string;
  tagline?: string;
  description?: string;
  mandate?: string;
  mandateQuote?: string;
  model: string;
  contextWindow: string;
  temperature: number;
  memory?: string;
  memoryMode?: string;
  avatarUrl?: string;
  activeDelegations?: number;
}

export interface MissionPhase {
  id: string;
  name: string;
  status: 'Completed' | 'In Progress' | 'Pending' | 'Failed';
  assignedAgent?: string;
  details?: string;
}

export interface MissionData {
  id: string;
  title: string;
  caseId: string;
  status?: 'Orchestrating' | 'In Progress' | 'Resolved' | 'Completed' | string;
  caseStatus?: 'Investigating' | 'In Progress' | 'Resolved' | 'Closed' | string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  progress: number;
  startedAt: string;
  estimatedCompletion: string;
  delegatedBy: string;
  description: string;
  phases?: MissionPhase[];
  stages?: { name: string; status: string }[];
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  agent?: string;
  agentName?: string;
  agentType?: string;
  agentId?: string;
  action: string;
  type?: 'delegation' | 'ioc' | 'intel' | 'network' | 'report' | 'malware' | 'alert' | string;
}

export type ActivityItem = ActivityEvent;

export interface IOCItem {
  id: string;
  value: string;
  type: 'IP' | 'Domain' | 'File Hash' | 'URL' | 'CVE' | string;
  severity: 'Malicious' | 'Suspicious' | 'Clean' | 'Unknown' | string;
  confidence: number;
  firstSeen: string;
  threatActor?: string;
  asn?: string;
  country?: string;
  description?: string;
}

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  status: 'In Progress' | 'Completed' | 'High' | 'Low' | 'Investigating' | string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | string;
  timestamp: string;
  assignedAgent: string;
  iocCount: number;
  confidence: number;
}

export interface AIProvider {
  id: string;
  name: string;
  company?: string;
  model?: string;
  availableModels?: string[];
  status?: 'Online' | 'Degraded' | 'Offline' | 'Connected' | 'Ready' | string;
  uptime?: string;
  latency?: string;
  successRate?: number;
  health?: number;
  apiKey?: string;
  isCustomKey?: boolean;
  baseUrl?: string;
  description?: string;
  category?: 'Commercial LLM' | 'Open Weights' | 'Specialized Reasoning' | 'Local / Self-Hosted' | 'Gateway / Router' | string;
  iconColor?: string;
  docsUrl?: string;
  rateLimit?: string;
  contextWindow?: string;
  enabled?: boolean;
  testedAt?: string;
  testStatus?: 'idle' | 'testing' | 'success' | 'failed';
  testMessage?: string;
}

export type ProviderNode = AIProvider;

export interface GraphNode {
  id: string;
  label: string;
  type: 'case' | 'malware' | 'ip' | 'domain' | 'actor' | 'cve' | 'campaign' | string;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface ThreatMapPoint {
  id: string;
  lat: number;
  lng: number;
  city: string;
  country: string;
  threatType: string;
  intensity: number;
  targetCity: string;
  targetLat: number;
  targetLng: number;
}

export interface StreamEvent {
  id: string;
  time?: string;
  timestamp?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'alert' | 'delegate' | 'threat' | string;
  category?: 'threat' | 'delegation' | 'system' | 'general' | string;
  source?: string;
}

export type ThemeMode = 
  | 'cyber-purple' 
  | 'deep-emerald' 
  | 'crimson-alert' 
  | 'electric-cyan' 
  | 'amber-overdrive' 
  | 'tokyo-neon' 
  | 'stealth-monochrome';
