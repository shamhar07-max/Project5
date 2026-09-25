export type AcademyCourse = { code: string; title: string; maturity: string; hours: number; level: string; prereq: string; family: string };
export const academyCourses: AcademyCourse[] = [
  {
    "code": "DB-00",
    "title": "Digital Foundations",
    "maturity": "Active",
    "hours": 57,
    "level": "L1",
    "prereq": "None",
    "family": "Technology"
  },
  {
    "code": "DB-01",
    "title": "Real-World Problem Solving & Product Thinking",
    "maturity": "Active",
    "hours": 36,
    "level": "L1",
    "prereq": "DB-00",
    "family": "Technology"
  },
  {
    "code": "DB-02",
    "title": "Professional Web Development",
    "maturity": "Active",
    "hours": 115,
    "level": "L2",
    "prereq": "DB-01",
    "family": "Technology"
  },
  {
    "code": "DB-03",
    "title": "Backend, APIs & Databases",
    "maturity": "Active",
    "hours": 115,
    "level": "L2",
    "prereq": "DB-02",
    "family": "Technology"
  },
  {
    "code": "DB-04",
    "title": "AI-Native Software Development",
    "maturity": "Planning",
    "hours": 64,
    "level": "L3",
    "prereq": "DB-03",
    "family": "Technology"
  },
  {
    "code": "DB-05",
    "title": "Data, PostgreSQL & Business Data",
    "maturity": "Planning",
    "hours": 105,
    "level": "L3",
    "prereq": "DB-03",
    "family": "Technology"
  },
  {
    "code": "DB-06",
    "title": "Production Engineering",
    "maturity": "Planning",
    "hours": 72,
    "level": "L3",
    "prereq": "DB-03",
    "family": "Technology"
  },
  {
    "code": "DB-07",
    "title": "Secure Software & Cybersecurity",
    "maturity": "Planning",
    "hours": 70,
    "level": "L3",
    "prereq": "DB-03",
    "family": "Technology"
  },
  {
    "code": "DB-08",
    "title": "Software Testing & Quality Engineering",
    "maturity": "Planning",
    "hours": 65,
    "level": "L3",
    "prereq": "DB-02",
    "family": "Technology"
  },
  {
    "code": "DB-09",
    "title": "Payments, Ledgers, Webhooks & Money",
    "maturity": "Planning",
    "hours": 60,
    "level": "L3",
    "prereq": "DB-03",
    "family": "Technology"
  },
  {
    "code": "DB-10",
    "title": "Real-Time Applications",
    "maturity": "Planning",
    "hours": 55,
    "level": "L3",
    "prereq": "DB-03",
    "family": "Technology"
  },
  {
    "code": "DB-11",
    "title": "Documents, Uploads & Storage",
    "maturity": "Planning",
    "hours": 45,
    "level": "L3",
    "prereq": "DB-03",
    "family": "Technology"
  },
  {
    "code": "DB-12",
    "title": "AI Agents, Automation & Business Workflows",
    "maturity": "Planning",
    "hours": 63,
    "level": "L3",
    "prereq": "DB-04",
    "family": "Technology"
  },
  {
    "code": "DB-13",
    "title": "CRM / ERP / HRM",
    "maturity": "Planning",
    "hours": 52,
    "level": "L2",
    "prereq": "DB-00",
    "family": "Technology"
  },
  {
    "code": "DB-14",
    "title": "Mobile App Builder",
    "maturity": "Planning",
    "hours": 58,
    "level": "L2",
    "prereq": "DB-02",
    "family": "Technology"
  },
  {
    "code": "DB-15",
    "title": "Search & AI Visibility Engineering",
    "maturity": "Planning",
    "hours": 45,
    "level": "L2",
    "prereq": "DB-01",
    "family": "Technology"
  },
  {
    "code": "DB-16",
    "title": "Social Media & Content Operations",
    "maturity": "Planning",
    "hours": 62,
    "level": "L2",
    "prereq": "DB-01",
    "family": "Technology"
  },
  {
    "code": "DB-17",
    "title": "From Idea to MVP",
    "maturity": "Planning",
    "hours": 64,
    "level": "L4",
    "prereq": "DB-01",
    "family": "Technology"
  },
  {
    "code": "DB-18",
    "title": "Build, Launch & Grow",
    "maturity": "Planning",
    "hours": 58,
    "level": "L4",
    "prereq": "DB-17",
    "family": "Technology"
  },
  {
    "code": "DB-19",
    "title": "Digital Transformation Consulting",
    "maturity": "Planning",
    "hours": 72,
    "level": "L4",
    "prereq": "DB-13",
    "family": "Technology"
  },
  {
    "code": "DB-20",
    "title": "Client Delivery & Freelancing",
    "maturity": "Planning",
    "hours": 48,
    "level": "L4",
    "prereq": "DB-17",
    "family": "Technology"
  },
  {
    "code": "DB-21",
    "title": "Business Operations & Practice",
    "maturity": "Planning",
    "hours": 37,
    "level": "L2",
    "prereq": "DB-00",
    "family": "Technology"
  },
  {
    "code": "DB-22",
    "title": "Professional Challenge",
    "maturity": "Restricted",
    "hours": 72,
    "level": "L5",
    "prereq": "DB-17",
    "family": "Assessment"
  },
  {
    "code": "PC-RE01",
    "title": "Real Estate & Property Management",
    "maturity": "Proposed",
    "hours": 109,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-AD01",
    "title": "Office Administration & Executive Assistance",
    "maturity": "Proposed",
    "hours": 108,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-AC01",
    "title": "Accounting & Bookkeeping",
    "maturity": "Proposed",
    "hours": 157,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-LG01",
    "title": "Freight Forwarding & Logistics",
    "maturity": "Proposed",
    "hours": 179,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-DC01",
    "title": "Document Clearing & Government Services Administration",
    "maturity": "Proposed",
    "hours": 123,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-BF01",
    "title": "Banking & Financial Services Operations",
    "maturity": "Proposed",
    "hours": 147,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-IN01",
    "title": "Insurance Operations & Administration",
    "maturity": "Proposed",
    "hours": 119,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-IM01",
    "title": "Immigration & Mobility Administration",
    "maturity": "Proposed",
    "hours": 114,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-HR01",
    "title": "Human Resources & Recruitment",
    "maturity": "Proposed",
    "hours": 142,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-SM01",
    "title": "SME Business Operations",
    "maturity": "Proposed",
    "hours": 80,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-CS01",
    "title": "Customer Service & Call Centre Operations",
    "maturity": "Proposed",
    "hours": 60,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  },
  {
    "code": "PC-PC01",
    "title": "Procurement & Purchasing",
    "maturity": "Proposed",
    "hours": 90,
    "level": "L2",
    "prereq": "Foundation diagnostic",
    "family": "Professional"
  }
];
export const academyStages = ["BRIEF", "LEARN", "INVESTIGATE", "TRY", "BUILD", "BREAK", "FIX", "TEST", "EXPLAIN", "DEFEND", "SHIP", "EVIDENCE"];
