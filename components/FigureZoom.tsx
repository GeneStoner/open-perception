import React from "react";
import Image from "next/image";

/**
 * A wide multipanel figure. Inline it fills the column; clicking opens the PNG at
 * native resolution in a new tab, which is the only way the panel labels are readable
 * on a narrow window. Plain anchor — no JS, works with the image right-click menu.
 */
export default function FigureZoom({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-lg border overflow-hidden relative"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      <Image src={src} alt={alt} width={width} height={height} unoptimized className="w-full h-auto" />
      <span
        className="absolute bottom-2 right-2 rounded px-2 py-1 text-[11px] opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: "var(--surface)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
      >
        open full size ↗
      </span>
    </a>
  );
}
