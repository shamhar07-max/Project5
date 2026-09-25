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

## Visual direction and performance (public site)

The public site is an editorial, corporate system (`app/site.css`): warm paper, deep navy ink and brand red used sparingly. Headlines use Source Serif 4 and text uses IBM Plex Sans; both are self-hosted variable fonts (≈97 KB, preloaded, metric-matched fallbacks). There are no gradients on text, no glass effects and no looping animations.

- **Imagery.** The AI-generated photographs are gone. Scenes (`app/_ui/scenes.tsx`) show real product documents on drafting paper, over a line elevation of the Burj. The glyphs (`app/_ui/glyphs.tsx`) are a bespoke line-icon family. Partner logos are shown as supplied, with thumbnails sized for the grid. `npm run check:media` enforces all of this.
- **Motion.** Scroll reveals use native scroll-driven CSS animations, so no JavaScript runs while scrolling. Page changes fade in over 0.3 s. Everything switches off for reduced-motion users.
- **JavaScript diet.**
  - Removed the scroll/parallax/magnetic motion layer, the mobile dock, the auto-rotating hero and phone showcase, the partner carousel and the tabbed tour. They are replaced by server-rendered markup.
  - The search palette loads only on ⌘K or when someone taps Search.
  - Public pages use plain `<img>` instead of `next/image`.
  - The closed mobile menu no longer renders links, so their pages are no longer prefetched.
- **Measured** on the home page (local production build, slow 4G and 4× CPU throttling):
  - main-thread blocking fell from 1,768 ms to 388 ms
  - first paint fell from 2.2 s to 1.6 s, and now includes the fonts
  - DOM nodes fell from 1,659 to 674
  - CSS fell from 55 KB to 35 KB (gzip)
  - background prefetches fell from 13 to 3

Two partner files are low quality as supplied (Rootiva Herbal and The Imam Collective are blurred on black). Replace them with clean logo files when available.

## Own Cloudflare deployment

`npm run deploy:cloudflare` (or the **Deploy to Cloudflare** GitHub Action) deploys to a free Cloudflare account. It creates or reuses D1 and R2, applies migrations remotely, generates a session secret once and deploys. With `DIGITALBURJ_AUTH=google`, identity headers are ignored and people sign in with Google (`/auth/sign-in`, `/auth/callback`, `/auth/sign-out`; PKCE, state check, verified email only). Tested locally:
- Forged identity headers are ignored.
- Tampered or expired sessions redirect to sign-in.
- Sign-out rejects external redirects.
