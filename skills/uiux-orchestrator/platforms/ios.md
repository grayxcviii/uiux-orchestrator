# Platform: iOS / iPadOS (SwiftUI and UIKit)

Covers native apps in SwiftUI, UIKit, or both. Cross-platform principles:
`references/visual-design.md`, `references/motion-principles.md`, `references/accessibility.md`.
Read only the sections the task touches.

Last checked: 2026-11-06. Version facts are in §0. **API availability is gated by the project's
deployment target** (`IPHONEOS_DEPLOYMENT_TARGET`). Check it before using an API, and wrap newer APIs
in `if #available`.

## 0. Version gates (check before using)

| Fact | Status 2026-11-06 | Consequence |
|---|---|---|
| Current | iOS 27.2, Xcode 27.2 (27.3 in beta) | The local Xcode may be older; check `xcodebuild -version` |
| Liquid Glass | Introduced in iOS 26. In iOS 27 it was retuned, users got a clear↔tinted slider, and Apple removed the option to keep the old design for apps built with Xcode 27 | Apps built with Xcode 27 get the new bars, sheets and controls on iOS 26+. When the deployment target is below 26, gate the old-look customizations with `if #available(iOS 26, *)` instead of deleting them |
| Glass APIs (iOS 26+) | `glassEffect(_:in:)`, `GlassEffectContainer`, `glassEffectID`, `.buttonStyle(.glass/.glassProminent)`, UIKit `UIGlassEffect`, `tabBarMinimizeBehavior`, `tabViewBottomAccessory`, `ToolbarSpacer`, `scrollEdgeEffectStyle`, `backgroundExtensionEffect()` | Gate with `#available(iOS 26, *)` when the target is lower |
| iOS 27 SwiftUI additions | `Tab(role: .prominent)`, `visibilityPriority(_:)`, `ToolbarOverflowMenu`, `toolbarMinimizeBehavior(...)`; iPhone apps can be resized | Use only with an iOS 27 target or availability checks |
| Default animation | `.default` is a spring since iOS 17 (easeInOut before) | `withAnimation { }` springs by default |
| iOS 17 | `PhaseAnimator`, `KeyframeAnimator`, `symbolEffect`, `sensoryFeedback`, UIKit `UIView.animate(springDuration:bounce:…)`, `performAccessibilityAudit()` | — |
| iOS 18 | `Tab` API, `.sidebarAdaptable`, `navigationTransition(.zoom(sourceID:in:))` + `matchedTransitionSource` | — |
| iOS 16 | `NavigationStack`, `presentationDetents` | Below 16: `NavigationView` (deprecated) |
| Instruments | SwiftUI instrument (Xcode 26+), Hangs and Hitches; Organizer hitch metric (Xcode 27) | Use for SwiftUI perf work |

## 1. Principles (HIG)

- **Clarity, deference, depth.** Content leads; chrome recedes. With Liquid Glass, controls float on
  a glass layer above content, so let content run under bars instead of boxing it in.
- **Use system components** first (navigation bars, tab bars, lists, forms, sheets, menus, pickers).
  They get Liquid Glass, Dynamic Type, Dark Mode, accessibility and RTL for free. Custom
  replacements usually lose some of that.
- Consistency with iOS beats consistency with Android or the web. Cross-platform brands still use
  iOS navigation, controls and gestures on iOS.
- Respect user settings: Dynamic Type, Dark Mode, Reduce Motion, Reduce Transparency, Increase
  Contrast, Bold Text, and the Liquid Glass tint preference.

## 2. Layout, spacing, adaptive

- Safe areas and layout margins. Content goes edge to edge under bars (scroll edge effects handle
  legibility); interactive elements stay inside safe areas.
- Size classes (`horizontalSizeClass`) drive adaptivity, not the device model. Since iOS 27 iPhone
  apps can be resized and iPad windows are freely resizable, so layouts must adapt continuously.
- `NavigationSplitView` for list–detail on iPad/regular width. On iOS 18+ use
  `TabView(...).tabViewStyle(.sidebarAdaptable)` for tab ↔ sidebar.
- SwiftUI: stacks plus `Grid`/`LazyVGrid`, `ViewThatFits` for "fits or stacks", `.frame(maxWidth:)`
  to cap reading width. Avoid fixed frames on text. Use `@ScaledMetric` for spacing and icon sizes
  that should scale with text.
- UIKit: Auto Layout with `layoutMarginsGuide` / `safeAreaLayoutGuide`, `UIStackView`, and
  self-sizing cells.

## 3. Typography

- Use system text styles (`.font(.body)`, `UIFont.preferredFont(forTextStyle:)` with
  `adjustsFontForContentSizeCategory = true`). Default sizes at the Large setting, in pt (size/leading):

| Style | Size/leading | Style | Size/leading |
|---|---|---|---|
| Large Title | 34/41 | Body | 17/22 |
| Title 1 | 28/34 | Callout | 16/21 |
| Title 2 | 22/28 | Subheadline | 15/20 |
| Title 3 | 20/25 | Footnote | 13/18 |
| Headline | 17/22 semibold | Caption 1 / 2 | 12/16 · 11/13 |

- Body grows to 28–53 pt at accessibility sizes (AX1–AX5). Layouts must reflow: stack horizontally
  arranged content (`ViewThatFits`, or a `dynamicTypeSize.isAccessibilitySize` check); never truncate
  primary text.
- Fonts: SF Pro (system), New York (`.fontDesign(.serif)`), SF Mono, rounded. Custom fonts must
  scale: `Font.custom(_:size:relativeTo:)` / `UIFontMetrics`.

## 4. Color and materials

- Use semantic system colors (`Color.primary`, `.secondary`, `Color(.systemBackground)`,
  `.label`, `.secondaryLabel`, `.separator`, `.tint`) or Asset Catalog colors with light/dark (and
  high-contrast) variants. Avoid fixed RGB for text and backgrounds.
- Contrast (HIG): 4.5:1 for text up to 17 pt, 3:1 for 18 pt+ or bold. Check Increase Contrast
  variants.
- Liquid Glass: don't stack glass on glass. Use the Regular variant by default and Clear only over
  media. Tint sparingly (`.regular.tint(...)`) for the primary action. Reduce Transparency, Increase
  Contrast and Reduce Motion are applied automatically by system glass. Custom blur imitations are
  not.
- One accent (`.tint`) app-wide for interactive elements.
- Without a brand color, follow the premium monochrome posture in `references/visual-design.md` §4
  (system semantic colors already lean that way; avoid the default indigo/purple tints). Brand
  colors go in the Asset Catalog with the Display P3 gamut (or `Color(.displayP3, red:green:blue:)`)
  so they are not clipped to sRGB.

## 5. Components and conventions

- Buttons: system styles (`.bordered`, `.borderedProminent`, `.glass`, `.glassProminent` on 26+).
  Capsule shapes are the default in the new design. One prominent action per view.
- Hit targets: the HIG default control size is **44×44 pt** (minimum 28×28 pt). Use 44 for
  touch-first controls; enlarge hit areas with `.contentShape` / `.frame(minWidth:minHeight:)`
  rather than visuals.
- Lists/forms: `List`, `Form`, `Section` with standard row styles; swipe actions
  (`.swipeActions`) with a non-swipe alternative (context menu or edit mode).
- Menus: `Menu`, `.contextMenu` for secondary actions. Pickers: native `Picker`, `DatePicker`.
- Sheets: `.sheet` + `presentationDetents([.medium, .large])`. In the new design partial sheets get
  inset glass, so remove `presentationBackground`. Use alerts only for important interruptions;
  `.confirmationDialog` for destructive choices.
- SF Symbols for icons (weights match text; `symbolEffect` for state changes on 17+).
- States: `ContentUnavailableView` for empty/error states (iOS 17+); `ProgressView`; `.redacted`
  placeholders.

## 6. Navigation

- Hierarchical: `NavigationStack` (16+) with `navigationDestination`. Large titles on top-level
  screens, inline titles deeper. Keep the system back button and the edge-swipe back gesture. Never
  disable or override them without reason.
- Flat: `TabView`, 3–5 tabs, each keeping its own stack. In iOS 26+ the tab bar floats and can
  minimize on scroll (`tabBarMinimizeBehavior(.onScrollDown)`). Search can be a tab
  (`Tab(role: .search)`).
- Modal: sheets for focused tasks, with a clear Cancel/Done. Full-screen covers only for immersive
  flows.
- Toolbars: `.toolbar` with placements. Group related items. In the new design use `ToolbarSpacer`
  to separate groups instead of custom backgrounds.

## 7. Interaction and input

- Direct manipulation: gestures track 1:1 and settle with springs. Every custom gesture has a
  visible alternative.
- Don't use the screen's left edge for horizontal gestures (system back) or the bottom edge (home
  indicator).
- Haptics: `sensoryFeedback(.selection / .success / .impact, trigger:)` (17+) or
  `UIFeedbackGenerator`. Always pair with a visual change.
- iPad: pointer hover effects (`.hoverEffect`), keyboard shortcuts (`.keyboardShortcut`), drag and
  drop, multiple windows where the app supports them.

## 8. Accessibility specifics

- SwiftUI: `.accessibilityLabel`, `.accessibilityValue`, `.accessibilityHint`,
  `.accessibilityAddTraits(.isButton/.isHeader)`, `.accessibilityElement(children: .combine)`,
  `.accessibilityHidden(true)` for decoration, `.accessibilityAction` for custom actions (an
  alternative to swipes), `.accessibilityRotor` for long content.
- UIKit: `isAccessibilityElement`, `accessibilityLabel/Traits/Value`, `accessibilityElements` order,
  `UIAccessibility.post(notification:argument:)` for announcements and screen changes.
- Reduce Motion: `@Environment(\.accessibilityReduceMotion)` / `UIAccessibility.isReduceMotionEnabled`.
  Replace slides and zooms with cross-fades.
- Test:
  - VoiceOver walkthrough;
  - largest accessibility text size (`xcrun simctl ui booted content_size
    accessibility-extra-extra-extra-large`);
  - Increase Contrast;
  - Accessibility Inspector audit;
  - `XCUIApplication().performAccessibilityAudit()` in UI tests (iOS 17+).

## 9. Animation

Follow the tool decision in `workflows/animation.md`. No external skill builds native iOS motion;
`emil/apple-design` gives principles only.

- **SwiftUI**:
  - `withAnimation(.smooth / .snappy / .bouncy / .spring(duration:bounce:))` or
    `.animation(_:value:)` scoped to a value. Springs are the default; keep bounce at 0 for most UI.
  - `.transition(.opacity / .move / .scale.combined(with:))` for insertion and removal.
  - `matchedGeometryEffect` for in-screen hero moves.
  - `navigationTransition(.zoom(sourceID:in:))` + `matchedTransitionSource` for push/sheet zooms
    (18+).
  - `PhaseAnimator` / `KeyframeAnimator` for multi-step motion (17+).
  - `symbolEffect` for icon state (17+).
  - Glass morphing: `GlassEffectContainer` + `glassEffectID` (26+).
- **UIKit**:
  - `UIViewPropertyAnimator` for interruptible, scrubbable animations, and for gesture-driven ones
    (continue with the gesture velocity).
  - `UIView.animate(springDuration:bounce:)` (17+).
  - Core Animation (`CABasicAnimation`, `CASpringAnimation`) for layer properties.
  - Custom view-controller transitions via `UIViewControllerAnimatedTransitioning` only when the
    system transition can't do it.
- Interruptibility: SwiftUI animations are additive and interruptible by default. In UIKit use
  property animators, not completion-chained `animate` calls.
- Reduced motion path for every non-trivial animation.

## 10. Performance

- Profile a **Release build on a device** with Instruments: the SwiftUI instrument (update groups,
  long view body updates, cause & effect graph), Hangs and Hitches, and Time Profiler.
- SwiftUI:
  - keep `body` cheap and side-effect free;
  - split views so state changes invalidate small subtrees;
  - use the `@Observable` macro (17+) for fine-grained updates;
  - use `Lazy*` stacks for long content;
  - give `ForEach` stable identifiers;
  - avoid heavy work in `onAppear`.
- Liquid Glass and blur are GPU work. Don't nest glass. Use `GlassEffectContainer` to group nearby
  glass elements.
- UIKit: cell reuse, prefetching, no layout work in `scrollViewDidScroll`, and pre-sized images.

## 11. Validation

- L1: build warnings, SwiftLint if configured. L2: `xcodebuild -scheme <scheme> -destination
  'platform=iOS Simulator,name=<device>' build`. L3: `xcodebuild test` (XCTest / Swift Testing,
  UI tests, snapshot tests if present).
- L4 on the simulator:
  - `xcrun simctl io booted screenshot <file>`;
  - `xcrun simctl ui booted appearance dark|light`;
  - `xcrun simctl ui booted content_size <size>`;
  - `xcrun simctl ui booted increase_contrast enabled`;
  - `xcrun simctl status_bar booted override --time 9:41` for clean captures.
  Capture a small iPhone (SE-class), a large iPhone, and an iPad if supported. Use a dedicated
  simulator UDID and restore its appearance/content size afterwards.
- L5: device for haptics, gesture feel, glass rendering and performance.

## 12. Common mistakes

- Custom navigation bars/tab bars/back buttons that break the swipe-back gesture or Liquid Glass.
- Custom backgrounds on bars and sheets (`toolbarBackground`, `presentationBackground`) that fight
  the new design. On iOS 26+ remove them; keep them behind an availability check for older targets.
  Express brand color through `.tint`, not opaque bar fills.
- Glass on glass; glass used as decoration on content.
- Fixed font sizes (`.font(.system(size: 15))`) that ignore Dynamic Type; truncated text at AX sizes.
- Fixed colors that fail in Dark Mode or Increase Contrast.
- Using APIs above the deployment target without `#available`.
- Hamburger menus instead of tabs; Android-style FABs and snackbars.
- Animations chained with completion handlers (not interruptible); no Reduce Motion alternative.
- Tap targets far below 44 pt on touch-first controls.

## Sources

- Apple releases: https://developer.apple.com/news/releases/
- HIG: https://developer.apple.com/design/human-interface-guidelines (accessibility, typography, materials, tab bars, toolbars, sheets)
- WWDC25: 219 (Liquid Glass design), 323 (SwiftUI new design), 306 (SwiftUI performance) · WWDC26: 102, 269, 258 — https://developer.apple.com/videos/
- SwiftUI docs: https://developer.apple.com/documentation/swiftui (Animation.default, navigationTransition, glassEffect, PhaseAnimator) · UIKit: https://developer.apple.com/documentation/uikit/uiviewpropertyanimator
- Accessibility audit: https://developer.apple.com/videos/play/wwdc2023/10035/
- `simctl` subcommands: verified with `xcrun simctl help` on Xcode 26.6 (local), not against Xcode 27.
