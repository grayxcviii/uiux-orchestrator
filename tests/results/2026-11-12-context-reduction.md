# Context reduction: v1.5.0 vs. candidate (routing, paired)

Date: 2026-11-12. Agent: Claude Code subagents (Opus 5.5), one fresh agent per batch, no shared
context. n = 1 run per version. Raw decisions: [2026-11-12-context-reduction/](2026-11-12-context-reduction/).

## Method

- v1.5.0 was frozen from tag `v1.5.0`; the candidate is the refactored skill (SKILL.md and core
  files split so full-design-only material loads only for full creative work; narrower skill
  description). Both read the same blinded inputs: scenarios without `expected`, `covers` or
  `pass_criteria`, the same installed-skill metadata and the harness decision schema.
- Batches (fixed shuffle, seed 150): 4 main batches (41 scenarios) and the 8 held-out scenarios.
  Prompts: `tests/harness/README.md`, "with skill". Scored with `scripts/score_routing.py
  --normalize-intents` (held-out with `--key tests/scenarios-heldout.json`).
- Trigger probe: one agent per description decided, from skill names and descriptions only, which
  skills it would auto-activate for 14 prompts (8 non-UI, 6 UI), including "đánh giá repo này".
- The candidate also carries one bug fix found during the baseline: `scripts/direction.mjs`
  printed nothing when reached through a symlinked path (e.g. `/tmp` on macOS).

## Results

| Metric | v1.5.0 main | candidate main | v1.5.0 held-out | candidate held-out |
|---|---|---|---|---|
| Platform, intent, workflow, fast path, mutation, driver | 100% | 100% | 100% | 100% |
| Skill selection (must ∧ ¬must-not) | 90% (37/41) | 90% (37/41) | 100% | 100% |
| Ask-user decision | 94% (17/18) | 100% (18/18) | 100% | 100% |
| Recommendations | 1/2 | 1/2 | — | — |
| Status honesty | 100% | 100% | 100% | 100% |
| Unnecessary invocations | 30% (37/124) | 30% (37/123) | 33% (6/18) | 19% (4/21) |
| Skill files consulted per scenario | 9.0 | 9.9 | 10.1 | 9.0 |
| Agent tokens (all batches) | 560k | 538k (−4%) | 139k | 117k (−16%) |

Trigger probe: both descriptions activate the orchestrator on 6/6 UI prompts and 0/8 non-UI
prompts (including "đánh giá repo này"). The narrower description lost no valid trigger; this
simulated probe did not reproduce the mis-trigger seen in a real session.

Static size of the skill text an agent reads for "improve one screen": about 22,400 words in
v1.5.0, about 16,400 in the candidate (−27%). SKILL.md body: 2,126 → about 1,000 words. Routing
tokens fell less (−4% to −16%) because blinded inputs and registry entries dominate a routing
batch, and agents still read large registry ranges.

## Findings that did not change between versions

The same four main scenarios fail skill selection in both runs, so they are not caused by the
refactor:

- S03, S06, S36: `anthropic/frontend-design` (bounded concept mode) is selected for screens inside
  an existing system, which the answer key forbids. The skill's creative-refinement rule asks for
  `design-reasoning` there; the answer key predates it. One of the two must change.
- S37: the unregistered `apple-design` (HIG) skill is chosen instead of `impeccable/critique`.

Ambiguities reported by agents in both runs: motion review for one flow (decision-engine vs.
animation.md), no registered HIG reviewer although review.md names one, whether a new screen in
an existing system is full-design or scoped, execution mode for large read-only reviews, what
counts as a governing brand, the design-system owner under Taste, and whether a run is
interactive (the harness does not say).

## Limits

n = 1 per version; differences of one scenario are within run-to-run noise. Routing only: no
execution or rendered output was measured. Historical v0.4 results (skill selection 100%,
unnecessary 0–4%) used older answer keys and rules and are not directly comparable.

## Round 3: routing rules for in-system screens and motion

The unnecessary invocations of rounds 1–2 were mostly motion skills (53%: `improve-animations`,
`choreograph`, `animate`) and the separate concept activation (16%: `frontend-design`). Changes:

- A new screen inside an established design system is not full-design: verified system reuse,
  concept alternatives inline in the scoped visual specialist, one UX reviewer plus
  technical/accessibility checks. A separate `design-reasoning` activation remains for
  full-design, Redesign/Replace, Large work and requested explorations.
- `emil/choreograph` only for complex multi-group sequences; scoped `motion-review` only when
  motion is the deliverable or spans several flows (full-design keeps it: the record checker
  requires it).
- Platform conformance on iOS uses Impeccable critique's native guidance; an unregistered HIG skill
  joins only when critique is unavailable.
- Answer key v3: `emil/improve-animations` added to `may_select` for the seven full-design
  scenarios whose motion ships (S04, S05, S27, S29, S35, S40, S41), because the checker requires
  motion-review there since 1.4.2. Rounds 1–2 are rescored on the same key below.

| Metric (answer key v3) | v1.5.0 | refactor | refactor + rules |
|---|---|---|---|
| Skill selection, main | 90% (37/41) | 90% (37/41) | **100% (41/41)** |
| Skill selection, held-out | 100% | 100% | 100% |
| Unnecessary invocations, main | 24% (30/124) | 24% (30/123) | **14% (15/108)** |
| Unnecessary invocations, held-out | 33% (6/18) | 19% (4/21) | **6% (1/18)** |
| Ask-user decision | 94% | 100% | 100% |
| Status honesty, main | 100% | 100% | 98% (S23) |
| Agent tokens, all batches | 700k | 656k | **629k (−10%)** |

All other routing metrics stayed at 100%. S23 (signup WCAG fix without axe or a screen reader)
was reported `Passed` instead of `Passed with limitations`; the files behind that decision did not
change, so it is likely run-to-run noise, but `workflows/accessibility.md` now states the limit
explicitly. Remaining unnecessary picks are spread thinly (`impeccable/shape`, `emil/animate`,
`impeccable/layout`, `anthropic/frontend-design` 3 each). n = 1 per version.
