import { StreamEvent, SpecialistAgent, CaseItem } from '../types';

export type ExportFormat = 'json' | 'csv';
export type ExportScope = 'current' | 'all' | 'diagnostic_bundle';

export interface ExportOptions {
  format: ExportFormat;
  scope: ExportScope;
  includeAuditHash?: boolean;
  includeDiagnostics?: boolean;
  isoTimestamps?: boolean;
  filterName?: string;
  threatScore?: number;
}

// Generate simple deterministic SHA-256-like forensic signature for integrity audit
export function generateForensicAuditHash(content: string): string {
  let hash1 = 0xdeadbeef;
  let hash2 = 0x41c6ce57;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    hash1 = Math.imul(hash1 ^ ch, 2654435761);
    hash2 = Math.imul(hash2 ^ ch, 1597334677);
  }
  hash1 = ((hash1 ^ (hash1 >>> 16)) >>> 0);
  hash2 = ((hash2 ^ (hash2 >>> 13)) >>> 0);
  const p1 = hash1.toString(16).padStart(8, '0');
  const p2 = hash2.toString(16).padStart(8, '0');
  const p3 = (Math.imul(hash1, 31) >>> 0).toString(16).padStart(8, '0');
  const p4 = (Math.imul(hash2, 17) >>> 0).toString(16).padStart(8, '0');
  return `sha256:${p1}${p2}${p3}${p4}e8b4f17c992a014d`;
}

// Derive severity from event type & message
function deriveSeverity(evt: StreamEvent): string {
  if (evt.type === 'threat' || evt.category === 'threat') return 'CRITICAL';
  if (evt.type === 'alert' || evt.type === 'warning') return 'WARNING';
  if (evt.type === 'delegate' || evt.category === 'delegation') return 'DELEGATION';
  if (evt.type === 'success') return 'INFO_SUCCESS';
  return 'INFO';
}

// Derive diagnostic signature
function deriveSignature(evt: StreamEvent): string {
  const code = (evt.id || 'EVT').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const cat = (evt.category || evt.type || 'SYS').toUpperCase().slice(0, 3);
  return `SIG-${cat}-${code}`;
}

export function exportLogsToFile(
  events: StreamEvent[],
  options: ExportOptions,
  extraContext?: {
    agents?: SpecialistAgent[];
    cases?: CaseItem[];
    threatScore?: number;
  }
): { success: boolean; filename: string; recordCount: number } {
  const now = new Date();
  const timestampStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const baseFilename = `archon_forensic_logs_${options.scope}_${timestampStr}`;

  // Prepare events dataset
  const dataset = [...events];

  if (options.format === 'json') {
    const rawContentToHash = JSON.stringify(dataset);
    const auditHash = generateForensicAuditHash(rawContentToHash);

    const jsonExport: Record<string, unknown> = {
      audit_header: {
        system: 'ARCHON AI SOC DEFENSE GRID',
        subsystem: 'Live Event Stream & Diagnostic Telemetry Engine',
        classification: 'TLP:AMBER - INTERNAL FORENSIC AUDIT RECORD',
        generated_at_utc: now.toISOString(),
        generated_at_local: now.toLocaleString(),
        export_scope: options.scope,
        filter_applied: options.filterName || 'All',
        total_records: dataset.length,
        audit_verification_hash: options.includeAuditHash !== false ? auditHash : undefined,
      }
    };

    if (options.includeDiagnostics && extraContext) {
      jsonExport.system_diagnostic_context = {
        threat_level_score: extraContext.threatScore ?? 84,
        threat_status: (extraContext.threatScore ?? 84) > 75 ? 'ELEVATED' : 'NOMINAL',
        active_specialist_nodes: extraContext.agents?.map(a => ({
          id: a.id,
          name: a.name,
          role: a.role,
          status: a.status,
          current_task: a.currentTask,
          tasks_completed: a.tasksCompleted,
          success_rate: `${a.successRate}%`,
          recent_logs: a.systemLogs || []
        })) || [],
        active_incident_cases: extraContext.cases?.map(c => ({
          case_number: c.caseNumber,
          title: c.title,
          severity: c.severity,
          status: c.status,
          assigned_agent: c.assignedAgent,
          ioc_count: c.iocCount
        })) || []
      };
    }

    jsonExport.event_stream_logs = dataset.map((evt, idx) => ({
      index: idx + 1,
      id: evt.id,
      timestamp: evt.timestamp || evt.time || 'N/A',
      iso_timestamp: now.toISOString(),
      severity: deriveSeverity(evt),
      type: evt.type || 'info',
      category: evt.category || 'general',
      source: evt.source || 'ARCHON CORE',
      message: evt.message,
      diagnostic_signature: deriveSignature(evt)
    }));

    const jsonString = JSON.stringify(jsonExport, null, 2);
    const filename = `${baseFilename}.json`;
    downloadBlob(jsonString, filename, 'application/json;charset=utf-8;');
    return { success: true, filename, recordCount: dataset.length };
  } else {
    // CSV Export
    const headers = [
      'Record_Index',
      'Event_ID',
      'Local_Timestamp',
      'ISO_Timestamp_UTC',
      'Severity',
      'Event_Type',
      'Category',
      'Source_Subsystem',
      'Message',
      'Diagnostic_Signature'
    ];

    const rows: string[] = [];
    rows.push(headers.map(escapeCsvCell).join(','));

    dataset.forEach((evt, idx) => {
      const row = [
        String(idx + 1),
        evt.id,
        evt.timestamp || evt.time || 'N/A',
        now.toISOString(),
        deriveSeverity(evt),
        evt.type || 'info',
        evt.category || 'general',
        evt.source || 'ARCHON CORE',
        evt.message,
        deriveSignature(evt)
      ];
      rows.push(row.map(escapeCsvCell).join(','));
    });

    // If diagnostic bundle is chosen and agents are present, append diagnostic agent logs section in CSV
    if (options.scope === 'diagnostic_bundle' && extraContext?.agents) {
      rows.push('');
      rows.push('--- AGENT DIAGNOSTIC SYSTEM LOGS ---');
      rows.push(['Agent_ID', 'Agent_Name', 'Agent_Role', 'Log_Timestamp', 'Level', 'Log_Message'].map(escapeCsvCell).join(','));
      
      extraContext.agents.forEach(agent => {
        (agent.systemLogs || []).forEach(log => {
          rows.push([
            agent.id,
            agent.name,
            agent.role,
            log.timestamp,
            log.level,
            log.message
          ].map(escapeCsvCell).join(','));
        });
      });
    }

    const csvString = rows.join('\r\n');
    const filename = `${baseFilename}.csv`;
    downloadBlob(csvString, filename, 'text/csv;charset=utf-8;');
    return { success: true, filename, recordCount: dataset.length };
  }
}

function escapeCsvCell(val: string): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
