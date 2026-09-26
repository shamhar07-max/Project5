"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Clapperboard, FileText, Loader2, Pause, Play, Plus, SkipBack, Trash2, Volume2, VolumeX } from "lucide-react";
import { draftVideo, uid, type SceneIcon, type VideoInput, type VideoProject, type VideoScene } from "../../../lib/academy/studio";
import { ExportButton, GenerateButtons, SaveButton, StudioHeader, download, slug, useStudio, type StudioProps } from "./studio-kit";

const W = 1280, H = 720;
const DEFAULT: VideoInput = { topic: "DigitalBurj Academy", audience: "career switchers", goal: "prove real skills to employers", points: "Pick a practical unit, Complete a twelve-stage mission, Get reviewed against a rubric, Share evidence you control", duration: 60, style: "kinetic", accent: "#e10613" };
const ease = (x: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3);
const total = (p: VideoProject) => p.scenes.reduce((s, x) => s + x.seconds, 0);

function sceneAt(p: VideoProject, t: number) {
  let acc = 0;
  for (let i = 0; i < p.scenes.length; i++) { const s = p.scenes[i]; if (t < acc + s.seconds || i === p.scenes.length - 1) return { i, s, local: t - acc }; acc += s.seconds; }
  return { i: 0, s: p.scenes[0], local: 0 };
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const words = text.split(" "); const out: string[] = []; let line = "";
  for (const w of words) { const t = line ? `${line} ${w}` : w; if (ctx.measureText(t).width > max && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line);
  return out;
}

function icon(ctx: CanvasRenderingContext2D, kind: SceneIcon, x: number, y: number, r: number, color: string) {
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = r * .12; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ctx.beginPath();
  switch (kind) {
    case "spark": for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; const rr = k % 2 ? r * .45 : r; ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.stroke(); break;
    case "alert": ctx.moveTo(0, -r); ctx.lineTo(r * .95, r * .75); ctx.lineTo(-r * .95, r * .75); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -r * .35); ctx.lineTo(0, r * .2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, r * .45, r * .07, 0, 7); ctx.fill(); break;
    case "bulb": ctx.arc(0, -r * .15, r * .6, Math.PI * .8, Math.PI * 2.2); ctx.lineTo(r * .25, r * .6); ctx.lineTo(-r * .25, r * .6); ctx.closePath(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r * .25, r * .85); ctx.lineTo(r * .25, r * .85); ctx.stroke(); break;
    case "gear": for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; ctx.moveTo(Math.cos(a) * r * .6, Math.sin(a) * r * .6); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .6, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, r * .22, 0, 7); ctx.stroke(); break;
    case "chart": [[-.7, .3], [-.2, -.2], [.3, -.6], [.8, -1]].forEach(([bx, h]) => { ctx.moveTo(bx * r, r * .8); ctx.lineTo(bx * r, h * r * .8 + r * .2); }); ctx.lineWidth = r * .28; ctx.stroke(); break;
    case "check": ctx.arc(0, 0, r, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-r * .45, 0); ctx.lineTo(-r * .1, r * .35); ctx.lineTo(r * .5, -r * .35); ctx.stroke(); break;
    case "users": ctx.arc(-r * .35, -r * .3, r * .3, 0, 7); ctx.moveTo(r * .65, -r * .3); ctx.arc(r * .35, -r * .3, r * .3, 0, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(-r * .35, r * .75, r * .55, Math.PI, 0); ctx.moveTo(r * .9, r * .75); ctx.arc(r * .35, r * .75, r * .55, 0, Math.PI, true); ctx.stroke(); break;
    default: ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.moveTo(r * .35, -r * .6); ctx.lineTo(r, 0); ctx.lineTo(r * .35, r * .6); ctx.stroke();
  }
  ctx.restore();
}

export function renderFrame(ctx: CanvasRenderingContext2D, p: VideoProject, t: number) {
  const { i, s, local } = sceneAt(p, t);
  const a = p.accent || "#e10613";
  const light = p.style === "whiteboard";
  const ink = light ? "#111827" : "#ffffff";
  const sub = light ? "#4b5563" : "#c7cede";
  // background
  if (light) { ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, 0, W, H); ctx.strokeStyle = "#e7e3d8"; ctx.lineWidth = 1; for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); } }
  else {
    ctx.fillStyle = p.style === "cinematic" ? "#030305" : "#070b16"; ctx.fillRect(0, 0, W, H);
    const gx = W * (.75 + Math.sin(t * .4) * .08), gy = H * (.25 + Math.cos(t * .3) * .08);
    const g = ctx.createRadialGradient(gx, gy, 10, gx, gy, W * .7); g.addColorStop(0, a + "66"); g.addColorStop(1, "transparent"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const g2 = ctx.createRadialGradient(W * .1, H * .9, 10, W * .1, H * .9, W * .5); g2.addColorStop(0, "#7c3aed44"); g2.addColorStop(1, "transparent"); ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  }
  const fadeIn = ease(local / .6), fadeOut = 1 - ease((local - (s.seconds - .35)) / .35);
  ctx.globalAlpha = Math.max(0, Math.min(fadeIn, fadeOut));
  const left = 110;
  // kicker
  ctx.fillStyle = a; ctx.font = "700 22px 'JetBrains Mono', monospace";
  const kicker = s.kind === "step" ? `STEP ${p.scenes.slice(0, i + 1).filter(x => x.kind === "step").length}` : s.kind.toUpperCase();
  ctx.fillText(kicker, left, 200 - (1 - fadeIn) * 20);
  // icon
  const ir = 70 + Math.sin(t * 2) * 3;
  ctx.save(); ctx.globalAlpha *= .95; ctx.beginPath(); ctx.arc(W - 250, H / 2 - 20, ir + 40, 0, 7); ctx.fillStyle = light ? a + "18" : a + "22"; ctx.fill(); ctx.restore();
  icon(ctx, s.icon, W - 250, H / 2 - 20, ir * ease(local / .8), light ? a : "#fff");
  // heading
  ctx.fillStyle = ink; ctx.font = `800 ${s.heading.length > 40 ? 58 : 70}px Manrope, system-ui, sans-serif`;
  const hl = wrap(ctx, s.heading, W - left - 460);
  hl.forEach((line, k) => { const d = ease((local - k * .12) / .6); ctx.globalAlpha = Math.max(0, Math.min(d, fadeOut)); ctx.fillText(line, left, 280 + k * 78 + (1 - d) * 30); });
  // on-screen lines
  ctx.font = "600 32px Manrope, system-ui, sans-serif";
  const y0 = 300 + hl.length * 78;
  s.onScreen.slice(0, 3).forEach((line, k) => {
    const d = ease((local - .5 - k * .35) / .5); ctx.globalAlpha = Math.max(0, Math.min(d, fadeOut));
    ctx.fillStyle = a; ctx.fillRect(left, y0 + k * 56 - 20, 6 * d, 26);
    ctx.fillStyle = sub; ctx.fillText(line, left + 24 + (1 - d) * 24, y0 + k * 56);
    if (s.kind === "problem" && local > 1.2 + k * .5) { ctx.strokeStyle = a; ctx.lineWidth = 3; const w = ctx.measureText(line).width * ease((local - 1.2 - k * .5) / .4); ctx.beginPath(); ctx.moveTo(left + 24, y0 + k * 56 - 10); ctx.lineTo(left + 24 + w, y0 + k * 56 - 10); ctx.stroke(); }
  });
  ctx.globalAlpha = 1;
  // cinematic letterbox
  if (p.style === "cinematic") { ctx.fillStyle = "#000"; ctx.fillRect(0, 0, W, 60); ctx.fillRect(0, H - 60, W, 60); }
  // progress + brand
  const T = total(p);
  ctx.fillStyle = light ? "#11182722" : "#ffffff22"; ctx.fillRect(0, H - 6, W, 6);
  ctx.fillStyle = a; ctx.fillRect(0, H - 6, W * Math.min(1, t / T), 6);
  ctx.fillStyle = light ? "#9ca3af" : "#ffffff88"; ctx.font = "600 18px 'JetBrains Mono', monospace"; ctx.fillText(p.title.toUpperCase().slice(0, 48), left, H - 34);
  return i;
}

const lines = (s: string) => s.split("\n").map(x => x.trim()).filter(Boolean);

export function VideoStudio(props: StudioProps<{ input: VideoInput; project: VideoProject }>) {
  const s = useStudio("video", props);
  const [input, setInput] = useState<VideoInput>(props.initial?.input ?? DEFAULT);
  const [p, setP] = useState<VideoProject>(props.initial?.project ?? draftVideo(DEFAULT));
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [voice, setVoice] = useState(true);
  const [rec, setRec] = useState<number | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0); const t0 = useRef(0); const spoke = useRef(-1); const tRef = useRef(0);
  const T = total(p);
  const cur = sceneAt(p, t).i;
  const up = (fn: (x: VideoProject) => void) => { setP(x => { const y = structuredClone(x); fn(y); return y; }); s.setDirty(true); };

  const draw = useCallback((time: number) => { const c = canvas.current?.getContext("2d"); if (c) renderFrame(c, p, time); }, [p]);
  useEffect(() => { if (!playing) draw(tRef.current); }, [draw, playing]);

  const speak = useCallback((sc: VideoScene) => {
    if (!voice || typeof speechSynthesis === "undefined") return;
    speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(sc.narration); u.rate = 1.02; speechSynthesis.speak(u);
  }, [voice]);

  useEffect(() => {
    if (!playing) { cancelAnimationFrame(raf.current); if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel(); return; }
    t0.current = performance.now() - tRef.current * 1000; spoke.current = -1;
    const loop = (now: number) => {
      const time = (now - t0.current) / 1000;
      if (time >= T) { tRef.current = T; setT(T); draw(T - .001); setPlaying(false); return; }
      tRef.current = time; setT(time); const i = sceneAt(p, time).i; draw(time);
      if (i !== spoke.current) { spoke.current = i; speak(p.scenes[i]); }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [playing, T, draw, p, speak]);

  const seek = (time: number) => { setPlaying(false); tRef.current = time; setT(time); draw(time); };

  async function exportWebm() {
    const c = canvas.current; if (!c || !("MediaRecorder" in window)) { s.toast("Your browser can't record video — try Chrome or Edge"); return; }
    setPlaying(false);
    const stream = c.captureStream(30);
    const type = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(m => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
    const mr = new MediaRecorder(stream, { mimeType: type, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = []; mr.ondataavailable = e => e.data.size && chunks.push(e.data);
    const done = new Promise<void>(r => { mr.onstop = () => r(); });
    mr.start(250); const start = performance.now(); setRec(0);
    await new Promise<void>(resolve => { const loop = (now: number) => { const time = (now - start) / 1000; renderFrame(c.getContext("2d")!, p, Math.min(time, T - .001)); setRec(Math.min(100, Math.round((time / T) * 100))); if (time < T) requestAnimationFrame(loop); else resolve(); }; requestAnimationFrame(loop); });
    mr.stop(); await done; setRec(null);
    download(`${slug(p.title)}.webm`, new Blob(chunks, { type: "video/webm" }));
    s.toast("Video exported (silent) — add voice-over from the script");
  }

  function script() {
    return `${p.title}\nAudience: ${p.audience} · Style: ${p.style} · ${T}s\n\n` + p.scenes.map((x, i) => `SCENE ${i + 1} — ${x.kind.toUpperCase()} (${x.seconds}s)\nON SCREEN: ${x.heading}${x.onScreen.length ? " / " + x.onScreen.join(" / ") : ""}\nVO: ${x.narration}\nVISUAL: ${x.visual}\n`).join("\n");
  }
  function fromClaude(d: unknown) {
    const x = d as { title?: string; scenes?: Omit<VideoScene, "id">[] };
    if (!Array.isArray(x.scenes) || !x.scenes.length) return;
    setP({ ...p, title: x.title || p.title, audience: input.audience, style: input.style, accent: input.accent, scenes: x.scenes.map(sc => ({ ...sc, id: uid("s"), seconds: Math.max(2, Math.min(40, Math.round(sc.seconds) || 5)), onScreen: sc.onScreen ?? [] })) });
    seek(0);
  }

  return <>
    <StudioHeader eyebrow="Creator Studio · Explainer Video Generator" title={p.title}>
      <SaveButton onClick={() => s.save(p.title, { input, project: p })} saving={s.saving} dirty={s.dirty} quota={props.quota} used={props.used} hasId={!!s.id} />
      <ExportButton label={rec !== null ? `Recording ${rec}%` : "Export WebM"} canExport={props.canExport && rec === null} onClick={exportWebm} />
      <ExportButton label="Script" canExport={props.canExport} onClick={() => download(`${slug(p.title)}-script.txt`, script())} />
      <ExportButton label="Storyboard" canExport={props.canExport} onClick={() => download(`${slug(p.title)}-storyboard.json`, JSON.stringify(p, null, 2), "application/json")} />
    </StudioHeader>
    <div className="a-studio">
      <form className="a-card a-studio-form" onSubmit={e => e.preventDefault()}>
        <p className="a-eyebrow">Video brief</p>
        <label className="a-field"><span>Product, idea or topic</span><input className="a-input" value={input.topic} onChange={e => setInput({ ...input, topic: e.target.value })} /></label>
        <label className="a-field"><span>Audience</span><input className="a-input" value={input.audience} onChange={e => setInput({ ...input, audience: e.target.value })} /></label>
        <label className="a-field"><span>What should viewers be able to do?</span><input className="a-input" value={input.goal} onChange={e => setInput({ ...input, goal: e.target.value })} /></label>
        <label className="a-field"><span>How it works <small>(steps, comma or line separated)</small></span><textarea className="a-input" rows={3} value={input.points} onChange={e => setInput({ ...input, points: e.target.value })} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 70px", gap: ".6rem" }}>
          <label className="a-field"><span>Length</span><select className="a-input" value={input.duration} onChange={e => setInput({ ...input, duration: +e.target.value })}>{[30, 45, 60, 90, 120].map(x => <option key={x} value={x}>{x}s</option>)}</select></label>
          <label className="a-field"><span>Style</span><select className="a-input" value={input.style} onChange={e => { const v = e.target.value as VideoProject["style"]; setInput({ ...input, style: v }); up(x => { x.style = v; }); }}>{["kinetic", "whiteboard", "cinematic"].map(x => <option key={x}>{x}</option>)}</select></label>
          <label className="a-field"><span>Accent</span><input className="a-input" type="color" value={input.accent} onChange={e => { setInput({ ...input, accent: e.target.value }); up(x => { x.accent = e.target.value; }); }} style={{ padding: 4 }} /></label>
        </div>
        <GenerateButtons canAI={props.canAI} aiConfigured={props.aiConfigured} drafting={s.drafting}
          onTemplate={() => { setP(draftVideo(input)); s.setSource("template"); s.setDirty(true); seek(0); s.toast("Storyboard generated"); }}
          onClaude={() => s.claude({ ...input, durationSeconds: input.duration }, fromClaude)} />
      </form>

      <div style={{ display: "grid", gap: "1rem", minWidth: 0 }}>
        <div className="a-stage16"><canvas ref={canvas} width={W} height={H} aria-label={`Preview of ${p.title}, scene ${cur + 1}: ${p.scenes[cur]?.heading}`} /></div>
        <div className="a-card" style={{ display: "flex", gap: ".6rem", alignItems: "center", padding: ".7rem 1rem", flexWrap: "wrap" }}>
          <button type="button" className="a-btn a-btn-primary a-btn-sm" onClick={() => { if (t >= T) seek(0); setPlaying(x => !x); }} aria-label={playing ? "Pause" : "Play"}>{playing ? <Pause size={16} /> : <Play size={16} />}{playing ? "Pause" : "Play"}</button>
          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => seek(0)} aria-label="Restart"><SkipBack size={16} /></button>
          <input type="range" min={0} max={T} step={0.05} value={t} onChange={e => seek(+e.target.value)} style={{ flex: 1, accentColor: "#8b5cf6", minWidth: 120 }} aria-label="Timeline" />
          <span className="a-mono a-muted" style={{ fontSize: ".78rem" }}>{t.toFixed(1)}s / {T}s</span>
          <button type="button" className="a-btn a-btn-ghost a-btn-sm" onClick={() => setVoice(v => !v)} aria-pressed={voice} title="Browser voice-over preview">{voice ? <Volume2 size={16} /> : <VolumeX size={16} />}Voice</button>
        </div>
        {rec !== null && <div className="a-alert a-alert-info"><Loader2 size={17} className="animate-spin" />Recording in real time — keep this tab visible. {rec}%</div>}
        <div className="a-scene-list">
          {p.scenes.map((sc, i) => { const words = sc.narration.split(/\s+/).filter(Boolean).length; const long = words > sc.seconds * 2.7; return <div key={sc.id} className="a-scene" data-active={i === cur}>
            <button type="button" onClick={() => seek(p.scenes.slice(0, i).reduce((a, x) => a + x.seconds, 0) + .01)} className="a-icon-tile" style={{ width: 34, height: 34, borderRadius: 10, border: 0, cursor: "pointer", fontWeight: 800, fontSize: ".8rem" }} aria-label={`Jump to scene ${i + 1}`}>{i + 1}</button>
            <div style={{ display: "grid", gap: ".4rem", minWidth: 0 }}>
              <div style={{ display: "flex", gap: ".4rem", alignItems: "center", flexWrap: "wrap" }}>
                <span className="a-chip">{sc.kind}</span>
                <input className="a-editable" style={{ fontWeight: 750, flex: 1, minWidth: 160 }} value={sc.heading} onChange={e => up(x => { x.scenes[i].heading = e.target.value; })} aria-label="Heading" />
                <label className="a-muted" style={{ fontSize: ".75rem", display: "flex", gap: ".25rem", alignItems: "center" }}><input className="a-editable" type="number" min={2} max={40} value={sc.seconds} onChange={e => up(x => { x.scenes[i].seconds = Math.max(2, Math.min(40, +e.target.value)); })} style={{ width: 46 }} aria-label="Seconds" />s</label>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === 0} onClick={() => up(x => { [x.scenes[i - 1], x.scenes[i]] = [x.scenes[i], x.scenes[i - 1]]; })} aria-label="Move up" style={{ minHeight: 28, padding: "0 .4rem" }}><ArrowUp size={13} /></button>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={i === p.scenes.length - 1} onClick={() => up(x => { [x.scenes[i + 1], x.scenes[i]] = [x.scenes[i], x.scenes[i + 1]]; })} aria-label="Move down" style={{ minHeight: 28, padding: "0 .4rem" }}><ArrowDown size={13} /></button>
                <button type="button" className="a-btn a-btn-ghost a-btn-sm" disabled={p.scenes.length <= 2} onClick={() => up(x => { x.scenes.splice(i, 1); })} aria-label="Delete scene" style={{ minHeight: 28, padding: "0 .4rem" }}><Trash2 size={13} /></button>
              </div>
              <textarea className="a-editable a-muted" rows={1} value={sc.onScreen.join("\n")} onChange={e => up(x => { x.scenes[i].onScreen = lines(e.target.value).slice(0, 3); })} aria-label="On-screen text (one line each, max 3)" placeholder="On-screen text (one per line)" style={{ fontSize: ".85rem" }} />
              <label style={{ display: "flex", gap: ".4rem", alignItems: "flex-start", fontSize: ".85rem" }}><FileText size={14} style={{ marginTop: 6, flex: "none" }} className="a-muted" /><textarea className="a-editable" rows={2} value={sc.narration} onChange={e => up(x => { x.scenes[i].narration = e.target.value; })} aria-label="Narration" /></label>
              <p className="a-muted" style={{ fontSize: ".75rem", display: "flex", gap: ".4rem" }}><Clapperboard size={13} style={{ flex: "none", marginTop: 2 }} />{sc.visual}{long && <span style={{ color: "#fbbf24", marginLeft: "auto", whiteSpace: "nowrap" }}>{words} words — too long for {sc.seconds}s</span>}</p>
            </div>
          </div>; })}
          <button type="button" className="a-btn a-btn-glass" onClick={() => up(x => { x.scenes.splice(x.scenes.length - 1, 0, { id: uid("s"), kind: "step", heading: "New scene", onScreen: ["Key point"], narration: "Describe this step in one or two sentences.", visual: "Headline slides in; key point fades up.", seconds: 6, icon: "check" }); })}><Plus size={16} />Add scene</button>
        </div>
      </div>
    </div>
    {s.toastEl}
  </>;
}
