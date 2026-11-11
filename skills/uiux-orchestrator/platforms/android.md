# Platform: Android (Jetpack Compose and Views)

Covers native apps in Jetpack Compose, Android Views (XML), or both, with Material Design 3.
Cross-platform principles: `references/visual-design.md`, `references/motion-principles.md`,
`references/accessibility.md`. Read only the sections the task touches.

Last checked: 2026-11-06. Version facts are in §0. Behavior depends on **`targetSdk`**,
`minSdk`, the Compose BOM / Material3 version and the device OS. Read them before deciding.

## 0. Version gates (check before using)

| Fact | Status 2026-11-06 | Consequence |
|---|---|---|
| Current platform | Android 17 = API 37 | `targetSdk` drives the behavior changes below |
| Compose Material 3 | Stable **1.4.0**. **1.5.0-rc01** (Nov 2026) carries the M3 Expressive APIs (MotionScheme, expressive buttons/FAB, toolbars); `MaterialShapes` and `LoadingIndicator` are still experimental | Expressive is not in a stable release yet. Use it only if the project is already on 1.5 pre-releases, or the user accepts that. Don't bump versions unasked |
| Compose animation | Shared element APIs (`SharedTransitionLayout`, `sharedElement`, `sharedBounds`) **stable since 1.10.0**; no Views interop (incl. `Dialog`, `ModalBottomSheet`) | Fine to use on a current BOM |
| Edge-to-edge | Enforced on Android 15+ when `targetSdk ≥ 35`. For `targetSdk 36` on Android 16 the opt-out (`windowOptOutEdgeToEdgeEnforcement`) is disabled | Always handle insets. Call `enableEdgeToEdge()` for consistent behavior on older OS versions |
| Predictive back | System animations (back-to-home, cross-activity, cross-task) on by default for `targetSdk ≥ 36` on Android 16+; `onBackPressed` not called | Use `OnBackPressedDispatcher` / Compose `BackHandler`, `PredictiveBackHandler`, or NavigationEvent (`NavigationBackHandler`, stable 1.x) |
| Large screens | For `targetSdk 36`, orientation, resizability and aspect-ratio restrictions are ignored on displays with sw ≥ 600dp (games exempt). `targetSdk 37` removes the temporary opt-out | Every screen must work in any size and orientation on tablets/foldables |
| Window size classes | Width: compact < 600, medium 600–839, expanded 840–1199, large 1200–1599, extra-large ≥ 1600dp. Large/XL need `currentWindowAdaptiveInfo(supportLargeAndXLargeWidth = true)`. Height: < 480, 480–899, ≥ 900dp | Adapt by window, not device |
| Text scaling | Up to 200%, non-linear (Android 14+) | `sp` for text and line height only |
| Compose compiler | Strong skipping on by default since Kotlin 2.0.20 | Fewer stability workarounds needed |
| Screenshot tests | The standalone Compose Preview Screenshot Testing plugin is **no longer maintained**. Google recommends AGP test suites (AGP 9.5+) with `@PreviewTest` | Use the project's existing setup (Paparazzi, Roborazzi, or AGP test suites) |

## 1. Principles (Material 3)

- Use **Material 3 components and tokens** (`MaterialTheme.colorScheme`, `typography`, `shapes`).
  Components adapt to dynamic color, dark theme, font scale and accessibility for free.
- M3 Expressive expands M3 with research-backed theming, components, motion and type. Treat it as
  an option for projects that adopt it, not a reason to restyle a stable M3 app.
- Android conventions beat iOS habits on Android: system back (gesture and button), top app bars,
  FABs where a primary creation action exists, snackbars, navigation bar/rail, Material pickers.
- Dynamic color (Material You) is a product decision. Keep the project's choice (`dynamicColor`
  flag in the theme).

## 2. Layout, spacing, adaptive

- Edge-to-edge: draw behind system bars and apply `WindowInsets` deliberately:
  - `Scaffold` passes `innerPadding`; apply it;
  - `Modifier.windowInsetsPadding(WindowInsets.safeDrawing)`;
  - `imePadding()` for forms.
  Lists add bottom content padding for the navigation bar.
- Adaptive navigation: `NavigationSuiteScaffold` (bar on compact; rail otherwise). Canonical
  layouts: `ListDetailPaneScaffold`, `SupportingPaneScaffold` (check the adaptive library's opt-in
  status in the project's version).
- Spacing in `dp` on the project's scale (M3 uses a 4dp baseline; common steps 4/8/12/16/24/32).
  Margins: 16dp on compact, 24dp on medium/expanded.
- Views: `ConstraintLayout`, `WindowInsetsCompat`, `ViewCompat.setOnApplyWindowInsetsListener`;
  resource qualifiers (`layout-w600dp`) or `WindowSizeClass` for adaptive layouts.
- Avoid fixed widths/heights on text containers. In `Row`s, use `Modifier.weight(1f)` for text and
  let it wrap.

## 3. Typography

- 15 M3 roles: display / headline / title / body / label × large / medium / small. Defaults run
  from displayLarge 57/64 sp to labelSmall 11/16 sp. Use `MaterialTheme.typography.<role>`; custom
  fonts go through the theme's `Typography`.
- `sp` for font size and line height; never for padding. Don't compute sizes from `fontScale`.
- Test at font scale 2.0. Text wraps; layouts stack; buttons grow in height.

## 4. Color and theming

- Color roles from `MaterialTheme.colorScheme`: primary/onPrimary, primaryContainer/onPrimaryContainer,
  surface/surfaceContainer* levels, outline, error… Elevation is expressed through tonal surface
  containers.
- Light and dark schemes (`isSystemInDarkTheme()`). Optional dynamic color on Android 12+.
- The Material 3 baseline scheme is purple (`#6750A4`), a template signature: never ship it.
  Without a brand color, hand-tune a premium monochrome scheme (`references/visual-design.md` §4).
  Seed-generated schemes (tonal spot) desaturate a brand hue; for a brand color, hand-tune
  primary/tertiary containers or use a more faithful scheme variant; wide-gamut brand colors use `ColorSpaces.DisplayP3` with
  `android:colorMode="wideColorGamut"` (API 26+).
- Contrast: 4.5:1 for text under 18sp (14sp bold), 3:1 for larger text and UI elements.
- System bar icons: `enableEdgeToEdge()` sets light/dark icons from the theme. Check legibility over
  content.

## 5. Components and conventions

- Use M3 components: `Button`/`FilledTonalButton`/`OutlinedButton`/`TextButton` (hierarchy),
  `FloatingActionButton` (one primary creation action), `TopAppBar` variants with scroll behaviors,
  `NavigationBar`, `NavigationRail`, `ModalBottomSheet`, `SnackbarHost`, `ListItem`, `Card`,
  `SearchBar`, `DatePicker`, `SegmentedButton`.
- Touch targets ≥ **48×48dp**. Material components enforce the minimum interactive size; custom
  clickables need `Modifier.minimumInteractiveComponentSize()` or a sized container.
- Feedback: ripple (`indication`) on clickables. Snackbars for undoable results. Dialogs only for
  decisions that block.
- States: loading (`CircularProgressIndicator`/`LinearProgressIndicator`, or skeletons), empty,
  error with retry. Collect state with lifecycle awareness (`collectAsStateWithLifecycle`).

## 6. Navigation

- Use the project's navigation library (Navigation Compose, Navigation 3, Fragments with Navigation
  component, or a custom one). Never switch it for a UI task.
- Back is a system concept: predictive back shows a preview of the destination. Don't intercept back
  unless there's state to save or a sheet to close. When you do, use the handler APIs so the
  predictive animation still works.
- Top-level destinations: navigation bar (3–5) on compact, rail or drawer on larger windows. Up
  (toolbar arrow) and back stay consistent.

## 7. Interaction and input

- Gestures: `Modifier.clickable`, `combinedClickable` (long-press), `draggable`, `swipeToDismiss`
  (M3 `SwipeToDismissBox`), `pointerInput` for custom gestures. Provide non-gesture alternatives
  (menu items, custom accessibility actions).
- Avoid conflicts with system gestures: the left/right edges (back) and the bottom (home). Use
  `Modifier.systemGestureExclusion()` sparingly.
- Haptics: `LocalHapticFeedback.current.performHapticFeedback(...)` or `View.performHapticFeedback`
  with `HapticFeedbackConstants`. Don't use the raw `Vibrator` for UI feedback.
- Keyboard, mouse, stylus on large screens: focus indication, `onKeyEvent` shortcuts, hover states
  for pointer input.

## 8. Accessibility specifics

- Compose semantics:
  - `contentDescription` on meaningful icons/images (`null` for decorative ones);
  - `Modifier.semantics { role = Role.Button; stateDescription = …; heading() }`;
  - `semantics(mergeDescendants = true)` for composite rows;
  - `clearAndSetSemantics { }` to replace children;
  - `customActions` for swipe alternatives;
  - `liveRegion` for status;
  - `hideFromAccessibility()` for decoration;
  - `traversalIndex` / `isTraversalGroup` for order.
- Views: `contentDescription`, `labelFor`, `importantForAccessibility`, `accessibilityHeading`,
  `ViewCompat.replaceAccessibilityAction`.
- Tests:
  - Compose: `composeTestRule.enableAccessibilityChecks()` (ui-test-junit4-accessibility, Compose
    1.8+) runs ATF checks;
  - Espresso: `AccessibilityChecks.enable()`;
  - manual: Accessibility Scanner and a TalkBack walkthrough.

## 9. Animation

Follow the tool decision in `workflows/animation.md`. Registry skills: `android/navigation-event`
(predictive back), `android/compose-performance`.

- **Compose**:
  - value animations: `animate*AsState`;
  - appear/disappear: `AnimatedVisibility`;
  - swapping content: `AnimatedContent` / `Crossfade`;
  - multi-property state: `updateTransition`;
  - size changes: `animateContentSize()`;
  - loops: `rememberInfiniteTransition`;
  - imperative control: `Animatable`;
  - shared elements: `SharedTransitionLayout` + `Modifier.sharedElement/sharedBounds` (stable since
    1.10).
- **Specs**:
  - `spring(dampingRatio, stiffness)` for interactive and interruptible motion;
  - `tween(durationMillis, easing = …)` with M3 easing for fixed motion;
  - on M3 1.5+ projects, `MaterialTheme.motionScheme` (standard for utilitarian UI, expressive for
    hero moments), with spatial vs. effects specs in fast, default and slow.
- **Predictive back**: `PredictiveBackHandler { progress -> … }` or NavigationEvent to drive custom
  back animations from the gesture progress.
- **Views**: `ViewPropertyAnimator`, `ObjectAnimator`/`AnimatorSet`, `MotionLayout`
  (constraint-based motion, scene XML), `TransitionManager`, `SpringAnimation` (dynamicanimation).
- **Reduced motion**: users set the animator duration scale (0 = "Remove animations"). Compose
  exposes `MotionDurationScale`. Verify on the device that animations collapse as expected, and add
  an explicit fallback for essential motion. Don't hide content behind animation.

## 10. Performance

- Measure on a release build on a device: Macrobenchmark (startup, scroll, animation frames),
  JankStats (`androidx.metrics:metrics-performance`), Perfetto/System Trace, Android Studio Profiler.
- Compose:
  - recomposition counts in Layout Inspector (API 29+);
  - read state as late as possible (lambda modifiers like `Modifier.offset { }`,
    `graphicsLayer { }` for animated values);
  - stable keys in `LazyColumn`/`LazyRow` items (`key =`, `contentType =`);
  - `derivedStateOf` for thresholds;
  - avoid allocations in composition.
- Baseline Profiles (Baseline Profile Gradle plugin + `BaselineProfileRule`) for startup and
  first-run jank.
- Views: flat hierarchies, `RecyclerView` with `DiffUtil`, no layout passes during animation.

## 11. Validation

- L1: `./gradlew lint`, ktlint/detekt if configured. L2: `./gradlew assembleDebug`. L3:
  `./gradlew testDebugUnitTest`, `connectedDebugAndroidTest` (needs a device/emulator), screenshot
  tests if present.
- Compose `@Preview(widthDp = 320, fontScale = 2f, uiMode = UI_MODE_NIGHT_YES)` helps while
  designing. Previews are not rendered evidence unless captured by a screenshot test.
- L4 on an emulator/device: `adb exec-out screencap -p > shot.png`. These widely used shell commands
  are not documented on developer.android.com, so verify the effect:
  - `adb shell settings put system font_scale 2.0`;
  - `adb shell cmd uimode night yes`;
  - `adb shell wm size 720x1280`.
  Check a compact phone, a large window (tablet or foldable emulator), dark theme, and 3-button vs.
  gesture navigation (insets). Restore afterwards: `font_scale 1.0`, `cmd uimode night no`,
  `wm size reset`.

## 12. Common mistakes

- Ignoring insets after edge-to-edge: content under the status/navigation bar, FABs behind the
  gesture bar, forms under the IME.
- Locking orientation or assuming phone width (ignored for `targetSdk 36` on large screens).
- Overriding back with `onBackPressed` (not called with predictive back on `targetSdk 36`).
- Hardcoded colors and text sizes instead of `colorScheme`/`typography`; `dp` used for text.
- Clickable `Box`es without role, label or a 48dp target.
- iOS patterns on Android: back chevrons in content, bottom-sheet action lists instead of menus,
  iOS-style switches.
- Reading fast-changing state in composition (recomposing every frame) instead of in the
  layout/draw phase.
- Upgrading Material3 to an rc/alpha, or the Compose BOM, just to use an Expressive component.

## Sources

- Android 17: https://developer.android.com/about/versions/17 · Android 16 behavior changes: https://developer.android.com/about/versions/16/behavior-changes-16
- Material 3 in Compose: https://developer.android.com/develop/ui/compose/designsystems/material3 · Releases: https://developer.android.com/jetpack/androidx/releases/compose-material3 (verified against Google Maven metadata)
- MotionScheme: https://developer.android.com/reference/kotlin/androidx/compose/material3/MotionScheme · Shared elements: https://developer.android.com/develop/ui/compose/animation/shared-elements
- Edge-to-edge: https://developer.android.com/develop/ui/views/layout/edge-to-edge · Predictive back: https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture · NavigationEvent: https://developer.android.com/jetpack/androidx/releases/navigationevent
- Window size classes: https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes · Adaptive navigation: https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation
- Accessibility: https://developer.android.com/guide/topics/ui/accessibility/apps · Compose a11y testing: https://developer.android.com/develop/ui/compose/accessibility/testing
- Performance: https://developer.android.com/topic/performance/baselineprofiles/overview · https://developer.android.com/topic/performance/jankstats · https://developer.android.com/develop/ui/compose/performance/stability/strongskipping
- Screenshot testing: https://developer.android.com/studio/preview/compose-screenshot-testing · adb: https://developer.android.com/tools/adb
