# Workflow: Accessibility

Target: WCAG 2.2 AA plus platform accessibility guidelines. Can be review-only (use
`review.md` finding format) or fix.

Steps: `inspect → automated check → manual check → (fix → validate) → report`

1. **inspect** — Semantics/roles, labels, focus management, color tokens, type scaling, motion.
2. **automated check** — Route the `tech-audit` slot (`impeccable/audit`, native variant on native;
   default-on), then use what exists; do not install without permission.
   Web: axe (`@axe-core/*` in repo, browser extension/tool), Lighthouse, Impeccable's own launcher
   (`<impeccable-skill-dir>/scripts/impeccable detect <url>`) if installed, the bundled
   `scripts/ui-check.mjs`, `vercel/web-design-guidelines`. iOS: Accessibility Inspector audit, XCTest
   `performAccessibilityAudit()` (iOS 17+). Android: Accessibility Scanner, Compose/Espresso
   accessibility checks. Flutter: `meetsGuideline(...)` matchers in widget tests,
   `SemanticsDebugger`. RN: inspector + platform tools above.
3. **manual check** — Automated tools find a minority of issues. Run the checks in
   [../references/accessibility.md](../references/accessibility.md) §3 that the scope touches,
   using that file's platform mapping (§2) for the APIs. Use the WCAG 2.2 AA table (§1) to
   classify each failure.
4. **fix** — Fix in scope, smallest semantic change first (native element before ARIA/semantics
   override). Contrast failures caused by tokens: fix locally by deriving from existing tokens
   and recommend the token change; changing a shared token needs permission
   (`core/conflict-resolution.md`, tokens that fail a floor).
5. **validate** — Re-run automated checks; repeat the manual checks touched; capture at largest text
   size (L4).

## Gate

Floors met for the scope · automated check run where a tool exists (name it) · manual checks
listed with results · unfixable/out-of-scope issues listed with severity · L1 + tool check + L4
large-text capture where rendering is possible.
Screen-reader output, focus order or keyboard paths that no tool run or manual pass actually
verified are limitations: the best status is then `Passed with limitations`, never `Passed`.
