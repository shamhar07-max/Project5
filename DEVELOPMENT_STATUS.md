# DigitalBurj implementation status

Reference: DigitalBurj Complete Master Structure (September 2026) and the supplied DigitalBurj Academy HTML prototype.

## Built and verified (end-to-end, production build)

`npm run test:e2e` drives every workflow below as four separate people (client/candidate, DigitalBurj staff, an independent verifier and an employer) against `npm run deploy:local`. All 26 steps pass.

**Platform core**
- Identity and organizations: individual and organization context, invitations, org roles (owner, admin, member, finance, project approver, recruiter, hiring manager, learning manager, developer) with permission checks on every action.
- DigitalBurj staff roles (super admin, academy reviewer/verifier, studio/business delivery, talent verifier, jobs admin, support, finance, auditor), granted by email in Admin → Access and audit-logged. Non-staff get a 404 on `/admin`.
- Domain events, in-app notifications with preferences, a unified approval center, workflow state machines that reject illegal transitions, global search scoped to what you may see, audit log, account data export and a deletion request.
- Billing: invoice drafts, issue, paid, void and refund, with numbered invoices shown in the client workspace.
- Developers: organization API keys (hashed, scoped, revocable), REST API v1 with a consistent error model, request IDs, pagination and rate limits, HMAC-signed webhooks with delivery log, and public docs at `/docs/api`.

**Divisions**
- **Academy:** staff-authored practical missions with rubrics, learner submissions, reviewer claim and rubric assessment, independent verification (the assessor can never verify their own work), credential issuance and public verification at `/verify/<code>` without exposing email.
- **Studio:** qualification scoring, BUILD / RESHAPE / STOP decisions, delivery stages, milestones approved by the client, change requests with impact and quote, and the release-readiness checklist.
- **Business AI:** diagnosis metrics labelled measured or estimated, automations with risk levels, client approval of the design and a second approval before go-live for high-risk automations.
- **Verified Talent:** credentials flow into the Capability Passport, evidence visibility is set per item, verification requests are reviewed by staff, and a public or employer-only passport is available at `/talent/p/<slug>`. Only verified employers can search consenting profiles.
- **Jobs:** employer verification, listings with draft/publish/close, a public board at `/jobs/board`, applications that can share the passport, a stage pipeline, interviews with feedback, offers that need internal approval, and candidate accept or decline through to hired.

**Operations**
- Support desk: SLA targets by priority, assignment, internal notes, a resolve → reopen → close lifecycle and a public help centre at `/support`.
- Status: live checks of the database and file storage, incidents with updates on `/status` and `/api/v1/status`.
- Admin: executive overview plus one area per division, finance, support, status, access and audit.

## Still needs external providers or decisions

- Standalone DigitalBurj identity with MFA/passkeys. On ChatGPT Sites, sign-in uses ChatGPT accounts; on your own Cloudflare deployment it uses Google sign-in with a signed session cookie (see README). Server-side session revocation is not built yet: signing out clears the cookie, and sessions expire after 30 days.
- A payment gateway, tax/VAT rules and a verified price list. Invoices are recorded but not charged.
- Email/SMS/WhatsApp delivery for notifications and invitations. Notifications are in-app only.
- Malware scanning for uploaded files, a durable global rate limiter (the current limiter is per Worker instance), backups with restore drills, and a third-party security and accessibility audit.
- Real Academy teaching content (units are listed; staff author missions in Admin), legal review of privacy, terms and refunds, production domains and native app-store apps.

No route labels a practice draft as a credential, a prototype price as a confirmed offer, an enquiry as an approved project, or an unverified profile as independently verified.

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
| `DIGITALBURJ_STAFF_EMAILS` | Comma-separated sign-in emails that are always super admins (bootstrap). Other staff roles are granted in Admin → Access. |

For local development, put these in `.dev.vars` (ignored by Git) and run `npm run deploy:local`, which applies every migration in `drizzle/` to the local D1 database.

## Visual direction: authored imagery, no generated photography

Every photograph the site previously used was AI-generated. They have been removed. Imagery is now authored from things that are true about DigitalBurj:

- **Product scenes** (`app/_ui/scenes.tsx`, `app/scenes.css`): each placement shows a real part of the platform — the Academy mission rubric and review console, the credential seal, Studio's BUILD / RESHAPE / STOP gate and release checklist, a Business AI process leak, measured before/after and risk dial, the Capability Passport, the hiring pipeline and an approved offer, the WhatsApp first conversation. They sit on a blueprint of the Burj elevation, with its real coordinates and height.
- **DigitalBurj glyphs** (`app/_ui/glyphs.tsx`): a bespoke line-icon family on a 48-unit grid. The accent stroke carries the division colour, draws in on reveal, idles gently and speeds up on hover; tiles light a turning ring on hover. All motion stops under reduced-motion settings.
- **Genuine assets kept:** the approved wordmark and iconmark, and the partner logos from completed work.
- `npm run check:media` now verifies that each scene is placed exactly once and that no source references a photo outside the brand marks and partner logos.

If DigitalBurj commissions real photography (team, workshops, client sessions), it can be added back through the registry in `app/brand-data.ts`.

## Own Cloudflare deployment

`npm run deploy:cloudflare` (or the **Deploy to Cloudflare** GitHub Action) deploys to a free Cloudflare account. It creates or reuses D1 and R2, applies migrations remotely, generates a session secret once and deploys. With `DIGITALBURJ_AUTH=google`, identity headers are ignored and people sign in with Google (`/auth/sign-in`, `/auth/callback`, `/auth/sign-out`; PKCE, state check, verified email only). Tested locally:
- Forged identity headers are ignored.
- Tampered or expired sessions redirect to sign-in.
- Sign-out rejects external redirects.

## September 26: DigitalBurj Academy (`/academy`)

The Academy is now a full product with its own accounts, packages and learner app, built from the Academy Enterprise Production Blueprint, the Planning Edition prototype, the Final Production Workflow & System Blueprint and the Academy HTML prototypes.

**Public site** (`app/academy/`, dark design system in `app/academy/academy.css`): landing page (aurora hero, word rotator, tool marquee, Learn/Apply/Prove bento, family tabs, featured-unit carousel, Creator Studio bento, interactive 12-stage explorer, "find the anomaly" mission taster, lifecycle and L1–L5 capability levels, pathways, pricing, business band, FAQ), plus Catalogue (66 units: DB-00→22, PF-01→10, all 25 PC programmes, 8 AD pathways), unit pages, Pathways, Creator Studio, How it works, Pricing (with comparison matrix), For Business, and Tools & labs.

**Accounts** (`lib/academy/auth.ts`): register in three steps (account → diagnostic: experience, availability, route, goal → package and consents) or "Continue with DigitalBurj account", which links the platform identity (ChatGPT or Google sign-in) via `/academy/link`. Passwords use PBKDF2-SHA256 (100,000 iterations); sessions are HMAC-signed, HttpOnly cookies. Sign-in has a per-instance brute-force brake. Needs `SESSION_SECRET` (32+ characters) in production; development uses a fixed local secret.

**Packages and access** (`lib/academy/plans.ts`, `lib/academy/access.ts`): Explorer (free), Academy Plus (AED 99/mo, 990/yr), Educator & Creator (AED 149/mo, 1,490/yr), Professional (AED 199/mo, 1,990/yr), prices excluding 5% VAT. Every lesson, mission stage, studio save and Claude draft is checked on the server against the account's active entitlement. Registering never unlocks paid content. Checkout records an order; with no payment provider connected, paid orders stay **payment pending** until an Academy Admin confirms payment in **Admin → Academy → Orders & access** (which also grants and revokes packages, audit-logged). The pilot promotion `DIGITALBURJ100` (case-insensitive) gives 100% off an eligible package once per package per account, after explicit confirmation of a zero amount.

**Learner app** (`/academy/learn`): dashboard (package, streak, KPIs, continue learning, 14-day activity chart, pathway, recent activity), My courses, course player (authored lessons for DB-00, DB-02 and PC-AC01; every other unit uses the standard outline and is labelled as such; knowledge checks; 12-stage mission tracker; free first lesson on locked units), Evidence centre (Failure Passport + Capability Record keeping L1–L5 claims separate), Package & billing.

**Creator Studio** (`/academy/learn/studio`): Explainer Video Generator (storyboard, canvas animation in three styles, browser voice-over preview, WebM export via MediaRecorder, script and storyboard export), AnyLessonPlan (five frameworks, timed phases, differentiation, exit ticket; print, Markdown, Word), Course Studio (Udemy-style outline builder with drag-reorder, previews, readiness checklist, landing preview, JSON/CSV), Presentations (eight layouts, four themes, presenter mode, print to PDF, standalone HTML). Drafts come from a built-in template engine; when `ANTHROPIC_API_KEY` is set, Educator & Creator and Professional can also ask Claude (`claude-opus-5`, JSON-schema structured output, server-side refusal fallback) for a first draft.

**Data**: migration `0011_academy_accounts` adds `academy_accounts`, `academy_orders`, `academy_entitlements`, `academy_coupon_redemptions`, `academy_progress`, `academy_activity`, `academy_creations` and `academy_passport`.

**Verified**: `npm run test:academy` (against `npm run deploy:local`) walks 15 steps as a learner and a staff member — registration, paywalls, lesson and stage progress, studio saves, promotion rules, pending order, staff confirmation unlocking access, Failure Passport, sign-out and sign-in.

**Still needs**: a payment gateway (orders are recorded, not charged), password reset by email, reviewer assessment of Academy-account missions (the existing workspace mission review still uses platform identities), and real teaching video.

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Required in production for Academy sign-in (already generated by the Cloudflare deploy workflow). |
| `ANTHROPIC_API_KEY` | Optional. Enables "Draft with Claude" in the Creator Studio. |
