# UIUX Orchestrator architecture

A coding agent executes the orchestration instructions, invokes installed skills and gathers
actual outputs. The Markdown core defines decisions and boundaries; the bundled Python checker
validates the resulting execution record. It is not an autonomous runtime or proof that a skill
was actually executed.

## Fixed stages, compatible providers

```mermaid
flowchart TD
    U[User brief] --> I[Inspect product, project and platform]
    I --> D[Design direction / Style Library record, at most one question]
    D --> F[Research and UX foundation / UUPM evidence, then Impeccable shape UX plan]
    F --> C[Concept reasoning / bounded frontend-design or platform-compatible alternative]
    C --> A[Final art direction / one visual driver, Taste when eligible]
    A --> S[Finalize design system / reconcile foundation and final visuals]
    S --> P[Components and media / component contract, project and platform reuse, then library specialists]
    P --> M[Motion design / primary motion owner per platform, choreography]
    M --> B[Implementation / driver and platform-specific expertise]
    B --> V[Validation / build, interactions, observed renders]
    V --> R1[UX and design review]
    V --> R2[Technical and accessibility review]
    V --> R3[Motion review when motion ships]
    R1 --> G{Requirements and gates met?}
    R2 --> G
    R3 --> G
    G -- No --> FIX[Route findings to the responsible stage]
    FIX --> C
    FIX --> A
    FIX --> S
    FIX --> B
    G -- Yes --> CHECK[Execution-record check]
    CHECK --> REPORT[Report executed roles, outputs, evidence and limits]
```

The diagram shows full creative work: a new surface or Redesign/Replace. Existing-system screens,
supplied designs, review-only work and exact local fixes retain their scoped workflows. A fixed
responsibility does not require an incompatible skill: web-only frontend-design/Taste are not
forced onto iOS, Android, React Native or Flutter.

## Creative refinement inside an existing system

Breakthrough ambition also applies to Refresh, polish and component/interaction improvements
whenever design judgment is delegated. The scoped creative cycle keeps the same ambition at
every size and scales the number of specialist activations:

| Size | Cycle |
|---|---|
| Small (one component) | `inspect baseline → one scoped specialist weighs 2–3 approaches and owns the move → implement → matching before/after validation + self-check` |
| Medium (screen/flow) | `inspect baseline → concept → constrained visual/interaction direction → implement → before/after validation → UX/design review → refine` |
| Large | `… → specialist audit → concept → direction → implement → validation → UX/design + technical review → refine` |

An exact correction routes no specialist.

The frontend concept adapter can serve compatible web refinement inside a governing system;
a scoped visual specialist realizes the chosen move without becoming a replacement driver.
Reuse inspected product/system constraints. Reviewers identify what is distinct and why it
benefits this product/task; generic cosmetic changes do not satisfy an open creative brief.
This scoped cycle does not manufacture a ten-stage full-design record. Exact fixes and supplied
designs keep their fidelity requirements; read-only reviews provide recommendations, not edits.

## Responsibilities and authority

| Stage id | Required output | Preferred owner or routing rule |
|---|---|---|
| `inspect` | Project/platform facts, commands, asset/tool and skill inventory | Orchestrator inspects actual sources. |
| `foundation` | Evidence, product/UX analysis, patterns, hierarchy, states and provisional guidelines | In order: UUPM search (research evidence) → Impeccable shape (UX plan) → Impeccable onboard or a targeted UUPM query for gaps. UUPM style/palette results stay provisional. |
| `concept` | Alternatives, chosen experience concept, narrative/structure and rationale | frontend-design in bounded `design-reasoning` mode on suitable web tasks; compatible concept specialist elsewhere. |
| `direction` | Final palette, typography, composition, imagery/materials, identity and responsive direction, inside the design direction record | One visual driver. Taste is first choice for eligible marketing/product/shop websites. |
| `system` | Final semantic tokens and component/state conventions, actual code locations and contrast checks | Create: the driver if it owns the system, else Expo design-system or shadcn; record afterwards with Impeccable document (never counts as creation). |
| `components` | Reuse/source decisions, real media, rights and gaps | Component contracts from `references/component-intelligence.md`; project/platform components first; shadcn/Magic UI on React or suitable asset/component expertise for unresolved gaps. |
| `motion` | Purpose, behavior, timing, interruption, reduced-motion path and implementation plan | Primary by platform: Emil animate (web), animate-expo (React Native), platform APIs (native); specialized skills when the task matches; Emil choreograph for groups. Static only on user request. |
| `implement` | Working code consistent with accepted decisions | Driver plus scoped platform specialists. |
| `validate` | Actual static/build/interaction/render evidence | Project tooling, compatible device skills and bundled tools. |
| `review` | Separate UX/design, technical/accessibility and (when motion ships) motion assessments with findings and verdicts | Impeccable critique/audit, Emil improve-animations or compatible evaluators, separate activations and independent contexts when available. |

Foundation palette/type/system suggestions are hypotheses. Concept reasoning chooses the
experience approach; it does not finalize the visual system. Art direction then owns final
visual choices within user/project constraints. Finalize the design system **after** this step,
reconciling its inputs from both foundation and art direction.

When findings invalidate an upstream decision, revise that owner's handoff and recheck affected
downstream outputs. Do not restart unrelated stages or let a reviewer silently impose new taste.

## Design direction decision

Before routing creative work, the orchestrator decides the design direction once
([core/direction.md](../skills/uiux-orchestrator/core/direction.md)). The agent turns the brief
into a context record (product, page, goal, audience, personality, positioning, UX mode,
content, platform, explicit preferences), each value marked explicit, inferred, default or
unknown. `scripts/direction.mjs` ranks the Style Library (`registry/styles.json`, 13 styles in
four families) against it and returns one record: mode, confidence, assumptions, primary, at
most one secondary, functional directions per extra surface, treatments, constraints and an
optional clarification question.

The record is the single source of truth for style family, ambition, color posture and motion
level. UUPM supplies evidence, concept reasoning works inside the record, and the visual driver
authors the concrete direction contract (palette values, type, composition) without re-choosing
the style. Main design decisions:

- **Semantic extraction, deterministic scoring.** The model maps meaning to a fixed vocabulary;
  the script applies weighted compatibility rules. Results are reproducible and testable, and
  the agent does not load the whole library.
- **Relative scores, coarse matches.** Fit levels are strong, ok, neutral or conflict, not
  fine-grained percentages, because finer numbers would imply a precision the inputs lack.
- **Ask only when it changes the outcome.** A question is raised only if unknown audience or
  personality could move the primary to a style of another family on a brand-expressive surface,
  and never when the user delegated, named a style, a brand governs or the run is
  non-interactive.
- **Coherence over high scores.** A secondary must be a pairing the primary lists; functional
  directions reuse the primary and secondary first and inherit their tokens; at most three styles.
- **Backward compatible.** With too little context the library default is the previous built-in
  direction: bold, premium monochrome.

## A bounded concept adapter, not two full drivers

The registry still describes frontend-design as a driver for its full workflow. It additionally
declares `specialist_slots: [design-reasoning]` and a `scoped_brief` controlled by this orchestrator.
With that explicit receipt mode, execute the real skill's planning and review-against-brief work,
return the concept artifact and stop before implementation. Taste or the chosen visual driver
then executes its own creative process using that brief.

This is not an upstream command named `design-reasoning`. Reading the skill alone does not count.
Without the mode, frontend-design is subject to the normal single-driver rule. Its bounded
receipt cannot cover final art direction, implementation or prove a full driver execution.
See the installed [adapter contract](../skills/uiux-orchestrator/core/adapters.md).

## Records and enforcement

Execution record schema 2 requires the ten stages above, accepted outputs, successful activation
receipts, capability coverage, evidence and explicit `inputs` to earlier handoffs. In particular,
`concept` consumes `foundation`, `direction` consumes `concept`, and `system` consumes both
`foundation` and final `direction`. The two reviews receive the foundation, concept, direction,
system and validation evidence. The full input matrix is in the orchestration contract §2 and is
enforced by `check-orchestration.py`.

`routing` records driver eligibility separately from installation: web marketing considers Taste
before fallback, checks installed alternate Node binaries through `probe-runtime.py`, and cites
an actual user/project constraint when excluding a driver for brief fit. A self-invented 3D
requirement is not such a constraint. Explicit binary invocation does not change environment
defaults or need another permission solely because PATH resolves an older runtime.

`visual_review` links to the UX/design activation and records the nine visual-craft dimensions
as observations with rendered evidence. Boolean workflow gates and technical scores cannot
substitute for these judgments. Negative user feedback reopens the old pass until fixes have a
new rendered review; it does not require a universal user-approval gate. Older schema-2 records
need those missing assessments, not fabricated positive fields.

```bash
python3 -I skills/uiux-orchestrator/scripts/check-orchestration.py /path/to/record.json
```

Schema 1 records must be reevaluated/migrated, not merely relabeled: a formerly combined UX and
visual direction does not establish that the new foundation and concept roles actually ran.
The checker rejects missing phases/inputs, wrong ownership, incomplete activation records,
incompatible platforms, bounded-mode takeover, unjustified marketing-driver skips and missing or
failed visual assessments. Genuine specialist unavailability or declared
sequential review lowers the status ceiling; unmet requirements block completion.

The checker cannot authenticate fabricated evidence, establish actual chronology or judge
beauty. Tool logs, observed renders and independent review remain necessary. Passing automated
record, installer or routing tests is not a measured UI-quality improvement.
