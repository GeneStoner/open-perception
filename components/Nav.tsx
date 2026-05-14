import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/collaborators", label: "Collaborators" },
  { href: "/demos", label: "Demos" },
  { href: "/documentation", label: "Documentation" },
  { href: "/publications", label: "Publications" },
  { href: "/devlog", label: "Dev Log" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  return (
    <nav
      className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between backdrop-blur-sm"
      style={{ background: "rgba(13,15,18,0.92)", borderColor: "var(--border)" }}
    >
      <Link href="/" className="flex flex-col leading-tight" style={{ textDecoration: "none" }}>
        <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: "#e8eaf0" }}>
          Open Perception
        </span>
      </Link>
      <div className="flex gap-6 text-sm" style={{ color: "#a8b4c8" }}>
        {links.slice(1).map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="hover:text-white transition-colors duration-150"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
