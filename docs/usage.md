# Using UIUX Orchestrator

## Install, update, remove

**Claude Code**: one command, in Claude Code (needs Claude Code 2.1.275 or later):

```text
/plugin install uiux-orchestrator --marketplace grayxcviii/uiux-orchestrator
```

On the terminal the same install is
`claude plugin install uiux-orchestrator --marketplace grayxcviii/uiux-orchestrator`.

On older Claude Code versions, use two steps instead:

```text
/plugin marketplace add grayxcviii/uiux-orchestrator
/plugin install uiux-orchestrator@uiux-orchestrator
```

Restart Claude Code (or start a new session) after installing.

Update: `claude plugin marketplace update uiux-orchestrator`, then
`claude plugin update uiux-orchestrator@uiux-orchestrator`.

Remove: `claude plugin uninstall uiux-orchestrator@uiux-orchestrator`.

**Coding agents — npm CLI:** requires Node.js 18+, Git and network access for specialist downloads:

```bash
npx uiux-orchestrator install           # auto-detect web/mobile and install relevant specialists
npx uiux-orchestrator install --project # explicit project scope (-p)
npx uiux-orchestrator install --global  # all 47 supported specialists, for every project (-g)
npx uiux-orchestrator uninstall         # remove installer-managed folders from this project
```

**Selection:** global installs include the entire supported catalogue: 47 unique skill folders
from 14 pinned sources, covering 63 routing entries/commands plus the dogfood companion linked
by agent-device. Project installs include skills
marked web or mobile in the registry. Shared specialists belong to both groups. Mobile skills
that only fit one stack are also tagged with it in `bin/specialists.json` (`stacks`), and a
project install keeps them only when that stack is detected:

| Stack | Detected from | Stack-only specialists |
|---|---|---|
| `expo` | `expo` dependency | `expo-router`, `expo-ui`, `expo-native-ui`, `expo-design-system` |
| `react-native` | `react-native` or `expo` dependency | `react-native-best-practices`, `react-navigation`, `animate-expo`, `expo-animation` |
| `ios-native` | `.xcodeproj`/`.xcworkspace` or iOS `Package.swift` in an app root | `swiftui-pro`, `write-swift` |
| `android-native` | Android Gradle build file in an app root | `adaptive`, `edge-to-edge`, `navigation-event`, `jetpack-compose-performance` |

Untagged mobile skills (Impeccable, UI UX Pro Max, the shared animation skills, `agent-device`,
`dogfood`) are installed for every mobile stack. A React Native CLI app therefore gets no Expo,
SwiftUI or Compose skills; its `ios/` and `android/` folders are not treated as native apps.
If you write native modules and want those skills, use `--platform mobile`, which installs every
mobile specialist without stack filtering. Runtime routing still checks the actual framework and
prerequisites before using a skill. Installing a skill does not install its SDKs.

Project detection checks package dependencies, static HTML, Flutter manifests, Xcode/Android
projects, npm/Yarn workspace packages and pnpm workspace patterns (`*`, `?`, `**` and exclusions).
Unsupported complex glob syntax produces an explicit error with platform-override guidance. Mixed projects receive the
union. It does not classify unrelated test/example directories as applications. If detection
finds neither group (for example, in a new or empty project), installation defaults to the full
web/mobile catalogue in the current project. No platform flag is required. Optional overrides:

```bash
npx uiux-orchestrator install --platform web
npx uiux-orchestrator install --platform mobile
npx uiux-orchestrator install --platform all  # explicit mixed-project override
npx uiux-orchestrator install --dry-run       # JSON plan; no skill changes or Git downloads
npx uiux-orchestrator install --orchestrator-only  # no specialist downloads; no Git needed
```

The installer fetches the recorded Git commits without running third-party install scripts or
hooks, stages all downloads before replacing managed skill folders, and retains original licence
and NOTICE files in `.uiux-licenses/` with source revisions and hashes. Software Mansion and Vercel
have README-only MIT declarations at these revisions; those original READMEs and MIT terms are
preserved explicitly. No specialist implementation is bundled in the npm tarball itself.

Existing user-managed directories/symlinks are kept and reported as unverified. Managed copies
at the pinned revision with intact licences are reused without a download. A failed download,
missing licence or unexpected skill name fails installation; it is not reported as full success.
CLI selection and local Git installation are covered by offline tests; real upstream installs
were also checked in isolated global, web and mobile profiles.

The installer supports Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode and
Windsurf. By default it installs only for the agents it detects: in a project from `.claude/` or
`CLAUDE.md`, `.agents/`, `.codex/` or `AGENTS.md`, `.cursor/` or `.cursorrules`, `.gemini/` or
`GEMINI.md`, `.github/copilot-instructions.md`, `.opencode/` or `opencode.json`, and `.windsurf/`
or `.windsurfrules`; globally from each agent's home folder. If none is detected it installs for
all seven. Repeat `--agent <name>` (or `-a`) to select specific agents. The skill is independent
of the model used inside each compatible agent.

```bash
npx uiux-orchestrator install --agent claude-code
npx uiux-orchestrator install --global --agent cursor --agent gemini-cli
```

| Agent (`--agent`) | Project directory | Global directory |
|---|---|---|
| `claude-code` | `.claude/skills` | `~/.claude/skills` |
| `codex` | `.agents/skills` | `~/.agents/skills` |
| `cursor` | `.agents/skills` | `~/.cursor/skills` |
| `gemini-cli` | `.agents/skills` | `~/.gemini/skills` |
| `github-copilot` | `.agents/skills` | `~/.copilot/skills` |
| `opencode` | `.agents/skills` | `~/.config/opencode/skills` |
| `windsurf` | `.windsurf/skills` | `~/.codeium/windsurf/skills` |

Paths follow the [Skills CLI agent directory reference](https://github.com/vercel-labs/skills/blob/main/docs/agents.md).
Codex honors `CODEX_HOME`, Claude Code honors `CLAUDE_CONFIG_DIR`, and OpenCode honors
`XDG_CONFIG_HOME` when configured. Shared project destinations are written only once.

Project installs are available inside that project. Global installs are available across
projects for the selected agents. Agent support for reading skills is required; a model in a
plain chat interface does not discover local skill directories. Installer tests verify file
placement and updates; full task execution has only been tested in the agents listed below.
Running the same command again updates managed copies to the catalogue revision and verifies their licence files.

**Remove (npm CLI):** `npx uiux-orchestrator uninstall` removes, for every agent folder in this
project, only the folders that carry the installer's `.uiux-orchestrator-npm` marker, then drops
agent folders left empty. Skills you added yourself and symlinks are kept. Add `--global` for the
global folders, `--agent <name>` to limit it, and `--dry-run` to see the list first. Skills that a
newer catalogue no longer filters in are not removed by a re-install; run `uninstall` first for a
clean set. The npm package is available as `uiux-orchestrator`.

**Codex CLI and other Agent Skills agents:** available now with Node.js 22.20 or later. Install globally so
the skill is available in every project:

```bash
npx skills add grayxcviii/uiux-orchestrator --skill uiux-orchestrator -g -a codex
```

Omit `-g` to install in the current project. Replace `codex` with another agent name, or omit
`-a codex` to select an agent interactively. This installs only the orchestrator skill; the
Claude Code plugin also installs frontend-design. Other specialists are optional installs. See [recommended skills](#recommended-skills)
for optional manual installs.

Update with `npx skills update uiux-orchestrator -g` and remove with
`npx skills remove uiux-orchestrator -g -a codex` (omit `-g` for a project install).

For a manual install without Node.js, clone once and link the skill folder into the agent's
skills directory:

```bash
git clone https://github.com/grayxcviii/uiux-orchestrator.git ~/uiux-orchestrator
ln -s ~/uiux-orchestrator/skills/uiux-orchestrator ~/.codex/skills/uiux-orchestrator    # Codex CLI
# ln -s ~/uiux-orchestrator/skills/uiux-orchestrator ~/.claude/skills/uiux-orchestrator  # Claude Code without the plugin
```

To update, run `git -C ~/uiux-orchestrator pull`. Only the folder `skills/uiux-orchestrator/` is
the skill; the rest of the repository is docs and tests.

**Requirements:** Node.js 18+ and Git/network for specialist downloads through the npm CLI (`--orchestrator-only` needs only Node.js), Node.js 22.20+ for `npx skills`; none for the Claude Code plugin or manual install.
Full-design execution-record checks use Python 3 (standard library only). Some specialists need
newer runtimes (for example, Taste builds need Node.js 22+ and Chrome); the bundled runtime probe
checks installed alternatives without changing your default Node version.
- The optional validation scripts need Node 18+ and Chrome, Chromium or Edge.
- `python3` is used only by the repository's own checks.

## Supported agents

| Agent | Status |
|---|---|
| Claude Code (plugin or skills folder) | **Tested**. Plugin install, `/uiux-orchestrator`, and activation without the command (4 of 6 UI prompts in the triggering test, the same review prompt in 3 of 5 runs, with other design skills installed). |
| Codex CLI 0.166 | **Tested**. It triggered on its own and completed a read-only review, a fix and a plan ([results](../tests/results/codex/)). |
| Cursor, Gemini CLI, Copilot and other Agent Skills agents | Untested. The skill follows the open spec and needs no agent-specific tool. Agents without a skill tool can follow it by reading the files. |

## Calling it

| How | When to use it |
|---|---|
| Just describe the task | Everyday requests. The agent decides whether to load the skill, so it may not every time (see below). |
| `/uiux-orchestrator <request>` | **Recommended** whenever you want the orchestrated process: skill routing, validation evidence and the report. |
| `/uiux-orchestrator:uiux-orchestrator <request>` | Same thing: the full name the Claude Code plugin registers. |

**Automatic activation is the agent's choice, not a guarantee.** The agent reads every installed
skill's description and picks one, or none.
- In tests, the same review prompt loaded the orchestrator in 3 of 5 runs. Once the agent did the
  review itself, and once it chose another installed design-critique skill.
- Small, clear bug fixes are often done directly. That is fine, because the skill's own fast path
  would do almost the same work.

If you have several UI skills installed and want this one, use the slash command.

## Phrasing requests

Say *what* you want and any constraint that matters. You don't need to name skills or workflows.

| Request | What happens |
|---|---|
| "Redesign the profile screen. Make it modern but consistent with the app." | Redesign, **Refresh** mode: it audits the current screen, keeps the existing design system, explores concept alternatives within it, implements the chosen improvement, then compares before/after and runs a design review. |
| "Replace the landing page with a completely new look." | Redesign, **Replace** mode: the full design pipeline: research & foundation, concept reasoning, one driver for the new art direction, a finalized design system, implementation, then separate UX/design and technical reviews. It asks once only if the new direction or project-wide changes are not already authorized by your request. |
| "Improve the animation of the onboarding flow." | Animation: it decides what each motion is for and picks the tool. It prefers CSS or the library you already use, and adds no new dependency without asking. |
| "Review this screen and find UX problems. Do not modify the code." | Review, read-only: it returns findings with location, severity, impact and fix. No source file changes. |
| "The plan name is cut off on small phones." | Bug fix: it finds the root cause, makes the smallest fix, and shows before/after at the widths that matter. |
| "Is the checkout accessible?" | Accessibility: a WCAG 2.2 AA audit, plus fixes if edits are allowed. |
| "Set up design tokens for this app." | Design system: if none exists, it runs foundation, concept and art direction before committing tokens and core components, applied to one screen; otherwise it inventories and extends what exists without restyling unrelated screens. |

Useful constraints to add in the same sentence:
- "don't modify code", for review only;
- "plan only", for an Execution Plan without edits;
- "no new libraries";
- "keep the brand colours";
- "iOS only" or "web only";
- "make it Large", to plan it as Large: multi-agent execution with an independent reviewer when subagents are available.

If a fact that end users would read as true is missing, such as prices or legal text, it asks
once. Until you answer, it uses clearly marked placeholders.

## What you get back

For a small fix or a fully specified component inside your existing design system, the agent
can go straight from local inspection to implementation and checks. It does not need a planning
summary, specialist selection or separate process documents. A new visual direction, whole
screen, critical-path interaction, animation or review uses the normal workflow.

**Start summary** for other tasks (shown once):

```text
Task: dashboard review · Vite + React
Approach: inspect UX with Impeccable critique; preserve source files
Checks: code review and rendered-page inspection
```

**Final report:** what changed, what was checked and what remains unverified. Small changes
usually need one short paragraph or up to three bullets. Larger tasks include the key decisions,
affected files, the contribution of any specialist actually used and a status. Ask for a detailed
report or execution plan when you want one. Visual and interaction checks still apply on the
fast path; missing tools are reported as limitations.

The status is one of four:

| Status | Meaning |
|---|---|
| `Passed` | Every gate of the workflow has the evidence it requires. |
| `Passed with limitations` | The work is done, but some evidence could not be collected, for example no simulator. The report says which. |
| `Needs review` | A decision or check needs you, for example a high-risk change or evidence that is impossible here. |
| `Failed` | A required check failed and could not be fixed within scope. |

Evidence levels used in reports:

| Level | Evidence |
|---|---|
| L0 | Code reading |
| L1 | Static checks: types, lint |
| L2 | Build |
| L3 | Functional: interaction runs |
| L4 | Visual: screenshots or frames that the agent looked at |
| L5 | On the target device class |

## Real example

Real output from a test run on this repository's web fixture (`tests/fixtures/web-app`), in Claude
Code with the plugin loaded and Impeccable installed. The excerpt is shortened; nothing was
reworded. The full run is recorded in `tests/results/2026-11-06-phase5-packaging.md`.

**Request:**

```text
/uiux-orchestrator Review the dashboard screen and identify UX problems. Do not modify the code.
```

**What the orchestrator did:**
- Read intake, project intelligence, the decision engine and the review workflow.
- Routed `ux-critique` to the installed `impeccable/critique`, which ran its two assessment
  sub-agents.
- Kept the run read-only: the source hash was identical before and after.

**Report (excerpt):**

```markdown
⚠️ **Code-only review.** I couldn't render the page: starting the dev server and running the design
detector both needed approvals that weren't given. Nothing below was seen on screen. [...]

### 1. [Critical] "remove" can't be reached by keyboard and deletes instantly
- **Where:** `src/pages/Dashboard.tsx:47`
- **Problem:** it's a clickable `div`, so it has no role, no Tab stop and no keyboard support. [...]
  One click removes the project, even the live "Checkout API". There's no confirmation, no undo [...]
- **Fix:** use the shared `Button` (`variant="ghost"`) with a label like "Remove Checkout API". [...]

### 2. [High] Text too faint in light mode, and status shown only by colour
| Element | Colour | Light theme | Required |
|---|---|---|---|
| KPI labels, chart text | `#b5b5bd` | about 2.0:1 | 4.5:1 |
| "Paused" dot | `#d4d4d8` | about 1.5:1 | 3:1 |
[...]

## How this review was done
- **Skill used:** Impeccable's critique command [...] It ran its two required passes as separate
  agents [...]
- **Skipped steps:**
  - The detector scan and browser overlay didn't run because Bash wasn't approved.
  - Saving a critique snapshot was skipped because the review is read-only.

**Status: Passed with limitations.** This rests on reading the code only; nothing was rendered.
- To see it on screen, approve and run `npx vite --port 5191`, then `npm run shoot -- [...]`
```

The status is `Passed with limitations` because the test harness did not allow a dev server.
Where a dev server is allowed, the same review adds screenshots at several widths and both colour
schemes (L4).

A review that runs Impeccable's critique takes longer than one without it, because critique runs
two assessment sub-agents. The orchestrator uses it when the review itself is the deliverable.

## Recommended skills

### Installed automatically

With the npm installer, global scope installs the complete catalogue; project scope installs the
web/mobile subset detected above. The remaining manual commands are alternatives for Skills CLI
or plugin users and for adding a specialist outside the project profile.

#### Claude Code plugin

The plugin installs **Anthropic frontend-design**, whose selected upstream folder includes its
Apache-2.0 licence. Other plugin specialists can be installed through the npm installer or from their authors' distributions.
Previously automatic downloads of Impeccable, Taste, UI UX Pro Max, Emil's motion skills and
Vercel web-design-guidelines have been removed: their selected folders did not include a complete
standalone licence (and, for Impeccable, its upstream NOTICE was also absent).

Existing installations are not removed or modified by this update. If you keep a previously
installed specialist, reinstall it using its author's supported distribution and check that its
licence and notices are retained. Impeccable can install hooks and send anonymous telemetry;
turn telemetry off with `npx impeccable telemetry off` or `DO_NOT_TRACK=1`.

The unlicensed dickwu Apple Design skill is no longer recommended or routed. Use
[Apple's official Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
and the built-in iOS platform guidance instead.

### Install yourself

Each skill below comes from its own author and has its own licence. Install the ones you want, and
the orchestrator calls each one only for the job it is best at.

The commands come from each project's README (checked 2026-11-06):
- `npx skills add …` works for most agents. It needs Node 22.20 or later.
- `/plugin …` lines are for Claude Code.

### Web design

| Skill | Install |
|---|---|
| [Impeccable](https://github.com/pbakaus/impeccable) | `npx impeccable install` (detects your agents). In Claude Code you can instead run `/plugin marketplace add pbakaus/impeccable` and install it from `/plugin` |
| [Taste](https://github.com/Leonxlnx/taste-skill) | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`. Its builds need Node 22+ and Chrome |
| [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | `/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill`, then `/plugin install ui-ux-pro-max@ui-ux-pro-max-skill`. Needs Python 3 |
| [Anthropic frontend-design](https://github.com/anthropics/skills) | `/plugin marketplace add anthropics/skills`, then `/plugin install example-skills@anthropic-agent-skills` |
| [Vercel web-design-guidelines](https://github.com/vercel-labs/agent-skills) | `npx skills add vercel-labs/agent-skills` |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | `npx skills add shadcn-ui/ui@shadcn` |
| [Magic UI](https://github.com/magicuidesign/magicui) | `npx skills add magicuidesign/magicui` |

### Motion

| Skill | Install |
|---|---|
| [Emil Kowalski skills](https://github.com/emilkowalski/skills) | `npx skills@latest add emilkowalski/skills` |
| [GSAP skills](https://github.com/greensock/gsap-skills) | `npx skills add https://github.com/greensock/gsap-skills` |

### Mobile

| Skill | Install |
|---|---|
| [Expo](https://github.com/expo/skills) | `/plugin install expo@claude-plugins-official` (Claude Code), or `npx skills@latest add expo/skills --skill '*'` |
| [Software Mansion](https://github.com/software-mansion-labs/skills) | `npx skills add software-mansion-labs/skills` |
| [Callstack (incl. agent-device)](https://github.com/callstackincubator/agent-skills) | `npx skills@latest add callstackincubator/agent-skills --skill '*'` |
| [Android](https://github.com/android/skills) | `/plugin marketplace add android/skills`, then `/plugin install android-skills@android-skills` |
| [SwiftUI Pro](https://github.com/twostraws/SwiftUI-Agent-Skill) | `npx skills add https://github.com/twostraws/swiftui-agent-skill --skill swiftui-pro` |

When a missing skill would clearly improve a task, the report says so in one line. The orchestrator
never installs anything for you. What each skill is used for is in
[How it works](how-it-works.md#skill-integrations-optional), and licences are in
[THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).

## Troubleshooting

| Symptom | Check |
|---|---|
| It doesn't activate | Run `/plugin` and confirm `uiux-orchestrator` is enabled, then start a new session. Or call `/uiux-orchestrator` explicitly. |
| "No Chrome, Chromium or Edge found" from the validation scripts | Install Chrome, Chromium or Edge, or set `CHROME_PATH`. |
| It reports `Passed with limitations` on mobile | No simulator or emulator, or no device automation tool. Install [agent-device](https://github.com/callstackincubator/agent-skills) (Callstack) for native screenshots and frames. |
| It asks before running a design driver | Check whether the requested build already authorizes its local assets/context. Ask only for genuinely unauthorized changes, dependencies or conflicting house rules; read-only tasks prohibit project writes. |
