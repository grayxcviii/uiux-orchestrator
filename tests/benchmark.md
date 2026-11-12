# Benchmark — uiux-orchestrator routing and execution

> **Latest:** [2026-11-12 paired routing runs](results/2026-11-12-context-reduction.md): after the context-reduction refactor and routing-rule changes, skill selection 100% (main and held-out), unnecessary invocations 14% main / 6% held-out, agent tokens −10% vs. v1.5.0. The tables below are older (v0.3–v1.0); the 1.3.0 runtime and routing hardening probes are in [results/2026-11-10-routing-hardening.md](results/2026-11-10-routing-hardening.md).

- Date: 2026-11-06
- Agent: Claude Code subagents, model Opus 5.5
- Skill versions: v0.3.0 (rep1, rep2), v0.4.0 candidate (rep3, held-out)

Every number here comes from a recorded run in `tests/results/`. Targets are labelled as targets.
Nothing in this file was produced without a run behind it.

## Current release coverage

Version 1.2.0 extends the fast path to specified small components and shortens routine reports.
The execution metrics below were collected on earlier versions; they have not been rerun as a
paired execution comparison for 1.2.0. See [comparison/README.md](comparison/README.md) for the
current protocol. An [eight-case routing-only probe](results/2026-11-09-fast-path-routing.json)
matched the expected fast-path boundaries on the candidate. It used shared context and one
follow-up after ambiguity fixes; it is not a paired execution benchmark. Do not infer a quality
or token-efficiency improvement from installer tests or that routing probe.

## 1. What was measured

| Layer | Method | Data |
|---|---|---|
| Routing | 34 scenarios (`tests/scenarios.json`) + 8 held-out scenarios (`tests/scenarios-heldout.json`). Fresh agents decide stages 1–3 per scenario and write structured decisions; `scripts/score_routing.py` scores them against the answer key | `tests/results/phase4/*.json`, `score-*.md` |
| Execution | 8 real execution runs on two fixture apps (edits, builds, screenshots), plus 2 plan-only probes | `tests/results/2026-11-06-phase3-execution.md` |
| Baseline | Same scenarios, same model, the same installed-skill metadata, no orchestrator | `base-*.json`, `heldout-base.json` |

Repetitions:
- **with-skill:** rep1 + rep2 (v0.3.0, 68 decisions), then rep3 (34 decisions) after fixes, then
  held-out A + B (16 decisions);
- **baseline:** 34 + 8 decisions.

Batches have 8–12 scenarios each, shuffled with fixed seeds (`tests/harness/batches.json`).

## 2. Results

### v1.0 — historical summary

v1.0.0 has the same routing rules as v0.6.0 plus one "not a reason" row (Phase 5). The rows below
were measured on v0.6.0 unless marked v1.0.

| What | Result |
|---|---|
| Full main set re-run on v0.6.0-pre (n=39) | 95% skill selection (key v3), 97% with key v4; 2 regressions found |
| Held-out re-run on v0.6.0-pre (n=8) | 88% (H06 regression) |
| After fixing both regressions: 11 affected/neighbouring scenarios × 2 orders | 100% (22/22), 1 accepted extra pick |
| Real triggering (`claude -p`, real install, 10 prompts) | 4/6 UI prompts triggered, 2 closer-fit/direct-fix alternatives, 0/4 false triggers |
| Detection from real files (8 fixtures × 2) | 16/16 platform, framework and arch flag |
| Codex CLI 0.166 (3 runs) | Triggered on its own; read-only review with source unchanged (hash-verified); real fix plus build; plan with the v0.6 fields |
| Native mobile (Expo on the iOS simulator via agent-device) | L4 frame evidence before/after; L5 not reached |
| **v1.0** packaged plugin (9 runs, `tests/results/2026-11-06-phase5-packaging.md`) | Plugin install, `/uiux-orchestrator` and the full name work. The review prompt auto-loaded the skill in 3 of 5 runs overall. Forced review routed to `impeccable/critique` in 2 of 2 runs, source unchanged |

Earlier sections below record v0.3–v0.5. They are history, not current claims.

### Routing — main scenario set (34)

| Metric | Baseline (n=34) | With skill v0.3.0, rep1+rep2 (n=68) | With skill, rep3 after fixes (n=34) |
|---|---|---|---|
| 1. Platform detection | 100% | 100% | 100% |
| 2. Intent classification | 100%¹ | 82% raw / 100% normalized¹ | 100% |
| 3. Workflow selection | 100% | 100% | 100% |
| 4. Skill selection (all must, no must-not) | **82%** | **100%** | **100%** |
| 5. Unnecessary skill invocations | **31%** (17/54) | **4%** (3/85) | **0%** (0/41) |
| Fast-path decision | n/a | 100% | 100% |
| Read-only respected (mutation) | 100% | 100% | 100% |
| Ask-user decision | 92% | 96% | 100% |
| Status honesty (never above reachable) | 91% | 91% | 100% |
| Registry read in full (progressive loading) | n/a | 18% | 0% |
| Orchestrator files consulted per scenario (self-reported) | n/a | 8.9 | 8.7 |

¹ The v0.3.0 intake had no canonical intent ids, so agents wrote workflow names (`review`, `bug-fix`).
"Normalized" maps those words to ids. v0.4 adds the ids, and rep3 scores 100% raw.

The driver metric is omitted for the baseline because baseline agents have no "driver" concept
and fill the field with whatever skill they call first.

### Routing — held-out set (8 scenarios written after all fixes, never used for tuning)

| Metric | Baseline (n=8) | With skill (n=16, 2 orders) |
|---|---|---|
| Skill selection | **50%** | **100%** |
| Unnecessary invocations | **47%** (7/15) | **0%** (0/30) |
| Workflow selection | 88% | 100% |
| Platform / intent / mutation / status honesty | 100% | 100% |

Baseline failures on the held-out set:
- picked the Software Mansion skill on an old-architecture app;
- used `apple-design` (a web skill) for a native iOS fix;
- missed `impeccable/audit` on an accessibility review;
- invoked skills that were not installed in the scenario;
- used `impeccable animate` instead of the motion specialist.

### Routing — new integrations (v0.5: Anthropic frontend-design, dickwu apple-design)

There are 5 new scenarios (S35–S39), re-run together with 5 affected existing ones (S03, S06, S17,
S18, S21).

| Metric | Baseline (n=10) | With skill (n=20, 2 orders) |
|---|---|---|
| Skill selection | 80% | 100% |
| Unnecessary invocations | 24% (4/17) | 0% (0/35) |

The orchestrator chose `anthropic/frontend-design` when Impeccable was absent and Taste failed its
Node check (S35). It kept the HIG reviewer off the Android-only app (S38). It told the two skills
named `apple-design` apart by description. Caveat: the harness metadata labels the two
`apple-design` skills with their sources, which makes the name clash easier for the baseline than
it is in a real install.

### Execution (Phase 3, n = 8 execution runs)

| Metric | Measured | Target |
|---|---|---|
| 6. Task completion | 8/8 reached a final status. One needed a follow-up instruction after stalling on heavy sub-agents (R1b) | ≥ 80% |
| 7. Quality-gate compliance (claimed status matches evidence) | 8/8, checked by the author against diffs, hashes and screenshots | 100% |
| 10. Regression rate (out-of-scope changes) | 0/8 | 0% |

### Cost

| Metric | Baseline | With skill |
|---|---|---|
| 8. Tokens per scenario, routing only, batched (amortized over 8–12 scenarios) | 3.8k (main) · 5.0k (held-out) | 8.6k (main) · 12.7k (held-out) |
| 9. Wall time per scenario, routing only, batched | 10.5 s · 6 s | 22–24 s · 35 s |
| Orchestrator context per real task (static estimate from file sizes, v0.4) | 0 | fast path ≈ 8k tokens · routed core ≈ 13k + workflow ≈ 0.7k + platform sections ≈ 1–3k + registry entries ≈ 1–2k |
| Execution runs (Phase 3), agent tokens per task | — | 57k–167k (bug fix → mobile animation) |

The orchestrator roughly doubles routing cost. In exchange, on held-out scenarios, it cut wrong
or unnecessary skill picks from about half to zero. Cost reduced in this phase:
`core/skill-registry.md` went from about 1.5k to 1.0k tokens (the contributor schema moved to
`docs/registry-schema.md`). Agents stopped reading the full 11k-token registry: the full-read rate
went from 18% to 0%.

## 3. Targets vs. measured

| # | Metric | Target | Measured (best evidence) | Met? |
|---|---|---|---|---|
| 1 | Platform detection | ≥ 95% | 100% (n=50 decisions, rep3 + held-out) | yes |
| 2 | Intent classification | ≥ 90% | 100% (n=50) | yes |
| 3 | Workflow selection | ≥ 90% | 100% (n=50) | yes |
| 4 | Skill selection | ≥ 85% | 100% (n=50) | yes |
| 5 | Unnecessary invocation rate | ≤ 10% | 0% (0/71 selected) | yes |
| 6 | Task completion | ≥ 80% | 100% with one intervention (n=8) | yes, small n |
| 7 | Gate compliance | 100% | 100% (n=8) | yes, small n |
| 8 | Token consumption | report | see §2 Cost | — |
| 9 | Execution time | report | see §2 Cost | — |
| 10 | Regression rate | 0% | 0% (n=8) | yes, small n |

## 4. Threats to validity

- **One author.** The scenarios, answer key, skill and scorer were all written by the same author.
  The held-out set reduces tuning bias but is still author-written. An external scenario set would
  be stronger evidence.
- **Answer-key revision.** The key was revised once between rep1/rep2 and rep3. The changes are
  listed in `tests/scenarios.json` → `answer_key_changes_v2`, with the v1 key archived as
  `tests/results/phase4/scenarios-v1-answer-key.json`. Two of the changes loosened expectations
  that turned out to be stricter than the skill's own gates. One fixed an inconsistent scenario
  environment.
- **The skill was tuned on the main set.** Rep3 at 100% shows the fixes work on the scenarios they
  were derived from. The held-out set is the fairer generalization signal, and it has n = 16.
- **Routing ≠ outcome.** Routing scores say which skills an agent would pick, not how good the UI
  becomes. Execution quality is covered only by the 8 Phase 3 execution runs.
- **Self-reported file lists.** `skill_files_consulted` is self-reported; one agent admitted
  inaccuracies. Treat it as approximate.
- **Batching.** Agents handled 8–12 scenarios per context. Later scenarios benefit from files read
  earlier, so per-scenario cost and loading figures are amortized.
- **Simulated environment.** Installed skills were described, not installed (except Impeccable).
  A real environment adds detection noise.
- **One model.** All runs used Opus 5.5. Other models and other agents (Codex, Cursor) are untested.

## 5. Reproduce

```bash
python3 scripts/validate.py                                            # skill + registry consistency
python3 scripts/score_routing.py tests/results/phase4/rep3-*.json      # main set, key v2
python3 scripts/score_routing.py tests/results/phase4/heldout-[AB].json --key tests/scenarios-heldout.json
```

To produce new runs, follow `tests/harness/README.md`.
