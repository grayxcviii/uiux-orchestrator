# Orchestration contract — select, execute, hand off, review

This contract governs skill execution. The decision engine chooses the owner; the workflow
sets scope and evidence; this file determines when a stage actually counts as done.

## 1. Required roles and outputs

For a new surface or Redesign/Replace, use the `full-design` profile. Keep all the following
stages, in order. Reuse can satisfy a stage only after its source has been inspected and accepted.

| Stage | Required capability | Owner candidates (route by platform and registry) | Accepted output |
|---|---|---|---|
| `inspect` | Project intelligence | Orchestrator, actual source/tool inspection | Platform, commands, constraints, skill inventory, asset/render tooling. |
| `foundation` | Research and UX (`research-foundation`, `ux-analysis`) | UUPM search first for compatible product/pattern research; Impeccable shape for discovery/gaps | Product evidence, patterns, audience, goal, hierarchy, flows/states, constraints; source-backed recommendations distinguished from assumptions. Palette/system suggestions remain provisional. |
| `concept` | Design reasoning (`design-reasoning`) | frontend-design in bounded mode on web; Impeccable shape or compatible alternative elsewhere | Distinct concept alternatives, chosen experience/narrative, rationale, information architecture and acceptance criteria. No final palette/token authority. |
| `direction` | Final art direction (`visual-direction`) | One eligible driver: Taste, Impeccable new-work, frontend-design, UUPM design-system; platform specialist when appropriate | Concrete visual direction consuming the chosen concept: palette, type, composition, materials/media, identity and responsive treatment. One final visual owner. |
| `system` | Design system (`design-system`) | Selected driver if explicitly owned, or a suitable system specialist; Impeccable document can normalize actual generated tokens, Expo design-system fits Expo | Final tokens/components reconciled with foundation constraints and approved art direction; variants/states, code locations and contrast evidence. Preliminary research tokens are not final. |
| `components` | Component/media sourcing (`component-reference`) | Project/platform components; Lucian or other compatible specialist for gaps | Reuse/source decisions, actual assets and rights; remaining asset gaps. |
| `motion` | Motion decision/build (`motion-build`) | Emil, Expo/Reanimated, GSAP when appropriate, or an executed driver's explicitly owned capability | Purpose, implementation, interruption/reduced-motion behavior and evidence; or an explicit static decision when no motion is required. |
| `implement` | Integration | Driver and scoped specialists, coordinated by orchestrator | Working code following accepted foundation/concept/art-direction/system decisions, states and deviations. |
| `validate` | Render/functional validation (`visual-validation`) | Existing project tooling, compatible device specialist, bundled tools | Actual static/build/interaction/render evidence at required sizes/states. |
| `review` | UX/design (`ux-critique`) **and** technical/accessibility (`tech-audit`) | Separate suitable reviewer activations, e.g. Impeccable critique and audit or another compatible evaluator | Two assessments against the original brief, handoffs, implementation and observed renders; located findings and verdicts. |

These are responsibilities, not a request to run every installed skill. One driver can own
several capabilities, but must deliver each stage's concrete output. Ownership is limited to
registry `owns`; the explicit bounded-mode exception in [adapters.md](adapters.md) lets frontend-design
serve concept reasoning without becoming a second driver. Outside that mode, normal driver rules
apply. E.g. Taste does not automatically cover UX analysis, a separate system handoff,
motion engineering or review. Route uncovered roles. A document command records/normalizes the
implemented token/component system; its name alone cannot satisfy design-system creation.

If the user delegated decisions, explore alternatives inside the UX/concept work, choose with
rationale and continue. Only a requested exploration/selection workflow adds a choice gate.
Existing authorization must still cover high-risk actions; delegated art direction does not
authorize unrelated destructive changes, new dependencies or external publication.
Native/Operate surfaces retain platform patterns; do not force a marketing driver onto them.
Supplied designs and screens inside an established system use verified specification/system
reuse under their scoped workflows. Exact local fixes and specified small components retain the
fast path. They do not require a new concept; a whole surface never qualifies for that shortcut.
Open-ended improvements/Refresh, even Small, use the creative-refinement branch of
[improvement.md](../workflows/improvement.md), scaled by its size table (Refresh: [redesign.md](../workflows/redesign.md)).
Reuse the inspected foundation/system rather than fabricate full-design stage work. An existing system forbids an unauthorized replacement driver, not creative
specialist execution within its constraints. Exact supplied fixes remain scoped.

## 2. Execution receipts, not name lists

For every selected skill, record:

- `id`: activation id, linked from the stage(s) it actually served;
- `skill`: registry id (or explicitly identified unregistered skill);
- `method`: `skill-tool` or `instructions`;
- `source`: the actual listed skill, or absolute SKILL.md used for instruction-driven execution
  (its frontmatter identity must match the selected skill);
- `invocation`: actual command/tool call, or the instruction-driven steps executed;
- `executor`: the agent/context that executed it;
- `status`: `succeeded` or `failed`;
- `evidence`: references to real tool results, commands/exit results or reviewed artifacts;
- `outputs`: actual results subsequently accepted into the stage handoff.

A registry lookup, a plan, reading SKILL.md, an attempted invocation or copying a skill's name
into a report is not successful execution. Without a Skill tool, load the specialist's actual
instructions/references, perform their prescribed work with equivalent available tools and
record the steps/results. This is valid execution, not automatic fallback.

Each stage records `id`, `status` (`completed`, `reused`, or permitted `skipped`), `output`,
`evidence`, `accepted` and a `coverage` object keyed by required slot. Coverage sources are:

- `skill`: successful `activation` id; the skill supports this slot;
- `driver`: successful `activation` id; selected driver explicitly owns this slot;
- `project`: `reason` and `evidence` for exact specification/system reuse or project components/tools;
- `built-in`: `reason` and `evidence`, after relevant candidate checks establish no available owner.
  Built-in `tech-audit` coverage also records its real `executor`; if this is the implementer,
  declare `review_mode: sequential`. Built-in UX review records its executor in `visual_review`.

Each handoff also lists `inputs`, the prior accepted stage ids it consumes. The checker requires
at least these (more prior stages may be listed):

| Stage | Required `inputs` |
|---|---|
| `inspect` | — |
| `foundation` | `inspect` |
| `concept` | `foundation` |
| `direction` | `concept` |
| `system` | `foundation`, `direction` |
| `components` | `system` |
| `motion` | `system`, `components` |
| `implement` | `direction`, `system`, `components`, `motion` |
| `validate` | `implement` |
| `review` | `foundation`, `concept`, `direction`, `system`, `validate` |

Accept the output before dependent work starts. A combined driver run may return several
handoffs, but must still perform foundation/concept/art-direction/system decisions before implementing. Keep records
in working context or temporary files; do not create permanent process files without a reason.

### Coordinate a driver's phases

Execute up to the driver's planning/token checkpoint, accept the relevant handoffs, call the
uncovered specialists, then resume its build/check steps. Preserve the driver's design decisions
and mandatory process. Preparing token files, assets and prototypes required by concept/system
work is allowed before full UI integration.

For Taste 2.5, brief/copy/section plan and deal/token steps (1–4) precede build (5): execute
those steps with the accepted foundation and concept brief, accept its art direction, inspect the generated system with
the routed system specialist, source remaining components/media and resolve requested motion
engineering before resuming build/check/report (5–7). Additional motion work must respect Taste's
required motion/check rules. Other drivers use their actual documented boundaries. If an
integration cannot expose required outputs before dependent work, select a compatible staged
driver or report the limitation; do not invent retrospective handoffs after building.

## 3. Failure recovery and fallback

On activation failure, preserve the failed receipt, inspect the cause and use a documented
recovery when authorized. Never repeat blindly, bypass permissions or count failure as use.
An absent native invocation tool permits the instruction-driven method, not skipping the skill.
If a genuine prerequisite/compatibility problem remains, record it in the inventory and try the
next candidate. Refresh stale availability rather than assuming a failed launch means absent.

Only after relevant alternatives are checked may built-in work fill the role. Explicit user
exclusions and `invocation: user` remain binding. Do not install missing skills without authority.
For full-design work, any required built-in specialist fallback caps the result at `Passed with
limitations`; a missing critical output or unmet evidence gate is `Needs review` or `Failed`.
Never describe degraded self-execution as a fully specialist-orchestrated result.

## 4. Reviews and corrections

The builder's self-check does not replace the two required review capabilities. Give reviewers
the original brief, accepted handoffs, diff and actual renders, not a prewritten success verdict.
Use fresh reviewer context when available and authorized. The same provider may supply distinct
commands, but a driver is not its own reviewer. Count independence by execution context, not by
renaming an agent or changing a command label.

When fresh context is unavailable, execute separate reviewer skills sequentially, set
`review_mode: sequential`, disclose this and cap full-design status at `Passed with limitations`.
Do not downgrade a high-risk task's explicit independent-review requirement; unmet requirements
remain `Needs review`. Built-in review after evidenced specialist unavailability is also limited.
Fix findings, rerun affected checks and obtain updated review evidence. An unresolved required
finding means its gate is not met; listing findings does not close them.

## 5. Completion check

For `full-design`, run:

```bash
python3 -I <skill-dir>/scripts/check-orchestration.py <temporary-record.json>
# Or pass the same JSON through stdin:
python3 -I <skill-dir>/scripts/check-orchestration.py --stdin
```

The top-level JSON has:

- `schema_version: 2`, `profile: full-design`, `platform` (`web`, `react-native`, `ios`, `android`,
  `flutter` or `unsupported`), `driver` (registered driver id or null), `implementer` (context id),
  `motion_required` (boolean), `interactive` (boolean, defaults true), `review_mode` (independent
  by default or `sequential`);
- `inventory`: checked candidates with `skill`, `status` (`available`, `unavailable`, `incompatible`,
  `excluded`, `user-only`), `evidence` and `reason` for non-available results. Explicitly requested
  user-only skills additionally need `requested: true`; unregistered entries need
  `unregistered: true` and their inspected `slots`;
- A built-in slot fallback needs inventory results for all registered candidates supporting that
  slot/platform, plus any relevant discovered unregistered specialists. Unregistered skills may
  serve as specialists, never drivers;
- `activations`: the receipts above (failed attempts may remain, but never fill coverage).
  Bounded frontend-design concept execution must declare `mode: design-reasoning`; it cannot
  fill art direction, implementation or other slots in that mode;
- `stages`: the ten required stages in table order, each with `inputs` referencing accepted
  predecessors (minimum set in the §2 `inputs` table). Motion alone may be skipped when
  `motion_required: false` and a concrete `reason` is supplied;
- `required_levels` and `evidence_levels`: evidence level arrays. Full-design requires at least
  L1/L2/L4, plus L3 for changed interactions; these labels refer to actual evidence in the records;
  both fields accept only arrays of labels L0 through L5, never strings or objects.
  Omitting `required_levels` retains the profile's mandatory minimums;
- `gates`: objects with `name` and `met` (boolean), including workflow and review conditions.
- `routing`: `surface` (`marketing`, `operate`, `read`, `experience`), selected-driver `reason`
  and `candidates` with `skill`, boolean `eligible`, `reason` and `evidence`. An excluded candidate
  cannot be the selected driver. On every surface, the selected driver must appear in `candidates`
  with `eligible: true`; an inventory entry or user request does not replace eligibility checks.
  An excluded candidate
  needs `reason_code`: `runtime`, `brief-conflict`, `not-installed`, `platform`, `authorization`
  or `user-excluded`. A `brief-conflict` also has `constraint` with `source` (`user` or `project`),
  `description` and `evidence`; a self-imposed effect is not an exclusion. Web marketing must
  consider Taste; eligible Taste is preferred unless `requested_driver: {skill, evidence}` records
  another explicit user choice. Eligible Taste and runtime-based exclusions carry `runtime_probe`,
  the JSON from `scripts/probe-runtime.py --min-node 22`. Observed compatible alternatives cannot
  be ignored. Local necessary kit writes already covered by the task need no repeated approval.
- `visual_review`: `activation` matching the UX/design review and `criteria` entries with
  `dimension`, `verdict` (`pass`, `fail`, `unverified`), `observation` and rendered `evidence`.
  Required dimensions: `brief-fit`, `creative-advance`, `composition`, `typography`,
  `palette-and-materials`, `product-identity`, `distinctiveness`, `finish`, `responsive-craft`.
  Failed/unverified dimensions block completion even when functional gates are green.
  When the existing fallback rules allow built-in UX review, use `source: built-in`, a unique `id`
  and the real `executor` instead of inventing a skill activation; the same visual dimensions apply.
  Self-review must be declared sequential and all built-in review remains limited.
  Optional `user_feedback` has `status`: `not-received`, `accepted` or `changes-requested`, with
  evidence when received. Negative feedback requires `previous_activation` and a `resolution`
  containing the new visual review's `activation`, `summary` and fresh rendered `evidence`.
  Preserve the old activation; reusing it is not resolution. No user reply is required when
  no feedback was received.
  A built-in review uses `resolution.review` (the new review's `id`). Preserve an older assessment
  in `previous_reviews` with its `id`, `source` (`skill` or `built-in`), `executor`, `summary` and
  rendered `evidence`, then reference it with `user_feedback.previous_review` when there is no
  previous skill activation. Historical assessments grant no current execution coverage. Neither
  review method may resolve feedback by reusing the old review identity.

Earlier schema-2 records lacking these routing/visual fields need the missing assessments;
do not backfill positive judgments merely to make a historical run pass. The JSON output is
explicitly scoped to `execution-record`, not an automated aesthetic verdict.

Example coverage row (illustrative shape, not evidence of a run):

```json
{
  "id": "concept", "status": "completed", "inputs": ["foundation"],
  "output": "Chosen experience concept, alternatives and rationale",
  "evidence": ["<actual concept result reference>"], "accepted": true,
  "coverage": {"design-reasoning": {"source": "skill", "activation": "concept-run-1"}}
}
```

Schema 1 records must be migrated explicitly: re-evaluate their former `ux` output as foundation,
execute the separate concept role, and record actual downstream inputs. Do not relabel old rows
as proof that the added stages ran.

A nonzero exit blocks completion: correct missing/invalid execution or report the gap. The
checker uses Python 3's standard library; if its runtime is unavailable, report the check as
unavailable and keep full-design orchestration status at `Needs review` rather than inventing a pass.
The returned `status_ceiling` is not a UI verdict; apply the more restrictive workflow/review status.
The checker catches inconsistent records, absent stages, unsupported ownership, unexecuted
selections and undeclared self-review. It cannot authenticate fabricated receipts, observe when
work actually occurred, compel an agent to invoke it, or determine whether a UI is beautiful.
Report checker results together with real execution and rendered-review evidence.
