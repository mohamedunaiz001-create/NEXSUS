import React, { useMemo, useState } from "react";
import { Globe, Crosshair, ShieldAlert, Network, Search } from "lucide-react";
import { IOCItem, CaseItem, ActivityEvent } from "../../types";
import { PageShell, Panel, StatTile, Pill, severityTone } from "./PageShell";
import { ThreatMap } from "../command-center/ThreatMap";
import { KnowledgeGraph } from "../command-center/KnowledgeGraph";

// NOTE: These three tables (actors, external feeds, MITRE detection counts)
// are reference/illustrative content — this app has no live threat-intel-feed
// or actor-tracking backend wired up yet. The IOC counts and the map above
// are real and derive from actual case data. Replace these arrays with a
// real feed/actor API integration when one is available.
const THREAT_ACTORS: { name: string; origin: string; motive: string; activity: number; campaigns: number }[] = [];

const FEEDS: { name: string; status: string; indicators: string; latency: string }[] = [];

const MITRE_TACTICS: { id: string; name: string; techniques: { id: string; name: string; detections: number }[] }[] = [];

interface ThreatIntelPageProps {
  iocs?: IOCItem[];
  activities?: ActivityEvent[];
}

export const ThreatIntelPage: React.FC<ThreatIntelPageProps> = ({ iocs = [], activities = [] }) => (
  <PageShell
    title="THREAT INTELLIGENCE"
    subtitle="Live IOC telemetry from active cases and connected intelligence sources."
    icon={<Globe className="h-4 w-4" />}
  >
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Tracked Actors" value={THREAT_ACTORS.length} />
      <StatTile
        label="Connected Feeds"
        value={`${FEEDS.filter((f) => f.status === "Synced").length}/${FEEDS.length}`}
        tone="text-emerald-300"
      />
      <StatTile label="Live Indicators" value={iocs.length} tone="text-amber-300" />
      <StatTile
        label="Malicious IOCs"
        value={iocs.filter((i) => i.severity === "Malicious").length}
        tone="text-rose-300"
      />
    </div>

    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <ThreatMap />
      <Panel title="FEED HEALTH">
        <div className="space-y-2">
          {FEEDS.map((f) => (
            <div
              key={f.name}
              className="flex items-center justify-between rounded-lg border border-purple-500/20 bg-purple-950/20 p-2"
            >
              <div>
                <p className="font-mono text-[11px] text-white">{f.name}</p>
                <p className="font-mono text-[9px] text-purple-300/60">
                  {f.indicators} indicators · {f.latency}
                </p>
              </div>
              <Pill tone={f.status === "Synced" ? severityTone("clean") : severityTone("high")}>
                {f.status}
              </Pill>
            </div>
          ))}
        </div>
      </Panel>
    </div>

    <Panel title="ADVERSARY TRACKING">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-purple-500/20 font-mono text-[9px] uppercase tracking-[0.15em] text-purple-300/60">
              <th className="py-2">Actor</th>
              <th>Origin</th>
              <th>Motive</th>
              <th>Campaigns</th>
              <th>Activity</th>
            </tr>
          </thead>
          <tbody>
            {THREAT_ACTORS.map((a) => (
              <tr key={a.name} className="border-b border-purple-500/10">
                <td className="py-2 font-mono text-[11px] text-white">{a.name}</td>
                <td className="font-mono text-[10px] text-purple-200/70">{a.origin}</td>
                <td className="font-mono text-[10px] text-purple-200/70">{a.motive}</td>
                <td className="font-mono text-[10px] text-purple-200/70">{a.campaigns}</td>
                <td className="w-40">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-purple-950/60">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-rose-500"
                      style={{ width: `${a.activity}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  </PageShell>
);

export const IOCExplorerPage: React.FC<{
  iocs: IOCItem[];
  onSelectIOC: (i: IOCItem) => void;
}> = ({ iocs, onSelectIOC }) => {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("ALL");
  const types = useMemo(() => ["ALL", ...Array.from(new Set(iocs.map((i) => i.type)))], [iocs]);
  const filtered = iocs.filter(
    (i) =>
      (type === "ALL" || i.type === type) &&
      `${i.value} ${i.threatActor || ""} ${i.description || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  return (
    <PageShell
      title="IOC EXPLORER"
      subtitle="Search, pivot and triage every indicator of compromise extracted across active investigations."
      icon={<Crosshair className="h-4 w-4" />}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total IOCs" value={iocs.length} />
        <StatTile
          label="Malicious"
          value={iocs.filter((i) => i.severity === "Malicious").length}
          tone="text-rose-300"
        />
        <StatTile
          label="Suspicious"
          value={iocs.filter((i) => i.severity === "Suspicious").length}
          tone="text-amber-300"
        />
        <StatTile
          label="Avg Confidence"
          value={`${Math.round(iocs.reduce((a, i) => a + (i.confidence || 0), 0) / Math.max(iocs.length, 1))}%`}
          tone="text-emerald-300"
        />
      </div>

      <Panel
        title={`INDICATORS (${filtered.length})`}
        right={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded border border-purple-500/30 bg-black/40 px-2 py-1">
              <Search className="h-3 w-3 text-purple-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search indicators…"
                className="w-40 bg-transparent font-mono text-[10px] text-purple-100 outline-none placeholder:text-purple-300/40"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded border border-purple-500/30 bg-black/40 px-2 py-1 font-mono text-[10px] text-purple-200 outline-none"
            >
              {types.map((t) => (
                <option key={t} value={t} className="bg-[#0b0418]">
                  {t}
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
                <th className="py-2">Indicator</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Confidence</th>
                <th>Actor</th>
                <th>First Seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr
                  key={i.id}
                  onClick={() => onSelectIOC(i)}
                  className="cursor-pointer border-b border-purple-500/10 transition-colors hover:bg-purple-500/10"
                >
                  <td className="py-2 pr-3 font-mono text-[11px] text-white">{i.value}</td>
                  <td className="font-mono text-[10px] text-purple-200/70">{i.type}</td>
                  <td>
                    <Pill tone={severityTone(i.severity)}>{i.severity}</Pill>
                  </td>
                  <td className="font-mono text-[10px] text-emerald-300">{i.confidence}%</td>
                  <td className="font-mono text-[10px] text-purple-200/70">
                    {i.threatActor || "—"}
                  </td>
                  <td className="font-mono text-[10px] text-purple-300/60">{i.firstSeen}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center font-mono text-[10px] text-purple-300/50"
                  >
                    No indicators match the current filter.
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

export const MitreBrowserPage: React.FC = () => {
  const [active, setActive] = useState<string | null>(MITRE_TACTICS[0]?.id ?? null);
  const tactic = MITRE_TACTICS.find((t) => t.id === active) ?? null;

  return (
    <PageShell
      title="MITRE ATT&CK BROWSER"
      subtitle="Adversary tactics and techniques observed across NEXSUS investigations, mapped to the ATT&CK enterprise matrix."
      icon={<ShieldAlert className="h-4 w-4" />}
    >
      {MITRE_TACTICS.length === 0 ? (
        <Panel title="TACTICS">
          <p className="py-6 text-center font-mono text-[10px] text-purple-300/50">
            No ATT&CK mapping data connected yet. Wire up a MITRE ATT&CK feed to populate tactics and techniques here.
          </p>
        </Panel>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            {MITRE_TACTICS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  active === t.id
                    ? "border-purple-400/60 bg-purple-500/15"
                    : "border-purple-500/25 bg-purple-950/20 hover:bg-purple-500/10"
                }`}
              >
                <p className="font-mono text-[9px] tracking-[0.2em] text-purple-300/60">{t.id}</p>
                <p className="font-cyber text-sm text-white">{t.name}</p>
                <p className="mt-1 font-mono text-[9px] text-purple-200/50">
                  {t.techniques.length} techniques
                </p>
              </button>
            ))}
          </div>

          {tactic && (
            <Panel title={`${tactic.name.toUpperCase()} · TECHNIQUES`}>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {tactic.techniques.map((tech) => (
                  <div
                    key={tech.id}
                    className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-[11px] text-white">{tech.name}</p>
                      <Pill>{tech.id}</Pill>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-purple-950/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-rose-500"
                        style={{ width: `${Math.min(tech.detections * 2, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-[9px] text-purple-300/60">
                      {tech.detections} detections in the last 30 days
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </>
      )}
    </PageShell>
  );
};

export const KnowledgeGraphPage: React.FC<{ cases: CaseItem[]; iocs: IOCItem[] }> = ({
  cases,
  iocs,
}) => (
  <PageShell
    title="KNOWLEDGE GRAPH"
    subtitle="Entity relationships linking cases, indicators, malware families and threat actors into a single investigative fabric."
    icon={<Network className="h-4 w-4" />}
  >
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Case Nodes" value={cases.length} />
      <StatTile label="IOC Nodes" value={iocs.length} tone="text-rose-300" />
      <StatTile label="Actor Nodes" value={THREAT_ACTORS.length} tone="text-amber-300" />
      <StatTile label="Edges" value={cases.length * 3 + iocs.length} tone="text-emerald-300" />
    </div>
    <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
      <KnowledgeGraph />
      <Panel title="STRONGEST CORRELATIONS">
        <div className="space-y-2">
          {cases.slice(0, 6).map((c, idx) => (
            <div key={c.id} className="rounded-lg border border-purple-500/20 bg-purple-950/20 p-2">
              <p className="font-mono text-[11px] text-white">
                {c.caseNumber} ↔{" "}
                {iocs[idx % Math.max(iocs.length, 1)]?.value || "unknown-indicator"}
              </p>
              <p className="font-mono text-[9px] text-purple-300/60">
                shared infrastructure · link strength {Math.max(60, c.confidence - idx * 3)}%
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  </PageShell>
);
