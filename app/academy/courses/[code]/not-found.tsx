import Link from "next/link";
import { PublicFrame } from "../../_components/chrome";
export default function NotFound() {
  return <PublicFrame><section className="a-hero"><div className="a-shell" style={{ display: "grid", gap: "1rem", justifyItems: "start" }}><h1 className="a-h2">Unit not found</h1><p className="a-lede">That unit code is not in the catalogue.</p><Link href="/academy/catalogue" className="a-btn a-btn-white">Browse the catalogue</Link></div></section></PublicFrame>;
}
