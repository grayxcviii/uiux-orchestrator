# Decision engine

Input: Intake record + Project Profile. Output: an **Execution Plan** (§8) that records all twelve
decisions: workflow, investigation depth, which slots get a specialist (UX analysis, visual
direction, design system, components, motion, accessibility audit…), platform guidance, the
independent reviewer, validation tools, and when the task is done.

The engine reasons about capability slots. Skill facts live in `registry/skills.yaml`. The slot
index (§3) is the routing table; `scripts/validate.py` keeps it in sync with the registry.

## 1. Compose the workflow

Workflows are built from a shared step library. Each workflow file says which steps it uses, in
which order, and when a step may be skipped.

| Step | Purpose | Slots it may need | Handoff |
|---|---|---|---|
| `inspect` | Read the current implementation of the target | — | profile |
| `audit-current` | Find UX/visual/technical problems in what exists | ux-critique, tech-audit, platform-conformance | review record |
| `foundation` | Research, product context, UX and provisional guidelines | research-foundation, ux-analysis | foundation record |
| `concept` | Experience concepts, alternatives, reasoning | design-reasoning | concept brief |
| `ux` | Scoped UX decisions outside full creative work | ux-analysis, ux-copy | UX record |
| `direction` | Final art direction consuming the concept | visual-direction, typography, color, layout | direction record |
| `system` | Token/component decisions | design-system | system record |
| `components` | Source each needed part (incl. charts) | component-reference, data-visualization, navigation | component record |
| `motion` | Motion discovery/design | motion-discovery, motion-build | motion record |
| `implement` | Write the code | motion-build, responsive, hardening | implementation record |
| `validate` | Evidence per quality gates | visual-validation | evidence |
| `review` | Independent check of the result | ux-critique, tech-audit, platform-conformance, code-review, motion-review | review record |
| `refine` | Fix findings, re-verify | polish + any slot a finding needs | refinement record |
| `report` | Final report | — | — |

1. Base workflow = the primary intent's workflow (`core/intake.md`). Load that one file.
2. For each secondary intent, add only that workflow's *distinct* steps (marked in each file).
3. Drop steps whose skip condition holds; record dropped steps in one line.

Investigation depth (record it): **shallow** — target file and what it imports (Small);
**standard** — the full Project Profile (Medium); **deep** — profile plus neighbouring screens, a
design-system inventory and usage counts of everything shared that will change (Large/high risk).

## 2. Assign and execute required capabilities

**Which slots are required.**

- **Full-design** ([orchestration.md §1](orchestration.md#1-required-roles-and-outputs)): every
  slot of every stage is required. There is no size discount.
- **Scoped workflows** (improvement, Refresh, animation, bug-fix, design-system Extend/Document,
  accessibility, review): a slot is required when the workflow step names it for this size, or
  when it passes the outcome test below.

For every required slot, resolve ownership in this order:

1. **Verified reuse:** a supplied specification or inspected project system completely settles
   this decision. Record the exact source, what was checked and what is reused. A vague brand
   description, an empty starter or a similar-looking component does not settle it.
   Existing tokens settle token values, not all design judgment. For open-ended refinement,
   still assign `design-reasoning` and the appropriate visual/interaction capability; do not use
   system reuse to waive creative work on composition, hierarchy, presentation or feedback.
2. **Accepted execution coverage:** a compatible specialist already executed this capability,
   or the chosen driver explicitly owns it in the registry. Require its actual accepted output
   for this slot. One UUPM activation may supply both foundation and UX outputs when it genuinely
   performs both; do not run another specialist merely to duplicate accepted work. Ownership
   or selecting a skill is never permission to skip the output.
3. **Specialist:** search the slot's candidates and installed skills. Execute the first suitable,
   compatible available candidate using §3. `priority` orders candidates; `value_if_missing`
   controls install hints. Neither makes an available owner optional.
4. **Evidenced fallback:** only after checking relevant alternatives and recording why each is
   missing, incompatible, excluded, user-invoked-only or blocked by an unmet prerequisite.
   Execute the built-in method, label degraded coverage and apply the orchestration status ceiling.

An invocation that failed does not fill the slot. Follow the activation failure protocol in
[skill-registry.md](skill-registry.md) and [orchestration.md](orchestration.md), then route again.
Never proceed to a dependent phase with a merely planned activation or unaccepted handoff.

"I can do this", "built-in is enough", "the problems are obvious", time/token pressure,
`cost: heavy`, or a nominal limit on skill count do not justify bypassing a required owner.
Do not load redundant skills for a capability already executed and accepted. Full-design has no
maximum number of necessary roles; explain scope-based omissions instead of optimizing the count.

### Scoped workflows: outcome test and size

For a slot the scoped workflow does not already require:

1. **Outcome test.** Would a specialist give a different, better result than the project's
   existing truth plus the built-in fallback? *No — the project already answers it* (tokens,
   component, known cause) → project truth. *No — built-in is enough* → built-in. *Yes* → route (§3).
2. **Default-on presumption.** If the slot's shortlist has an available, compatible candidate with
   `priority: recommended` and `value_if_missing: high`, presume *Yes*, unless one of these holds:
   - the task is Small and is not itself a review/audit or an explicit request for the judgment
     that skill provides (then the plain outcome test and the workflow's Small instructions rule);
   - the entry is `cost: heavy` and the slot is not central (central = the slot's output is the
     deliverable, e.g. a review request, or the evidence base of the workflow, e.g. a redesign's
     audit-current);
   - a concrete, task-specific reason is recorded (e.g. "the user supplied the exact spec", "the
     change is one class on one element", "read-only task and the skill must write files").
   An entry without `cost` is `light`.

| Not a reason to skip a default-on specialist | Why |
|---|---|
| "The problems are obvious" | A specialist finds the non-obvious ones; that is its value. |
| "I can do this myself" / "built-in is good enough" | True for every capable agent; it would make every specialist unused. |
| "Small task" when the task is a review or the user asked for that judgment | The specialist's output is the deliverable. |
| "Heavy for such a small screen / it spawns sub-agents" when the slot is central | `cost: heavy` is weighed only for non-central slots. If sub-agents are unavailable, run the skill's sequential path. |

Typical scoped results:

- **Exact correction**, at any size: 0 routed slots, so use the fast path when it qualifies.
- **Small open-ended refinement:** 1 scoped specialist.
- **Medium:** 1–3 routed slots.
- **Large:** 2–5 routed slots.
- **Review:** routes its evaluator.

More than 5 outside full-design means the plan is probably over-engineered, so re-run the
outcome test.

**Accessibility audit decision:** required for accessibility intents, applicable review scope,
new surfaces and redesigns. Full creative work always includes the technical/accessibility
review as well as the UX/design review. Scoped fixes still meet accessibility floors.

## 3. Slot index and routing

Candidates are listed in **preference order**. Incompatible ones drop out (step 1 below), so one
row serves every platform. `(user)` = user-invoked only; `(complement)` = joins the pick, never
replaces it; `(bundle)` = several skills that count as one pick.

| Slot | Candidates, in preference order | Built-in fallback |
|---|---|---|
| research-foundation | `uupm/search`, `impeccable/shape` | project/product evidence + explicitly labeled research gaps |
| design-reasoning | `anthropic/frontend-design` in bounded `design-reasoning` mode, `impeccable/shape` | concept alternatives and rationale from the accepted foundation |
| ux-analysis | `impeccable/shape`, `impeccable/onboard`, `uupm/search` | intake + workflow heuristics |
| visual-direction | drivers via §4: `taste/design-taste-frontend`, `impeccable/new-work`, `anthropic/frontend-design`, `uupm/design-system` · specialists: `expo/native-ui`, `impeccable/tone` | project tokens + platform conventions |
| design-system | `impeccable/document`, `expo/design-system`, `impeccable/new-work`, `uupm/design-system` | `workflows/design-system.md` |
| component-reference | `lucian/uxui`, `expo/ui`, `emil/ask-sonner`, `emil/pick-ui-library` (user) | project → platform/UI-library components |
| typography | `impeccable/typeset`, `uupm/search` | tokens + platform type scale |
| color | `impeccable/colorize`, `uupm/search` | color roles in `references/visual-design.md` |
| layout | `impeccable/layout`, `uupm/search` | `references/visual-design.md` §2 |
| ux-copy | `impeccable/clarify` | plain, specific labels; errors say what happened and what to do |
| hardening | `impeccable/harden`, `emil/break-ui` | states list in `core/execution-policy.md` |
| responsive | `android/adaptive`, `android/edge-to-edge`, `impeccable/adapt`, `emil/mobile-native` | platform breakpoints / size classes |
| navigation | `expo/router`, `callstack/react-navigation` — only when navigation is in scope | keep existing navigation |
| design-exploration | `impeccable/live`, `emil/prototype` (user) | 2–3 direction records |
| data-visualization | `uupm/search` | `references/visual-design.md` §8 |
| motion-discovery | `emil/find-animation-opportunities`, `emil/animation-vocabulary` | purpose test in `workflows/animation.md` |
| motion-build | `emil/animate`, `emil/animate-expo` (= `expo/expo-animation`, load one), `android/navigation-event`, `vercel/react-view-transitions`, `gsap/*` (bundle; only when GSAP is the chosen tool), `impeccable/animate` (only inside an Impeccable-driven build), `emil/apple-design`, `emil/design-eng` · complements: `emil/choreograph`, `swm/react-native-best-practices` | platform animation APIs + `references/motion-principles.md` |
| motion-review | `emil/improve-animations`, `emil/remove-animations`, `emil/review-animations` (user) | motion checklist in `workflows/animation.md` |
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

## 4. Drivers

A driver runs a whole pipeline for one surface (direction → build → checks) with its own files
and rules. **At most one driver per surface per task**; choose it first, then route only the slots
it does not `own`. A driver never refines a design system it does not own. Pass the intake's
visual intent into selection: eliminate a candidate whose house rules conflict with the user's
requested palette, effects, composition or motion, even if its general use-case matches. Accepting
a kit does not waive the visual brief. Unavailable or incompatible candidates fall through.

| Situation (first eligible match wins) | Driver |
|---|---|
| An existing design system governs the surface: refinement, Redesign/Refresh, a new screen inside the system | none |
| New marketing/company website (Persuade mode); Node ≥ 22 and a Chrome are available; required kit writes are authorized and actual house rules fit the brief | `taste/design-taste-frontend` |
| New product or app surface, a new visual world, or Redesign/Replace | `impeccable/new-work` |
| A single new web page or small surface with no governing system, when `impeccable/new-work` is unavailable or out of proportion | `anthropic/frontend-design` |
| App UI greenfield and no driver above is available | `uupm/design-system` |
| Otherwise | none — built-in direction from `references/visual-design.md` and the platform file |

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
and technical constraints. Supply the accepted foundation and concept brief. Leave final palette, typography, composition
and signature details to that driver through its own creative process; the orchestrator does not preselect them.
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

## 5. Load progressively

| Layer | What | When |
|---|---|---|
| 1 | The slot index (§3) + the registry entries of shortlisted ids | During routing |
| 2 | The chosen skill's SKILL.md (or the one command reference of a multi-command skill) | When its slot executes |
| 3 | That skill's references, scripts, data | Only when its own instructions require them for this task |

Never load two skills for one slot "to compare". Never re-read a file already in context unless it
changed. Prefer a skill's targeted command over its full pipeline.

## 6. Handoff brief to a specialist

This one-slot brief is for specialists, including a registered bounded adapter invoked with
its explicit mode and `scoped_brief`. In concept mode, frontend-design supplies reasoning and
provisional suggestions only; the visual driver remains the sole art-direction authority.

A selected **driver** receives the whole surface and
its owned stages (§4), including its required creative, asset-selection and validation process.
Do not apply the slice shortcut below to strip a driver's pipeline. If a necessary step is
incompatible or unauthorized, resolve that condition or select the next eligible driver and
report the fallback; do not label a hand-built substitute as a Taste-driven result.

Start from the entry's `brief`, then state what is already decided:

```text
Task slice: <the one slot>          Target: <files/screen>
Platform/stack: <from profile>      Must keep: <tokens, components, decisions already made>
Out of scope: <everything else>     Return: <the artifact you need>
```

Merge a driver's own interview questions into the orchestrator's single question batch. If a
skill insists on steps outside the slice (writing context files, copying a kit, rerunning
discovery), run only what the slice needs and note what was skipped; if it cannot work without
them, record why it is incompatible with the slice and try the next compatible candidate.
Built-in fallback is allowed only after the alternative checks in orchestration.md.

## 7. Execution mode

| Size / risk | Mode id | How |
|---|---|---|
| Small or Medium, not high risk | `single` | Execute routed specialists and collect handoffs. Full creative work requires separate review activations; use fresh reviewer context when available, otherwise declare `sequential-review` and its limitation. Scoped self-checks follow their own gate. |
| Large or high risk, subagents available | `multi-agent` | Design/UX → implementation → **independent reviewer**, who gets requirements, handoff records and the diff — not the implementer's conclusions — and is told to look for failures. |
| Large or high risk, no subagents | `sequential-review` | Same stages in one agent. Before reviewing, write the gate checklist, then re-read the diff and screenshots against it as if someone else wrote them. |

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
