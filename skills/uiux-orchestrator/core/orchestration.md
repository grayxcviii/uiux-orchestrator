# Orchestration contract — select, execute, hand off, review

This contract governs skill execution. The decision engine chooses the owner; the workflow
sets scope and evidence; this file determines when a stage actually counts as done.

## 1. Full-design stages

For a new surface without a governing design system or Redesign/Replace, the ten required stages, their owners and accepted
outputs are in [full-design.md](full-design.md). Scoped workflows name their own steps.

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

Full-design work ends with the execution-record check in
[execution-record.md](execution-record.md). Scoped workflows use their own gate.
