# Workflow: UI improvement (creative refinement, polish, responsive/adaptive tweaks)

First decide whether design judgment is open. Existing tokens and Small scope do not answer that
question. A fully specified local fix uses the fast path; an open-ended polish/improvement uses
the creative branch below, including for one component.

## Creative refinement

Scale the process to the final size from project intelligence. Ambition does not change; the
number of activations does.

| Size | Steps | Specialist activations | Review |
|---|---|---|---|
| **Small** (one component or local region) | `inspect → concept+direction → implement → validate → report` | **One** scoped specialist matching the ask: e.g. Impeccable polish, typeset or layout, frontend-design's bounded adapter on web, or Emil for motion. It weighs 2–3 approaches inline and owns the chosen move. | Self-check against the brief with matching before/after L4. Add a reviewer activation only when the user asks for review, or when the change touches shared components or a critical path. |
| **Medium** (a screen or flow) | `inspect → concept → direction → implement → validate → review → refine → report` | Concept and scoped direction, as separate activations or one specialist that genuinely covers both. `audit-current` is the concept owner's baseline inspection unless the ask is "find problems". | One UX/design reviewer activation; technical/accessibility checks on the touched scope. |
| **Large** | Full table below | Full table below | UX/design reviewer plus technical/accessibility review, with the execution mode from decision-engine §7. |

Full steps (Large; Medium and Small use the subset above):
`inspect → audit-current → concept → direction → implement → validate → review → refine → report`

| Step | Required work |
|---|---|
| inspect | Target, neighbours, current states, product context and binding system tokens; capture the baseline when rendering is available. |
| audit-current | Execute the compatible critique or focused specialist matching the ask. Identify the highest-impact opportunity inside scope. |
| concept | Execute `design-reasoning`; frontend-design's bounded adapter fits compatible web refinement, otherwise use the relevant concept specialist. Develop 2–3 distinct approaches and accept the chosen rationale/benefit. Reuse inspected product/system context as the foundation. |
| direction | Execute the visual/interaction specialist matching the chosen move, e.g. Impeccable tone, typeset, layout or Emil for motion. Record the scope-specific creative brief and fixed tokens. An existing system does not require a full visual driver. |
| implement | Apply accepted decisions in the requested component/surface. Preserve architecture, identity, content and behavior except where the task authorizes changes. Reuse the system; route system/component work if an actual gap emerges. |
| validate | L1 + L2 + observed L4, plus L3 for changed interactions. Compare matching before/after states and check relevant phone/desktop contexts. |
| review | Medium and Large; for Small, see the size table. Add `motion-review` when the change ships or alters motion. Execute a compatible UX/design critique or review specialist against the original brief, baseline and chosen move; perform technical/accessibility checks on the touched scope. Self-check alone does not replace an available reviewer. |
| refine | Resolve findings with the appropriate owner, then recheck the affected evidence and review. |

Apply the [creative-improvement contract](../references/visual-design.md#9-breakthrough-ambition-for-new-work-and-edits).
Keep actual activation receipts and accepted handoffs. This scoped branch does not claim to be a
`full-design` execution and does not fabricate its ten-stage checker record. A findings-based
revision of layout/presentation within the requested component/surface does not need a separate
escalation approval. For genuine expansion of scope, shared-system replacement or unauthorized
behavior changes, resolve authorization before those changes.

## Exact or constrained corrections

When the task specifies the layout/content/values/behavior completely, use
`inspect → targeted fix → validate → report`, with no reviewer activation unless the user asks for one.
Do not invent concept work or broaden a precise correction. Any new design judgment exits the
fast path and uses creative refinement for that unresolved portion.

Responsive/adaptive work follows the same distinction: fix an exact defect directly; when the
phone/tablet composition is delegated, explore and implement a purposeful adaptation rather
than merely shrinking the desktop layout. Use project/platform breakpoints and available
responsive specialists.

**Distinct steps when composed as a secondary intent:** focused audit, plus concept/direction
for unresolved creative choices not already covered by the primary workflow.

## Gate

Targeted issues resolved · creative decisions match the brief and demonstrate a concrete
scope-appropriate improvement over the observed baseline · the concept/visual/reviewer
activations required for this size actually executed · no regressions outside authorized changes · system constraints met ·
evidence L1 + L2 + L4, plus L3 for changed interactions. An exact correction is judged on fidelity
and reliability; no unrelated novelty requirement is added.
