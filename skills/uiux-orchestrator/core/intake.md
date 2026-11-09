# Intake — intent, scope, complexity, risk

Produce a short **Intake record** before touching the project. Size and risk are provisional
until project intelligence confirms them (e.g. whether a component is shared); finalize them then.
Missing render tooling does not raise risk — it limits the validation status (quality-gates). Fill what the request states;
leave project-dependent fields for project intelligence to confirm.

```yaml
intents: [primary, secondary...]      # from the table below; order = priority
objective: one sentence, the user's real goal (not the literal ask)
expected_output: code change | review report | plan | design spec | prototype
scope: screens/components/flows named or implied; "everything else is out of scope"
mutation: allowed | read-only | plan-only          # "don't modify", "just review" → read-only
constraints: [explicit user constraints: brand, library, deadline, "consistent with existing"]
platform_hint: what the request says (confirmed later by project intelligence)
size: Small | Medium | Large                        # see complexity
risk: low | elevated | high                         # see risk
open_questions: [only blocking ones]
```

## Intents

Use these ids in records and reports: `new-ui-design`, `redesign`, `ui-improvement`,
`animation`, `ui-review`, `ui-bug-fix`, `responsive`, `design-system`, `accessibility`,
`ui-implementation`, `design-exploration`. They map to workflows: new-ui-design /
ui-implementation / design-exploration → design · redesign → redesign · ui-improvement /
responsive → improvement · animation → animation (a motion review or audit → animation's review
sub-type) · ui-review → review · ui-bug-fix → bug-fix · design-system → design-system ·
accessibility → accessibility.

| Intent | Signals in the request | Notes |
|---|---|---|
| New UI design | "design/build/create a new screen/page", empty target | Includes "implement this design" (Implement step only). |
| Redesign | "redesign", "revamp", "new look", "modernize" | Decide sub-type below — it changes everything. |
| UI improvement | "improve", "polish", "clean up", "make it feel better", "tighten" | Preserves identity and architecture. |
| Animation | "animate", "motion", "transition", "feels stiff/janky", "gesture" | Sub-type: discover, design, build, review, optimize, remove. |
| UI/UX review | "review", "audit", "critique", "what's wrong with" | Read-only unless the user also asks for fixes. |
| UI bug fix | "broken", "cut off", "overlaps", "wrong on <device>", a screenshot of a defect | Minimal scope. |
| Responsive / adaptive | "mobile", "tablet", "small screens", "landscape", "foldable", "breakpoints" | Often secondary to improvement or bug fix. |
| Design system | "tokens", "theme", "design system", "component library", "DESIGN.md" | Sub-type: document, extend, create. |
| Accessibility | "a11y", "screen reader", "contrast", "keyboard", "WCAG", "Dynamic Type", "TalkBack" | Can be review-only or fix. |
| Design exploration | "options", "variants", "explore directions", "show me alternatives" | Produces choices, not one answer. |

Multi-intent is normal: "redesign the profile screen and make it accessible" →
`[redesign, accessibility]`. The first intent picks the base workflow; others add their steps.

### Redesign sub-type (decide explicitly)

| Sub-type | Signals | Means |
|---|---|---|
| **Refresh** (default) | "consistent with the existing app", "keep our brand", scope is one screen/flow inside a larger app | New layout/hierarchy **inside** the current design system. Tokens and components stay. This is what Impeccable calls *refinement*. |
| **Replace** | "new brand", "completely new look", "start over", whole-product scope, user rejects the current look | New visual direction; design-system change is in scope and must be confirmed. |

When unclear, choose Refresh and say so in the start summary. Never escalate to Replace silently.

## Complexity (size)

Score each factor 0/1/2 and sum.

| Factor | 0 | 1 | 2 |
|---|---|---|---|
| Surface | 1 component | 1 screen | several screens / a flow |
| Design decisions | none (spec given / obvious) | some within system | new direction or system change |
| Motion | none | simple transitions | gesture-driven, choreographed or scroll-linked |
| Platform specifics | one platform, standard | platform-specific behavior | several platforms / adaptive layouts |
| Unknowns | cause/target clear | some investigation | requirements or cause unclear |

0–2 **Small** · 3–5 **Medium** · 6+ **Large**. Lines of code are not a factor. Reviews are sized by
surface only (1 screen = Small, a flow = Medium, the product = Large); they never take the fast path. A low size score alone does not qualify a task for it;
confirm the SKILL.md exclusions and, for a new component, an existing system plus a complete spec.

## Risk

Read-only reviews are low risk by default. For changes, raise to **elevated** for any one,
**high** for two or more, or for any starred item:

- Touches shared components, tokens or theme **beyond what the user asked to change** (changing
  the primary token because the user asked to change the primary color is in scope; changing it
  to fix one button is not).
- Changes navigation structure, routes, guards, navigator type, state management, or data flow.*
  (Adding a transition or page builder to an existing route is not a routing change.)
- Adds or upgrades a dependency, or needs a native rebuild (pods, Gradle, Expo prebuild).*
- Affects accessibility of a critical path (checkout, auth, onboarding).
- Large redesign of a live product.*

High-risk tasks require: a short plan the user **confirms** before editing (this counts as asking),
an independent review pass, and regression checks of everything sharing the touched components.

## When to ask

Ask only if **all** are true: the answer cannot be found in the project, a wrong guess would
waste significant work or break something, and no safe default exists. Otherwise pick the safe
default, state it in the start summary, and proceed.

| Usually ask | Never ask |
|---|---|
| Redesign Replace vs. Refresh when signals conflict on a large scope | Framework, styling, tokens, component library (read the project) |
| Adding a dependency or upgrading a library | Which file a screen lives in (search) |
| Destructive change to shared components | Preferred spacing/colors when tokens exist |
| Facts end users would read as true (company facts, prices, claims, testimonials) — ask once and meanwhile build with clearly marked placeholders | Whether to follow platform conventions (always) |

Ask once, batched, with a recommended default.
