import { SpecialistAgent, CaseItem, IOCItem, EvidenceArtifact, CEONode, AIProvider } from '../types';

export type SearchItemType = 'agent' | 'case' | 'ioc' | 'artifact' | 'provider' | 'action';

export interface SearchDoc {
  id: string;
  type: SearchItemType;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'purple' | 'emerald' | 'rose' | 'amber' | 'cyan' | 'blue';
  iconName: string;
  metadata: Record<string, string | number | undefined>;
  rawObject: SpecialistAgent | CaseItem | IOCItem | EvidenceArtifact | AIProvider | { action: string; label: string };
  searchableText: string;
  fields: {
    primary: string; // Highest weight (e.g., Name, Case Number, IOC Value)
    secondary: string; // High weight (e.g., Role, Title, Threat Actor, Type)
    taskOrStatus?: string; // Medium weight (Current Task, Status, Severity)
    tagsOrSpecs?: string[]; // Medium weight
    body?: string; // Description, logs, system prompt
  };
}

export interface SearchResult {
  doc: SearchDoc;
  score: number;
  matchedField: string;
  snippet: string;
  highlights: string[];
}

export class CyberSearchIndex {
  private docs: SearchDoc[] = [];
  private tokenIndex: Map<string, Set<number>> = new Map();

  constructor(
    agents: SpecialistAgent[] = [],
    cases: CaseItem[] = [],
    iocs: IOCItem[] = [],
    artifacts: EvidenceArtifact[] = [],
    ceo?: CEONode,
    providers: AIProvider[] = []
  ) {
    this.rebuildIndex(agents, cases, iocs, artifacts, ceo, providers);
  }

  /**
   * Tokenize text into normalized alpha-numeric and symbolic tokens
   */
  private tokenize(text: string): string[] {
    if (!text) return [];
    const normalized = text.toLowerCase();
    // Split by non-alphanumeric except dots/hyphens for IP/CVE/Case matching
    const rawTokens = normalized.split(/[\s,;:!?"'()\[\]{}<>\\|+=~`*]+/);
    const set = new Set<string>();

    for (const t of rawTokens) {
      if (!t) continue;
      set.add(t);
      // Also index sub-tokens when tokens have dots or hyphens (e.g. 185.199.108.153 or crx-2026-001)
      if (t.includes('-') || t.includes('.') || t.includes('_') || t.includes('/')) {
        const subParts = t.split(/[-._\/]/);
        for (const sub of subParts) {
          if (sub.length >= 2) set.add(sub);
        }
      }
    }
    return Array.from(set);
  }

  /**
   * Rebuild the entire search index from all live entities
   */
  public rebuildIndex(
    agents: SpecialistAgent[] = [],
    cases: CaseItem[] = [],
    iocs: IOCItem[] = [],
    artifacts: EvidenceArtifact[] = [],
    ceo?: CEONode,
    providers: AIProvider[] = []
  ) {
    this.docs = [];
    this.tokenIndex.clear();

    let docIdx = 0;

    // 1. Index Quick Navigation Actions
    const quickActions: SearchDoc[] = [
      {
        id: 'action-new-case',
        type: 'action',
        title: 'New Case Intake & Auto-Assign Specialist',
        subtitle: 'Intake new security incident and automatically assign the most qualified specialist agent',
        badge: 'AUTO-ASSIGN',
        badgeColor: 'cyan',
        iconName: 'sparkles',
        metadata: { category: 'Incident Response' },
        rawObject: { action: 'open_new_case_modal', label: 'New Case Intake & Auto-Assign' },
        searchableText: 'new case intake create incident auto assign specialist triage work distribution qualification allocate routing',
        fields: {
          primary: 'New Case Intake & Auto-Assign Specialist',
          secondary: 'Incident Routing & AI Workload Balancing',
          taskOrStatus: 'AUTO-ASSIGN',
          tagsOrSpecs: ['Incident Intake', 'Auto-Assign', 'Workload Balancing', 'Specialist Routing', 'SOC'],
          body: 'Create a new security incident case, calculate agent capacity and skill alignment in real-time, and auto-dispatch to the optimal specialist.'
        }
      },
      {
        id: 'action-ceo-chat',
        type: 'action',
        title: 'Chat with CEO ARCHON',
        subtitle: 'Issue strategic directives, delegate investigations, and request mission synthesis',
        badge: 'COMMAND',
        badgeColor: 'purple',
        iconName: 'zap',
        metadata: { category: 'Executive Command' },
        rawObject: { action: 'open_ceo_chat', label: 'Chat with CEO ARCHON' },
        searchableText: 'chat ceo archon commander mandate instruct strategy delegation ask ai gemini high thinking',
        fields: {
          primary: 'Chat with CEO ARCHON',
          secondary: 'Executive Command & Delegation',
          taskOrStatus: 'COMMAND',
          tagsOrSpecs: ['CEO', 'Archon', 'AI', 'Strategy', 'Orchestration'],
          body: 'Open executive console to converse with CEO ARCHON, execute tool calls, and orchestrate specialist agents.'
        }
      },
      {
        id: 'action-upload-evidence',
        type: 'action',
        title: 'Upload Forensic Evidence / Artifact',
        subtitle: 'Ingest PCAP dumps, malware binaries, memory dumps, and threat logs',
        badge: 'INGEST',
        badgeColor: 'cyan',
        iconName: 'upload-cloud',
        metadata: { category: 'Forensic Ingestion' },
        rawObject: { action: 'open_evidence_modal', label: 'Upload Forensic Evidence' },
        searchableText: 'upload forensic evidence artifact pcap memory dump binary log file analyze ingest triage',
        fields: {
          primary: 'Upload Forensic Evidence',
          secondary: 'Artifact Ingestion & Triage',
          taskOrStatus: 'INGEST',
          tagsOrSpecs: ['PCAP', 'Binary', 'Log', 'Forensics', 'Upload'],
          body: 'Ingest new artifacts, auto-assign to specialist agents, and run automated indicator extraction.'
        }
      },
      {
        id: 'action-provider-hub',
        type: 'action',
        title: 'AI Providers & API Key Integration Hub',
        subtitle: 'Configure Google Gemini, OpenAI, Claude, DeepSeek, Groq, Ollama, and custom endpoints',
        badge: 'CONFIG',
        badgeColor: 'emerald',
        iconName: 'cpu',
        metadata: { category: 'AI Infrastructure' },
        rawObject: { action: 'open_providers_modal', label: 'AI Provider Hub' },
        searchableText: 'provider hub api key integration openai gpt-4o anthropic claude 3.5 google gemini deepseek groq mistral perplexity ollama local llm xai grok cohere azure custom endpoint benchmark keys secret token model routing',
        fields: {
          primary: 'AI Provider & API Key Integration Hub',
          secondary: 'Multi-Engine Model Configuration',
          taskOrStatus: 'CONFIG',
          tagsOrSpecs: ['API Keys', 'Gemini', 'OpenAI', 'Claude', 'DeepSeek', 'Groq', 'Ollama', 'Custom Endpoints'],
          body: 'Integrate custom API keys, switch flagship intelligence engines, test connection handshakes, and configure local self-hosted LLM endpoints.'
        }
      },
      {
        id: 'action-emergency-override',
        type: 'action',
        title: 'Engage Emergency Override (DEFCON 1)',
        subtitle: 'Shift UI to high-contrast red emergency display & lock down sub-systems',
        badge: 'DEFCON 1',
        badgeColor: 'rose',
        iconName: 'shield-alert',
        metadata: { category: 'Emergency Protocols' },
        rawObject: { action: 'toggle_emergency_override', label: 'Emergency Override' },
        searchableText: 'emergency override defcon 1 alert red high contrast threat lockdown panic trigger surge spike protocol',
        fields: {
          primary: 'Engage Emergency Override',
          secondary: 'DEFCON 1 Incident Mode',
          taskOrStatus: 'EMERGENCY',
          tagsOrSpecs: ['DEFCON 1', 'Emergency Override', 'Lockdown', 'High-Contrast Red', 'Incident Surge'],
          body: 'Instantly activates full-spectrum red emergency high-contrast display, deploys incident response playbooks, and arms defensive countermeasures.'
        }
      },
      {
        id: 'action-voice-command',
        type: 'action',
        title: 'Activate Voice Command Mode (Web Speech API)',
        subtitle: 'Issue hands-free natural language commands like "Engage Lockdown", "Open Case", or "Deploy Countermeasures"',
        badge: 'VOICE',
        badgeColor: 'rose',
        iconName: 'mic',
        metadata: { category: 'Operator Controls' },
        rawObject: { action: 'open_voice_command', label: 'Voice Command Mode' },
        searchableText: 'voice command speech web speech microphone audio natural language engage lockdown open case download logs deploy countermeasures tts',
        fields: {
          primary: 'Voice Command Mode (Web Speech API)',
          secondary: 'Natural Language SOC Voice Commands',
          taskOrStatus: 'VOICE',
          tagsOrSpecs: ['Web Speech API', 'Voice Recognition', 'Microphone', 'Hands-Free', 'DEFCON 1', 'Audio Feedback'],
          body: 'Trigger system functions like "Engage Lockdown", "Open Case", "Download Logs", and "Deploy Countermeasures" using real-time Web Speech recognition.'
        }
      },
      {
        id: 'action-export-logs',
        type: 'action',
        title: 'Download & Export Forensic Event Logs',
        subtitle: 'Export real-time diagnostic telemetry and threat events into formatted JSON or CSV files',
        badge: 'EXPORT',
        badgeColor: 'cyan',
        iconName: 'download',
        metadata: { category: 'Forensics & Audit' },
        rawObject: { action: 'export_diagnostic_logs', label: 'Download Forensic Logs' },
        searchableText: 'download export logs json csv forensic event stream diagnostic threat audit report splunk excel dump file download',
        fields: {
          primary: 'Download & Export Forensic Event Logs',
          secondary: 'Forensic Telemetry & Threat History Export',
          taskOrStatus: 'EXPORT',
          tagsOrSpecs: ['Download Logs', 'JSON', 'CSV', 'SIEM Export', 'Audit Trail', 'Forensic Hash', 'Telemetry'],
          body: 'Export real-time threat stream logs and system diagnostic telemetry into formatted JSON SIEM records or RFC 4180 CSV tables with tamper-evident SHA-256 verification.'
        }
      },
      {
        id: 'action-customize-dashboard',
        type: 'action',
        title: 'Customize Dashboard Layout (Drag & Drop)',
        subtitle: 'Reorder widgets, adjust grid widths, and toggle deck visibility',
        badge: 'LAYOUT',
        badgeColor: 'purple',
        iconName: 'sliders',
        metadata: { category: 'Dashboard & Interface' },
        rawObject: { action: 'toggle_customize_layout', label: 'Customize Layout' },
        searchableText: 'customize dashboard layout reorder drag drop widgets toggle visibility move resize arrange decks',
        fields: {
          primary: 'Customize Dashboard Layout',
          secondary: 'Drag & Drop Widget Customizer',
          taskOrStatus: 'LAYOUT',
          tagsOrSpecs: ['Drag & Drop', 'Reorder', 'Widgets', 'LocalStorage', 'Presets', 'Grid'],
          body: 'Enables interactive drag-and-drop mode allowing you to reorder, resize, and toggle any of the 12 command and telemetry widgets.'
        }
      },
      {
        id: 'action-open-layout-manager',
        type: 'action',
        title: 'Open Dashboard Layout Manager & Presets',
        subtitle: 'Select from operational presets (Threat Hunter, Executive, Minimal) or reset defaults',
        badge: 'PRESETS',
        badgeColor: 'cyan',
        iconName: 'layout-grid',
        metadata: { category: 'Dashboard & Interface' },
        rawObject: { action: 'open_layout_modal', label: 'Layout Presets' },
        searchableText: 'layout manager presets threat hunter executive minimal reset default factory dashboard view',
        fields: {
          primary: 'Dashboard Layout Manager & Presets',
          secondary: 'Preset Selector & Factory Reset',
          taskOrStatus: 'PRESETS',
          tagsOrSpecs: ['Presets', 'Threat Hunter', 'Executive', 'Minimal', 'Factory Reset'],
          body: 'Manage operational layout presets, view all active and hidden widgets, or reset layout to factory default.'
        }
      }
    ];

    for (const actionDoc of quickActions) {
      this.addDocToIndex(actionDoc, docIdx++);
    }

    // 2. Index CEO Node
    if (ceo) {
      const ceoDoc: SearchDoc = {
        id: 'ceo-archon',
        type: 'agent',
        title: `${ceo.name} (${ceo.title || 'CEO'})`,
        subtitle: ceo.tagline || ceo.mandate || 'CEO AI Orchestrator',
        badge: ceo.status || 'ACTIVE',
        badgeColor: 'purple',
        iconName: 'bot',
        metadata: {
          model: ceo.model,
          contextWindow: ceo.contextWindow,
          memory: ceo.memory,
          role: 'CEO Commander'
        },
        rawObject: {
          id: 'ceo-archon',
          name: ceo.name,
          category: 'CEO',
          role: ceo.title || 'CEO Agent Commander',
          model: ceo.model,
          currentTask: 'Supervising 8 Specialist Agents & Active Investigations',
          progress: 100,
          status: ceo.status || 'ACTIVE',
          iconName: 'bot',
          tasksCompleted: 48,
          successRate: 99,
          avgTime: '45s',
          lastActive: 'Now',
          specialization: ['Strategic Delegation', 'Multi-Agent Orchestration', 'Threat Synthesis']
        } as SpecialistAgent,
        searchableText: `${ceo.name} ${ceo.title} ${ceo.tagline} ${ceo.mandate} ${ceo.model} commander strategist delegator`,
        fields: {
          primary: ceo.name,
          secondary: ceo.title || 'CEO Agent Commander',
          taskOrStatus: 'Active Orchestrator',
          tagsOrSpecs: ['CEO', 'ARCHON', ceo.model, 'Multi-Agent Orchestration'],
          body: `${ceo.tagline || ''} ${ceo.mandate || ''} ${ceo.description || ''}`
        }
      };
      this.addDocToIndex(ceoDoc, docIdx++);
    }

    // 3. Index Specialist Agents & Their Tasks
    for (const agent of agents) {
      const logsSummary = (agent.systemLogs || []).map(l => `[${l.level}] ${l.message}`).join(' ');
      const agentDoc: SearchDoc = {
        id: `agent-${agent.id}`,
        type: 'agent',
        title: agent.name,
        subtitle: `${agent.role} • Task: ${agent.currentTask}`,
        badge: agent.status,
        badgeColor: agent.status === 'ACTIVE' ? 'emerald' : agent.status === 'BUSY' ? 'amber' : 'cyan',
        iconName: agent.iconName || 'bot',
        metadata: {
          model: agent.model,
          role: agent.role,
          currentTask: agent.currentTask,
          successRate: `${agent.successRate}%`,
          tasksCompleted: agent.tasksCompleted
        },
        rawObject: agent,
        searchableText: `${agent.name} ${agent.category} ${agent.role} ${agent.model} ${agent.currentTask} ${(agent.specialization || []).join(' ')} ${agent.systemPrompt || ''} ${logsSummary} ${agent.lastLog?.action || ''}`,
        fields: {
          primary: agent.name,
          secondary: agent.role,
          taskOrStatus: agent.currentTask,
          tagsOrSpecs: [...(agent.specialization || []), agent.model, agent.category],
          body: `${agent.systemPrompt || ''} ${logsSummary} ${agent.lastLog?.action || ''}`
        }
      };
      this.addDocToIndex(agentDoc, docIdx++);
    }

    // 4. Index Cases & Investigations
    for (const c of cases) {
      const caseDoc: SearchDoc = {
        id: `case-${c.id}`,
        type: 'case',
        title: `${c.caseNumber}: ${c.title}`,
        subtitle: `Assigned: ${c.assignedAgent} • ${c.iocCount} IOCs detected • Confidence: ${c.confidence}%`,
        badge: c.severity,
        badgeColor: c.severity === 'Critical' ? 'rose' : c.severity === 'High' ? 'amber' : 'blue',
        iconName: 'folder-archive',
        metadata: {
          caseNumber: c.caseNumber,
          status: c.status,
          severity: c.severity,
          assignedAgent: c.assignedAgent,
          iocCount: c.iocCount,
          confidence: `${c.confidence}%`,
          timestamp: c.timestamp
        },
        rawObject: c,
        searchableText: `${c.caseNumber} ${c.title} ${c.status} ${c.severity} ${c.assignedAgent} investigation forensic incident breach ransomware apt`,
        fields: {
          primary: c.caseNumber,
          secondary: c.title,
          taskOrStatus: `${c.status} (${c.severity})`,
          tagsOrSpecs: [c.assignedAgent, c.status, c.severity],
          body: `Investigation ${c.caseNumber} for ${c.title}. Severity: ${c.severity}, Status: ${c.status}, Assigned Specialist: ${c.assignedAgent}.`
        }
      };
      this.addDocToIndex(caseDoc, docIdx++);
    }

    // 5. Index Threat Indicators (IOCs)
    for (const ioc of iocs) {
      const iocDoc: SearchDoc = {
        id: `ioc-${ioc.id}`,
        type: 'ioc',
        title: ioc.value,
        subtitle: `${ioc.type} • Actor: ${ioc.threatActor || 'Unknown'} • Country: ${ioc.country || 'N/A'} • Confidence: ${ioc.confidence}%`,
        badge: ioc.severity,
        badgeColor: ioc.severity.toLowerCase() === 'malicious' ? 'rose' : ioc.severity.toLowerCase() === 'suspicious' ? 'amber' : 'emerald',
        iconName: 'globe',
        metadata: {
          type: ioc.type,
          severity: ioc.severity,
          threatActor: ioc.threatActor || 'Unknown',
          country: ioc.country,
          asn: ioc.asn,
          confidence: `${ioc.confidence}%`,
          firstSeen: ioc.firstSeen
        },
        rawObject: ioc,
        searchableText: `${ioc.value} ${ioc.type} ${ioc.severity} ${ioc.threatActor || ''} ${ioc.country || ''} ${ioc.asn || ''} ${ioc.description || ''}`,
        fields: {
          primary: ioc.value,
          secondary: `${ioc.type} - ${ioc.threatActor || 'Attribution Pending'}`,
          taskOrStatus: ioc.severity,
          tagsOrSpecs: [ioc.type, ioc.severity, ioc.country || '', ioc.threatActor || ''].filter(Boolean),
          body: ioc.description || `Indicator observed in telemetry feeds. Type: ${ioc.type}, Severity: ${ioc.severity}.`
        }
      };
      this.addDocToIndex(iocDoc, docIdx++);
    }

    // 6. Index Evidence Artifacts
    for (const art of artifacts) {
      const artDoc: SearchDoc = {
        id: `artifact-${art.id}`,
        type: 'artifact',
        title: art.name,
        subtitle: `Type: ${art.type.toUpperCase()} • Status: ${art.status} • Size: ${art.size || 'N/A'} • Assigned: ${art.assignedAgent || 'Unassigned'}`,
        badge: art.status,
        badgeColor: art.status === 'Flagged' ? 'rose' : art.status === 'Analyzing' ? 'amber' : 'cyan',
        iconName: 'file-text',
        metadata: {
          type: art.type,
          status: art.status,
          sha256: art.sha256,
          assignedAgent: art.assignedAgent,
          uploadedBy: art.uploadedBy,
          uploadedAt: art.uploadedAt
        },
        rawObject: art,
        searchableText: `${art.name} ${art.type} ${art.status} ${art.sha256 || ''} ${art.assignedAgent || ''} ${(art.tags || []).join(' ')} ${art.description || ''} ${art.previewContent || ''}`,
        fields: {
          primary: art.name,
          secondary: `Forensic Artifact (${art.type.toUpperCase()})`,
          taskOrStatus: art.status,
          tagsOrSpecs: art.tags || [],
          body: `${art.sha256 ? `SHA-256: ${art.sha256}` : ''} ${art.description || ''} ${art.previewContent || ''}`
        }
      };
      this.addDocToIndex(artDoc, docIdx++);
    }

    // 7. Index AI Engine Providers & Models
    for (const prov of providers) {
      const provDoc: SearchDoc = {
        id: `provider-${prov.id}`,
        type: 'provider',
        title: prov.name,
        subtitle: `${prov.category || 'AI Provider'} • Model: ${prov.model || 'Default'} • Status: ${prov.status || 'Ready'}`,
        badge: prov.status || 'Ready',
        badgeColor: prov.status === 'Connected' || prov.status === 'Ready' || prov.status === 'Online' ? 'emerald' : 'purple',
        iconName: 'cpu',
        metadata: {
          company: prov.company,
          category: prov.category,
          currentModel: prov.model,
          latency: prov.latency,
          status: prov.status
        },
        rawObject: prov,
        searchableText: `${prov.name} ${prov.company || ''} ${prov.category || ''} ${prov.model || ''} ${(prov.availableModels || []).join(' ')} ${prov.description || ''} api key llm engine provider endpoint reasoning`,
        fields: {
          primary: prov.name,
          secondary: `${prov.company || prov.name} (${prov.category || 'AI Engine'})`,
          taskOrStatus: prov.model || 'Active Model',
          tagsOrSpecs: prov.availableModels || [],
          body: prov.description || `${prov.name} AI model provider for threat intelligence and cybersecurity reasoning.`
        }
      };
      this.addDocToIndex(provDoc, docIdx++);
    }
  }

  private addDocToIndex(doc: SearchDoc, index: number) {
    this.docs.push(doc);
    const allTokens = this.tokenize(doc.searchableText);
    for (const token of allTokens) {
      if (!this.tokenIndex.has(token)) {
        this.tokenIndex.set(token, new Set());
      }
      this.tokenIndex.get(token)!.add(index);
    }
  }

  /**
   * Execute full-text query with multi-term token matching and field weighting
   */
  public search(rawQuery: string, typeFilter: SearchItemType | 'all' = 'all'): SearchResult[] {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      // Return top contextual items when query is empty
      return this.docs
        .filter(d => typeFilter === 'all' || d.type === typeFilter)
        .slice(0, 10)
        .map(doc => ({
          doc,
          score: 1,
          matchedField: doc.type === 'action' ? 'Quick Action' : doc.fields.secondary,
          snippet: doc.subtitle,
          highlights: []
        }));
    }

    const queryTokens = this.tokenize(trimmed);
    if (queryTokens.length === 0) return [];

    const lowerQuery = trimmed.toLowerCase();
    const results: SearchResult[] = [];

    this.docs.forEach((doc, idx) => {
      if (typeFilter !== 'all' && doc.type !== typeFilter) {
        return;
      }

      let score = 0;
      let matchedField = 'General Match';
      let snippet = doc.subtitle;
      const highlights: string[] = [];

      const primaryLower = doc.fields.primary.toLowerCase();
      const secondaryLower = doc.fields.secondary.toLowerCase();
      const taskLower = (doc.fields.taskOrStatus || '').toLowerCase();
      const bodyLower = (doc.fields.body || '').toLowerCase();
      const tagsLower = (doc.fields.tagsOrSpecs || []).map(t => t.toLowerCase()).join(' ');

      // 1. Exact string match boosts
      if (primaryLower === lowerQuery) {
        score += 300;
        matchedField = `Exact Match: ${doc.fields.primary}`;
        highlights.push(doc.fields.primary);
      } else if (primaryLower.startsWith(lowerQuery)) {
        score += 180;
        matchedField = `Primary: ${doc.fields.primary}`;
        highlights.push(doc.fields.primary);
      } else if (primaryLower.includes(lowerQuery)) {
        score += 120;
        matchedField = `Primary: ${doc.fields.primary}`;
        highlights.push(doc.fields.primary);
      }

      // 2. Secondary & Role Match
      if (secondaryLower.includes(lowerQuery)) {
        score += 80;
        matchedField = `Secondary: ${doc.fields.secondary}`;
        highlights.push(doc.fields.secondary);
      }

      // 3. Task / Status / Severity match
      if (taskLower.includes(lowerQuery)) {
        score += 65;
        matchedField = `Status/Task: ${doc.fields.taskOrStatus}`;
        snippet = `Current Task: ${doc.fields.taskOrStatus}`;
      }

      // 4. Tags / Specializations match
      if (tagsLower.includes(lowerQuery)) {
        score += 50;
        matchedField = `Tags / Specialization`;
      }

      // 5. Body / Log / Description match
      if (bodyLower.includes(lowerQuery)) {
        score += 35;
        // Extract snippet around matched word
        const matchIdx = bodyLower.indexOf(lowerQuery);
        const start = Math.max(0, matchIdx - 25);
        const end = Math.min(doc.fields.body!.length, matchIdx + lowerQuery.length + 45);
        const snippetText = doc.fields.body!.slice(start, end).trim();
        snippet = `...${snippetText}...`;
        matchedField = 'Matched in Details/Logs';
      }

      // 6. Token Inverted Index Scoring
      let tokenMatches = 0;
      for (const token of queryTokens) {
        // Direct match in inverted index
        if (this.tokenIndex.has(token) && this.tokenIndex.get(token)!.has(idx)) {
          score += 25;
          tokenMatches++;
          highlights.push(token);
        } else {
          // Prefix matching across doc's searchable text
          if (doc.searchableText.toLowerCase().includes(token)) {
            score += 12;
            tokenMatches++;
          }
        }
      }

      if (score > 0) {
        // Boost items that matched all query tokens
        if (tokenMatches >= queryTokens.length) {
          score += 40;
        }

        results.push({
          doc,
          score,
          matchedField,
          snippet,
          highlights
        });
      }
    });

    // Sort by relevance score descending
    results.sort((a, b) => b.score - a.score);
    return results;
  }
}
