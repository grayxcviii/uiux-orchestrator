# Phase 5: packaging and install tests

- Date: 2026-11-06 · Agent: Claude Code 2.1.318 (`claude -p`) · Model: Opus 5.5 · n = 1 per run
- Machine: the author's macOS machine with its real skill set: Impeccable, the Anthropic design
  plugin (including `design:design-critique`), dataviz, superpowers and agent-device.
- Fixture: copies of `tests/fixtures/web-app` under `/tmp`.
- Parsed results: `phase5/summary.json`. Full report of E3a: `phase5/E3a-report.md`.

## 1. Plugin packaging

| Check | Result |
|---|---|
| `claude plugin validate .` | Passed. One warning: no icon. Plus advice to add the one-step install line, which is now in the README |
| `claude plugin validate .claude-plugin/marketplace.json` | Passed |
| `claude plugin install uiux-orchestrator --marketplace <local path>` | Installed. `claude plugin details` shows 1 skill, about 200 always-on tokens and about 2.9k when invoked |
| Skill name registered | `uiux-orchestrator:uiux-orchestrator`. `/uiux-orchestrator` also resolves to it (P3) |
| Uninstall and marketplace removal | Clean. `claude plugin list` no longer shows it |
| Install from GitHub: `claude plugin install uiux-orchestrator --marketplace grayxcviii/uiux-orchestrator` | Passed after the v1.0.0 push. It cloned, validated and installed v1.0.0. A `/uiux-orchestrator` probe (G1) loaded the skill from the plugin cache |
| `claude plugin marketplace update` + `claude plugin update` | Both work. The update reported "already at the latest version (1.0.0)" |
| GitHub Actions `validate` on the first push | success |
| `npx skills add` | **Not tested:** running the external CLI was not permitted in this environment |

## 2. Activation and routing with the packaged skill

| Run | How it was called | Orchestrator loaded? | Routing | Status claimed |
|---|---|---|---|---|
| P1 | "Review the dashboard…" (installed plugin) | ✅ auto | — (4-turn probe) | — |
| P2 | `/uiux-orchestrator:uiux-orchestrator` FAQ abrupt | ✅ | — (3-turn probe) | — |
| P3 | `/uiux-orchestrator` accessibility review | ✅ | — (3-turn probe) | — |
| E1 | "Plan name cut off… Fix it." | ❌, fixed directly | — | — |
| E2 | "Review the dashboard…" | ✅ auto | built-in rubric; **skipped the installed `impeccable/critique`** as "heavy for a 53-line screen" | Passed with limitations |
| E2b | same prompt, after the rule fix | ❌, reviewed directly | — | — |
| E2c | same prompt, after the rule fix | ❌, chose `design:design-critique` | — | — |
| E3a | `/uiux-orchestrator` + same prompt | ✅ | `impeccable/critique` with its A/B sub-agents | Passed with limitations |
| E3b | `/uiux-orchestrator` + same prompt | ✅ | `impeccable/critique` with its A/B sub-agents | Passed with limitations |

All read-only runs left the source unchanged (hash-verified for E2–E3b). Every "Passed with
limitations" stated that nothing was rendered: the harness did not approve a dev server.

### Findings

1. **Routing deviation (E2), fixed.** For a review request, `ux-critique` is the deliverable, so
   the decision engine presumes the default-on specialist. The agent skipped it with a cost
   argument the "not a reason" table already covers in general terms. A specific row was added:
   "heavy for such a small screen / it spawns sub-agents" when the slot is central.
   - **Re-test:** E3a and E3b both routed to `impeccable/critique` and ran its sub-agents.
   - **Caveat:** two runs, forced with the slash command, because the automatic runs after the fix
     did not load the skill.
2. **Automatic activation is not reliable when similar skills are installed.**
   - The review prompt loaded the orchestrator in 3 of 5 runs: T03 in the triggering test, P1 and
     E2. In the other two, the agent reviewed directly once and chose `design:design-critique`
     once.
   - The docs now recommend `/uiux-orchestrator` when the orchestrated process is wanted. They no
     longer imply that activation is guaranteed.
   - The description was not changed. Changing it needs a fresh triggering test, and winning
     against a skill the user installed for exactly this job is not always the right result.
3. **Small bug fixes go direct (E1).** This matches T04 in the triggering test and is acceptable:
   the fast path would do the same. The E1 fix itself was the correct root-cause change, the same
   one as R3.

## 3. v1.1.0: plugin dependencies, routing with namespaced skills

The plugin was installed from GitHub with
`claude plugin install uiux-orchestrator --marketplace grayxcviii/uiux-orchestrator`. All 6
dependencies were installed and enabled, and sessions saw 14 plugin skills, for example
`impeccable:impeccable` and `emil-kowalski-motion:animate`. The author's standalone
`~/.claude/skills/impeccable` was moved aside first to avoid a duplicate.

| Run | Prompt (`/uiux-orchestrator …`) | Expected | Skill calls | Files changed |
|---|---|---|---|---|
| R1 | Review the dashboard page and find UX problems. Do not modify the code. | Impeccable critique | `impeccable:impeccable critique src/pages/Dashboard.tsx`, plus its Assessment A sub-agent | 0 ✅ |
| R2 | The FAQ on the Help page opens and closes abruptly. Make it feel smooth. | Emil `animate` | `emil-kowalski-motion:animate` | 1 (`Help.tsx`) ✅ |
| R3 | On the pricing page the plan name 'Professional Annual' is cut off on small phones. Fix it. | Fast path, no skill | none | 1 (`Pricing.tsx`) ✅ |

The `plugin:skill` names resolved correctly in all three runs (n = 1 each).
