# DigitalBurj implementation status

Reference: DigitalBurj Complete Master Structure (September 2026) and the supplied DigitalBurj Academy HTML prototype.

## Working in the current private Site

- Corporate homepage and company, ecosystem, technology, contact, Get Started, documentation, status, privacy and terms routes.
- Public division overview routes for Academy, Studio, Business AI, Verified Talent and Jobs.
- One authenticated workspace with individual and organization context, membership invitations, scoped records, support tickets, organization messages, private document storage and an activity log.
- Studio and Business AI intake forms with persisted, scoped enquiries.
- Studio and Business AI working briefs created from enquiries, with structured discovery entries, measured/estimated baseline labels, a discovery request stage and event history. Records are restricted to their individual or organization workspace. A discovery request does not approve a project or automation.
- Academy public catalogue with the 23 DB units and 12 professional units from the provided HTML. Course detail, search and category filtering are available.
- Academy learner workspace with saved units, practice drafts, a 12-stage task model and private profile and consent settings. Drafts are not assessed, verified or published.
- Private Talent profile and self-reported evidence, explicitly marked Declared and Private. No entry can self-assign a verified status.
- Private Jobs opportunity tracker with personal status updates; it does not send an application to an employer.

## Required to match the full blueprint

- Connect the actual teaching content, assessments, reviewer assignments, feedback, independent verification and credential issuance for Academy. The provided HTML is a planning prototype; it does not contain production course material or a working assessment service.
- Add Studio staff-side qualification, validation decisions, contracts, project roles, milestones, QA, client approvals, deployment and handover. The current brief covers client-side discovery input only.
- Add Business AI staff-side diagnosis, proposals, approval gates, controlled workflow execution, run metering and reports. The current brief captures problem and baseline input only.
- Add Talent evidence review, verifier separation, field-level sharing consent and employer access. Current profiles and evidence are private and self-reported.
- Add employer-managed Jobs postings, employer verification, actual applications, interviews, offers and hiring outcomes. The current tracker is personal only.
- Add governed platform administration, billing and a verified plan catalogue, notification delivery, global search, published API contracts and live service monitoring.
- Obtain production legal and commercial review for privacy, terms, regional content, prices, taxes and refund rules.
- Connect email, payment, verification and monitoring providers. Set up the proposed DigitalBurj domains and publication access. The current Site remains private and uses ChatGPT sign-in rather than a standalone DigitalBurj identity provider.
- Perform security review, file malware scanning, backup and restore testing, accessibility QA and cross-role acceptance tests before opening the platform to customers.

No route should label a practice draft as a credential, a prototype price as a confirmed offer, an enquiry as an approved project, or an unverified profile as independently verified.

## September 25 redesign (public experience + conversion channels)

- New luxury-technology design system (`app/experience.css`), shared shell with ⌘K command palette, premium full-screen mobile menu, thumb-reach mobile dock, route curtain transitions and scroll choreography (`app/_ui/`).
- Home page rebuilt around the blueprint narrative: cinematic hero, scrubbed brand statement, division bento, interactive flywheel, sticky Academy/Studio/Business AI stories, signature decisions lab (BUILD/RESHAPE/STOP, leak finder, AI risk dial), technology bento, channel stage, outcome router, principles and ventures with honest status.
- Division pages (Studio, Business AI, Talent, Jobs) and the Academy page carry blueprint content: service lines, workflows, states, engagement models.
- Conversion channels:
  - **WhatsApp** (`/connect/whatsapp`): guided composer with live preview. It stores a `leads` row with a reference code and opens `wa.me` with the message pre-written when `DIGITALBURJ_WHATSAPP_NUMBER` is set; otherwise it stores the request and says so.
  - **Mobile app** (`/app`): installable PWA (manifest shortcuts, service worker with offline page, install prompt / iOS steps). Native store apps are not published.
  - **Web app** (`/platform`): tour of the real workspace areas.
- Backend: `leads` table (migration `0009`), `POST /api/leads` (zod validation, honeypot, same-origin check, 5 requests / 10 minutes per client hash), `GET /api/leads` (WhatsApp availability), `/workspace/leads` (your own requests; all requests plus status updates for `DIGITALBURJ_STAFF_EMAILS`, audit-logged).
- Media: every photo is placed once (`npm run check:media`).

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DIGITALBURJ_WHATSAPP_NUMBER` | Official WhatsApp Business number in international format, for example `9715XXXXXXXX`. |
| `DIGITALBURJ_STAFF_EMAILS` | Comma-separated sign-in emails that may see and update all channel requests. |

For local development, put these in `.dev.vars` (ignored by Git) and apply `drizzle/0009_*.sql` to the local D1 database as described in the README.
