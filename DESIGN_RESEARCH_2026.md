# DigitalBurj interface research — 25 September 2026

The supplied references were visited individually. The selections below are design observations, not copied components or third-party assets. DigitalBurj's supplied photography, navy/red mark, and its actual service paths define the result.

| Source | Applicable pattern | DigitalBurj decision |
| --- | --- | --- |
| [Aceternity templates](https://ui.aceternity.com/templates) | Agency heroes, image cards, restrained sticky/scroll reveals, magnetic button concept | Use a service-led editorial journey, short scroll reveals and a subtle pointer response on primary CTA. Avoid shaders, glowing effects and generic SaaS sections. |
| [Magic UI](https://magicui.design/) | Small animated accents compatible with the existing component model | Give the CTA a quiet highlight sweep; avoid continuous background effects. |
| [Dribbble Free](https://dribbble.com/search/Free) | Visual exploration across branding, web and typography | Treat as broad composition inspiration only; no shot or artwork copied. |
| [ReUI components](https://reui.io/components) | Practical forms, navigation, filters and product UI | Keep the existing signed-in forms and data flow, increase their clarity through shared focus and button states. |
| [LottieFiles finance search](https://app.lottiefiles.com/search?type=premium-assets&listing_type=assets&query=Finance&asset_type=lottie) | Premium finance animations were inaccessible in the public search result | No premium animation imported or claimed. |
| [shadcn/ui components](https://ui.shadcn.com/docs/components) | Accessible component primitives such as Sheet, Tabs and forms | Reuse the installed primitives where a new control needs them; do not introduce a second UI system. |
| [shadcn/ui blocks](https://ui.shadcn.com/blocks) | Dashboard and sign-in compositions | Preserve the existing authenticated workspace and its real forms rather than turning it into a marketing mockup. |
| [Origin UI](https://originui.com/) | Redirects to a Base UI component catalogue | Use as a reminder to keep interactive semantics and keyboard behavior, not a visual copy. |
| [Kokonut UI](https://kokonutui.com/) | Particle buttons, shimmer text and cards | Use one subtle CTA sheen; reject particles and liquid glass as distracting for this brand. |
| [Preline UI](https://preline.co/) | Responsive blocks and component guidance | Keep mobile layouts content-first and tappable. |
| [Preline blocks](https://preline.co/blocks/) | Marketing and application form patterns | Provide a clear next step on each service route and a concise path chooser. |
| [HyperUI](https://hyperui.dev/) | Marketing and application component categories | Favor readable content and high-contrast calls to action. |
| [Float UI](https://floatui.com/) | Responsive, easily adapted sections | Use simple grid behavior and preserve readable order at narrow widths. |
| [SVGator assets](https://www.svgator.com/animation-templates/assets) | Animated vector asset examples | No external vector animation is needed; brand photography and typography carry the story. |
| [Uiverse animation](https://uiverse.io/tags/animation) | Short hover and focus transitions | Use lift, border and underline feedback with reduced-motion support. |
| [Uiverse elements](https://uiverse.io/elements) | Buttons/cards/input patterns | Avoid decorative controls that lack a useful action. |
| [Jitter UI elements](https://jitter.video/templates/ui-elements/) | Animated navigation, arrows and progress | Use short, stateful transitions; avoid looping UI decoration. |
| [Animate UI](https://animate-ui.com/) | Public result exposes only the site title | No specific component assumed or copied. |
| [Animata components](https://animata.design/components) | Backgrounds, bento grids and buttons | Use asymmetrical image cards and limited motion rather than an effect-heavy background. |
| [Framer marketplace](https://www.framer.com/marketplace/templates/) | Category-led discovery for agency, education and software | Let visitors choose a goal first; no template copied. |
| [21st.dev](https://21st.dev/) | Animated heroes, buttons, cards and navigation catalogues | Bring only context-fitting interactions into the existing codebase. |

## Implemented direction

- Editorial photography, oversized type, four clear service paths and a compact conversion path.
- Scroll entry choreography and CTA motion that stop under reduced-motion preferences.
- Mobile navigation and a mobile-first path chooser.
- Existing signed-in Academy, Studio and Business AI flows remain the source of truth.

## Integration boundary

- A native mobile app is not supplied. The current web app is responsive; native packaging would be a separate build.
- WhatsApp is not linked until DigitalBurj provides an official business number and approves the destination and message.
- External component packages and premium assets have not been copied into the project.

## September 25 refinement: technology-led art direction

Each reference above was revisited individually for this pass. The components below are reinterpreted in project code; no template, stock shot, premium Lottie, or copied creator artwork was imported.

| Reference | Strongest relevant pattern reviewed | Actual decision |
| --- | --- | --- |
| Aceternity templates | Studio and AI SaaS compositions; spotlight cards, magnetic buttons, sticky reveals | Three equal core-service cards, restrained hover border, clear story order. Existing magnetic CTA retained. |
| Magic UI | Border Beam, Animated Beam, Shimmer Button, Bento Grid | A quiet optical card edge, flow lines in the product channel display, and CTA sheen; no perpetual neon animation. |
| Dribbble Free | Broad web/brand/product inspiration gallery | Use composition and color contrast as inspiration only, no art copied. |
| ReUI | Realistic product components, especially steps, tabs, data views | Channel switcher with semantic tabs and real destinations; structured service steps. |
| LottieFiles finance search | The supplied premium-assets URL was inaccessible through public retrieval | No finance asset embedded and no license assumption. |
| shadcn components | Tabs, cards, navigation and form semantics | Existing site primitives and native semantic controls retained; no second component dependency. |
| shadcn blocks | Dashboard cards and sidebars | Preserve the actual signed-in workspace, not a fictional metrics dashboard. |
| Origin UI → coss/ui | Base UI cards, drawers, accessible form controls | Keep meaningful focus and keyboard states; no visual clone. |
| Kokonut UI | Liquid-glass card, particle button, shimmer text | Use glass only for a few controls; avoid particles that obscure DigitalBurj's purpose. |
| Preline UI | Responsive components and coherent theming | Unified shell and mobile grid behavior. |
| Preline blocks | Concise product and conversion sections | Put three actual channel paths on one discovery surface. |
| HyperUI | Readable responsive marketing cards | Prioritize service text and a single route per card. |
| Float UI | Simple adaptable landing grids | Aligned three-column system with one-column mobile order. |
| SVGator assets | Interaction-triggered animated vectors | Keep animation authored in CSS and React, no external asset payload. |
| Uiverse animation | Hover borders and concise CSS interactions | Hover glow on service cards with reduced-motion fallback. |
| Uiverse elements | Buttons, cards, loaders and patterns | Use polished action states only; no decorative loader. |
| Jitter UI elements | Frosted navigation, progress line, animated arrows | Existing carousel, timed story progress and mobile navigation refined. |
| Animate UI | Public landing returned minimal content; button documentation surfaced by search | Translate short, state-driven button motion only; no unsupported claims about its full catalog. |
| Animata | Gradient bento, case-study cards, animated timelines, image reveal | Three distinct optical card illustrations; image reveal and staggered scroll entry. |
| Framer marketplace | Software, AI, agency and education categories | Editorial story segmented around real DigitalBurj divisions. |
| 21st.dev | Animated hero, gradients, buttons, cards and navigation | Layered hero and selective color accents rather than a collage of effects. |

### Implementation choices

- **Brand:** navy and red remain primary; cobalt, teal and warm amber indicate distinct technical disciplines.
- **Imagery:** three new original abstract software pieces in the core cards. The story carousel uses separate human photography, and the hero retains its cinematic sequence. Images are not repeated within the same card row.
- **Motion:** image easing, timed carousel, scroll reveal, reading progress and focused hover response. Reduced-motion preferences suppress animated transitions.
- **Conversion:** Web app opens the real workspace. Mobile means the same responsive web workspace, not an unbuilt native app. WhatsApp checks the configured business number and falls back to structured enquiries when unavailable.
- **Accuracy:** no fabricated customers, outcomes, revenue KPIs, portfolio projects, or product screens.
