// The full Academy catalogue: the canonical Technology curriculum (DB-00 → DB-22)
// from app/academy-data.ts, plus Professional Foundation (PF), the 25 Professional
// Career programmes (PC) and Advanced pathways (AD) from the Academy planning edition.
import { academyCourses } from "../../app/academy-data";

export type Family = "Technology" | "Foundation" | "Professional" | "Advanced" | "Assessment";
export type CatalogCourse = { code: string; title: string; family: Family; hours: number; level: string; prereq: string; maturity: string };

const PF: [string, string, number][] = [
  ["PF-01", "Professional English for the Workplace", 15], ["PF-02", "Business Email Writing & Communication", 8],
  ["PF-03", "Excel for Office Work", 15], ["PF-04", "Word & Business Documentation", 8],
  ["PF-05", "Professional Customer Service", 10], ["PF-06", "Office Administration Fundamentals", 12],
  ["PF-07", "Business Mathematics & Calculations", 10], ["PF-08", "Workplace Ethics, Confidentiality & Data Protection", 8],
  ["PF-09", "Job Search & Interview Preparation", 8], ["PF-10", "Workplace AI & Productivity Tools", 10],
];
const PC: [string, string, number][] = [
  ["PC-RE01", "Real Estate & Property Management", 109], ["PC-AD01", "Office Administration & Executive Assistance", 108],
  ["PC-AC01", "Accounting & Bookkeeping", 157], ["PC-LG01", "Freight Forwarding & Logistics", 179],
  ["PC-DC01", "Document Clearing & Government Services Administration", 123], ["PC-BF01", "Banking & Financial Services Operations", 147],
  ["PC-IN01", "Insurance Operations & Administration", 119], ["PC-IM01", "Immigration & Mobility Administration", 114],
  ["PC-HR01", "Human Resources & Recruitment", 142], ["PC-SM01", "SME Business Operations", 80],
  ["PC-SA01", "Sales & Business Development", 75], ["PC-CS01", "Customer Service & Call Centre Operations", 60],
  ["PC-PC01", "Procurement & Purchasing", 90], ["PC-WH01", "Warehouse & Inventory Management", 85],
  ["PC-EC01", "E-Commerce Operations", 80], ["PC-RT01", "Retail & Store Operations", 70],
  ["PC-HT01", "Hospitality Administration", 85], ["PC-TC01", "Travel & Tourism Operations", 90],
  ["PC-HC01", "Healthcare Administration", 90], ["PC-FM01", "Facilities Management Administration", 80],
  ["PC-CC01", "Construction Project Administration", 90], ["PC-PR01", "Payroll & Employee Benefits Administration", 85],
  ["PC-EX01", "Import & Export Operations", 90], ["PC-CM01", "Commercial Contracts Administration", 80],
  ["PC-AR01", "Accounts Receivable & Collections", 70],
];
const AD: [string, string, number][] = [
  ["AD-AC01", "Advanced Accounting & Financial Operations", 150], ["AD-LG01", "Advanced Freight Forwarding & Trade Operations", 150],
  ["AD-HR01", "Advanced HR & Payroll Operations", 140], ["AD-RE01", "Advanced Real Estate Operations", 120],
  ["AD-SM01", "SME Operations & Business Management", 140], ["AD-PC01", "Advanced Procurement & Supply Chain", 150],
  ["AD-BA01", "Business Analytics & Financial Reporting", 150], ["AD-AI01", "AI-Powered Business Operations", 140],
];

export const CATALOG: CatalogCourse[] = [
  ...academyCourses.filter(c => c.code.startsWith("DB-")).map(c => ({ ...c, family: (c.family === "Assessment" ? "Assessment" : "Technology") as Family })),
  ...PF.map(([code, title, hours]) => ({ code, title, hours, family: "Foundation" as Family, level: "L1", prereq: "None", maturity: "Active" })),
  ...PC.map(([code, title, hours]) => ({ code, title, hours, family: "Professional" as Family, level: "L2", prereq: "Foundation diagnostic", maturity: code === "PC-AC01" ? "Active" : "Proposed" })),
  ...AD.map(([code, title, hours]) => ({ code, title, hours, family: "Advanced" as Family, level: "L3", prereq: `PC-${code.slice(3)}`, maturity: "Planning" })),
];
export const courseByCode = (code: string) => CATALOG.find(c => c.code === code) ?? null;
export const FAMILIES: { id: Family; label: string; blurb: string }[] = [
  { id: "Technology", label: "Technology Academy", blurb: "Software, data, AI, security, product and delivery — DB-00 to DB-21." },
  { id: "Foundation", label: "Professional Foundation", blurb: "Workplace English, email, Excel, customer service and AI productivity." },
  { id: "Professional", label: "Professional Career", blurb: "25 role-based programmes for SMEs and industry functions." },
  { id: "Advanced", label: "Advanced Pathways", blurb: "Deeper specialisation with high-value assessed evidence." },
  { id: "Assessment", label: "DB-22 Assessment Centre", blurb: "Constrained challenge, injected incidents and a live defence." },
];

/** Career pathways: ordered routes through the catalogue (planning-edition bundles). */
export const PATHWAYS = [
  { id: "frontend", name: "Frontend Developer", includes: ["DB-00", "DB-01", "DB-02", "DB-08"], outcome: "Ship accessible, tested web interfaces." },
  { id: "backend", name: "Backend Developer", includes: ["DB-02", "DB-03", "DB-05", "DB-07"], outcome: "Design reliable APIs and data models." },
  { id: "ai", name: "AI Automation & Applications", includes: ["DB-04", "DB-12", "PF-10"], outcome: "Build accountable automation with human review." },
  { id: "data", name: "Data Analyst Foundation", includes: ["PF-03", "DB-05", "AD-BA01"], outcome: "Turn business data into decisions." },
  { id: "marketing", name: "Digital Marketing", includes: ["DB-15", "DB-16"], outcome: "Grow discoverability and run content operations." },
  { id: "office", name: "Office & Administration", includes: ["PF-01", "PF-02", "PF-04", "PC-AD01"], outcome: "Run a modern office with confidence." },
  { id: "accounting", name: "Junior Accounting", includes: ["PF-03", "PF-07", "PC-AC01", "PC-AR01"], outcome: "Book, reconcile and report accurately." },
  { id: "logistics", name: "Freight & Trade", includes: ["PC-LG01", "PC-EX01", "AD-LG01"], outcome: "Move goods and documents without surprises." },
];
