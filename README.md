<h1 align="center">UIUX Orchestrator</h1>

<h3 align="center">Stop shipping safe, forgettable UI.</h3>

<p align="center">
  One install turns your coding agent into a small design team. It reads your project, sets up
  the right design, motion and review skills, and coordinates them from UX to a reviewed,
  working interface.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/uiux-orchestrator"><img src="https://img.shields.io/npm/v/uiux-orchestrator" alt="npm version"></a>
  <a href="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml"><img src="https://github.com/grayxcviii/uiux-orchestrator/actions/workflows/validate.yml/badge.svg" alt="validate"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/project%20license-MIT-green" alt="Original project work: MIT"></a>
  <img src="https://img.shields.io/badge/web%20%26%20mobile-ready-black" alt="Web and mobile">
</p>

<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-overview.jpg">
  <source srcset="https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-demo.webp" type="image/webp">
  <img src="https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-demo.gif" alt="VELTORA Noir — a luxury perfume campaign with an amber glass bottle, champagne lighting, elegant serif typography and a slow cinematic transition into the fragrance composition." width="100%">
</picture>

<sub>VELTORA Noir — a fictional perfume campaign built from an explicit classic-luxury brief (gold and serif were requested, not defaults). [Still](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-overview.jpg) · [Motion film](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-demo.mp4) · [Mobile](https://raw.githubusercontent.com/grayxcviii/uiux-orchestrator/main/docs/assets/veltora-mobile.jpg) · [Source](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/showcase/README.md)</sub>

```bash
npx uiux-orchestrator install
```

## The problem

Ask a coding agent for a beautiful interface and you usually get:

- **The same generated look.** Purple gradients, glowing blobs, three-card grids and every block
  fading up on scroll. It works, but nobody remembers it.
- **Skills that clash.** Install a few design, motion and review skills and they overlap, contradict
  one another, or never run at all. Each one also tends to remove a little boldness.
- **"Looks great" without looking.** The agent reports success from code it wrote, not from the
  screen a user will actually see.

## What you get

- **One install, the right specialists.** Install one skill; it inspects your project and installs
  the specialists that fit: web, React Native, iOS, Android or Flutter.
- **A design team, not a single prompt.** Research, concept, art direction, components, motion and
  review each go to the best-suited skill, in the right order.
- **Premium, not generic.** Without a color brief: refined black, white and dark palettes with at
  most one rare accent, and no AI-generated colors (indigo accents, purple-to-blue gradients, neon,
  gradient text). Your brand or color request always comes first.
- **Bold by design.** Every new design commits to one memorable decision, such as an oversized type
  crop or a dramatic photographic composition, and later steps keep it.
- **Components that hold up on every platform.** A built-in component contract decides the right
  component and what it must do (states, keyboard, accessibility, motion), then maps it to HTML,
  SwiftUI, Compose, React Native or Flutter.
- **Smooth motion, built in.** Choreographed entrances and fluid, interruptible transitions,
  designed with the visuals, with a reduced-motion version.
- **Checked on screen.** The rendered result is reviewed for brief fit, craft, accessibility and
  responsiveness. Anything unverified is reported, not hidden.

Have a design system, brand or supplied design? It works within them. The monochrome palette and
bold direction are defaults for a blank brief only: existing brand colors, tokens and components
always win, so say so in your request if your project has them.

## How it works

**At install**, one command scans your project (`package.json`, workspaces, `pubspec.yaml`,
Gradle, Swift) and installs the orchestrator plus the specialists for your stack: a React Native
CLI app gets no Expo, SwiftUI or Compose skills. It installs only for the agents the project
already uses (`.claude/`, `AGENTS.md`, `.cursor/`, …). A new or unrecognized project gets the full
catalogue; `npx uiux-orchestrator uninstall` removes everything the installer added.

**On every request**, it reads your brief and your project (stack, tokens, components, motion
library, tooling), picks which installed skill owns each step, and settles their overlaps up
front so no two skills fight over the same decision. The final report lists which skills
actually ran and the evidence behind the result.

New designs and redesigns run the full process. Each stage hands an accepted output to the next:

| # | Stage | What happens |
|---|---|---|
| 1 | Inspect | Platform, stack, tokens, components, tooling, installed skills |
| 2 | Research & UX | Research evidence first, then the UX plan: audience, tasks, hierarchy, flows, states |
| 3 | Concept | 2–3 distinct approaches; one chosen with its rationale |
| 4 | Art direction | Palette, type, composition, media, the decisive move |
| 5 | Design system | Final tokens, components, variants, states, contrast |
| 6 | Components & media | Pick each component against a platform-agnostic contract (states, keyboard, accessibility, motion), then reuse project and platform components, use shadcn/Magic UI on React, and check asset rights |
| 7 | Motion | Motion signature, choreography, transitions, reduced motion |
| 8 | Build | Working code on your stack, every interaction state |
| 9 | Validate | Build, interactions and rendered screenshots at real sizes |
| 10 | Review & refine | Separate design, technical/accessibility and motion reviews; fix and re-check |

Smaller jobs take shorter paths:

| You ask for | Path |
|---|---|
| Polish or improvement | Scaled by size: one specialist for a component, concept + direction + review for a screen, a full audit for larger work |
| Animation | Only the step you need: find opportunities, design and build, review, fix jank or remove excess motion |
| A UI/UX review | Read-only, prioritized findings; no files change |
| A bug fix or one well-specified component | Inspect → implement → validate → report |
| A design system or accessibility pass | Document, extend or create a system; or audit → fix → verify |

[Architecture →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/architecture.md) ·
[How it works in detail →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/how-it-works.md)

## Get started

```bash
npx uiux-orchestrator install           # this project: detects your stack, installs matching specialists
npx uiux-orchestrator install --global  # all your projects: full catalogue
npx uiux-orchestrator uninstall         # remove what the installer added to this project
```

Requires Node.js 18+, plus Git and network access to download specialists.
Works in Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, OpenCode and Windsurf.
[Requirements, agent selection and options →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#install-update-remove)

## Tell it what you want

Open your agent in the project and ask:

```text
Use uiux-orchestrator to redesign this dashboard.
Keep our components and brand colors. Make the main actions easier to find.
```

Or explore before building:

```text
Use uiux-orchestrator to propose three distinct UI/UX concepts for our productivity app.
Explain the user flow, visual direction and motion. Let me choose before implementation.
```

Ordinary UI/UX prompts can activate it automatically. In Claude Code you can also use
`/uiux-orchestrator <request>`. Restart the agent session after installing if the skill is not visible.

## The specialists it coordinates

Each step is handed to a skill that actually runs. Built-in fallbacks are used only when a
suitable skill is unavailable, and are reported as limited.

| Expertise | Independent skill projects |
|---|---|
| Research & foundation | [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) |
| Concept reasoning | [frontend-design](https://github.com/anthropics/skills), in an explicitly bounded planning mode |
| Art direction | [Taste](https://github.com/Leonxlnx/taste-skill), or another compatible visual driver |
| Components | [shadcn/ui](https://github.com/shadcn-ui/ui) and [Magic UI](https://github.com/magicuidesign/magicui) on React; project and platform components everywhere, guided by a built-in component contract |
| Review & polish | [Impeccable](https://github.com/pbakaus/impeccable), [Vercel agent-skills](https://github.com/vercel-labs/agent-skills) |
| Motion | [Emil Kowalski's skills](https://github.com/emilkowalski/skills), [GSAP skills](https://github.com/greensock/gsap-skills) |
| Mobile | [Expo](https://github.com/expo/skills), [Software Mansion](https://github.com/software-mansion-labs/skills), [Callstack](https://github.com/callstackincubator/agent-skills), [Android skills](https://github.com/android/skills), [SwiftUI Pro](https://github.com/twostraws/SwiftUI-Agent-Skill) |

[Catalogue and setup →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md#recommended-skills) ·
[Execution contract →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/skills/uiux-orchestrator/core/orchestration.md) ·
[Evaluation coverage →](https://github.com/grayxcviii/uiux-orchestrator/blob/main/tests/README.md)

## License & credits

UIUX Orchestrator's original code and instructions are [MIT](https://github.com/grayxcviii/uiux-orchestrator/blob/main/LICENSE).
Third-party skills are independent projects that keep their authors' copyrights and licences; no
affiliation or endorsement is implied. The installer preserves their licence/NOTICE files and
asset credits. Assets can carry separate terms: see the [asset usage guidance](https://github.com/grayxcviii/uiux-orchestrator/blob/main/skills/uiux-orchestrator/legal/asset-usage.md)
and [full notices](https://github.com/grayxcviii/uiux-orchestrator/blob/main/THIRD_PARTY_NOTICES.md).

---

[Usage](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/usage.md) · [How it works](https://github.com/grayxcviii/uiux-orchestrator/blob/main/docs/how-it-works.md) · [Contributing](https://github.com/grayxcviii/uiux-orchestrator/blob/main/CONTRIBUTING.md)

**Built something you're happy with? Give UIUX Orchestrator a ⭐.**
