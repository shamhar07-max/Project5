// Course structure for the Academy player. Three flagship units carry fully
// authored lessons; every other unit is generated from its purpose statement into
// the standard course contract (foundations → scenario practice → mission →
// evidence) and is labelled as an outline until its teaching materials ship.
import { academyStages } from "../../app/academy-data";
import { courseByCode, type CatalogCourse } from "./catalog";

export type Check = { q: string; options: string[]; answer: number; why: string };
export type Lesson = { id: string; title: string; minutes: number; kind: "read" | "watch" | "practice" | "check"; summary: string; body: string[]; keyPoints: string[]; check?: Check };
export type Module = { id: string; title: string; lessons: Lesson[] };
export type Mission = { title: string; scenario: string; deliverables: string[]; constraints: string[]; rubric: [string, number][]; tools: string[] };
export type CourseDetail = CatalogCourse & { purpose: string; outcomes: string[]; modules: Module[]; mission: Mission; authored: boolean; tools: string[] };

export const PURPOSE: Record<string, string> = {
  "DB-00": "Build core digital literacy, safe working habits, files, systems and online collaboration.",
  "DB-01": "Frame user and business problems, test assumptions and define useful solutions.",
  "DB-02": "Create accessible, responsive web experiences with professional delivery practices.",
  "DB-03": "Design services, APIs, data models and reliable application foundations.",
  "DB-04": "Use AI-assisted development with review, testing, security and accountable decisions.",
  "DB-05": "Model, query, clean and interpret business data using database practice.",
  "DB-06": "Understand deployment, observability, reliability, incidents and operational change.",
  "DB-07": "Apply secure design, access control, threat awareness and responsible handling.",
  "DB-08": "Plan tests, investigate defects, automate checks and communicate quality.",
  "DB-09": "Practise transaction concepts, ledgers, reconciliation, webhooks and money handling.",
  "DB-10": "Explore live updates, events, state, concurrency and user feedback loops.",
  "DB-11": "Handle document workflows, upload rules, metadata, storage and retention.",
  "DB-12": "Map workflows and design accountable automation with human review.",
  "DB-13": "Understand business systems, records, permissions, process flow and data quality.",
  "DB-14": "Plan and prototype mobile experiences, data flows, testing and release readiness.",
  "DB-15": "Improve discoverability, structured content, search intent and AI-readable information.",
  "DB-16": "Plan, produce, schedule, measure and govern content operations.",
  "DB-17": "Turn a validated problem into a scoped, testable minimum viable product.",
  "DB-18": "Coordinate delivery, launch preparation, feedback, iteration and sustainable growth.",
  "DB-19": "Assess operating models, prioritise change and communicate options.",
  "DB-20": "Scope work, manage expectations, deliver professionally and document outcomes.",
  "DB-21": "Build repeatable operating routines, controls, reporting and service practice.",
  "DB-22": "Demonstrate capability through constrained work, injected incidents and a live defence.",
};

const TOOLS_BY_FAMILY: Record<string, string[]> = {
  Technology: ["VS Code", "Git / GitHub", "PostgreSQL", "Figma", "AI assistant (with review)"],
  Foundation: ["Word / Google Docs", "Excel / Google Sheets", "Email & calendar", "AI assistant (with review)"],
  Professional: ["Excel / Google Sheets", "Email & calendar", "CRM / ERP sandbox", "Canva"],
  Advanced: ["Excel / Google Sheets", "Power BI", "CRM / ERP sandbox", "Presentation deck"],
  Assessment: ["Evidence pack", "Git / GitHub", "Presentation deck"],
};

const COMPANIES = ["Marina Freight LLC", "Oasis Dental Clinic", "Palm Coffee Roasters", "Creek Property Partners", "Sahara Supplies Trading", "Gulf Tutors Centre"];
const companyFor = (code: string) => COMPANIES[[...code].reduce((a, c) => a + c.charCodeAt(0), 0) % COMPANIES.length];

const lesson = (id: string, title: string, minutes: number, kind: Lesson["kind"], summary: string, body: string[], keyPoints: string[], check?: Check): Lesson => ({ id, title, minutes, kind, summary, body, keyPoints, check });

// ---------------------------------------------------------------- authored units
const AUTHORED: Record<string, { outcomes: string[]; modules: Module[]; mission: Mission }> = {
  "DB-00": {
    outcomes: ["Organise files and folders so a colleague can find anything in under a minute", "Recognise phishing, weak passwords and unsafe sharing before they cause harm", "Collaborate in shared documents with comments, suggestions and version history", "Choose the right tool for a task and explain the choice"],
    modules: [
      { id: "m1", title: "Working digitally, safely", lessons: [
        lesson("l1", "How work moves through systems", 12, "read", "Files, apps, accounts and the cloud — and where your work actually lives.", [
          "Every piece of digital work has three parts: the content (a document, a spreadsheet, an image), the place it is stored (your device, a shared drive, a cloud service) and the people who can reach it (permissions).",
          "Most problems at work are not about the content. They are about the other two parts: a file saved on one laptop that nobody else can open, or a link shared with 'anyone' that should have been shared with three people.",
          "Before you create something, decide where it will live and who needs it. That one habit prevents most lost-work and over-sharing incidents.",
        ], ["Content, storage and access are separate decisions", "Decide where a file lives before you create it", "Shared drives beat personal devices for team work"]),
        lesson("l2", "Passwords, MFA and phishing", 15, "watch", "The three habits that stop most account takeovers.", [
          "Use a password manager and a unique password for every account. Reused passwords are the most common way one breach becomes many.",
          "Turn on multi-factor authentication (MFA) wherever it is offered. An authenticator app is stronger than SMS codes.",
          "Phishing messages create urgency, ask you to sign in through a link, or ask for payment details. Slow down: open the service directly instead of clicking the link, and report the message.",
        ], ["Unique passwords, stored in a manager", "MFA everywhere, app-based where possible", "Urgency + a sign-in link = verify separately"], { q: "An email from 'IT Support' says your mailbox will close in 1 hour unless you sign in through a link. What should you do first?", options: ["Sign in quickly so you do not lose email", "Reply asking if it is real", "Open the mail service directly and report the message", "Forward it to colleagues as a warning"], answer: 2, why: "Never use the link. Reach the service through a route you trust and report the message so others are protected." }),
        lesson("l3", "Files that others can find", 10, "practice", "Naming, folders and versions that survive a handover.", [
          "Use names that sort well and explain themselves: 2026-09-25_ClientName_Proposal_v2.docx beats 'final final (3).docx'.",
          "Keep folder structures shallow — three levels is usually enough — and agree them with your team.",
          "Rely on version history instead of saving copies. If you must keep a copy, record why in the file name or a short note.",
        ], ["Date_Client_Document_Version", "Shallow, agreed folder structures", "Version history over duplicate copies"]),
      ] },
      { id: "m2", title: "Collaboration in practice", lessons: [
        lesson("l4", "Comments, suggestions and ownership", 12, "read", "Working in one document without overwriting each other.", [
          "Suggest mode lets you propose changes the owner can accept or reject. Use it whenever you are editing someone else's work.",
          "A comment should name the problem and propose a fix: 'Figure 2 uses last year's numbers — update from the Q3 report?' is actionable; 'this is wrong' is not.",
          "Every shared document needs an owner who resolves comments and decides when it is done.",
        ], ["Suggest, don't overwrite", "Comments name a problem and a fix", "One owner per document"], { q: "You spot an error in a colleague's shared proposal the night before it is sent. Best move?", options: ["Fix it silently", "Add a suggestion with a comment explaining the source", "Message the client", "Ignore it — it's not your document"], answer: 1, why: "A suggestion keeps the owner in control and the comment explains why, so the fix can be checked." }),
        lesson("l5", "Choosing the right tool", 10, "practice", "Spreadsheet, document, slide deck or form?", [
          "Documents are for reasoning in sentences. Spreadsheets are for lists, numbers and anything you will sort or filter. Slides are for presenting a small number of ideas to people in a room. Forms are for collecting the same information from many people.",
          "When a task feels painful in a tool, it is often the wrong tool. A 200-row table in a document is a spreadsheet waiting to happen.",
        ], ["Match the tool to the shape of the work", "Pain is a signal you picked the wrong tool"]),
      ] },
      { id: "m3", title: "Evidence & reflection", lessons: [
        lesson("l6", "Putting your evidence pack together", 8, "read", "What to submit and how it will be reviewed.", [
          "Your evidence pack for this unit contains the folder structure you designed, the access decisions you made, and a short explanation of the trade-offs.",
          "Reviewers look for decisions you can defend, not decoration. Keep screenshots annotated and remove any real personal data.",
        ], ["Decisions over decoration", "Fictional data only", "Explain trade-offs in your own words"]),
      ] },
    ],
    mission: { title: "Rescue the shared drive", scenario: "Palm Coffee Roasters has four staff sharing one cloud drive. Files are duplicated, a supplier price list is shared publicly and nobody can find last month's invoices. You have one week to restructure it.", deliverables: ["A folder structure diagram with naming rules", "An access table: who can view, edit or share each area", "A one-page handover note for the owner"], constraints: ["Use fictional data only", "No more than three folder levels", "Every public link must be justified or removed"], rubric: [["Findability of the new structure", 30], ["Access decisions are least-privilege and justified", 30], ["Clarity of the handover note", 25], ["Professional presentation", 15]], tools: ["Google Drive or OneDrive", "Canva", "Excel / Google Sheets"] },
  },
  "DB-02": {
    outcomes: ["Build a responsive, accessible page from a written brief", "Structure HTML semantically and style it with modern CSS layout", "Test a page with keyboard only, a screen reader and small screens", "Ship to a static host and document what you changed and why"],
    modules: [
      { id: "m1", title: "Semantic structure", lessons: [
        lesson("l1", "HTML that means something", 18, "read", "Headings, landmarks and why a button is not a div.", [
          "Semantic HTML describes what content is, not how it looks. Screen readers, search engines and future maintainers all rely on that meaning.",
          "Use one h1 per page and nest headings in order. Wrap regions in landmarks — header, nav, main, footer — so assistive technology can jump between them.",
          "Interactive things should be real controls: <button> for actions, <a href> for navigation. They come with keyboard support and focus for free.",
        ], ["One h1, headings in order", "Landmarks: header, nav, main, footer", "Buttons act, links navigate"], { q: "A clickable card opens a product page. Which element should wrap it?", options: ["<div onclick>", "<a href>", "<button>", "<span role=link>"], answer: 1, why: "It navigates to another page, so it is a link. A real <a href> gives keyboard, focus and 'open in new tab' behaviour." }),
        lesson("l2", "Forms people can complete", 16, "practice", "Labels, errors and input types.", [
          "Every input needs a visible <label>. Placeholders disappear as soon as someone types and are not a substitute.",
          "Use the right input type (email, tel, number, date) so mobile keyboards help the user.",
          "Show errors next to the field, in words, and connect them with aria-describedby.",
        ], ["Visible labels, always", "Input types drive mobile keyboards", "Errors in words, next to the field"]),
      ] },
      { id: "m2", title: "Layout & responsiveness", lessons: [
        lesson("l3", "Flexbox and Grid in practice", 20, "watch", "Choosing one-dimensional or two-dimensional layout.", [
          "Flexbox distributes items along one axis — perfect for toolbars, nav bars and centring. Grid places items in rows and columns at once — ideal for page layouts and card galleries.",
          "grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)) builds a responsive card grid with no media queries.",
          "Design mobile-first: start with a single column and add columns as space allows.",
        ], ["Flex = one axis, Grid = two", "auto-fit + minmax for fluid grids", "Mobile-first media queries"], { q: "You need a gallery that shows as many 250px-wide cards per row as fit. Which rule?", options: ["display:flex; flex-wrap:nowrap", "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))", "float:left on each card", "position:absolute"], answer: 1, why: "auto-fit with minmax creates as many columns as fit and stretches them to fill the row." }),
        lesson("l4", "Accessible colour, focus and motion", 14, "read", "Contrast ratios, focus rings and reduced motion.", [
          "Body text needs a contrast ratio of at least 4.5:1 against its background (3:1 for large text).",
          "Never remove focus outlines without replacing them with something at least as visible.",
          "Respect prefers-reduced-motion: turn large animations into simple fades.",
        ], ["4.5:1 for body text", "Visible focus, always", "Honour reduced motion"]),
      ] },
      { id: "m3", title: "Testing & shipping", lessons: [
        lesson("l5", "Test like your users", 15, "practice", "Keyboard, screen reader, zoom and slow networks.", [
          "Unplug the mouse and complete every task with Tab, Shift+Tab, Enter and Space.",
          "Zoom to 200% and check nothing overlaps or disappears. Throttle the network and check the page is usable before images load.",
          "Record what you tested, what failed and what you fixed — that record is part of your evidence.",
        ], ["Keyboard-only walkthrough", "200% zoom and slow 3G", "Keep a test log"]),
        lesson("l6", "Deploy and document", 10, "read", "Static hosting, commits and a changelog.", [
          "Commit small, meaningful changes with messages that explain why. Deploy to a static host and add the URL to your evidence pack.",
          "Write a short README: what the page is for, how to run it, and known limitations.",
        ], ["Small commits that explain why", "A live URL in your evidence", "Known limitations stated plainly"]),
      ] },
    ],
    mission: { title: "Clinic booking landing page", scenario: "Oasis Dental Clinic needs a one-page site where patients can see services, opening hours and request an appointment. Many patients book on older phones and some use screen readers.", deliverables: ["A deployed responsive page", "An accessible appointment request form (no real submission needed)", "A test log covering keyboard, screen reader, zoom and mobile", "A README with decisions and limitations"], constraints: ["No CSS framework — plain HTML and CSS", "Lighthouse accessibility score of 95+", "Page weight under 500 KB"], rubric: [["Semantic structure and accessibility", 30], ["Responsive layout quality", 25], ["Testing evidence", 25], ["Documentation and decisions", 20]], tools: ["VS Code", "Git / GitHub", "Browser dev tools", "Figma"] },
  },
  "PC-AC01": {
    outcomes: ["Record sales, purchases and payments using double-entry", "Reconcile a bank statement and explain every difference", "Prepare a simple trial balance and spot common errors", "Communicate an accounts issue clearly to a manager"],
    modules: [
      { id: "m1", title: "Double-entry foundations", lessons: [
        lesson("l1", "Debits, credits and the accounting equation", 18, "read", "Assets = Liabilities + Equity, and why every entry has two sides.", [
          "Every transaction affects at least two accounts, and total debits always equal total credits. That is what keeps the accounting equation — Assets = Liabilities + Equity — in balance.",
          "Debits increase assets and expenses; credits increase liabilities, equity and income.",
          "When a business buys stock on credit, inventory (an asset) is debited and accounts payable (a liability) is credited.",
        ], ["Two sides to every entry", "Debits = Credits", "Assets = Liabilities + Equity"], { q: "Palm Coffee pays AED 2,000 rent from its bank account. Which entry is correct?", options: ["Dr Bank 2,000 / Cr Rent expense 2,000", "Dr Rent expense 2,000 / Cr Bank 2,000", "Dr Rent expense 2,000 / Cr Accounts payable 2,000", "Dr Equity 2,000 / Cr Bank 2,000"], answer: 1, why: "An expense increases (debit) and the bank asset decreases (credit)." }),
        lesson("l2", "Invoices, VAT and source documents", 15, "practice", "Reading an invoice like an accountant.", [
          "Every entry should trace back to a source document: a sales invoice, a supplier bill, a receipt or a bank statement line.",
          "Where VAT applies, record the net amount to income or expense and the VAT separately. Always label the jurisdiction and check current rules with a qualified adviser — this course uses fictional rates.",
        ], ["Every entry traces to a document", "Net and VAT recorded separately", "Jurisdiction rules need qualified review"]),
      ] },
      { id: "m2", title: "Reconciliation", lessons: [
        lesson("l3", "Bank reconciliation step by step", 20, "watch", "Matching the ledger to the bank and explaining the gap.", [
          "Start with the bank statement closing balance. Add deposits in transit, subtract unpresented payments, and compare with the ledger balance.",
          "Differences are usually timing (recorded in one place but not yet the other), bank charges not yet recorded, or errors such as transposed digits.",
          "A difference divisible by 9 often signals a transposition error (e.g. 540 recorded as 450).",
        ], ["Timing, charges or errors", "Divisible by 9 → check transpositions", "Every difference explained in writing"], { q: "Ledger shows AED 12,430; bank shows AED 12,340 with no timing items. What should you check first?", options: ["A missing bank charge", "A transposition error", "A duplicate invoice", "Foreign exchange"], answer: 1, why: "The difference is 90, which is divisible by 9 — the classic sign of swapped digits." }),
      ] },
      { id: "m3", title: "Reporting & communication", lessons: [
        lesson("l4", "Trial balance and error spotting", 16, "practice", "What a trial balance can and cannot prove.", [
          "A trial balance lists every account balance; total debits should equal total credits.",
          "A balanced trial balance does not prove the books are correct — errors of omission, principle or compensating errors can still hide inside it.",
        ], ["Balanced ≠ correct", "Know the error types"]),
        lesson("l5", "Explaining an issue to a manager", 10, "read", "Short, specific, with a recommendation.", [
          "Lead with the impact, then the cause, then what you recommend: 'The bank is AED 90 lower than the ledger because invoice 1043 was entered as 540 instead of 450. I have corrected it and the accounts now reconcile.'",
        ], ["Impact → cause → action", "Numbers, not adjectives"]),
      ] },
    ],
    mission: { title: "Month-end for Sahara Supplies", scenario: "Sahara Supplies Trading's bookkeeper has left mid-month. You receive 24 fictional source documents, a bank statement and a half-finished ledger. The owner needs a reconciled position by Thursday.", deliverables: ["Journal entries for every source document", "A completed bank reconciliation with every difference explained", "A trial balance", "A five-line summary email to the owner"], constraints: ["Fictional data only", "Every entry references its source document", "VAT treatment labelled as illustrative"], rubric: [["Accuracy of entries", 35], ["Reconciliation completeness", 30], ["Error identification", 20], ["Clarity of communication", 15]], tools: ["Excel / Google Sheets", "Email", "Accounting sandbox"] },
  },
};

// ---------------------------------------------------------------- generated units
function generated(c: CatalogCourse): { outcomes: string[]; modules: Module[]; mission: Mission } {
  const purpose = PURPOSE[c.code] ?? `Develop practical, role-based capability in ${c.title} through realistic scenarios.`;
  const company = companyFor(c.code);
  const t = c.title;
  return {
    outcomes: [
      `Explain the core concepts, vocabulary and responsibilities of ${t}`,
      `Apply ${t} practice to a realistic scenario with stated constraints`,
      "Find and fix failure cases before someone else does",
      "Present and defend your decisions with evidence",
    ],
    modules: [
      { id: "m1", title: "Foundations", lessons: [
        lesson("l1", `What ${t} is for`, 12, "read", purpose, [
          `${t} exists to solve a real problem: ${purpose.charAt(0).toLowerCase()}${purpose.slice(1)}`,
          "Before learning tools, learn the outcome. Ask who relies on this work, what a good result looks like to them, and what happens when it goes wrong.",
          "Throughout this unit you will keep a short decision log. It becomes part of your evidence and makes your reasoning visible to reviewers.",
        ], ["Outcome before tools", "Know who relies on the work", "Keep a decision log from day one"], { q: `Why start ${t} by defining the outcome rather than the tools?`, options: ["Tools change; the outcome tells you which tool fits", "Tools are not important", "Reviewers do not check tools", "It is faster to skip tools"], answer: 0, why: "A clear outcome lets you choose and justify tools, and it is what reviewers assess." }),
        lesson("l2", "Vocabulary and roles", 10, "watch", `The words and responsibilities you will meet in ${t} work.`, [
          "Every discipline has words that carry precise meanings. Misusing them in front of a client or reviewer costs credibility.",
          "Map the roles involved: who requests the work, who does it, who approves it and who is affected by it. Most failures happen at the hand-offs between them.",
        ], ["Precise vocabulary builds trust", "Map requester, doer, approver, affected"]),
        lesson("l3", "Working safely and responsibly", 8, "read", "Privacy, fictional data and knowing your limits.", [
          "Use fictional or consented data in every exercise. Never paste confidential information into an external tool or AI assistant.",
          "Where rules depend on a country or regulator, label the jurisdiction and treat course examples as illustrative — qualified review is required before real use.",
        ], ["Fictional data only", "Label jurisdiction-specific rules", "AI output needs human review"]),
      ] },
      { id: "m2", title: "Scenario practice", lessons: [
        lesson("l4", `A day at ${company}`, 15, "practice", `Walk through a realistic ${t} request from brief to result.`, [
          `${company} has asked for help. Read the brief, list what you know, what you assume and what you need to ask before starting.`,
          "Try a small version of the task first. A ten-minute experiment often reveals the constraint that would have broken the full solution.",
        ], ["Known / assumed / to ask", "Small experiment before full build"]),
        lesson("l5", "Break it on purpose", 12, "practice", "Edge cases, failure modes and what 'done' really means.", [
          "List five ways your result could fail: wrong input, missing data, an unusual user, an overloaded day, a misunderstanding of the brief.",
          "Fix the two most likely failures and record the rest as known limitations. Honest limitations score better than hidden ones.",
        ], ["List five failure modes", "Fix the likeliest two", "State the rest as limitations"], { q: "You found a failure you cannot fix before the deadline. What do you do?", options: ["Hide it", "Record it as a known limitation with impact and workaround", "Delay the whole submission indefinitely", "Blame the brief"], answer: 1, why: "Stating limitations is part of professional delivery and is rewarded in the rubric." }),
      ] },
      { id: "m3", title: "Evidence & review", lessons: [
        lesson("l6", "Assemble and defend your evidence", 10, "read", "How reviewers read your pack, and how verification differs.", [
          "Your evidence pack contains the artefact, your decision log, test notes and a short explanation. Reviewers score it against the published rubric.",
          "Assessment, independent verification and real workplace experience are separate claims. Completing this unit does not by itself establish any of the others.",
        ], ["Artefact + decisions + tests + explanation", "Assessment ≠ verification ≠ workplace experience"]),
      ] },
    ],
    mission: {
      title: `${t}: ${company} brief`,
      scenario: `${company} needs practical help with ${t}. They have limited time, a small team and no appetite for jargon. Your job is to deliver a working result they can use and explain.`,
      deliverables: ["The working artefact described in the brief", "A decision log with at least five decisions", "A test or check record", "A one-page explanation for a non-specialist"],
      constraints: ["Fictional data only", "State every assumption", "Human review of any AI-assisted output"],
      rubric: [["Correctness and completeness", 30], ["Problem solving and decisions", 25], ["Testing and failure handling", 25], ["Communication", 20]],
      tools: TOOLS_BY_FAMILY[c.family] ?? TOOLS_BY_FAMILY.Technology,
    },
  };
}

export function courseDetail(code: string): CourseDetail | null {
  const c = courseByCode(code);
  if (!c) return null;
  const a = AUTHORED[code];
  const g = a ?? generated(c);
  return { ...c, purpose: PURPOSE[code] ?? g.mission.scenario, outcomes: g.outcomes, modules: g.modules, mission: g.mission, authored: !!a, tools: g.mission.tools };
}

export const allLessons = (d: CourseDetail) => d.modules.flatMap(m => m.lessons);
export const lessonMinutes = (d: CourseDetail) => allLessons(d).reduce((s, l) => s + l.minutes, 0);
export const STAGES = academyStages;
export const STAGE_HELP: Record<string, string> = {
  BRIEF: "Understand the scenario, audience, outcome, constraints and definition of done.",
  LEARN: "Study the concepts, patterns, tools and safety considerations needed.",
  INVESTIGATE: "Gather requirements, inspect evidence, identify risks and test assumptions.",
  TRY: "Run a small guided experiment before committing to the full solution.",
  BUILD: "Create the requested artefact against the stated constraints.",
  BREAK: "Probe failure cases, edge cases, assumptions and resilience.",
  FIX: "Correct defects, improve decisions and document meaningful changes.",
  TEST: "Run appropriate checks and capture repeatable results.",
  EXPLAIN: "Explain choices, trade-offs, limitations and responsible use.",
  DEFEND: "Respond to questions, challenge and evidence-based review.",
  SHIP: "Package the result for the defined hand-off, without claiming production release.",
  EVIDENCE: "Submit the evidence pack, provenance, notes and consent choices.",
};
export const FLAGSHIP = Object.keys(AUTHORED);
