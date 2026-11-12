# Full-design profile — stages, foundation and drivers

Load this file for full creative work (a new surface without a governing design system, or Redesign/Replace) and whenever a
driver is a candidate. A new screen inside an established system is scoped (see
[design.md](../workflows/design.md)). Scoped workflows do not need it.

**Full creative work** requires research/foundation → concept
reasoning → final art direction → finalized design system → component/media sourcing → motion
decision → implementation → validation →
UX/design review **and** technical/accessibility review → fixes and rechecks. A driver can perform
several stages only with separate accepted outputs; its name never substitutes for missing work.
Keep execution receipts and handoffs as defined in [orchestration.md](orchestration.md); completion requires the [record checker](execution-record.md) as well as the UI workflow's evidence gates.

Stage owners are listed in [§1](#1-required-roles-and-outputs);
who decides what, and what advisors may not overrule, is in [Ownership by stage](decision-engine.md#ownership-by-stage)
(implementation goes to stack-specific owners); driver order, Taste first for suitable marketing
sites, is in [decision-engine §4](decision-engine.md#4-drivers). Read [adapters.md](adapters.md)
before invoking a driver entry in bounded specialist mode.

## 1. Required roles and outputs

For a new surface without a governing design system or Redesign/Replace, use the `full-design` profile. Keep all the following
stages, in order. Reuse can satisfy a stage only after its source has been inspected and accepted.

| Stage | Required capability | Owner candidates (route by platform and registry) | Accepted output |
|---|---|---|---|
| `inspect` | Project intelligence | Orchestrator, actual source/tool inspection | Platform, commands, constraints, skill inventory, asset/render tooling. |
| `foundation` | Research and UX (`research-foundation`, `ux-analysis`) | In order: UUPM search owns research evidence; Impeccable shape owns the UX plan, using that evidence; gaps go to Impeccable onboard (first-run, empty states, activation) or a targeted UUPM re-query. See [full-design §2](full-design.md#2-foundation-ownership). | Product evidence, patterns, audience, goal, hierarchy, flows/states, constraints; source-backed recommendations distinguished from assumptions. UUPM style/palette suggestions are provisional industry references and anti-patterns, never the final palette. |
| `concept` | Design reasoning (`design-reasoning`) | frontend-design in bounded mode on web; Impeccable shape or compatible alternative elsewhere (a separate activation from its foundation work, with its own 2–3 alternatives) | Distinct concept alternatives, chosen experience/narrative, rationale, information architecture and acceptance criteria. No final palette/token authority. |
| `direction` | Final art direction (`visual-direction`) | One eligible driver: Taste, Impeccable new-work, frontend-design, UUPM design-system; platform specialist when appropriate | Concrete visual direction consuming the chosen concept: palette, type, composition, materials/media, identity and responsive treatment. One final visual owner. |
| `system` | Design system (`design-system`) | Create: the driver if it owns `design-system`, else `expo/design-system` (Expo) or `shadcn/ui` (React on shadcn); record afterwards: Impeccable document (never counts as creation) | Final tokens/components reconciled with foundation constraints and approved art direction; variants/states, code locations and contrast evidence. Preliminary research tokens are not final. |
| `components` | Component/media sourcing (`component-reference`) | Contracts from [component-intelligence.md](../references/component-intelligence.md); project → platform components; shadcn/Magic UI on React or another compatible specialist for gaps | Reuse/source decisions, actual assets and rights; remaining asset gaps. |
| `motion` | Motion decision/build (`motion-build`) | Primary by platform: Emil animate (web), animate-expo (RN/Expo), platform APIs (native); specialized skills when the task matches; Emil choreograph when the motion design includes a complex multi-group sequence | Purpose, implementation, interruption/reduced-motion behavior and evidence; or an explicit static decision when no motion is required. |
| `implement` | Integration | Driver and scoped specialists, coordinated by orchestrator | Working code following accepted foundation/concept/art-direction/system decisions, states and deviations. |
| `validate` | Render/functional validation (`visual-validation`) | Existing project tooling, compatible device specialist, bundled tools | Actual static/build/interaction/render evidence at required sizes/states. |
| `review` | UX/design (`ux-critique`) **and** technical/accessibility (`tech-audit`), plus `motion-review` when `motion_required` | Separate suitable reviewer activations, e.g. Impeccable critique and audit, Emil improve-animations for motion, or another compatible evaluator | Independent assessments against the original brief, handoffs, implementation and observed renders; located findings and verdicts. |

Who owns each decision, and what advisors may not overrule, is summarized in
[decision-engine §3, Ownership by stage](decision-engine.md#ownership-by-stage).

These are responsibilities, not a request to run every installed skill. One driver can own
several capabilities, but must deliver each stage's concrete output. Ownership is limited to
registry `owns`; the explicit bounded-mode exception in [adapters.md](adapters.md) lets frontend-design
serve concept reasoning without becoming a second driver. Outside that mode, normal driver rules
apply. E.g. Taste does not automatically cover UX analysis, a separate system handoff,
motion engineering or review. Route uncovered roles. A document command records/normalizes the
implemented token/component system; it cannot satisfy design-system creation. Concept and art
direction are separate activations even when frontend-design serves both (bounded concept
first, then the driver run).

If the user delegated decisions, explore alternatives inside the UX/concept work, choose with
rationale and continue. Only a requested exploration/selection workflow adds a choice gate.
Existing authorization must still cover high-risk actions; delegated art direction does not
authorize unrelated destructive changes, new dependencies or external publication.
Native/Operate surfaces retain platform patterns; do not force a marketing driver onto them.
Supplied designs and screens inside an established system use verified specification/system
reuse under their scoped workflows. Exact local fixes and specified small components retain the
fast path. They do not require a new concept; a whole surface never qualifies for that shortcut.
Open-ended improvements/Refresh, even Small, use the creative-refinement branch of
[improvement.md](../workflows/improvement.md), scaled by its size table (Refresh: [redesign.md](../workflows/redesign.md)).
Reuse the inspected foundation/system rather than fabricate full-design stage work. An existing system forbids an unauthorized replacement driver, not creative
specialist execution within its constraints. Exact supplied fixes remain scoped.

## 2. Foundation ownership

The `foundation` stage runs in this order:

1. **Research foundation: UUPM search (primary).** Product type, UX guidelines, design patterns,
   industry style references and anti-patterns, stack-specific recommendations, each with its
   source; assumptions and gaps labeled.
2. **UX analysis: Impeccable shape (primary),** consuming that evidence. Target users, main
   tasks, information hierarchy, user flows, states and edge cases, success criteria.
3. **Gap filling, only for what shape left open:** Impeccable onboard for first-run flows, empty
   states and activation; a targeted UUPM re-query for one specific guideline or pattern.

| Skill | Owns | Must not |
|---|---|---|
| `uupm/search` | Research evidence, guidelines, patterns, stack facts | Decide the final UX flow; set the final palette, type or design system (its style/palette results are evidence for the [direction record](direction.md) and provisional references for the art-direction owner; they never override the record, and the AI-generated signature lists still apply) |
| `impeccable/shape` | UX plan: flows, information architecture, states, context discovery | Replace specialized lookups (charts, fonts, stack guidance) |
| `impeccable/onboard` | First-run flows, empty states, activation | Repeat UUPM research or redo shape's overall UX plan |

Exception: one UUPM activation may satisfy both research foundation and UX analysis only when
its output actually contains every UX analysis output (users, tasks, hierarchy, flows, states)
**and** Impeccable shape is unavailable or the task is Small. On Medium+ and full-design work
with shape available, shape performs UX analysis. A research output never counts as completed
UX analysis by default.

## 3. Coordinate a driver's phases

Execute up to the driver's planning/token checkpoint, accept the relevant handoffs, call the
uncovered specialists, then resume its build/check steps. Preserve the driver's design decisions
and mandatory process. Preparing token files, assets and prototypes required by concept/system
work is allowed before full UI integration.

For Taste 2.5, brief/copy/section plan and deal/token steps (1–4) precede build (5): execute
those steps with the accepted foundation and concept brief, accept its art direction, inspect the generated system with
the routed system specialist, source remaining components/media and resolve requested motion
engineering before resuming build/check/report (5–7). Additional motion work must respect Taste's
required motion/check rules. Other drivers use their actual documented boundaries. If an
integration cannot expose required outputs before dependent work, select a compatible staged
driver or report the limitation; do not invent retrospective handoffs after building.

## 4. Drivers

The driver table is in [decision-engine §4](decision-engine.md#4-drivers); the first eligible match wins.

Route from the **original user brief and inspected project**, before inventing palette, effects
or media requirements. A self-proposed 3D scene or parallax effect is not a user constraint that
can be used to exclude a photo-led driver. An explicitly selected concept or an existing brand
does constrain routing; record its provenance when it rules a driver out.

For web marketing, record Taste's eligibility even when another driver is chosen. Verify its
actual installed instructions and Node runtimes, not just the registry summary or PATH version.
Use the [runtime probe](skill-registry.md#availability-detection); a compatible alternate binary
counts without installing anything or changing shell defaults. An eligible Taste must execute
unless the user explicitly chose another driver. A genuine brief conflict, missing prerequisite,
excluded skill or unauthorized side effect is a valid recorded exclusion, not an invitation to
force Taste on every surface. Necessary local kit files inside an authorized new surface do not
by themselves require another permission question.

For eligible marketing, product-launch and shop websites, Taste is the first-choice driver,
including requests for distinctive or non-template design. If it is installed and compatible,
activate its actual pipeline; naming it in a plan or borrowing its aesthetic advice is not use.
Skipping it requires a concrete eligibility, brief-fit or permission reason, recorded in the
plan. The agent's ability to build a page itself is not a reason to bypass the driver.

A driver's necessary local assets/context inside the requested new surface may already be
authorized by the build task. Check scope and existing authorization before asking. Ask once
only for genuinely unauthorized writes, dependencies or incompatible house rules. If a required
action remains unauthorized, record it and try the next eligible driver; never hide the reason.

The selected driver **authors** the [direction contract](../references/visual-design.md#direction-contract-before-implementation)
before UI implementation. Give it the original brief, references, scope, governing brand rules
and technical constraints. Supply the accepted foundation and concept brief, plus the color and
motion postures and the AI-generated signature lists as constraints. Leave final palette,
typography, composition and signature details to that driver through its own creative process
inside those constraints; the orchestrator does not preselect them.
Preserve its resulting visual decisions during implementation and independent review, subject
to user requirements and accessibility floors. For driverless creative refinement, the compatible
scoped visual/interaction specialist authors that contract. Built-in authorship is allowed only
after relevant specialist alternatives are checked and unavailable. The contract records the
chosen design; it is not a second house style imposed
on the driver.

**Independent review of a driven surface** uses a different evaluator than the driver: prefer
another skill (e.g. `vercel/web-design-guidelines`); another command of the driver's skill counts
only when run in a fresh context.

Roles: `specialist` answers one scoped question or produces one artifact; `reviewer` evaluates and
does not edit unless a fix step asks; references are read, never run.

A selected **driver** receives the whole surface and
its owned stages (§4), including its required creative, asset-selection and validation process.
Do not apply the slice shortcut below to strip a driver's pipeline. If a necessary step is
incompatible or unauthorized, resolve that condition or select the next eligible driver and
report the fallback; do not label a hand-built substitute as a Taste-driven result.
