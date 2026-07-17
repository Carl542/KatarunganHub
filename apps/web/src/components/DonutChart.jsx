"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { tooltipStyle } from "@/lib/chartTheme";

export const CHART_COLORS = ["#0038a8", "#c9a227", "#3f6b4b", "#c8102e", "#786956", "#9c6b1f"];

export default function DonutChart({ data, centerLabel, centerValue }) {
  const rows = Object.entries(data).map(([name, value]) => ({ name, value }));

  if (rows.length === 0) return <p className="text-foreground-muted text-sm">No data yet.</p>;

  return (
    <div className="flex items-center gap-5">
      <div className="relative w-[150px] h-[150px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={44} outerRadius={70} strokeWidth={0}>
              {rows.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        {centerValue != null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-xl font-semibold">{centerValue}</span>
            {centerLabel && (
              <span className="text-[0.6rem] uppercase tracking-wide text-foreground-muted">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      <ul className="flex-1 min-w-0">
        {rows.map(({ name, value }, i) => (
          <li key={name} className="flex justify-between items-center gap-2 text-sm py-1.5 border-t border-border first:border-0">
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: CHART_COLORS[i % CHART_COLORS.length] }}
                aria-hidden="true"
              />
              <span className="truncate">{name}</span>
            </span>
            <span className="font-medium shrink-0">{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
