# Spatial design and 3D

Load for a requested or chosen 3D treatment. Modern design comes from composition, typography
and craft as well as depth; the renderer is a means to realize the direction.

## Art direction

- Define the focal subject and its role: explain a product, demonstrate an interaction, or
  express a brand idea. On a promotional surface, make it a substantial part of the composition.
  Build the headline, negative space and CTA around it rather than dropping a canvas behind text.
- Specify a consistent camera angle, foreground/midground/background, key-light direction,
  material family and contact shadows. Choose materials that suit the brand (e.g. ceramic,
  brushed metal, translucent polymer); do not mix effects without a visual reason.
- Limit competing focal points. Carry the same material/light language into supporting details,
  while keeping forms, navigation and dense data visually quiet.
- State what interaction adds: inspecting a product, revealing layers, changing a configuration,
  or a restrained response to input. Auto-rotation is optional; it is not a substitute for design.

## Choose the medium

| Need | Approach |
|---|---|
| Elevation, layered panels, shallow perspective or a small pointer tilt | CSS shadows, gradients, `perspective` and transforms; no scene engine |
| A fixed sculptural composition or product shot with no changing viewpoint | Optimized image/pre-rendered 3D asset; responsive variants and useful alt text |
| Real geometry, changing viewpoints, lighting/material response, interactive product inspection or custom shaders | Three.js on web; in React, consider React Three Fiber if compatible with the installed stack |
| Native/mobile depth | Platform layers, transforms and motion first; a native scene solution only when genuine interactive 3D is required |

Choose the least costly medium that actually achieves the chosen effect. If interactive geometry
is central, use a real scene rather than approximating it with stacked divs. If a static render
achieves the direction, a canvas adds no inherent quality. Do not substitute flat decoration for
an explicit request for real interactive 3D without recording the unmet requirement.

Inspect installed packages, framework/runtime, asset pipeline and target devices first. Three.js
is not a GSAP/Motion replacement; those may choreograph DOM/scene transitions when useful.
Use existing dependencies where suitable. A request explicitly allowing Three.js authorizes
adding the necessary compatible packages in the target project; otherwise follow the normal
dependency permission policy. Do not add an entire 3D ecosystem for a single effect. Check the
installed versions' official docs before using renderer, loader or framework integration APIs.

## Scene contract (keep with the direction decisions)

Record only concrete choices needed for this surface:

- subject, placement, footprint at desktop and phone sizes, camera/framing, materials and lighting;
- medium/renderer and why; asset source/rights, or procedural geometry when appropriate;
- interaction and motion, touch/keyboard equivalents, reduced-motion behavior;
- loading/error/static fallback and which information/actions remain available without the scene;
- performance budget appropriate to target devices: asset bytes, render resolution, draw calls
  and target frame time; how these will be measured.

Example: a hardware landing page uses a large angled product render alongside left-aligned copy,
matte casing with one metal accent, and DOM buttons for available finishes. Choose an interactive
scene only if inspecting angles or changing finishes is part of the intended experience.

## Web implementation

- Keep headings, copy, links and controls in semantic HTML outside the canvas. Decorative scenes
  are hidden from assistive technology and do not intercept pointer events. Interactive scenes
  have an accessible description and equivalent DOM controls for meaningful actions.
- Reserve the scene's dimensions. Show a composed poster while loading and on asset/renderer
  failure or unavailable graphics support. The primary content and CTA work before scene startup.
- In SSR frameworks, isolate browser-only renderer initialization in a client boundary; avoid
  accessing browser globals during server rendering. Load heavy scene code/assets separately
  from critical content; do not make the headline or primary action wait for them.
- Fit camera and renderer to the container on resize. Cap pixel ratio for the device budget;
  measure before enabling expensive shadows, transmission or post-processing. Prefer asset
  reuse/instancing where it reduces repeated work. Add compression tooling only when justified.
- Render on demand for mostly static scenes; invalidate when state, controls or size changes.
  Pause continuous decorative animation offscreen and when the document is hidden. Reduced motion
  stops auto-rotation, parallax and camera travel; retain a useful still view and direct controls.
- Clean up animation loops, listeners, controls and owned GPU resources when unmounting. Respect
  shared asset ownership and framework lifecycle; repeated navigation must not accumulate scenes.
- Do not hijack page scrolling or depend on hover. Drag-to-inspect must coexist with touch scroll;
  key actions also work through DOM controls. Pointer tilt is an enhancement for fine pointers.

## Verify the result

Inspect the actual composition at phone/tablet/desktop sizes: framing, lighting, subject identity,
text contrast over every relevant frame, CTA prominence and clipping. A successfully mounted
canvas does not prove a strong visual result.

Exercise scene controls with pointer, touch where tooling permits, and keyboard alternatives.
Check reduced motion, slow/failed asset loading, renderer failure/static fallback, resize and
repeated mount/unmount. Compare asset/bundle size and frame timing against the scene contract;
state device limitations rather than claiming smoothness from a desktop screenshot.

DOM screenshots/checkers cannot establish canvas contrast, scene semantics or GPU performance.
DOM motion traces do not capture internal scene animation; use a recording or rendered frame
sequence for it. Follow the workflow's evidence levels and disclose unavailable checks.

## Sources

Consulted 2026-11-10; verify against installed versions when implementing:

- [Three.js: responsive design](https://threejs.org/manual/pages/responsive.html)
- [Three.js: rendering on demand](https://threejs.org/manual/pages/rendering-on-demand.html)
- [Three.js: cleanup](https://threejs.org/manual/pages/cleanup.html)
- [React Three Fiber: scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
