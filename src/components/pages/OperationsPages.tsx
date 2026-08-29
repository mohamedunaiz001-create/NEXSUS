import React, { useMemo, useState } from "react";
import {
  Workflow,
  BarChart3,
  Activity,
  Settings,
  Plus,
  RefreshCw,
  Download,
  ShieldAlert,
  Sliders,
  Palette,
  Trash2,
  Bot,
  Cpu,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { SpecialistAgent, CaseItem, IOCItem, AIProvider, StreamEvent, ThemeMode } from "../../types";
import { PageShell, Panel, StatTile, Pill, severityTone } from "./PageShell";
import { THEMES } from "../layout/ThemeSwitcher";

const btn =
  "flex items-center gap-1.5 rounded-md border border-purple-500/40 bg-purple-500/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-purple-200 transition-colors hover:bg-purple-500/20";

/* ------------------------------------------------------------------ */
/* WORKFLOWS                                                          */
/* ------------------------------------------------------------------ */

const PIPELINE_STAGES = [
  { key: "intake", label: "Intake & Triage" },
  { key: "specialist", label: "Specialist Analysis" },
  { key: "correlation", label: "IOC Correlation" },
  { key: "verification", label: "Verification" },
  { key: "report", label: "Reporting" },
];

function inferStageIndex(status: string): number {
  const s = (status || "").toLowerCase();
  if (s.includes("completed") || s.includes("resolved") || s.includes("closed")) return 5;
  if (s.includes("verif")) return 3;
  if (s.includes("progress") || s.includes("analy")) return 1;
  return 0;
}

export const WorkflowsPage: React.FC<{
  cases: CaseItem[];
  agents: SpecialistAgent[];
  onOpenNewCase: () => void;
  onSelectCase: (c: CaseItem) => void;
}> = ({ cases, agents, onOpenNewCase, onSelectCase }) => {
  const activeCases = cases.filter(
    (c) => !(c.status || "").toLowerCase().includes("completed") && !(c.status || "").toLowerCase().includes("resolved"),
  );

  return (
    <PageShell
      title="INVESTIGATION WORKFLOWS"
      subtitle="Live pipeline view of every case moving through intake, specialist analysis, correlation, verification and reporting."
      icon={<Workflow className="h-4 w-4" />}
      actions={
        <button onClick={onOpenNewCase} className={btn}>
          <Plus className="h-3 w-3" /> New Intake
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatTile label="In Pipeline" value={activeCases.length} />
        <StatTile label="Specialists Busy" value={agents.filter((a) => a.status === "BUSY" || a.status === "ANALYZING").length} tone="text-amber-300" />
        <StatTile label="Specialists Idle" value={agents.filter((a) => a.status === "IDLE" || a.status === "ACTIVE").length} tone="text-emerald-300" />
        <StatTile label="Total Cases" value={cases.length} />
        <StatTile
          label="Avg Confidence"
          value={`${Math.round(cases.reduce((a, c) => a + (c.confidence || 0), 0) / Math.max(cases.length, 1))}%`}
          tone="text-purple-300"
        />
      </div>

      <Panel title="PIPELINE STAGES">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const count = activeCases.filter((c) => inferStageIndex(c.status) === idx).length;
            return (
              <div
                key={stage.key}
                className="rounded-lg border border-purple-500/25 bg-purple-950/20 p-2.5 text-center"
              >
                <p className="font-cyber text-lg font-bold text-white">{count}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-purple-300/70">
                  {stage.label}
                </p>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel title={`ACTIVE CASE PIPELINE (${activeCases.length})`}>
        <div className="space-y-2">
          {activeCases.length === 0 && (
            <p className="font-mono text-[10px] text-purple-300/50">
              No cases currently in the pipeline. Every specialist is idle and ready.
            </p>
          )}
          {activeCases.map((c) => {
            const stageIdx = inferStageIndex(c.status);
            return (
              <button
                key={c.id}
                onClick={() => onSelectCase(c)}
                className="w-full rounded-lg border border-purple-500/20 bg-purple-950/10 p-2.5 text-left transition-colors hover:bg-purple-500/10"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[9px] text-purple-300/70">
                      {c.caseNumber} · {c.assignedAgent}
                    </p>
                    <p className="truncate font-mono text-[11px] text-white">{c.title}</p>
                  </div>
                  <Pill tone={severityTone(c.severity)}>{c.severity}</Pill>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {PIPELINE_STAGES.map((stage, idx) => (
                    <div
                      key={stage.key}
                      className={`h-1.5 flex-1 rounded-full ${
                        idx <= stageIdx ? "bg-gradient-to-r from-purple-500 to-fuchsia-500" : "bg-purple-950/60"
                      }`}
                      title={stage.label}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </Panel>
    </PageShell>
  );
};

/* ------------------------------------------------------------------ */
/* ANALYTICS                                                          */
/* ------------------------------------------------------------------ */

export const AnalyticsPage: React.FC<{
  agents: SpecialistAgent[];
  cases: CaseItem[];
  iocs: IOCItem[];
  providers: AIProvider[];
}> = ({ agents, cases, iocs, providers }) => {
  const resolvedCount = cases.filter((c) =>
    ["completed", "resolved", "closed"].some((s) => (c.status || "").toLowerCase().includes(s)),
  ).length;
  const resolveRate = cases.length ? Math.round((resolvedCount / cases.length) * 100) : 0;
  const totalTasks = agents.reduce((a, ag) => a + (ag.tasksCompleted || 0), 0);
  const avgSuccess = agents.length
    ? Math.round(agents.reduce((a, ag) => a + (ag.successRate || 0), 0) / agents.length)
    : 0;

  const severityBreakdown = useMemo(() => {
    const buckets: Record<string, number> = {};
    iocs.forEach((i) => {
      const key = i.severity || "Unknown";
      buckets[key] = (buckets[key] || 0) + 1;
    });
    return Object.entries(buckets).sort((a, b) => b[1] - a[1]);
  }, [iocs]);

  return (
    <PageShell
      title="OPERATIONS ANALYTICS"
      subtitle="Fleet throughput, case resolution rate and indicator distribution across the current investigation window."
      icon={<BarChart3 className="h-4 w-4" />}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Resolve Rate" value={`${resolveRate}%`} tone="text-emerald-300" />
        <StatTile label="Tasks Completed" value={totalTasks} tone="text-purple-300" />
        <StatTile label="Avg Success Rate" value={`${avgSuccess}%`} tone="text-cyan-300" />
        <StatTile label="Total IOCs" value={iocs.length} tone="text-amber-300" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="AGENT THROUGHPUT">
          <div className="space-y-2">
            {[...agents]
              .sort((a, b) => (b.tasksCompleted || 0) - (a.tasksCompleted || 0))
              .map((a) => (
                <div key={a.id} className="space-y-1">
                  <div className="flex items-center justify-between font-mono text-[10.5px]">
                    <span className="text-white">{a.name}</span>
                    <span className="text-purple-300/80">
                      {a.tasksCompleted} tasks · {a.successRate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-purple-950/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                      style={{ width: `${Math.min(100, a.successRate || 0)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Panel>

        <Panel title="IOC SEVERITY DISTRIBUTION">
          <div className="space-y-2">
            {severityBreakdown.length === 0 && (
              <p className="font-mono text-[10px] text-purple-300/50">No indicators ingested yet.</p>
            )}
            {severityBreakdown.map(([sev, count]) => (
              <div key={sev} className="flex items-center justify-between gap-2">
                <Pill tone={severityTone(sev)}>{sev}</Pill>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-purple-950/60 mx-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                    style={{ width: `${Math.round((count / Math.max(iocs.length, 1)) * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[10.5px] text-white">{count}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="AI PROVIDER PERFORMANCE">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left">
            <thead>
              <tr className="border-b border-purple-500/20 font-mono text-[9px] uppercase tracking-[0.15em] text-purple-300/60">
                <th className="py-2">Provider</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Success Rate</th>
                <th>Health</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.id} className="border-b border-purple-500/10">
                  <td className="py-2 font-mono text-[11px] text-white">{p.name}</td>
                  <td>
                    <Pill tone={p.enabled ? severityTone("clean") : severityTone("medium")}>
                      {p.status || (p.enabled ? "Online" : "Offline")}
                    </Pill>
                  </td>
                  <td className="font-mono text-[10px] text-purple-200/70">{p.latency || "—"}</td>
                  <td className="font-mono text-[10px] text-purple-200/70">{p.successRate ?? 0}%</td>
                  <td className="font-mono text-[10px] text-purple-200/70">{p.health ?? 0}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageShell>
  );
};

/* ------------------------------------------------------------------ */
/* SYSTEM MONITOR                                                     */
/* ------------------------------------------------------------------ */

export const SystemMonitorPage: React.FC<{
  agents: SpecialistAgent[];
  providers: AIProvider[];
  streamEvents: StreamEvent[];
  threatScore: number;
  threatLevelLabel: string;
  isEmergencyActive: boolean;
}> = ({ agents, providers, streamEvents, threatScore, threatLevelLabel, isEmergencyActive }) => {
  const onlineProviders = providers.filter((p) => p.enabled).length;
  const offlineAgents = agents.filter((a) => a.status === "OFFLINE").length;

  return (
    <PageShell
      title="SYSTEM MONITOR"
      subtitle="Real-time health of the specialist fleet, connected AI providers and the live orchestration event bus."
      icon={<Activity className="h-4 w-4" />}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Threat Level"
          value={threatLevelLabel}
          tone={isEmergencyActive ? "text-rose-300" : "text-emerald-300"}
          hint={`Score ${threatScore}/100`}
        />
        <StatTile label="Agents Online" value={`${agents.length - offlineAgents}/${agents.length}`} tone="text-emerald-300" />
        <StatTile label="Providers Connected" value={`${onlineProviders}/${providers.length}`} tone="text-purple-300" />
        <StatTile label="Event Log Size" value={streamEvents.length} tone="text-cyan-300" />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="SPECIALIST FLEET STATUS">
          <div className="space-y-1.5">
            {agents.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-950/15 p-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Bot className="h-3.5 w-3.5 shrink-0 text-purple-300" />
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[11px] text-white">{a.name}</p>
                    <p className="truncate font-mono text-[9px] text-purple-300/60">{a.currentTask}</p>
                  </div>
                </div>
                <Pill
                  tone={
                    a.status === "OFFLINE"
                      ? severityTone("high")
                      : a.status === "BUSY" || a.status === "ANALYZING"
                        ? severityTone("medium")
                        : severityTone("clean")
                  }
                >
                  {a.status}
                </Pill>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="AI PROVIDER CONNECTIVITY">
          <div className="space-y-1.5">
            {providers.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-950/15 p-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu className="h-3.5 w-3.5 shrink-0 text-purple-300" />
                  <span className="truncate font-mono text-[11px] text-white">{p.name}</span>
                </div>
                <Pill tone={p.enabled ? severityTone("clean") : severityTone("medium")}>
                  {p.enabled ? "Connected" : "Not Connected"}
                </Pill>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="LIVE EVENT BUS (LATEST 20)">
        <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar">
          {streamEvents.slice(0, 20).map((e) => (
            <div key={e.id} className="flex items-start gap-2 font-mono text-[10.5px]">
              <Clock className="mt-0.5 h-3 w-3 shrink-0 text-purple-400/60" />
              <span className="text-purple-300/60 shrink-0">{e.timestamp || e.time}</span>
              <span className="text-purple-100/85">{e.message}</span>
            </div>
          ))}
        </div>
      </Panel>
    </PageShell>
  );
};

/* ------------------------------------------------------------------ */
/* SETTINGS                                                           */
/* ------------------------------------------------------------------ */

export const SettingsPage: React.FC<{
  theme: ThemeMode;
  onSelectTheme: (t: ThemeMode) => void;
  threatThreshold: number;
  onSetThreatThreshold: (v: number) => void;
  isEmergencyActive: boolean;
  onToggleEmergencyOverride: () => void;
  onResetLayout: () => void;
  onExportLogs: (format: "json" | "csv") => void;
  onOpenProvidersModal: () => void;
  onOpenAgentsFleet: () => void;
}> = ({
  theme,
  onSelectTheme,
  threatThreshold,
  onSetThreatThreshold,
  isEmergencyActive,
  onToggleEmergencyOverride,
  onResetLayout,
  onExportLogs,
  onOpenProvidersModal,
  onOpenAgentsFleet,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearLocalData = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    try {
      [
        "nexsus_clean_theme",
        "nexsus_clean_threat_score",
        "nexsus_clean_threat_threshold",
        "nexsus_clean_ceo_state",
        "nexsus_clean_ai_providers",
        "nexsus_dashboard_layout",
      ].forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  return (
    <PageShell
      title="SYSTEM SETTINGS"
      subtitle="Command center preferences: visual theme, emergency thresholds, connected providers and local data controls."
      icon={<Settings className="h-4 w-4" />}
    >
      <Panel title="APPEARANCE">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {THEMES.map((t) => {
            const Icon = t.icon;
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTheme(t.id)}
                className={`flex flex-col items-start gap-1 rounded-lg border p-2.5 text-left transition-all ${
                  isActive
                    ? "border-purple-400/70 bg-purple-500/15"
                    : "border-purple-500/20 hover:bg-purple-500/10"
                }`}
              >
                <Icon className="h-4 w-4" style={{ color: t.colors.primary }} />
                <span className="font-mono text-[10.5px] text-white">{t.name}</span>
                <span className="font-mono text-[8.5px] text-purple-300/60">{t.description}</span>
              </button>
            );
          })}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Panel title="THREAT & EMERGENCY">
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-purple-300/60">
                <span>Emergency Override Threshold</span>
                <span className="text-purple-200">{threatThreshold}</span>
              </div>
              <input
                type="range"
                min={40}
                max={99}
                value={threatThreshold}
                onChange={(e) => onSetThreatThreshold(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <p className="mt-1 font-mono text-[9px] text-purple-300/50">
                DEFCON-1 auto-engages when the live threat score reaches this value.
              </p>
            </div>
            <button
              onClick={onToggleEmergencyOverride}
              className={`flex w-full items-center justify-center gap-1.5 rounded-md px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-all ${
                isEmergencyActive
                  ? "bg-rose-600/80 hover:bg-rose-500 text-white"
                  : "border border-purple-500/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20"
              }`}
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              {isEmergencyActive ? "Disengage Emergency Override" : "Engage Emergency Override"}
            </button>
          </div>
        </Panel>

        <Panel title="AI & AGENTS">
          <div className="space-y-2">
            <button onClick={onOpenProvidersModal} className={`${btn} w-full justify-center`}>
              <Cpu className="h-3 w-3" /> Manage AI Providers
            </button>
            <button onClick={onOpenAgentsFleet} className={`${btn} w-full justify-center`}>
              <Bot className="h-3 w-3" /> View Specialist Fleet
            </button>
            <button onClick={onResetLayout} className={`${btn} w-full justify-center`}>
              <RefreshCw className="h-3 w-3" /> Reset Dashboard Layout
            </button>
          </div>
        </Panel>
      </div>

      <Panel title="DATA & EXPORT">
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onExportLogs("json")} className={btn}>
            <Download className="h-3 w-3" /> Export Logs (JSON)
          </button>
          <button onClick={() => onExportLogs("csv")} className={btn}>
            <Download className="h-3 w-3" /> Export Logs (CSV)
          </button>
          <button
            onClick={handleClearLocalData}
            className="flex items-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-rose-200 transition-colors hover:bg-rose-500/20"
          >
            <Trash2 className="h-3 w-3" />
            {confirmClear ? "Confirm: Erase All Local Data" : "Clear Local Data & Reset"}
          </button>
        </div>
        {confirmClear && (
          <p className="mt-2 font-mono text-[9.5px] text-rose-300/80">
            This clears theme, threat state, CEO config and saved AI provider keys from this
            browser, then reloads. Click again to confirm.
          </p>
        )}
      </Panel>
    </PageShell>
  );
};
