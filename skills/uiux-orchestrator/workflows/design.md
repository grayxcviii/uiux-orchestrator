# Workflow: Design (new UI, implementation from a spec, exploration)

Steps: `inspect → ux → direction → system → components → motion → implement → validate → review → refine → report`

| Step | Run when | Skip when | Notes |
|---|---|---|---|
| inspect | always | — | Find where the new UI lives, neighbours, tokens, components to reuse. |
| ux | new screen/flow with real decisions | spec or mock given; tiny component | Define primary action, hierarchy, all states. |
| direction | no design system, or a new kind of surface (marketing page in an app-only system) | project has tokens + components that fit the surface | Driver chosen here (decision-engine §4). Inside an existing system "direction" is just: which existing patterns apply. |
| system | new tokens/components needed | everything exists | New tokens extend the system; never fork it. |
| components | a needed part does not exist | project/platform already has it | Order: project component → platform/UI-library component → component-reference skill → build. |
| motion | motion is requested or clearly serves feedback/continuity | static content, Operate screens with no state transitions | Hand to `animation.md` steps *design* and *build* only. |
| implement | always (unless plan-only) | — | Apply execution-policy implementation standards. |
| validate | always | — | Gate below. |
| review | Medium+ | Small | `tech-audit` by default; add `ux-critique` when design quality is the main risk or the task is Large; add `platform-conformance` for new native or React Native/Flutter screens on Large tasks. Large/high-risk: independent reviewer (decision-engine §7). |
| refine | review found issues | none found | Route `polish` only for polish-level findings; then re-validate the touched parts. |

**Small specified component** — when the SKILL.md fast-path conditions hold, use only
`inspect → implement → validate → report`. Reuse the existing primitives and tokens, implement
specified states, and check the component in its actual container. Do not run discovery,
direction, specialist selection or an independent review. Evidence: L1 + L2 + L4, and L3 for
interactive behavior. If a requirement needs a design choice or affects a critical path, use the
normal steps above. This shortcut does not apply to an entire screen or a multi-component flow.

**Implementing a given design** (Figma, screenshot, spec): start at `inspect`, then `components`
→ `implement`. Treat the design as the direction record; deviations (missing states, platform
conflicts, contrast failures) are recorded and reported, not silently "fixed" into a new design.

**Design exploration**: produce 2–3 genuinely different directions as short direction records
(and, if the user wants to see them, quick prototypes behind a switch or separate routes). Do
not implement fully until one is chosen (delivering the directions with evidence is the expected
output: `Passed` when they meet the gate). `emil/prototype` and `impeccable/live` are options;
`emil/prototype` is user-invoked.

**Distinct steps when composed as a secondary intent:** `ux` (states), `direction` (only for
the new surface).

## Gate

Requirements met · primary action and hierarchy evident · all applicable states implemented ·
consistent with handoff decisions and neighbouring screens · platform conventions followed ·
accessibility floors met · evidence L1 + L2 + L4, plus L3 for changed interactions.
