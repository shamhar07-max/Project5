import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Menu } from "lucide-react";
export const divisions = [
  { slug:"academy",name:"Academy",label:"Learn",description:"Build practical skills through real work and evidence." },
  { slug:"studio",name:"Studio",label:"Build",description:"Turn promising ideas into considered digital products." },
  { slug:"business",name:"Business AI",label:"Improve",description:"Make operations work better with measured, responsible AI." },
  { slug:"talent",name:"Verified Talent",label:"Grow",description:"Show your capability with evidence and control who sees it." },
];
export function SiteHeader() {
  return <header className="site-header"><div className="shell header-inner"><Link href="/" aria-label="DigitalBurj home" className="brand-link"><span className="brand-wordmark"><Image src="/brand/digitalburj-wordmark-approved.webp" width={2048} height={512} alt="" unoptimized/></span></Link><nav aria-label="Main navigation" className="desktop-nav"><Link href="/ecosystem">Ecosystem</Link><Link href="/academy">Academy</Link><Link href="/studio">Studio</Link><Link href="/business">Business AI</Link><Link href="/talent">Talent</Link></nav><Link href="/get-started" className="btn btn-dark header-action">Start here <ArrowUpRight size={17}/></Link><details className="mobile-menu"><summary aria-label="Open navigation"><Menu size={25}/></summary><nav aria-label="Mobile navigation"><Link href="/ecosystem">Ecosystem</Link>{divisions.map(d=><Link key={d.slug} href={`/${d.slug}`}>{d.name}</Link>)}<Link href="/jobs">Jobs</Link><Link href="/company">Company</Link><Link href="/workspace">Workspace</Link><Link href="/get-started">Get started</Link></nav></details></div></header>;
}
export function SiteFooter() {
  return <footer className="site-footer"><div className="shell footer-main"><div><Link href="/" aria-label="DigitalBurj home" className="footer-brand"><span className="footer-brand-wordmark"><Image src="/brand/digitalburj-wordmark-approved.webp" width={2048} height={512} alt="" unoptimized/></span></Link><p>Learn. Build. Transform.<br/>One connected digital ecosystem.</p></div><div><h2>Explore</h2><Link href="/academy">Academy</Link><Link href="/studio">Studio</Link><Link href="/business">Business AI</Link><Link href="/talent">Verified Talent</Link><Link href="/jobs">Jobs</Link></div><div><h2>DigitalBurj</h2><Link href="/company">Company</Link><Link href="/ecosystem">Ecosystem</Link><Link href="/technology">Technology</Link><Link href="/contact">Contact</Link></div><div><h2>Your space</h2><Link href="/get-started">Get started</Link><Link href="/workspace">Workspace</Link><Link href="/docs">Guides</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} DigitalBurj</span><span>Built around real progress.</span></div></footer>;
}
