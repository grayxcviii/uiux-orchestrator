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
- Give primary actions one consistent color meaning. A broader expressive palette can include
  chromatic surfaces, imagery, gradients and supporting accents with distinct roles; color-rich
  does not mean every element competes. Match visible color intensity to the brief.
- Dark mode is a separate palette, not an inverted one:
  - tune saturation and luminance per role, retaining vivid brand accents where readable;
  - use elevation through lighter surfaces, not shadows;
  - avoid pure black under bright text if it causes smearing on OLED;
  - check contrast again.

## 5. Components and states

- Reuse before creating. A new component must exist because no existing one can express the need.
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
scene. More geometry, motion or saturation does not establish better art direction. Do not
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
| Brief fit | The requested visual qualities and explicit dislikes, each mapped to an observable design choice. Include references actually inspected, if any. |
| Concept | A product-specific visual idea and surface mode; how it serves the audience and primary action. |
| Color | Actual roles/tokens or values, contrast pairs, color intensity and where color occupies the composition. A colorful brief needs meaningful chromatic areas, not just a small CTA. |
| Type | Actual families with the required language glyphs, display/body roles, weight, scale and wrapping. For contemporary work, start from a current-feeling sans treatment; use editorial/retro serif styling when the brief or brand supports it. |
| Composition | Focal point, desktop/phone layouts, section rhythm, density and whitespace. Explain how the structure follows the content. |
| Media and depth | Subject, asset source/creation method, material/light treatment, and CSS/static-render/scene choice when 3D is in scope. |
| Signature and motion | Recognizable details carried beyond the hero; purposeful motion and reduced-motion behavior, or a deliberate static treatment. |
| Acceptance | What must be visible in the first representative render to prove the requested style, and which mismatches would require changing the direction. |

If the user delegated art direction, choose and implement without an extra selection gate.
If they asked for alternatives, use the design-exploration workflow. This record is a building
brief, not a substitute for rendering or a reason to create process files.

### Contemporary visual range

For original work without a governing style, aim for contemporary, expressive craft. Choose a
visual language suited to the brief: a light chromatic layout, a dark high-contrast composition,
or a richer layered/material treatment can all work. Specify actual colors, type, composition
and assets; naming a style is insufficient. Do not assign every product the same palette.

Gradients, violet/blue, glass, glow and rounded geometry are available tools. Use them to carry
brand color, show layers, shape light or focus attention, with controlled placement and contrast.
No hue or effect proves that a page is generic. Equally, avoiding those tools does not justify
defaulting to beige, terracotta, muted colors, serif italics or a sparse editorial layout.

For a modern/colorful brief, review the overall color presence, typography, image treatment and
component geometry together. A polished retro direction still misses that brief. For an
explicit vintage/editorial brief, honor it; this is not a global ban on warm palettes or serif.

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
- a deliberate palette with clear roles and the requested color intensity;
- one typographic idea;
- spacing doing the hierarchy work;
- conventions where users expect them, distinctiveness where the brand lives.

Before handing off, name the focal composition, type treatment, depth/material approach and
motion signature (or why static is appropriate). If the result could fit any unrelated product
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
product more compelling or easier to use. Extra animation, unusual navigation, saturated color
or 3D are tools, not mandatory substitutes for an idea.

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
