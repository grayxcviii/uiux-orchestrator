# Project intelligence

Inspect before deciding. Spend effort proportional to size: Small tasks read the target file
and the tokens/components it uses; Medium and Large tasks build the full profile. Never ask the
user for anything this file tells you how to find.

## 1. Platform and framework signatures

Check manifests first, then source extensions. **Versions:** lockfiles (`package-lock.json`,
`pnpm-lock.yaml`, `yarn.lock`, `bun.lock`, `pubspec.lock`, `Podfile.lock`, Gradle version catalogs)
are the source of truth; a manifest range alone is recorded as a range ("expo ~58.0.23, no lockfile").

**Monorepos:** find packages via `workspaces` (package.json), `pnpm-workspace.yaml`, `turbo.json`,
`nx.json`, or `settings.gradle`. Map the request's words ("the mobile app", a screen name) to the
package that contains the target, and profile that package. Ask only if the target exists in
several packages and the request doesn't say which.

| Platform | Strong signals | Distinguish |
|---|---|---|
| React Native **Expo** | `package.json` has `expo`; `app.json`/`app.config.*` with `expo` key | Managed vs. prebuild: presence of `ios/`, `android/` dirs. Expo Router: `expo-router` dep, `"main": "expo-router/entry"`, routes in `app/` or `src/app/`. |
| React Native **CLI** | `react-native` dep, no `expo` (or `expo` only as modules); `ios/*.xcworkspace`, `android/app/build.gradle` | |
| RN **New Architecture** | Always on for RN ≥ 0.82 and Expo SDK ≥ 55 (cannot be disabled). Older: an explicit flag wins over the default — Expo `newArchEnabled` in app config (default on from SDK 53); CLI `newArchEnabled` in `android/gradle.properties` and `RCT_NEW_ARCH_ENABLED` in the Podfile (default on from RN 0.76). If Android and iOS disagree, record both | Reanimated 4 **requires** New Architecture; Reanimated 3 (unmaintained) is what legacy projects have. Details: `platforms/react-native.md` §0. |
| Native **iOS** | `*.xcodeproj`, `*.xcworkspace`, `Package.swift`, `.swift` files | SwiftUI: `import SwiftUI`, `View` structs, `@main App`. UIKit: `UIViewController`, storyboards/xibs. Mixed is common. Read deployment target (`IPHONEOS_DEPLOYMENT_TARGET`) — it gates APIs. |
| Native **Android** | `build.gradle(.kts)` with `com.android.application`, `AndroidManifest.xml` | Compose: `androidx.compose` deps, `@Composable`. Views: `res/layout/*.xml`, `findViewById`/ViewBinding; Material Components (`com.google.android.material`) is M2 or M3 depending on the theme parent in `res/values/themes.xml` (`Theme.Material3.*` vs `Theme.MaterialComponents.*`) — "unknown" if absent. Read `minSdk`/`targetSdk`, Material version (`material3` vs `material`). |
| **Flutter** | `pubspec.yaml` with `flutter:` | `MaterialApp` vs `CupertinoApp` (`uses-material-design: false` = no Material icon font, usually Cupertino-first); `ThemeData` vs `CupertinoThemeData`. Design library import: `package:flutter/material.dart` vs. `package:material_ui/material_ui.dart` (and Cupertino equivalents). State: `flutter_riverpod`, `provider`, `flutter_bloc`, `get`. Routing: `go_router`, `auto_route`, Navigator 2.0. Design: `useMaterial3`, Cupertino widgets. |
| **Web** | `package.json` deps / `index.html` | Next.js (`next`; App Router = `app/`, Pages = `pages/`), React (`react` + Vite/CRA), Vue (`vue`, Nuxt `nuxt`), Angular (`@angular/core`), Svelte (`svelte`, SvelteKit `@sveltejs/kit`), Astro (`astro`), plain HTML/CSS/JS. |

If two platforms are present (e.g. Expo app + Next.js marketing site), profile the one the
request targets and note the other.

Unsupported or unknown stack (e.g. Qt, .NET MAUI, game engines, terminal UI): say so, apply
platform-agnostic UX and accessibility principles only, and route no platform-specific skill.

## 2. Styling, design system, components

| Look for | Where |
|---|---|
| Styling system | Tailwind (`tailwind.config.*`, `@theme` in CSS v4), CSS Modules (`*.module.css`), Styled Components/Emotion, vanilla-extract, Sass, UnoCSS; RN `StyleSheet`, NativeWind, Tamagui, Restyle, Unistyles; SwiftUI modifiers / asset catalog colors; Compose `MaterialTheme`; Flutter `ThemeData` |
| UI library | shadcn/ui (`components.json`, `components/ui/`), Radix, MUI, Ant Design, Chakra, Mantine, Headless UI, Vuetify, PrimeVue, Angular Material (theme in `styles.scss` or the `styles` entry of `angular.json`); RN Paper, Gluestack, Tamagui, `@expo/ui`; Compose Material 3 |
| Tokens | CSS variables in global CSS, Tailwind theme, `theme.ts`, `tokens.json` (DTCG), Asset Catalog, `colors.xml`/`themes.xml`, `ThemeData`/`ColorScheme`, `DESIGN.md`, `design-system/*/MASTER.md`, `PRODUCT.md` |
| Typography / spacing | type scale definitions, font loading (`next/font`, `expo-font`, `UIFont`, `res/font`, `pubspec` fonts), spacing scale |
| Existing components | the folder that holds shared components; list the ones relevant to the target |
| Dark mode / theming | `dark:` variants, `prefers-color-scheme`, `useColorScheme`, `ColorScheme`, `isSystemInDarkTheme` |

## 3. Motion, navigation, state

For spatial/3D requests, also inspect `three`, `@react-three/fiber`, `@react-three/drei` or other
scene renderers, their versions/framework compatibility, existing canvas boundaries, model/texture
assets and loaders, asset rights, static fallbacks and supported device classes. Record findings
with the motion stack; do not assume a renderer is available merely because 3D was requested.

| Area | Signals |
|---|---|
| Web motion | `motion`/`framer-motion`, `gsap`, `@react-spring/*`, `animejs`, `lottie-web`, `@rive-app/*`, CSS `@keyframes`/`transition`, View Transitions API; Vue `<Transition>`/`<TransitionGroup>`; Svelte `transition:`/`animate:`; Angular's animations package or its newer built-in enter/leave animations (check the project's Angular version docs before choosing) |
| RN motion | `react-native-reanimated` (**read the major version**), `react-native-worklets`, `react-native-gesture-handler`, `@shopify/react-native-skia`, `moti`, `lottie-react-native`, `rive-react-native`, `expo-haptics` |
| iOS motion | `withAnimation`, `matchedGeometryEffect`, `PhaseAnimator`, `KeyframeAnimator`, `UIViewPropertyAnimator`, `CABasicAnimation`, Lottie, Rive |
| Android motion | `animate*AsState`, `AnimatedVisibility`, `updateTransition`, `SharedTransitionLayout`, `MotionLayout`, `ObjectAnimator`, Lottie, Rive |
| Flutter motion | `AnimationController`, implicit `Animated*` widgets, `Hero`, `animations` package, `flutter_animate`, Rive, Lottie |
| Reduced motion | `prefers-reduced-motion`, `useReducedMotion`, `AccessibilityInfo.isReduceMotionEnabled`, `accessibilityReduceMotion`, `ANIMATOR_DURATION_SCALE`, `MediaQuery.disableAnimations` |
| Navigation / state | router packages above; Redux/Zustand/Jotai/Pinia/NgRx/Riverpod/Bloc/TCA — record, **never change** without permission |

## 4. Commands and visual tooling

Record the active runtime separately from compatible installed alternatives. A PATH Node20
does not rule out a skill requiring Node22 when nvm/Volta/fnm/mise/asdf already provides one.
For Node-gated candidates, use the bundled `scripts/probe-runtime.py` before routing exclusions;
preserve its observations and invoke the selected binary by absolute path without changing defaults.

- Build, dev, lint, typecheck, test commands: `package.json` scripts, `Makefile`, Gradle tasks,
  `xcodebuild` schemes, `flutter` commands, CI config (`.github/workflows`).
- Visual testing already in the project: Storybook, Ladle, Playwright/Cypress, Chromatic,
  Percy, Loki, Paparazzi/Roborazzi, swift-snapshot-testing, Flutter golden tests, Maestro, Detox.
- Visual tooling available **in this agent environment** (check, don't assume): browser
  automation tools (e.g. Playwright MCP, Chrome DevTools MCP, an in-app browser), `xcrun simctl`,
  `adb`/`emulator`, `flutter devices`, Callstack `agent-device`. Record which exist.

## 5. Conventions

Naming (files, components, props), folder structure, import style, how existing screens handle
loading/empty/error states, test placement, i18n mechanism (`i18next`, `Localizable.strings`,
`strings.xml`, `intl`/ARB). Read two neighbouring files of the target and mirror them.

## Output: Project Profile

```yaml
target: path(s) of the screen/component in scope
platform: web | react-native-expo | react-native-cli | ios | android | flutter | unsupported
framework: e.g. "Next.js 15 App Router" / "SwiftUI, iOS 17" / "Compose, M3, minSdk 26"
architecture_flags: what gates APIs — RN "New Arch: off (android+ios)", "Expo prebuild: no", Gesture Handler v2|v3, Reanimated 3|4 (+ worklets present?); iOS deployment target + device family; Android minSdk/targetSdk (≥ 35 → edge-to-edge enforced); declared web browser targets
styling: …
ui_library: …
design_source: tokens file(s) / DESIGN.md / none
reusable_components: [the ones relevant to the target, each with its usage count — "shared" means used elsewhere]
motion_stack: e.g. "reanimated 3.16, gesture-handler 2.20, no haptics"
navigation_state: … (do-not-change)
conventions: 2–4 bullets
commands: {dev, build, lint, typecheck, test}
visual_tooling: {project: [...], environment: [...]}
gaps: [what is missing or not wired, e.g. "no tokens; colors hardcoded", "globals.css not imported by the root layout"]
```

Write `unknown (<why>)` for anything the files don't show — never guess. On the fast path, record only
platform, target and what the target imports. Reuse this profile for the rest of the task; re-inspect
only files you will edit.
