// Deterministic, original SVG artwork. Each placement passes its own seed, so every
// thumbnail on the site is a distinct composition in the DigitalBurj palette.
type Variant = "mesh" | "orbit" | "circuit" | "bars" | "wave";

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
}

export function GenArt({ seed, variant = "mesh", hue = ["#2563eb", "#e10613"], className = "", label }: { seed: string; variant?: Variant; hue?: readonly [string, string] | [string, string]; className?: string; label?: string }) {
  const r = rng(seed);
  const id = "g" + seed.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const [a, b] = hue;
  const W = 400, H = 260;
  const blobs = Array.from({ length: 4 }, (_, i) => ({ cx: r() * W, cy: r() * H, rx: 90 + r() * 120, ry: 60 + r() * 90, c: i % 2 ? a : b, o: .45 + r() * .4 }));
  const nodes = Array.from({ length: 9 }, () => ({ x: 20 + r() * (W - 40), y: 20 + r() * (H - 40) }));
  return (
    <svg className={`gen-art ${className}`} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <filter id={`${id}b`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="38" /></filter>
        <linearGradient id={`${id}l`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <pattern id={`${id}p`} width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" strokeOpacity=".07" /></pattern>
      </defs>
      <rect width={W} height={H} fill="#070d1b" />
      <g filter={`url(#${id}b)`}>{blobs.map((o, i) => <ellipse key={i} cx={o.cx} cy={o.cy} rx={o.rx} ry={o.ry} fill={o.c} opacity={o.o} />)}</g>
      <rect width={W} height={H} fill={`url(#${id}p)`} />
      {variant === "mesh" && <g>
        {nodes.map((n, i) => nodes.slice(i + 1).filter(() => r() > .72).map((m, j) => <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="#fff" strokeOpacity=".28" />))}
        {nodes.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={i === 0 ? 7 : 3 + r() * 3} fill={i === 0 ? b : "#fff"} opacity={i === 0 ? 1 : .85} />)}
      </g>}
      {variant === "orbit" && <g transform={`translate(${W * (.35 + r() * .3)} ${H / 2})`}>
        {[40, 72, 106, 142].map((rad, i) => <g key={rad}><circle r={rad} fill="none" stroke="#fff" strokeOpacity={.14 + i * .04} strokeDasharray={i % 2 ? "2 6" : undefined} /><circle cx={Math.cos(r() * 6.28) * rad} cy={Math.sin(r() * 6.28) * rad} r={4 + i} fill={i % 2 ? a : b} /></g>)}
        <circle r="16" fill={`url(#${id}l)`} />
      </g>}
      {variant === "circuit" && <g stroke="#fff" strokeOpacity=".45" fill="none" strokeWidth="1.4">
        {Array.from({ length: 7 }, (_, i) => { const y = 25 + i * 32 + r() * 10; const x1 = r() * 120; const x2 = 150 + r() * 140; const y2 = y + (r() - .5) * 60; return <g key={i}><path d={`M${x1} ${y}H${x2 - 20}L${x2} ${y2}H${W}`} stroke={i % 3 === 0 ? a : "#fff"} strokeOpacity={i % 3 === 0 ? .9 : .35} /><circle cx={x1} cy={y} r="3.5" fill="#fff" /></g>; })}
        <rect x={W / 2 - 42} y={H / 2 - 30} width="84" height="60" rx="10" fill="#0b1426" stroke={`url(#${id}l)`} strokeWidth="2" strokeOpacity="1" />
      </g>}
      {variant === "bars" && <g>
        {Array.from({ length: 12 }, (_, i) => { const h = 30 + r() * 150; return <rect key={i} x={28 + i * 30} y={H - 24 - h} width="16" height={h} rx="4" fill={i % 4 === 3 ? b : "#fff"} opacity={i % 4 === 3 ? .95 : .22 + r() * .3} />; })}
        <polyline fill="none" stroke={`url(#${id}l)`} strokeWidth="3" points={Array.from({ length: 12 }, (_, i) => `${36 + i * 30},${60 + r() * 110}`).join(" ")} />
      </g>}
      {variant === "wave" && <g fill="none">
        {Array.from({ length: 9 }, (_, i) => { const y = 60 + i * 16; const k = 30 + r() * 40; return <path key={i} d={`M0 ${y} C ${W * .3} ${y - k}, ${W * .6} ${y + k}, ${W} ${y - k / 2}`} stroke={i % 2 ? a : b} strokeOpacity={.35 + i * .06} strokeWidth="1.6" />; })}
      </g>}
    </svg>
  );
}
