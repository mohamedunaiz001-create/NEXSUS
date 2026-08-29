import React from "react";
import { GothicCornerFiligree } from "../common/GothicCornerFiligree";

interface PageShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export const PageShell: React.FC<PageShellProps> = ({
  title,
  subtitle,
  icon,
  actions,
  children,
}) => (
  <div className="space-y-4">
    <header className="flex flex-wrap items-end justify-between gap-3 border-b border-purple-500/20 pb-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300">
            {icon}
          </div>
        )}
        <div>
          <h1 className="font-cyber text-lg font-bold tracking-[0.18em] text-white">{title}</h1>
          {subtitle && (
            <p className="mt-1 max-w-2xl font-mono text-[11px] leading-relaxed text-purple-200/60">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
    {children}
  </div>
);

export const Panel: React.FC<{
  title?: string;
  right?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}> = ({ title, right, className = "", children }) => (
  <section
    className={`relative overflow-hidden rounded-xl border border-purple-500/30 bg-[#090317]/95 p-3.5 shadow-[0_0_15px_rgba(168,85,247,0.15)] ${className}`}
  >
    <GothicCornerFiligree size="sm" opacity="text-purple-400/40" />
    {(title || right) && (
      <div className="mb-2.5 flex items-center justify-between border-b border-purple-500/20 pb-2">
        <span className="font-cyber text-xs font-bold tracking-wider text-white">{title}</span>
        {right}
      </div>
    )}
    {children}
  </section>
);

export const StatTile: React.FC<{
  label: string;
  value: string | number;
  tone?: string;
  hint?: string;
}> = ({ label, value, tone = "text-purple-300", hint }) => (
  <div className="rounded-lg border border-purple-500/25 bg-purple-950/20 p-3">
    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-purple-300/60">{label}</p>
    <p className={`mt-1 font-cyber text-xl font-bold ${tone}`}>{value}</p>
    {hint && <p className="mt-0.5 font-mono text-[9px] text-purple-200/40">{hint}</p>}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({
  children,
  tone = "border-purple-500/40 text-purple-300 bg-purple-500/10",
}) => (
  <span
    className={`rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider ${tone}`}
  >
    {children}
  </span>
);

export const severityTone = (s: string) => {
  const v = (s || "").toLowerCase();
  if (v.includes("critical") || v.includes("malicious"))
    return "border-rose-500/40 text-rose-300 bg-rose-500/10";
  if (v.includes("high") || v.includes("suspicious"))
    return "border-amber-500/40 text-amber-300 bg-amber-500/10";
  if (v.includes("medium")) return "border-yellow-500/30 text-yellow-200 bg-yellow-500/10";
  if (v.includes("clean") || v.includes("completed") || v.includes("resolved"))
    return "border-emerald-500/40 text-emerald-300 bg-emerald-500/10";
  return "border-purple-500/40 text-purple-300 bg-purple-500/10";
};
