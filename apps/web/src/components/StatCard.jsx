import Link from "next/link";
import Icon from "./Icon";

const COLOR_MAP = {
  primary: { bg: "bg-primary/12", text: "text-primary" },
  warning: { bg: "bg-warning/12", text: "text-warning" },
  accent: { bg: "bg-accent/12", text: "text-accent" },
  danger: { bg: "bg-danger/12", text: "text-danger" },
  brass: { bg: "bg-brass/15", text: "text-brass" },
};

export default function StatCard({ label, value, icon, href, color = "primary" }) {
  const c = COLOR_MAP[color] || COLOR_MAP.primary;

  return (
    <div className="bg-white/90 rounded-sm border border-border p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${c.bg}`}>
          <Icon name={icon} className={`w-5 h-5 ${c.text}`} />
        </div>
        <span className="text-xs tracking-wide uppercase text-foreground-muted">{label}</span>
      </div>
      <p className="font-display text-3xl font-semibold">{value}</p>
      {href && (
        <Link href={href} className="text-sm text-primary font-medium hover:underline">
          View
        </Link>
      )}
    </div>
  );
}
