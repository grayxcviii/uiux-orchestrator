# Tests

## Layout

| Path | Contents |
|---|---|
| `scenarios.json` | 39 routing scenarios with expected routing (answer key v3; revisions listed in `answer_key_changes_v2` and `_v3`) |
| `scenarios-heldout.json` | 8 held-out scenarios written after all fixes, never used for tuning |
| `harness/` | Harness README (decision schema, prompts), installed-skill metadata, shuffled batches |
| `fixtures/` | Sample apps for execution runs (`web-app`, `expo-onboarding`) |
| `benchmark.md` | **Current benchmark: measured metrics vs. targets, cost, threats to validity** |
| `results/` | Raw, dated results of every run (never edited after the fact except to add scoring notes) |
| `archive/` | Earlier, smaller scenario sets (phase 0 and phase 2) kept for history; superseded by `scenarios.json` |

The scenario format:

```text
id · request · project facts · environment (installed/excluded skills, tools)
expected: platform · intent(s) · workflow(s) · fast_path · mutation · driver
          must_select (any-of groups) · may_select · must_not_select · must_recommend
          max_status · must_ask · mode
expected_outputs · expected_validation · pass_criteria
```

## Execution comparisons

The [paired comparison suite](comparison/README.md) covers a specified component, a screen inside
an existing design system, screenshot implementation and onboarding motion. It records quality
checks, visual evidence, time, tokens and remaining issues. Installer tests do not establish UI
quality; routing-only probes do not establish an execution speedup.

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
