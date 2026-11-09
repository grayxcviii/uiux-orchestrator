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
| `ux` | Users, task, hierarchy, states, flow | ux-analysis, ux-copy | UX record |
| `direction` | Visual direction for the surface | visual-direction, typography, color, layout | direction record |
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

## 2. Decide which slots get a specialist

For each slot of the kept steps, in this order:

1. **Outcome test.** Would a specialist give a different, better result than the project's
   existing truth plus the built-in fallback? *No — the project already answers it* (tokens,
   component, known cause) → project truth. *No — built-in is enough* → built-in. *Yes* → route (§3).
2. **Default-on presumption.** If the slot's shortlist has an available, compatible candidate with
   `priority: recommended` and `value_if_missing: high`, presume *Yes* — unless one of these holds:
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
| "It costs extra steps" | Cost is weighed against quality; default-on entries were chosen because they pay off. |
| "Small task" when the task is a review or the user asked for that judgment | The specialist's output is the deliverable. |
| "Heavy for such a small screen / it spawns sub-agents" when the slot is central | `cost: heavy` is weighed only for non-central slots. If sub-agents are unavailable, run the skill's sequential path. |

Typical results: Small 0–1 routed slots (a review routes its evaluator); Medium 1–3; Large 2–5.
More than 5 means the plan is probably over-engineered — re-run the outcome test.

**Accessibility audit decision (record yes/no + reason):** yes for accessibility intents, reviews
that include accessibility, new screens and redesigns on Medium+; otherwise the floors in
`core/execution-policy.md` are checked by the built-in pass.

## 3. Slot index and routing

Candidates are listed in **preference order**. Incompatible ones drop out (step 1 below), so one
row serves every platform. `(user)` = user-invoked only; `(complement)` = joins the pick, never
replaces it; `(bundle)` = several skills that count as one pick.

| Slot | Candidates, in preference order | Built-in fallback |
|---|---|---|
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
3. **Role fit** — drivers only through §4.
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
it does not `own`. A driver never refines a design system it does not own.

| Situation (first match wins) | Driver |
|---|---|
| An existing design system governs the surface: refinement, Redesign/Refresh, a new screen inside the system | none |
| New marketing/company website (Persuade mode); Node ≥ 22 and a Chrome are available; the user accepts its kit and house rules; the brand doesn't conflict with them | `taste/design-taste-frontend` |
| New product or app surface, a new visual world, or Redesign/Replace | `impeccable/new-work` |
| A single new web page or small surface with no governing system, when `impeccable/new-work` is unavailable or out of proportion | `anthropic/frontend-design` |
| App UI greenfield and no driver above is available | `uupm/design-system` |
| Otherwise | none — built-in direction from `references/visual-design.md` and the platform file |

A driver that must write its own context files into the project (Impeccable's PRODUCT.md, Taste's
kit) needs one permission line in the question batch. If nobody can answer, take the next row.

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

Start from the entry's `brief`, then state what is already decided:

```text
Task slice: <the one slot>          Target: <files/screen>
Platform/stack: <from profile>      Must keep: <tokens, components, decisions already made>
Out of scope: <everything else>     Return: <the artifact you need>
```

Merge a driver's own interview questions into the orchestrator's single question batch. If a
skill insists on steps outside the slice (writing context files, copying a kit, rerunning
discovery), run only what the slice needs and note what was skipped; if it cannot work without
them, use the built-in fallback for that slot.

## 7. Execution mode

| Size / risk | Mode id | How |
|---|---|---|
| Small or Medium, not high risk | `single` | One agent; self-check against the workflow gate. Parallelize only independent read-only work. Read-only reviews are always `single`. |
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
a11y_audit: yes | no — reason
reviewer: <evaluator id or built-in, and mode>
mode: single | multi-agent | sequential-review
validation:
  levels: [L1, L2, L4]                        # from SKILL.md evidence levels
  tools: [npm run build, scripts/ui-check.mjs at 390/768/1280 light+dark]
done_when: the workflow gate, adapted to this task
```

Keep this plan in working context. Show the concise summary from SKILL.md when applicable;
show the full plan only when asked. Fast-path tasks bypass this engine entirely.
