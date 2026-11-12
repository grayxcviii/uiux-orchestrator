# Contributing

Thanks for helping. This project is Markdown plus one YAML registry. Keep it small and accurate.

## Principles

- **Verify, don't assume.** Every registry claim about an external skill must come from that skill's
  own `SKILL.md` or reference files at a recorded version. Put the version and date in
  `verified_version` and `verified_on`.
- **No duplicate content.** Each fact lives in one file. Link to it, don't copy it.
- **Progressive disclosure.** `SKILL.md` stays a hub (< 500 lines; the target is far less). Detail goes
  in one-level-deep files that the hub links directly.
- **No fake results.** Benchmarks and test results must come from real runs, with the date, agent and
  model recorded. Targets are labelled as targets.

## Adding an external skill

1. Read the skill's actual `SKILL.md` and the reference files it relies on.
2. Add an entry to `skills/uiux-orchestrator/registry/skills.yaml` (schema:
   `docs/registry-schema.md`). Fill in `requires`, `avoid_when`, `side_effects` and `invocation`
   carefully. These are the fields agents can't guess from a skill's description.
3. Add its id to the right row(s) of the slot index (`core/decision-engine.md` §3). Rows are in
   preference order; `validate.py` checks the index against the registry in both directions.
4. If it overlaps an existing skill, add a standing ruling to `core/conflict-resolution.md`.
5. Add at least one scenario where it must be chosen and one where it must not (see `tests/`).
6. Run `python3 scripts/validate.py`.

## Adding a platform

Add the detection signatures to `core/project-intelligence.md`, the motion tool ladder row to
`workflows/animation.md`, and a platform file under `platforms/` (Phase 2 format). Then add
scenarios.

## Supporting another agent

Add its skill directories to the availability list in `core/skill-registry.md`. List the agent as
supported (README badge and the table in `docs/usage.md`) only after a recorded test run.

## Releasing

1. Bump the version in three places, which must agree: `metadata.version` in `SKILL.md`, and
   `version` in `.claude-plugin/plugin.json` and in `.claude-plugin/marketplace.json`.
2. Add a `CHANGELOG.md` entry.
3. Run `python3 scripts/validate.py`. It checks that the three versions agree.
4. Tag the release `vX.Y.Z` and push the tag. Plugin users get it with
   `claude plugin marketplace update uiux-orchestrator`, then
   `claude plugin update uiux-orchestrator@uiux-orchestrator`.

## Updating the bundled dependencies

The Claude Code plugin pins each dependency in `.claude-plugin/marketplace.json` to a commit `sha`.
To move one forward:
1. Re-verify the skill's facts in `registry/skills.yaml` against that commit.
2. Update the `sha`.
3. Run `claude plugin validate .claude-plugin/marketplace.json`.
4. Run `python3 scripts/check_pins.py`. CI also runs it every Monday and fails if an upstream
   commit disappears.
5. Install locally with `claude plugin install uiux-orchestrator --marketplace .` and check
   `claude plugin details <name>@uiux-orchestrator`: only the intended skills should load.

## Media and large files

Git keeps every committed file in the history forever, so the repository only holds media the
README needs. Images, GIFs or videos over about 1 MB go to a GitHub Release (or another CDN) and
the README links to them. Demo apps, recordings and marketing material stay in the ignored
`examples/` and `marketing/` folders. Do not re-encode or replace an existing committed asset just
to shrink it: the old version stays in the history and the repository grows.

## Pull requests

- One topic per PR.
- Run `python3 scripts/validate.py`. It must print `OK`.
- If routing behaviour changes, include a scenario run (before/after) in `tests/results/`.
- Rewording or moving a rule: `npm test` checks that every rule in `tests/rule-inventory.json`
  is still present and every skill file stays reachable from SKILL.md.
