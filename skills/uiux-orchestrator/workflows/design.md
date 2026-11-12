# Workflow: Design (new UI, implementation from a spec, exploration)

Steps: `inspect → foundation → concept → direction → system → components → motion → implement → validate → review → refine → report`

For a new creative surface, use the mandatory role/output contract in
[orchestration.md](../core/orchestration.md). Execute the compatible owners before their
dependent phases. Foundation supplies product/pattern evidence and UX; concept reasoning chooses the experience
approach; one visual driver authors final art direction; the system stage then reconciles the
actual tokens/components with that direction. Full-design stages are
not dropped merely because a driver was selected, a spec seems obvious or the task is Medium.
Implementing a verified supplied design is the explicit exception described below; follow its
fidelity workflow rather than inventing an alternative concept.

| Step | Run when | Skip when | Notes |
|---|---|---|---|
| inspect | always | — | Find where the new UI lives, neighbours, tokens, components to reuse. |
| foundation | every full-design surface | exact supplied foundation/specification verified under a scoped workflow | Run research foundation (UUPM search) → UX analysis (Impeccable shape) → gap filling, per [Foundation ownership](../core/decision-engine.md#foundation-ownership). Distinguish sources from assumptions; UUPM style/palette results stay provisional references. |
| concept | every full-design surface | exact supplied concept verified under a scoped workflow | Execute `design-reasoning` as its own activation: frontend-design bounded mode on web, Impeccable shape elsewhere (separate from its foundation run). Accept alternatives, chosen experience concept and rationale before final art direction. |
| direction | unresolved visual/interaction decisions or full-design creative work | exact supplied direction verified with no unresolved creative judgment | Author the direction contract inside the [design direction record](../core/direction.md) and record it before implementation. Inside an existing system, execute compatible scoped visual expertise; choose a full driver only for eligible original/replacement worlds. Tokens alone do not settle composition or experience decisions. |
| system | every new surface; token/component changes | scoped tasks only, when the existing system fully settles it | Create the system with its owner (driver, Expo design-system or shadcn), then optionally record it with Impeccable document. Finalize tokens, components/states and contrast evidence from foundation constraints and final art direction. Full-design may verify reuse but cannot silently omit the stage. |
| components | every full-design task; unresolved parts on scoped tasks | scoped tasks only, when reuse is already established | Full-design records verified sourcing/reuse. Choose each component and its contract with [component-intelligence.md](../references/component-intelligence.md); order: project component → platform component → installed library specialist (shadcn/Magic UI on React) → platform references → build from the contract. |
| motion | **default** for every new surface: a motion signature plus smooth transitions and feedback per [motion-principles §0](../references/motion-principles.md#0-default-posture-smooth-choreographed-motion) | the user asked for a static result, or truly static content with no state changes (record the reason) | Hand to `animation.md` steps *design* and *build* only. Route `motion-build` (Emil first) and, for choreographed groups, `choreograph`. |
| implement | always (unless plan-only) | — | Apply execution-policy implementation standards. |
| validate | always | — | Gate below. |
| review | every new surface; Medium+ scoped tasks | Small specified component under the fast path | Execute both `ux-critique` and `tech-audit` for full-design, plus `motion-review` when motion shipped. Give reviewers the original brief, handoffs, diff and rendered output. Use separate reviewer contexts when available; declare sequential limitations otherwise. Add platform review when applicable. |
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

**Contemporary direction and depth** — for `direction`, apply
[visual-design.md §6](../references/visual-design.md#6-avoiding-generic-ai-generated-ui).
Choose the focal medium for the subject, available asset quality and original brief. Do not
make 3D the default for tourism, hospitality or other promotional pages, or invent it as a
prerequisite that excludes an otherwise eligible driver. A crafted photograph and spatial
composition can outperform a crude model; requested 3D still needs convincing materials,
lighting and subject fidelity. For requested or chosen depth/3D, load
[spatial-design.md](../references/spatial-design.md) and carry its scene contract through
implementation and review. Static 3D needs no animation step; interactive scenes add the
relevant `animation.md` steps and L3 interaction evidence.

**Distinct steps when composed as a secondary intent:** `foundation` (product/UX evidence), `concept` (new concept decisions),
`direction` (final art direction only for the new surface).

## Gate

Requirements met · primary action and hierarchy evident · all applicable states implemented ·
consistent with handoff decisions and neighbouring screens · platform conventions followed ·
accessibility floors met · evidence L1 + L2 + L4, plus L3 for changed interactions.
For a 3D direction: observed depth matches the direction; responsive framing, fallback and
reduced-motion paths are checked. Added shadows alone do not meet an explicit 3D requirement.
Full-design also requires all role handoffs, actual skill receipts, both review assessments and
a successful execution-record check under [orchestration.md](../core/orchestration.md).
Missing/failed selected skills cannot be presented as completed orchestration.
