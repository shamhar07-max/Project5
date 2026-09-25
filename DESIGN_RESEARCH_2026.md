# DigitalBurj interface research & redesign — 25 September 2026 (pass 4: colour and conversion)

## How this pass was done

- **The reference sites were blocked again.** Every supplied domain (Aceternity, Magic UI, ReUI, Animata, 21st.dev and the rest) returned `EGRESS_BLOCKED` from this environment, both from the shell and the web fetch tool. The patterns below come from the earlier passes' notes and from how these libraries publicly document their components. Nothing was copied; all code is original.
- The aim of this pass: more colour, more technology character and stronger conversion, without turning the page into a collage.

## What changed and where the idea came from

| Pattern (source) | DigitalBurj version | File |
| --- | --- | --- |
| Aurora / lamp backgrounds (Aceternity), meteors (Magic UI) | Four drifting colour fields (red, violet, blue, teal) plus five falling light lines behind the home hero. Inner page heroes get the same light, tinted with their division's own pair. | `lux.css` `.lx-aurora`, `.lx-meteors`; `sections.tsx` `PageHero` |
| 3D card / device mockups (Aceternity, Magic UI "Safari" and "iPhone" mocks, Jitter) | **Hero constellation**: the web workspace, the mobile app and a WhatsApp chat float as layers that respond to the pointer, with live chart bars, a progress ring and typing dots. It shows the three channels in one image. | `_ui/lux/hero-constellation.tsx` |
| Animated gradient text, word rotate (Magic UI, Animata) | "Learn. Build. Transform." with a sheen and a flowing spectrum on *Transform*; a rotator for learners, founders, operations teams and employers | `.lx-word`, `.lx-rotator` |
| Expanding cards / accordion gallery (Animata, Kokonut) | **Division panels**: five coloured panels; one opens at a time with hover, tap, focus or arrow keys. Each has its own motif: Academy rings, a Studio code editor, a Business AI process graph with a leak, a Talent passport with a shine, and a Jobs pipeline. On phones they become an accordion. | `_ui/lux/division-panels.tsx` |
| Bento grid, border beam, spotlight (Magic UI, Aceternity) | **Technology bento**: seven tiles in varied sizes, each with its own colour pair and a unique micro-visual (typing code, neural net, bars, uptime pulse, shield scan, system blocks, API wiring). A beam traces the border on hover. | `_ui/lux/tech-bento.tsx` |
| Stepper, segmented tabs, form fields (ReUI, Origin UI, Preline blocks) | **Launch pad**: pick Web app, Mobile app or WhatsApp → pick a goal → leave a three-field brief. It posts to `/api/leads` with the chosen channel, returns a reference code, then opens WhatsApp, continues to the right workspace intake, or goes to the app install page. | `_ui/lux/launch-pad.tsx` |
| Floating chat / dock (21st.dev, Preline) | **Concierge**: a floating "Talk to us" button on desktop that opens the three channels and passes the current division to WhatsApp as a topic. Hidden in the workspace and admin; phones keep the existing dock. | `_ui/lux/concierge.tsx` |
| Shimmer / gradient borders (Magic UI, Uiverse) | Spectrum hairline under the header, spectrum reading-progress bar, gradient-topped stat tiles, colour-edged outcome cards and footer CTA | `lux.css` |

## No repeated imagery

- The three near-identical dark "card scenes" in the old division bento were removed (`cardAcademy`, `cardStudio`, `cardBusiness`). Each division now has a different visual motif.
- `npm run check:media` still passes: every registered scene is placed exactly once.

## Speed

- No new dependencies. All motion is CSS (transform, opacity) or small inline SVG; the only new JavaScript is three small client components.
- Blur filters and blend modes were kept off the animated layers; looping animations still pause off screen through `[data-offscreen]`, and `content-visibility: auto` skips rendering the lower sections until they are near.
- Measured on the production build (headless Chromium): desktop home transfer 596 KB (was 934 KB), LCP about 0.75 s; mobile LCP 0.38 s with no long frames while scrolling.
- `prefers-reduced-motion` stops every new animation.

---

# Pass 3 (kept for reference)

## How the research was done

- **This pass could not open the reference sites.** The build environment's network policy blocked every supplied domain (Aceternity, Magic UI, ReUI, Kokonut UI, Animata, 21st.dev and the others returned `EGRESS_BLOCKED`).
- The patterns below come from two sources: the site-by-site notes made in the earlier pass (kept in the git history of this file), and the public component catalogues of these libraries as they are generally documented.
- No template, component source code, Lottie file, Dribbble shot or premium asset was copied. Every effect is original CSS/React written in DigitalBurj's own vocabulary.
- To re-verify against the live sites, allow those domains in the environment's network settings and repeat the review.

## Pattern selection by source

| Source | Strongest applicable patterns | What DigitalBurj uses | Where |
| --- | --- | --- | --- |
| Aceternity UI templates | Spotlight cards, 3D tilt cards, sticky-scroll reveal, lamp/aurora backgrounds, text-generate effect | Pointer-follow spotlight + subtle 3D tilt on division/route cards; sticky-scroll story with image swap; drifting aurora behind dark sections | `data-spotlight`, `data-tilt`, `.story`, `.aurora` |
| Magic UI | Border beam, shimmer button, marquee, number ticker, animated beam, orbiting circles, bento grid | Conic "beam" on the hero kicker; shine sweep on every primary CTA; disciplines/principles marquees; counters that animate from real catalogue numbers; beams in the Integrations tile; orbit in the flywheel | `.beam`, `.mag`, `Marquee`, `data-count`, `.v-beam`, `Flywheel` |
| Dribbble (Free) | Dark luxury fintech/SaaS palettes, oversized editorial type, glass device mockups | Ink + ivory canvas, serif italic accents, floating glass product surfaces in the hero | `HeroStack`, type scale |
| ReUI | Stepper, segmented tabs, realistic data tables | 3-step path finder with progress bar; segmented channel switcher; workspace tour | `PathFinder`, `.seg`, `WorkspaceTour` |
| LottieFiles (Finance, premium) | Looping finance/data micro-animations | Not imported (premium licence, and inaccessible). Replaced by CSS micro-visuals: growing bars, neural pulses, scanning shield, stacked systems | `.cap-visual` variants |
| shadcn/ui components | Command menu (⌘K), sheet, tabs, accessible dialogs | Global ⌘K command palette over every destination; full-screen mobile sheet; ARIA tabs | `CommandPalette`, `MobileNav` |
| shadcn/ui blocks | Dashboard shells, sidebar navigation | Browser mock of the real workspace sidebar inside the channel stage and the web-app tour | `ChannelStage`, `WorkspaceTour` |
| Origin UI | Precise inputs, focus rings, segmented controls | Composer inputs with accent-coloured focus rings, chip selectors, honest error states | `WhatsAppComposer` |
| Kokonut UI | Particle/liquid buttons, shimmer text, card stacks | Glass buttons on dark heroes; stacked floating cards. Particles rejected as noise | `.mag-glass`, `.hs-card` |
| Preline UI | Mega-menu dropdowns, responsive navbars | "Connect" dropdown with coloured channel icons | `.nav-drop` |
| Preline blocks | Pricing/model chips, conversion sections | Engagement-model chips per division; channel row on every page | `.models`, `ChannelRow` |
| HyperUI | Plain, high-contrast marketing cards | Readable `gcard` grid with one action per card | `.gcard` |
| Float UI | Simple feature grids, CTA bands | Feature grid on the mobile-app page; final CTA band in the footer | `.feature-grid`, `.footer-cta` |
| SVGator assets | Animated vector illustrations | Original generative SVG art (`GenArt`), deterministic per seed so no two thumbnails match | `app/gen-art.tsx` |
| Uiverse (animation) | Hover lifts, arrow rotations, typing dots | Arrow-orb rotation, card lift, WhatsApp typing indicator | `.orb`, `.wa-typing` |
| Uiverse (elements) | Toggle/range controls, loaders | Human-control risk dial driven by a native range input | `SignatureLab` |
| Jitter UI elements | Animated navigation, progress lines, device mockups | Reading-progress bar, story progress bar, animated phone mockups | `.read-progress`, `AppShowcase` |
| Animate UI | Motion-first component states | Stateful transitions keyed on tab changes (fade-up), reduced-motion hook | `use-reduced-motion.ts` |
| Animata | Bento grids, image reveal, text scrub | Asymmetric division bento; clip-path image reveal in the story; scroll-scrubbed statement text | `.bento`, `.story-img`, `ScrubText` |
| Framer marketplace | Cinematic agency heroes, page-transition curtains | Ken-Burns hero, one-time brand intro curtain, colour wipe between routes | `RouteCurtain` |
| 21st.dev | Magnetic buttons, command bars, animated heroes | Magnetic shine CTA used across the site | `MagneticLink` |

## What was rejected and why

- Particle fields, cursor trails and perpetual neon loops: they compete with the content and hurt mid-range phones.
- Fake logos, testimonials, metrics or "live" portfolio claims: the blueprint requires evidence before claims. Every number on the page is counted from real data (Academy catalogue, stage model, leak classes, risk tiers). Ventures are shown as "Status under review".
- Premium Lottie and marketplace templates: licensing is unclear, and they could not be accessed from this environment.

## Art direction

- **Palette:** brand navy `#10273c` and red `#e10613` lead. Each division has its own two-tone accent: Academy violet→magenta, Studio cobalt→cyan, Business AI emerald→lime, Talent amber→orange, Jobs rose→coral. Champagne gold marks premium details. WhatsApp green appears only on WhatsApp actions.
- **Type:** Manrope (UI and display), Instrument Serif italic (emotional accents), JetBrains Mono (system labels). Fallbacks are defined.
- **Surfaces:** alternating ivory editorial sections and ink "technology" sections with aurora light, grid lines and glass.

## No repeated images

- Every photograph is registered once in `app/brand-data.ts` (`media`) and placed exactly once on the site.
- `npm run check:media` fails the build step if a photo is placed twice, hard-coded outside the registry, missing or empty. (The empty `hero-jobs-generated.webp` in the upload was removed; Jobs now uses the reception photograph.)
- Thumbnails, course cards, service cards and ventures use `GenArt`, which renders original SVG compositions from a unique seed, so they never repeat either.

## Motion & accessibility

- Scroll choreography (`MotionLayer`): staggered reveals, scrubbed text, parallax, counters, sticky-story progress, spotlight and tilt. It is all driven by data attributes and uses one `requestAnimationFrame` loop.
- Route transitions: a three-panel colour wipe, plus a brand intro shown once per session on the home page.
- `prefers-reduced-motion` disables all of it: animations stop, reveals are shown immediately and tilt/magnetism are off.
- Keyboard: ⌘K/Ctrl+K palette with arrow-key navigation; Escape closes the palette and the menu; focus rings are visible; tabs and radios use ARIA roles; the honeypot field is hidden from assistive technology.
