import Image from "next/image";

export type MarkName = "academy" | "studio" | "business" | "talent" | "jobs" | "platform" | "docs" | "contact" | "security" | "data" | "cloud" | "integrations" | "mobile" | "web" | "whatsapp";

const imageFor: Record<MarkName, string> = {
  academy: "academy", studio: "studio", business: "business", talent: "talent", jobs: "jobs",
  platform: "platform", docs: "academy", contact: "contact", security: "security", data: "data",
  cloud: "cloud", integrations: "studio", mobile: "platform", web: "platform", whatsapp: "contact",
};

export function BrandMark({ name, className = "", lockup = false }: { name: MarkName; className?: string; lockup?: boolean }) {
  return <span className={`brand-mark ${className}`} aria-hidden="true">
    <Image src={`/brand/editorial-thumbs/${imageFor[name]}.webp`} width={900} height={600} alt="" unoptimized />
    {lockup && <span className="brand-mark-lockup"><Image src="/brand/digitalburj-wordmark-approved.webp" width={2048} height={512} alt="" unoptimized /><b>{name === "business" ? "BUSINESS AI" : name === "talent" ? "VERIFIED TALENT" : name.toUpperCase()}</b></span>}
  </span>;
}

export function markForTitle(title: string): MarkName {
  if (/security|privacy|terms|consent|verify|evidence|credential/i.test(title)) return "security";
  if (/people|team|talent|career/i.test(title)) return "talent";
  if (/jobs|hire|recruit|role/i.test(title)) return "jobs";
  if (/data|report|analysis|measure/i.test(title)) return "data";
  if (/learn|academy|guide|course|skill/i.test(title)) return "academy";
  if (/contact|support|speak|talk/i.test(title)) return "contact";
  if (/cloud|reliab/i.test(title)) return "cloud";
  if (/business|process|operations|automation/i.test(title)) return "business";
  if (/product|software|platform|studio|build|design/i.test(title)) return "studio";
  return "integrations";
}
