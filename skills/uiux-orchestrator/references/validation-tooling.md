# Validation tooling — preview and capture per platform

Load when capturing renders or motion evidence for [quality-gates.md](../core/quality-gates.md).

## Tooling by platform (use what profile `visual_tooling` found)

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
browser is not (ask).

