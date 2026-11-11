# Platform: Web

Covers React, Next.js, Vue/Nuxt, Angular, Svelte/SvelteKit, Astro and plain HTML/CSS/JS.
Cross-platform principles: `references/visual-design.md`, `references/motion-principles.md`,
`references/accessibility.md`. Read only the sections the task touches.

Last checked: 2026-11-06. Version facts are in §0. Re-check them when the project's versions differ.

## 0. Version gates (check before using)

| Feature | Status 2026-11-06 | Use |
|---|---|---|
| `@starting-style` | Baseline (Aug 2024) | Entry animations without JS |
| View Transitions, same-document | Baseline (Oct 2025) | State/route transitions in SPAs |
| View Transitions, cross-document (`@view-transition`) | Limited: Chrome 126+, Safari 18.2+, no Firefox | Progressive enhancement only |
| Scroll-driven animations (`animation-timeline`) | Baseline (Oct 2026, very recent) | Keep a no-animation fallback (`@supports`) |
| Container size queries | Baseline, widely available | Component-level responsiveness |
| Container style queries | Baseline (May 2026), custom properties only | Theme/variant switches |
| `:has()` | Baseline, widely available | Parent/state styling |
| `oklch()`, `color-mix()`, `color(display-p3 …)`, `@media (color-gamut: p3)` | Baseline, widely available | Perceptual palettes, derived tints, wide-gamut accents |
| Gradient interpolation (`linear-gradient(in oklch, …)`) | Baseline (2024) | Vivid gradients without gray midpoints |
| Relative color syntax (`oklch(from var(--brand) l c h / .4)`) | Baseline (2024) | Derive states/tints from one token; keep a static fallback for older browsers if the project supports them |
| `dvh` / `svh` / `lvh` | Baseline, widely available | Mobile viewport heights instead of `100vh` |
| Popover API | Baseline (Jan 2025) | Menus, tooltips, light-dismiss layers |
| `linear()` easing | Baseline, widely available | Spring-like CSS easing |
| Anchor positioning | Core works in all engines; rated Limited | Progressive enhancement; keep a JS positioning fallback in production |
| `interpolate-size` / `calc-size()` | Chromium only | Enhancement only (`height: auto` animation) |
| `prefers-reduced-transparency` | Chromium only | Enhancement only |
| React | 19.x (19.3, Sep 2026); `<ViewTransition>` stable in 19.3 | `import { ViewTransition } from 'react'` |
| Next.js | 16.x | App Router conventions |
| Motion (formerly Framer Motion) | package `motion`, `import { motion } from "motion/react"` | Older projects import from `framer-motion`; keep what is installed |
| Tailwind CSS | v4.x; tokens in `@theme { --color-*: … }` | v3 projects use `tailwind.config.*`; don't migrate unasked |

## 1. Principles

- The web is responsive by default. Design from the content and the smallest supported width up.
- Use semantic HTML first. Native elements (`button`, `a`, `input`, `dialog`, `details`, `select`)
  bring keyboard, focus and screen-reader behavior for free.
- Support every input: mouse, touch, keyboard, pen. Hover is an enhancement, never the only path.
- Progressive enhancement. New CSS/JS features need a usable fallback (`@supports`, feature
  detection).
- Performance is UX. Core Web Vitals thresholds at the 75th percentile: **LCP ≤ 2.5 s, INP ≤ 200 ms,
  CLS ≤ 0.1** (INP replaced FID in 2024).

## 2. Layout, spacing, responsive

- Use the project's breakpoints. If there are none: ~640 / 768 / 1024 / 1280 px (Tailwind's
  defaults) is a reasonable set. Check at 390 (phone), 768 (tablet), 1280+ (desktop), and 320 for
  reflow (WCAG 1.4.10).
- Use container queries for components that appear in different widths (cards in sidebars vs. main).
- Use fluid type and spacing with `clamp()` only when the project already uses it or a marketing
  surface needs it. App UI usually uses fixed steps.
- Viewport height: use `svh`/`dvh`, never `100vh`, for full-height mobile layouts. Use
  `env(safe-area-inset-*)` with `viewport-fit=cover` for notched devices.
- Avoid fixed heights on text containers. Text must survive 200% zoom and WCAG text-spacing
  overrides.
- Make sticky headers and footers small, so focused elements are not hidden (WCAG 2.4.11).
  Use `scroll-padding-top` to compensate.
- Reserve space for images and embeds (`width`/`height` or `aspect-ratio`) to avoid CLS.

## 3. Typography

- Use `rem` for font sizes so user settings apply; never `px` on `html`.
- Body text ≥ 16px on mobile. Inputs ≥ 16px, or iOS Safari zooms on focus.
- Load fonts with `font-display: swap`/`optional` and preload only the critical face. In Next.js use
  `next/font` (self-hosted, no layout shift).
- Use `text-wrap: balance` for headings and `pretty` for paragraphs where supported.
- Use `font-variant-numeric: tabular-nums` for changing numbers and table columns.

## 4. Color and theming

- Put tokens in CSS custom properties (or Tailwind `@theme` / config). Components use semantic
  tokens, never raw hex.
- For new palettes, author tokens in OKLCH (method in `references/visual-design.md` §4: premium
  monochrome by default, no AI-generated color signatures). Tailwind v4's default palette is
  already OKLCH, but its `indigo`/`violet`/`purple` defaults are exactly the generated look to avoid.
  Example (cool graphite, one signal accent):

  ```css
  :root {
    --base:      oklch(0.14 0.005 250);   /* deep base, not #000 */
    --raised:    oklch(0.19 0.005 250);
    --line:      oklch(0.28 0.006 250);   /* hairlines */
    --text-2:    oklch(0.74 0.006 250);   /* secondary text, >= 4.5:1 on --base */
    --text:      oklch(0.97 0.003 250);   /* off-white, not #fff */
    --accent:    oklch(0.56 0.19 28);     /* signal red: primary action / live state only;
                                             --text on it = 4.7:1, it on --base = 3.9:1 (UI only) */
  }
  .hero { background: radial-gradient(60% 50% at 70% 40% in oklch, var(--raised), var(--base)); }
  ```

  The gradient is light falloff in one hue, not a color effect. Prevent banding on large
  gradients with a low-opacity noise layer.
- Dark mode follows the project's mechanism: `prefers-color-scheme`, `.dark` class, or
  `data-theme`. Set `color-scheme` so form controls and scrollbars match.
- Support `forced-colors: active` (Windows High Contrast): don't remove outlines; use `CanvasText`
  and similar system colors for essential borders.

## 5. Components and conventions

- Prefer the project's UI library (shadcn/ui, Radix, MUI, Ant Design, Headless UI, Vuetify, Angular
  Material…) over hand-built widgets. Hand-rolled dropdowns, comboboxes, dialogs and date pickers
  are the most common accessibility failures.
- Dialogs: native `<dialog>` with `showModal()` or the library's dialog. Focus moves in, is
  trapped, and returns to the trigger on close. Esc closes.
- Menus, tooltips, light-dismiss layers: Popover API or the library's primitives.
- Links navigate (`<a href>`); buttons act (`<button type="button">`). Never use a `div onClick`.
- Forms: visible `<label>`, correct `type`/`inputmode`/`autocomplete`, errors next to the field and
  linked with `aria-describedby`, an error summary on submit for long forms, no placeholder-only
  labels, paste allowed in password fields (WCAG 3.3.8).
- Loading: skeletons that match the final layout; `aria-busy` on regions that are updating.
  Toasts for transient status must be announced (`role="status"`) and must not be the only place
  an error appears.

## 6. Navigation

- URLs are state. Every meaningful view is linkable; back/forward work; filters and tabs that
  users share go in the query string.
- Visible current location (active nav item, breadcrumbs for deep hierarchies).
- After client-side route changes, move focus to the main heading (or announce the change) and
  restore scroll correctly.
- Mobile web: a bottom bar is fine for app-like PWAs. Otherwise use a menu button with a full-screen
  or drawer menu. Avoid hover-only mega menus.

## 7. Interaction and input

- Hover styles only under `@media (hover: hover) and (pointer: fine)`, so taps don't leave sticky
  hover.
- Visible `:focus-visible` style on every interactive element (2px+ outline with sufficient
  contrast).
- Touch: targets ≥ 24×24 CSS px (WCAG 2.5.8), 44×44 recommended on touch layouts. Add
  `touch-action` where you implement custom gestures. Set `-webkit-tap-highlight-color` deliberately.
- Every drag interaction has a click/tap alternative (WCAG 2.5.7).
- Keyboard shortcuts don't hijack browser or assistive-tech shortcuts and are discoverable.

## 8. Accessibility specifics

- Semantics first. ARIA follows the APG patterns (https://www.w3.org/WAI/ARIA/apg/) when building
  a composite widget.
- One `h1` per page and logical heading levels; landmarks (`header`, `nav`, `main`, `footer`); a
  skip link on content sites.
- Images: meaningful `alt`, or `alt=""` for decorative ones. Icon-only buttons need an accessible
  name.
- Announce async results with `aria-live="polite"` or `role="status"`.
- Test with axe/Lighthouse plus keyboard-only and a screen reader (VoiceOver or NVDA).

## 9. Animation

Follow the tool decision in `workflows/animation.md`.

- **CSS transitions** for state changes. **`@starting-style`** for entry. **CSS animations** for
  predetermined loops (they run off the main thread).
- **WAAPI** (`element.animate()`) for programmatic control without a library.
- **Motion** (`motion/react`, or `framer-motion` in older projects) for springs, layout animations,
  exit animations (`AnimatePresence`) and gesture-driven values. Scroll-linked effects:
  `useScroll` + `useTransform`.
- **View Transitions** for route and state swaps and shared elements. In React 19.3+ use
  `<ViewTransition>`. Cross-document transitions are enhancement only.
- **Scroll-driven CSS** (`animation-timeline: view()`) with an `@supports` fallback.
- **GSAP** for long timelines, pin/scrub choreography, SVG morph and SplitText. Only when installed or
  approved.
- Reduced motion: `@media (prefers-reduced-motion: reduce)`; Motion's `useReducedMotion`;
  `gsap.matchMedia()`.
- Smooth defaults: put motion tokens in custom properties and reuse them, e.g.

  ```css
  :root {
    --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
    --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --dur-micro: 160ms; --dur: 280ms; --dur-expressive: 800ms;
  }
  .reveal-line { overflow: clip; }
  .reveal-line > span { display: block;
    transition: transform var(--dur-expressive) var(--ease-out-expo); }
  /* hidden only when script runs (<html class="js">), so content never depends on JS */
  .js .reveal-line > span { transform: translateY(105%); }
  .js .is-in .reveal-line > span { transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .js .reveal-line > span { transform: none; transition: none; }
  }
  ```

  Add `.is-in` from script (IntersectionObserver), stagger lines with `transition-delay` in
  30–60 ms steps, and keep the first view's entrance under ~1.2 s in total. Use View Transitions for route/state swaps so persistent
  elements morph. Keep native scroll; no wheel/touch hijacking.
- Animate `transform`/`opacity`. Avoid animating `width`/`height`/`top`/`left`/`box-shadow` blur on
  large areas. `will-change` only on elements about to animate, removed after.

## 10. Performance

For requested/chosen 3D, use [spatial-design.md](../references/spatial-design.md) for the CSS vs.
rendered asset vs. Three.js decision, client/SSR boundaries, resource lifecycle and validation.
Check installed renderer/framework compatibility before adding scene integration APIs.

- LCP: preload the hero image (`fetchpriority="high"`), avoid client-only rendering of above-the-fold
  content, inline critical CSS where the framework supports it.
- INP:
  - keep handlers short;
  - split long tasks;
  - use `startTransition` / `useDeferredValue` (React) for non-urgent updates;
  - avoid layout thrashing (read, then write);
  - virtualize long lists.
- CLS: dimensions on media, font metric overrides (`next/font` does this), no content injected
  above existing content.
- Bundle: code-split routes and heavy widgets, lazy-load below-the-fold media, tree-shake icon sets.

## 11. Validation

Run the dev server with the project's command. Capture screenshots at 390 / 768 / 1280 with the
project's own tooling first (screenshot scripts, Playwright/Storybook setups), otherwise the
orchestrator's bundled `scripts/ui-check.mjs` (screenshots + mechanical checks, zero install) or the
agent's browser tool. Motion: `scripts/motion-trace.mjs` for per-frame evidence.

Also check:
- light and dark;
- `prefers-reduced-motion` emulation;
- keyboard tab-through;
- 200% zoom.

Use existing Playwright/Cypress/Storybook setups when present. Impeccable's launcher (`<impeccable-skill-dir>/scripts/impeccable detect <url>`) is
available if Impeccable is installed. Lighthouse and axe help where available.

## 12. Common mistakes

- `div`/`span` buttons, missing `type="button"`, links without `href`.
- Outline removed (`outline: none`) with no replacement focus style.
- `100vh` on mobile; content hidden under the iOS Safari toolbar.
- Hover-only affordances (actions visible only on hover) on touch devices.
- Placeholder used as the label; error shown only as a red border.
- Layout shift from late-loading fonts, images or banners.
- Animating layout properties; one easing/duration for everything; no reduced-motion path.
- Modals that don't trap or return focus; Esc not closing.
- Hardcoded colors bypassing tokens; dark mode with unreadable form controls (missing `color-scheme`).
- Using a 2026 CSS feature without a fallback for the project's supported browsers.

## Sources

- WCAG 2.2: https://www.w3.org/TR/WCAG22/ · ARIA APG: https://www.w3.org/WAI/ARIA/apg/
- Baseline status: https://webstatus.dev · MDN: https://developer.mozilla.org
- Core Web Vitals: https://web.dev/articles/vitals
- React versions: https://react.dev/versions · ViewTransition: https://react.dev/reference/react/ViewTransition
- Next.js: https://nextjs.org/blog · Motion: https://motion.dev/docs/react · Tailwind: https://tailwindcss.com/docs/theme
