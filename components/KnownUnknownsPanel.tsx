interface Item {
  label: string;
  note?: string;
}

interface KnownUnknownsPanelProps {
  knowns: Item[];
  unknowns: Item[];
}

function ItemList({ items, color }: { items: Item[]; color: string }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm">
          <span className="mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full mt-1.5" style={{ background: color }} />
          <span style={{ color: "var(--text-secondary)" }}>
            {item.label}
            {item.note && (
              <span className="ml-1" style={{ color: "var(--text-muted)" }}>— {item.note}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function KnownUnknownsPanel({ knowns, unknowns }: KnownUnknownsPanelProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div
        className="rounded-lg border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "#4ade80" }}>
          Known Constraints
        </h3>
        <ItemList items={knowns} color="#4ade80" />
      </div>
      <div
        className="rounded-lg border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-4" style={{ color: "#facc15" }}>
          Open Questions
        </h3>
        <ItemList items={unknowns} color="#facc15" />
      </div>
    </div>
  );
}
