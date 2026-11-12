# Design direction — context analysis, clarification, style selection

Decides **which design direction** a surface takes: the style family, its ambition, color
posture and motion level. It runs once per task, at the start of stage 3, whenever design
judgment is open (new UI, Redesign, Refresh, open-ended improvement). It does not run on the fast
path, for exact supplied fixes/designs, or for review-only requests (reviews judge the shipped
direction against its record or the brief).

The result, the **design direction record**, is the single source of truth for direction.
Drivers and specialists work inside it; none of them re-chooses the style. The driver still
authors the [direction contract](../references/visual-design.md#direction-contract-before-implementation):
actual palette values, type families, composition and signature details.

## 1. Context record

Extract one value list per dimension, using only terms from the library vocabulary
(`node <skill-dir>/scripts/direction.mjs --vocabulary`). Map meaning, not words: "streetwear"
→ personality `rebellious`, `bold`; "for kids" → audience `children`; "environmentally
conscious" → personality `natural`; "banking app" → product type `banking-fintech`, category
`finance`.

| Dimension | Field(s) | Notes |
|---|---|---|
| Product type, category | `product_type`, `category` | What is sold or done; the domain |
| Page / screen | `page_type` (→ `surface_mode` via the library), extra screens in `surfaces` | Each extra surface may get a functional direction |
| Business goal | `business_goal` | Conversion, discovery, trust, task efficiency… |
| Audience | `audience` | Never invent it |
| Brand personality, positioning | `personality`, `positioning` | Never invent them |
| UX requirements | `surface_mode`, `density` | Operate/Persuade/Read/Experience; data density |
| Content | `content` | Photography, data, long text, illustration… |
| Platform | `platform` | From project intelligence; adapts treatments, never decides identity alone |
| Explicit visual preference | `explicit_style`, `explicit_visual` (`color`, `motion`, `ambition`, `typography`…) | `explicit_style` only when the user names a style ("Swiss Grid", "brutalist"); adjectives such as dark, colorful or minimal go to `explicit_visual` or `personality`. `motion`: `static`, `quiet` or `expressive` set the level, other text becomes a treatment; `ambition`: `bold`, `confident` or `quiet` |
| Governing brand | `brand: { "governing": true }` | Project tokens, components or a brand guide that define identity |
| Interaction | `delegated`, `interactive` | "You decide" → `delegated: true`; non-interactive run → `interactive: false` |

Every dimension carries a `source`: `explicit` (the user or project states it), `inferred` (a
clear semantic implication of what was said), `default` (taken from a convention) or missing =
unknown. Keep known facts, reasonable assumptions and unknowns apart. Do not upgrade a guess to
explicit, and do not fill audience, personality or positioning just to avoid a question.

## 2. Run the engine

```bash
node <skill-dir>/scripts/direction.mjs --context '<context json>'   # or pipe the JSON on stdin
```

The script is deterministic and reads [registry/styles.json](../registry/styles.json). Keep the
input and output in working context; do not write process files. Without Node, apply the rules in
[direction-rules.md](../references/direction-rules.md) by hand with the library entries of the
candidates (search `"id": "<id>"`).

## 3. Modes and sufficiency

| Mode | When | Behavior |
|---|---|---|
| `explicit` | The user names a style | That style is primary; ranking never replaces it. Conflicts and bypassed exclusions become validation warnings to mitigate in treatments. Unknown or deferred names become `custom:<name>` directions described by the user |
| `brand` | A governing brand system exists | Brand identity, tokens and components win; the library supplies the closest family, functional directions and treatment hints. Ambition defaults to `confident` |
| `inferred` | Coverage ≥ 0.35 (known weight / 100) | Ranked selection with assumptions |
| `default` | Too little context | The best fit for the little that is known (usually surface mode and platform), ties broken by `default_order` (Bold Modern, Modern Minimal, Native Clean), with that style's posture. A Persuade surface with no context gets Bold Modern in premium monochrome, the previous built-in default; an app screen gets a quieter app style |

The engine then chooses one of: **proceed** (enough context), **proceed with assumptions**
(listed in the record and the start summary), or **ask one question**.

## 4. Clarification rule

Ask only when every condition holds:

1. Asking is allowed: interactive run, not delegated, no explicit style, no governing brand.
2. A decisive dimension is unknown: audience, or personality and positioning together.
3. The surface expresses the brand (Persuade, Experience or Read), or its mode is not yet known.
   Operate surfaces follow platform conventions, so missing personality rarely changes them.
4. Sensitivity: a contender from **another family** could overtake the leader. The contender
   must fit the known category (or product type) at least `ok`, score within `ask_gap` (20) of
   the leader, and beat it if the unknowns were favorable to it (its known score + the unknown
   weight exceeds the leader's known score + neutral unknowns by more than `flip_margin`).

Or, when the product, the audience and the personality are all unknown, coverage is below 0.35
and asking is allowed, ask what the product is and who it is for. A clear audience and
personality without a product ("a playful app for kids") is enough to decide, so no question.

The question is one sentence built from the competing directions' labels (the leader, the
contenders, then the closest relevant candidates; one option per label, at most four), with the
leader as the recommended default, e.g. "What kind of fashion brand is this: minimalist
everyday, luxury, bold and colorful or sustainable and natural?". An automotive landing page,
whose relevant candidates are all refined-neutral, gets no question. Merge it into intake's single
question batch. If nobody can answer, proceed with the default and state the assumption. After
the answer, update the context (`source: explicit`) and run the engine again.

## 5. Composition at a glance

The record has one **primary** (its typography and color are the identity), at most one
**secondary** (a listed pairing that lends layout, surface and imagery, only when brand
personality is known), **functional** directions per extra surface (reusing primary and
secondary first; Native Clean or Instrument for Operate and dense screens; at most three styles
in total), plus ambition, color posture and motion level. Accessibility floors and explicit user
requirements outrank every style treatment. Scoring weights, composition order, validation and
the style index are in [direction-rules.md](../references/direction-rules.md); read them only
when applying the engine by hand or extending the library.

## 6. The record and who consumes it

The engine output is the record: `design_decision` (mode, confidence, coverage), `context` with
sources, `unknown`, `assumptions`, `candidates`, `excluded`, `direction` (primary, secondary,
functional, ambition, color_posture, motion), `treatments`, `adaptation`, `rationale`,
`constraints`, `clarification`, `validation`, `warnings`. Read `warnings` first: they flag
values outside the vocabulary, malformed fields and unknown keys, which are ignored or scored as
neutral; fix the context and run again.

| Consumer | Uses | May not |
|---|---|---|
| Start summary | Mode, primary (+ secondary), key assumption or the question | — |
| `research-foundation` (`uupm/search`) | Context as the query; returns evidence | Pick the style; its style results are evidence |
| `design-reasoning` | Concepts inside the primary direction | Switch family |
| Visual driver / `visual-direction` specialist | Authors the direction contract inside the record | Re-choose the style or posture |
| color, typography, layout, design-system specialists | Treatments and posture as constraints | Override identity treatments |
| `component-reference` | Component treatment and platform adaptation | Ship library defaults that contradict it |
| Motion owner | Motion level and character | Drop motion without a static request |
| Reviews | Judge the render against the record and the brief | Count a record as visual proof |

Re-run the engine (once) when foundation research, the user's answer or project intelligence
changes a decisive dimension. A driver whose house rules contradict the record is the wrong
driver ([full-design §4](full-design.md#4-drivers)).
