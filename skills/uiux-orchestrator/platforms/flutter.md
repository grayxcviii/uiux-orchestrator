# Platform: Flutter

Covers Flutter apps on iOS, Android (and desktop/web where the project targets them), with
Material and Cupertino. Cross-platform principles: `references/visual-design.md`,
`references/motion-principles.md`, `references/accessibility.md`. Read only the sections the task
touches.

Last checked: 2026-11-06. Version facts are in §0. Re-check them when the project's versions differ.

## 0. Version gates (check before using)

| Fact | Status 2026-11-06 | Consequence |
|---|---|---|
| Flutter stable | 3.47.9 (Dart 3.13.7), released 2026-10-29 | Read `pubspec.lock` / `flutter --version` for the project's real version |
| **Material and Cupertino as packages** | `material_ui` / `cupertino_ui` 1.x on pub.dev (publisher flutter.dev) since 3.47. The in-framework libraries were frozen in 3.44, and formal deprecation is announced for the next stable | Follow the project: if it imports `package:flutter/material.dart`, keep it. Migrating (`dart fix --apply --code=migrate_design_widgets`) is a separate, permissioned task. Check which one a project uses before adding widgets |
| Material 3 | Default since 3.16 (`useMaterial3: true`); M2 still selectable | Don't flip `useMaterial3` unasked |
| Impeller | Default on iOS (no Skia option) and on Android API 29+ since 3.27; default on desktop since 3.47. Older Android falls back to OpenGL | Judge performance with Impeller on a device |
| Text scaling | `TextScaler` / `MediaQuery.textScalerOf` (since 3.16); `textScaleFactor` deprecated | Never use `textScaleFactor` in new code |
| Android edge-to-edge | Default since 3.27 (target SDK 35); no opt-out on Android 16+ | Handle insets (`SafeArea`, `MediaQuery.paddingOf`) |
| Android page transition | `PredictiveBackPageTransitionsBuilder` default since 3.38 | Don't override the Android transition without reason |
| go_router | 18.x, flutter.dev, "feature-complete" (bug fixes only) | Fine to use; don't migrate routers unasked |
| `animations` package | 3.x, flutter.dev | Container transform, shared axis, fade through |

## 1. Principles

- Everything is a widget. Compose small widgets; keep `build` methods cheap and pure.
- One codebase, two platform expectations. Decide per project:
  - **Material everywhere** (most apps);
  - **adaptive**: Material, with platform-appropriate behavior and some Cupertino controls on iOS;
  - **Cupertino-first** for iOS-only apps.
  Mirror the existing choice.
- Platform behavior matters even with a custom look: back navigation, scroll physics, text selection,
  haptics, date pickers and safe areas should feel native on each OS.
- State management and routing are architecture (Riverpod, Provider, Bloc, GetX; go_router,
  auto_route, Navigator). Use the existing ones; never change them for a UI task.

## 2. Layout, spacing, adaptive

- Use `MediaQuery.sizeOf(context)` for whole-window decisions (cheaper than `MediaQuery.of`) and
  `LayoutBuilder` for the space a widget actually gets.
- Decide by **window size, not device type**. Material's guide: under 600 dp a bottom navigation bar;
  600+ a `NavigationRail`; expanded widths a list-detail layout. Never lock orientation just to avoid
  layout work.
- `SafeArea` around the Scaffold **body**, not the whole Scaffold (app bars handle their own insets).
  Nested `SafeArea`s pad only once.
- Use a spacing scale defined in the theme or a constants file, not ad-hoc `EdgeInsets`.
- Overflow: `Flexible`/`Expanded` in `Row`/`Column`, `softWrap` and `TextOverflow.ellipsis` only
  for secondary text, and test at text scale 2.0. The yellow-black overflow stripe in debug is a bug,
  never "fine in release".
- Long lists: `ListView.builder` / `SliverList` with item builders; slivers for complex scrolling.

## 3. Typography

- Use `Theme.of(context).textTheme` roles (displayLarge … labelSmall) instead of raw `TextStyle`s.
  Custom fonts go in `pubspec.yaml` and the theme.
- Respect `MediaQuery.textScalerOf`. Clamp only where layout genuinely cannot grow (e.g. a tab
  label), and never below the user's setting for body text.

## 4. Color and theming

- `ThemeData(colorScheme: ColorScheme.fromSeed(...))` or the project's `ColorScheme`. Widgets read
  `Theme.of(context).colorScheme.primary`, never hex literals.
- Replace the template's `Colors.deepPurple` seed: it is a generated-app signature. Without a
  brand color, hand-tune a premium monochrome `ColorScheme` (`references/visual-design.md` §4).
  `fromSeed` defaults to `DynamicSchemeVariant.tonalSpot`, which mutes the seed; for a brand color
  use `DynamicSchemeVariant.fidelity` (or `.vibrant`) or hand-tune the roles.
- Dark mode: `darkTheme` + `themeMode`. Check contrast in both.
- Custom tokens beyond the color scheme: `ThemeExtension<T>`.
- Respect high contrast and inverted colors (`MediaQuery.highContrastOf`; Android detection added
  in 3.47).

## 5. Components and conventions

- Use Material 3 components (`FilledButton`, `NavigationBar`, `SearchAnchor`, `SegmentedButton`,
  `Badge`, `BottomSheet`/`showModalBottomSheet`) before custom ones. On iOS-adaptive apps use the
  `.adaptive` constructors (`Switch.adaptive`, `CircularProgressIndicator.adaptive`, …) or Cupertino
  widgets where the project already does.
- Minimum interactive size 48×48 (`kMinInteractiveDimension`). Material components enforce it via
  `materialTapTargetSize`; custom `GestureDetector`s must do it themselves.
- Use `InkWell`/`InkResponse` for Material feedback (inside a `Material` ancestor); press-scale or
  opacity for Cupertino-style feedback.
- States: `FutureBuilder`/`StreamBuilder` or the state library's async value, rendering loading,
  error (with retry) and empty explicitly.

## 6. Navigation

- Follow the project's router (go_router: `GoRoute`, `ShellRoute`/`StatefulShellRoute` for tabs
  that keep their own stacks).
- Back behavior: Android predictive back via the default page transition. Use `PopScope` (not the
  deprecated `WillPopScope`) to intercept back.
- Custom transitions: go_router `CustomTransitionPage` or `pageBuilder` on one route. Adding a
  transition is not a routing change; changing the route tree is. A `CustomTransitionPage`
  **replaces** the theme's transition for that route, including the Android predictive back
  transition. Prefer keeping the default page and adding a `Hero`, or reimplement back-gesture
  behavior deliberately.

## 7. Interaction and input

- Gestures: `GestureDetector` / `InkWell`; `Dismissible` for swipe-to-dismiss; `Draggable` /
  `LongPressDraggable`. Every drag action needs a non-drag alternative.
- Haptics: `HapticFeedback.selectionClick()/lightImpact()`, sparingly and paired with visual
  feedback.
- Keyboard and focus (tablets, desktop, web): `Shortcuts`/`Actions`, `FocusTraversalGroup`, visible
  focus via theme `focusColor`.
- Text input: correct `keyboardType`, `textInputAction`, `autofillHints`. Scroll fields into view
  above the keyboard (`Scaffold.resizeToAvoidBottomInset`).

## 8. Accessibility specifics

- Most Material widgets are labelled. Add `Semantics(label:, button: true, …)` for custom controls,
  `semanticLabel` on `Icon`/`Image`, `ExcludeSemantics` for decoration, and `MergeSemantics` for
  composite rows.
- Debug with `SemanticsDebugger`. Test in widget tests:

```dart
final handle = tester.ensureSemantics();
await expectLater(tester, meetsGuideline(androidTapTargetGuideline));  // 48×48
await expectLater(tester, meetsGuideline(iOSTapTargetGuideline));      // 44×44
await expectLater(tester, meetsGuideline(labeledTapTargetGuideline));
await expectLater(tester, meetsGuideline(textContrastGuideline));
handle.dispose();
```

- Manual: TalkBack and VoiceOver walkthrough; largest text; `MediaQuery.disableAnimationsOf`
  respected.

## 9. Animation

Choose in this order, as in the official decision tree:

1. Pre-built implicit widgets: `AnimatedContainer`, `AnimatedOpacity`, `AnimatedAlign`,
   `AnimatedSwitcher` (same-type children need distinct `Key`s).
2. Custom implicit: `TweenAnimationBuilder`.
3. Built-in explicit transitions: `FadeTransition`, `SlideTransition`, `ScaleTransition` driven by
   an `AnimationController`.
4. Custom explicit: `AnimatedBuilder` / `AnimatedWidget`.

Then:
- **Shared element:** `Hero` with a stable tag (e.g. `'product-$id'`) on both pages.
  - It flies only between routes in the **same Navigator**. go_router `ShellRoute` branches and
    root-navigator routes don't share heroes; moving a route between navigators is a routing change.
  - `transitionOnUserGestures: true` makes the hero follow the iOS swipe-back and Android predictive
    back gesture.
  - Rounded images: give both ends the same shape, or use a `flightShuttleBuilder`; avoid animating a
    `ClipRRect` radius.
  - Reduced motion: `HeroMode(enabled: !MediaQuery.disableAnimationsOf(context), child: …)`.
- **Container transform, shared axis, fade through:** the `animations` package, if installed.
- **Physics:** `SpringSimulation` with `controller.animateWith(...)` for gesture releases. Pass the
  gesture velocity.
- **Illustrative / state-machine animation:** Rive or Lottie (only if already used or approved).

Rules:
- Dispose controllers (`SingleTickerProviderStateMixin`, `dispose()`).
- Use `Curves.easeOutCubic` / `Curves.easeInOutCubicEmphasized` (M3) instead of linear.
- Reduced motion: `if (MediaQuery.disableAnimationsOf(context))` → `Duration.zero` or a crossfade.
- Don't animate `Opacity` (use `FadeTransition`/`AnimatedOpacity`). Don't clip during animation.

## 10. Performance

- Measure in **profile mode on a physical device** (`flutter run --profile`), using the DevTools
  Performance view and the performance overlay. Debug mode and emulators are not representative.
- `const` constructors and stable child instances avoid rebuilds. Split large `build` methods;
  scope `setState` and providers to the smallest subtree; use `select` with Riverpod/Provider.
- Avoid `saveLayer` triggers (`Opacity`, `ShaderMask`, `ColorFilter`, `BackdropFilter`) in
  animated or scrolling content. Avoid clips (prefer `borderRadius` on decorations).
- `RepaintBoundary` around expensive, static subtrees that are moved or faded. Don't wrap
  everything.
- Impeller precompiles shaders. If first-run jank appears, confirm Impeller is active before deeper
  fixes.

## 11. Validation

- `flutter analyze` (L1); `flutter build apk --debug` / `flutter build ios --simulator` (L2);
  `flutter test` including golden tests (`matchesGoldenFile`, update with `--update-goldens`) (L3).
- L4: `flutter run -d <device>` then `flutter screenshot`, or simulator/emulator capture
  (`xcrun simctl io booted screenshot`, `adb exec-out screencap -p`). `integration_test`'s
  `takeScreenshot` for automated flows (on Android call `convertFlutterSurfaceToImage()` first).
- Check text scale 2.0, dark theme, a compact and an expanded width, and disabled animations.

## 12. Common mistakes

- Hardcoded colors/`TextStyle`s instead of `colorScheme`/`textTheme`.
- `RenderFlex overflowed` ignored; fixed heights on text containers; untested text scale.
- `Opacity` in animations; `setState` at the top of a big tree on every tick; controllers not
  disposed.
- `SafeArea` missing (content under the status/navigation bar after edge-to-edge) or wrapping the
  whole Scaffold.
- Custom `GestureDetector` buttons with no semantics and tap targets under 48.
- Checking `Platform.isIOS` to choose layouts instead of window size.
- Mixing `material.dart` and `material_ui` imports in one project.
- Changing the state-management or router package as part of a UI task.

## Sources

- Release notes: https://docs.flutter.dev/release/release-notes · Material UI packages: https://docs.flutter.dev/release/breaking-changes/material-ui-and-cupertino-ui · https://pub.dev/packages/material_ui
- Impeller: https://docs.flutter.dev/perf/impeller · Performance: https://docs.flutter.dev/perf/ui-performance, https://docs.flutter.dev/perf/best-practices
- Animations: https://docs.flutter.dev/ui/animations · https://pub.dev/packages/animations · Android transition: https://docs.flutter.dev/release/breaking-changes/default-android-page-transition
- Adaptive: https://docs.flutter.dev/ui/adaptive-responsive/general · SafeArea: https://docs.flutter.dev/ui/adaptive-responsive/safearea-mediaquery · Edge-to-edge: https://docs.flutter.dev/release/breaking-changes/default-systemuimode-edge-to-edge
- Accessibility: https://docs.flutter.dev/ui/accessibility · testing: https://docs.flutter.dev/ui/accessibility/accessibility-testing · TextScaler: https://docs.flutter.dev/release/breaking-changes/deprecate-textscalefactor
- go_router: https://pub.dev/packages/go_router · CLI: https://docs.flutter.dev/reference/flutter-cli
