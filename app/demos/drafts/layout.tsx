import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DraftsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div
        className="border-b px-6 py-2 text-xs flex items-center justify-between"
        style={{
          background: "rgba(255, 200, 60, 0.08)",
          borderColor: "rgba(255, 200, 60, 0.35)",
          color: "#f0c850",
        }}
      >
        <span>DRAFT — unlisted, noindex, not linked from the public site</span>
        <Link href="/demos/drafts" style={{ color: "inherit", textDecoration: "underline" }}>
          all drafts
        </Link>
      </div>
      {children}
    </div>
  );
}
