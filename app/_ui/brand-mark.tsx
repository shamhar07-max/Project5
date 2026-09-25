import type { CSSProperties } from "react";
import Image from "next/image";
import { Glyph, type GlyphName } from "./glyphs";
import { divisionBySlug, type DivisionSlug } from "../brand-data";

export type MarkName = GlyphName;

const label: Partial<Record<MarkName, string>> = { business: "BUSINESS AI", talent: "VERIFIED TALENT" };
const accent = (name: MarkName): readonly [string, string] | undefined => (divisionBySlug as Record<string, { hue: [string, string] } | undefined>)[name as DivisionSlug]?.hue;

/** A highlighted DigitalBurj glyph tile; `lockup` adds the approved wordmark and division name. */
export function BrandMark({ name, className = "", lockup = false }: { name: MarkName; className?: string; lockup?: boolean }) {
  const hue = accent(name);
  return <span className={`brand-mark ${className}`} aria-hidden="true" style={hue ? { "--a": hue[0], "--b": hue[1] } as CSSProperties : undefined}>
    <Glyph name={name} tile size={64} />
    {lockup && <span className="brand-mark-lockup"><Image src="/brand/digitalburj-wordmark-approved.webp" width={2048} height={512} alt="" unoptimized /><b>{label[name] ?? name.toUpperCase()}</b></span>}
  </span>;
}

export function markForTitle(title: string): MarkName {
  if (/security|privacy|terms|consent|verify|evidence|credential/i.test(title)) return "security";
  if (/people|team|talent|career/i.test(title)) return "talent";
  if (/jobs|hire|recruit|role/i.test(title)) return "jobs";
  if (/data|report|analysis|measure/i.test(title)) return "data";
  if (/learn|academy|guide|course|skill/i.test(title)) return "academy";
  if (/contact|support|speak|talk/i.test(title)) return "contact";
  if (/cloud|reliab/i.test(title)) return "cloud";
  if (/business|process|operations|automation/i.test(title)) return "business";
  if (/product|software|platform|studio|build|design/i.test(title)) return "studio";
  return "integrations";
}
