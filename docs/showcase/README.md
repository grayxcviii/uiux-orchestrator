# VELTORA Noir — Haute Parfumerie

A fictional luxury perfume campaign created for the UIUX Orchestrator README. This is an authored visual showcase, not a real product, an independently evaluated orchestrator run or proof of measured quality. Fragrance notes and product specifications are illustrative.

## Art direction

Amber perfume, thick glass, a glossy black cap and champagne light on dark stone. Warm ivory serif typography and generous negative space frame the bottle. The ten-second film moves from “Some things stay with you.” into “An impression. Not an echo.”, then returns to its opening composition.

The product photograph was created using the built-in image generation tool. The full prompt is in [IMAGE_PROMPT.md](IMAGE_PROMPT.md); the final source asset is `../assets/veltora-perfume.png`. It is a photographic asset animated with gentle pan/zoom and subtle exposure modulation, not a rotating 3D model. All marketing copy outside the bottle label is HTML. No external assets are fetched at runtime.

- `index.html`: campaign copy, fragrance notes and playback controls.
- `style.css`: desktop/mobile art direction using system Bodoni/Didot/Times, Helvetica/Arial and Georgia.
- `scene.js`: deterministic ten-second photographic timeline.
- `render.mjs`: browser capture, visual checks and media exports.

Open `index.html` in a modern browser. Use **The fragrance**, **The composition** or **Discover Noir** to select a chapter; selecting pauses playback. The motion control resumes it. Reduced-motion preferences start on a still. The composition does not need WebGL; without JavaScript the hero and product photograph remain visible.

## Reproduce

From the repository root:

```sh
node docs/showcase/render.mjs --stills
node docs/showcase/render.mjs
```

Requires Node.js 18+, Chrome/Chromium (or `CHROME_PATH`), FFmpeg with `libx264`, and `img2webp` from the WebP tools. Uses the repository's dependency-free CDP client. The renderer waits for the product image to decode, then captures an explicit timeline rather than wall-clock recording. Temporary frames are removed on completion or failure.

| Asset in `docs/assets/` | Purpose |
| --- | --- |
| `veltora-perfume.png` | Generated source product photograph |
| `veltora-overview.jpg` | 1440×900 hero and reduced-motion still |
| `veltora-detail.jpg` | 1440×900 fragrance composition still |
| `veltora-mobile.jpg` | 390×1060 mobile composition |
| `veltora-demo.webp` | 960×600 film, 300 frames / 10 seconds |
| `veltora-demo.gif` | 800×500 color fallback, 25 fps |
| `veltora-demo.mp4` | 1200×750 H.264 film, 30 fps |

Browser playback follows the display's animation clock. WebP uses 33/33/34 ms durations; GIF uses 40 ms frames. The README includes a reduced-motion picture source and a still link. Actual hosting playback and media-query handling depend on the README renderer.

The capture checks image loading, byte-identical screenshots at timeline 0 and 10, chapter navigation, reduced-motion startup, JavaScript exceptions and horizontal overflow at 320, 390, 600, 768 and 1440 px. Additional temporary hero/detail captures at narrow widths support visual inspection; overflow checks alone cannot detect overlapping content.

Historical Vahl assets remain intact for `tests/results/2026-11-06-showcase-vahl.md`.
