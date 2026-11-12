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
| Governing brand | `brand.governing` | Project tokens/brand guide that define identity |
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
input and output in working context; do not write process files. Without Node, apply §3–§6 by
hand with the index in §8 and the library entries of the candidates (search `"id": "<id>"`).

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

## 5. Scoring

`score(style) = Σ weight × match / Σ weight of known dimensions × 100`. This is relative
suitability for this context, not design quality.

| Group | Weight | Fields |
|---|---:|---|
| Product | 20 | product type, category |
| Business goal | 20 | goals |
| Audience | 15 | audience |
| Personality | 15 | personality, positioning |
| UX | 15 | surface mode, density |
| Content | 10 | content |
| Platform | 5 | platform |

Match levels come from each style's `fit` lists: strong 1, ok 0.6, unlisted 0.3, conflict 0
(reported). Several values in one field are averaged. Unknown groups are left out of both sums,
and `coverage` (known weight / 100) sets confidence. `exclude_when` rules remove a style for
hard mismatches (Neo-Brutalist for children, patients, healthcare or kids; Editorial Luxury and
Dark Premium for children or kids); an explicit request overrides them with a warning. Ties follow `default_order`, then
library order. The semantic work is the extraction in §1; the script only applies structured
compatibility to it, so synonyms never decide the result.

## 6. Composition and validation

- **Primary**: the leader, or the explicit style. Its typography and color are the identity.
- **Secondary** (at most one): only when brand personality or positioning is known
  (`secondary_requires`), also for a named style; listed in the primary's `pairs_with`, no clash, no fit conflict with the
  known context, score ≥ 60 and within 25 points of the primary (explicit mode: no gap rule). It
  may lend layout, surface and imagery treatments, never identity. Functional-only styles
  (Instrument) are never secondary. Unknown personality → no secondary, so an unclear brief does
  not drift toward, say, luxury.
- **Functional** (per extra surface in `surfaces`, each `{ name, page_type, surface_mode?, density? }`):
  a style *fits* a surface when its mode fit is strong or ok and its density fit is not a
  conflict; it *fits well* when both are strong. Order: the primary if it fits well; for Operate
  surfaces or a density the primary does not fit well, a functional-neutral style that fits well
  (Native Clean before Instrument); an already chosen style that fits; a new compatible style
  that fits well; else the primary. New styles are added only while the total stays ≤ 3, and
  none may clash with the primary or the secondary. Functional directions inherit the primary's
  color and type tokens and change only density, layout and components.
- **Treatments**: typography, color, layout, components, surface, motion and imagery from the
  primary (plus the secondary's lent fields); `explicit_visual` values override them.
- **Ambition**: the primary's (`bold`, `confident`, `quiet`); `quiet` for dense Operate surfaces;
  `confident` instead of `bold` under a governing brand unless the user asks for bold.
- **Color posture**: user color direction → brand → the primary's posture (`monochrome` with
  [archetypes](../references/visual-design.md#default-color-posture-premium-monochrome), `chromatic`
  with its rule, or `system`). The AI-generated color and motion signatures stay excluded in
  every posture unless the user or brand requires them.
- **Motion**: the primary's level and character inside [motion-principles §0](../references/motion-principles.md#0-default-posture-smooth-choreographed-motion); a requested `static`, `quiet` or `expressive` sets the level.

Validation in the record: at most three distinct styles (more is a `fail`), no clashing
pairings, functional compatibility with primary and secondary, explicit-style fit warnings and the accessibility notes of the chosen styles as
constraints. Accessibility floors and explicit user requirements outrank every style treatment
([conflict-resolution](conflict-resolution.md)); decoration never overrides usability. Rendered
proof of direction fit is part of the [visual craft gate](quality-gates.md#visual-craft-acceptance).

## 7. The record and who consumes it

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
driver ([decision-engine §4](decision-engine.md#4-drivers)).

## 8. Style index

| Style | Family | Ambition | Typical fit | Avoid / excluded |
|---|---|---|---|---|
| Bold Modern | refined-neutral | bold | tech, launches, premium brands; Persuade | nostalgic, warm or rebellious briefs; kids |
| Modern Minimal | refined-neutral | confident | everyday commerce, SaaS, most products | rebellious, playful briefs |
| Editorial Luxury | refined-neutral | bold | luxury fashion, beauty, real estate, travel | budget; children, kids (excluded) |
| Dark Premium | refined-neutral | bold | automotive, entertainment, gaming, music, premium tech | warm/friendly; children, kids (excluded) |
| Swiss Grid | refined-neutral | confident | portfolios, editorial, design-led brands | playful, warm; kids |
| Native Clean | quiet-functional | quiet | utilities, banking, booking, settings | brand sites, portfolios |
| Instrument | quiet-functional | quiet | dashboards, analytics, logistics, fintech operations | Persuade surfaces; children (excluded) |
| Warm Humanist | warm-natural | confident | healthcare, wellness, education, community | luxury, rebellious |
| Organic Tactile | warm-natural | confident | sustainability, wellness, food, travel | technical, high density, crypto |
| Color Block | expressive-color | bold | youth brands, sports, entertainment, music and events | luxury, calm, monitoring |
| Neo-Brutalist | expressive-color | bold | dev tools, creative communities, streetwear | trust-first products, legal; children, patients, healthcare, kids (excluded) |
| Playful Illustrated | expressive-color | bold | kids, education, games, toy shops | enterprise, luxury, legal |
| Retro Modern | expressive-color | bold | food, entertainment, music, creative brands | technical, task efficiency |

Deferred (honored only as explicit custom directions): Glass Modern, Spatial Futurism; reasons
are in the library's `deferred` list.

**Extending the library:** add an entry to `registry/styles.json` with the same fields (id,
name, aliases, family, label, persona, ambition, color_posture, motion, fit, exclude_when,
pairs_with, clashes_with, functional_neutral, as_secondary, treatments, accessibility,
platform_notes). Aliases are style names only, never adjectives such as "dark" or "minimal".
Pairings are symmetric: list the new style in each partner's `pairs_with` (and clashes in
`clashes_with`). Add scenarios to `tests/direction-scenarios.json`. Vocabulary, labels,
thresholds and platform families are data in the same file; no code change is needed.
