"use client";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

/** Shown when a server action rejects input or a page fails; keeps the person oriented. */
export function ActionError({ error, reset, home }: { error: Error & { digest?: string }; reset: () => void; home: string }) {
  const message = error.message && !/^An error occurred in the Server Components render/.test(error.message) ? error.message : "Something went wrong while saving. Nothing was changed.";
  return <div className="app-error" role="alert">
    <AlertTriangle size={22} aria-hidden="true" />
    <h1>That didn&apos;t go through</h1>
    <p>{message}</p>
    {error.digest && <small>Reference: {error.digest}</small>}
    <div className="app-inline">
      <button className="app-btn app-btn-primary" onClick={() => { history.back(); reset(); }}>Go back and fix it</button>
      <Link className="app-btn app-btn-ghost" href={home}>Return home</Link>
    </div>
  </div>;
}
