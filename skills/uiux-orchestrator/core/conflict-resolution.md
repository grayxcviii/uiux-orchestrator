# Conflict resolution

Use when two sources (skills, references, the project, the user) recommend different things.
Resolve **per dimension** — color, typography, layout, spacing, components, motion, copy,
navigation, accessibility, tooling — never "skill A wins everything".

## Procedure

1. **Name the conflict** in one line: dimension, option A (source), option B (source).
2. **Check what each recommendation is for.** Many apparent conflicts are different goals: a
   palette from data (UUPM) answers "what fits this product category"; a visual direction
   (Impeccable/Taste) answers "what makes this surface distinct". Both can be partly right.
3. **Apply the precedence ladder** (first rung that decides wins):

| Rung | Source | Example |
|---|---|---|
| 1 | The user's explicit instruction in this task | "Use our brand purple" beats any skill's palette preference — and if a skill's rule forbids it outright (Taste: never violet), that skill is the wrong driver. |
| 2 | Non-negotiable floors: WCAG 2.2 AA contrast, target size ≥ 24×24 CSS px (web) / Android 48×48dp / iOS HIG minimum 28×28pt with 44×44pt as the default for touch-first controls, visible focus, reduced-motion support, no data loss | A skill's light-gray caption that fails contrast loses. The user may override only after being told the consequence. |
| 3 | Project truth for in-scope refinement: tokens, components, libraries, architecture, brand | Existing MUI `Dialog` beats adding a shadcn dialog; installed framer-motion beats GSAP. |
| 4 | Platform conventions | iOS back-swipe and large titles, Android predictive back and M3 components beat web patterns ported to mobile. |
| 5 | Decisions already recorded in this task's handoff | Review does not re-pick the palette the direction stage chose. |
| 6 | Domain authority (registry `authority` for that dimension) | Motion timing: Emil > GSAP preset > UUPM rule. Marketing visual direction: the chosen driver. |
| 7 | Everything else | Drop it, or list it as an option in the report. |

4. **Choose one** option. Do not average ("a bit of both") unless the two are genuinely
   orthogonal (e.g. Taste's layout + project's existing color tokens).
5. **Record** important decisions in the handoff as `decision / alternative / why`. Skip recording
   trivial ones.

## Standing rulings for known overlaps

| Overlap | Ruling |
|---|---|
| Concept adapter plus a visual driver | A registered `specialist_slots` mode may supply concept reasoning only. frontend-design in `design-reasoning` mode does not become a second driver or own the final palette/layout. Its exploratory tokens are reconciled by the art-direction and system owners. |
| Two drivers for one surface | Only one; choose with the driver table in `core/decision-engine.md` §4. UUPM may still answer a narrow sub-question the driver leaves open (chart type, RTL, a font pairing) — never override the driver's palette or style. |
| Emil `animate` tool ladder vs. GSAP "recommend GSAP" | The tool decision in `workflows/animation.md` is canonical; GSAP's self-recommendation is ignored. |
| `animate-expo` (Reanimated 4) vs. project on Reanimated 3 / old architecture | Project truth: keep Reanimated 3; use animate-expo's decisions; translate APIs. Upgrading is a separate, permissioned task. |
| `expo/ui` "use @expo/ui instead of Reanimated/gorhom" vs. installed `@gorhom/bottom-sheet` | Project truth: keep the installed library unless the user asks to migrate. |
| Impeccable `animate` vs. Emil `animate` | Emil when motion is the task; Impeccable only inside an Impeccable-driven build. |
| Impeccable critique vs. Vercel guidelines | Not a conflict: separate slots (`ux-critique`, `tech-audit`). Merge findings, dedupe by location. |
| Skill house rules (Taste "one section per screen", Impeccable craft-floor bans) vs. project | House rules apply only to surfaces that skill drives. If they would force changes to project truth, that skill is the wrong driver for this project. |
| Project styling that customized an old system component look vs. a new OS design (e.g. opaque tab bar fills vs. iOS 26+ Liquid Glass) | Not brand truth: it was a customization of the previous system look. Keep the brand (colors via tint and accents), adopt the new system behavior on the new OS, and gate the old customization by OS availability. Ask only if the user explicitly wants the old look. |
| A workflow rule vs. a skill's recipe for the same thing (e.g. CSS `grid-template-rows` accordion vs. a JS height-measuring recipe) | The workflow rule wins when it is cheaper and meets the same quality; the skill's recipe stays an option. |
| A skill's fidelity rule (e.g. "keep the component's API and internals intact") vs. layout fit, responsiveness or accessibility | Rungs 2–4 win: adapt the minimum needed (e.g. fluid widths), keep the rest as-is, and record the deviation. |
| Project tokens that fail a floor (e.g. danger text on dark < 4.5:1) | Floors win in scope: fix locally by deriving from tokens (e.g. `color-mix` of existing tokens), not raw new hex; recommend the token fix to the user (shared → ask). |
| Web guidance applied to native (hover states, 100vh, CSS easing names) | Translate the principle, not the API. Platform conventions win. |
| Reviewer wants to change visual direction | Only with a concrete defect (rung 1–4 violated). Taste preferences alone do not reopen a recorded decision. |
| Reviewer or anti-generic specialist wants to flatten value contrast, shrink type scale or remove the recorded decisive move | Only for a concrete rung 1–4 defect; then fix the defect while keeping the move (e.g. adjust lightness for contrast, keep the scale and composition). "Too much", "simplify" or house restraint alone does not dilute an accepted bold direction. Stacked restraint from several specialists is the main way output drifts back to safe defaults. |
| The direction is internally consistent but misses the user's visual intent | Rung 1 wins: compare the render to the requested color intensity, typography, composition and asset quality. A demonstrated brief mismatch reopens direction within scope; fidelity to the wrong direction does not make it acceptable. |
| Anti-generic guidance or the monochrome default vs. saturated color, gradients or glass | Requested by the user or required by the brand: rung 1/3 wins, including over this skill's [AI-generated color signatures](../references/visual-design.md#ai-generated-color-signatures-avoid) list; judge placement, hierarchy and contrast, and select another driver if its hard rules conflict. Unrequested: the premium monochrome default and the signatures list apply. |

## Escalate to the user when

- Rungs 1–4 conflict with each other (e.g. brand color fails AA on the required background).
- The only compliant option needs a dependency, a design-system change, or broader scope.

Present: the conflict in one line, the recommended option, the consequence of each option.
