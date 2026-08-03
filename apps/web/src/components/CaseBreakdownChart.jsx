"use client";

import { PieChart, Pie, Cell, LabelList, ResponsiveContainer, Tooltip } from "recharts";
import { tooltipStyle } from "@/lib/chartTheme";

const DEFAULT_COLORS = ["#0038a8", "#c9a227", "#3f6b4b", "#c8102e", "#786956", "#9c6b1f"];

export function DeltaBadge({ value, label = "pp", trend = "up" }) {
  const isUp = trend === "up" || value > 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        isUp ? "bg-accent/15 text-accent" : "bg-danger/15 text-danger"
      }`}
    >
      <span>{isUp ? "↗" : "↘"}</span>
      <span>
        {value > 0 ? `+${value}` : value}
        {label}
      </span>
    </span>
  );
}

export default function CaseBreakdownChart({
  title = "Case Distribution",
  subtitle = "Breakdown of cases by status in the last 30 days",
  data = {},
  deltaValue = 2.4,
  deltaLabel = "%",
  colors = DEFAULT_COLORS,
}) {
  const rows = Object.entries(data).map(([channel, share], idx) => ({
    name: channel,
    share: Number(share) || 0,
    fill: colors[idx % colors.length],
  }));

  const total = rows.reduce((sum, r) => sum + r.share, 0);

  return (
    <div className="bg-white/90 rounded-sm border border-border p-5 flex flex-col justify-between shadow-xs">
      {/* Header with Title & Delta Badge */}
      <div className="flex items-start justify-between flex-wrap gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
            {deltaValue != null && <DeltaBadge value={deltaValue} label={deltaLabel} />}
          </div>
          {subtitle && <p className="text-xs text-foreground-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>

      {/* Chart Content */}
      {rows.length === 0 || total === 0 ? (
        <p className="text-foreground-muted text-sm py-10 text-center">No case data recorded yet.</p>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-full h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <Pie
                  data={rows}
                  dataKey="share"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={84}
                  paddingAngle={3}
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  <LabelList
                    dataKey="share"
                    position="inside"
                    fill="#ffffff"
                    fontSize={12}
                    fontWeight={700}
                    formatter={(val) => {
                      const pct = total > 0 ? Math.round((Number(val) / total) * 100) : 0;
                      return pct > 5 ? `${pct}%` : "";
                    }}
                  />
                  {rows.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Accessible Legend for Senior Lupon & Staff */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
            {rows.map((r, i) => (
              <div key={r.name} className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: r.fill }} aria-hidden="true" />
                <span className="truncate text-foreground font-medium">{r.name}:</span>
                <span className="font-bold text-foreground">{r.share}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
