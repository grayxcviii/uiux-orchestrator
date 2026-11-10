# How UIUX Orchestrator works

The README covers install and usage. This page covers the pipeline, platforms, integrations,
built-in tools, evidence and development.

## Pipeline

```text
request → intake → project intelligence → decision engine → execute (handoffs) → validate → report
```

Small, low-risk fixes and one fully specified component inside an existing design system can
use `local inspection → implementation → validation`. This skips the decision engine and external
specialists. Unknown design choices, broader effects or a critical-path interaction return to
the normal pipeline. The shortcut keeps the applicable build, visual and interaction checks.

- **Intake** classifies:
  - the intent(s): design, redesign, improvement, animation, review, bug fix, responsive, design
    system, accessibility, exploration;
  - the scope and whether edits are allowed;
  - size and risk.
- **Project intelligence** detects:
  - platform and stack: web frameworks, Expo or RN CLI and the New Architecture, SwiftUI/UIKit,
    Compose/Views, Flutter;
  - tokens, components and motion libraries;
  - commands, and the visual tooling available.
- **Decision engine** assigns every required capability to a compatible skill, an executed
  driver's owned output, verified project reuse or an evidenced fallback. Available suitable
  specialists must execute; personal confidence and cost alone do not permit bypass.
  - Ties go to a preference-ordered slot index, which `validate.py` keeps in sync with the
    registry.
  - It allows at most one *driver* (a skill that runs a whole design pipeline) per surface, chosen
    from a single driver table.
- **Execution receipts and handoffs** link actual activations to accepted outputs before
  dependent stages. Full creative work requires research/foundation, concept reasoning, final
  art direction, finalized system, component/media sourcing, motion decision, implementation,
  validation and separate UX/technical reviews.
- **Execution-record checking** rejects missing roles, unsupported ownership, failed activations
  counted as use and undeclared self-review. It checks record consistency, not receipt truth or
  beauty. See the [execution contract](../skills/uiux-orchestrator/core/orchestration.md).
- **Quality gates** require evidence at levels L0–L5: code, static, build, functional, visual,
  device.

The [architecture](architecture.md) fixes stage responsibilities while routing compatible
providers. In web marketing work, UUPM informs the foundation, frontend-design's bounded
`design-reasoning` mode produces the concept brief, and Taste can retain sole final visual
ownership. The system is finalized after that direction. This bounded mode is local orchestration
policy, not an upstream command or a second full frontend-design build.

Open-ended refinements also run concept reasoning, scoped visual/interaction expertise and
before/after comparison, scaled by size. A Small component uses one scoped specialist and a
self-check. Medium adds a UX/design reviewer, and Large adds technical review. Existing tokens
constrain the idea rather than eliminating it. Exact fixes and supplied designs retain their scoped path.

## Supported platforms

Routing and workflows cover: React, Next.js, Vue, Angular, Svelte, plain HTML/CSS/JS · React Native
(Expo and CLI) · iOS (SwiftUI, UIKit) · Android (Jetpack Compose, Views) · Flutter.

Each platform has a guideline file (`skills/uiux-orchestrator/platforms/`). All of them use the same
section order, and each starts with a **version gates** table checked against official sources on
2026-11-06. Examples:
- Expo SDK 58 / RN 0.88, where the New Architecture is mandatory;
- Reanimated 4 and Gesture Handler 3;
- iOS 27 and Liquid Glass;
- Android 17, M3 Expressive at RC, edge-to-edge and predictive back;
- Flutter 3.47 with the `material_ui` package split;
- the Baseline status of new CSS features.

What has been run on real projects, and what has not, is listed under [Evidence](#evidence).

## Skill integrations (optional)

Installing external skills is optional; executing a compatible installed owner of a required
role is mandatory. With no suitable specialists, the orchestrator can use explicit built-in
fallbacks, but full creative work is reported as limited rather than fully specialist-orchestrated.
Each specialist project documents its own installation.

| Skill | Used for |
|---|---|
| [Anthropic frontend-design](https://github.com/anthropics/skills) | Concept reasoning in a bounded `design-reasoning` mode (full creative web work, and creative refinement inside an existing system). Also a lighter visual-direction driver for a single new web page or small surface with no governing system |
| [Impeccable](https://github.com/pbakaus/impeccable) | Targeted commands: critique, audit (web and native), polish, typeset, layout, colorize, adapt, harden, clarify, document. new-work only for new or fully replaced surfaces |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Research & foundation for full creative work (product/pattern evidence, audience, flows/states, hierarchy) and targeted data-backed answers (`--domain`, `--stack`). `--design-system` only when a project has no system |
| [Taste](https://github.com/Leonxlnx/taste-skill) (`design-taste-frontend` 2.5) | Preferred eligible driver for marketing/company **websites**; actual house rules must fit the brief and kit writes must be in scope. An installed alternate Node ≥22 counts; probe it before exclusion |
| [Lucian UX/UI](https://github.com/Seokwoooo/lucian-uxui) | Interactive component references on web. On native, specs only (no code) |
| [GSAP skills](https://github.com/greensock/gsap-skills) | Web only, after the animation workflow has picked GSAP |
| [Emil Kowalski skills](https://github.com/emilkowalski/skills) | Motion decisions and builds (`animate`, `animate-expo`, `choreograph`), audits (`improve-animations`), discovery, removal, web performance |
| [Expo](https://github.com/expo/skills), [Software Mansion](https://github.com/software-mansion-labs/skills), [Callstack](https://github.com/callstackincubator/agent-skills), [Android](https://github.com/android/skills), [Vercel](https://github.com/vercel-labs/agent-skills), [SwiftUI Pro](https://github.com/twostraws/SwiftUI-Agent-Skill) | Platform-specific UI, motion APIs, mobile device validation, adaptive layouts, web guideline reviews |

What was verified about each skill (versions, real command names, prerequisites, side effects) is
in [docs/phase-0-research.md](phase-0-research.md) and
[`registry/skills.yaml`](../skills/uiux-orchestrator/registry/skills.yaml).

The orchestrator never installs these for you. If a missing skill would make a real difference to
a task, it says so in one line.

## Built-in validation tools

These are bundled in `skills/uiux-orchestrator/scripts/` and have zero dependencies. The agent runs
them itself; you can also run them by hand:

```bash
S=~/uiux-orchestrator/skills/uiux-orchestrator/scripts
node $S/ui-check.mjs http://localhost:5173/ --widths 390,768,1280 --schemes light,dark
node $S/motion-trace.mjs http://localhost:5173/#/help --target "[role=region]" --trigger "button[aria-expanded]"
python3 -I $S/check-orchestration.py /path/to/temporary-record.json
python3 -I $S/probe-runtime.py --min-node 22
```

- **`probe-runtime`** records observed Node binaries and versions, including installed runtime-manager
  alternatives. It returns a compatible absolute path without installing Node or changing PATH,
  a shell or global defaults. Preserve the JSON when excluding a driver on runtime grounds.

- **`ui-check`** saves screenshots and reports:
  - horizontal overflow, with the offending element;
  - clipped text;
  - text contrast below WCAG AA;
  - targets under 24 px;
  - unnamed controls and placeholder-only fields;
  - pointer-styled elements that a keyboard can't reach;
  - console errors.

  It exits non-zero when the page fails to load.
- **`motion-trace`** samples an animation frame by frame: when it starts and settles, its start and
  end values, and frame gaps. It can also save slowed frames.

Pass `--help` for all options. How they were verified:
[tests/results/2026-11-06-scripts.md](../tests/results/2026-11-06-scripts.md).

## Evidence

All numbers below were measured on this repository's scenarios with one model (Opus 5.5). Details
and caveats are in [tests/benchmark.md](../tests/benchmark.md).

- **Routing:**
  - On 8 held-out scenarios it picked the right skills 100% of the time, against 50% without it.
    It made no unnecessary skill calls, against 47% without it.
  - On the full set of 39 + 8 scenarios, run on v0.6, two regressions were found, fixed and
    re-verified.
- **Triggering** (real install):
  - It activated on its own for 4 of 6 UI prompts. The other two went to a closer-fitting skill
    or to a direct fix.
  - It activated on 0 of 4 non-UI prompts.
- **Detection:** reading real project files, it got the platform, framework and New Architecture
  flag right in 16 of 16 runs.
- **Execution:**
  - Web: real edits, builds and screenshots.
  - iOS: native frame evidence via agent-device on an Expo app.
  - Codex CLI: a review and a fix.
- **Not yet exercised:**
  - Flutter execution;
  - Android native execution;
  - a real multi-agent run of a Large task;
  - scenarios written by people outside the project.

## Repository layout

```text
.claude-plugin/               Claude Code plugin + marketplace manifests
skills/uiux-orchestrator/     the skill (the only part an agent loads)
  SKILL.md                    hub: pipeline, fast path, workflows, rules, report format
  core/                       intake, project intelligence, decision engine, skill registry,
                              conflict resolution, handoff, execution policy, quality gates
  workflows/                  design, redesign, improvement, animation, review, bug-fix,
                              design-system, accessibility
  platforms/                  web, react-native, ios, android, flutter (version gates + 12 topics)
  references/                 visual-design, motion-principles, accessibility (WCAG 2.2 AA)
  registry/skills.yaml        verified metadata for external skills + reference sources
  scripts/                    ui-check, motion-trace (zero-dependency CDP)
docs/                         usage examples, research, registry schema
tests/                        scenarios, harness, fixtures, results
scripts/validate.py           spec + consistency checks (Python 3 stdlib)
```

## Development

```bash
python3 scripts/validate.py
```

This checks:
- the frontmatter against the Agent Skills spec, and the SKILL.md length;
- every relative link;
- every skill or reference id against the registry;
- the slot index against the registry, in both directions;
- script syntax;
- that the plugin, marketplace and SKILL.md versions agree.

CI runs the same check on every push.

Routing benchmark: `python3 scripts/score_routing.py <results.json> [--key tests/scenarios-heldout.json]`.
The harness is described in [tests/harness/README.md](../tests/harness/README.md). Planned targets are
kept separate from measured numbers ([tests/README.md](../tests/README.md)).

Adding a skill means adding a registry entry; the decision engine does not change. See
[CONTRIBUTING.md](../CONTRIBUTING.md).

## History

| Phase | Scope | Version |
|---|---|---|
| 0 | Research, capability matrix, architecture | — |
| 1 | Core orchestrator | 0.1.0 |
| 2 | Platform files and references | 0.2.0 |
| 3 | Integrations exercised on sample projects ([results](../tests/results/2026-11-06-phase3-execution.md)) | 0.3.0 |
| 4 | Scenarios, routing harness, measured metrics ([benchmark](../tests/benchmark.md)) | 0.4.0–0.5.0 |
| — | Pre-release review and fixes ([review](../tests/results/2026-11-06-prerelease-review.md)) | 0.6.0 |
| 5 | Packaging: Claude Code plugin, install docs, usage examples, CI | 1.0.0 |

See [CHANGELOG.md](../CHANGELOG.md).
