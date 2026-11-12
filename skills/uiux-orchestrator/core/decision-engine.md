# Decision engine

Input: Intake record + Project Profile (+ the design direction record when design judgment is
open). Output: the **Execution Plan** (§8). Skill facts live in `registry/skills.yaml`; the slot
index (§3) is the routing table, kept in sync with the registry by `scripts/validate.py`.

## 1. Compose the workflow

Workflows are built from these steps; each workflow file lists its steps, order and skip rules.

| Step | Purpose | Slots it may need |
|---|---|---|
| `inspect` | Read the current implementation of the target | — |
| `audit-current` | Find UX/visual/technical problems in what exists | ux-critique, tech-audit, platform-conformance |
| `foundation` | Research, product context, UX and provisional guidelines | research-foundation, ux-analysis |
| `concept` | Experience concepts, alternatives, reasoning | design-reasoning |
| `ux` | Scoped UX decisions outside full creative work | ux-analysis, ux-copy |
| `direction` | Final art direction consuming the concept | visual-direction, typography, color, layout |
| `system` | Token/component decisions | design-system |
| `components` | Source each needed part (incl. charts) | component-reference, data-visualization, navigation |
| `motion` | Motion discovery/design | motion-discovery, motion-build |
| `implement` | Write the code | motion-build, responsive, hardening |
| `validate` | Evidence per quality gates | visual-validation |
| `review` | Independent check of the result | ux-critique, tech-audit, platform-conformance, code-review, motion-review |
| `refine` | Fix findings, re-verify | polish + any slot a finding needs |
| `report` | Final report | — |

Base workflow = the primary intent's workflow; each secondary intent adds only its *distinct*
steps; drop steps whose skip condition holds (one line each). Investigation depth: **shallow**
(target file and its imports, Small), **standard** (full Project Profile, Medium), **deep**
(profile, neighbouring screens, design-system inventory and usage counts of every shared thing
that will change; Large/high risk).

## 2. Assign and execute required capabilities

**Required slots.** Full-design ([full-design.md §1](full-design.md#1-required-roles-and-outputs)):
every slot of every stage, with no size discount. Scoped workflows (improvement, Refresh,
animation, bug-fix, design-system Extend/Document, accessibility, review): the slots the workflow
step names for this size, plus any that pass the outcome test below.

Resolve each required slot in this order:

1. **Verified reuse:** a supplied specification or inspected project system completely settles
   the decision. Record the source, what was checked and what is reused. A vague brand
   description, an empty starter or a similar-looking component does not settle it.
   Existing tokens settle token values, not all design judgment: open-ended refinement still
   needs concept alternatives (inline at Small/Medium inside a system, see `design-reasoning` in §3)
   and the visual/interaction capability.
2. **Accepted execution coverage:** a specialist already executed this capability, or the chosen
   driver owns it in the registry (`owns`). Require its accepted output for this slot; never run
   a second specialist to duplicate it. Owning a slot is never permission to skip its output.
3. **Specialist:** execute the first suitable, compatible, available candidate from §3.
   `priority` orders candidates and `value_if_missing` controls install hints; neither makes an
   available owner optional.
4. **Evidenced fallback:** only after recording why each relevant alternative is missing,
   incompatible, excluded, user-invoked-only or blocked by a prerequisite. Label degraded
   coverage and apply the orchestration status ceiling.

An invocation that failed does not fill the slot: follow the failure protocol in
[orchestration.md](orchestration.md) and route again. Never start a dependent phase on a merely
planned activation or an unaccepted handoff. "I can do this", "built-in is enough", "the problems
are obvious", time/token pressure, `cost: heavy` or a skill-count limit never justify bypassing a
required owner. Full-design has no maximum number of roles.

### Scoped workflows: outcome test and size

For a slot the scoped workflow does not already require:

1. **Outcome test.** Would a specialist give a better result than project truth plus the built-in
   fallback? No, the project answers it (tokens, component, known cause) → project truth. No,
   built-in is enough → built-in. Yes → route (§3).
2. **Default-on presumption.** A shortlisted, available, compatible candidate with
   `priority: recommended` and `value_if_missing: high` presumes *Yes*, unless: the task is Small
   and neither a review/audit nor an explicit request for that judgment; the entry is
   `cost: heavy` and the slot is not central (its output is the deliverable or the workflow's
   evidence base, e.g. a redesign's audit-current); or a concrete task reason is recorded ("the
   user supplied the exact spec", "one class on one element", "read-only task and the skill must
   write files"). No `cost` means `light`. "The problems are obvious", "I can do this myself",
   "Small task" for a requested review, or "heavy" for a central slot are not reasons.

Typical results: exact correction → 0 routed slots (fast path when it qualifies); Small
open-ended refinement → 1 scoped specialist; Medium → 1–3; Large → 2–5; a review routes its
evaluator. More than 5 outside full-design is probably over-engineered: re-run the outcome test.

**Accessibility audit:** required for accessibility intents, applicable reviews, new surfaces and
redesigns; full creative work always includes the technical/accessibility review. Scoped fixes
still meet accessibility floors.

## 3. Slot index and routing

Candidates are listed in **preference order**. Incompatible ones drop out (step 1 below), so one
row serves every platform. `(user)` = user-invoked only; `(complement)` = joins the pick, never
replaces it; `(bundle)` = several skills that count as one pick.

| Slot | Candidates, in preference order | Built-in fallback |
|---|---|---|
| research-foundation | `uupm/search` (primary), `impeccable/shape` | project/product evidence + explicitly labeled research gaps |
| design-reasoning | `anthropic/frontend-design` in bounded `design-reasoning` mode (web), `impeccable/shape` (other platforms) — its own activation, separate from foundation and art direction, for full-design, Redesign/Replace, Large scoped work and requested explorations. Inside an established system at Small or Medium size, the scoped visual specialist (built-in when none applies) weighs 2–3 approaches inline instead; no separate activation | concept alternatives and rationale from the accepted foundation |
| ux-analysis | `impeccable/shape` (primary) · gap filling: `impeccable/onboard` (first-run, empty states, activation), `uupm/search` (one targeted guideline/pattern) | intake + workflow heuristics |
| visual-direction | drivers via §4: `taste/design-taste-frontend`, `impeccable/new-work`, `anthropic/frontend-design`, `uupm/design-system` · specialists: `expo/native-ui`, `impeccable/tone` | project tokens + platform conventions |
| design-system | **create:** the selected driver when it owns `design-system` (`impeccable/new-work`, `uupm/design-system`), `expo/design-system` (Expo), `shadcn/ui` (React projects on shadcn) · **record after build:** `impeccable/document` (never counts as creation) | `workflows/design-system.md` |
| component-reference | Always first, not a fallback: the contract in `references/component-intelligence.md`, then project components, then platform components · specialists for remaining gaps: `shadcn/ui` (React), `magicui/components` (React motion moments, filtered), `expo/ui` (Expo), `emil/ask-sonner` (toasts), `emil/pick-ui-library` (user) | build from the contract with project tokens and primitives |
| typography | `impeccable/typeset`, `uupm/search` | tokens + platform type scale |
| color | `impeccable/colorize` (only when the user, brand or a chromatic direction record wants more color, or a functional accent is missing), `uupm/search` (provisional references) | the direction record's color posture (premium monochrome by default) and color roles in `references/visual-design.md` §4 |
| layout | `impeccable/layout`, `uupm/search` | `references/visual-design.md` §2 |
| ux-copy | `impeccable/clarify` | plain, specific labels; errors say what happened and what to do |
| hardening | `impeccable/harden`, `emil/break-ui` | states list in `core/execution-policy.md` |
| responsive | `android/adaptive`, `android/edge-to-edge`, `impeccable/adapt`, `emil/mobile-native` | platform breakpoints / size classes |
| navigation | `expo/router`, `callstack/react-navigation` — only when navigation is in scope | keep existing navigation |
| design-exploration | `impeccable/live`, `emil/prototype` (user) | 2–3 direction records |
| data-visualization | `uupm/search` | `references/visual-design.md` §8 |
| motion-discovery | `emil/find-animation-opportunities`, `emil/animation-vocabulary` | purpose test in `workflows/animation.md` |
| motion-build | **primary by platform:** `emil/animate` (web), `emil/animate-expo` (React Native/Expo; = `expo/expo-animation`, load one), platform animation APIs per `platforms/<platform>.md` §9 (iOS, Android, Flutter) · **specialized, when the task matches:** `vercel/react-view-transitions` (route/state swaps on React), `android/navigation-event` (predictive back), `gsap/*` (bundle; only when GSAP is the chosen tool), `magicui/components` (React, filtered component moments), `impeccable/animate` (only inside an Impeccable-driven build), `emil/apple-design`, `emil/design-eng` · **complements:** `emil/choreograph` (when the motion design includes a complex sequence: several groups, scroll-linked or multi-step interruptible choreography; not for ordinary state transitions or one staggered entrance, which the primary owner sets), `swm/react-native-best-practices` | platform animation APIs + `references/motion-principles.md` |
| motion-review | `emil/improve-animations` (surface/app motion audit), `emil/remove-animations` (over-animated UI), `emil/review-animations` (user) — required in full-design review when motion ships (the record checker enforces it), for Medium+ animation work, and for scoped work whose deliverable is motion or spans several flows. `improve-animations` fits app-wide or multi-flow audits; other scoped work that changes motion applies the motion checklist | motion checklist in `workflows/animation.md` + `scripts/motion-trace.mjs` |
| motion-performance | `emil/animation-performance`, `gsap/performance`, `emil/animate-expo` (its build sequence covers stutter on device), `swm/react-native-best-practices`, `android/compose-performance`, `impeccable/optimize` | platform profiler |
| ux-critique | `impeccable/critique` | rubric in `workflows/review.md` |
| tech-audit | `impeccable/audit`, `vercel/web-design-guidelines` | a11y/perf/responsive checks + `scripts/ui-check.mjs` |
| platform-conformance | `impeccable/critique` (native mode loads its iOS/Android platform guidance) | `platforms/<platform>.md` §1, §5–§7, §12 |
| code-review | `twostraws/swiftui-pro`, `emil/write-swift` | project lint + `platforms/<platform>.md` §10 |
| polish | `impeccable/polish`, `emil/design-eng` | "what to inspect" list in `core/quality-gates.md` |
| visual-validation | `callstack/agent-device` · project screenshot/visual tests first | `scripts/ui-check.mjs`, `scripts/motion-trace.mjs`, simulator/emulator CLIs |

Read only the shortlisted entries in `registry/skills.yaml` (search `id: <id>`, read ~25 lines and
the provider's `shared:` block). For each candidate, in row order:

1. **Compatibility** — the profile's platform family is in `platforms`; `frameworks` matches (missing
   = any); every hard `requires` holds (`core/skill-registry.md` defines ids and matching).
2. **Avoid-when** — any matching condition eliminates it.
3. **Role fit** — full drivers only through §4. A driver entry may serve a specialist slot only
   when that slot is in `specialist_slots` and execution declares the matching bounded mode
   under [adapters.md](adapters.md). This does not grant visual ownership or implementation authority.
4. **Invocation** — `invocation: user` → recommend it in the report; continue down the row.
5. **Availability** — `core/skill-registry.md`. Missing → note it if `value_if_missing: high`; continue.
6. **Pick** the first survivor. Then add at most one `complements` entry of the pick when the
   complement's `use_when` matches, or the whole bundle the provider `brief` defines.

No survivor → built-in fallback; record why in one line.

**Installed but unregistered skills.** Consider one when no registered candidate survives, or when
its description is a clearly closer fit than the registered survivor (e.g. a dedicated
data-visualization skill vs. a general design database) — then it takes the slot. Read its
SKILL.md first, check platform and prerequisites, use it as a specialist (never a driver), and say
in the report that it was unregistered. Skills the user or environment excluded are unavailable.

**Version drift.** If the installed version differs from `verified_version`, read the skill's
SKILL.md frontmatter and first section before trusting the entry.


### Ownership by stage

One owner per decision. Specialists may advise outside their row; they never overrule its owner.

| Decision | Owner | Advisors / gap fillers | Never |
|---|---|---|---|
| Research evidence | `uupm/search` | `impeccable/shape` when UUPM is unavailable | — |
| UX plan | `impeccable/shape` | `impeccable/onboard`, targeted `uupm/search` | A research output counted as UX analysis by default |
| Design direction: style family, ambition, color posture, motion level | Orchestrator via [direction.md](direction.md) (`scripts/direction.mjs`) | `uupm/search` evidence, `impeccable/shape` audience findings, the user's answer | Re-chosen by a driver or specialist; a named style replaced by ranking |
| Concept | `design-reasoning` owner (2–3 alternatives inside the direction record); inline in the scoped visual specialist for Small/Medium work inside an established system | — | In full-design: merged into the foundation or art-direction activation, even when the same skill later drives |
| Final palette, type, composition | The surface's driver, or the scoped visual specialist when no driver applies | `uupm/search`, `impeccable/colorize`, `impeccable/typeset` | Preselected as values by the orchestrator; chosen outside the direction record or its color posture |
| Design system (create) | Driver that owns `design-system`, else the first create candidate in the slot | `impeccable/document` records the result | `impeccable/document` alone counted as creation |
| Component choice and contract | `references/component-intelligence.md` | Project → platform → library specialists | A library default shipped without meeting the contract |
| Motion | Primary motion owner for the platform | Specialized motion skills, `emil/choreograph` | Motion skipped on a new surface without a user request for static |
| Review | Independent `ux-critique` + `tech-audit` (+ `motion-review` when motion ships in full-design, for Medium+ animation work, or when motion is the scoped deliverable) | `platform-conformance`, `code-review` | The driver or implementer reviewing its own work without a fresh context |

**Color posture is a constraint, not a palette.** Drivers and specialists choose the actual colors
inside it. The direction record sets it: the user's color direction, then the brand's, then the
selected style's posture (the premium monochrome posture of `references/visual-design.md` §4 for
monochrome styles and the library default). The AI-generated color signatures are excluded
unless the user or brand requires them. The same holds for the motion posture
(`references/motion-principles.md` §0). A driver whose house rules contradict the user's brief is
the wrong driver (§4); a driver's taste does not override the posture.

## 4. Drivers

A driver runs a whole pipeline for one surface (direction → build → checks) with its own files
and rules. **At most one driver per surface per task**; choose it first, then route only the slots
it does not `own`. A driver never refines a design system it does not own. Pass the intake's
visual intent and the direction record into selection: eliminate a candidate whose house rules
conflict with the record or the user's requested palette, effects, composition or motion, even if its general use-case matches. Accepting
a kit does not waive the visual brief. Unavailable or incompatible candidates fall through.

| Situation (first eligible match wins) | Driver |
|---|---|
| An existing design system governs the surface: refinement, Redesign/Refresh, a new screen inside the system | none |
| New marketing/company website (Persuade mode); Node ≥ 22 and a Chrome are available; required kit writes are authorized and actual house rules fit the brief | `taste/design-taste-frontend` |
| New product or app surface, a new visual world, or Redesign/Replace | `impeccable/new-work` |
| A single new web page or small surface with no governing system, when `impeccable/new-work` is unavailable or out of proportion | `anthropic/frontend-design` |
| App UI greenfield and no driver above is available | `uupm/design-system` |
| Otherwise | none — built-in direction from `references/visual-design.md` and the platform file |

Driver eligibility (brief fit, Taste for web marketing, runtime probes, authorization) and
how the driver authors the direction contract are in [full-design.md §4](full-design.md#4-drivers).

## 5. Load progressively

Load the slot index and the shortlisted registry entries while routing; the chosen skill's
SKILL.md (or its one command reference) when its slot executes; its own references, scripts and
data only when its instructions require them. Never load two skills for one slot "to compare",
never re-read an unchanged file, and prefer a skill's targeted command over its full pipeline.

## 6. Handoff brief to a specialist

For specialists, including a registered bounded adapter invoked with its explicit mode and
`scoped_brief` (in concept mode, frontend-design supplies reasoning and provisional suggestions
only). A selected **driver** follows [full-design.md §4](full-design.md#4-drivers) instead.
Start from the entry's `brief`, then state what is already decided:

```text
Task slice: <the one slot>          Target: <files/screen>
Platform/stack: <from profile>      Must keep: <tokens, components, decisions already made>
Direction: <record: mode, primary/secondary/functional, ambition, color posture, motion, treatments>
Out of scope: <everything else>     Return: <the artifact you need>
```

Merge a skill's own interview questions into the orchestrator's single question batch. If it
insists on steps outside the slice (context files, kits, rerunning discovery), run only what the
slice needs and note what was skipped; if it cannot work without them, record why and try the
next compatible candidate.

## 7. Execution mode

| Size / risk | Mode id | How |
|---|---|---|
| Small or Medium, not high risk | `single` | Execute routed specialists and collect handoffs. Full creative work still needs separate review activations: fresh reviewer context when available, else `sequential-review` with its limitation. |
| Large or high risk, subagents available | `multi-agent` | Design/UX → implementation → **independent reviewer**, given requirements, handoffs and the diff (not the implementer's conclusions) and told to look for failures. |
| Large or high risk, no subagents | `sequential-review` | Same stages in one agent: write the gate checklist first, then re-read the diff and screenshots against it as if someone else wrote them. |

Never spawn an agent only to increase the count of agents.

## 8. Execution Plan (output)

```yaml
workflow: [design, accessibility]
steps: [ordered step ids; skipped: ...]
investigation_depth: shallow | standard | deep
platform_guidance: platforms/<file>.md §0, §<sections used>      # or "unsupported: references only"
slots:
  - slot: visual-direction
    pick: impeccable/new-work | built-in | project truth
    why: one line
    not_picked: [{id: taste/design-taste-frontend, why: "app UI, not marketing"}]
driver: <id or none>
surface: marketing | operate | read | experience
driver_candidates: [eligibility, reason/evidence, original-brief constraint and runtime probe where relevant]
a11y_audit: yes | no — reason
reviewer: <evaluator id or built-in, and mode>
mode: single | multi-agent | sequential-review
validation:
  levels: [L1, L2, L4]                        # from SKILL.md evidence levels
  tools: [npm run build, scripts/ui-check.mjs at 390/768/1280 light+dark]
done_when: the workflow gate, adapted to this task
```

Link each routed slot to its activation receipt and accepted handoff using [orchestration.md](orchestration.md).
Keep this plan in working context. Show the concise summary from SKILL.md when applicable;
show the full plan only when asked. Fast-path tasks bypass this engine entirely.
