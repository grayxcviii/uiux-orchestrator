# Registry schema (contributors)

The installed skill reads `skills/uiux-orchestrator/registry/skills.yaml`; agents get a compact
field glossary in `core/skill-registry.md`. This file holds the full schema and the procedure for
adding skills. It is not installed with the skill.

## Entry schema

Providers group shared facts; skills inherit provider fields unless they override them.

```yaml
providers:
  - provider: emil                         # short key used in ids
    source: https://github.com/emilkowalski/skills
    verified_version: "c8a7962"            # version string or commit
    verified_on: 2026-11-06
    install_hint: "npx skills add emilkowalski/skills"   # shown to user, never run
    skills:
      - id: emil/animate                   # unique, provider-qualified
        names: [animate, "emil:animate"]   # every invocation name seen in the wild
        equivalent_to: []                  # ids with the same content (load only one)
        complements: []                    # ids that may join this skill in the same slot
        kind: skill | command | tool       # command = sub-command of a multi-command skill
        role: driver | specialist | reviewer
        invocation: model | user           # user = disable-model-invocation; never auto-run
        slots: [motion-build]              # capability slots it can fill
        authority: {motion: high}          # per dimension: high | medium | low
        platforms: [web]                   # web | react-native | ios | android | flutter | any
        frameworks: [any]                  # or a list; "any" within the platforms
        capabilities: [...]                # what it verifiably does
        use_when: [...]
        avoid_when: [...]                  # any match eliminates it
        requires: [...]                    # HARD prerequisites only; a miss eliminates the candidate
                                           # (soft caveats go in limitations)
        required_inputs: [...]             # what to put in the handoff brief
        expected_outputs: [...]
        specialist_slots: []               # orchestrator-defined bounded roles, e.g. design-reasoning
        scoped_brief: "..."                # bounded adapter instructions; not an upstream command
        owns: [...]                        # drivers only: slots it fills itself
        delegates_to: [...]                # ids its own instructions call
        side_effects: [...]                # files written, network, downloads, kit copies
        limitations: [...]
        cost: light | medium | heavy       # context/time to run it properly (default light);
                                           # heavy = multi-agent, large references, or long pipelines
        priority: recommended | optional
        value_if_missing: high | low       # high → mention to user when absent and relevant
        notes: "..."                       # mapping between user wording and the skill's vocabulary
        brief: "..."                       # what to pass when activating it and what to take back
                                           # (decision-engine §6 adds task-specific values)
```

A driver entry may execute as a specialist only for a declared `specialist_slots` capability
with the matching activation `mode`. Normal platform and scope checks still apply. Read
`core/adapters.md` for the contract; no implicit second-driver or arbitrary mode is permitted.
These fields are orchestrator policy, separate from verified upstream capabilities.

`references:` holds knowledge sources (`kind: reference`): `id`, `url`, `platforms`, `topics`,
`checked` (date or `no`). References are read, never "run".

## Adding a skill

1. Read the skill's actual SKILL.md (not only its README) and record facts you verified.
2. Add an entry under its provider (create the provider if needed) with `verified_version` and
   `verified_on`.
3. Add its id to the candidate list of each slot it fills in SKILL.md's slot table. If it fills a
   new kind of capability, add a slot row (with a built-in fallback).
4. If it overlaps an existing skill, add the ownership rule to `skills/uiux-orchestrator/core/conflict-resolution.md`.
5. Add at least one routing scenario to `tests/` where it **must** be chosen and one where it
   **must not** be.

The decision engine needs no change for steps 1–5.
