# Workflow: Animation

Motion is its own discipline. Identify the sub-type, run only its steps.

| Sub-type | Signals | Steps | Mutation |
|---|---|---|---|
| Discovery | "what could we animate?", "suggest motion", or motion value unknown inside a polish/redesign | inspect → discover → report (proposals with values) | read-only |
| Discover + build | "make it feel alive / more delightful" (an instruction to change it) | inspect → discover → purpose → tool → design → build → validate | edits |
| Design + build | "animate X", "add a transition/gesture" | inspect → purpose → tool → design → build → validate → review | edits |
| Improve | "improve the animation of <flow>" | inspect → audit → purpose → tool → design → build → validate (+ review when risk is elevated or the task is Large) | edits |
| Review | "review the motion" | inspect → audit → report | read-only |
| Optimize | "janky", "drops frames", "stutters" | inspect → measure → fix → re-measure | edits |
| Remove | "too much animation", "feels slow" | inspect → audit → subtract → validate | edits (subtract only) |

## Steps

**purpose** — Every animation must serve one of: feedback (press, success, error), state change
(expand, toggle, select), spatial continuity (navigation, shared element, origin-aware popover),
attention (rare, important), or direct manipulation (gesture tracking). No purpose → no animation.
On Persuade/Experience surfaces, product demonstration and a deliberate brand/3D reveal also
qualify; name the subject and what its motion communicates. Avoid ambient motion without a role.
Do not animate keyboard-triggered or high-frequency actions, or functional data that changes
constantly.

**tool** — Decide in this order and stop at the first yes:
1. Simple state changes (expand/collapse, fade, hover, press, small toggles) on the web: CSS
   first (transitions, `grid-template-rows` 0fr→1fr, `@starting-style`), even if a library is
   installed.
2. Otherwise, can the motion library **already used in the code** do it cleanly? Use it.
   (Motion can pin with CSS sticky and draw SVG with `pathLength`; Reanimated handles gestures.)
   A library that is installed but not imported anywhere adds its full weight to the bundle on
   first use — justify that cost (measure the bundle) before choosing it.
3. Otherwise walk the ladder below for the platform, cheapest first.
4. A library not installed (including GSAP) needs a stated reason the installed stack can't do it
   cleanly **and** the user's permission, which may already be explicit in the request.

**3D is a separate rendering decision.** Consult [spatial-design.md](../references/spatial-design.md):
CSS perspective for shallow UI depth, rendered assets for fixed compositions, Three.js
(optionally React Three Fiber in React) for interactive geometry, cameras, materials or shaders.
Do not exhaust the DOM animation ladder before choosing a scene renderer. Keep the existing
motion stack for DOM choreography.

| Platform | Ladder (stop at the first that fits) | Slot candidates |
|---|---|---|
| Web | CSS transition → `@starting-style`/CSS animation → WAAPI → existing library (Motion/framer-motion, react-spring) → View Transitions (route/shared element) → **GSAP** when it is installed, or step 4 above holds, for long timelines, pin/scrub scroll choreography, SVG morph, SplitText | `emil/animate`, `emil/choreograph`; `gsap/*` only after GSAP is chosen; `vercel/react-view-transitions` |
| React Native / Expo | `LayoutAnimation`/Reanimated layout animations for simple entering/exiting → Reanimated shared values + Gesture Handler for gestures → Skia for canvas effects. Without Reanimated: core `Animated` (native driver) or `LayoutAnimation`; adding Reanimated needs permission (native rebuild). Check Reanimated **major version** and New Architecture first. | `emil/animate-expo` (or alias `expo/expo-animation` — never both), `swm/react-native-best-practices` for API detail on New Architecture |
| iOS | SwiftUI: `withAnimation`, `.animation(value:)`, springs, `matchedGeometryEffect`, `PhaseAnimator`/`KeyframeAnimator` (check deployment target), `.transition`, navigation zoom transition where available. UIKit: `UIViewPropertyAnimator` (interruptible), `UIView.animate` with spring, Core Animation for layer-level work. | none — Apple docs (`ref/swiftui-animation`, `ref/core-animation`); `references/motion-principles.md` (Emil's web `apple-design` is not routed on native) |
| Android | Compose: `animate*AsState`, `AnimatedVisibility`, `AnimatedContent`, `updateTransition`, `SharedTransitionLayout`, spring specs; predictive back via NavigationEvent. Views: `MotionLayout`, `ViewPropertyAnimator`, `ObjectAnimator`, transitions framework. | `android/navigation-event`, `android/compose-performance`; docs `ref/compose-animation`, `ref/motionlayout` |
| Flutter | Implicit `Animated*` widgets → `TweenAnimationBuilder` → `Hero` / page transitions (`CustomTransitionPage` in go_router) → explicit `AnimationController` + `Tween`/`CurvedAnimation` → physics (`SpringSimulation`) → `animations` package (container transform) if present → Rive/Lottie for illustrative motion. | none — `ref/flutter-animation` |
| Any | Rive for interactive illustration/state machines; Lottie for designer-made playback | `ref/rive` |

**design** — Decide per animation: properties (transform/opacity first; avoid animating
layout-affecting properties), duration or spring, easing, origin, interruption, exit.
Built-in defaults when no motion skill is available: the timing, spring and
choreography tables in [../references/motion-principles.md](../references/motion-principles.md),
and the platform API notes in `platforms/<platform>.md` § Animation. Platform motion tokens
(Material 3 motion scheme, SwiftUI default springs) come first.

Reduced motion: replace movement with opacity/instant change; never hide content that only
appears via animation. Pointer-only effects (hover) are gated to pointer devices.

**audit** — Route `motion-review`: app-wide or several flows → `emil/improve-animations`
(read-only plans); one flow, one component or one diff → apply the motion checklist below yourself and recommend
`/review-animations` to the user (it is user-invoked). Remove sub-type → `emil/remove-animations`.

**discover** — Route `motion-discovery` (`emil/find-animation-opportunities`) for web/RN; for
other platforms apply the purpose test screen by screen. Output proposals with exact values; do
not implement.

**measure / fix (optimize)** — Measure before changing: web Performance panel / long-frame
inspection; RN perf monitor, JS vs UI thread, release build; iOS Instruments (Animation Hitches);
Android Profiler / JankStats / Compose recomposition counts; Flutter DevTools performance overlay
in profile mode. Route `motion-performance` for the platform.

## Motion checklist (review and validation)

- Purpose stated for each animation; nothing decorative on Operate screens without reason.
- Timing/easing/spring fits the kind table; enter vs. exit asymmetric; consistent across the flow.
- Interruptible: reversing mid-animation does not jump; rapid taps don't queue.
- Input never blocked by an animation.
- Runs on the compositor/UI thread (web transform/opacity; RN worklets on UI thread; no per-frame
  React re-render or `setState` in Flutter where an `AnimatedBuilder` suffices).
- Reduced-motion path implemented and checked.
- Platform conventions kept (native back gestures and transitions not hijacked).
- Evidence: L4 recording or frame sequence where possible; perf/feel claims need L5 (release build,
  slowest supported device) — otherwise state the limitation.

## Gate

Motion purposeful · values appropriate and consistent · interruptible · no input blocking ·
reduced motion works · performance acceptable at the evidence level achieved · L2 + L4 (L5 for
feel/perf claims).
