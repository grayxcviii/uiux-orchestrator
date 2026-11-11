# Component intelligence (platform-agnostic)

Load at the `components` stage, or whenever a task adds or changes an interactive component.
Decide **which component** the task needs and **what it must do** before choosing code. The
contract is the same on every platform; only the implementation source changes.

Vocabulary follows the shared-catalog idea of A2UI (one component name, one meaning across
renderers; `ref/a2ui-catalog`). Interaction rules on the web follow WAI-ARIA APG
(`ref/wai-aria-apg`). Last checked: 2026-11-11.

## 1. Resolution order

For each needed component, take the first source that can meet the contract:

1. **Project component** that already exists (search the codebase first).
2. **Platform/system component** (HTML element, SwiftUI, Compose Material 3, Flutter widget,
   React Native core or the project's navigation library).
3. **Installed library the project already uses.** On React: `shadcn/ui` (search registries,
   compose existing components); `magicui/components` only for a recorded motion moment that
   passes the [Magic UI filter](#6-magic-ui-filter). Adding a new library needs permission.
4. **Platform references** to implement it correctly: `ref/rn-reusables`,
   `ref/flutter-widget-catalog`, `ref/compose-material3`, `ref/apple-hig-components`.
5. **Build from this contract** with project tokens and primitives.

Whatever the source, the result must pass the [universal contract](#2-universal-contract) and
its row in [§4](#4-component-contracts). Record the source and the contract in the component
handoff.

## 2. Universal contract

Every interactive component, on every platform:

- **States:** default, hover (pointer), pressed, focus-visible, disabled, loading where async,
  selected/checked where relevant, error/invalid for inputs. Disabled is never the only
  explanation; say why or what to do.
- **Semantics:** correct native element or role, accessible name, value and state exposed to
  assistive tech; label tied to its control.
- **Keyboard and focus:** reachable in logical order, operable without a pointer, visible focus,
  focus moves into overlays and returns to the trigger on close; Escape closes dismissible layers.
- **Targets:** web ≥ 24×24 CSS px (44 recommended for touch-first), iOS 44×44 pt, Android
  48×48 dp; enlarge the hit area, not the visual.
- **Text:** scales with user settings, wraps instead of clipping key content, survives RTL.
- **Motion:** uses the product's motion tokens (`references/motion-principles.md`), is
  interruptible, has a reduced-motion path, and never blocks input.
- **Color:** semantic tokens only, contrast floors met in every state, color never the only signal.
- **Content states** for data components: loading (skeleton at final size), empty with a way
  forward, error with recovery, partial, very long content, offline where supported.

## 3. Choosing the right component

| Need | Use | Not |
|---|---|---|
| Interrupt for a decision that blocks progress | Dialog (alert) | Toast, sheet |
| Secondary task or detail without leaving context | Sheet (mobile), side panel or dialog (desktop) | Full navigation |
| Brief confirmation of a completed action | Toast/snackbar (with undo when destructive) | Dialog |
| Persistent problem the user must address | Inline banner/message near the cause | Toast |
| 2–5 mutually exclusive options, all visible | Segmented control / radio group | Select |
| Many options, known list | Select / menu picker | Radio list |
| Many options, user types to find | Combobox / searchable picker | Long select |
| Instant on/off setting | Switch | Checkbox + Save |
| Choice applied on submit, or multi-select | Checkbox | Switch |
| Peer views of the same object | Tabs | Accordion |
| Optional detail in a long page | Accordion / disclosure | Tabs |
| App-level destinations (3–5) | Tab bar / navigation bar (mobile), sidebar or top nav (wide) | Hamburger-only on desktop |
| Commands on an item | Menu (overflow), context menu, swipe actions as a shortcut only | Hidden-only gestures |
| Supplementary label on hover/focus | Tooltip (web/desktop; never essential content) | Tooltip on touch-only UI |
| Multi-step task with order | Stepper / progress steps | One long form |

## 4. Component contracts

| Component | Behavior contract (APG pattern on web) | Must-have states and details | Motion |
|---|---|---|---|
| Button | Native button; Enter/Space activate; one primary per view | Loading keeps width, prevents double submit; icon-only has a label | Press scale ≥ 0.95, 100–160 ms |
| Text field | Visible label, hint, error text linked to the field | Error message says how to fix; correct input type/keyboard; autofill hints | Error appears without layout jump |
| Select | Listbox semantics; arrow keys, type-ahead | Placeholder vs. empty value distinct; long labels wrap | Menu scales from trigger |
| Combobox | APG combobox; arrows move active option, Enter selects, Escape closes | No-results state; async loading; keeps typed text | Results list fades/scales from field |
| Checkbox / radio / switch | Native or APG checkbox/radio/switch; Space toggles; radios use arrow keys | Indeterminate checkbox; switch shows state without color alone | 150–250 ms thumb/check, ease-out |
| Segmented control | Radio-group semantics | Selected state clear in mono palettes (fill or weight, not hue only) | Indicator slides between options |
| Slider | APG slider; arrows/Page/Home/End; value text | Shows value; step and bounds; large thumb hit area | Thumb tracks pointer 1:1 |
| Dialog | APG dialog (modal); focus trapped, returns on close; Escape closes unless destructive-confirm | Title, clear primary/secondary actions, destructive separated | Scale 0.96→1 + fade, 200–280 ms; exit shorter |
| Sheet | Dialog semantics; drag to dismiss with velocity; detents on mobile | Grabber/close button; content scrolls inside; safe areas | Slides from its resting edge, spring, no bounce |
| Popover / menu | APG menu button or disclosure; arrows navigate items; Escape returns focus | Positioned within viewport; destructive items separated | Origin-aware scale from trigger, ~150–200 ms |
| Tooltip | APG tooltip; shows on hover and focus, dismissible, delay ~300–500 ms | Never holds essential info or controls | Fade 100–150 ms |
| Tabs | APG tabs; arrows switch tabs, Tab moves into panel | Selected tab clear; panels keep scroll position | Indicator slides; content cross-fades, no slide on every tab |
| Navigation bar | Landmark nav; current location announced (`aria-current`) | Badges with text alternative; adapts tab bar ↔ rail/sidebar by width | Platform transition between destinations |
| Toast / snackbar | Live region (status); not focus-stealing; pausable | Undo for destructive; stays long enough to read (≥ 4–6 s) | Enters from edge, exits faster; stack calmly |
| Accordion | APG accordion or `<details>`; Enter/Space toggle | Heading level correct; deep links open the right section | Height via layout animation / grid-rows, not JS measuring |
| List | List semantics; rows are one target or clearly separate targets | Empty/loading/error; swipe actions duplicated in a menu | Insert/remove animate position, ≤ 300 ms |
| Table | Real table headers; sortable headers announce sort | Sticky header, alignment (numbers right, tabular figures), responsive strategy | Sort/filter changes don't animate every row |
| Card | One primary action or the whole card as a link, not both competing | Media ratio fixed (no layout shift); truncation rules | Hover lift subtle or none; never on every card by default |
| Search | Search landmark; results announced; clear button | Recent/suggested queries; no-results guidance | Results update without flashing |
| Date picker | Native picker where available; typed entry allowed on desktop | Locale formats; min/max; time zone stated when relevant | Platform default |
| Stepper / progress steps | Ordered list with current step (`aria-current="step"`) | Back keeps data; errors point to the step | Step content slides in direction of travel |
| Progress / loading | Progressbar with value when known; busy region otherwise | Skeletons at final size; spinners only for short waits | Linear easing allowed for progress |

## 5. Platform mapping

| Component | Web | iOS (SwiftUI) | Android (Compose M3) | React Native | Flutter |
|---|---|---|---|---|---|
| Button | `<button>` | `Button` (`.borderedProminent`, `.glass` on 26+) | `Button` / `FilledTonalButton` / `OutlinedButton` | `Pressable` or project/RN Reusables `Button` | `FilledButton` / `OutlinedButton` / `TextButton` |
| Text field | `<input>` + `<label>` | `TextField` / `SecureField` | `TextField` / `OutlinedTextField` | `TextInput` | `TextField` |
| Select | `<select>` or APG listbox | `Picker` (`.menu`) | `ExposedDropdownMenuBox` | RN Reusables `Select` or native picker | `DropdownMenu` |
| Combobox | APG combobox | `.searchable` + list | `ExposedDropdownMenuBox` (editable) / `SearchBar` | Custom per contract | `Autocomplete` / `DropdownMenu(enableFilter)` |
| Checkbox | `<input type=checkbox>` | Selection checkmark in `List` or `Toggle` (no iOS checkbox) | `Checkbox` | RN Reusables `Checkbox` | `Checkbox` / `CheckboxListTile` |
| Switch | `role="switch"` | `Toggle` | `Switch` | `Switch` | `Switch` |
| Radio group | `<input type=radio>` group | `Picker` (`.inline`) or checkmark list | `RadioButton` + `selectableGroup` | RN Reusables `RadioGroup` | `RadioListTile` |
| Segmented | Radio group styled as segments | `Picker` (`.segmented`) | `SingleChoiceSegmentedButtonRow` | RN Reusables `ToggleGroup` | `SegmentedButton` |
| Slider | `<input type=range>` | `Slider` | `Slider` | Community slider | `Slider` |
| Dialog | `<dialog>` (modal) | `.alert` / `.confirmationDialog` | `AlertDialog` | RN Reusables `AlertDialog` / `Modal` | `showDialog` + `AlertDialog` |
| Sheet | `<dialog>` as drawer | `.sheet` + `presentationDetents` | `ModalBottomSheet` | Installed sheet library (e.g. `@gorhom/bottom-sheet`, `@expo/ui`) | `showModalBottomSheet` |
| Popover / menu | Popover API + APG menu button | `.popover` / `Menu` | `DropdownMenu` | RN Reusables `DropdownMenu` / `Popover` | `MenuAnchor` / `PopupMenuButton` |
| Tooltip | APG tooltip | `.help` (pointer platforms only) | `TooltipBox` | Avoid on touch; use visible labels | `Tooltip` |
| Tabs (in page) | APG tabs | `Picker(.segmented)` + content | `PrimaryTabRow` + pager | RN Reusables `Tabs` | `TabBar` + `TabBarView` |
| App navigation | `<nav>` + links | `TabView`, `NavigationStack`, `NavigationSplitView` | `NavigationSuiteScaffold` (bar/rail/drawer) | Expo Router / React Navigation tabs | `NavigationBar` / `NavigationRail` |
| Toast / snackbar | `role="status"` live region | Custom transient overlay (no system toast) | `Snackbar` via `SnackbarHost` | Project toast library or custom per contract | `ScaffoldMessenger` + `SnackBar` |
| Accordion | APG accordion / `<details>` | `DisclosureGroup` | Expandable row + `animateContentSize` | RN Reusables `Accordion` | `ExpansionTile` |
| List | `<ul>` / `role="list"` | `List` | `LazyColumn` + `ListItem` | `FlatList` / FlashList if installed | `ListView.builder` + `ListTile` |
| Table | `<table>` | `Table` (regular width), `List` on compact | Custom rows in `LazyColumn` | `FlatList` rows | `DataTable` / `Table` |
| Card | `<article>` / `<section>` | Custom container / `GroupBox` | `Card` / `ElevatedCard` / `OutlinedCard` | RN Reusables `Card` | `Card` |
| Search | `role="search"` + `type=search` | `.searchable` | `SearchBar` / `DockedSearchBar` | `TextInput` in header | `SearchAnchor` / `SearchBar` |
| Date picker | `<input type=date>` or APG date picker dialog | `DatePicker` | `DatePicker` / `DatePickerDialog` | Community datetime picker | `showDatePicker` |
| Stepper (steps) | `<ol>` + `aria-current="step"` | Custom (SwiftUI `Stepper` is a numeric control) | Custom | Custom | `Stepper` |
| Progress | `<progress>` / `role="progressbar"` | `ProgressView` | `LinearProgressIndicator` / `CircularProgressIndicator` | `ActivityIndicator` | `LinearProgressIndicator` / `CircularProgressIndicator` |

Confirm version-sensitive APIs in `platforms/<platform>.md` §0 before using them.

## 6. Magic UI filter

Magic UI (`magicui/components`) is used only on React + Tailwind projects with shadcn, only for
a recorded motion moment, and only with components that fit the product's direction.

| Use (when it implements the recorded signature) | Avoid unless the user asks |
|---|---|
| `text-animate` for masked line/word reveals of display type | `typing-animation`, `sparkles-text`, gradient/aurora/shiny text effects |
| `blur-fade` for one choreographed entrance group, not every block | Fade/blur on every section (the fade-up-on-everything signature) |
| `bento-grid` for content-led feature layouts | `shiny-button`, `shimmer-button`, `rainbow-button`, `ripple-button` |
| `globe` when geography is part of the product story | `particles`, `retro-grid`, `warp-background`, meteors, confetti |
| `dot-pattern`, `grid-pattern` at low contrast as monochrome material | Glowing/beaming borders and neon cards |
| `light-rays` as single-hue light falloff, once per view | `marquee` logo rails that never stop; number tickers on invented metrics |
| `word-rotate` only for real alternatives the user should read | Stacking two or more high-motion effects in one viewport |

Map every color to the accepted tokens, use the motion tokens, and keep a reduced-motion path.
These lists are judged by effect, not slug: a new component that produces an AI-generated color
or motion signature is avoided the same way.

## 7. Acceptance

For each new or changed component, record: the chosen component (and the rejected
alternative when §3 applied), the source from §1, and evidence that the universal contract and
its §4 row hold (states exercised, keyboard/screen-reader path, target size, reduced motion,
rendered in its real container at the required sizes).
