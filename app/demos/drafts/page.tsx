import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import SectionHeader from "@/components/SectionHeader";

function listDrafts(): string[] {
  const dir = path.join(process.cwd(), "app", "demos", "drafts");
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

export default function DraftsIndex() {
  const slugs = listDrafts();
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <SectionHeader title="draft demos" />
      <p className="text-sm mb-8" style={{ color: "var(--text-muted)" }}>
        Exploratory motion demos. Each subdirectory under{" "}
        <code>app/demos/drafts/</code> shows up here automatically. Nothing on this
        page is linked from the public site or indexed by search engines.
      </p>
      {slugs.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          No drafts yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {slugs.map((slug) => (
            <li key={slug}>
              <Link
                href={`/demos/drafts/${slug}`}
                className="text-sm hover:underline"
                style={{ color: "#e8eaf0" }}
              >
                {slug}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
