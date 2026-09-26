"use client";
import { useState, useTransition } from "react";
import { Download, Loader2, Save, Sparkles, Wand2 } from "lucide-react";
import { claudeDraftAction, saveCreationAction } from "../actions";
import type { StudioTool } from "../../../lib/academy/plans";
import { Toast } from "./app-shell";

export type StudioProps<T> = { id: string | null; initial: T | null; canAI: boolean; aiConfigured: boolean; canExport: boolean; quota: number | null; used: number; planName: string };

export function download(name: string, content: string | Blob, type = "text/plain") {
  const blob = typeof content === "string" ? new Blob([content], { type }) : content;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "untitled";

/** Save + Claude draft + toast plumbing shared by every studio tool. */
export function useStudio<T>(tool: StudioTool, p: StudioProps<T>) {
  const [id, setId] = useState(p.id);
  const [source, setSource] = useState<"template" | "claude">("template");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [drafting, startDraft] = useTransition();
  const [dirty, setDirty] = useState(false);

  function save(title: string, data: T) {
    startSave(async () => {
      const r = await saveCreationAction(tool, id, title, data, source);
      if (r.ok) { setId(r.id); setDirty(false); setToast("Saved to your studio"); if (!id) history.replaceState(null, "", `?id=${r.id}`); }
      else setToast(r.error);
    });
  }
  /** Asks Claude for a draft; resolves null (and explains) when unavailable so callers keep the template draft. */
  function claude(brief: Record<string, unknown>, apply: (data: unknown) => void) {
    startDraft(async () => {
      const r = await claudeDraftAction(tool, brief);
      if (r.ok) { apply(r.data); setSource("claude"); setDirty(true); setToast("Claude draft ready — review before use"); }
      else setToast(r.reason === "not_configured" ? "Claude drafting isn't configured on this deployment" : r.reason === "plan" ? "Claude drafting is included in Educator & Creator and Professional" : `Claude couldn't draft this (${r.reason}). Your template draft is unchanged.`);
    });
  }
  const toastEl = <Toast msg={toast} onDone={() => setToast(null)} />;
  return { id, source, setSource, save, saving, claude, drafting, toast: setToast, toastEl, dirty, setDirty };
}

export function StudioHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", alignItems: "end" }} className="a-no-print">
    <div><span className="a-eyebrow">{eyebrow}</span><h1 className="a-h2" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", marginTop: ".5rem" }}>{title}</h1></div>
    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>{children}</div>
  </div>;
}

export function GenerateButtons({ onTemplate, onClaude, canAI, aiConfigured, drafting }: { onTemplate: () => void; onClaude: () => void; canAI: boolean; aiConfigured: boolean; drafting: boolean }) {
  return <div style={{ display: "grid", gap: ".5rem" }}>
    <button type="button" className="a-btn a-btn-primary a-btn-block" onClick={onTemplate}><Wand2 size={17} />Generate draft</button>
    {aiConfigured && <button type="button" className="a-btn a-btn-violet a-btn-block" onClick={onClaude} disabled={drafting || !canAI} title={canAI ? "" : "Included in Educator & Creator and Professional"}>{drafting ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}{drafting ? "Claude is drafting…" : canAI ? "Draft with Claude" : "Draft with Claude (upgrade)"}</button>}
    <p className="a-muted" style={{ fontSize: ".72rem", lineHeight: 1.5 }}>{aiConfigured ? "Template drafts are instant and private to your browser. Claude drafts are sent to Anthropic to generate — don't include personal data." : "Drafts come from the built-in template engine, instantly, in your browser. Everything is editable."}</p>
  </div>;
}

export function SaveButton({ onClick, saving, dirty, quota, used, hasId }: { onClick: () => void; saving: boolean; dirty: boolean; quota: number | null; used: number; hasId: boolean }) {
  const full = !hasId && quota !== null && used >= quota;
  return <button type="button" className="a-btn a-btn-white a-btn-sm" onClick={onClick} disabled={saving || full} title={full ? `Your package includes ${quota} saves for this tool` : ""}>{saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}{full ? `Save limit (${quota})` : dirty || !hasId ? "Save" : "Saved"}</button>;
}

export function ExportButton({ label, onClick, canExport }: { label: string; onClick: () => void; canExport: boolean }) {
  return <button type="button" className="a-btn a-btn-glass a-btn-sm" onClick={onClick} disabled={!canExport} title={canExport ? "" : "Export is included from Academy Plus"}><Download size={15} />{label}</button>;
}
