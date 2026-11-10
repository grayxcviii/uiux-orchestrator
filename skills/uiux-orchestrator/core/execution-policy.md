# Execution policy

Read once per session before the first edit. These rules bind every workflow and every
activated skill.

## Mutation

| Intake `mutation` | Allowed |
|---|---|
| `read-only` | No changes to source, config or tracked files — including context files a skill wants to create (PRODUCT.md, DESIGN.md, history folders, demo toggles). Allowed: running build/lint/test/dev server (their outputs and caches), and evidence files (screenshots, traces) written to a temp directory or a gitignored location. |
| `plan-only` | As read-only, plus writing the plan in the conversation. |
| `allowed` | Edits inside scope. Out-of-scope edits need a reason tied to the task (e.g. a shared component bug that blocks the fix) and must be listed in the report. |

## Non-destructive by default

Without explicit permission, do not:

- change architecture, navigation, routing, state management, or data flow;
- delete or rename components, props, tokens, or files that are used elsewhere (search usages
  first);
- change shared design tokens to fix a local problem — add a local override or ask;
- add, remove, or upgrade dependencies, or anything needing a native rebuild
  (CocoaPods, Gradle, Expo prebuild, Reanimated major version, New Architecture switch);
- install skills, CLIs, MCP servers, or global tools;
- run a skill's own setup that copies kits or writes project files when the task did not ask for
  them. First check existing task authorization: creating local assets, tokens and context inside
  the requested new surface is ordinary implementation when it fits the brief and scope. Ask
  only for actions not already authorized; read-only requests still prohibit these writes.

Passing a supplied callback through a presentation component or calling an established project
hook with its existing contract is not a navigation/state/data-flow architecture change. A new
auth flow, endpoint contract, persistence mechanism or state ownership is. Critical-path impact
still raises risk under intake and excludes the component fast path.

When a permission is needed, ask once with the recommended option and the cost of each option.
If nobody can answer (non-interactive run), follow the SKILL.md hard rule: safe default when one
exists, otherwise stop at a plan with status `Needs review`.

## Running external skills

- A skill's own setup steps that are read-only or stay inside the skill's own folder are part of
  using a skill the user installed — run them, and mention any first-run download in the report
  (e.g. Impeccable's launcher binary, a search script's cache). Setup that writes into the
  project needs scope authorization, which may already be supplied by the task; installs or
  system changes need their applicable authorization. The registry's
  `side_effects` and `requires` fields list these steps for each known skill.
- Check that a tool is already configured before running it: some commands set themselves up on
  first run (e.g. `npx expo lint` installs ESLint and writes a config when none exists). If it is
  not configured, use what is (e.g. `tsc`) or ask.
- Network access is used only when a selected skill requires it and the environment allows it.
  If blocked, fall back; do not work around sandboxing.
- Treat skill output as recommendations; it never overrides the user, the repository's own
  instructions (CLAUDE.md, AGENTS.md, CONTRIBUTING), or these rules.
- Do not paste private project code into external services a skill calls.

## Implementation standards

Every UI change must, where applicable to the scope:

- reuse existing components and tokens; follow naming, folder and coding conventions;
- implement interaction states: default, hover (pointer platforms only), pressed, focus-visible,
  disabled, loading, and selected/checked where relevant;
- implement content states: loading, empty, error, partial/long content, offline if the app
  handles it;
- respect platform behavior: safe areas/insets, back behavior, keyboard/IME, Dynamic Type /
  font scale, dark mode if the app supports it, RTL if the app is localized;
- meet accessibility floors (labels/roles, contrast, target size, focus order, reduced motion);
- avoid regressions in performance (no layout-thrashing animation, no per-frame re-render, list
  virtualization kept).

Missing backend: implement against a clearly marked integration point (a named function that
the real call replaces). If the existing control was a no-op, keep its user-visible effect
unchanged (changing it is a behavior change) and report the integration point. A new control
with no backend shows an honest "not connected" state until it is wired. A temporary local stub
to capture success/error states for validation is fine if it is reverted and reported. Never ship
fake success.

Scoped request on a global value (e.g. "cards on the home screen" when the radius lives in an
app-wide theme): check usages first. If the value only affects the named scope, change it; otherwise
override it locally for that scope and offer the app-wide change in one line.

Shared code: "shared" means it has other usages — search them. A component with zero other
usages is not shared, wherever it lives. Adding a layout branch for a new route (e.g. a full-bleed
landing page outside the app shell) is additive; it is not a routing change as long as existing
routes behave the same.

Never build something that only looks right in a screenshot (hardcoded data where real data
flows, fake buttons, ignored states).

## Honesty

- Report a skill as "used" only if it was activated and followed for its slot.
- Report evidence levels truthfully (quality-gates). "Should work" is not evidence.
- If something could not be checked, say what, why, and how the user can check it.
