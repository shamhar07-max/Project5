import Link from "next/link";
import { ArrowUpRight, LayoutDashboard } from "lucide-react";
import { getAcademyAccount } from "../../../lib/academy/auth";
import { MobileMenu } from "./client";

export const ACADEMY_NAV = [
  { href: "/academy/catalogue", label: "Catalogue" },
  { href: "/academy/pathways", label: "Pathways" },
  { href: "/academy/studio", label: "Creator Studio" },
  { href: "/academy/how-it-works", label: "How it works" },
  { href: "/academy/pricing", label: "Pricing" },
  { href: "/academy/business", label: "For Business" },
];

export function Brand() {
  return <Link href="/academy" className="a-brand" aria-label="DigitalBurj Academy home">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/brand/db-iconmark.png" alt="" width={34} height={34} />
    <span>DigitalBurj<small>Academy</small></span>
  </Link>;
}

export async function AcademyHeader({ active }: { active?: string }) {
  const account = await getAcademyAccount().catch(() => null);
  return <header className="a-header">
    <div className="a-shell a-header-in">
      <Brand />
      <nav className="a-nav" aria-label="Academy">
        {ACADEMY_NAV.map(n => <Link key={n.href} href={n.href} aria-current={active === n.href ? "page" : undefined}>{n.label}</Link>)}
      </nav>
      <div className="a-header-tools">
        {account ? <>
          <span className="a-hide-sm a-muted" style={{ fontSize: ".85rem" }}>Hi, {account.name.split(" ")[0]}</span>
          <Link href="/academy/learn" className="a-btn a-btn-primary a-btn-sm"><LayoutDashboard size={15} />My learning</Link>
        </> : <>
          <Link href="/academy/sign-in" className="a-btn a-btn-ghost a-btn-sm a-hide-sm">Sign in</Link>
          <Link href="/academy/register" className="a-btn a-btn-white a-btn-sm">Register free</Link>
        </>}
        <MobileMenu items={[...ACADEMY_NAV, ...(account ? [{ href: "/academy/learn", label: "My learning" }] : [{ href: "/academy/sign-in", label: "Sign in" }, { href: "/academy/register", label: "Register" }]), { href: "/", label: "DigitalBurj home" }]} />
      </div>
    </div>
  </header>;
}

export function AcademyFooter() {
  return <footer className="a-footer">
    <div className="a-shell">
      <div className="a-footer-grid">
        <div>
          <Brand />
          <p className="a-muted" style={{ marginTop: "1rem", fontSize: ".9rem", lineHeight: 1.6, maxWidth: "22rem" }}>Learn it. Apply it. Prove it. Practical missions, honest assessment and evidence you control — part of the DigitalBurj ecosystem.</p>
          <p className="a-muted" style={{ marginTop: "1rem", fontSize: ".75rem", lineHeight: 1.6, maxWidth: "24rem" }}>Participation does not by itself provide employment, a licence, accreditation or a guaranteed outcome. Learning, assessment, verification and workplace experience are separate claims.</p>
        </div>
        <div><h4>Learn</h4><Link href="/academy/catalogue">Catalogue</Link><Link href="/academy/pathways">Pathways</Link><Link href="/academy/how-it-works">How learning works</Link><Link href="/academy/tools">Tools & labs</Link></div>
        <div><h4>Create</h4><Link href="/academy/studio">Creator Studio</Link><Link href="/academy/learn/studio/video">Explainer Video</Link><Link href="/academy/learn/studio/lesson-plan">AnyLessonPlan</Link><Link href="/academy/learn/studio/course">Course Studio</Link><Link href="/academy/learn/studio/slides">Presentations</Link></div>
        <div><h4>Account</h4><Link href="/academy/pricing">Pricing</Link><Link href="/academy/register">Register</Link><Link href="/academy/sign-in">Sign in</Link><Link href="/academy/learn">My learning</Link></div>
        <div><h4>DigitalBurj</h4><Link href="/">Home</Link><Link href="/studio">Studio</Link><Link href="/business">Business AI</Link><Link href="/talent">Verified Talent</Link><Link href="/support">Support</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div>
      </div>
      <hr className="a-divider" style={{ margin: "2.5rem 0 1.2rem" }} />
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", fontSize: ".8rem" }} className="a-muted">
        <span>© {new Date().getFullYear()} DigitalBurj Academy · academy.digitalburj.com</span>
        <Link href="/company" style={{ display: "inline-flex", gap: ".3rem", alignItems: "center" }}>Evidence before claims <ArrowUpRight size={13} /></Link>
      </div>
    </div>
  </footer>;
}

export async function PublicFrame({ active, children }: { active?: string; children: React.ReactNode }) {
  return <div className="acad">
    <AcademyHeader active={active} />
    <main>{children}</main>
    <AcademyFooter />
  </div>;
}

export function SectionHead({ eyebrow, title, lede, center, children }: { eyebrow: string; title: React.ReactNode; lede?: React.ReactNode; center?: boolean; children?: React.ReactNode }) {
  return <div data-reveal="up" style={{ display: "grid", gap: "1rem", marginBottom: "2.6rem", justifyItems: center ? "center" : "start", textAlign: center ? "center" : "left" }}>
    <span className="a-eyebrow">{eyebrow}</span>
    <h2 className="a-h2">{title}</h2>
    {lede && <p className="a-lede">{lede}</p>}
    {children}
  </div>;
}
