# Execution record — full-design completion check

Load at the end of full-design work, before assigning a status.

## Run the check

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
  predecessors (minimum set in the §2 `inputs` table). `motion_required` defaults to `true` for
  new surfaces and redesigns; motion alone may be skipped when `motion_required: false` and a
  concrete `reason` (user asked for static, or no state changes) is supplied;
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
  `palette-and-materials`, `boldness`, `product-identity`, `distinctiveness`, `finish`,
  `component-contract`, `responsive-craft`, plus `motion-smoothness` when `motion_required`
  (the dimensions of the [visual craft gate](quality-gates.md#visual-craft-acceptance)).
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
