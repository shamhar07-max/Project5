"use client";
import { useState } from "react";
import { CheckCircle2, Copy, Download, Monitor, PlusSquare, Share } from "lucide-react";
import { useInstall } from "../_ui/pwa";

/** Adapts to the visitor's device: one-tap install, iOS instructions, or a link to open on a phone. */
export function InstallPanel() {
  const { state, install } = useInstall();
  const [copied, setCopied] = useState(false);
  return <div className="install" aria-live="polite">
    {state === "installed" && <div className="install-state ok"><CheckCircle2 size={28} /><div><strong>DigitalBurj is installed.</strong><p>Open it from your home screen or app launcher any time.</p></div></div>}
    {state === "installable" && <div className="install-state"><Download size={28} /><div><strong>Ready to install</strong><p>Adds DigitalBurj to your home screen with shortcuts to learning, projects and WhatsApp.</p><button type="button" className="install-btn" onClick={() => install()}>Install DigitalBurj</button></div></div>}
    {state === "ios" && <div className="install-state"><Share size={28} /><div><strong>Install on iPhone or iPad</strong>
      <ol className="ios-steps"><li><span>1</span>Tap <Share size={15} /> <b>Share</b> in Safari</li><li><span>2</span>Choose <PlusSquare size={15} /> <b>Add to Home Screen</b></li><li><span>3</span>Tap <b>Add</b> — DigitalBurj opens full screen</li></ol></div></div>}
    {(state === "unsupported" || state === "unknown") && <div className="install-state"><Monitor size={28} /><div><strong>Open this page on your phone</strong><p>On Android (Chrome) you will see an install button; on iPhone use Safari’s “Add to Home Screen”. Desktop Chrome and Edge can also install it from the address bar.</p>
      <button type="button" className="install-btn ghost-btn" onClick={async () => { try { await navigator.clipboard.writeText(location.origin + "/app"); setCopied(true); } catch { setCopied(false); } }}><Copy size={16} /> {copied ? "Link copied" : "Copy link"}</button></div></div>}
  </div>;
}
