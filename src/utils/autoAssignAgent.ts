import { SpecialistAgent, CaseItem } from '../types';

export interface AgentWorkloadMetric {
  agentId: string;
  agentName: string;
  role: string;
  category: string;
  status: string;
  iconName: string;
  model: string;
  activeCasesCount: number;
  currentTask: string;
  currentProgress: number;
  bandwidthScore: number; // 0 (saturated) to 100 (idle/high bandwidth)
  skillFitScore: number;  // 0 (unrelated) to 100 (exact specialization match)
  performanceScore: number;// based on success rate & speed
  compositeScore: number;  // weighted composite recommendation score
  isRecommended: boolean;
  matchReasons: string[];
  capacityLabel: 'Optimal' | 'Available' | 'Moderate' | 'Heavy' | 'Saturated' | 'Offline';
}

export interface AutoAssignResult {
  suggestedAgent: SpecialistAgent;
  confidence: number;
  rationale: string;
  workloadDistributionSummary: {
    totalFleetCapacity: number;
    busiestAgentName: string;
    leastLoadedAgentName: string;
    fleetLoadAverage: number;
  };
  rankedCandidates: AgentWorkloadMetric[];
}

export interface CaseIntakeInput {
  title: string;
  category?: string;
  description?: string;
  severity?: string;
  tags?: string[];
  iocCount?: number;
}

// Domain keyword matrix mapped to specialist agents
const AGENT_SKILL_PROFILES: Record<string, {
  keywords: string[];
  coreDomains: string[];
  priorityMultiplier?: number;
}> = {
  'malware-analysis': {
    keywords: [
      'malware', 'ransomware', 'trojan', 'dropper', 'executable', '.exe', '.dll', 'binary',
      'reverse engineering', 'disassembly', 'ghidra', 'ida', 'xor', 'obfuscation', 'sandbox',
      'pe', 'payload', 'stealer', 'worm', 'rootkit', 'shellcode', 'entropy', 'loader', 'crypter'
    ],
    coreDomains: ['Binary Disassembly', 'Sandbox Detonation', 'Payload Extraction', 'Deobfuscation']
  },
  'ioc-extraction': {
    keywords: [
      'ioc', 'indicator', 'hash', 'sha256', 'md5', 'domain', 'ip address', 'url', 'regex',
      'stix', 'misp', 'defang', 'extract', 'harvest', 'pattern', 'observables', 'c2 address',
      'registry key', 'file path', 'string dump'
    ],
    coreDomains: ['Indicator Harvesting', 'STIX 2.1 Normalization', 'Pattern Parsing', 'Entropy Scoring']
  },
  'threat-intel': {
    keywords: [
      'apt', 'threat actor', 'campaign', 'attribution', 'lazarus', 'apt28', 'volt typhoon',
      'fancy bear', 'darkgate', 'virustotal', 'alienvault', 'otx', 'shodan', 'whois', 'geopolitical',
      'dark web', 'reconnaissance', 'bulletproof', 'adversary', 'osint'
    ],
    coreDomains: ['Adversary Attribution', 'Darknet Feeds', 'Threat Feeds', 'Campaign Correlation']
  },
  'network-analysis': {
    keywords: [
      'pcap', 'packet', 'wireshark', 'netflow', 'beacon', 'beaconing', 'dns tunneling',
      'exfiltration', 'lateral movement', 'c2', 'tls', 'ja3', 'port', 'firewall', 'tcp',
      'http', 'syn flood', 'ddos', 'arp', 'smb', 'traffic anomaly', 'packet capture'
    ],
    coreDomains: ['PCAP Deep Dive', 'Beaconing Detection', 'DNS Tunneling', 'TLS Fingerprinting']
  },
  'code-review': {
    keywords: [
      'code', 'script', 'python', 'powershell', 'ps1', 'bash', 'vulnerability', 'cve',
      'exploit', 'injection', 'sql injection', 'xss', 'rce', 'logic bomb', 'ast', 'audit',
      'source review', 'deserialization', 'buffer overflow', 'hardcoded secret', 'amsi'
    ],
    coreDomains: ['PowerShell & Python Scripts', 'AST Parsing', 'CVE & Zero-Day Matching', 'Exploit Payload Audit']
  },
  'report-generator': {
    keywords: [
      'report', 'summary', 'executive', 'brief', 'kill chain', 'mitre att&ck', 'remediation',
      'compliance', 'post-mortem', 'pdf', 'action items', 'recommendations', 'timeline',
      'incident debrief', 'presentation'
    ],
    coreDomains: ['Executive Summaries', 'ATT&CK Kill-Chain Mapping', 'Remediation Guides', 'Incident Reporting']
  },
  'memory-agent': {
    keywords: [
      'historical', 'past case', 'similar', 'similarity', 'vector', 'qdrant', 'embedding',
      'rag', 'knowledge graph', 'database', 'archive', 'historical precedent', 'retrieval',
      'context recall'
    ],
    coreDomains: ['Vector Search & Recall', 'Historical Precedent', 'Similarity Matching', 'Knowledge Graph']
  },
  'verification-agent': {
    keywords: [
      'verify', 'validate', 'hallucination', 'cross-check', 'quality', 'false positive',
      'sanity check', 'consensus', 'confidence score', 'ground truth', 'audit trail',
      'adversarial verification'
    ],
    coreDomains: ['Hallucination Shield', 'Consensus Verification', 'False-Positive Audit', 'Evidence Grounding']
  }
};

/**
 * Calculates current workload, skill alignment, and recommends the best specialist agent for a case.
 */
export function calculateAutoAssignment(
  caseInput: CaseIntakeInput,
  agents: SpecialistAgent[],
  existingCases: CaseItem[] = []
): AutoAssignResult {
  const caseText = [
    caseInput.title || '',
    caseInput.category || '',
    caseInput.description || '',
    caseInput.severity || '',
    ...(caseInput.tags || [])
  ].join(' ').toLowerCase();

  // 1. Calculate active case count per agent
  const agentCaseCounts: Record<string, number> = {};
  agents.forEach(a => {
    agentCaseCounts[a.id] = 0;
  });

  existingCases.forEach(c => {
    if (c.status !== 'Completed' && c.status !== 'Resolved') {
      const matchAgent = agents.find(
        a => (c.assignedAgent && c.assignedAgent.toLowerCase().includes(a.name.toLowerCase())) ||
             c.assignedAgent === a.name ||
             (c as any).assignedAgentId === a.id
      );
      if (matchAgent) {
        agentCaseCounts[matchAgent.id] = (agentCaseCounts[matchAgent.id] || 0) + 1;
      }
    }
  });

  // 2. Evaluate each agent's metrics
  const candidateMetrics: AgentWorkloadMetric[] = agents.map(agent => {
    const profile = AGENT_SKILL_PROFILES[agent.id] || { keywords: [], coreDomains: [] };
    const activeCases = agentCaseCounts[agent.id] || 0;
    const isOffline = agent.status === 'OFFLINE';
    const isBusy = agent.status === 'BUSY' || agent.status === 'ANALYZING';

    // A. Skill Fit Calculation (0 - 100)
    let keywordHits = 0;
    const matchReasons: string[] = [];

    // Check specializations listed on the agent object
    (agent.specialization || []).forEach(spec => {
      const specLower = spec.toLowerCase();
      if (caseText.includes(specLower) || specLower.split(' ').some(w => w.length > 3 && caseText.includes(w))) {
        keywordHits += 2.5;
        matchReasons.push(`Direct capability match: "${spec}"`);
      }
    });

    // Check keyword profile
    profile.keywords.forEach(kw => {
      if (caseText.includes(kw)) {
        keywordHits += 1.5;
        if (matchReasons.length < 3 && !matchReasons.some(r => r.includes(kw))) {
          matchReasons.push(`Matched incident vector indicator: "${kw}"`);
        }
      }
    });

    // Base domain alignment score
    let rawSkillFit = Math.min(100, Math.max(30, Math.round(35 + (keywordHits * 8))));
    if (matchReasons.length === 0) {
      // General baseline fit based on category or default triage
      rawSkillFit = Math.round(40 + (agent.successRate * 0.1));
      matchReasons.push(`Generalist telemetry handling (${agent.role})`);
    }

    // B. Bandwidth & Workload Score (0 - 100)
    // Higher score means MORE available bandwidth (less loaded)
    let bandwidthScore = 100;
    if (isOffline) {
      bandwidthScore = 0;
    } else {
      // Penalize for active cases
      bandwidthScore -= (activeCases * 18);
      // Penalize for busy/analyzing state
      if (isBusy) {
        bandwidthScore -= 20;
      }
      // Factor in current task progress if busy (lower progress means more time remaining)
      if (agent.progress < 50 && isBusy) {
        bandwidthScore -= 10;
      }
      bandwidthScore = Math.max(10, Math.min(100, bandwidthScore));
    }

    // Determine capacity label
    let capacityLabel: AgentWorkloadMetric['capacityLabel'] = 'Available';
    if (isOffline) capacityLabel = 'Offline';
    else if (bandwidthScore >= 85) capacityLabel = 'Optimal';
    else if (bandwidthScore >= 65) capacityLabel = 'Available';
    else if (bandwidthScore >= 45) capacityLabel = 'Moderate';
    else if (bandwidthScore >= 25) capacityLabel = 'Heavy';
    else capacityLabel = 'Saturated';

    // C. Performance Rating (0 - 100)
    const successRate = agent.successRate || 95;
    const taskVolumeBonus = Math.min(10, (agent.tasksCompleted || 0) * 0.5);
    const performanceScore = Math.min(100, Math.round(successRate * 0.9 + taskVolumeBonus));

    // D. Composite Score (Weighted: Skill 45%, Bandwidth 35%, Performance 20%)
    const compositeScore = Math.round(
      (rawSkillFit * 0.45) +
      (bandwidthScore * 0.35) +
      (performanceScore * 0.20)
    );

    return {
      agentId: agent.id,
      agentName: agent.name,
      role: agent.role,
      category: agent.category,
      status: agent.status,
      iconName: agent.iconName,
      model: agent.model,
      activeCasesCount: activeCases,
      currentTask: agent.currentTask,
      currentProgress: agent.progress,
      bandwidthScore,
      skillFitScore: rawSkillFit,
      performanceScore,
      compositeScore,
      isRecommended: false,
      matchReasons: matchReasons.slice(0, 3),
      capacityLabel
    };
  });

  // Sort descending by composite score
  const ranked = [...candidateMetrics].sort((a, b) => b.compositeScore - a.compositeScore);

  // Mark top candidate as recommended
  if (ranked.length > 0) {
    ranked[0].isRecommended = true;
  }

  const topMatch = ranked[0];
  const suggestedAgent = agents.find(a => a.id === topMatch.agentId) || agents[0];

  // Workload summary across fleet
  const totalFleetCapacity = Math.round(
    ranked.reduce((acc, curr) => acc + curr.bandwidthScore, 0) / ranked.length
  );
  const busiest = [...ranked].sort((a, b) => a.bandwidthScore - b.bandwidthScore)[0];
  const leastLoaded = [...ranked].sort((a, b) => b.bandwidthScore - a.bandwidthScore)[0];

  const rationale = `${topMatch.agentName} is recommended with a ${topMatch.compositeScore}% composite qualification index. ` +
    `Possesses ${topMatch.skillFitScore}% domain alignment for "${caseInput.title || 'Incident Triage'}", ` +
    `with ${topMatch.bandwidthScore}% available compute bandwidth (${topMatch.activeCasesCount} active cases assigned).`;

  return {
    suggestedAgent,
    confidence: topMatch.compositeScore,
    rationale,
    workloadDistributionSummary: {
      totalFleetCapacity,
      busiestAgentName: busiest.agentName,
      leastLoadedAgentName: leastLoaded.agentName,
      fleetLoadAverage: 100 - totalFleetCapacity
    },
    rankedCandidates: ranked
  };
}
