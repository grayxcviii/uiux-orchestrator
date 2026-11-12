# Design-to-code handoff

Every stage that makes decisions ends with a **Handoff record**. The next stage consumes it
instead of re-analysing. Keep records in the conversation (or, for Large tasks the user wants
persisted, in a file the user agrees to, e.g. `docs/ui-decisions/<task>.md`). Never write
handoff files into the project unasked.

## Record format (all stages)

```yaml
stage: visual-direction
input: what this stage received (previous record ids, profile, user constraints)
decisions:
  - what was decided, concretely (values, names, components) — not adjectives
constraints: what the next stage must not change
open: questions left for a later stage (or none)
next: the stage that consumes this
```

Every executed stage needs an accepted output before its dependent stage starts, including
Medium single-agent work. Keep records in working context; a final report written after the
implementation is not a substitute. Record activation/coverage and evidence using
[orchestration.md](orchestration.md). Verified reuse is a handoff decision, not a silent skip.
Every full-design stage also lists `inputs` referencing the prior accepted stage ids under
execution schema 2. Fast-path tasks retain their scoped workflow without creative-stage records.

## Stage contracts

| Stage | Must hand off |
|---|---|
| Foundation / product / UX analysis | Users and their main task on this surface; primary action; information hierarchy (what is first/second/third); required states (loading, empty, error, disabled, offline, permission); flows and entry/exit points; success criteria. |
| Concept reasoning | Concept alternatives, chosen experience/narrative, rationale, hierarchy/layout sketches, constraints and provisional visual suggestions; no final token authority. |
| Final art direction | Direction record reference (mode, primary/secondary/functional styles); design style in one line + mode (Operate/Persuade/Read/Experience); visual hierarchy rules; ambition level from the record (bold/confident/quiet + reason) and the decisive move; color direction (roles → OKLCH/wide-gamut tokens or new values: neutral ramp, temperature, accent and where it appears; confirmation that no AI-generated color signature is used); typography direction (families, scale steps used); component principles (density, radius, elevation, iconography); motion direction (signature moment, entrance choreography, transition/feedback tokens: durations, curves, springs; reduced-motion behavior), required for new surfaces and redesigns unless the user asked for static. |
| Final design system | References to foundation and final art-direction handoffs; reconciled token/component decisions and contrast evidence. Token changes (name → old → new) or "none"; new components and their variants/states; components reused as-is; where tokens live. |
| Component research | For each needed part: chosen source (project component / platform component / library registry item / built from the contract), the component-intelligence contract it meets, adaptation notes, rejected options in one line. |
| Implementation | Files changed; how each decision was applied; deviations from decisions with reason; states implemented; known gaps. |
| Spatial / 3D direction (when requested or chosen) | Focal subject and placement; depth/material/light treatment; medium and rationale (CSS / static asset / scene renderer); responsive framing; interactions; assets/rights; reduced-motion and failure fallback; measurable performance budget. See [spatial-design.md](../references/spatial-design.md). |
| Design review | Findings (severity, location, impact, fix); which decisions were checked; verdict. |
| Visual refinement | Fixes applied per finding; findings deferred with reason; evidence to re-verify. |

The visual-direction record also maps each requested aesthetic quality to concrete choices and
rendered acceptance observations using the [direction contract](../references/visual-design.md#direction-contract-before-implementation).
When a driver is selected, it makes these choices; the orchestrator supplies the user's brief,
project constraints, the ambition level, the color posture, the [AI-generated color signatures](../references/visual-design.md#ai-generated-color-signatures-avoid) and the [safe-default traps](../references/visual-design.md#safe-default-traps),
then passes the driver's resulting choices, including the decisive move, to downstream
specialists and reviewers so later stages keep it instead of quietly toning it down.
A coherent implementation of a direction that misses the user's visual brief still fails
review; correct that direction within the authorized
scope before refining small details.

Foundation and concept token ideas remain provisional. The art-direction owner selects final
visual choices; the system owner reconciles them with product/platform constraints. A correction
to an upstream decision invalidates affected downstream handoffs until they are rechecked.

## Rules

- **Implementation uses recorded decisions.** If implementation finds a decision unworkable
  (a token missing, a component cannot support a state), it records a deviation and the reason,
  then proceeds with the closest compliant option. It does not invent a new direction.
- **Review checks against records and requirements**, not against its own taste. It may reopen a
  decision only for a concrete defect (accessibility, platform violation, requirement miss, broken
  behavior) — see conflict-resolution rung 1–4.
- **Do not repeat analysis** whose record is still valid. Reopen it when its requirement, scope
  or project truth changes, or rendered evidence demonstrates that its decisions miss the
  explicit brief or quality gate. Keep the unaffected decisions.
- **Skipped scoped-workflow stages** produce no handoff. Full-design retains all required stage
  rows, including the explicit static/motion skip decision; dependent stages consume that decision.
