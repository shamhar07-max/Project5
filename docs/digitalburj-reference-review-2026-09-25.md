# DigitalBurj interface reference review

Reviewed 25 September 2026. This is a pattern audit, not a component shopping list. No third-party templates, premium assets, or source code were copied into the site.

| Source | Relevant observation | DigitalBurj decision |
| --- | --- | --- |
| [Aceternity templates](https://ui.aceternity.com/templates) | Studio and agency templates combine strong type, restrained project evidence, and contextual sections; its component catalogue offers sticky scroll reveal, magnetic buttons, carousels, and nav patterns. | Keep the existing editorial typography and sticky story; strengthen the work gallery and CTA response. Avoid shaders, meteors, and extra ambient backgrounds. |
| [Magic UI](https://magicui.design/docs/components) | Marquee, animated lists, dock, device mocks, border beams, and text reveals are available. | Use a controlled progress line and horizontal proof gallery. Keep motion tied to a reading or conversion decision. No orbiting icon clouds. |
| [Dribbble Free](https://dribbble.com/search/Free) | Broad visual inspiration with web, mobile, typography, and branding filters; the generic “Free” search is not a vetted component library. | Use as a composition reference only. Do not copy a shot, logo, or unspecified free asset. |
| [ReUI components](https://reui.io/components) | Stepper, carousel, timeline, buttons, and searchable controls are presented for production workflows. | Refine the outcome finder as a visible step sequence and make the partner carousel operable. Avoid dashboard complexity on the public site. |
| [LottieFiles finance search](https://app.lottiefiles.com/search?type=premium-assets&listing_type=assets&query=Finance&asset_type=lottie) | The supplied premium search did not expose inspectable assets; indexed premium search results point to sign-in. | No unlicensed finance animation or third-party player. Use small local CSS/SVG motion with reduced-motion alternatives. |
| [shadcn/ui components](https://ui.shadcn.com/docs/components) | Accessible primitives include tabs, navigation menu, carousel, sheet, command, questionnaire, and field controls. | Preserve semantic buttons, tab keyboard behavior, focus management, and clear form labels in the existing React system. |
| [shadcn/ui blocks](https://ui.shadcn.com/blocks) | The blocks demonstrate composed sidebar, charts, cards, and forms rather than isolated UI ornaments. | Keep shared page rhythm and reusable header, channel, and card structures; do not import a generic dashboard shell into marketing pages. |
| [Origin UI / coss ui](https://originui.com/) | The supplied domain redirects to coss ui, whose Base UI catalogue emphasizes accessible command, drawer, field, and form patterns. | Apply the interaction principles to search, mobile navigation, and the path finder while retaining DigitalBurj styling. |
| [Kokonut UI](https://kokonutui.com/) | Offers particle button, liquid glass card, shimmer text, and prompt interactions. | Retain a subtle CTA shine; reject liquid glass and particles as too playful for this brand. |
| [Preline UI](https://preline.co/) | Component and block system emphasizes theme consistency, responsive layouts, and accessible elements. | Consolidate navy/red/ivory tokens, spacing, control height, and mobile breakpoints. |
| [Preline blocks](https://preline.co/blocks/) | Contact, option picker, onboarding, chat, and workflow blocks are organized as complete flows. | Make Web app, mobile app, and WhatsApp paths distinct and useful at every conversion point. |
| [HyperUI](https://hyperui.dev/) | Clear split between marketing and application components, including CTAs, cards, contact forms, and empty content. | Keep public discovery lighter than the authenticated workspace; prioritize action clarity over ornamental cards. |
| [Float UI](https://floatui.com/) | Responsive, customizable startup patterns with concise action groups. | Use short supporting copy and consistent two-action CTA hierarchy on small screens. |
| [SVGator](https://www.svgator.com/animation-templates/assets) | Animated SVG techniques include path, keyframe, and interactive motion. | Use a local progress trace and logo-safe motion; no animated replacement of the approved wordmark. |
| [Uiverse animation](https://uiverse.io/tags/animation) | Community CSS animations span buttons, cards, toggles, and loaders with varied quality. | Use hover/focus feedback sparingly; avoid novelty loaders and decorative motion that delays content. |
| [Uiverse elements](https://uiverse.io/elements) | Large CSS/Tailwind element gallery with randomized themes. | Take only the principle of tactile control feedback, not styling or code. |
| [Jitter UI elements](https://jitter.video/templates/ui-elements/) | Search reveal, progress ring, glow button, navigation bar, and card motion show short action-led animation. | Keep transitions under a second and let action feedback end in a stable state. |
| [Animate UI](https://animate-ui.com/docs/components) | Accessible animated tabs, dialogs, sheets, and buttons have explicit panel and focus relationships. | Improve channel tabs and the mobile sheet’s keyboard behavior; no new animation package needed. |
| [Animata](https://animata.design/components) | Animated beam, card stack, image reveal, marquee, timeline, and stacked sections can choreograph a narrative. | Use scroll chapter progression and a manually controlled partner gallery. Avoid stacking several effects on one card. |
| [Framer marketplace](https://www.framer.com/marketplace/templates/) | Agency, SaaS, education, and consulting categories reveal strong editorial hierarchy and varying page density. | Vary section scale while keeping one DigitalBurj grid and typography system. Do not duplicate a template. |
| [21st.dev](https://21st.dev/) | Source-oriented animated hero and shimmer button examples are intended for adaptation. | Keep the interaction idea, author code locally, and tune it to DigitalBurj’s content and performance budget. |

## Applied design rules

1. The hero states the business clearly, then lets visitors inspect five connected divisions. A timed highlight supports the story; hover and keyboard focus take control immediately.
2. Each scroll section has one dominant action or visual. Progress and reveal motion explain sequence, not merely decorate the viewport.
3. Project logos are evidence of completed work. The gallery supports arrows, swipe/scroll, pause, and reduced motion while preserving each original mark.
4. Conversion routes remain explicit: Web app for a persistent workspace, Mobile app for on-device access, WhatsApp for a guided first conversation.
5. Reduced motion, coarse pointer devices, keyboard focus, and mobile safe areas are part of the design system.
