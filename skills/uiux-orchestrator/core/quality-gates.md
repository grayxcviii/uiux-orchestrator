# Validation engine and quality gates

A UI is not validated by reading its source. Collect evidence at the levels the workflow
requires, fix what it reveals, verify again, then assign a status.

## Evidence levels

| Level | Name | Counts as evidence | Does not count |
|---|---|---|---|
| L0 | Code review | Diff read against requirements, handoff and conventions | — (always do it, never sufficient alone for UI) |
| L1 | Static | Typecheck, lint, analyzer (`tsc`, `eslint`, `swiftlint`, `ktlint`/`detekt`, `flutter analyze`) passing | "No obvious errors" |
| L2 | Build | The project's build succeeds (`next build`, `vite build`, `xcodebuild`, `./gradlew assembleDebug`, `flutter build`, `expo export`/prebuild-free bundle) | Dev server starting |
| L3 | Functional | Tests pass, or the interaction was exercised (clicked, typed, navigated) and behaved as required | Tests that do not cover the change |
| L4 | Visual | Rendered output **observed** (screenshot or live view) at the required sizes/themes/states and compared to requirements | Describing what the code "would render" |
| L5 | Device | Real device or release build on the target device class: performance, gestures, haptics, platform behavior (mobile web: a real phone) | Simulator, dev build or desktop-browser runs for perf/feel claims |

## Visual loop

```text
implement → run app/preview → capture → inspect → compare with requirements + handoff
   ↑                                                     │
   └────────────── fix the batch of issues ←─────────────┘   (stop when gate passes or 3 rounds)
```

Batch fixes from one look before capturing again. After three rounds without convergence, stop
and report `Needs review` with what remains.

### Tooling by platform (use what profile `visual_tooling` found)

| Platform | Preview | Capture |
|---|---|---|
| Web | project dev server; Storybook/Ladle story for components | project tooling first (Playwright/Storybook/screenshot scripts); else the bundled `node <skill-dir>/scripts/ui-check.mjs <url> --widths 390,768,1280 --schemes light,dark [--reduced-motion] [--click sel]` (no install; needs Node 18+ and Chrome/Chromium/Edge); or the agent's browser tool; Impeccable's launcher (`<impeccable-skill-dir>/scripts/impeccable detect <url>`) if installed — not `npx`, which would fetch a package |
| React Native / Expo | `expo start` / `npx react-native run-ios|run-android` on simulator/emulator; dev build for native modules | `callstack/agent-device` if available; `xcrun simctl io booted screenshot <file>`; `adb exec-out screencap -p > <file>` |
| iOS | Xcode previews can't be captured headlessly; build and run on simulator | `xcrun simctl io booted screenshot`; snapshot tests if present |
| Android | Compose `@Preview` (Android Studio) or emulator | `adb exec-out screencap -p`; Paparazzi/Roborazzi if present |
| Flutter | `flutter run -d <device>`; widget tests | `flutter screenshot`, golden tests if present, simulator/emulator capture |

Motion evidence without a recording tool (web): `node <skill-dir>/scripts/motion-trace.mjs <url>
--target "<css>" --trigger "<css>" [--reduced-motion] [--frames 4]` samples the animated properties
every frame (start/end values, when change starts and settles, frame gaps) and can save slowed
frames. Report it as L4 frame evidence; headless timing is not device evidence (L5).

The bundled `ui-check` reports overflow (incl. the offending element), clipped text, text contrast,
targets < 24 px, unnamed controls, placeholder-only fields, missing alt, pointer-styled elements
that aren't keyboard-operable, and console errors. It does not measure non-text contrast
(borders, icons — WCAG 1.4.11), text over background images (skipped), focus order, or anything a
human would see as "off". If the page fails to load (server down, HTTP error) it stops with an
error instead of reporting. Always look
at its screenshots; its findings are evidence, not the review. Default output goes to a temp
folder, so it is safe in read-only tasks.

Mobile interaction needs a device-automation tool (Callstack `agent-device`, Maestro, idb,
XCUITest/Espresso tests in the project). With `agent-device`, frame-level native motion evidence =
`record` the interaction, then its contact sheet (or extract frames with ffmpeg); in Expo Go expect
the "Open in Expo Go?" alert and a first-run dev-menu tutorial to dismiss first. Without one, `simctl`/`adb` screenshots show only the
launch state, and system prompts (e.g. "Open in Expo Go?") cannot be dismissed — record that as a
limitation instead of claiming interaction evidence. Use a dedicated simulator/emulator (pass its
UDID/serial explicitly); never install apps on a device the user is using without asking.

React Native fallback: when the native app can't be driven, a react-native-web render of the same
screen (Expo `--web`) can provide interaction and frame evidence for shared JS logic. Label it
"web preview (react-native-web), not device evidence": native layout, native transitions and screen
reader behavior remain unverified.

Starting a dev server, simulator or emulator is fine; installing an SDK, simulator runtime, or
browser is not (ask). If nothing can render, the highest possible level is L3 and the status is
at best `Passed with limitations`.

### What to inspect (pick what the task touched)

Layout and alignment · spacing rhythm · typography hierarchy · color and contrast · visual
hierarchy (primary action obvious) · consistency with neighbouring screens · sizes: web 390 /
768 / 1280+, mobile smallest supported width + a large phone + tablet if supported · themes:
light/dark if supported · states: loading/empty/error/disabled/long content · interaction:
hover/press/focus · accessibility: focus order, labels, large text (200% / largest Dynamic Type /
font scale 2.0), reduced motion · animation: plays, interruptible, no jank visible · RTL if
localized.

For modern/3D directions, also inspect the focal composition, type, materials, lighting and depth
against the direction record. Apply [spatial-design.md](../references/spatial-design.md) for scene
framing, input alternatives, reduced motion, loading/failure fallback and lifecycle checks.
DOM checks cannot assess canvas content; DOM motion traces cannot capture internal scene animation.
Use rendered frames/recordings and actual measurements for scene claims, disclosing device limits.

## Gates per workflow

### Visual craft acceptance

For every task with open design judgment, including new design, Refresh, polish and a single
component refinement, apply this
check alongside the workflow's gate. Inspect rendered output and record concrete observations:

| Dimension | Acceptance evidence |
|---|---|
| Brief fit | Each requested visual quality maps to observed choices in the render: color intensity, typography, composition, media/material quality and depth. A coherent but wrong style fails this check. |
| Creative advance | Identify the chosen signature/experience improvement and its user/product benefit. For edits, compare matching before/after evidence and the alternatives considered under the [creative-improvement contract](../references/visual-design.md#9-breakthrough-ambition-for-new-work-and-edits). Small scope or fixed tokens do not waive this judgment. |
| Composition | A clear focal point and primary action; balanced visual weight, intentional alignment and negative space. |
| Typography | A deliberate scale and type treatment that suit the product; readable copy and clean wrapping at target sizes. |
| Palette and materials | Cohesive color roles, accessible contrast and consistent depth/light/material choices when used. Name the neutral ramp, its temperature and the accent (if any) and where they appear in the render. Any [AI-generated color signature](../references/visual-design.md#ai-generated-color-signatures-avoid) not required by the user or brand fails. A monochrome palette passes only with a real value range (deep base, off-white, clear mid steps) and material or imagery; flat mid-grays fail. |
| Boldness | Name the direction's decisive move and point to it in the render. If none can be named, or it was softened away during build/review, this fails. If the render matches a [safe-default trap](../references/visual-design.md#safe-default-traps) the brief did not ask for, it fails until the direction is pushed or the brief reason is stated. |
| Product identity | Specific content and a recognizable visual idea carried across the surface; explain what makes it fit this product. |
| Distinctiveness (original visual work) | Signature details remain recognizable without the logo; an unrelated product would require meaningful visual redesign. Use the [identity contract](../references/visual-design.md#product-identity-contract) to identify and refine interchangeable sections. |
| Finish | Consistent icons, radii, borders, image crops and spacing; interaction states receive the same care as the default view. |
| Motion smoothness | The motion signature, entrance choreography and state/navigation transitions are visible in the running UI. Evidence: a motion trace or recording showing compositor-only properties, no dropped frames, interruption without snapping, and a working reduced-motion path. Missing motion on a new surface (without a user request for static), janky frames or an [AI-generated motion signature](../references/motion-principles.md#ai-generated-motion-signatures-avoid) fails. |
| Responsive craft | Phone layouts are intentionally recomposed; hierarchy, focal media and controls remain polished and usable. |

Ask of the first render: "would someone remember this tomorrow, and could they describe it?" A
merely tidy, inoffensive result is a direction miss for open creative work, not a pass.
Check the first representative render for brief fit before spending time on micro-polish; then
verify the full surface at the required sizes/states. Review both the original brief and the
direction record, not just implementation fidelity. If the direction itself misses the brief,
return to `direction` within authorized scope; do not preserve a wrong style because it was
recorded. Report findings as requested quality → observed mismatch → change needed. Maintain
the separate technical checks; neither visual taste nor a technical pass replaces the other.
Fix visible weak points through the visual loop; unresolved craft defects prevent `Passed` for
a visual-quality request.
For full-design, persist this assessment as `visual_review` in the execution record: each
dimension has a verdict, a concrete observation and rendered evidence, tied to the actual
UX/design activation. A functional/a11y score or a list of `met: true` gates cannot replace it.

Negative user feedback invalidates the earlier visual pass. Reopen the affected direction and
review, retain the feedback and superseded activation, then record fixes and a new rendered
assessment. Do not answer a rejection only with more effects, a larger skill list or the earlier
review score. This is not a universal user-approval gate: delegated work proceeds normally when
no feedback was received, and fixes can be validated by a new qualified review within scope.
Use `Needs review` when the aesthetic verdict is uncertain, the loop does not converge, or no
render can be observed. A technical test result or the presence of 3D does not establish beauty.
For exact corrections/supplied designs, assess fidelity, craft and reliability within scope;
do not require unrelated novelty. For open-ended creative work, a missing demonstrated advance
requires refinement or `Needs review`, not a breakthrough claim based only on source changes.

### Workflow requirements

Each workflow file ends with its own **Gate**: the conditions and the minimum evidence. That gate is
canonical; this file defines the levels and statuses they use. "L1 + L2" means both.

## Status

For full-design work, first run the [orchestration record check](orchestration.md#5-completion-check).
Missing phase/activation/handoff/review coverage blocks completion. Use the lower of its status
ceiling and the workflow's evidence verdict. Required built-in specialist fallbacks or declared
sequential reviews are limited; unmet critical outputs/independent-review requirements remain
`Needs review`. The record checker does not authenticate receipts or establish visual quality.

| Status | Use when |
|---|---|
| **Passed** | Gate holds; required evidence collected; no known open issue in scope. |
| **Passed with limitations** | Gate holds for what could be checked; some required evidence was impossible (e.g. no simulator, no real device). List each limitation. |
| **Needs review** | Work done but a gate line is uncertain, a decision needs the user, or the loop did not converge. |
| **Failed** | A gate line is violated or the build/tests fail. Report the failure output. |

If the user's core ask is visual verification ("check it looks right on …") and nothing can be
rendered, the status is `Needs review` — a code-only reading cannot answer the question asked.

If an implementation workflow cannot reach even L1 or L2 here (no SDK, no Node, no build
tool), the status is `Needs review`; give the user the exact commands to run. A review gate that
requires only L0 may be `Passed`, provided the report states it is based on code.

Never report `Passed` without the evidence its level table requires. Never write "visually
verified" without L4.

## Regression check

Proportional to risk: Small — the touched screen; elevated — every usage of a changed shared
component/token (search usages, capture at least the most prominent other usage); high — the
above plus the existing test suite.
