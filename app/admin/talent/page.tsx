import { desc, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { employerVerifications, talentEvidence, verificationRequests } from "../../../db/schema";
import { Btn, Chip, Empty, Field, PageHead, Panel, fmt } from "../../_app/kit";
import { AdminShell, Tabs } from "../shell";
import { adminContext } from "../../../lib/platform";
import { claimVerification, decideEmployer, decideVerification, revokeVerification } from "./actions";

export const dynamic = "force-dynamic";

export default async function TalentAdmin({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { user, roles } = await adminContext("talent");
  const tab = (await searchParams).tab ?? "verification";
  const db = getDb();
  const [requests, employers] = await Promise.all([
    db.select().from(verificationRequests).orderBy(desc(verificationRequests.updatedAt)).limit(200),
    db.select().from(employerVerifications).orderBy(desc(employerVerifications.updatedAt)),
  ]);
  const evidence = requests.length ? await db.select().from(talentEvidence).where(inArray(talentEvidence.id, requests.map(r => r.evidenceId))) : [];
  const open = requests.filter(r => ["SUBMITTED", "UNDER_REVIEW"].includes(r.status));
  const pendingEmployers = employers.filter(e => e.status === "PENDING");
  return <AdminShell roles={roles} email={user.email} active="talent">
    <PageHead kicker="Admin · Verified Talent" title="Verification" lede="Evidence submitted → identity & evidence review → verifier decision: verified, rejected or more information. Employers are verified before they can search or hire." />
    <Tabs base="/admin/talent" active={tab} tabs={[["verification", `Evidence (${open.length})`], ["employers", `Employers (${pendingEmployers.length})`], ["history", "Decided"]]} />
    {tab === "verification" && <Panel title="Open requests">{open.length ? <div className="app-rows">{open.map(r => { const e = evidence.find(x => x.id === r.evidenceId); const mine = r.verifierId === user.userId; return <div key={r.id} className="app-row" style={{ alignItems: "flex-start" }}>
      <div className="app-row-main"><strong>{e?.title}</strong><small>{e?.capability} · {e?.source} · requested {fmt(r.createdAt)}</small><p className="app-pre app-note" style={{ marginTop: ".3rem" }}>{e?.description}</p>{r.note && <p className="app-note">Professional&apos;s note: {r.note}</p>}
        {mine && r.status === "UNDER_REVIEW" && <form action={decideVerification} className="app-form" style={{ marginTop: ".6rem" }}><input type="hidden" name="id" value={r.id} /><Field label="Note (required unless verifying)"><textarea name="note" rows={2} /></Field><div className="app-inline"><Btn name="decision" value="VERIFIED">Verify</Btn><Btn kind="secondary" name="decision" value="MORE_INFO">Ask for more info</Btn><Btn kind="danger" name="decision" value="REJECTED">Reject</Btn></div></form>}
      </div><Chip state={r.status} />
      {r.status === "SUBMITTED" && <form action={claimVerification}><input type="hidden" name="id" value={r.id} /><Btn kind="secondary">Claim</Btn></form>}
    </div>; })}</div> : <Empty title="No open verification requests" />}</Panel>}
    {tab === "employers" && <Panel title="Employer verification requests">{employers.length ? <div className="app-rows">{employers.map(v => <div key={v.orgId} className="app-row" style={{ alignItems: "flex-start" }}>
      <div className="app-row-main"><strong>{v.companyName}</strong><small>{v.website || "no website"} · registration {v.registration || "—"} · {fmt(v.updatedAt)}</small>{v.note && <p className="app-note">{v.note}</p>}</div><Chip state={v.status} />
      {v.status === "PENDING" && <form action={decideEmployer} className="app-inline"><input type="hidden" name="orgId" value={v.orgId} /><input name="note" placeholder="Reason (required to reject)" /><Btn name="decision" value="VERIFIED">Verify</Btn><Btn kind="danger" name="decision" value="REJECTED">Reject</Btn></form>}
    </div>)}</div> : <Empty title="No employer requests" />}</Panel>}
    {tab === "history" && <Panel title="Decided requests">{requests.filter(r => !["SUBMITTED", "UNDER_REVIEW"].includes(r.status)).map(r => { const e = evidence.find(x => x.id === r.evidenceId); return <div key={r.id} className="app-row"><div className="app-row-main"><strong>{e?.title}</strong><small>{r.note}</small></div><Chip state={r.status} />{r.status === "VERIFIED" && <form action={revokeVerification} className="app-inline"><input type="hidden" name="id" value={r.id} /><input name="reason" placeholder="Reason" required minLength={10} /><Btn kind="danger">Revoke</Btn></form>}</div>; })}</Panel>}
  </AdminShell>;
}
