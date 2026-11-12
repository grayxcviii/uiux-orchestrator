# Visual design principles (hierarchy, layout, type, color)

Platform-neutral principles. They apply on top of a project's design system and a platform's
conventions, never in place of them. Platform type scales, spacing units and components live in
`platforms/<platform>.md`.

## 1. Hierarchy first

Every screen answers three questions in this order:
1. Where am I?
2. What is the main thing here?
3. What can I do next?

- **One primary action per view.** Secondary actions are visibly secondary (tonal, outline, text).
  Destructive actions are separated and confirmed or undoable.
- Rank content into 3 levels at most (primary, secondary, supporting).
- Use the fewest tools to rank it: size, weight, color/contrast, position, spacing. Adding
  borders, shadows and colors to rank is a sign the spacing and type are not doing their job.
- **Squint test:** blur the screenshot. The primary element and the primary action should still
  stand out.

## 2. Layout and spacing

- Use a spacing scale (commonly 4 or 8 based) and only its steps. Mixed spacing values are the
  most common cause of a "slightly off" look.
- Proximity shows relationships: space inside a group < space between groups < space between
  sections.
- Align to a small number of edges. Every new alignment line costs clarity.
- Respect platform margins and safe areas/insets. Content never sits under system bars, notches,
  home indicators or keyboards.
- Line length for reading text: about 45–75 characters.
- Density follows the task: data-heavy tools can be denser; first-run and marketing surfaces
  breathe more. Use one density per surface.
- Reserve space for asynchronous content (skeletons with the final dimensions), so content does
  not jump.

## 3. Typography

- Use the platform/system type scale or the project's scale. Use 4–6 roles on a screen.
- Create hierarchy with size **and** weight, not size alone. Limit weights to 2–3.
- Body text must scale with user settings (Dynamic Type, `sp`, `textScaler`, `rem`).
  Layouts must survive the largest setting without clipping. Allow wrapping, don't truncate key
  content, and stack horizontal layouts when space runs out.
- Line height: about 1.4–1.6 for body text, tighter for large headings. Tracking: slightly
  negative only for large display sizes (most system fonts handle it optically).
- Numbers that update or align in tables use tabular figures.

## 4. Color

- Work in **roles**, not hues: background, surface, surface-variant, primary, on-primary,
  secondary, error, outline, and so on. Components consume roles; themes map roles to values.
- Every foreground/background pair meets contrast floors (`references/accessibility.md`).
- Color is never the only signal (pair it with an icon, text or shape).
- Give primary actions one consistent color meaning. Match visible color intensity to the brief.
- Dark mode is a separate palette, not an inverted one:
  - tune lightness per role; keep the accent readable rather than neon;
  - use elevation through lighter surfaces, not shadows;
  - avoid pure black under bright text if it causes smearing on OLED;
  - check contrast again.

### Default color posture: premium monochrome

When the user, brand and [direction record](../core/direction.md) give no other color
direction (monochrome styles and the library default), use a **premium monochrome or dark
palette**: black, white and a deliberate range of grays, with at most one restrained accent.
Luxury and modernity come from value contrast, material, photography and typography, not from
hue. A user's or brand's explicit color request always overrides this default; then apply the
same craft to their colors.

Build in a perceptual space (**OKLCH** on the web, `oklch(L C H)`; the platform's wide-gamut
color API on native) so steps are even and contrast is predictable:

1. **Anchor the extremes.** A deep base, not `#000`: L 0.10–0.16. An off-white, not `#fff`:
   L 0.96–0.985. The distance between them is the palette's drama; use it.
2. **Build a real value ramp.** At least 5–7 neutral steps (e.g. L 0.13 / 0.18 / 0.24 / 0.32 /
   0.55 / 0.78 / 0.97) for surfaces, raised layers, hairlines, secondary text and primary text.
   Hierarchy comes from lightness, so mid-grays need clear jumps, not near-duplicates.
3. **Choose a temperature and keep it.** Neutrals are either true (C 0) or barely tinted
   (C ≤ 0.012) toward one temperature: warm stone/graphite (h 60–80) or cool steel/ink
   (h 240–260). Mixing warm and cool grays looks accidental. Never tint neutrals violet/indigo.
4. **One accent, used rarely, chosen from the product.** If an accent exists, it occupies
   roughly ≤ 5% of a view: the primary action, a live state, a single signature detail.
   Derive it from the subject's material or brand (signal red, oxblood, deep racing green,
   bronze, steel blue, a product's own color) at moderate chroma (C 0.08–0.16; up to ~0.20 for a signal color). White can be
   the accent on dark; black can be the accent on light.
5. **Let content carry color.** Photography, product renders and video supply richness; the UI
   frames them in neutrals. Grade imagery to the palette (cool/warm, contrast, grain).
6. **Add material instead of hue.** Fine grain, hairline borders (1px at low-contrast steps),
   subtle surface layering, controlled light falloff (vignette, spotlight) and real shadows on
   light themes make monochrome feel expensive rather than empty.
7. **Gradients are light, not color.** Prefer single-hue lightness falloff (base → raised gray,
   spotlight behind a product). Interpolate in OKLCH (`linear-gradient(in oklch, …)`) and add
   grain on large areas to prevent banding.
8. **Contrast is computed, not guessed.** Primary text ≥ 7:1 where possible, secondary text
   ≥ 4.5:1. Premium never means tiny, faint text: no body or label text below 12px CSS / 11pt,
   and no gray-on-gray labels that fail contrast.

Monochrome archetypes (adapt temperature, accent and proportions to the product; never ship one
unchanged or reuse it across unrelated clients):

| Archetype | Character | Shape of the palette |
|---|---|---|
| Ink & paper | Editorial-modern, confident | Off-white L 0.97 + near-black L 0.14, almost no mid-grays; oversized grotesk; photography in full color or graded mono |
| Graphite | Technical, precise, product-led | Dark ramp L 0.13–0.32 for layered surfaces, hairlines at L 0.28, text L 0.95; one cool or white accent |
| Obsidian & metal | Luxury without gold clichés | Near-black warm or cool base, a single metallic tone (steel, titanium, bronze) as rule lines and details, never as large gradients |
| Gallery white | Calm, high-end retail or architecture | Warm or cool white L 0.96–0.98, black type, generous space; the product photography is the only color |
| Black + signal | Bold, cinematic, performance | True dark base, white type, one saturated signal color (red, racing green, safety orange) under 5% of the view |
| Stone | Tactile, crafted, hospitality | Tinted neutrals C ≤ 0.012 (h 60–80), matte surfaces, grain, a deep earthy accent |

### AI-generated color signatures (avoid)

These colors and effects are the fingerprint of generated and template UI. Do not use them
unless the user or an existing brand explicitly requires them:

- indigo/violet/purple as the primary or accent (Tailwind `indigo-500`/`violet-500`/`purple-600` defaults);
- purple → blue, pink → purple, teal → purple, or "aurora" multi-hue gradients;
- neon cyan, electric magenta or acid green on dark backgrounds;
- gradient-filled headline text;
- blurred colored glow blobs or orbs behind the hero;
- dark backgrounds tinted blue-violet (`#0f0f23`, `#0b0b1a` and similar) instead of true or warm/cool neutrals;
- colored glassmorphism (frosted panels over rainbow blur);
- colored glow shadows on buttons and cards;
- rainbow per-section or per-card accent colors;
- pastel candy palettes with no product reason.

Restraint is the default posture, not timidity: the result must still be bold through scale,
contrast, composition, photography and motion.

## 5. Components and states

- Reuse before creating. A new component must exist because no existing one can express the need.
  Choose components and their contracts with [component-intelligence.md](component-intelligence.md).
- Every interactive component defines its states:
  - default, pressed/active, focus-visible, disabled, loading;
  - hover on pointer platforms;
  - selected/checked where relevant.
- Every data view defines its content states: loading, empty (with a way forward), error (what
  happened + what to do), partial, very long content, and offline where the app supports it.
- Touch targets meet platform minimums even when the visible shape is smaller. Enlarge the hit
  area, not the visual.

## 6. Avoiding generic, "AI-generated" UI

For new work or a visual redesign, establish a contemporary art direction before assembling
components: one typographic idea, a composed focal point, intentional negative space, and a
coherent treatment of depth, light and materials. Describe concrete choices rather than merely
calling the result "modern" or "premium".

For Persuade/Experience surfaces, compare media that credibly show the subject: photography,
an expressive flat composition, a product render, layered interface demonstration or interactive
scene. Effects support an idea; they do not replace one. Do not
replace a real destination with a crude miniature simply to add depth; inspect material,
lighting, silhouette and photographic quality at presentation size. A requested stylized
miniature is valid, but must be judged against that brief rather than counted as inherently better.
For Operate/Read surfaces, use restrained elevation and spatial transitions; keep controls and
data stable and legible. An explicit 3D request makes depth a deliverable: record where it is
visible and how it will be checked. Load [spatial-design.md](spatial-design.md) when choosing it.
Existing design systems and supplied designs remain the constraints for scoped changes.

### Direction contract before implementation

When `direction` runs, keep a short record in working context with concrete choices:

| Field | What to decide |
|---|---|
| Direction | How the design direction record is realized: primary (and secondary, functional) styles, ambition, color posture and motion level mapped to concrete treatments. A deviation needs a recorded reason (brief, brand, accessibility). |
| Brief fit | The requested visual qualities and explicit dislikes, each mapped to an observable design choice. Include references actually inspected, if any. |
| Concept | A product-specific visual idea and surface mode; how it serves the audience and primary action. |
| Color | Actual roles/tokens in OKLCH (or platform wide-gamut values): the neutral ramp, its temperature, the accent (if any) and where it appears, and contrast pairs. Confirm no [AI-generated color signature](#ai-generated-color-signatures-avoid) is present; if the result matches a [safe-default trap](#safe-default-traps), state the brief reason. |
| Decisive move | The one bold decision this direction commits to and why it fits the product; what must survive implementation and review. |
| Type | Actual families with the required language glyphs, display/body roles, weight, scale and wrapping. For contemporary work, start from a current-feeling sans treatment; use editorial/retro serif styling when the brief or brand supports it. |
| Composition | Focal point, desktop/phone layouts, section rhythm, density and whitespace. Explain how the structure follows the content. |
| Media and depth | Subject, asset source/creation method, material/light treatment, and CSS/static-render/scene choice when 3D is in scope. |
| Signature and motion | Recognizable details carried beyond the hero; the motion signature, entrance choreography, transition and feedback tokens per [motion-principles §0](motion-principles.md#0-default-posture-smooth-choreographed-motion), and reduced-motion behavior. Static only when the user asked for it. |
| Acceptance | What must be visible in the first representative render to prove the requested style, and which mismatches would require changing the direction. |

If the user delegated art direction, choose and implement without an extra selection gate.
If they asked for alternatives, use the design-exploration workflow. This record is a building
brief, not a substitute for rendering or a reason to create process files.

### Contemporary visual range: bold by default

The ambition comes from the [direction record](../core/direction.md): each style declares
`bold`, `confident` or `quiet` (see its style index), dense Operate surfaces are `quiet`, and a
governing brand turns `bold` into `confident`. A Persuade surface with no context falls back to
Bold Modern (`bold`). Bold means a direction someone would remember
and could describe after one look; confident and quiet keep one recognizable signature. In the default
[premium monochrome](#default-color-posture-premium-monochrome) posture, boldness comes from
scale, contrast, crop, composition, photography, material and motion rather than from hue.
Specify actual colors, type, composition and assets; naming a style is insufficient. Products
can share the posture but not the execution: vary temperature, accent, type, material and layout.

Commit to at least **one decisive move** that a cautious designer would hesitate over, and name
it in the direction contract: an oversized or cropped type treatment, a full-bleed black or
white field, a dramatic photographic crop, extreme scale contrast, a broken grid, a distinctive
material, a signature interaction. Keep it while it survives usability and accessibility; do not
sand it down during later stages merely because it is unusual.

Keep a gradient only if it has a job: it renders light or material, encodes data or progression,
or is a recognizable brand asset built from the brand's own colors. Before handing off, ask:
(1) if it were removed, would meaning be lost or only decoration? (2) if the brand changed,
would the gradient have to change? "Only decoration" and "no" mean it is generic: give it a role
or replace it with a flat field. Gradient-filled headline text and glow blobs are
[AI-generated signatures](#ai-generated-color-signatures-avoid).

#### Safe-default traps

These looks are the statistical average of "tasteful" output. Each is valid **only** when the
brief or brand points to it; otherwise treat it as unresolved direction and push further:

- **Lazy mono:** flat mid-grays with no true dark or light, thin weights, tiny letter-spaced
  labels everywhere, no material or imagery. Crafted monochrome is the default; lazy mono fails.
- **Gold-and-italic reflex:** champagne gold accents and an italic serif phrase applied to every
  premium brief. Premium can be achieved with steel, white or no accent at all.
- **Editorial beige:** cream/beige/terracotta, muted sage, serif italics, sparse layout.
- **SaaS gray:** white + light gray cards + one blue/indigo CTA, centered hero, three-card grid.
- **Dark glow:** slate/ink background + violet/indigo glow blobs + gradient headline text.

A style selected in the direction record is a brief, not a trap: Organic Tactile is not
editorial beige when it has a real value range, earth chroma and material; Modern Minimal is not
lazy mono or SaaS gray when it has true darks, structure and product imagery. The traps still
apply inside every style.

When the user asks for colorful or vivid design, follow that brief: build the palette with the
same OKLCH method (real chroma, real area, tinted neutrals) and still avoid the
[AI-generated signatures](#ai-generated-color-signatures-avoid). For an explicit
vintage/editorial/luxury brief, honor it and make it specific rather than generic.

These patterns weaken specificity when repeated without a product/content reason:

- glow shadows everywhere;
- emoji used as icons;
- three-card feature grids repeated in every section;
- centered everything;
- identical rounded cards nested inside rounded cards;
- an oversized hero headline with vague copy ("Revolutionize your workflow");
- fake metrics and testimonials;
- random accent colors per section;
- inconsistent icon styles;
- decorative motion on every element.

The antidote is specificity:
- real content and the product's own UI;
- a deliberate palette with clear roles: a real value range, one temperature, a rare accent;
- one typographic idea;
- spacing doing the hierarchy work;
- conventions where users expect them, distinctiveness where the brand lives.

Before handing off, name the focal composition, type treatment, depth/material approach and
motion signature (static only when the user asked for it). If the result could fit any unrelated product
after changing its logo, refine the concept. Generic floating spheres, neon blobs or a spinning
torus do not become product-specific merely because they are rendered in 3D.

### Product identity contract

For original visual work, include these concrete choices in the direction before building:

- **Concept:** one sentence connecting the product's purpose and audience to a visual idea.
- **Signature details:** a small set of recognizable choices, such as a distinctive type/crop
  relationship, a product-derived shape, a material treatment or a meaningful interaction.
  Carry them into supporting sections and mobile layouts so the hero is part of a coherent whole.
- **Content-led composition:** give each section a layout suited to what it communicates;
  vary scale, alignment and rhythm intentionally. Use asymmetry when it strengthens hierarchy.
- **Authentic evidence:** use supplied product imagery, real interface demonstrations and specific
  copy. Mark missing assets/data as placeholders; do not fabricate social proof to fill a layout.
  When a hero needs a product render/photo that does not exist, choose a suitable available image
  generation or licensed-asset path. Inspect the asset at presentation size. Judge a procedural
  model or CSS illustration against the same requested material/detail quality; replacing a
  premium product image with an obviously crude stand-in is an unresolved asset gap.

Review with two checks: cover the logo and name what still identifies the product; then imagine
swapping in an unrelated product's copy and list which visual decisions would need redesign.
If nothing meaningful changes, refine the concept and its implementation. These are critique
prompts, not authorship detection. Judge fit to the brief and observed craft.

Use familiar controls where users need predictability. Distinctiveness belongs in art direction,
content and purposeful interaction; retain clear navigation, readable forms and usable focus
states. Existing brand systems and supplied designs constrain the identity contract to the scope
the user authorized.

## 7. Consistency checks before handing off

- Same element, same look, everywhere: buttons, inputs, cards, list rows, icons (one icon family,
  one stroke weight).
- Same meaning, same color.
- Same transition for the same kind of change.
- New screens match their neighbours more than they match a reference image.

## 8. Choosing a chart (built-in fallback)

| Data question | Chart |
|---|---|
| A metric's trend over time (the usual dashboard question) | Line chart; area fill only for a single series showing volume |
| Comparing the totals of a few discrete periods (e.g. "which month was highest?") | Column chart, zero baseline |
| Compare categories | Horizontal bar, sorted by value; long labels fit |
| Part of a whole, ≤ 5 parts | Stacked bar, or a donut only when the total is meaningful |
| Distribution | Histogram / box plot |
| Relationship between two measures | Scatter plot |
| A single headline number | KPI tile with period and change vs. previous period |

When a data-visualization skill is used, its recommendation takes precedence over this table.

Always: label units and the period; bars start at zero; highlight the series or point that
matters (e.g. the current period), mute the rest; don't encode meaning in color alone; give
screen readers an equivalent (a data table or a summary sentence); use tabular figures; design the
empty state.

## 9. Breakthrough ambition for new work and edits

Apply whenever the task leaves design judgment open: new work, Refresh, polish, a component
refinement or an interaction improvement. Aim for a memorable, product-specific advance in
composition, visual identity, presentation or interaction, with an explicit user/product benefit.
Small scope still deserves creative judgment; fixed brand tokens are design constraints, not
an instruction to produce a generic or timid result.

### Creative-improvement contract

Before implementation, keep a short accepted creative brief in working context:

- **Baseline and opportunity:** inspect the actual current UI when it exists. Identify what is
  forgettable, unclear, awkward or underdeveloped and what this task can improve.
- **Distinct alternatives:** develop 2–3 meaningfully different approaches within scope, through
  the assigned concept specialist (on Small scope, the single scoped specialist weighs them
  inline). Compare composition, hierarchy, narrative, content treatment or interaction—not
  merely different color swatches on the same template.
- **Chosen move and benefit:** choose the strongest approach against the brief and explain the
  recognizable signature or experience improvement. If the user delegated judgment, proceed
  without an additional selection gate. Preserve the user's explicit constraints.
- **Execution owners:** route compatible concept and visual/interaction expertise at the scale set
  by [improvement.md](../workflows/improvement.md#creative-refinement) (one scoped specialist for
  Small open-ended component work). Execute their instructions and record actual handoffs.
- **Proof:** inspect the result in context at relevant sizes/states. For edits, compare matching
  before/after views. The reviewer, or the self-check when Small scope has no reviewer activation,
  must identify the concrete difference and why it improves the product or task; a generic
  "looks cleaner" is insufficient evidence of breakthrough ambition.

A signature can be a strong typographic/compositional idea, a better product demonstration,
an expressive material/color language or a useful interaction. Apply the idea beyond superficial
hero decoration where the authorized scope allows. Avoid recycling unrelated clients' layouts
and palettes simply because they worked previously. Shared primitives and coherent brand
patterns remain reusable.

For open-ended improvement requests, arbitrary shadow/radius/color swaps with no concept or
observed benefit do not satisfy the creative brief. Aim for a convincing, crafted change at the
requested scale. Distinctiveness must survive responsive and interaction states and make the
product more compelling or easier to use. Contrast, scale, motion and depth are strong tools for
carrying the idea; a change that only makes the UI quieter is not a creative advance.

### Observable scope boundaries

- **Existing system/brand:** invent within its constraints. Changes that truly require broader
  identity/system replacement must be within authorization; state the limitation if they are not.
- **Exact supplied fix or design:** implement with high craft and fidelity. Do not fabricate a
  need for alternative designs or change unrelated UI to claim novelty.
- **Review-only:** propose specific ambitious alternatives and benefits; do not implement them.
- **Native/Operate:** retain predictable controls and platform conventions while improving the
  content hierarchy, presentation, feedback or other aspects actually in scope.

Judge the observed creative result against the brief and baseline, not a claim that novelty is
objectively guaranteed. If the requested creative improvement is not demonstrated, refine it
or report `Needs review`; technical checks alone cannot establish it.
