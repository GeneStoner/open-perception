type Status = "active" | "pilot" | "planned" | "archived";

const styles: Record<Status, { bg: string; text: string }> = {
  active:   { bg: "#1a3a2a", text: "#4ade80" },
  pilot:    { bg: "#1e3a5f", text: "#4a9eff" },
  planned:  { bg: "#2a2a1a", text: "#facc15" },
  archived: { bg: "#1a1a1a", text: "#6b7280" },
};

export default function StatusBadge({ status }: { status: Status }) {
  const s = styles[status];
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide"
      style={{ background: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
}
