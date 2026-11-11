# Tests

## Layout

| Path | Contents |
|---|---|
| `scenarios.json` | 41 routing scenarios with expected routing, including alternate-runtime and subject/media-fit regressions |
| `scenarios-heldout.json` | 8 held-out scenarios written after all fixes, never used for tuning |
| `harness/` | Harness README (decision schema, prompts), installed-skill metadata, shuffled batches |
| `fixtures/` | Sample apps for execution runs (`web-app`, `expo-onboarding`) |
| `benchmark.md` | **Current benchmark: measured metrics vs. targets, cost, threats to validity** |
| `results/` | Raw, dated results of every run (never edited after the fact except to add scoring notes) |

The scenario format:

```text
id · request · project facts · environment (installed/excluded skills, tools)
expected: platform · intent(s) · workflow(s) · fast_path · mutation · driver
          must_select (any-of groups) · may_select · must_not_select · must_recommend
          max_status · must_ask · mode
expected_outputs · expected_validation · pass_criteria
```

## Installer checks

`npm test` runs CLI/package tests, local Git-source specialist installation tests and the execution
comparison tool's tests. Specialist tests cover web/mobile/mixed detection, workspace globs and
exclusions, all-source selection, licence retention, repeat installs, user-managed copies, bad
revisions, unavailable Git and escaping symlinks. CI does not need to download all upstream repos.
The [recorded upstream installation run](results/2026-11-09-specialist-installer.json) separately
checks the live catalogue in isolated profiles. Neither set measures UI output quality.

`test_orchestration.py` checks the full-design execution-record validator: required phase order,
activation provenance, driver ownership, bounded concept execution, foundation/concept separation,
final system inputs, platform compatibility, fallback alternatives, separate reviews and status
ceilings. Execution schema 2 deliberately rejects legacy records that omit the new stage work. The validator is bundled with the installed skill. Passing installer, routing
or record tests does not prove real specialist execution or aesthetic quality; receipts must
match actual runs and visual claims need observed renders.

Additional regressions reject skipping an eligible marketing driver, ignoring an observed
compatible runtime, replacing visual assessment with boolean gates, and keeping an old pass
after negative feedback. They preserve explicit user driver/style choices and allow a new
rendered review to resolve feedback without requiring another user approval. `test_runtime_probe.py`
executes isolated fake Node binaries to test PATH-vs-nvm discovery, configured paths, invalid
version output, and environment preservation. Package tests verify both helpers ship and install.

Pre-push checker regressions also require selected-driver eligibility on every surface, reject
built-in technical self-review unless declared sequential, and enforce evidence-level arrays
with valid L0–L5 labels. Valid independent fallback remains limited; optional extra evidence
requirements may be omitted without suppressing the profile's minimums.

## Execution comparisons

The [paired comparison suite](comparison/README.md) covers a specified component, a screen inside
an existing design system, screenshot implementation and onboarding motion. It records quality
checks, visual evidence, time, tokens and remaining issues. Installer tests do not establish UI
quality; routing-only probes do not establish an execution speedup.

E05/E06 add original contemporary/colorful art direction and explicit violet/cyan/glass fidelity.
Their acceptance criteria require observed renders and blinded brief-fit judgments, separately
from functional checks. These are evaluation cases, not measured visual-quality results; do not
claim improvement until paired executions and their reviews have actually been recorded.

E07 covers creative refinement of one existing card with fixed tokens. It requires executed
creative expertise and observed before/after benefit; it is an evaluation specification, not a
measured claim that novelty or aesthetic quality improved. Exact component/spec fidelity remains
covered by the earlier scoped cases.

E08 adds a destination-landing-page comparison with a Node20 PATH and installed Node24. It grades
driver eligibility, media quality, original-brief fit and honest visual acceptance. Like E05–E07,
it is a specification for future paired runs, not a measured claim of aesthetic improvement.

## Method

1. **Routing runs.** A fresh subagent gets the scenario file and the metadata of the installed skills
   (name and description only, which is what a real agent sees). The baseline run has no
   orchestrator. The with-skill run is told to follow `skills/uiux-orchestrator/SKILL.md`. Both
   record their decisions and which files they read.
2. **Scoring.** `scripts/score_routing.py` compares decisions with `scenarios.json` (or the held-out
   file). Every mismatch is read by hand before any skill or answer-key change.
3. **Execution runs (Phase 3).** Selected scenarios on real sample projects, with edits,
   builds and screenshots, so quality gates and visual validation get tested.

## Metrics

Measured values are in [benchmark.md](benchmark.md). The targets below are unchanged.

| # | Metric | Definition | Target |
|---|---|---|---|
| 1 | Platform detection accuracy | correct platform + framework + arch flags / scenarios | ≥ 95% |
| 2 | Intent classification accuracy | primary intent correct / scenarios | ≥ 90% |
| 3 | Workflow selection accuracy | correct base workflow and sub-type / scenarios | ≥ 90% |
| 4 | Skill selection accuracy | all must-select chosen and no must-not chosen / scenarios | ≥ 85% |
| 5 | Unnecessary skill invocation rate | skills invoked that are not in must-select or allowed-optional / all invocations | ≤ 10% |
| 6 | Task completion rate | execution runs that reach the gate / runs | ≥ 80% |
| 7 | Quality gate compliance | runs whose reported status matches the evidence / runs | 100% |
| 8 | Token consumption | input + output tokens per scenario, from agent usage logs | report only |
| 9 | Execution time | wall clock per scenario | report only |
| 10 | Regression rate | execution runs that broke something outside scope / runs | 0% |

Measured values go in `results/` with the date, agent, model and sample size. A target is never a
result.
