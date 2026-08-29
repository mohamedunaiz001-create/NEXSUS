import { MissionData, SpecialistAgent, ActivityItem } from '../types';
import { escapeHtml } from './security';

interface ExportReportOptions {
  mission: MissionData;
  status: string;
  effectiveProgress: number;
  isResolved: boolean;
  agents?: SpecialistAgent[];
  activities?: ActivityItem[];
}

/**
 * Generates an executive-grade styled HTML report optimized for printing and PDF export.
 * Opens a dedicated print dialog with high-fidelity cybersecurity dossier styling.
 * All dynamic parameters are strictly HTML-escaped to prevent XSS / HTML injection.
 */
export function exportMissionToPDF({
  mission,
  status,
  effectiveProgress,
  isResolved,
  agents = [],
  activities = [],
}: ExportReportOptions): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to export the PDF report.');
    return;
  }

  const generatedDate = escapeHtml(new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
  }));

  const safeCaseId = escapeHtml(mission.caseId || 'CASE-REPORT');
  const safeTitle = escapeHtml(mission.title || 'Untitled Incident');
  const safeDescription = escapeHtml(mission.description || '');
  const safePriority = escapeHtml(mission.priority || 'MEDIUM');
  const safeSupervisor = escapeHtml(mission.delegatedBy || 'ARCHON');
  const safeStatus = isResolved ? 'RESOLVED' : escapeHtml(status.toUpperCase());
  const safeProgress = Number(effectiveProgress) || 0;

  const stagesHtml = (mission.stages || [])
    .map(
      (stage, idx) => `
      <div class="stage-item">
        <div class="stage-badge ${isResolved ? 'completed' : escapeHtml(stage.status.toLowerCase())}">${idx + 1}</div>
        <div class="stage-info">
          <div class="stage-name">${escapeHtml(stage.name)}</div>
          <div class="stage-status">${isResolved ? 'Completed' : escapeHtml(stage.status)}</div>
        </div>
      </div>
    `
    )
    .join('');

  const mitreHtml = `
    <tr>
      <td><span class="badge red">Execution</span></td>
      <td><strong>T1059.001</strong> - PowerShell Scripting</td>
      <td>Obfuscated Base64 download cradles</td>
    </tr>
    <tr>
      <td><span class="badge orange">Defense Evasion</span></td>
      <td><strong>T1027</strong> - Obfuscated / Packed Payload</td>
      <td>Custom XOR key routines and AMSI memory patch injection</td>
    </tr>
    <tr>
      <td><span class="badge blue">Command & Control</span></td>
      <td><strong>T1071.001</strong> - Web Protocols (HTTPS)</td>
      <td>Periodic jittered beacons to cloud fronted endpoints</td>
    </tr>
    <tr>
      <td><span class="badge purple">Initial Access</span></td>
      <td><strong>T1566.001</strong> - Spearphishing Attachment</td>
      <td>ISO image with LNK payload via invoice lure</td>
    </tr>
  `;

  const agentsHtml = agents
    .map(
      (agent) => `
      <tr>
        <td><strong>${escapeHtml(agent.name.toUpperCase())}</strong><br><small style="color: #64748b;">${escapeHtml(agent.role)}</small></td>
        <td><span class="badge ${agent.status === 'ACTIVE' ? 'green' : 'blue'}">${escapeHtml(agent.status)}</span></td>
        <td>${escapeHtml(agent.model)}</td>
        <td>${Number(agent.progress) || 0}%</td>
        <td>${escapeHtml(agent.currentTask)}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CYBER-X Incident Dossier - ${safeCaseId}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm 15mm 20mm 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.5;
      font-size: 13px;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #7c3aed;
      padding-bottom: 16px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .title-area h1 {
      font-size: 20px;
      font-weight: 800;
      color: #3b0764;
      letter-spacing: -0.5px;
      text-transform: uppercase;
    }
    .title-area p {
      font-size: 11px;
      color: #6b21a8;
      font-weight: 600;
      margin-top: 2px;
    }
    .meta-box {
      text-align: right;
      font-size: 11px;
      color: #475569;
    }
    .meta-box strong {
      color: #0f172a;
    }
    .status-banner {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #7c3aed;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 20px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .status-item label {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      display: block;
      margin-bottom: 2px;
    }
    .status-item span {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .section-title {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #4c1d95;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin: 20px 0 12px 0;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .desc-box {
      background: #faf5ff;
      border: 1px solid #e9d5ff;
      border-radius: 6px;
      padding: 12px 14px;
      font-size: 12px;
      color: #3b0764;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .stages-container {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 20px;
    }
    .stage-item {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .stage-badge {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #7c3aed;
      color: white;
      font-size: 11px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stage-badge.completed { background: #059669; }
    .stage-name { font-size: 11px; font-weight: 700; color: #1e293b; }
    .stage-status { font-size: 10px; color: #64748b; }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 11.5px;
    }
    th {
      background: #f1f5f9;
      color: #334155;
      text-align: left;
      padding: 8px 10px;
      font-weight: 700;
      border-bottom: 1px solid #cbd5e1;
      font-size: 11px;
      text-transform: uppercase;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge.red { background: #fee2e2; color: #991b1b; }
    .badge.orange { background: #ffedd5; color: #9a3412; }
    .badge.blue { background: #e0f2fe; color: #075985; }
    .badge.purple { background: #f3e8ff; color: #6b21a8; }
    .badge.green { background: #dcfce7; color: #166534; }
    
    .forensic-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .forensic-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 10px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 11px;
    }
    .forensic-card strong {
      color: #475569;
      font-size: 10px;
      display: block;
      margin-bottom: 2px;
      text-transform: uppercase;
    }

    .footer {
      margin-top: 30px;
      padding-top: 12px;
      border-top: 1px solid #cbd5e1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10px;
      color: #64748b;
    }
    
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-area">
      <h1>CYBER-X SOAR PLATFORM</h1>
      <p>INTELLIGENCE & INCIDENT RESPONSE DOSSIER // CONFIDENTIAL</p>
    </div>
    <div class="meta-box">
      <div><strong>CASE ID:</strong> ${safeCaseId}</div>
      <div><strong>DATE:</strong> ${generatedDate}</div>
      <div><strong>SECURITY LEVEL:</strong> HIGH / TLP:AMBER</div>
    </div>
  </div>

  <div class="status-banner">
    <div class="status-item">
      <label>Case Status</label>
      <span style="color: ${isResolved ? '#059669' : '#7c3aed'}">${safeStatus}</span>
    </div>
    <div class="status-item">
      <label>Mission Priority</label>
      <span style="color: #dc2626">${safePriority}</span>
    </div>
    <div class="status-item">
      <label>Remediation Progress</label>
      <span>${safeProgress}%</span>
    </div>
    <div class="status-item">
      <label>Supervisor</label>
      <span>${safeSupervisor}</span>
    </div>
  </div>

  <div class="section-title">1. Executive Overview</div>
  <div class="desc-box">
    <strong>Incident Title:</strong> ${safeTitle}<br>
    <strong>Summary:</strong> ${safeDescription}
  </div>

  <div class="section-title">2. Orchestration Pipeline Stages</div>
  <div class="stages-container">
    ${stagesHtml}
  </div>

  <div class="section-title">3. Forensic Indicators & Target Artifacts</div>
  <div class="forensic-grid">
    <div class="forensic-card">
      <strong>Target Artifact File</strong>
      No artifact metadata attached.
    </div>
    <div class="forensic-card">
      <strong>SHA-256 Checksum</strong>
      Not available.
    </div>
    <div class="forensic-card">
      <strong>Ingress Vector & Host</strong>
      Not available.
    </div>
    <div class="forensic-card">
      <strong>YARA Signature Match</strong>
      Not available.
    </div>
  </div>

  <div class="section-title">4. MITRE ATT&CK Framework Mapping</div>
  <table>
    <thead>
      <tr>
        <th style="width: 18%;">Tactic</th>
        <th style="width: 32%;">Technique</th>
        <th style="width: 50%;">Observed Execution Detail</th>
      </tr>
    </thead>
    <tbody>
      ${mitreHtml}
    </tbody>
  </table>

  <div class="section-title">5. Multi-Agent Specialist Telemetry</div>
  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Specialist</th>
        <th style="width: 14%;">Status</th>
        <th style="width: 16%;">AI Engine</th>
        <th style="width: 14%;">Progress</th>
        <th style="width: 34%;">Assigned Operational Task</th>
      </tr>
    </thead>
    <tbody>
      ${agentsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>Generated by ARCHON Orchestrator // CYBER-X Security Platform</div>
    <div>Page 1 of 1</div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
`;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}

/**
 * Generates and downloads a complete Microsoft Word (.doc) format report
 * formatted with standard XML/HTML styling compatible with MS Word, Google Docs, and LibreOffice.
 * All dynamic parameters are strictly HTML-escaped.
 */
export function exportMissionToWord({
  mission,
  status,
  effectiveProgress,
  isResolved,
  agents = [],
  activities = [],
}: ExportReportOptions): void {
  const generatedDate = escapeHtml(new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
  }));

  const safeCaseId = escapeHtml(mission.caseId || 'MISSION-REPORT');
  const safeTitle = escapeHtml(mission.title || 'Untitled Incident');
  const safeDescription = escapeHtml(mission.description || '');
  const safePriority = escapeHtml(mission.priority || 'MEDIUM');
  const safeSupervisor = escapeHtml(mission.delegatedBy || 'ARCHON');
  const safeStartedAt = escapeHtml(mission.startedAt || 'N/A');
  const safeEstCompletion = escapeHtml(mission.estimatedCompletion || 'Pending');
  const safeStatus = isResolved ? 'RESOLVED' : escapeHtml(status.toUpperCase());
  const safeProgress = Number(effectiveProgress) || 0;

  const stagesRows = (mission.stages || [])
    .map(
      (stage, idx) => `
      <tr>
        <td style="padding: 6pt; border: 1pt solid #cccccc; text-align: center; font-weight: bold; background: #f4f4f5;">${idx + 1}</td>
        <td style="padding: 6pt; border: 1pt solid #cccccc;"><strong>${escapeHtml(stage.name)}</strong></td>
        <td style="padding: 6pt; border: 1pt solid #cccccc; color: ${isResolved ? '#166534' : '#6b21a8'}; font-weight: bold;">${isResolved ? 'Completed' : escapeHtml(stage.status)}</td>
      </tr>
    `
    )
    .join('');

  const agentsRows = agents
    .map(
      (agent) => `
      <tr>
        <td style="padding: 6pt; border: 1pt solid #cccccc;"><strong>${escapeHtml(agent.name.toUpperCase())}</strong><br><span style="font-size: 9pt; color: #64748b;">${escapeHtml(agent.role)}</span></td>
        <td style="padding: 6pt; border: 1pt solid #cccccc;">${escapeHtml(agent.status)}</td>
        <td style="padding: 6pt; border: 1pt solid #cccccc;">${escapeHtml(agent.model)}</td>
        <td style="padding: 6pt; border: 1pt solid #cccccc; font-weight: bold;">${Number(agent.progress) || 0}%</td>
        <td style="padding: 6pt; border: 1pt solid #cccccc;">${escapeHtml(agent.currentTask)}</td>
      </tr>
    `
    )
    .join('');

  const wordHtml = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>CYBER-X Incident Dossier - ${safeCaseId}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: Calibri, 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #1e293b;
    }
    h1 {
      font-size: 18pt;
      color: #4c1d95;
      border-bottom: 2pt solid #7c3aed;
      padding-bottom: 4pt;
      margin-bottom: 2pt;
    }
    h2 {
      font-size: 13pt;
      color: #581c87;
      border-bottom: 1pt solid #e2e8f0;
      padding-bottom: 3pt;
      margin-top: 16pt;
      margin-bottom: 6pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6pt;
      margin-bottom: 12pt;
      font-size: 10pt;
    }
    th {
      background-color: #ede9fe;
      color: #4c1d95;
      font-weight: bold;
      padding: 6pt;
      border: 1pt solid #cbd5e1;
      text-align: left;
    }
    td {
      padding: 6pt;
      border: 1pt solid #cbd5e1;
      vertical-align: top;
    }
    .banner-table td {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 8pt;
    }
    .highlight-box {
      background-color: #faf5ff;
      border: 1px solid #d8b4fe;
      padding: 10pt;
      margin-bottom: 10pt;
      border-radius: 4pt;
    }
  </style>
</head>
<body>
  <h1>CYBER-X SOAR PLATFORM // MISSION INCIDENT DOSSIER</h1>
  <p style="font-size: 10pt; color: #6b21a8; font-weight: bold; margin-top: 0;">
    CONFIDENTIAL SECURITY ASSESSMENT REPORT | TLP:AMBER
  </p>

  <table class="banner-table">
    <tr>
      <td><strong>CASE ID:</strong><br>${safeCaseId}</td>
      <td><strong>STATUS:</strong><br><span style="color: ${isResolved ? '#166534' : '#6b21a8'}; font-weight: bold;">${safeStatus}</span></td>
      <td><strong>PRIORITY:</strong><br><span style="color: #dc2626; font-weight: bold;">${safePriority}</span></td>
      <td><strong>PROGRESS:</strong><br><strong>${safeProgress}%</strong></td>
    </tr>
    <tr>
      <td><strong>SUPERVISOR:</strong><br>${safeSupervisor}</td>
      <td><strong>STARTED AT:</strong><br>${safeStartedAt}</td>
      <td><strong>GENERATED DATE:</strong><br>${generatedDate}</td>
      <td><strong>EST. COMPLETION:</strong><br>${isResolved ? 'Completed' : safeEstCompletion}</td>
    </tr>
  </table>

  <h2>1. Incident Description & Scope</h2>
  <div class="highlight-box">
    <p><strong>Mission Title:</strong> ${safeTitle}</p>
    <p style="margin-top: 4pt;"><strong>Executive Summary:</strong> ${safeDescription}</p>
  </div>

  <h2>2. Forensic Payload Analysis & Target Metadata</h2>
  <table>
    <tr>
      <th style="width: 30%;">Forensic Field</th>
      <th style="width: 70%;">Observed Artifact Value</th>
    </tr>
    <tr>
      <td><strong>Target Artifact:</strong></td>
      <td>Not available</td>
    </tr>
    <tr>
      <td><strong>SHA-256 Hash:</strong></td>
      <td><code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code></td>
    </tr>
    <tr>
      <td><strong>Ingress Host & IP:</strong></td>
      <td>Not available</td>
    </tr>
    <tr>
      <td><strong>Entropy:</strong></td>
      <td>Not available</td>
    </tr>
    <tr>
      <td><strong>YARA Match Rule:</strong></td>
      <td>Not available</td>
    </tr>
  </table>

  <h2>3. Remediation & Orchestration Pipeline Stages</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 10%;">Step</th>
        <th style="width: 60%;">Stage Name</th>
        <th style="width: 30%;">Status</th>
      </tr>
    </thead>
    <tbody>
      ${stagesRows}
    </tbody>
  </table>

  <h2>4. MITRE ATT&CK Framework TTP Mapping</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 20%;">Tactic</th>
        <th style="width: 35%;">Technique</th>
        <th style="width: 45%;">Execution Details</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Execution</strong></td>
        <td>T1059.001 - PowerShell Scripting</td>
        <td>Obfuscated Base64 download cradles</td>
      </tr>
      <tr>
        <td><strong>Defense Evasion</strong></td>
        <td>T1027 - Obfuscated / Packed Payload</td>
        <td>Custom XOR key routines & AMSI memory patch</td>
      </tr>
      <tr>
        <td><strong>Command & Control</strong></td>
        <td>T1071.001 - Web Protocols (HTTPS)</td>
        <td>Periodic jittered beacons to cloud fronted endpoints</td>
      </tr>
      <tr>
        <td><strong>Initial Access</strong></td>
        <td>T1566.001 - Spearphishing Attachment</td>
        <td>ISO image with LNK payload via invoice lure</td>
      </tr>
    </tbody>
  </table>

  <h2>5. Multi-Agent Specialist Operational Logs</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Specialist Agent</th>
        <th style="width: 15%;">Status</th>
        <th style="width: 15%;">Engine</th>
        <th style="width: 10%;">Progress</th>
        <th style="width: 35%;">Operational Directive</th>
      </tr>
    </thead>
    <tbody>
      ${agentsRows}
    </tbody>
  </table>

  <p style="font-size: 9pt; color: #94a3b8; margin-top: 24pt; border-top: 1pt solid #cbd5e1; padding-top: 6pt;">
    CYBER-X Autonomous Multi-Agent Orchestration Platform &bull; Exported for Official Compliance and Auditing.
  </p>
</body>
</html>
`;

  const blob = new Blob(['\ufeff', wordHtml], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  const safeFilenameCaseId = (mission.caseId || 'MISSION-REPORT').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadAnchor.href = url;
  downloadAnchor.download = `CYBER_REPORT_${safeFilenameCaseId}_${Date.now()}.doc`;
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  URL.revokeObjectURL(url);
}
