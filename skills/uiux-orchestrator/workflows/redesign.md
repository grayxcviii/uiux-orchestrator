# Workflow: Redesign

First confirm the sub-type from intake: **Refresh** (inside the current system — default) or
**Replace** (new visual direction, confirmed).

Steps: `inspect → audit-current → foundation → concept → direction → system → components → motion → implement → validate → review → refine → report`

Replace uses the [full-design orchestration contract](../core/orchestration.md) after the
current-state audit: foundation, concept, art-direction and final system handoffs precede UI implementation; both final
review capabilities execute. Refresh routes and executes the owners of its unresolved scoped
decisions, recording exact system reuse instead of triggering an unrelated new visual world.
Refresh applies the
[creative-improvement contract](../references/visual-design.md#9-breakthrough-ambition-for-new-work-and-edits)
within the existing brand/tokens (concept, direction and before/after rows below).

| Step | Refresh | Replace |
|---|---|---|
| inspect | Target + neighbours + shared components it uses. | Whole surface family in scope. |
| audit-current | **Always.** Capture the current UI (L4 if possible) and list UX + visual problems with locations. This is the redesign's evidence base. | Same; also record what the product must keep (content, functions, native affordances). |
| foundation | Reuse inspected product/system truth; investigate only audit gaps. | Full research/product/UX foundation; initial style recommendations remain provisional. |
| concept | 2–3 distinct approaches within the system, chosen rationale and intended user/product benefit: inline in the scoped direction specialist at Small/Medium size; execute `design-reasoning` for Large scope. | Distinct concept alternatives and chosen experience brief before art direction; use a bounded specialist instead of a second full driver. |
| direction | Execute the scoped visual/interaction specialist to realize the creative move within system constraints. No full driver unless identity replacement is authorized. | Driver chosen (one). Large scope needs direction confirmation only when that decision has not already been authorized/delegated; retain approval for genuinely unauthorized high-risk actions. |
| system | Only additive tokens/variants, justified by a finding. | Token changes listed old → new; usages outside scope assessed. |
| components | Reuse; extend variants; new only when nothing fits. | Same order of preference. |
| motion | Default: audit existing motion with the motion checklist (`emil/improve-animations` for several flows or app-wide scope; `emil/find-animation-opportunities` when motion is missing), then make every changed state, layer and navigation step move smoothly. Skip only when the user asks for static UI. | Motion signature, choreography and tokens are part of the direction record ([motion-principles §0](../references/motion-principles.md#0-default-posture-smooth-choreographed-motion)). |
| implement | Progressive: one region/section at a time, keep the screen working between steps. | Same; feature-flag or route-level switch when the product is live and the user wants it. |
| validate | Before/after captures at the same sizes/states. | Same, plus untouched screens that share changed components. |
| review | Execute a compatible UX/design reviewer for the creative improvement and technical checks for touched scope. Compare brief, baseline, alternatives and result. Built-in review requires evidenced unavailability. | Both UX/design and technical/accessibility assessments, with independent contexts or disclosed sequential limits (orchestration contract). |
| refine / report | Execute the appropriate specialist for findings; use `polish` for polish-level issues. Built-in fixes require the same fallback checks. Report findings resolved/deferred and recheck evidence. | Same, plus direction rationale and execution-record result. |

Rules:
- At `direction`, record the [direction contract](../references/visual-design.md#direction-contract-before-implementation)
  inside the [design direction record](../core/direction.md) (Refresh: brand mode) before implementation, including the requested visual qualities and concrete ways to achieve
  them. Check the first representative render against the brief before extending the treatment.
- For modernization/3D requests, audit composition, typography, depth and materials alongside
  usability. Apply [visual-design.md §6](../references/visual-design.md#6-avoiding-generic-ai-generated-ui)
  and, for requested or chosen depth/3D, [spatial-design.md](../references/spatial-design.md).
  Carry the treatment into the direction and compare before/after at matching sizes. Refresh
  still respects existing tokens; identify requested effects needing a broader change.
- Do not redesign what is not in scope, even if it looks dated. List it as a suggestion.
- Map wording: user "redesign … consistent with the existing app" = Refresh. In Impeccable's
  vocabulary this is *refinement*; never invoke its replacement path (`new-work` replacing
  DESIGN.md) for a Refresh.
- Behavior changes (navigation, flows, data) need permission even inside a redesign.

**Distinct steps when composed as a secondary intent:** `audit-current`.

## Gate

Design gate · every audit finding in scope resolved or explicitly deferred · nothing outside scope
changed · consistent with untouched screens · evidence L2 + L4 before/after.
For Refresh as well as Replace, reviewers must identify the distinctive move and its observed
benefit. A merely safe/templated result does not meet an open-ended breakthrough brief.
