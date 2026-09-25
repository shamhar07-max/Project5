"use client";
import { useActionState } from "react";
import { createApiKey } from "./actions";
import { API_SCOPES as scopes } from "../../../lib/api-scopes";


export function KeyForm() {
  type S = { key?: string; error?: string };
  const [state, action, pending] = useActionState<S, FormData>(async (_, form) => {
    try { return { key: await createApiKey(form) }; } catch (e) { return { error: e instanceof Error ? e.message : "Could not create the key." }; }
  }, {});
  return <form action={action} className="app-form">
    <label className="app-field"><span>Key name</span><input name="name" required minLength={2} maxLength={60} placeholder="CRM sync" /></label>
    <fieldset className="app-inline" style={{ border: 0, padding: 0 }}><legend className="app-note" style={{ marginBottom: ".4rem" }}>Scopes</legend>{scopes.map(s => <label key={s} className="app-check" style={{ marginRight: ".8rem" }}><input type="checkbox" name={`scope:${s}`} defaultChecked={s.startsWith("read:organization")} /> {s}</label>)}</fieldset>
    <div><button className="app-btn app-btn-primary" disabled={pending}>{pending ? "Creating…" : "Create API key"}</button></div>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    {state.key && <div role="status"><p className="app-note"><b>Copy this key now.</b> It will not be shown again.</p><pre className="app-code">{state.key}</pre></div>}
  </form>;
}
