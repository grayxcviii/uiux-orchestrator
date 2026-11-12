# Direction rules — scoring, composition, style index

Reference for [core/direction.md](../core/direction.md): what `scripts/direction.mjs` does, for
applying it by hand without Node and for extending the Style Library. Agents running the script
do not need this file.

## 1. Scoring

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

## 2. Composition and validation

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
  [archetypes](visual-design.md#default-color-posture-premium-monochrome), `chromatic`
  with its rule, or `system`). The AI-generated color and motion signatures stay excluded in
  every posture unless the user or brand requires them.
- **Motion**: the primary's level and character inside [motion-principles §0](motion-principles.md#0-default-posture-smooth-choreographed-motion); a requested `static`, `quiet` or `expressive` sets the level.

Validation in the record: at most three distinct styles (more is a `fail`), no clashing
pairings, functional compatibility with primary and secondary, explicit-style fit warnings and the accessibility notes of the chosen styles as
constraints. Accessibility floors and explicit user requirements outrank every style treatment
([conflict-resolution](../core/conflict-resolution.md)); decoration never overrides usability. Rendered
proof of direction fit is part of the [visual craft gate](../core/quality-gates.md#visual-craft-acceptance).

## 3. Style index

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
