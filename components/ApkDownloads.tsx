import fs from 'fs';
import path from 'path';
import Link from 'next/link';

interface ApkEntry {
  name:        string;
  version:     string;
  date:        string;
  description: string;
  params:      Record<string, string>;
  url:         string;
  filename:    string;
}

function loadApks(): ApkEntry[] {
  try {
    const file = path.join(process.cwd(), 'content', 'apks.json');
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch { return []; }
}

export default function ApkDownloads() {
  const apks = loadApks();
  if (apks.length === 0) return null;

  return (
    <div className="space-y-5">
      {apks.map((apk) => (
        <div
          key={apk.filename}
          className="rounded-lg border p-6"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {apk.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                v{apk.version} · {apk.date}
              </p>
            </div>
            <a
              href={apk.url}
              download={apk.filename}
              className="shrink-0 text-xs font-medium px-4 py-2 rounded border"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)', textDecoration: 'none' }}
            >
              Download APK
            </a>
          </div>

          {/* Description */}
          <p className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {apk.description}
          </p>

          {/* Install guide link */}
          <p className="mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
            New to sideloading?{" "}
            <Link
              href="/projects/object-based-attention/collaborators/install"
              style={{ color: "var(--accent)", textDecoration: "underline" }}
            >
              Installation guide →
            </Link>
          </p>

          {/* Stimulus parameters */}
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(apk.params).map(([key, val]) => (
              <span
                key={key}
                className="text-xs px-2 py-1 rounded"
                style={{ background: 'var(--accent-dim)', color: 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{key}: </span>{val}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
