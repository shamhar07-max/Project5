// Division accents follow blueprint Part III-A: Academy blue, Studio purple/indigo,
// Business AI teal/green; Talent and Jobs use supporting families.
// Single source of truth for DigitalBurj divisions, navigation and photography.
// Every photograph is registered once in `media` and each key is placed in exactly one
// location on the site (enforced by scripts/check-media.mjs), so no image repeats.

export const media = {
  homeHero: "/brand/hero-digitalburj-v2.webp",
  cardAcademy: "/brand/system-academy.webp",
  cardStudio: "/brand/system-studio.webp",
  cardBusiness: "/brand/system-business.webp",
  storyAcademy: "/brand/story-academy.webp",
  storyStudio: "/brand/story-studio-ai.webp",
  storyBusiness: "/brand/strategy.jpg",
  heroAcademy: "/brand/hero-academy-generated.webp",
  heroStudio: "/brand/hero-studio-generated.webp",
  heroBusiness: "/brand/hero-business-generated.webp",
  heroTalent: "/brand/hero-talent-generated.webp",
  heroJobs: "/brand/reception.jpg",
  academySpace: "/brand/academy.jpg",
  academyWorkshop: "/brand/workshop.jpg",
  academyProjects: "/brand/projects.jpg",
  companyHero: "/brand/studio.jpg",
  ecosystemHero: "/brand/collaboration.jpg",
  getStartedHero: "/brand/consulting.jpg",
} as const;
export type MediaKey = keyof typeof media;

export type DivisionSlug = "academy" | "studio" | "business" | "talent" | "jobs";
export type Division = {
  slug: DivisionSlug;
  name: string;
  verb: string;
  tagline: string;
  description: string;
  hue: [string, string];
  domain: string;
};

export const divisions: Division[] = [
  { slug: "academy", name: "Academy", verb: "Learn", tagline: "Learn it. Apply it. Prove it.", description: "Capability-building through practical missions, assessed work and evidence you can show.", hue: ["#2563eb", "#38bdf8"], domain: "academy.digitalburj.com" },
  { slug: "studio", name: "Studio", verb: "Build", tagline: "Build what deserves to exist.", description: "Validation-first product engineering: discovery, design, software, QA and delivery.", hue: ["#7c3aed", "#818cf8"], domain: "studio.digitalburj.com" },
  { slug: "business", name: "Business AI", verb: "Transform", tagline: "Fix the process. Then automate it.", description: "Operational diagnosis, workflow redesign and governed automation with measured results.", hue: ["#0d9488", "#22c55e"], domain: "business.digitalburj.com" },
  { slug: "talent", name: "Verified Talent", verb: "Verify", tagline: "Capability you can see. Evidence you can trust.", description: "A capability passport that separates declared, assessed and verified skills.", hue: ["#f59e0b", "#f97316"], domain: "talent.digitalburj.com" },
  { slug: "jobs", name: "Jobs", verb: "Hire", tagline: "More than applications. Better hiring decisions.", description: "Structured recruitment where candidates and employers see a clear path.", hue: ["#f43f5e", "#fb923c"], domain: "jobs.digitalburj.com" },
];
export const divisionBySlug = Object.fromEntries(divisions.map(d => [d.slug, d])) as Record<DivisionSlug, Division>;

export const primaryNav = [
  { href: "/academy", label: "Academy" },
  { href: "/studio", label: "Studio" },
  { href: "/business", label: "Business AI" },
  { href: "/technology", label: "Technology" },
  { href: "/ecosystem", label: "Ecosystem" },
  { href: "/company", label: "Company" },
];

export const channelNav = [
  { href: "/platform", label: "Web app", note: "Your private workspace in any browser" },
  { href: "/app", label: "Mobile app", note: "Install DigitalBurj on your home screen" },
  { href: "/connect/whatsapp", label: "WhatsApp", note: "Start with a guided conversation" },
];

// Searchable destinations for the command palette.
export const discoveryIndex: { href: string; title: string; group: string; keywords?: string }[] = [
  ...divisions.map(d => ({ href: `/${d.slug}`, title: `${d.name} — ${d.tagline}`, group: "Divisions", keywords: d.description })),
  { href: "/academy/catalogue", title: "Academy catalogue", group: "Learn", keywords: "courses units search" },
  { href: "/academy/tools", title: "Academy tool library", group: "Learn", keywords: "tools resources" },
  { href: "/workspace/academy", title: "My learning", group: "Workspace", keywords: "progress drafts" },
  { href: "/workspace/intake?service=studio", title: "Start a Studio project enquiry", group: "Start", keywords: "build app product software mobile saas" },
  { href: "/workspace/intake?service=business", title: "Request a Business AI consultation", group: "Start", keywords: "automation process ai diagnose" },
  { href: "/connect/whatsapp", title: "Talk to us on WhatsApp", group: "Channels", keywords: "chat message phone" },
  { href: "/app", title: "Install the DigitalBurj mobile app", group: "Channels", keywords: "pwa install phone ios android" },
  { href: "/platform", title: "The DigitalBurj web app", group: "Channels", keywords: "workspace dashboard" },
  { href: "/get-started", title: "Find your path", group: "Start", keywords: "router goal outcome" },
  { href: "/technology", title: "Technology capabilities", group: "Company", keywords: "software ai data cloud security" },
  { href: "/ecosystem", title: "The connected ecosystem", group: "Company", keywords: "flywheel" },
  { href: "/company", title: "About DigitalBurj", group: "Company", keywords: "mission approach ventures" },
  { href: "/contact", title: "Contact", group: "Company", keywords: "email enquiry" },
  { href: "/workspace", title: "Open workspace", group: "Workspace", keywords: "sign in dashboard" },
  { href: "/workspace/support", title: "Support tickets", group: "Workspace", keywords: "help" },
  { href: "/docs", title: "Guides", group: "Resources", keywords: "documentation help" },
  { href: "/support", title: "Help center", group: "Resources", keywords: "faq how to support knowledge base" },
  { href: "/docs/api", title: "API reference & webhooks", group: "Resources", keywords: "developers integration api key webhook" },
  { href: "/jobs/board", title: "Open roles — jobs board", group: "Jobs", keywords: "careers vacancies hiring apply" },
  { href: "/workspace/approvals", title: "My approvals", group: "Workspace", keywords: "approve milestone offer automation" },
  { href: "/workspace/notifications", title: "Notifications", group: "Workspace", keywords: "alerts updates" },
  { href: "/workspace/academy/credentials", title: "My credentials", group: "Learn", keywords: "certificate verified" },
  { href: "/workspace/jobs/employer", title: "Employer console", group: "Jobs", keywords: "recruit hire post job" },
  { href: "/workspace/account", title: "Account, privacy & data export", group: "Workspace", keywords: "gdpr delete download consent" },
  { href: "/status", title: "Service status", group: "Resources", keywords: "uptime incidents" },
  { href: "/privacy", title: "Privacy", group: "Resources" },
  { href: "/terms", title: "Terms", group: "Resources" },
];

export const outcomes = [
  { id: "learn", label: "Learn a skill", division: "academy" as DivisionSlug, detail: "Practical units with missions and evidence.", href: "/academy/catalogue", action: "Browse the catalogue" },
  { id: "build", label: "Build a product", division: "studio" as DivisionSlug, detail: "Validate the idea, then design and engineer it.", href: "/workspace/intake?service=studio", action: "Start a Studio enquiry" },
  { id: "transform", label: "Fix a process", division: "business" as DivisionSlug, detail: "Diagnose the leak before automating anything.", href: "/workspace/intake?service=business", action: "Request a consultation" },
  { id: "team", label: "Train my team", division: "academy" as DivisionSlug, detail: "Role-based learning paths for an organization.", href: "/workspace/organizations", action: "Set up an organization" },
  { id: "talent", label: "Show my capability", division: "talent" as DivisionSlug, detail: "Build a private profile with your evidence.", href: "/workspace/talent", action: "Open Talent workspace" },
  { id: "general", label: "Something else", division: "jobs" as DivisionSlug, detail: "Tell us in a sentence and we will route it.", href: "/connect/whatsapp", action: "Start a conversation" },
];
