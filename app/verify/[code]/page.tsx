import { eq } from "drizzle-orm";
import { BadgeCheck, ShieldAlert } from "lucide-react";
import { getDb } from "../../../db";
import { credentials } from "../../../db/schema";
import { SiteHeader, SiteFooter } from "../../site-shell";
import { SectionHead } from "../../_ui/sections";
import { Scene } from "../../_ui/scenes";

export const dynamic = "force-dynamic";

// Public credential verification (blueprint Domain 02 §9: "Credentials verifiable").
export default async function Verify({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase().slice(0, 20);
  const c = /^DBC-[A-Z0-9]{8}$/.test(code) ? await getDb().select().from(credentials).where(eq(credentials.code, code)).get().catch(() => undefined) : undefined;
  const ok = c?.status === "active";
  return <main className="site">
    <SiteHeader />
    <section className="band-tight page-top">
      <div className="wrap">
        <SectionHead index="✓" kicker="Credential verification" title={c ? (ok ? <>This credential is <em>valid.</em></> : <>This credential was <em>revoked.</em></>) : <>No credential <em>found.</em></>} />
        <div className="split-even split">
        <div className="verify-card" data-state={c ? (ok ? "ok" : "revoked") : "none"}>
          {c ? <>
            {ok ? <BadgeCheck size={40} /> : <ShieldAlert size={40} />}
            <dl className="app-kv" style={{ fontSize: "1rem" }}>
              <dt>Credential ID</dt><dd>{c.code}</dd>
              <dt>Holder</dt><dd>{c.holderName}</dd>
              <dt>Achievement</dt><dd>{c.title}</dd>
              <dt>Academy unit</dt><dd>{c.courseCode}</dd>
              {c.skills && <><dt>Skills</dt><dd>{c.skills}</dd></>}
              <dt>Issued</dt><dd>{c.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</dd>
              <dt>Process</dt><dd>Human assessment against a published rubric, then separate independent verification</dd>
              {!ok && <><dt>Status</dt><dd>Revoked{c.statusReason ? ` — ${c.statusReason}` : ""}</dd></>}
            </dl>
          </> : <p>Check the ID for typos. Genuine DigitalBurj credential IDs look like <b>DBC-7Q2KX9MA</b>.</p>}
        </div>
        <div className="figure"><Scene k="cardAcademy" /></div>
        </div>
      </div>
    </section>
    <SiteFooter />
  </main>;
}
