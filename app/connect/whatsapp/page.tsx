import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader, SiteFooter } from "../../site-shell";
export const dynamic="force-dynamic";
export default function WhatsApp(){
  const number=(process.env.DIGITALBURJ_WHATSAPP_NUMBER||"").replace(/\D/g,"");
  if(number.length>=8&&number.length<=15) redirect(`https://wa.me/${number}?text=${encodeURIComponent("Hello DigitalBurj, I would like to discuss a project or learning path.")}`);
  return <main className="public-site"><SiteHeader/><section className="shell section-pad min-h-[60vh]"><span className="eyebrow">Contact / WhatsApp</span><h1 className="display-title max-w-3xl">WhatsApp is <span className="serif-accent">being connected.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-[#526577]">We need an official DigitalBurj business number before we can open a verified conversation. You can still send a Studio or Business AI enquiry through your workspace.</p><div className="mt-9 flex flex-wrap gap-3"><Link href="/workspace/intake?service=studio" className="btn btn-red">Studio enquiry ↗</Link><Link href="/workspace/intake?service=business" className="btn btn-dark">Business AI consultation ↗</Link></div></section><SiteFooter/></main>;
}
