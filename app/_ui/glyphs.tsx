import type { CSSProperties } from "react";

/**
 * DigitalBurj glyphs: a bespoke line-icon family drawn on a 48-unit grid.
 * Each glyph has a quiet base drawing and one highlighted accent in the
 * division colour (--a). Strokes draw in when revealed, the accent idles
 * gently and moves with intent on hover. Motion stops for reduced motion.
 */
export type GlyphName =
  | "academy" | "studio" | "business" | "talent" | "jobs"
  | "platform" | "docs" | "contact" | "security" | "data" | "cloud" | "integrations"
  | "mobile" | "web" | "whatsapp" | "code" | "ai" | "enterprise" | "tower";

type Motion = "float" | "spin" | "pulse" | "blink" | "slide" | "trace";
type Stroke = string | { d: string; fill: true };
type Def = { base: Stroke[]; accent: Stroke[]; motion: Motion };

const c = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
const rr = (x: number, y: number, w: number, h: number, r: number) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
const dot = (x: number, y: number, r = 1.6) => ({ d: c(x, y, r), fill: true as const });
const spark = (x: number, y: number, s: number) => `M${x} ${y - s}C${x + s * .18} ${y - s * .18} ${x + s * .18} ${y - s * .18} ${x + s} ${y}C${x + s * .18} ${y + s * .18} ${x + s * .18} ${y + s * .18} ${x} ${y + s}C${x - s * .18} ${y + s * .18} ${x - s * .18} ${y + s * .18} ${x - s} ${y}C${x - s * .18} ${y - s * .18} ${x - s * .18} ${y - s * .18} ${x} ${y - s}z`;

// A stepped tower in the spirit of the Burj: setbacks narrowing to a spire.
const tower = "M16 42V30h3v-8h3v-9h2V4v9h2v9h3v8h3v12";

const defs: Record<GlyphName, Def> = {
  academy: { motion: "float", base: ["M6 16c6-3.5 12-3.5 18 1c6-4.5 12-4.5 18-1v22c-6-3-12-3-18 1c-6-4-12-4-18-1z", "M24 17v22", "M10 22c3.5-1.2 7-1 10 .6", "M10 27c3.5-1.2 7-1 10 .6"], accent: ["M33 5l3.5 3.5L33 12l-3.5-3.5z", "M29 24.5l3 3 6-6.5"] },
  studio: { motion: "trace", base: [rr(5, 9, 38, 30, 3.5), "M5 16h38", dot(9.5, 12.5, 1.1), dot(13.5, 12.5, 1.1)], accent: ["M11 33l7-8 5 4 6-8 7 5", dot(36, 26, 1.8)] },
  business: { motion: "spin", base: [c(10, 24, 4), c(38, 12, 4), c(38, 36, 4), "M14 24c8 0 10-12 20-12", "M14 24c8 0 10 12 20 12"], accent: [spark(24, 24, 5)] },
  talent: { motion: "pulse", base: [rr(9, 5, 26, 36, 4), c(22, 17, 4.5), "M14.5 30c1.6-3.6 4.3-5 7.5-5s5.9 1.4 7.5 5", "M15 35h14"], accent: [c(36, 35, 6.5), "M32.8 35.2l2.2 2.2 4.2-4.6"] },
  jobs: { motion: "slide", base: [rr(6, 15, 36, 24, 3.5), "M18 15v-3.5a2.5 2.5 0 0 1 2.5-2.5h7a2.5 2.5 0 0 1 2.5 2.5V15", "M6 25h36"], accent: [rr(20.5, 22, 7, 6, 1.5), "M31 33h6"] },
  platform: { motion: "float", base: ["M24 27L6 19l18-8 18 8z", "M6 25.5L24 33.5l18-8", "M6 32L24 40l18-8"], accent: ["M24 22.5l-7-3.5 7-3.5 7 3.5z"] },
  docs: { motion: "blink", base: ["M13 5h15l9 9v29H13z", "M28 5v9h9"], accent: ["M21 24l-4 4.5 4 4.5", "M29 24l4 4.5-4 4.5", "M26.5 22.5l-3 12"] },
  contact: { motion: "blink", base: ["M8 11h32a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H22l-8 7v-7H8a3 3 0 0 1-3-3V14a3 3 0 0 1 3-3z"], accent: [dot(16, 22.5, 2), dot(24, 22.5, 2), dot(32, 22.5, 2)] },
  whatsapp: { motion: "pulse", base: ["M24 6a18 18 0 1 1-9 33.6L7 42l2.5-7.7A18 18 0 0 1 24 6z"], accent: ["M18.2 15.5c.8-.9 2.1-.8 2.6.2l1.4 3c.3.7.1 1.4-.4 1.9l-1 1c.9 2.2 2.7 4 4.9 4.9l1-1c.5-.5 1.3-.7 1.9-.4l3 1.4c1 .5 1.1 1.8.2 2.6l-1.4 1.3c-1 .9-2.5 1.2-3.8.7-4.6-1.7-8.3-5.4-10-10-.5-1.3-.2-2.8.7-3.8z"] },
  security: { motion: "pulse", base: ["M24 5l16 6v11c0 10-6.8 17.4-16 21-9.2-3.6-16-11-16-21V11z"], accent: ["M17 24.5l5 5 9-10"] },
  data: { motion: "trace", base: ["M7 41h34", rr(10, 27, 6, 14, 1.5), rr(21, 20, 6, 21, 1.5), rr(32, 13, 6, 28, 1.5)], accent: ["M8 23l10-8 9 4 13-11", dot(40, 8, 1.9)] },
  cloud: { motion: "float", base: ["M14 36a8 8 0 0 1-.9-15.9A11 11 0 0 1 34.4 17.5 9.3 9.3 0 0 1 35 36z"], accent: ["M24 32V21", "M19.5 25.5L24 21l4.5 4.5"] },
  integrations: { motion: "slide", base: [c(10, 24, 5), c(38, 24, 5), "M15 24h18"], accent: [dot(24, 24, 2.6), "M10 13v6", "M38 29v6"] },
  mobile: { motion: "blink", base: [rr(13, 4, 22, 40, 4.5), "M21 39h6"], accent: [dot(30, 11, 2.2), "M18 18h12", "M18 23h8"] },
  web: { motion: "float", base: [rr(5, 8, 38, 28, 3.5), "M5 15h38", "M18 42h12", "M24 36v6"], accent: ["M26 21l9 3.4-3.8 1.5-1.5 3.8z"] },
  code: { motion: "blink", base: [rr(5, 8, 38, 32, 3.5), "M12 19l5 5-5 5"], accent: ["M21 30h10"] },
  ai: { motion: "spin", base: [rr(12, 12, 24, 24, 4), "M18 12V6", "M24 12V6", "M30 12V6", "M18 42v-6", "M24 42v-6", "M30 42v-6", "M12 18H6", "M12 24H6", "M12 30H6", "M42 18h-6", "M42 24h-6", "M42 30h-6"], accent: [spark(24, 24, 6)] },
  enterprise: { motion: "pulse", base: ["M6 42h36", "M10 42V16l14-8 14 8v26", "M17 22v14", "M24 20v16", "M31 22v14"], accent: [dot(24, 13, 2)] },
  tower: { motion: "pulse", base: [tower, "M12 42h24", "M22 22h4", "M21 30h6"], accent: [dot(24, 4, 1.8), "M24 4v-1"] },
};

export function Glyph({ name, size = 48, tile = false, hue, className = "", style }: { name: GlyphName; size?: number; tile?: boolean; hue?: readonly [string, string]; className?: string; style?: CSSProperties }) {
  const g = defs[name];
  let k = 0;
  const draw = (s: Stroke, cls: string) => {
    const i = k++;
    return typeof s === "string"
      ? <path key={i} d={s} pathLength={1} className={cls} style={{ "--k": i } as CSSProperties} />
      : <path key={i} d={s.d} className={`${cls} g-fill`} style={{ "--k": i } as CSSProperties} />;
  };
  const vars = hue ? { "--a": hue[0], "--b": hue[1], ...style } as CSSProperties : style;
  return <span className={`glyph ${tile ? "glyph-tile" : ""} ${className}`} data-reveal="glyph" style={vars} aria-hidden="true">
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g className="g-base">{g.base.map(s => draw(s, "g-b"))}</g>
      <g className={`g-acc g-${g.motion}`}>{g.accent.map(s => draw(s, "g-a"))}</g>
    </svg>
  </span>;
}
