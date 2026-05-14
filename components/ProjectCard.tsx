import Link from "next/link";
import StatusBadge from "./StatusBadge";

interface ProjectCardProps {
  title: string;
  description: string;
  status: "active" | "pilot" | "planned" | "archived";
  href?: string;
  tags?: string[];
}

export default function ProjectCard({ title, description, status, href, tags }: ProjectCardProps) {
  const inner = (
    <div
      className="rounded-lg border p-5 h-full flex flex-col gap-3 transition-colors duration-150 hover:border-blue-500/40"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-base" style={{ color: "var(--text-primary)" }}>{title}</h3>
        <StatusBadge status={status} />
      </div>
      <p className="text-sm flex-1" style={{ color: "var(--text-secondary)" }}>{description}</p>
      {tags && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded"
              style={{ background: "var(--surface-raised)", color: "var(--text-muted)" }}
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>
  ) : (
    <div>{inner}</div>
  );
}
