import React, { useMemo, useState } from "react";
import { FolderArchive, FileText, Clock, Download, Plus, Search } from "lucide-react";
import { CaseItem, ActivityItem, StreamEvent } from "../../types";
import { PageShell, Panel, StatTile, Pill, severityTone } from "./PageShell";

const btn =
  "flex items-center gap-1.5 rounded-md border border-purple-500/40 bg-purple-500/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-purple-200 transition-colors hover:bg-purple-500/20";

export const CasesPage: React.FC<{
  cases: CaseItem[];
  onSelectCase: (c: CaseItem) => void;
  onNewCase: () => void;
}> = ({ cases, onSelectCase, onNewCase }) => {
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState("ALL");

  const filtered = useMemo(
    () =>
      cases.filter(
        (c) =>
          (severity === "ALL" || (c.severity || "").toLowerCase() === severity.toLowerCase()) &&
          `${c.title} ${c.caseNumber} ${c.assignedAgent}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      ),
    [cases, query, severity],
  );

  return (
    <PageShell
      title="CASE REGISTRY"
      subtitle="Every incident intake tracked by the ARCHON orchestrator, with assigned specialist, IOC yield and verification confidence."
      icon={<FolderArchive className="h-4 w-4" />}
      actions={
        <button onClick={onNewCase} className={btn}>
          <Plus className="h-3 w-3" /> New Case
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total Cases" value={cases.length} />
        <StatTile
          label="Critical"
          value={cases.filter((c) => (c.severity || "").toLowerCase() === "critical").length}
          tone="text-rose-300"
        />
        <StatTile
          label="In Progress"
          value={cases.filter((c) => (c.status || "").toLowerCase().includes("progress")).length}
          tone="text-amber-300"
        />
        <StatTile
          label="Avg Confidence"
          value={`${Math.round(cases.reduce((a, c) => a + (c.confidence || 0), 0) / Math.max(cases.length, 1))}%`}
          tone="text-emerald-300"
        />
      </div>

      <Panel
        title={`CASES (${filtered.length})`}
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded border border-purple-500/30 bg-black/40 px-2 py-1">
              <Search className="h-3 w-3 text-purple-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter cases…"
                className="w-36 bg-transparent font-mono text-[10px] text-purple-100 outline-none placeholder:text-purple-300/40"
              />
            </div>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="rounded border border-purple-500/30 bg-black/40 px-2 py-1 font-mono text-[10px] text-purple-200 outline-none"
            >
              {["ALL", "Critical", "High", "Medium", "Low"].map((s) => (
                <option key={s} value={s} className="bg-[#0b0418]">
                  {s}
                </option>
              ))}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-purple-500/20 font-mono text-[9px] uppercase tracking-[0.15em] text-purple-300/60">
                <th className="py-2">Case</th>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assigned</th>
                <th>IOCs</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectCase(c)}
                  className="cursor-pointer border-b border-purple-500/10 transition-colors hover:bg-purple-500/10"
                >
                  <td className="py-2 font-mono text-[10px] text-purple-300">{c.caseNumber}</td>
                  <td className="pr-3 font-mono text-[11px] text-white">{c.title}</td>
                  <td>
                    <Pill tone={severityTone(c.severity)}>{c.severity}</Pill>
                  </td>
                  <td className="font-mono text-[10px] text-purple-200/70">{c.status}</td>
                  <td className="font-mono text-[10px] text-purple-200/70">{c.assignedAgent}</td>
                  <td className="font-mono text-[10px] text-rose-300">{c.iocCount}</td>
                  <td className="font-mono text-[10px] text-emerald-300">{c.confidence}%</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center font-mono text-[10px] text-purple-300/50"
                  >
                    No cases match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
};

export const ReportsPage: React.FC<{
  cases: CaseItem[];
  onSelectCase: (c: CaseItem) => void;
  onExportLogs: () => void;
}> = ({ cases, onSelectCase, onExportLogs }) => {
  const [selected, setSelected] = useState<CaseItem | undefined>(cases[0]);
  const active = selected || cases[0];

  return (
    <PageShell
      title="INVESTIGATION REPORTS"
      subtitle="Auto-generated incident write-ups assembled from correlated agent findings, verified IOCs and MITRE mappings."
      icon={<FileText className="h-4 w-4" />}
      actions={
        <button onClick={onExportLogs} className={btn}>
          <Download className="h-3 w-3" /> Export Logs
        </button>
      }
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Panel title="REPORT INDEX" className="lg:col-span-1">
          <div className="space-y-1.5">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full rounded-lg border p-2 text-left transition-colors ${
                  active?.id === c.id
                    ? "border-purple-400/60 bg-purple-500/15"
                    : "border-purple-500/20 hover:bg-purple-500/10"
                }`}
              >
                <p className="font-mono text-[9px] text-purple-300/70">
                  RPT-{c.caseNumber} · {c.timestamp}
                </p>
                <p className="font-mono text-[11px] text-white">{c.title}</p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title={active ? `RPT-${active.caseNumber}` : "REPORT"} className="lg:col-span-2">
          {active ? (
            <div className="space-y-3 font-mono text-[11px] leading-relaxed text-purple-100/80">
              <div className="flex flex-wrap gap-2">
                <Pill tone={severityTone(active.severity)}>{active.severity}</Pill>
                <Pill>{active.status}</Pill>
                <Pill>Confidence {active.confidence}%</Pill>
                <Pill>{active.iocCount} IOCs</Pill>
              </div>
              <div>
                <p className="mb-1 font-cyber text-[10px] tracking-[0.2em] text-purple-300">
                  EXECUTIVE SUMMARY
                </p>
                <p>
                  Incident <span className="text-white">{active.title}</span> was escalated to
                  Commander ARCHON and delegated to{" "}
                  <span className="text-white">{active.assignedAgent}</span>. Specialist analysis
                  correlated {active.iocCount} indicators across telemetry, threat intel and
                  forensic artifacts, producing a verified verdict at {active.confidence}%
                  confidence.
                </p>
              </div>
              <div>
                <p className="mb-1 font-cyber text-[10px] tracking-[0.2em] text-purple-300">
                  METHODOLOGY
                </p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Intake triage and severity scoring by the orchestrator.</li>
                  <li>Task decomposition into malware, network and intel work packages.</li>
                  <li>Parallel specialist execution with streamed progress telemetry.</li>
                  <li>Cross-agent IOC correlation and verification pass.</li>
                </ul>
              </div>
              <div>
                <p className="mb-1 font-cyber text-[10px] tracking-[0.2em] text-purple-300">
                  RECOMMENDED ACTIONS
                </p>
                <ul className="list-disc space-y-1 pl-4">
                  <li>Block all malicious indicators at the perimeter and DNS layer.</li>
                  <li>Isolate affected hosts and capture volatile memory for deep forensics.</li>
                  <li>Rotate credentials for identities observed in the attack path.</li>
                </ul>
              </div>
              <button onClick={() => onSelectCase(active)} className={btn}>
                Open Full Case File
              </button>
            </div>
          ) : (
            <p className="font-mono text-[10px] text-purple-300/50">No reports available.</p>
          )}
        </Panel>
      </div>
    </PageShell>
  );
};

export const TimelinePage: React.FC<{
  activities: ActivityItem[];
  streamEvents: StreamEvent[];
}> = ({ activities, streamEvents }) => {
  const entries = useMemo(
    () => [
      ...activities.map((a) => ({
        id: a.id,
        time: a.timestamp,
        source: a.agentName || a.agent || "AGENT",
        message: a.action,
        kind: a.type || "activity",
      })),
      ...streamEvents.map((s) => ({
        id: s.id,
        time: s.timestamp || s.time || "",
        source: s.source || "SYSTEM",
        message: s.message,
        kind: s.type || "event",
      })),
    ],
    [activities, streamEvents],
  );

  return (
    <PageShell
      title="OPERATION TIMELINE"
      subtitle="Chronological reconstruction of every orchestration decision, specialist action and system event."
      icon={<Clock className="h-4 w-4" />}
    >
      <Panel title={`TIMELINE (${entries.length} EVENTS)`}>
        <div className="relative space-y-3 pl-5">
          <span className="absolute left-1.5 top-1 h-[calc(100%-0.5rem)] w-px bg-gradient-to-b from-purple-500/60 to-transparent" />
          {entries.map((e) => (
            <div key={`${e.id}-${e.time}`} className="relative">
              <span className="absolute -left-[15px] top-1.5 h-2 w-2 rounded-full border border-purple-400/60 bg-purple-500/60" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[9px] text-purple-300/60">{e.time}</span>
                <Pill>{e.source}</Pill>
                <Pill tone={severityTone(String(e.kind))}>{String(e.kind)}</Pill>
              </div>
              <p className="mt-0.5 font-mono text-[11px] text-purple-100/85">{e.message}</p>
            </div>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
};
