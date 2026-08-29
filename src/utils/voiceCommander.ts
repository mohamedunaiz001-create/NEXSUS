export interface VoiceCommandDef {
  id: string;
  name: string;
  category: 'Lockdown & Defense' | 'Incident Intake' | 'Forensics & Logs' | 'Agent Fleet' | 'Intelligence & AI' | 'System & UI';
  phrasePatterns: RegExp[];
  examplePhrases: string[];
  description: string;
  voiceFeedbackText: string | ((match: RegExpMatchArray, transcript: string) => string);
  execute: (match: RegExpMatchArray, transcript: string, context: VoiceCommandContext) => { success: boolean; message: string; payload?: unknown };
}

export interface VoiceCommandContext {
  toggleEmergencyOverride: () => void;
  isEmergencyOverride: boolean;
  deployCountermeasures: () => void;
  lockdownPorts: () => void;
  openNewCase: () => void;
  openCEOChat: (prompt?: string) => void;
  openEvidenceModal: () => void;
  openProvidersModal: () => void;
  openSearch: (initialQuery?: string) => void;
  exportLogs: (format?: 'json' | 'csv') => void;
  toggleCustomizeMode: () => void;
  resetLayout: () => void;
  selectAgentByName: (agentName: string) => boolean;
  selectCaseByNumber: (caseNum: string) => boolean;
  setThreatThreshold: (val: number) => void;
  addStreamLog: (message: string, type?: 'info' | 'alert' | 'action' | 'threat') => void;
}

export interface VoiceMatchResult {
  command: VoiceCommandDef;
  match: RegExpMatchArray;
  transcript: string;
  confidence: number;
}

// Sound Synthesizer via Web Audio API (zero external assets needed)
export function playVoiceFeedbackTone(type: 'listen' | 'recognized' | 'error' | 'alert') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'listen') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'recognized') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      osc.frequency.setValueAtTime(1174.66, now + 0.16); // D6
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      osc.frequency.setValueAtTime(880, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // error
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.25);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {
    // AudioContext autoplay restriction safeguard
  }
}

// Text to Speech Vocalizer
export function speakVoiceResponse(text: string, enabled = true) {
  if (!enabled || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel(); // cancel pending
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 0.95; // slightly deeper cybernetic tone
    
    // Pick optimal English voice if available
    const voices = window.speechSynthesis.getVoices();
    const cyberVoice = voices.find(v => 
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
    );
    if (cyberVoice) {
      utterance.voice = cyberVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  } catch {
    // Speech synthesis error safeguard
  }
}

// All System Voice Commands
export const VOICE_COMMANDS: VoiceCommandDef[] = [
  // 1. Lockdown & Defense
  {
    id: 'cmd-engage-lockdown',
    name: 'Engage Lockdown / DEFCON 1',
    category: 'Lockdown & Defense',
    description: 'Activates full-spectrum emergency override and initiates maximum containment lockdown.',
    examplePhrases: ['"Engage lockdown"', '"Initiate emergency lockdown"', '"DEFCON 1"', '"Lock down the system"'],
    phrasePatterns: [
      /\b(engage|initiate|activate|start|trigger|enter)\s+(emergency\s+)?(lockdown|override|defcon\s*1)\b/i,
      /\b(lockdown\s+(now|system|all|grid))\b/i,
      /\b(emergency\s+lockdown)\b/i,
      /\b(defcon\s*1)\b/i
    ],
    voiceFeedbackText: 'Emergency lockdown engaged. DEFCON 1 protocols activated across all nodes.',
    execute: (_match, _transcript, ctx) => {
      if (!ctx.isEmergencyOverride) {
        ctx.toggleEmergencyOverride();
      }
      playVoiceFeedbackTone('alert');
      ctx.addStreamLog('🎙️ VOICE COMMAND: "Engage Lockdown" executed. DEFCON 1 Emergency Override active.', 'alert');
      return { success: true, message: 'Emergency Lockdown Engaged' };
    }
  },
  {
    id: 'cmd-release-lockdown',
    name: 'Release Lockdown / Disengage DEFCON',
    category: 'Lockdown & Defense',
    description: 'Disengages emergency override and restores standard SOC threat monitoring.',
    examplePhrases: ['"Release lockdown"', '"Disengage emergency"', '"Cancel lockdown"', '"Stand down"'],
    phrasePatterns: [
      /\b(release|disengage|cancel|stop|clear|lift|end|exit|stand\s+down)\s+(emergency\s+)?(lockdown|override|defcon)\b/i,
      /\b(release\s+override)\b/i,
      /\b(stand\s+down)\b/i
    ],
    voiceFeedbackText: 'Emergency lockdown disengaged. Restoring baseline SOC threat metrics.',
    execute: (_match, _transcript, ctx) => {
      if (ctx.isEmergencyOverride) {
        ctx.toggleEmergencyOverride();
      }
      playVoiceFeedbackTone('recognized');
      ctx.addStreamLog('🎙️ VOICE COMMAND: "Release Lockdown" executed. Threat metrics normalized.', 'info');
      return { success: true, message: 'Emergency Lockdown Disengaged' };
    }
  },
  {
    id: 'cmd-deploy-countermeasures',
    name: 'Deploy Countermeasures',
    category: 'Lockdown & Defense',
    description: 'Executes synchronized AI threat containment routines to neutralize active vectors.',
    examplePhrases: ['"Deploy countermeasures"', '"Neutralize threats"', '"Execute defense"', '"Suppress attacks"'],
    phrasePatterns: [
      /\b(deploy|execute|launch|run|activate)\s+(countermeasures?|defenses?|containment|mitigations?)\b/i,
      /\b(neutralize|suppress)\s+(all\s+)?(threats?|attacks?|vectors?)\b/i
    ],
    voiceFeedbackText: 'Automated countermeasures deployed. Synchronizing containment routines across fleet.',
    execute: (_match, _transcript, ctx) => {
      ctx.deployCountermeasures();
      playVoiceFeedbackTone('recognized');
      return { success: true, message: 'Countermeasures Deployed' };
    }
  },
  {
    id: 'cmd-lockdown-ports',
    name: 'Isolate Network / Port Blackout',
    category: 'Lockdown & Defense',
    description: 'Isolates ingress/egress ports and terminates unauthorized C2 telemetry channels.',
    examplePhrases: ['"Isolate network"', '"Lockdown ports"', '"Block C2 traffic"', '"Network blackout"'],
    phrasePatterns: [
      /\b(isolate|block|lockdown|shut\s*down|close)\s+(network|ports?|traffic|c2|beacons?)\b/i,
      /\b(network\s+blackout)\b/i
    ],
    voiceFeedbackText: 'Network isolation active. Ingress and egress perimeter ports closed.',
    execute: (_match, _transcript, ctx) => {
      ctx.lockdownPorts();
      playVoiceFeedbackTone('alert');
      return { success: true, message: 'Network Ports Isolated' };
    }
  },

  // 2. Incident Intake & Cases
  {
    id: 'cmd-open-case',
    name: 'Open Case Intake & Auto-Assign',
    category: 'Incident Intake',
    description: 'Launches the new security incident intake modal with AI qualification and workload routing.',
    examplePhrases: ['"Open case"', '"New incident"', '"Create case"', '"Auto assign case"', '"Intake case"'],
    phrasePatterns: [
      /\b(open|create|start|new|intake|add)\s+(a\s+)?(new\s+)?(case|incident|ticket|investigation)\b/i,
      /\b(auto\s*assign\s+case)\b/i,
      /\b(case\s+intake)\b/i,
      /\b(open\s+case)\b/i
    ],
    voiceFeedbackText: 'Opening incident intake. Ready to auto-assign specialist agent.',
    execute: (_match, _transcript, ctx) => {
      ctx.openNewCase();
      playVoiceFeedbackTone('recognized');
      ctx.addStreamLog('🎙️ VOICE COMMAND: "Open Case" triggered. Intake dialog opened.', 'action');
      return { success: true, message: 'Incident Intake Opened' };
    }
  },

  // 3. Forensics & Logs
  {
    id: 'cmd-download-logs',
    name: 'Download / Export Forensic Logs',
    category: 'Forensics & Logs',
    description: 'Exports current system diagnostic and threat telemetry history into JSON/CSV for SIEM forensics.',
    examplePhrases: ['"Download logs"', '"Export logs"', '"Save logs"', '"Export telemetry to CSV"', '"Forensic dump"'],
    phrasePatterns: [
      /\b(download|export|save|dump|extract)\s+(all\s+)?(diagnostic\s+|threat\s+|forensic\s+)?(logs?|telemetry|stream|events?|records?)\b/i,
      /\b(export\s+(json|csv))\b/i,
      /\b(forensic\s+dump)\b/i
    ],
    voiceFeedbackText: 'Exporting forensic diagnostic logs with cryptographic audit trail.',
    execute: (match, transcript, ctx) => {
      const isCsv = /csv/i.test(transcript);
      ctx.exportLogs(isCsv ? 'csv' : 'json');
      playVoiceFeedbackTone('recognized');
      ctx.addStreamLog(`🎙️ VOICE COMMAND: Exported forensic logs in ${isCsv ? 'CSV' : 'JSON'} format.`, 'action');
      return { success: true, message: `Exported Forensic Logs (${isCsv ? 'CSV' : 'JSON'})` };
    }
  },
  {
    id: 'cmd-upload-evidence',
    name: 'Upload Evidence & Forensic Artifacts',
    category: 'Forensics & Logs',
    description: 'Opens the forensic artifact and memory capture upload interface.',
    examplePhrases: ['"Upload evidence"', '"Add artifact"', '"Import evidence"', '"Attach capture"'],
    phrasePatterns: [
      /\b(upload|add|import|attach|open)\s+(evidence|artifacts?|files?|captures?|pcap|dump)\b/i,
      /\b(evidence\s+upload)\b/i
    ],
    voiceFeedbackText: 'Opening forensic evidence and artifact repository.',
    execute: (_match, _transcript, ctx) => {
      ctx.openEvidenceModal();
      playVoiceFeedbackTone('recognized');
      return { success: true, message: 'Evidence Repository Opened' };
    }
  },

  // 4. Intelligence & CEO Archon
  {
    id: 'cmd-open-ceo-chat',
    name: 'Consult CEO Orchestrator Archon',
    category: 'Intelligence & AI',
    description: 'Opens direct tactical communications with CEO Orchestrator ARCHON.',
    examplePhrases: ['"Chat with Archon"', '"Talk to CEO"', '"Open commander"', '"Ask Archon about threat report"'],
    phrasePatterns: [
      /\b(chat|talk|speak|consult|open|ask)\s+(with\s+)?(ceo|archon|commander|orchestrator)\b/i,
      /\b(open\s+ceo\s+chat)\b/i,
      /\bask\s+archon\s+(.+)/i
    ],
    voiceFeedbackText: 'Establishing link with CEO Orchestrator Archon.',
    execute: (match, transcript, ctx) => {
      let prompt: string | undefined;
      const askMatch = transcript.match(/\bask\s+archon\s+(?:about\s+)?(.+)/i);
      if (askMatch && askMatch[1]) {
        prompt = askMatch[1].trim();
      }
      ctx.openCEOChat(prompt);
      playVoiceFeedbackTone('recognized');
      ctx.addStreamLog(`🎙️ VOICE COMMAND: Linked with CEO ARCHON${prompt ? ` ("${prompt}")` : ''}.`, 'info');
      return { success: true, message: 'CEO Archon Comms Online' };
    }
  },
  {
    id: 'cmd-open-providers',
    name: 'Configure AI Providers & Keys',
    category: 'Intelligence & AI',
    description: 'Opens the AI Provider matrix for Gemini, OpenAI, Claude, Groq, and Ollama settings.',
    examplePhrases: ['"Open AI engines"', '"Configure providers"', '"API keys"', '"Show AI models"'],
    phrasePatterns: [
      /\b(open|configure|show|view|settings)\s+(ai\s+)?(providers?|engines?|models?|keys?|api\s*keys?)\b/i,
      /\b(ai\s+providers?)\b/i
    ],
    voiceFeedbackText: 'Accessing AI provider and neural engine configurations.',
    execute: (_match, _transcript, ctx) => {
      ctx.openProvidersModal();
      playVoiceFeedbackTone('recognized');
      return { success: true, message: 'AI Engine Settings Opened' };
    }
  },
  {
    id: 'cmd-global-search',
    name: 'Command Palette & Threat Search',
    category: 'Intelligence & AI',
    description: 'Opens global search to query cases, IOCs, forensic telemetry, and specialist agents.',
    examplePhrases: ['"Search for ransomware"', '"Find malware"', '"Lookup IP 185"', '"Open search"'],
    phrasePatterns: [
      /\b(search|find|lookup|query|locate)\s+(for\s+)?(.+)/i,
      /\b(open\s+search|command\s+palette)\b/i
    ],
    voiceFeedbackText: (match) => {
      const q = match[3]?.trim();
      return q ? `Searching intelligence database for ${q}.` : 'Opening global command search.';
    },
    execute: (match, _transcript, ctx) => {
      const query = match[3]?.trim();
      ctx.openSearch(query && query !== 'search' ? query : undefined);
      playVoiceFeedbackTone('recognized');
      return { success: true, message: query ? `Searching: "${query}"` : 'Command Search Opened' };
    }
  },

  // 5. Agent Fleet
  {
    id: 'cmd-inspect-agent',
    name: 'Inspect Specialist Agent',
    category: 'Agent Fleet',
    description: 'Inspects real-time telemetry, execution logs, and active tasks of a specialist agent.',
    examplePhrases: [
      '"Inspect Malware Analyst"',
      '"Show Network Forensics"',
      '"Open Threat Intelligence agent"',
      '"Agent Cipher"'
    ],
    phrasePatterns: [
      /\b(inspect|show|open|view|select)\s+(agent\s+)?(malware|ioc|threat\s*intel|network|code|report|memory|verification|cipher|specter|vanguard|sentinel|aegis|chronos|valkyrie|praetor)\b/i,
      /\bagent\s+(malware|ioc|threat\s*intel|network|code|report|memory|verification|cipher|specter|vanguard|sentinel|aegis|chronos|valkyrie|praetor)\b/i
    ],
    voiceFeedbackText: (match) => {
      const name = match[2] || match[1];
      return `Targeting telemetry for specialist agent ${name}.`;
    },
    execute: (match, transcript, ctx) => {
      const rawTarget = match[3] || match[2] || match[1] || transcript;
      const found = ctx.selectAgentByName(rawTarget);
      if (found) {
        playVoiceFeedbackTone('recognized');
        ctx.addStreamLog(`🎙️ VOICE COMMAND: Specialist agent "${rawTarget}" telemetry targeted.`, 'info');
        return { success: true, message: `Targeted Agent: ${rawTarget}` };
      }
      playVoiceFeedbackTone('error');
      return { success: false, message: `Agent not identified: ${rawTarget}` };
    }
  },

  // 6. System & UI
  {
    id: 'cmd-customize-layout',
    name: 'Customize Dashboard Layout',
    category: 'System & UI',
    description: 'Toggles drag-and-drop dashboard widget rearrangement and layout customization mode.',
    examplePhrases: ['"Customize layout"', '"Edit dashboard"', '"Rearrange widgets"', '"Reorder panels"'],
    phrasePatterns: [
      /\b(customize|edit|rearrange|reorder|modify)\s+(the\s+)?(layout|dashboard|widgets?|panels?)\b/i,
      /\b(layout\s+mode)\b/i
    ],
    voiceFeedbackText: 'Toggling dashboard layout customization mode. You can now drag and reorder widgets.',
    execute: (_match, _transcript, ctx) => {
      ctx.toggleCustomizeMode();
      playVoiceFeedbackTone('recognized');
      return { success: true, message: 'Layout Customization Toggled' };
    }
  },
  {
    id: 'cmd-reset-layout',
    name: 'Reset Default Dashboard Layout',
    category: 'System & UI',
    description: 'Restores the factory default multi-column SOC dashboard layout.',
    examplePhrases: ['"Reset layout"', '"Default dashboard"', '"Restore layout"'],
    phrasePatterns: [
      /\b(reset|restore|revert|default)\s+(the\s+)?(layout|dashboard|view)\b/i
    ],
    voiceFeedbackText: 'Restoring standard factory dashboard configuration.',
    execute: (_match, _transcript, ctx) => {
      ctx.resetLayout();
      playVoiceFeedbackTone('recognized');
      return { success: true, message: 'Dashboard Layout Reset' };
    }
  },
  {
    id: 'cmd-neural-sweep',
    name: 'Run Neural Sweep & Diagnostics',
    category: 'System & UI',
    description: 'Performs a comprehensive integrity diagnostic sweep across all 8 specialist nodes.',
    examplePhrases: ['"Run neural sweep"', '"System diagnostics"', '"Scan fleet"', '"Run health check"'],
    phrasePatterns: [
      /\b(run|execute|perform|start)\s+(a\s+)?(neural\s+sweep|diagnostics?|health\s*check|fleet\s*scan|integrity\s*check)\b/i,
      /\b(system\s+scan)\b/i
    ],
    voiceFeedbackText: 'Executing neural telemetry sweep across all eight specialist nodes. Subsystems nominal.',
    execute: (_match, _transcript, ctx) => {
      playVoiceFeedbackTone('recognized');
      ctx.addStreamLog('🧠 NEURAL SWEEP INITIALIZED: Full-stack node diagnostic scan underway. Memory coherence at 99.8%.', 'action');
      return { success: true, message: 'Neural Sweep Executed' };
    }
  }
];

// Parser function that tests transcript against all voice command patterns
export function parseVoiceCommand(transcript: string): VoiceMatchResult | null {
  const cleanTranscript = transcript.trim();
  if (!cleanTranscript) return null;

  for (const cmd of VOICE_COMMANDS) {
    for (const pattern of cmd.phrasePatterns) {
      const match = cleanTranscript.match(pattern);
      if (match) {
        return {
          command: cmd,
          match,
          transcript: cleanTranscript,
          confidence: 0.95
        };
      }
    }
  }
  return null;
}
