"use client";
import { useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
declare global { interface Window { __dbInstall?: InstallEvent | null } }

/** Registers the service worker and keeps the browser's install prompt for the /app page. */
export function PwaRegister() {
  useEffect(() => {
    const keep = (e: Event) => { e.preventDefault(); window.__dbInstall = e as InstallEvent; window.dispatchEvent(new Event("db:installable")); };
    window.addEventListener("beforeinstallprompt", keep);
    if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", keep);
  }, []);
  return null;
}

export type InstallState = "unknown" | "installable" | "ios" | "installed" | "unsupported";

export function useInstall() {
  const [state, setState] = useState<InstallState>("unknown");
  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const decide = () => setState(standalone ? "installed" : window.__dbInstall ? "installable" : ios ? "ios" : "unsupported");
    decide();
    window.addEventListener("db:installable", decide);
    const done = () => { window.__dbInstall = null; setState("installed"); };
    window.addEventListener("appinstalled", done);
    return () => { window.removeEventListener("db:installable", decide); window.removeEventListener("appinstalled", done); };
  }, []);
  async function install() {
    const evt = window.__dbInstall;
    if (!evt) return false;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    if (outcome === "accepted") { window.__dbInstall = null; setState("installed"); }
    return outcome === "accepted";
  }
  return { state, install };
}
